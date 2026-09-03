/* ─── Chuyển tài liệu Markdown sang Word ──────────────────────────────────────
 *
 * Chạy:  npm run word -- docs/de-cuong-nghien-cuu.md "docs/De cuong.docx"
 *
 * Vì sao có tệp này: đề cương giữ bản gốc ở Markdown để sửa và theo dõi thay
 * đổi bằng git cho gọn, nhưng nộp thì phải là .docx. Máy không có pandoc nên
 * tự chuyển bằng thư viện docx.
 *
 * CỐ Ý chỉ xử lý đúng những cú pháp đề cương dùng — tiêu đề, đoạn văn, in đậm
 * và nghiêng, bảng, danh sách, đường kẻ ngang — chứ không dựng cả bộ Markdown
 * đầy đủ. Thêm cú pháp mới thì bổ sung ở đây.
 *
 * Lưu ý khi sửa: bảng phải đặt bề rộng ở CẢ bảng lẫn từng ô, cùng đơn vị DXA;
 * dùng phần trăm thì Google Docs hiển thị hỏng. Tô nền ô dùng ShadingType.CLEAR,
 * dùng SOLID sẽ ra nền đen.
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, TableOfContents, PageBreak, Footer, PageNumber,
} = require('docx');

const VAO = process.argv[2];
const RA = process.argv[3];
const BE_NGANG = 9026;   // A4 trừ lề hai bên, đơn vị DXA

const src = fs.readFileSync(VAO, 'utf8').replace(/\r\n/g, '\n');

/* Đọc frontmatter YAML để dựng trang bìa.
   CỐ Ý đọc bằng tay chứ không kéo thêm thư viện YAML: ở đây chỉ có các dòng
   `khoá: "giá trị"` đơn giản, thêm phụ thuộc chỉ để đọc chừng ấy là thừa. */
let meta = {};
let than = src;
if (src.startsWith('---\n')) {
  const het = src.indexOf('\n---\n', 4);
  for (const d of src.slice(4, het).split('\n')) {
    const m = d.match(/^([a-z_]+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  than = src.slice(het + 5);
}

/** Một dòng trên bìa. */
function bia(text, { co = 26, dam = false, hoa = false, truoc = 0, sau = 0, nghieng = false } = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: truoc, after: sau, line: 300 },
    children: [new TextRun({
      text: hoa ? text.toUpperCase() : text,
      bold: dam, italics: nghieng, size: co, font: 'Times New Roman',
    })],
  });
}

/** Dòng "Nhãn: giá trị" căn trái ở khối thông tin cuối bìa. */
function biaDong(nhan, giaTri) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 120, line: 300 },
    indent: { left: 2200 },
    children: [
      new TextRun({ text: nhan + ': ', bold: true, size: 26 }),
      new TextRun({ text: giaTri || '(bổ sung)', size: 26 }),
    ],
  });
}

/** Tách **đậm** / *nghiêng* / `mã` thành các TextRun. */
function chay(s, dam = false) {
  const ra = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let cuoi = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > cuoi) ra.push(new TextRun({ text: s.slice(cuoi, m.index), bold: dam }));
    const t = m[0];
    if (t.startsWith('**')) ra.push(new TextRun({ text: t.slice(2, -2), bold: true }));
    else if (t.startsWith('`')) ra.push(new TextRun({ text: t.slice(1, -1), font: 'Consolas', size: 20 }));
    else ra.push(new TextRun({ text: t.slice(1, -1), italics: true, bold: dam }));
    cuoi = m.index + t.length;
  }
  if (cuoi < s.length) ra.push(new TextRun({ text: s.slice(cuoi), bold: dam }));
  return ra.length ? ra : [new TextRun({ text: s, bold: dam })];
}

function oBang(noiDung, dam, rong) {
  return new TableCell({
    width: { size: rong, type: WidthType.DXA },
    shading: dam ? { type: ShadingType.CLEAR, fill: 'E8EDF2' } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: [new Paragraph({ children: chay(noiDung, dam), spacing: { before: 0, after: 0 } })],
  });
}

const khoi = [];

/* ── TRANG BÌA ─────────────────────────────────────────────────────────────
   Bố cục theo lối trình bày quen thuộc của đề cương nghiên cứu cấp cơ sở:
   cơ quan chủ quản ở trên cùng, tên đề tài ở giữa trang, khối thông tin chủ
   nhiệm ở dưới, địa danh và thời gian ở cuối. */
if (meta.ten_de_tai) {
  khoi.push(bia(meta.co_quan || '', { dam: true, co: 26 }));
  khoi.push(bia(meta.don_vi || '', { dam: true, co: 26, sau: 60 }));
  khoi.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 900 },
    children: [new TextRun({ text: '\u2E3B\u2E3B\u2E3B', size: 24, color: '888888' })],
  }));

  khoi.push(bia(meta.loai || 'ĐỀ CƯƠNG NGHIÊN CỨU KHOA HỌC',
    { dam: true, co: 32, sau: 700 }));

  khoi.push(bia('Tên đề tài', { dam: true, co: 24, sau: 160 }));
  khoi.push(bia(meta.ten_de_tai, { dam: true, co: 34, hoa: true, sau: 200 }));
  if (meta.ten_tieng_anh)
    khoi.push(bia(meta.ten_tieng_anh, { co: 22, nghieng: true, sau: 700 }));

  khoi.push(biaDong('Lĩnh vực', meta.linh_vuc));
  khoi.push(biaDong('Chủ nhiệm đề tài', meta.chu_nhiem));
  if (meta.thanh_vien) khoi.push(biaDong('Thành viên tham gia', meta.thanh_vien));
  khoi.push(biaDong('Đơn vị chủ trì', meta.don_vi_chu_tri));
  khoi.push(biaDong('Thời gian thực hiện', meta.thoi_gian));

  khoi.push(bia(meta.dia_danh || '', { nghieng: true, truoc: 1000 }));
  khoi.push(new Paragraph({ children: [new PageBreak()] }));
}

/* ── MỤC LỤC ──────────────────────────────────────────────────────────────
   Word điền nội dung mục lục bằng trường (field), không phải văn bản tĩnh.
   Tệp đặt `updateFields: true` nên khi mở lần đầu Word sẽ hỏi có cập nhật
   không — chọn Có là mục lục hiện ra kèm số trang. Nếu lỡ chọn Không thì bấm
   chuột phải vào mục lục rồi chọn Update Field.

   Chỉ lấy tiêu đề cấp 1 và cấp 2; cấp 3 quá vụn cho một đề cương. */
if (String(meta.muc_luc) === 'true') {
  khoi.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text: 'MỤC LỤC', bold: true, size: 32, font: 'Times New Roman' })],
  }));
  khoi.push(new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-2' }));
  khoi.push(new Paragraph({ children: [new PageBreak()] }));
}

const dong = than.split('\n');
let i = 0;
let daCoMucLon = false;

while (i < dong.length) {
  const d = dong[i];
  const t = d.trim();

  // Đường kẻ ngang
  if (/^-{3,}$/.test(t)) {
    khoi.push(new Paragraph({
      text: '', spacing: { before: 120, after: 120 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA' } },
    }));
    i++; continue;
  }

  // Bảng
  if (t.startsWith('|') && i + 1 < dong.length && /^\|[\s:|-]+\|$/.test(dong[i + 1].trim())) {
    const hang = [];
    const oCua = l => l.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
    const dau = oCua(d);
    i += 2;
    while (i < dong.length && dong[i].trim().startsWith('|')) { hang.push(oCua(dong[i])); i++; }
    const soCot = dau.length;
    const rongCot = Array(soCot).fill(Math.floor(BE_NGANG / soCot));
    rongCot[0] += BE_NGANG - rongCot.reduce((a, b) => a + b, 0);
    const coTieuDe = dau.some(x => x !== '');
    const cacHang = [];
    if (coTieuDe) cacHang.push(new TableRow({
      tableHeader: true,
      children: dau.map((c, k) => oBang(c, true, rongCot[k])),
    }));
    for (const h of hang) cacHang.push(new TableRow({
      children: Array.from({ length: soCot }, (_, k) => oBang(h[k] ?? '', false, rongCot[k])),
    }));
    khoi.push(new Table({
      columnWidths: rongCot,
      width: { size: BE_NGANG, type: WidthType.DXA },
      rows: cacHang,
    }));
    khoi.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    continue;
  }

  // Tiêu đề
  const h = t.match(/^(#{1,4})\s+(.*)$/);
  if (h) {
    const cap = h[1].length;
    khoi.push(new Paragraph({
      children: chay(h[2]),
      heading: [HeadingLevel.HEADING_1, HeadingLevel.HEADING_1,
                HeadingLevel.HEADING_2, HeadingLevel.HEADING_3][cap - 1],
      spacing: { before: cap <= 2 ? 320 : 240, after: 140 },
      /* Mỗi mục lớn bắt đầu một trang mới, TRỪ mục đầu tiên — nó đã nằm ngay
         sau ngắt trang của mục lục rồi, thêm nữa là thừa một trang trắng. */
      pageBreakBefore: cap === 1 && /^\d\./.test(h[2]) && daCoMucLon,
    }));
    if (cap === 1 && /^\d\./.test(h[2])) daCoMucLon = true;
    i++; continue;
  }

  // Danh sách có số
  const ds = t.match(/^(\d+)\.\s+(.*)$/);
  if (ds) {
    khoi.push(new Paragraph({
      children: chay(ds[2]),
      numbering: { reference: 'so', level: 0 },
      spacing: { after: 90 },
    }));
    i++; continue;
  }

  // Danh sách gạch đầu dòng
  if (/^[-*]\s+/.test(t)) {
    khoi.push(new Paragraph({
      children: chay(t.replace(/^[-*]\s+/, '')),
      numbering: { reference: 'cham', level: 0 },
      spacing: { after: 90 },
    }));
    i++; continue;
  }

  // Dòng trống
  if (t === '') { i++; continue; }

  // Đoạn văn thường
  khoi.push(new Paragraph({
    children: chay(t),
    spacing: { after: 140, line: 300 },
    alignment: AlignmentType.JUSTIFIED,
  }));
  i++;
}

const doc = new Document({
  creator: 'Đề cương nghiên cứu',
  numbering: {
    config: [
      { reference: 'cham', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 640, hanging: 280 } } } }] },
      { reference: 'so', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 640, hanging: 280 } } } }] },
    ],
  },
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 26 } },
      heading1: { run: { font: 'Times New Roman', size: 32, bold: true, color: '1F3864' } },
      heading2: { run: { font: 'Times New Roman', size: 28, bold: true, color: '2E5496' } },
      heading3: { run: { font: 'Times New Roman', size: 26, bold: true, color: '333333' } },
    },
  },
  features: { updateFields: true },   // Word tự hỏi cập nhật mục lục khi mở
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 22 })],
        })],
      }),
    },
    children: khoi,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(RA, b);
  console.log('Da ghi', RA, '-', (b.length / 1024).toFixed(0), 'KB,', khoi.length, 'khoi');
});
