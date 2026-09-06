// ─── Chuyển dữ liệu cũ sang ngân hàng hợp nhất ───────────────────────────────
//
// Nguồn 1: Firestore `questions`      — Ngân hàng dữ liệu (Admin / Giáo viên)
// Nguồn 2: localStorage `h11_library` — Thư viện câu hỏi theo từng bài học
//
// Đích:    Firestore `bank_questions`
//
// Nguyên tắc:
//  - KHÔNG xoá, KHÔNG sửa dữ liệu nguồn. Chạy sai vẫn còn đường lùi.
//  - Chạy lại nhiều lần cho cùng kết quả: id giữ nguyên nên chỉ ghi đè chính nó.
//  - Câu đã có trong ngân hàng mới thì bỏ qua, tránh đè mất chỉnh sửa về sau.
//
// CỐ Ý không ghi cờ "đã chuyển xong" nữa. Trước đây có cờ đó và giao diện ẩn nút
// khi thấy cờ, nhưng cờ được đặt cả khi chuyển được 0 câu — nút biến mất vĩnh
// viễn và không còn đường chạy lại, kể cả sau khi thêm nguồn dữ liệu mới.

import { Question } from '../library/types';
import { LibraryStorage } from '../library/libraryStorage';
import { FirestoreService } from '../../core/services/firestoreService';
import { BankQuestion } from './types';
import { fromLegacy } from './convert';
import { BankFirestore } from './bankStore';

/** 160 câu mẫu vốn nằm trong hằng số BANK của trò chơi, nay dọn về ngân hàng web */
const SEED_URL = '/bank/ngan-hang.json';

export interface MigrateReport {
  /** Đã chuyển từ Firestore `questions` */
  tuNganHangDuLieu: number;
  /** Đã chuyển từ localStorage `h11_library` */
  tuThuVien: number;
  /** Đã nạp từ 160 câu mẫu của trò chơi */
  tuCauMauGame: number;
  /** Bỏ qua vì ngân hàng mới đã có id đó */
  boQuaVìDaCo: number;
  /** Số câu ghi thành công lên Firestore */
  daGhi: number;
  /** Có gặp lỗi ghi không */
  thieuSot: boolean;
}

/**
 * Gom câu hỏi từ hai nguồn cũ, chuyển sang mô hình mới rồi ghi lên Firestore.
 *
 * Trả về báo cáo để hiển thị cho người dùng thay vì âm thầm.
 */
export async function chuyenDoiNganHang(): Promise<MigrateReport> {
  const rp: MigrateReport = {
    tuNganHangDuLieu: 0,
    tuThuVien: 0,
    tuCauMauGame: 0,
    boQuaVìDaCo: 0,
    daGhi: 0,
    thieuSot: false,
  };

  // Đọc được ngân hàng hiện có là điều kiện bắt buộc: không biết đã có gì thì
  // chuyển đổi sẽ tạo ra bản trùng lặp.
  let hienCo: BankQuestion[];
  try {
    hienCo = await BankFirestore.getAll();
  } catch {
    throw new Error('Không đọc được ngân hàng hiện có từ máy chủ. Kiểm tra kết nối rồi thử lại.');
  }
  const daCo = new Set(hienCo.map(q => q.id));
  const canGhi: BankQuestion[] = [];

  // ── Nguồn 1: Ngân hàng dữ liệu trên Firestore ──
  let cu: Question[] = [];
  try {
    cu = await FirestoreService.getQuestions();
  } catch {
    rp.thieuSot = true;
  }
  for (const q of cu) {
    if (daCo.has(q.id)) {
      rp.boQuaVìDaCo++;
      continue;
    }
    canGhi.push(fromLegacy(q));
    daCo.add(q.id);
    rp.tuNganHangDuLieu++;
  }

  // ── Nguồn 2: Thư viện câu hỏi trong localStorage ──
  // Khoá có dạng `${chapterId}__${lessonId}` nên tách ra để giữ liên kết bài học.
  try {
    const store = LibraryStorage.getStore();
    for (const key of Object.keys(store)) {
      const [chapterId, lessonId] = key.split('__');
      for (const q of store[key] || []) {
        if (daCo.has(q.id)) {
          rp.boQuaVìDaCo++;
          continue;
        }
        canGhi.push(fromLegacy(q, { chapterId, lessonId }));
        daCo.add(q.id);
        rp.tuThuVien++;
      }
    }
  } catch {
    rp.thieuSot = true;
  }

  // ── Nguồn 3: 160 câu mẫu vốn dựng sẵn trong trò chơi ──
  // Trò chơi nay không giữ ngân hàng riêng nữa, nên số câu này phải nằm ở web.
  // Giữ nguyên id dạng "b:<chương>:<mức>:<idx>" để các bản ghi `overrides`
  // và `deleted` cũ bên game vẫn trỏ đúng câu.
  try {
    const res = await fetch(SEED_URL, { cache: 'no-store' });
    if (res.ok) {
      const seed = (await res.json()) as BankQuestion[];
      for (const q of seed) {
        if (daCo.has(q.id)) { rp.boQuaVìDaCo++; continue; }
        canGhi.push(q);
        daCo.add(q.id);
        rp.tuCauMauGame++;
      }
    } else {
      rp.thieuSot = true;
    }
  } catch {
    rp.thieuSot = true;
  }

  if (canGhi.length) {
    rp.daGhi = await BankFirestore.saveMany(canGhi);
    if (rp.daGhi < canGhi.length) rp.thieuSot = true;
  }

  return rp;
}
