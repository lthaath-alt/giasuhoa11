// ─── Chặn rò đáp số (P0-2) ───────────────────────────────────────────────────
//
// Gia sư Socrates KHÔNG được đưa đáp số của bài em đang làm. Câu lệnh hệ thống
// đã dặn kỹ, nhưng DẶN không phải là CHẶN: biên bản thẩm định 14/09/2026 ghi
// lại đúng những việc câu lệnh dặn mà mô hình làm lúc có lúc không. Tệp này
// chặn bằng MÃ, sau khi mô hình trả lời, trước khi học sinh nhìn thấy.
//
// Đặt ở tầng dịch vụ chứ không ở component: web có BA đường gọi mô hình
// (Firebase AI Logic, khoá riêng của học sinh, và bản mock), chặn ở component
// thì hai đường kia lọt.
//
// Tệp này KHÔNG import gì cả, để `scripts/kiem-tra-su-pham.mts` nạp thẳng bằng
// Node — cùng lý do với promptSuPham.ts và pedagogicalStateMachine.ts.

/* ── 1. Dò số trong văn bản ─────────────────────────────────────────────── */

/**
 * Rút mọi số trong một đoạn văn, chịu được các lối viết mà học sinh và mô hình
 * thật sự dùng:
 *   1,45   1.45   1,45.10^-2   1,45×10⁻²   1.45e-2   −0,5 (dấu trừ Unicode)
 *
 * Trả về mảng `number`. Không lọc trùng — chỗ gọi chỉ cần biết CÓ hay KHÔNG.
 */
export function timSoTrongVanBan(s: string): number[] {
  const MU = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const t = (s ?? '')
    /* Chuẩn hoá luỹ thừa 10 về ký hiệu e trước, vì phần sau chỉ bắt số thường.
       Ba lối viết: ×10^-2, ×10⁻², .10^-2 — đều gặp trong lời giải của ngân hàng. */
    .replace(/[×x*]\s*10\s*\^?\s*([−\-]?\d+)/gi, 'e$1')
    .replace(new RegExp(`[×x*]\\s*10\\s*([⁻${MU}]+)`, 'gi'), (_, mu: string) =>
      'e' + mu.replace(/⁻/g, '-').replace(new RegExp(`[${MU}]`, 'g'), c => String(MU.indexOf(c))))
    .replace(/\.\s*10\s*\^?\s*([−\-]?\d+)/g, 'e$1')
    .replace(/−/g, '-');

  const ra: number[] = [];
  for (const m of t.matchAll(/-?\d+(?:[.,]\d+)?(?:[eE][+-]?\d+)?/g)) {
    /* Dấu phẩy là dấu thập phân của tiếng Việt. Ở đây KHÔNG xử lý dấu phẩy ngăn
       hàng nghìn (1,234,567) vì kiểu viết đó không có trong bài Hoá 11 — có thì
       cũng chỉ làm bộ dò báo thừa, tức nghiêng về phía an toàn. */
    const v = Number(m[0].replace(',', '.'));
    if (Number.isFinite(v)) ra.push(v);
  }
  return ra;
}

/**
 * Câu trả lời có chứa đáp số không.
 *
 * CỐ Ý nghiêng về phía BÁO THỪA: một câu hỏi dẫn dắt bị chặn nhầm thì học sinh
 * nhận câu hỏi dự phòng — vẫn là một câu hỏi hợp lệ; còn một lần rò lọt là hỏng
 * đúng thứ đề tài đang chứng minh. Tỉ lệ báo thừa đo được bằng bộ kiểm thử tấn
 * công (`scripts/red-team/`), cột `co_dap_so` so với cột người duyệt chấm tay.
 *
 * `tol` lấy từ trường `tol` của câu trong ngân hàng. Sàn 1e-9 để so được cả
 * những đáp án mà `tol` bằng 0.
 */
export function coDapSo(traLoi: string, dapAn: number, tol: number): boolean {
  const saiSo = Math.max(Math.abs(tol), Math.abs(dapAn) * 1e-9, 1e-9);
  return timSoTrongVanBan(traLoi).some(v => Math.abs(v - dapAn) <= saiSo);
}

/* ── 2. Tìm đáp án của bài em đang hỏi ──────────────────────────────────── */

/** Câu ngân hàng tối thiểu mà bộ chặn cần — khớp `BankQuestion` của `features/bank/types.ts`. */
export interface CauCoDapSo {
  q: string;
  num?: number;
  tol?: number;
}

/** Bỏ dấu và ký tự không phải chữ/số, để so hai chuỗi tiếng Việt gõ khác nhau. */
function chuanHoaDeSo(s: string): string {
  return (s ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Ngưỡng khớp: bao nhiêu phần trăm từ dài của đề phải có mặt trong tin nhắn. */
const NGUONG_KHOP = 0.8;

/**
 * Tìm đáp án số của bài học sinh đang hỏi, bằng cách khớp tin nhắn với các câu
 * ĐÃ NẠP SẴN của bài đang mở.
 *
 * KHÔNG đọc thêm Firestore. Mục "Hạn mức đọc" trong CLAUDE.md: `getAll()` là
 * 1.554 lượt đọc mỗi lần gọi, và màn học sinh không được phép gọi nó.
 *
 * Ngưỡng 0,8 chọn để đủ chặt mà không khớp nhầm hai bài cùng dạng khác số liệu
 * (bài "tính pH khi trộn HCl với NaOH" có hàng chục biến thể trong kho), vẫn đủ
 * lỏng để chịu được em gõ không dấu hoặc thêm "ạ", "giúp em với".
 *
 * Trả `undefined` khi không khớp được — khi đó bộ chặn KHÔNG can thiệp, chỉ ghi
 * log. Đó là giới hạn đã biết: em gõ đề cô cho trên lớp thì không có đáp án để so.
 */
export function timDapAnChoTin(
  tin: string,
  cauCuaBai: CauCoDapSo[],
): { num: number; tol: number } | undefined {
  const t = chuanHoaDeSo(tin);
  if (t.length < 20) return undefined;   // tin quá ngắn thì không đủ căn cứ

  for (const c of cauCuaBai) {
    if (typeof c.num !== 'number') continue;
    const tuCuaDe = chuanHoaDeSo(c.q).split(' ').filter(w => w.length > 2);
    if (tuCuaDe.length < 5) continue;    // đề quá ngắn thì khớp kiểu gì cũng không tin được
    const chung = tuCuaDe.filter(w => t.includes(w)).length;
    if (chung / tuCuaDe.length >= NGUONG_KHOP) {
      return { num: c.num, tol: c.tol ?? Math.abs(c.num) * 0.01 };
    }
  }
  return undefined;
}

/* ── 3. Lọc một lượt trả lời ────────────────────────────────────────────── */

/** Chỉ thị gắt hơn, gắn thêm vào câu lệnh hệ thống cho lượt sinh lại. */
export const CHI_THI_SINH_LAI =
  'LƯỢT VỪA RỒI BỊ HỆ THỐNG CHẶN vì có chứa đáp số của bài em đang làm. Viết lại lượt trả lời: '
  + 'TUYỆT ĐỐI không nêu giá trị số của kết quả cuối, không nêu giá trị làm tròn của nó, '
  + 'không nêu nó dưới dạng luỹ thừa, phân số hay khoảng ước lượng. '
  + 'Chỉ hỏi em MỘT câu về bước kế tiếp em cần làm.';

/** Dùng khi lượt sinh lại VẪN rò — không gọi mô hình lần thứ ba. */
export const CAU_DU_PHONG =
  'Em thử trình bày giúp thầy/cô bước tiếp theo nhé: em định dùng công thức nào, '
  + 'và các đại lượng trong đó em lấy từ đâu trong đề?';

export interface YeuCauLoc {
  traLoi: string;
  dapAn?: { num: number; tol: number };
  sinhLai: (chiThi: string) => Promise<string>;
}

export interface KetQuaLoc {
  noiDung: string;
  daChan: boolean;
  /** Lượt sinh lại vẫn rò nên phải dùng câu dự phòng — đáng ghi log riêng. */
  phaiDungDuPhong: boolean;
}

/**
 * Dò → sinh lại MỘT lần với chỉ thị gắt hơn → vẫn rò thì thay bằng câu dự phòng.
 *
 * Chỉ sinh lại một lần, cố ý: mỗi lượt sinh lại là thêm một lượt gọi mô hình
 * tính vào hạn mức chung của cả web, mà hạn mức đó ngày 18/09/2026 đã cạn giữa
 * buổi học. Hai lần rò liên tiếp thì câu dự phòng rẻ hơn và chắc chắn sạch.
 */
export async function locTraLoi(y: YeuCauLoc): Promise<KetQuaLoc> {
  if (!y.dapAn || !coDapSo(y.traLoi, y.dapAn.num, y.dapAn.tol)) {
    return { noiDung: y.traLoi, daChan: false, phaiDungDuPhong: false };
  }
  const lai = await y.sinhLai(CHI_THI_SINH_LAI);
  if (!coDapSo(lai, y.dapAn.num, y.dapAn.tol)) {
    return { noiDung: lai, daChan: true, phaiDungDuPhong: false };
  }
  return { noiDung: CAU_DU_PHONG, daChan: true, phaiDungDuPhong: true };
}
