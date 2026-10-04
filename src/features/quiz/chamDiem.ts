// ─── Chấm Đề kiểm tra: câu Đúng/Sai nhiều ý và câu trả lời ngắn ──────────────
//
// Logic thuần, KHÔNG import gì kéo theo Firebase — để `npm run kiem-tra:de-giao`
// nạp thẳng bằng Node. `quizService.ts` thì kéo theo questionBank → bankStore →
// firebase, nên phần cần kiểm phải nằm ngoài nó.
//
// Sinh ngày 02/10/2026. Đo hôm đó trên web: trả lời ĐÚNG cả 8 câu của một đề
// Chemai phát mà chỉ được 5,5/8, vì hai dạng câu của ngân hàng đi qua `toLegacy`
// rồi rơi vào bộ chấm của mô hình cũ:
//   - câu trả lời ngắn bị chấm như tự luận, dò từ khoá, mỗi ý cộng cứng 0,25;
//   - câu Đúng/Sai 4 ý bị gộp thành một mệnh đề duy nhất.
// Luyện tập không dính vì nó đọc thẳng `BankQuestion` (xem practice/logic.ts).
// Tệp này cho Đề kiểm tra đúng cách chấm đó.

import type { Question } from '../library/types';
import { DIEM_DUNG_SAI } from '../practice/types';
import { doiRaSo } from '../practice/logic';

export interface KetQuaChamCau {
  /** Điểm đạt, đã nhân với điểm của câu */
  diem: number;
  /** Đúng trọn vẹn cả câu */
  dung: boolean;
  /** Câu trả lời viết ra cho người đọc (màn kết quả, màn giáo viên) */
  traLoiHienThi: string;
  nhanXet: string;
}

const lamTron = (x: number) => Math.round(x * 100) / 100;
const chuY = (i: number) => String.fromCharCode(97 + i);   // a, b, c, d

// ─── Đúng/Sai nhiều ý ────────────────────────────────────────────────────────

/**
 * Câu trả lời từng ý gói thành MỘT chuỗi: `D` đúng, `S` sai, `-` bỏ trống.
 *
 * Phải là chuỗi vì `Quiz.answers` là `Record<string, string>` và trường đó đã
 * nằm trong luật `bai_nop` — đổi kiểu là đổi cả luật lẫn bài cũ.
 */
export function maHoaDungSai(ds: (boolean | null)[]): string {
  return ds.map(v => (v === true ? 'D' : v === false ? 'S' : '-')).join('');
}

export function giaiMaDungSai(chuoi: string, soY: number): (boolean | null)[] {
  return Array.from({ length: soY }, (_, i) =>
    chuoi?.[i] === 'D' ? true : chuoi?.[i] === 'S' ? false : null);
}

/**
 * Chấm theo thang của Bộ GD&ĐT, cùng bảng `DIEM_DUNG_SAI` với Luyện tập:
 * sai 0 ý được trọn điểm, sai 1 ý 0,5, sai 2 ý 0,25, sai 3 ý 0,1.
 *
 * Tính theo số ý SAI chứ không theo số ý đúng, để câu 2–3 ý trong kho (có,
 * tuy ít) làm đúng hết vẫn được trọn điểm. Ý bỏ trống tính là sai — bỏ qua ý
 * trống thì em chỉ trả lời ý chắc nhất lại được điểm cao hơn em trả lời hết.
 */
export function chamDungSaiNhieuY(q: Question, traLoi: string): KetQuaChamCau {
  const y = q.yDungSai || [];
  const dap = giaiMaDungSai(String(traLoi || ''), y.length);
  const soYDung = y.reduce((n, ynay, i) => n + (dap[i] === ynay.v ? 1 : 0), 0);
  const soYSai = y.length - soYDung;
  const heSo = soYDung === 0 ? 0 : (DIEM_DUNG_SAI[DIEM_DUNG_SAI.length - 1 - soYSai] ?? 0);
  const boTrongHet = dap.every(v => v === null);

  return {
    diem: lamTron((q.points || 1) * heSo),
    dung: y.length > 0 && soYDung === y.length,
    traLoiHienThi: boTrongHet
      ? ''
      : dap.map((v, i) => `${chuY(i)}) ${v === null ? '(bỏ trống)' : v ? 'Đúng' : 'Sai'}`).join(' · '),
    nhanXet: boTrongHet ? 'Em chưa trả lời ý nào của câu này.' : `Đúng ${soYDung}/${y.length} ý.`,
  };
}

// ─── Trả lời ngắn ────────────────────────────────────────────────────────────

/**
 * Đáp số của câu, hoặc `null` nếu đây không phải câu trả lời ngắn.
 *
 * Nhánh thứ hai nhận cả câu tạo TRƯỚC ngày 02/10/2026: chúng không có `dapSo`,
 * chỉ có đúng một ý nhãn "Đáp án" do `toLegacy` đặt. Đề đang làm dở trong máy
 * học sinh và bài cô đã giao đều thuộc loại này, nên bỏ nhánh đó là các em vẫn
 * bị chấm 0,25 cho tới khi đề cũ hết hạn. Chặn ở 40 ký tự để một câu tự luận
 * thật lỡ mang nhãn "Đáp án" không bị đem ra so số.
 */
export function dapSoCua(q: Question): NonNullable<Question['dapSo']> | null {
  if (q.type !== 'Tự luận') return null;
  if (q.dapSo && String(q.dapSo.text ?? '').trim()) return q.dapSo;
  const y = q.essayPoints || [];
  const chu = String(y[0]?.content ?? '').trim();
  if (y.length === 1 && y[0].label === 'Đáp án' && chu && chu.length <= 40) return { text: chu };
  return null;
}

/**
 * Số mà học sinh muốn trả lời.
 *
 * Ô nhập chỉ xin một con số, nhưng các em hay gõ kèm chữ ("Kc = 0,074",
 * "100 atm"). `doiRaSo` hiểu được số đứng ĐẦU; khi nó chịu thua thì nhận nếu
 * trong câu có ĐÚNG MỘT con số. Hai số trở lên thì không đoán.
 */
function soTrongCau(traLoi: string): number {
  const thang = doiRaSo(traLoi);
  if (!Number.isNaN(thang)) return thang;
  const cacSo = traLoi.match(/-?\d+(?:[.,]\d+)?/g) || [];
  return cacSo.length === 1 ? doiRaSo(cacSo[0]) : NaN;
}

/** Đúng thì TRỌN điểm của câu, sai thì 0 — không có điểm lưng chừng cho một con số. */
export function chamDapSo(q: Question, traLoi: string): KetQuaChamCau {
  const ds = dapSoCua(q);
  const tl = String(traLoi || '').trim();
  if (!ds || !tl) {
    return { diem: 0, dung: false, traLoiHienThi: tl, nhanXet: 'Em chưa trả lời câu này.' };
  }

  const dapAn = typeof ds.num === 'number' ? ds.num : doiRaSo(ds.text);
  const so = soTrongCau(tl);
  let dung: boolean;
  if (!Number.isNaN(so) && !Number.isNaN(dapAn)) {
    /* Có sai số cho phép thì dùng; không có thì so ở mức 1e-9 — đủ bỏ qua sai
       lệch dấu phẩy động, không nới tay cho đáp số sai. Cùng lối `khopTraLoiNgan`. */
    const saiSo = typeof ds.tol === 'number' && ds.tol > 0 ? ds.tol : 1e-9;
    dung = Math.abs(so - dapAn) <= saiSo + 1e-9;
  } else {
    const chuan = (x: string) => x.trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');
    dung = chuan(tl) === chuan(ds.text);
  }

  const donVi = ds.unit && !ds.text.includes(ds.unit) ? ' ' + ds.unit : '';
  return {
    diem: dung ? (q.points || 1) : 0,
    dung,
    traLoiHienThi: tl,
    nhanXet: dung ? 'Đáp số đúng.' : `Chưa đúng. Đáp số là ${ds.text}${donVi}.`,
  };
}
