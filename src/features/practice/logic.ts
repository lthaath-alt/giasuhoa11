// ─── Luyện tập — Phần logic thuần, KHÔNG chạm mạng ──────────────────────────
//
// Tách khỏi `practiceService` để chạy được ngoài trình duyệt: script kiểm tra
// `npm run kiem-tra:luyen-tap` nạp thẳng file này. Nếu để chung, chỉ cần một
// dòng import Firestore là bộ kiểm tra sập vì Node không có `import.meta.env`.
//
// Đọc thẳng `BankQuestion` chứ KHÔNG đi qua `toLegacy()`: hàm đó nén 4 ý của
// câu đúng/sai thành một mệnh đề "đúng khi mọi ý đều đúng" và biến câu trả lời
// ngắn thành Tự luận — mất đúng thứ cần để chấm theo thang Bộ.

import { BankQuestion } from '../bank/types';
import { xaoPhuongAnBank } from '../bank/xaoDapAn';
import {
  PhanLuyenTap, THU_TU_PHAN, SO_CAU_MOI_LUOT, NGUONG_DAT, NGUONG_MO_BAI,
  SO_LUOT_MOI_CHU_KY, PHUT_KHOA, DIEM_DUNG_SAI,
  TienDoPhan, TienDoLuyenTap, TrangThaiPhan, KetQuaCau, KetQuaLuot, tienDoRong,
} from './types';

export type BangDemCau = Record<string, Record<PhanLuyenTap, number>>;

export function demCuaBai(bang: BangDemCau, lessonId: string): Record<PhanLuyenTap, number> {
  return bang[lessonId] || { mc: 0, tf: 0, tn: 0 };
}

/**
 * Kho của phần này đủ cho bao nhiêu lượt KHÁC NHAU hoàn toàn.
 *
 * Dùng để nói thật với học sinh: "kho đủ 2 lượt khác nhau" nghĩa là từ lượt
 * thứ 3 sẽ gặp lại câu cũ. Thà nói trước còn hơn để em tưởng mình bị ra trùng
 * đề vì lỗi.
 */
export function soLuotKhacNhau(soCau: number, phan: PhanLuyenTap): number {
  return Math.floor(soCau / SO_CAU_MOI_LUOT[phan]);
}

function xaoTron<T>(mang: T[]): T[] {
  const ra = [...mang];
  for (let i = ra.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ra[i], ra[j]] = [ra[j], ra[i]];
  }
  return ra;
}

/**
 * Phần thuần túy của việc rút câu, tách ra khỏi lượt gọi mạng để kiểm thử được
 * bằng dữ liệu dựng sẵn. `layCauChoLuot` chỉ còn lo việc lấy kho.
 */
export function chonCauTuKho(
  kho: BankQuestion[],
  phan: PhanLuyenTap,
  tienDo: TienDoPhan,
): BankQuestion[] {
  const can = SO_CAU_MOI_LUOT[phan];
  if (kho.length < can) return [];

  const daGap = new Set(tienDo.daGap || []);
  const daSai = new Set(tienDo.daSai || []);

  const chuaGap = kho.filter(c => !daGap.has(c.id));
  const gapRoiVaSai = kho.filter(c => daGap.has(c.id) && daSai.has(c.id));
  const gapRoiVaDung = kho.filter(c => daGap.has(c.id) && !daSai.has(c.id));

  const chon: BankQuestion[] = [];
  for (const bac of [chuaGap, gapRoiVaSai, gapRoiVaDung]) {
    if (chon.length >= can) break;
    chon.push(...xaoTron(bac).slice(0, can - chon.length));
  }

  /* Xáo lần cuối để câu mới không dồn hết lên đầu đề, rồi xáo vị trí phương án
     trong từng câu: trong kho, đáp án đúng dồn vào B ở 48% số câu trắc nghiệm
     (xem xaoDapAn.ts). */
  return xaoTron(chon).map(xaoPhuongAnBank);
}

// ─── Chấm điểm ───────────────────────────────────────────────────────────────

/**
 * Đưa chuỗi học sinh gõ về số.
 *
 * Học sinh Việt gõ dấu phẩy thập phân ("2,479"), còn parseFloat chỉ hiểu dấu
 * chấm — không đổi thì mọi câu trả lời ngắn đều sai.
 */
export function doiRaSo(raw: unknown): number {
  const s = String(raw ?? '').trim().replace(/\s+/g, '').replace(/,/g, '.');
  if (!s) return NaN;
  return parseFloat(s);
}

/** Đáp án học sinh gõ cho câu trả lời ngắn có khớp không */
export function khopTraLoiNgan(cau: BankQuestion, traLoi: string): boolean {
  const so = doiRaSo(traLoi);
  const dapAn = typeof cau.num === 'number' ? cau.num : doiRaSo(cau.ansText);

  if (!Number.isNaN(so) && !Number.isNaN(dapAn)) {
    /* Có sai số cho phép thì dùng. Không có thì so ở mức 1e-9 — đủ để bỏ qua
       sai lệch dấu phẩy động của máy, chứ không nới tay cho đáp án sai. */
    const saiSo = typeof cau.tol === 'number' && cau.tol > 0 ? cau.tol : 1e-9;
    return Math.abs(so - dapAn) <= saiSo + 1e-9;
  }

  // Đáp án không phải số (hiếm): so chuỗi sau khi bỏ khoảng trắng và hạ chữ.
  const chuanHoa = (x: string) => x.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
  return !!cau.ansText && chuanHoa(traLoi) === chuanHoa(cau.ansText);
}

/**
 * Câu trả lời của học sinh cho một câu hỏi:
 * - mc: chỉ số phương án đã chọn, hoặc null nếu bỏ trống
 * - tf: mảng 4 phần tử true/false/null theo từng ý
 * - tn: chuỗi học sinh gõ
 */
export type TraLoi = number | null | (boolean | null)[] | string;

export function chamCau(cau: BankQuestion, traLoi: TraLoi): KetQuaCau {
  const phan = cau.t as PhanLuyenTap;

  if (phan === 'mc') {
    const dung = typeof traLoi === 'number' && traLoi === cau.a;
    return { cauId: cau.id, diem: dung ? 1 : 0, toiDa: 1, dung };
  }

  if (phan === 'tf') {
    const y = cau.st || [];
    const dap = Array.isArray(traLoi) ? traLoi : [];
    /* Ý bỏ trống tính là SAI, không phải "chưa chấm". Nếu bỏ qua ý trống thì
       em nào chỉ trả lời ý chắc chắn nhất sẽ được điểm cao hơn em trả lời hết
       — ngược hẳn với thang của Bộ. */
    const soYDung = y.reduce((n, ynay, i) => n + (dap[i] === ynay.v ? 1 : 0), 0);
    const diem = DIEM_DUNG_SAI[Math.min(soYDung, DIEM_DUNG_SAI.length - 1)] ?? 0;
    return { cauId: cau.id, diem, toiDa: 1, dung: soYDung === y.length, soYDung };
  }

  const dung = typeof traLoi === 'string' && khopTraLoiNgan(cau, traLoi);
  return { cauId: cau.id, diem: dung ? 1 : 0, toiDa: 1, dung };
}

export function chamLuot(
  cauHoi: BankQuestion[],
  traLoi: Record<string, TraLoi>,
): KetQuaLuot {
  const chiTiet = cauHoi.map(c => chamCau(c, traLoi[c.id] ?? null));
  const diem = chiTiet.reduce((s, r) => s + r.diem, 0);
  const toiDa = chiTiet.reduce((s, r) => s + r.toiDa, 0);
  const tiLe = toiDa > 0 ? diem / toiDa : 0;
  /* Làm tròn tới 1e-9 trước khi so: 0,1+0,25+0,5+... trong dấu phẩy động có
     thể ra 0,6999999998 — học sinh đủ điểm mà máy báo trượt. */
  return { diem, toiDa, tiLe, dat: tiLe + 1e-9 >= NGUONG_DAT, chiTiet };
}

// ─── Cập nhật tiến độ sau một lượt ───────────────────────────────────────────

/**
 * Trả về tiến độ MỚI sau khi nộp một lượt. Không sửa tại chỗ để chỗ gọi còn so
 * được cũ với mới.
 *
 * Hết lượt mà chưa đạt thì khóa `PHUT_KHOA` phút VÀ bật cờ `canOnLai`: hết giờ
 * vẫn phải đi qua màn ôn lại mới được cấp lượt mới. Chỉ khóa thời gian thì em
 * ngồi chờ 10 phút rồi đoán tiếp, chẳng học thêm được gì.
 */
export function capNhatSauLuot(
  truoc: TienDoPhan,
  cauHoi: BankQuestion[],
  ketQua: KetQuaLuot,
): TienDoPhan {
  const daGap = new Set(truoc.daGap || []);
  cauHoi.forEach(c => daGap.add(c.id));

  /* daSai phải trừ đi câu vừa làm ĐÚNG, không chỉ cộng câu sai. Nếu chỉ cộng,
     câu em từng sai rồi sửa được vẫn bị coi là điểm yếu và cứ quay lại mãi. */
  const daSai = new Set(truoc.daSai || []);
  ketQua.chiTiet.forEach(r => (r.dung ? daSai.delete(r.cauId) : daSai.add(r.cauId)));

  const sau: TienDoPhan = {
    dat: truoc.dat || ketQua.dat,
    tiLeCaoNhat: Math.max(truoc.tiLeCaoNhat || 0, ketQua.tiLe),
    soLuotDaLam: (truoc.soLuotDaLam || 0) + 1,
    daGap: Array.from(daGap),
    daSai: Array.from(daSai),
    khoaDenLuc: null,
    canOnLai: false,
  };

  if (!sau.dat && sau.soLuotDaLam >= SO_LUOT_MOI_CHU_KY) {
    sau.khoaDenLuc = Date.now() + PHUT_KHOA * 60 * 1000;
    sau.canOnLai = true;
  }

  return sau;
}

/** Học sinh đã ôn lại xong: mở khóa và cấp lại một chu kỳ lượt mới */
export function capLaiLuot(truoc: TienDoPhan): TienDoPhan {
  return { ...truoc, soLuotDaLam: 0, khoaDenLuc: null, canOnLai: false };
}

// ─── Trạng thái hiển thị ─────────────────────────────────────────────────────

export function conKhoa(tienDo: TienDoPhan | undefined): boolean {
  return !!tienDo?.khoaDenLuc && tienDo.khoaDenLuc > Date.now();
}

export function soLuotConLai(tienDo: TienDoPhan | undefined): number {
  return Math.max(0, SO_LUOT_MOI_CHU_KY - (tienDo?.soLuotDaLam || 0));
}

/**
 * Trạng thái một phần, xét theo đúng thứ tự ưu tiên.
 *
 * `da-dat` đứng trước `thieu-cau`: em đã qua phần này từ hồi kho còn đủ câu
 * thì dù sau đó thầy cô xóa bớt câu, thành tích của em vẫn giữ.
 */
export function trangThaiPhan(
  phan: PhanLuyenTap,
  tienDoBai: Partial<Record<PhanLuyenTap, TienDoPhan>> | undefined,
  soCau: Record<PhanLuyenTap, number>,
): TrangThaiPhan {
  const tienDo = tienDoBai?.[phan];
  if (tienDo?.dat) return 'da-dat';
  if (soCau[phan] < NGUONG_MO_BAI[phan]) return 'thieu-cau';

  // Phải qua hết các phần đứng trước
  const viTri = THU_TU_PHAN.indexOf(phan);
  for (let i = 0; i < viTri; i++) {
    if (!tienDoBai?.[THU_TU_PHAN[i]]?.dat) return 'chua-mo';
  }

  if (conKhoa(tienDo)) return 'dang-khoa';
  if (tienDo?.canOnLai) return 'can-on-lai';
  return 'san-sang';
}

/** Bài đã hoàn thành khi cả ba phần đều đạt */
export function baiDaXong(tienDoBai: Partial<Record<PhanLuyenTap, TienDoPhan>> | undefined): boolean {
  return THU_TU_PHAN.every(p => !!tienDoBai?.[p]?.dat);
}

/** Bài có đủ câu cho cả ba phần không */
export function baiDuCau(soCau: Record<PhanLuyenTap, number>): boolean {
  return THU_TU_PHAN.every(p => soCau[p] >= NGUONG_MO_BAI[p]);
}

/** Mô tả ngắn chỗ còn thiếu, để hiện trên thẻ bài bị khóa */
export function moTaThieuCau(soCau: Record<PhanLuyenTap, number>): string {
  const thieu = THU_TU_PHAN
    .filter(p => soCau[p] < NGUONG_MO_BAI[p])
    .map(p => `${NGUONG_MO_BAI[p] - soCau[p]} câu ${
      p === 'mc' ? 'nhiều lựa chọn' : p === 'tf' ? 'đúng sai' : 'trả lời ngắn'}`);
  return thieu.length ? `Còn thiếu ${thieu.join(', ')}` : '';
}

/** Lấy tiến độ của một phần, luôn trả về object dùng được */
export function tienDoCuaPhan(
  tienDo: TienDoLuyenTap | undefined,
  lessonId: string,
  phan: PhanLuyenTap,
): TienDoPhan {
  return tienDo?.[lessonId]?.[phan] || tienDoRong();
}
