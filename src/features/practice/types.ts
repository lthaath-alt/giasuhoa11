// ─── Luyện tập — Kiểu dữ liệu & luật chơi ────────────────────────────────────
//
// Mọi con số điều chỉnh được của tính năng nằm HẾT trong file này. Sửa luật
// (số câu mỗi lượt, ngưỡng đạt, số lần làm lại) thì chỉ động vào đây, không
// phải lần mò trong component.
//
// CỐ Ý tách khỏi `features/quiz`: quiz cũ ép câu "trả lời ngắn" thành Tự luận
// rồi chấm bằng cách dò từ khóa — sai hoàn toàn với câu điền số. Luyện tập đọc
// thẳng `BankQuestion` để chấm bằng `num`/`tol`/`st`.

import { QType } from '../bank/types';

/** Ba phần của một bài luyện tập, đúng thứ tự học sinh phải đi qua */
export type PhanLuyenTap = Extract<QType, 'mc' | 'tf' | 'tn'>;

export const THU_TU_PHAN: PhanLuyenTap[] = ['mc', 'tf', 'tn'];

export const TEN_PHAN: Record<PhanLuyenTap, string> = {
  mc: 'Trắc nghiệm nhiều lựa chọn',
  tf: 'Trắc nghiệm đúng sai',
  tn: 'Trắc nghiệm trả lời ngắn',
};

export const TEN_PHAN_NGAN: Record<PhanLuyenTap, string> = {
  mc: 'Nhiều lựa chọn',
  tf: 'Đúng sai',
  tn: 'Trả lời ngắn',
};

/**
 * Số câu rút ra cho MỖI LƯỢT làm, theo cấu trúc đề thi tốt nghiệp 2025:
 * phần đúng/sai ít câu nhưng mỗi câu 4 ý, nên 2 câu đã là 8 ý phải phán đoán.
 */
export const SO_CAU_MOI_LUOT: Record<PhanLuyenTap, number> = {
  mc: 5,
  tf: 2,
  tn: 3,
};

/** Tỉ lệ điểm tối thiểu để qua một phần */
export const NGUONG_DAT = 0.7;

/** Số lần được làm lại sau lượt đầu. 3 lần làm lại = 4 lượt tất cả. */
export const SO_LAN_LAM_LAI = 3;

/** Tổng số lượt một chu kỳ cho phép */
export const SO_LUOT_MOI_CHU_KY = SO_LAN_LAM_LAI + 1;

/** Hết lượt mà chưa đạt thì khóa phần đó bao nhiêu phút */
export const PHUT_KHOA = 10;

/**
 * Kho phải có tối thiểu bao nhiêu câu thì bài mới mở.
 *
 * CỐ Ý bằng đúng số câu MỘT lượt, không phải số câu đủ cho cả 4 lượt.
 * Hai chuyện khác nhau: "đủ để làm" và "đủ để mỗi lượt ra câu mới". Bài có 5
 * câu là học sinh làm được thật — chặn lại chẳng lợi cho ai. Kho mỏng thì
 * `soLuotKhacNhau()` sẽ báo trung thực là làm lại sẽ gặp lại câu cũ.
 */
export const NGUONG_MO_BAI: Record<PhanLuyenTap, number> = { ...SO_CAU_MOI_LUOT };

/** Điểm câu đúng/sai theo thang Bộ GD&ĐT: chỉ số = số ý trả lời đúng */
export const DIEM_DUNG_SAI = [0, 0.1, 0.25, 0.5, 1.0];

// ─── Tiến độ ─────────────────────────────────────────────────────────────────

/** Tiến độ của học sinh ở MỘT phần của MỘT bài */
export interface TienDoPhan {
  /** Đã từng đạt ≥70% chưa. Đạt rồi thì giữ mãi, làm lại không mất. */
  dat: boolean;
  /** Tỉ lệ điểm cao nhất từng đạt, 0–1 */
  tiLeCaoNhat: number;
  /** Số lượt đã làm trong chu kỳ hiện tại (reset sau khi ôn lại) */
  soLuotDaLam: number;
  /** Id câu đã từng gặp — để lượt sau ưu tiên câu mới */
  daGap: string[];
  /** Id câu từng làm sai — khi buộc phải lặp thì lặp câu này trước */
  daSai: string[];
  /** Bị khóa đến thời điểm này (ms). Null/không có = không khóa. */
  khoaDenLuc?: number | null;
  /** Đang chờ học sinh ôn lại bài mới được cấp lượt mới */
  canOnLai?: boolean;
}

/** Map: lessonId → từng phần */
export type TienDoLuyenTap = Record<string, Partial<Record<PhanLuyenTap, TienDoPhan>>>;

export function tienDoRong(): TienDoPhan {
  return { dat: false, tiLeCaoNhat: 0, soLuotDaLam: 0, daGap: [], daSai: [] };
}

// ─── Trạng thái hiển thị ─────────────────────────────────────────────────────

export type TrangThaiPhan =
  | 'thieu-cau'    // kho chưa đủ câu, chưa mở được
  | 'chua-mo'      // phải qua phần trước đã
  | 'san-sang'     // làm được ngay
  | 'dang-khoa'    // hết lượt, đang đếm ngược
  | 'can-on-lai'   // hết khóa rồi nhưng phải ôn lại mới được làm tiếp
  | 'da-dat';      // đã qua

/** Kết quả chấm một câu */
export interface KetQuaCau {
  cauId: string;
  diem: number;
  toiDa: number;
  dung: boolean;
  /** Với câu đúng/sai: số ý trả lời đúng trên 4 */
  soYDung?: number;
}

/** Kết quả chấm cả một lượt */
export interface KetQuaLuot {
  diem: number;
  toiDa: number;
  tiLe: number;
  dat: boolean;
  chiTiet: KetQuaCau[];
}
