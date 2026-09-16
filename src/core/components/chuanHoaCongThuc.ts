// ─── Chuẩn hoá văn bản trước khi đưa vào Markdown + KaTeX ────────────────────
//
// Thay cho bộ đổi regex `mathText.ts` (xoá ngày 14/09/2026). Bộ cũ tự dựng chỉ
// số trên/dưới nên hỏng ở đúng các ký hiệu Hóa 11 hay dùng — biên bản thẩm
// định đo được: `$V = 2,479$` hiện nguyên dấu đô la, phân số lồng ra
// "fracc…", `\xrightarrow`, `\ce{}`, `\log`, `H^\circ_{298}` hiện thô.
// Nay việc DỰNG giao cho KaTeX (+ mhchem). Tệp này chỉ làm ba việc mà KaTeX và
// remark-math không tự làm được:
//
//   1. Nhận đúng cặp `$...$` là công thức: dấu mở và dấu đóng phải DÍNH SÁT
//      nội dung, và sau dấu đóng không phải chữ số. Nhờ vậy "5$ và 10$" hay
//      "$5 và $10" không bị bắt nhầm; dấu đô la lẻ được thoát thành `\$`.
//   2. Bọc những công thức mô hình (hoặc học sinh) viết TRẦN, không đô la —
//      `H_2SO_4`, `Fe^3+`, `[H^+]`, `\ce{...}`, `\rightarrow` — vào `$...$`.
//      Không bọc thì Markdown hiểu `_2SO_` là chữ nghiêng và phá hỏng câu.
//   3. Sửa dấu phẩy thập phân trong công thức: KaTeX coi dấu phẩy là dấu câu
//      và chèn khoảng trắng ("2, 479"), nên `2,479` → `2{,}479`.
//
// Tệp này KHÔNG import gì, để `scripts/kiem-tra-su-pham.mts` chạy thẳng bằng Node.

/** Đoạn được giữ nguyên (mã, link, URL) hoặc là công thức sẵn có. */
const DOAN_DAC_BIET = new RegExp(
  [
    '```[\\s\\S]*?```',                          // khối mã
    '`[^`\\n]+`',                                // mã trong dòng
    '\\$\\$[\\s\\S]+?\\$\\$',                    // $$...$$
    '\\\\\\[[\\s\\S]+?\\\\\\]',                  // \[...\]
    '\\\\\\([\\s\\S]+?\\\\\\)',                  // \(...\)
    '(?<!\\\\)\\$(?=[^\\s$])[^$\\n]*?(?<=[^\\s$\\\\])\\$(?!\\d)', // $...$ dính sát
    '\\[[^\\]\\n]+\\]\\([^)\\s]+\\)',            // [chữ](địa chỉ)
    'https?:\\/\\/[^\\s)]+',                     // URL trần
  ].join('|'),
  'g',
);

/* Lệnh LaTeX viết trần mà hay gặp trong bài Hóa. Nhận một tầng ngoặc lồng. */
const NGOAC = '\\{(?:[^{}]|\\{[^{}]*\\})*\\}';
const LENH_TRAN = new RegExp(
  [
    `\\\\(?:ce|pu)${NGOAC}`,
    `\\\\x(?:right|left)arrow(?:\\[[^\\]]*\\])?${NGOAC}`,
    `\\\\d?frac${NGOAC}${NGOAC}`,
    `\\\\(?:sqrt|text|mathrm)${NGOAC}`,
    // \log[H^+]: nuốt luôn cặp ngoặc vuông ngay sau, không thì ngoặc bị tách khỏi công thức
    '\\\\(?:log|ln)(?:\\[[^\\]\\n]{1,16}\\])?(?![A-Za-z])',
    '\\\\(?:rightleftharpoons|leftrightharpoons|longrightarrow|rightarrow|leftarrow|Delta|circ|times|cdot|approx|leq|geq|neq|pm|alpha|beta|gamma)(?![A-Za-z])',
  ].join('|'),
  'g',
);

/* Công thức viết trần có chỉ số: phần gốc rồi ít nhất một `_x` / `^x`.
   Chỉ số dưới bằng CHỮ THƯỜNG (K_c, K_sp) chỉ nhận khi đứng ngay sau chữ HOA,
   tối đa 3 ký tự và không theo sau bởi chữ thường — để "snake_case" hay
   "bai_hoc" trong câu thường không bị bắt. */
const CHI_SO = '(?:_(?:\\{[^{}\\s]{1,12}\\}|\\d{1,3}|(?<=[A-Z]_)[a-z]{1,3}(?![a-z]))|\\^(?:\\{[^{}\\s]{1,12}\\}|\\d{0,3}[+\\-]|\\d{1,3}|\\\\circ|[a-z](?![a-z])))';
const CONG_THUC_TRAN = new RegExp(
  `(?<![\\w\\\\$])[A-Za-z0-9(\\[][A-Za-z0-9()\\[\\]]*${CHI_SO}(?:[A-Z0-9()\\[\\]][A-Za-z0-9()\\[\\]]*${CHI_SO}?|${CHI_SO})*`,
  'g',
);

/** `_2` → `_{2}`, `^3+` → `^{3+}` — để \mathrm{} và KaTeX hiểu đúng phạm vi chỉ số. */
function gomChiSo(s: string): string {
  return s
    .replace(/_(\d{1,3}|[a-z]{1,3})(?![a-z{])/g, '_{$1}')
    .replace(/\^(\d{0,3}[+\-]|\d{1,3}|[a-z])(?![a-z{])/g, '^{$1}');
}

/** Dấu phẩy thập phân trong công thức: 2,479 → 2{,}479 */
function suaDauPhay(congThuc: string): string {
  return congThuc.replace(/(\d),(?=\d)/g, '$1{,}');
}

/** Bọc một công thức trần. Có chữ HOA (ký hiệu nguyên tố) thì coi là chất → chữ đứng, kể cả "3H_2". */
function bocCongThucTran(tok: string): string {
  const gon = gomChiSo(tok);
  return /[A-Z]/.test(tok) ? `\\mathrm{${gon}}` : gon;
}

/** Nối vào chuỗi đầu ra; hai công thức sát nhau thì GỘP, tránh sinh ra `$$` (công thức riêng dòng). */
function noiCongThuc(ra: string, noiDung: string): string {
  if (ra.endsWith('$') && !ra.endsWith('\\$')) return `${ra.slice(0, -1)} ${noiDung}$`;
  return `${ra}$${noiDung}$`;
}

function xuLyChuThuong(doan: string): string {
  // Gom mọi vị trí công thức trần (lệnh LaTeX + công thức có chỉ số), theo thứ tự.
  const khop: { i: number; j: number; noi: string }[] = [];
  for (const m of doan.matchAll(LENH_TRAN)) khop.push({ i: m.index!, j: m.index! + m[0].length, noi: m[0] });
  for (const m of doan.matchAll(CONG_THUC_TRAN)) {
    /* Nhả dấu đóng ngoặc thừa ở cuối: "([N2].[H2]^3)" chỉ bắt "[H2]^3", để dấu
       ")" của câu nằm ngoài công thức. Cũng không bắt đầu ở giữa một cặp "[...]"
       mà dấu "[" dính chữ phía trước. */
    let tok = m[0];
    const lech = (mo: string, dong: string) => tok.split(mo).length - tok.split(dong).length;
    while (/[\])]$/.test(tok) && (lech('[', ']') < 0 || lech('(', ')') < 0)) tok = tok.slice(0, -1);
    if (lech('[', ']') < 0 || lech('(', ')') < 0) continue;
    const i = m.index!, j = i + tok.length;
    if (khop.some(k => i < k.j && j > k.i)) continue; // đã nằm trong một lệnh LaTeX
    khop.push({ i, j, noi: bocCongThucTran(tok) });
  }
  khop.sort((a, b) => a.i - b.i);

  let ra = '';
  let viTri = 0;
  for (const k of khop) {
    const giua = doan.slice(viTri, k.i);
    ra += giua.replace(/\$/g, '\\$');
    /* Chỉ gộp khi giữa hai công thức chỉ có khoảng trắng (hoặc không có gì). */
    if (/^\s*$/.test(giua) && ra.endsWith('$') && !ra.endsWith('\\$')) {
      ra = noiCongThuc(ra.replace(/\s*$/, ''), suaDauPhay(k.noi));
    } else {
      ra += `$${suaDauPhay(k.noi)}$`;
    }
    viTri = k.j;
  }
  return ra + doan.slice(viTri).replace(/\$/g, '\\$');
}

export function chuanHoaCongThuc(vanBan: string): string {
  if (!vanBan) return '';
  let ra = '';
  let viTri = 0;
  for (const m of vanBan.matchAll(DOAN_DAC_BIET)) {
    ra += xuLyChuThuong(vanBan.slice(viTri, m.index));
    const t = m[0];
    if (t.startsWith('```') || t.startsWith('`') || t.startsWith('[') || /^https?:/.test(t)) {
      ra += t;
    } else if (t.startsWith('$$')) {
      ra += `$$${suaDauPhay(t.slice(2, -2))}$$`;
    } else if (t.startsWith('\\[')) {
      ra += `$$${suaDauPhay(t.slice(2, -2))}$$`;
    } else if (t.startsWith('\\(')) {
      ra += `$${suaDauPhay(t.slice(2, -2).trim())}$`;
    } else {
      ra += `$${suaDauPhay(t.slice(1, -1))}$`;
    }
    viTri = m.index! + t.length;
  }
  return ra + xuLyChuThuong(vanBan.slice(viTri));
}
