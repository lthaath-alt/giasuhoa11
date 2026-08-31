// ─── Đổi LaTeX của AI thành chữ đọc được ─────────────────────────────────────
//
// Gemini rất hay viết công thức bằng LaTeX, nhất là phân số kiểu hằng số cân
// bằng Kc. Giao diện này không dựng LaTeX nên học sinh thấy nguyên chuỗi thô:
//
//   $K_c = \frac{[C]^c \times [D]^d}{[A]^a \times [B]^b}$
//
// Đã thử cấm trong SYSTEM_PROMPT nhưng model vẫn dùng — và cũng dễ hiểu, vì
// phân số thật sự khó viết bằng chữ thuần. Nên xử lý ở phía hiển thị: đây là
// cách chắc chắn, không phụ thuộc model có nghe lời hay không.
//
// CỐ Ý không kéo thư viện KaTeX về: nó nặng vài trăm KB cho một nhu cầu nhỏ,
// trong khi đổi sang ký tự Unicode là đủ đọc.

const SUP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶',
  '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ',
};
const SUB: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆',
  '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋',
  'a': 'ₐ', 'c': '𝚌', 'n': 'ₙ', 'p': 'ₚ', 'x': 'ₓ',
};

function doiChiSo(noiDung: string, bang: Record<string, string>): string {
  // Chỉ đổi khi MỌI ký tự đều có ký hiệu tương ứng, tránh ra chuỗi nửa nạc nửa mỡ
  const ra = [...noiDung].map(c => bang[c] ?? bang[c.toLowerCase()] ?? '');
  return ra.every(Boolean) ? ra.join('') : '';
}

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
  r = r.replace(/\^\{([^{}]+)\}/g, (m, x) => doiChiSo(x, SUP) || `^${x}`);
  r = r.replace(/_\{([^{}]+)\}/g, (m, x) => doiChiSo(x, SUB) || `_${x}`);
  r = r.replace(/\^([A-Za-z0-9+\-])/g, (m, x) => SUP[x] ?? m);
  r = r.replace(/_([A-Za-z0-9+\-])/g, (m, x) => SUB[x] ?? m);

  // Lệnh lạ còn sót: bỏ dấu gạch chéo, giữ lại chữ cho người đọc tự hiểu
  r = r.replace(/\\([A-Za-z]+)/g, '$1');
  r = r.replace(/[{}]/g, '');

  return r.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Tìm các đoạn đặt trong $...$ hoặc $$...$$ rồi đổi sang chữ thường.
 * Phần ngoài dấu đô la giữ nguyên tuyệt đối.
 */
export function doiCongThuc(text: string): string {
  if (!text || text.indexOf('$') === -1) return text;
  return text
    .replace(/\$\$([\s\S]+?)\$\$/g, (m, x) => (laCongThuc(x) ? doiLatex(x) : m))
    .replace(/\$([^$\n]+?)\$/g, (m, x) => (laCongThuc(x) ? doiLatex(x) : m));
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
