/**
 * Chuyển tài liệu Markdown sang PDF.
 *
 * Chạy:  npm run pdf -- docs/soat-hoa-hoc/de-dan-....md
 *        npm run pdf -- vao.md "ra.pdf"        (tự đặt tên nếu bỏ trống)
 *
 * ─── Vì sao có tệp này ──────────────────────────────────────────────────────
 * Ô đính kèm của Antigravity không nhận `.md` lẫn `.docx`. Tệp đề dẫn của
 * `npm run soat:hoa-hoc -- --xuat-de-dan` vì thế không đưa sang được bằng
 * đường đính kèm, mà đó là đường duy nhất khi không muốn dán 141.000 ký tự
 * vào ô chat.
 *
 * (Đường rẻ hơn vẫn là gõ ĐƯỜNG DẪN tệp .md vào chat — repo nằm sẵn trong
 * workspace của Antigravity nên nó tự mở được. Tệp này dành cho lúc đường đó
 * không dùng được.)
 *
 * ─── Vì sao in bằng Chrome ──────────────────────────────────────────────────
 * Máy không có pandoc, không có LaTeX. Tự viết bộ sinh PDF thì vướng chỗ nhúng
 * font: nội dung có dấu tiếng Việt VÀ chỉ số hoá học (₂, ⁺, ⇌), mà 14 font
 * dựng sẵn của PDF chỉ với tới WinAnsi — tức mất sạch. Chrome đã có trên máy
 * (Playwright dùng `channel: 'chrome'` vì lý do riêng, xem playwright.config.ts)
 * và nó nhúng font hộ, nên đường này vừa ngắn vừa không hỏng chữ.
 *
 * CỐ Ý chỉ xử lý đúng những cú pháp mà tài liệu trong repo dùng — giống
 * `md-sang-word.cjs`, và khi thêm cú pháp mới thì phải sửa CẢ HAI.
 *
 * Khối mã rào bằng ``` giữ nguyên từng dòng và KHÔNG ngắt dòng mềm: tệp đề dẫn
 * đưa cả ngân hàng câu hỏi qua một khối JSON vài nghìn dòng, mà mỗi `"id"` nằm
 * gọn trên một dòng ngắn — đó là thứ phải đọc ra đúng từng ký tự.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const duong = (t: string) => (/^([a-zA-Z]:[\\/]|\/)/.test(t) ? t : join(GOC, t));

const VAO = process.argv[2];
if (!VAO) {
  console.error('Thiếu tệp vào.  npm run pdf -- docs/…/ten.md [ra.pdf]');
  process.exit(1);
}
const RA = duong(process.argv[3] || VAO.replace(/\.md$/i, '.pdf'));

const src = readFileSync(duong(VAO), 'utf8').replace(/\r\n/g, '\n');

const thoat = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** **đậm** / *nghiêng* / `mã` — chạy SAU khi đã thoát HTML. */
function chay(s: string): string {
  return thoat(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const dong = src.split('\n');
const ra: string[] = [];
let i = 0;

while (i < dong.length) {
  const t = dong[i].trim();

  // Khối mã rào — giữ nguyên, không đụng vào gì bên trong
  if (t.startsWith('```')) {
    i++;
    const than: string[] = [];
    while (i < dong.length && !dong[i].trim().startsWith('```')) { than.push(dong[i]); i++; }
    i++;   // bỏ dòng rào đóng
    ra.push(`<pre>${thoat(than.join('\n'))}</pre>`);
    continue;
  }

  if (/^-{3,}$/.test(t)) { ra.push('<hr>'); i++; continue; }

  // Bảng
  if (t.startsWith('|') && i + 1 < dong.length && /^\|[\s:|-]+\|$/.test(dong[i + 1].trim())) {
    const oCua = (l: string) => l.trim().replace(/^\||\|$/g, '').split('|').map(x => x.trim());
    const dau = oCua(dong[i]);
    i += 2;
    const hang: string[][] = [];
    while (i < dong.length && dong[i].trim().startsWith('|')) { hang.push(oCua(dong[i])); i++; }
    ra.push('<table><thead><tr>' + dau.map(c => `<th>${chay(c)}</th>`).join('') + '</tr></thead><tbody>'
      + hang.map(h => '<tr>' + dau.map((_, k) => `<td>${chay(h[k] ?? '')}</td>`).join('') + '</tr>').join('')
      + '</tbody></table>');
    continue;
  }

  const h = t.match(/^(#{1,4})\s+(.*)$/);
  if (h) { ra.push(`<h${h[1].length}>${chay(h[2])}</h${h[1].length}>`); i++; continue; }

  /* Gom danh sách liền nhau vào MỘT thẻ <ul>/<ol>. Mỗi mục một thẻ riêng thì
     trình duyệt reset số đếm, danh sách có số ra "1. 1. 1.". */
  const soDau = t.match(/^\d+\.\s+(.*)$/);
  const chamDau = t.match(/^[-*]\s+(.*)$/);
  if (soDau || chamDau) {
    const the = soDau ? 'ol' : 'ul';
    const muc: string[] = [];
    while (i < dong.length) {
      const m = dong[i].trim().match(soDau ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/);
      if (!m) break;
      muc.push(`<li>${chay(m[1])}</li>`);
      i++;
    }
    ra.push(`<${the}>${muc.join('')}</${the}>`);
    continue;
  }

  if (t === '') { i++; continue; }

  ra.push(`<p>${chay(t)}</p>`);
  i++;
}

/* Dãy font dự phòng dài là cố ý: Times New Roman đủ cho tiếng Việt nhưng
   thiếu chỉ số dưới (₂) và mũi tên cân bằng (⇌); Consolas cũng vậy. Để
   Chrome tự lùi sang font có ký tự đó thay vì in ra ô vuông. */
const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<title>${thoat(basename(VAO))}</title>
<style>
  @page { size: A4; margin: 14mm 13mm; }
  body { font: 10.5pt/1.45 "Times New Roman", "Segoe UI", "Arial Unicode MS", serif;
         color: #111; margin: 0; }
  h1 { font-size: 17pt; margin: 0 0 10pt; }
  h2 { font-size: 13.5pt; margin: 14pt 0 6pt; }
  h3, h4 { font-size: 11.5pt; margin: 12pt 0 5pt; }
  p { margin: 0 0 6pt; text-align: justify; }
  ul, ol { margin: 0 0 6pt; padding-left: 18pt; }
  li { margin-bottom: 3pt; }
  hr { border: 0; border-top: 1px solid #aaa; margin: 10pt 0; }
  code { font-family: Consolas, "DejaVu Sans Mono", monospace; font-size: 9pt; }
  /* Khối mã: KHÔNG ngắt dòng mềm, không cắt ngang giữa các trang nếu tránh được */
  pre { font-family: Consolas, "DejaVu Sans Mono", "Segoe UI", monospace;
        font-size: 7.5pt; line-height: 1.25; white-space: pre-wrap;
        word-break: break-word; margin: 0 0 8pt; }
  table { border-collapse: collapse; width: 100%; margin: 0 0 8pt; font-size: 10pt; }
  th, td { border: 1px solid #999; padding: 3pt 5pt; text-align: left; vertical-align: top; }
  th { background: #e8edf2; }
</style></head><body>
${ra.join('\n')}
</body></html>`;

/* Bản HTML là vật trung gian, KHÔNG phải sản phẩm — để nó cạnh tệp PDF trong
   `docs/` thì nó lọt vào git và lần sau có người sửa nhầm bản đó. Ném vào thư
   mục tạm của hệ điều hành; đường dẫn vẫn in ra để còn soi khi PDF ra lạ. */
const tepHtml = join(tmpdir(), basename(RA).replace(/\.pdf$/i, '') + '.html');
mkdirSync(dirname(RA), { recursive: true });
writeFileSync(tepHtml, html, 'utf8');

const trinhDuyet = await chromium.launch({ channel: 'chrome' });
const trang = await trinhDuyet.newPage();
await trang.goto(pathToFileURL(tepHtml).href, { waitUntil: 'load' });
await trang.pdf({
  path: RA,
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '<div style="width:100%;text-align:center;font-size:8pt;color:#555">'
    + '<span class="pageNumber"></span>/<span class="totalPages"></span></div>',
  margin: { top: '14mm', bottom: '14mm', left: '13mm', right: '13mm' },
});
await trinhDuyet.close();

const kb = (statSync(RA).size / 1024).toFixed(0);
console.log(`Da ghi ${RA} - ${kb} KB, ${ra.length} khoi`);
console.log(`(ban HTML trung gian: ${tepHtml} - xoa duoc, chi de soi khi PDF ra la)`);
