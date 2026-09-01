// ─── Đổi ký hiệu công thức của AI thành chỉ số trên/dưới ─────────────────────
//
// Gemini viết công thức hóa học theo hai kiểu, tùy câu:
//
//   1. LaTeX trong cặp đô la:  $K_c = \frac{[C]^c}{[A]^a}$
//   2. Viết trần, không đô la: K_c, H_2SO_4, Fe^2+, 10^-7, K_{sp}
//
// SYSTEM_PROMPT đã cấm LaTeX nên kiểu (2) mới là kiểu chiếm đa số.
//
// CỐ Ý không kéo thư viện KaTeX về: nó nặng vài trăm KB cho một nhu cầu nhỏ.
//
// CỐ Ý KHÔNG đổi sang ký tự Unicode kiểu ₂ ⁺ nữa. Bảng Unicode chỉ có chỉ số
// dưới cho vài chữ cái (a, n, p, x) — KHÔNG có b, c, d, e, s... Bản trước phải
// lách bằng cách map 'c' sang chữ 'c' thường, nên "K_c" ra "Kc" với chữ c nằm
// ngang hàng, còn "K_b" thì không đổi được gì và học sinh đọc nguyên "K_b".
// Nay hàm này đánh dấu vị trí chỉ số bằng ký tự điều khiển, để RichText dựng
// thành thẻ <sub>/<sup> thật — đúng với MỌI chữ cái và đúng cỡ chữ.

/** Ký tự điều khiển đánh dấu chỉ số. Không xuất hiện trong văn bản người gõ. */
export const SUB_OPEN = '\u0011';
export const SUP_OPEN = '\u0012';
export const MARK_CLOSE = '\u0013';

const sub = (x: string) => `${SUB_OPEN}${x}${MARK_CLOSE}`;
const sup = (x: string) => `${SUP_OPEN}${x}${MARK_CLOSE}`;

/** Các lệnh LaTeX hay gặp trong bài Hóa, đổi thẳng sang ký tự Unicode */
const LENH: [RegExp, string][] = [
  [/\\rightleftharpoons|\\leftrightharpoons|\\rightleftarrows/g, '⇌'],
  [/\\longrightarrow|\\rightarrow|\\to\b/g, '→'],
  [/\\longleftarrow|\\leftarrow/g, '←'],
  [/\\times/g, '×'],
  [/\\cdot/g, '·'],
  [/\\div/g, '÷'],
  [/\\pm/g, '±'],
  [/\\approx/g, '≈'],
  [/\\neq/g, '≠'],
  [/\\leq/g, '≤'],
  [/\\geq/g, '≥'],
  [/\\Delta/g, 'Δ'],
  [/\\alpha/g, 'α'], [/\\beta/g, 'β'], [/\\gamma/g, 'γ'],
  [/\\circ/g, '°'],
  [/\\%/g, '%'],
  [/\\left|\\right/g, ''],
  [/\\quad|\\qquad/g, '  '],
  [/\\[,;!:]/g, ' '],
  [/\\\\/g, ' '],
];

/**
 * Đổi một đoạn LaTeX thành chữ thường đọc được.
 *
 * Không cố dựng lại phân số hai tầng — trong một dòng chat thì `(tử)/(mẫu)`
 * dễ đọc hơn và không vỡ khi xuống dòng.
 */
function doiLatex(s: string): string {
  let r = s;

  // \frac{A}{B} -> (A)/(B). Lặp để xử lý phân số lồng nhau, có trần vòng lặp.
  for (let i = 0; i < 5; i++) {
    const truoc = r;
    r = r.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_m, a, b) => `(${a})/(${b})`);
    if (r === truoc) break;
  }

  // \sqrt{A} -> √(A)
  r = r.replace(/\\sqrt\s*\{([^{}]*)\}/g, (_m, a) => `√(${a})`);

  // \text{X}, \mathrm{X}, \mathbf{X} -> X
  r = r.replace(/\\(?:text|mathrm|mathbf|mathit|operatorname)\s*\{([^{}]*)\}/g, '$1');

  LENH.forEach(([re, tv]) => { r = r.replace(re, tv); });

  // Chỉ số trên/dưới: ưu tiên dạng có ngoặc nhọn trước
  r = r.replace(/\^\{([^{}]+)\}/g, (_m, x) => sup(x));
  r = r.replace(/_\{([^{}]+)\}/g, (_m, x) => sub(x));
  r = r.replace(/\^([A-Za-z0-9+-])/g, (_m, x) => sup(x));
  r = r.replace(/_([A-Za-z0-9+-])/g, (_m, x) => sub(x));

  // Lệnh lạ còn sót: bỏ dấu gạch chéo, giữ lại chữ cho người đọc tự hiểu
  r = r.replace(/\\([A-Za-z]+)/g, '$1');
  r = r.replace(/[{}]/g, '');

  return r.replace(/ {2,}/g, ' ').trim();
}

/**
 * Đổi ký hiệu viết trần — không có dấu đô la bao quanh.
 *
 * Mỗi mẫu đều đòi một ký tự "neo" phía trước (chữ, số, dấu đóng ngoặc) để dấu
 * gạch dưới đứng lẻ trong câu tiếng Việt không bị hiểu nhầm là chỉ số.
 */
function doiVietTran(s: string): string {
  let r = s;

  // Lệnh LaTeX lọt ra ngoài cặp đô la vẫn phải đổi
  LENH.forEach(([re, tv]) => { r = r.replace(re, tv); });

  // Dạng ngoặc nhọn trước (ưu tiên cao hơn): K_{sp}, Fe^{2+}
  r = r.replace(/([A-Za-z0-9)\]}])_\{([^{}\n]{1,8})\}/g, (_m, pre, x) => pre + sub(x));
  r = r.replace(/([A-Za-z0-9)\]}])\^\{([^{}\n]{1,8})\}/g, (_m, pre, x) => pre + sup(x));

  // Chỉ số dưới: chữ số trước (H_2O -> H₂O, không nuốt luôn chữ O)
  r = r.replace(/([A-Za-z0-9)\]}])_(\d+)/g, (_m, pre, x) => pre + sub(x));
  // rồi tới chữ cái: K_c, K_sp, K_a1
  r = r.replace(/([A-Za-z0-9)\]}])_([A-Za-z]{1,3}\d?)(?![A-Za-z])/g, (_m, pre, x) => pre + sub(x));

  // Chỉ số trên: Fe^2+, Na^+, 10^-7, x^n
  r = r.replace(/([A-Za-z0-9)\]}])\^(-?\d+[+-]?|[+-])/g, (_m, pre, x) => pre + sup(x));
  r = r.replace(/([A-Za-z0-9)\]}])\^([A-Za-z]\d?)(?![A-Za-z])/g, (_m, pre, x) => pre + sup(x));

  return r;
}

/**
 * Bên trong cặp $...$ có thật là công thức không.
 *
 * Cần thiết vì câu đời thường cũng có dấu đô la: "Giá 5$ và 10$ thôi em" từng
 * bị nuốt mất hai dấu và đoạn giữa. Mọi công thức LaTeX mà Gemini sinh ra đều
 * mang ít nhất một trong các dấu hiệu dưới đây.
 */
function laCongThuc(s: string): boolean {
  return /\\[A-Za-z]|[_^{}]/.test(s);
}

/** Địa chỉ web viết trần: bên trong có gạch dưới của id, không được đụng vào. */
const URL_TRAN = /(https?:\/\/\S+|www\.\S+)/g;

/**
 * Đổi công thức trong MỘT ĐOẠN CHỮ THUẦN.
 *
 * Trả về chuỗi có chèn ký tự đánh dấu chỉ số (SUB_OPEN/SUP_OPEN/MARK_CLOSE);
 * RichText chịu trách nhiệm dựng chúng thành thẻ <sub>/<sup>.
 *
 * LƯU Ý QUAN TRỌNG: chỉ gọi hàm này trên phần CHỮ, KHÔNG gọi trên địa chỉ của
 * link. Mã bài kiểm tra dạng `quiz_1788260660617_862` có gạch dưới, đi qua đây
 * sẽ thành `quiz₁788260660617₈62` và link chết. Bản trước tự bảo vệ bằng cách
 * thay markdown link bằng placeholder ngay trong hàm này, nhưng cách đó chỉ đỡ
 * được link có cú pháp `[chữ](địa chỉ)` — URL viết trần vẫn hỏng. Nay RichText
 * tách markdown TRƯỚC và chỉ đưa phần chữ vào đây, nên vấn đề hết tận gốc.
 */
export function doiCongThuc(text: string): string {
  if (!text) return text;

  // Model đôi khi trả thẳng thẻ HTML — nhận luôn cho đỡ lệ thuộc vào may rủi
  let r = text
    .replace(/<sub>([\s\S]*?)<\/sub>/gi, (_m, x) => sub(x))
    .replace(/<sup>([\s\S]*?)<\/sup>/gi, (_m, x) => sup(x));

  // Đoạn trong cặp đô la: đổi trọn vẹn bằng bộ luật LaTeX
  if (r.indexOf('$') !== -1) {
    r = r
      .replace(/\$\$([\s\S]+?)\$\$/g, (m, x) => (laCongThuc(x) ? doiLatex(x) : m))
      .replace(/\$([^$\n]+?)\$/g, (m, x) => (laCongThuc(x) ? doiLatex(x) : m));
  }

  // Phần còn lại: ký hiệu viết trần. Bỏ qua các đoạn là địa chỉ web.
  if (r.indexOf('_') === -1 && r.indexOf('^') === -1 && r.indexOf('\\') === -1) return r;

  return r
    .split(URL_TRAN)
    .map((phan, i) => (i % 2 === 1 ? phan : doiVietTran(phan)))
    .join('');
}
