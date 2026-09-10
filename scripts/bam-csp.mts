/* ─── Vá CSP bằng hash cho các trang tĩnh ────────────────────────────────────
 *
 * Chạy SAU `vite build`, sửa `dist/_headers` tại chỗ.
 *
 * VÌ SAO CẦN:
 *
 * `script-src 'self'` chặn mọi script NỘI TUYẾN. Ứng dụng React thì không sao —
 * gói Vite dựng ra chỉ có `<script src="/assets/…">`. Nhưng sáu trang tĩnh
 * trong `public/` (trang bài giảng và năm trò chơi) được viết tay và dựng HOÀN
 * TOÀN bằng script nội tuyến: 11 đoạn, không tệp .js ngoài nào.
 *
 * Ngày 10/09/2026 bản CSP đầu lên production và giết sạch cả sáu trang đó:
 * khung bài giảng hiện đúng phần vỏ (tiêu đề, ô tìm bài) rồi trống trơn, vì
 * phần vỏ là HTML tĩnh còn danh sách bài do script dựng.
 *
 * VÌ SAO KHÔNG DÙNG 'unsafe-inline':
 *
 * Vì nó cho phép lại CẢ thuộc tính xử lý sự kiện nội tuyến — tức đúng
 * `<img src=x onerror=…>`, chính đòn tấn công mà CSP này sinh ra để chặn. Thêm
 * một từ khoá cho tiện là bỏ luôn hàng rào thứ hai của cả ứng dụng.
 *
 * Hash thì chỉ cho phép ĐÚNG những đoạn mã đã biết. Mã kẻ tấn công chèn vào có
 * nội dung khác nên hash khác, và vẫn bị chặn.
 *
 * VÌ SAO TÍNH LÚC BUILD CHỨ KHÔNG CHÉP TAY VÀO `public/_headers`:
 *
 * Vì `npm run gan:cau-hoi` và `npm run nhung:ran-thang` GHI dữ liệu thẳng vào
 * các tệp HTML trò chơi. Hash chép tay sẽ lệch ngay lần chạy kế tiếp, và triệu
 * chứng là trò chơi chết im lặng trên production. Tính lại mỗi lần dựng thì
 * không bao giờ lệch.
 *
 * ĐIỀU KIỆN ĐỂ CÁCH NÀY ĐỦ (đã đo ngày 10/09/2026, cả sáu tệp):
 *   - 0 thuộc tính `on…=` nội tuyến   (hash không cứu được, sẽ cần 'unsafe-hashes')
 *   - 0 `eval` / `new Function`       (sẽ cần 'unsafe-eval')
 *   - 0 `setTimeout("chuỗi")`
 *   - 0 URL `javascript:`
 * Nếu sau này thêm một trong bốn thứ đó, trang sẽ chết và phải xử lý riêng chứ
 * ĐỪNG nới CSP.
 *
 * Chạy: tự động trong `npm run build`
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const DIST = join(GOC, 'dist');

function moiTep(thuMuc: string, duoi: string, ra: string[] = []): string[] {
  for (const t of readdirSync(thuMuc)) {
    const d = join(thuMuc, t);
    if (statSync(d).isDirectory()) moiTep(d, duoi, ra);
    else if (t.endsWith(duoi)) ra.push(d);
  }
  return ra;
}

if (!existsSync(DIST)) {
  console.error('Chưa có dist/ — chạy `vite build` trước.');
  process.exit(1);
}

/* ── Tìm mọi script nội tuyến và tính hash ────────────────────────────────── */
const bam = new Map<string, string[]>();   // hash -> nơi dùng
for (const tep of moiTep(DIST, '.html')) {
  const noiDung = readFileSync(tep, 'utf8');
  /* Lấy đúng phần thân giữa `>` và `</script>` — đây chính là chuỗi trình duyệt
     đem đi băm. Bỏ thẻ có `src` vì chúng đã được `'self'` cho qua. */
  for (const m of noiDung.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/i.test(m[1])) continue;
    /* PHẢI chuẩn hoá xuống dòng trước khi băm. Bộ phân tích HTML đổi mọi CRLF
       và CR đơn thành LF ngay ở khâu tiền xử lý dòng vào, nên chuỗi mà CSP đem
       băm là bản chỉ có LF — dù tệp trên đĩa là CRLF. Các tệp trong repo này
       đang là CRLF, và bản đầu của script băm nguyên xi: cả 10 hash đều lệch,
       trang vẫn chết y như chưa vá. Đo được vì đã đối chiếu với đúng hash mà
       trình duyệt in ra trong thông báo lỗi. */
    const than = m[2].replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const h = 'sha256-' + createHash('sha256').update(than, 'utf8').digest('base64');
    const ten = relative(DIST, tep).replace(/\\/g, '/');
    bam.set(h, [...(bam.get(h) ?? []), ten]);
  }
}

if (bam.size === 0) {
  console.log('Không có script nội tuyến nào — không cần vá CSP.');
  process.exit(0);
}

/* ── Vá `script-src` trong dist/_headers ──────────────────────────────────── */
const P = join(DIST, '_headers');
if (!existsSync(P)) {
  console.error('Thiếu dist/_headers — không vá được CSP.');
  process.exit(1);
}

const goc = readFileSync(P, 'utf8');
const crlf = goc.includes('\r\n');
let s = crlf ? goc.replace(/\r\n/g, '\n') : goc;

/* Chỉ vá ĐÚNG dòng khai header, bỏ mọi dòng chú thích.
 *
 * Bản đầu viết `s.replace("script-src 'self'", …)`. `String.replace` với mẫu là
 * chuỗi chỉ thay lần xuất hiện ĐẦU TIÊN — mà lần đầu nằm trong khối chú thích
 * giải thích CSP ở đầu tệp. Kết quả: 10 hash được chèn vào một dòng `#`, header
 * thật không đổi, trang vẫn chết. Và phép kiểm cuối tệp vẫn báo ĐẠT vì nó chỉ
 * hỏi "tệp có chứa hash không". */
const danhSach = [...bam.keys()].sort().map(h => `'${h}'`).join(' ');
const dong = s.split('\n');
let soVa = 0;
for (let i = 0; i < dong.length; i++) {
  if (dong[i].trimStart().startsWith('#')) continue;
  if (!/^\s*Content-Security-Policy\s*:/.test(dong[i])) continue;
  if (!dong[i].includes("script-src 'self'")) continue;
  dong[i] = dong[i].replace("script-src 'self'", `script-src 'self' ${danhSach}`);
  soVa++;
}
if (soVa === 0) {
  console.error("Không thấy dòng `Content-Security-Policy:` nào chứa `script-src 'self'` trong dist/_headers.");
  console.error('CSP đã bị đổi — dừng lại để người sửa xem lại, đừng đoán.');
  process.exit(1);
}
s = dong.join('\n');
writeFileSync(P, crlf ? s.split('\n').join('\r\n') : s, 'utf8');

/* ── Báo cáo ─────────────────────────────────────────────────────────────── */
console.log(`\nVá CSP: thêm ${bam.size} hash cho script nội tuyến`);
for (const [h, cho] of [...bam].sort()) {
  console.log(`  ${h.slice(0, 26)}…  ${[...new Set(cho)].join(', ')}`);
}

/* Không tin thông báo của chính mình — đọc lại tệp vừa ghi.
 *
 * Và đọc ĐÚNG DÒNG HEADER, không đọc cả tệp: bản đầu của phép kiểm này dùng
 * `lai.includes(h)`, nên khi 10 hash bị chèn nhầm vào một dòng chú thích nó vẫn
 * báo "đủ 10/10" trong lúc trang tiếp tục chết. Một phép kiểm đọc lời giải
 * thích về hàng rào thay vì đọc hàng rào. */
const dongHeader = readFileSync(P, 'utf8')
  .split(/\r?\n/)
  .filter(d => !d.trimStart().startsWith('#') && /^\s*Content-Security-Policy\s*:/.test(d))
  .join('\n');
const thieu = [...bam.keys()].filter(h => !dongHeader.includes(h));
if (thieu.length) {
  console.error(`\nSAI: ${thieu.length}/${bam.size} hash không nằm trong dòng Content-Security-Policy sau khi ghi.`);
  process.exit(1);
}
console.log(`\nĐã kiểm lại chính dòng Content-Security-Policy: đủ ${bam.size}/${bam.size} hash.\n`);
