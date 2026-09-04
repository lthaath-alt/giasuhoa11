/**
 * Nhúng dữ liệu riêng của trò "Rắn và Thang" thẳng vào tệp HTML.
 *
 * Chạy:  npm run nhung:ran-thang   (đã tự chạy sau hai lệnh sinh dữ liệu)
 *
 * ─── Vì sao phải nhúng ──────────────────────────────────────────────────────
 * Bản đầu trò chơi tải hai tệp JSON bằng fetch. Cách đó hỏng theo một kiểu rất
 * khó đoán: khi máy chủ KHÔNG tìm thấy tệp, nó không trả lỗi 404 mà trả về
 * `index.html` — vì web là ứng dụng một trang, có luật `/* -> /index.html 200`
 * bắt mọi đường dẫn lạ. Trò chơi nhận được một trang HTML rồi cố đọc nó như
 * JSON, và người dùng thấy đúng một dòng: "Unexpected token '<'".
 *
 * Thầy đã gặp đúng lỗi này. Nguyên nhân gốc có thể là bản đã triển khai còn cũ,
 * hoặc máy chủ đang chạy chưa thấy tệp mới — nhưng dù là gì thì cách chữa gọn
 * nhất là ĐỪNG TẢI NỮA: dữ liệu này là một phần của trò chơi, sinh cùng lúc với
 * trò chơi, nên nhúng thẳng vào là hết cả một loại hỏng.
 *
 * Kèm theo hai cái lợi: mở tệp HTML bằng cách nhấp đúp cũng chạy (giáo viên hay
 * làm thế lúc soạn bài), và không còn phụ thuộc thứ tự triển khai tệp.
 *
 * VẪN GIỮ hai tệp .json bên ngoài để đọc và soi bằng mắt. Phép kiểm
 * `npm run kiem-tra:ran-thang` canh cho bản nhúng luôn khớp bản .json.
 *
 * Ngân hàng câu hỏi thì KHÔNG nhúng: đó là dữ liệu sống, giáo viên sửa trên web
 * và bơm sang qua IndexedDB. Nhúng vào là đóng băng nó lại.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const HTML = 'public/games/ran-va-thang.html';
const DAU = '/* ═══ DỮ LIỆU NHÚNG — SINH TỰ ĐỘNG, ĐỪNG SỬA TAY ═══ */';
const CUOI = '/* ═══ HẾT DỮ LIỆU NHÚNG ═══ */';

const ranThang = readFileSync('public/games/du-lieu/ran-thang.json', 'utf8').trim();
const uuTien = readFileSync('public/games/du-lieu/cau-hoi-theo-bai.json', 'utf8').trim();

const khoi = [
  DAU,
  'var NHUNG_RAN_THANG = ' + ranThang + ';',
  'var NHUNG_UU_TIEN = ' + uuTien + ';',
  CUOI,
].join('\n');

let s = readFileSync(HTML, 'utf8');

const i = s.indexOf(DAU);
const j = s.indexOf(CUOI);
if (i >= 0 && j > i) {
  s = s.slice(0, i) + khoi + s.slice(j + CUOI.length);
} else {
  /* Lần đầu: chèn ngay sau dòng mở IIFE, để hai biến có mặt trước mọi chỗ dùng. */
  const neo = "'use strict';";
  const k = s.indexOf(neo);
  if (k < 0) {
    console.error('Không tìm thấy chỗ chèn trong ' + HTML);
    process.exit(1);
  }
  s = s.slice(0, k + neo.length) + '\n\n' + khoi + '\n' + s.slice(k + neo.length);
}

writeFileSync(HTML, s, 'utf8');
console.log(`Đã nhúng vào ${HTML}`);
console.log(`  ran-thang        ${(ranThang.length / 1024).toFixed(0)} KB`);
console.log(`  cau-hoi-theo-bai ${(uuTien.length / 1024).toFixed(0)} KB`);
console.log(`  tệp HTML nay      ${(s.length / 1024).toFixed(0)} KB`);
