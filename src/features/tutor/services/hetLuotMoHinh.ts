// ─── Đọc loại lỗi, và nhớ model nào đã hết lượt trong ngày ───────────────────
//
// Không nhớ thì lượt nào cũng gõ cửa model đã chết trước, mất thêm chừng một
// giây mỗi model — học sinh thấy gia sư chậm dần trong ngày mà không hiểu vì sao.
//
// Hạn mức ngày của Gemini hồi lại lúc nửa đêm giờ Thái Bình Dương, tức 14:00
// giờ VN mùa hè, 15:00 mùa đông. Lưu NGÀY theo múi giờ đó và so ngày, không
// cộng trừ giờ — khỏi lo đổi giờ mùa hè.
//
// Tệp thuần, không import gì: kho nhận `Storage` từ ngoài để script Node kiểm được.

export type LoaiLoiGemini =
  | 'het-ngay' | 'het-phut' | 'mo-hinh-hong' | 'app-check'
  | 'qua-han' | 'mang' | 'may-chu' | 'khac';

/**
 * Đọc loại lỗi từ chuỗi `loiThanhChuoi(loi)`. Thứ tự các phép thử là cố ý:
 * hết lượt xét trước (chuỗi lỗi 429 có thể chứa chữ khác), App Check xét
 * trước mạng (lỗi App Check có khi mang chữ "fetch").
 */
export function phanLoaiLoiGemini(chuoiLoi: string): LoaiLoiGemini {
  const goc = chuoiLoi || '';
  const s = goc.toLowerCase();
  if (s.includes('429') || s.includes('quota') || s.includes('rate limit')
      || s.includes('resource_exhausted')) {
    return s.includes('perday') ? 'het-ngay' : 'het-phut';
  }
  /* App Check hỏng thì đổi model cũng hỏng y vậy: mọi model đi chung một thẻ. */
  if (s.includes('app check') || s.includes('appcheck') || s.includes('initial-throttle')
      || s.includes('attempts allowed again')) return 'app-check';
  if (s.includes('abort') || s.includes('timeout') || s.includes('timed out')) return 'qua-han';
  if (s.includes('network') || s.includes('failed to fetch')) return 'mang';
  /* Model bị gỡ — chỉ chết với RIÊNG model này. CHỈ 404: một lỗi 400 (tham
     số sai, nội dung bị chặn, …) là do chính YÊU CẦU, sẽ lặp lại giống vậy
     ở MỌI model — xếp vào đây thì đánh dấu chết oan cả model lành, trong khi
     đường chạy không thử model nào khác được cứu. Để 400 rơi về 'khac' (dừng
     hẳn, không đánh dấu ai) — quyết định của người kiểm, lệch khỏi kế hoạch gốc. */
  if (/\[404\s/.test(goc) || s.includes('is not found')) return 'mo-hinh-hong';
  if (/\[5\d\d\s/.test(goc) || /"?status"?:\s*5\d\d/.test(goc) || s.includes('internal server error')
      || s.includes('service unavailable') || s.includes('overloaded')
      || s.includes('high demand')) return 'may-chu';
  return 'khac';
}

export const MUI_GIO_HAN_MUC = 'America/Los_Angeles';

/** Ngày 'YYYY-MM-DD' theo múi giờ cho trước (mặc định giờ Thái Bình Dương). */
export function ngayTheoMuiGio(luc: Date, muiGio: string = MUI_GIO_HAN_MUC): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: muiGio, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(luc);
}

export const KHOA_KHO_HET = 'h11_mo_hinh_het';

/** 'firebase' = hạn mức chung của web; 'khoa' = hạn mức khoá riêng của em. */
export type VungHet = 'firebase' | 'khoa';

export interface KhoHet {
  conDung(vung: VungHet, moHinh: string, luc: Date): boolean;
  danhDau(vung: VungHet, moHinh: string, luc: Date): void;
}

/**
 * Kho nhớ trong `localStorage`. Chỉ chứa tên model và ngày — không có gì
 * của học sinh. Bộ nhớ hỏng hay bị chặn (chế độ ẩn danh, đầy) thì coi như
 * mọi model còn dùng: lần sau gõ lại cửa, chậm hơn chút chứ không hỏng.
 */
export function taoKhoHet(luuTru: Pick<Storage, 'getItem' | 'setItem'> | null): KhoHet {
  const doc = (): Record<string, string> => {
    try {
      const v: unknown = JSON.parse(luuTru?.getItem(KHOA_KHO_HET) ?? '{}');
      return v && typeof v === 'object' ? v as Record<string, string> : {};
    } catch {
      return {};
    }
  };
  return {
    conDung(vung, moHinh, luc) {
      return doc()[`${vung}:${moHinh}`] !== ngayTheoMuiGio(luc);
    },
    danhDau(vung, moHinh, luc) {
      const homNay = ngayTheoMuiGio(luc);
      /* Chỉ giữ dấu của hôm nay: dấu cũ vô hại nhưng cứ thế phình ra mãi. */
      const giu = Object.fromEntries(Object.entries(doc()).filter(([, ngay]) => ngay === homNay));
      giu[`${vung}:${moHinh}`] = homNay;
      try { luuTru?.setItem(KHOA_KHO_HET, JSON.stringify(giu)); } catch { /* xem chú thích hàm */ }
    },
  };
}
