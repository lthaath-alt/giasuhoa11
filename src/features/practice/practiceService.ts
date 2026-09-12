// ─── Luyện tập — Phần chạm Firestore ─────────────────────────────────────────
//
// File này CHỈ lo việc lấy câu hỏi về. Toàn bộ luật chơi (chấm điểm, chọn câu,
// lượt làm lại, trạng thái mở/khóa) nằm ở `logic.ts` — tách ra để bộ kiểm tra
// `npm run kiem-tra:luyen-tap` nạp được ngoài trình duyệt; chỉ cần một dòng
// import Firestore là script sập vì Node không có `import.meta.env`.
//
// Vẫn `export * from './logic'` để chỗ gọi chỉ phải nhớ một cửa duy nhất.

import { BankQuestion } from '../bank/types';
import { BankFirestore } from '../bank/bankStore';
import { PhanLuyenTap, THU_TU_PHAN, TienDoPhan } from './types';
import { BangDemCau, chonCauTuKho } from './logic';

export * from './logic';

// ─── Kho câu hỏi ─────────────────────────────────────────────────────────────

/**
 * Tải cả ngân hàng MỘT lần cho mỗi phiên rồi lọc tại máy.
 *
 * Giữ nguyên Promise chứ không giữ mảng kết quả: hai chỗ cùng gọi lúc mới vào
 * trang sẽ dùng chung một lượt tải thay vì bắn hai request.
 */
let khoDangTai: Promise<BankQuestion[]> | null = null;

export function xoaCacheKho(): void {
  khoDangTai = null;
}

function taiKho(): Promise<BankQuestion[]> {
  if (!khoDangTai) {
    khoDangTai = BankFirestore.getAll().catch(err => {
      // Tải hỏng thì bỏ cache đi, lần sau còn thử lại được.
      khoDangTai = null;
      throw err;
    });
  }
  return khoDangTai;
}

/** Đếm số câu mỗi bài có, tách theo từng phần */
export async function demCauTheoBai(): Promise<BangDemCau> {
  const kho = await taiKho();
  const bang: BangDemCau = {};
  for (const cau of kho) {
    if (!cau.lessonId) continue;   // câu chưa gắn bài thì không vào đề được
    const phan = cau.t as PhanLuyenTap;
    if (!THU_TU_PHAN.includes(phan)) continue;   // bỏ câu tự luận
    if (!bang[cau.lessonId]) bang[cau.lessonId] = { mc: 0, tf: 0, tn: 0 };
    bang[cau.lessonId][phan]++;
  }
  return bang;
}

/** Rút câu cho một lượt làm. Luật chọn xem `chonCauTuKho` trong logic.ts. */
export async function layCauChoLuot(
  lessonId: string,
  phan: PhanLuyenTap,
  tienDo: TienDoPhan,
): Promise<BankQuestion[]> {
  const kho = (await taiKho()).filter(
    c => c.lessonId === lessonId && (c.t as PhanLuyenTap) === phan,
  );
  return chonCauTuKho(kho, phan, tienDo);
}

/** Lấy lại câu hỏi theo id — dùng để dựng phần "những câu em còn sai" */
export async function layCauTheoId(ids: string[]): Promise<BankQuestion[]> {
  if (!ids.length) return [];
  const can = new Set(ids);
  return (await taiKho()).filter(c => can.has(c.id));
}
