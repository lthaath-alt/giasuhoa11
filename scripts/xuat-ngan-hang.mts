/**
 * Xuất ngân hàng câu hỏi từ Firestore ra tệp trong repo.
 *
 * Chạy:  npm run xuat:ngan-hang
 *
 * ─── Vì sao cần ─────────────────────────────────────────────────────────────
 * Ngân hàng thật nằm ở Firestore (collection `bank_questions`), KHÔNG nằm
 * trong repo. Máy khác `git pull` về chỉ có `public/bank/ngan-hang.json`, mà
 * tệp đó là bản chụp tại lần xuất gần nhất. Thêm câu trên web mà quên chạy
 * lệnh này thì:
 *
 *   · trò Rắn và Thang không bao giờ hỏi tới câu mới, vì bảng gán câu theo bài
 *     (`npm run gan:cau-hoi`) dựng từ tệp này chứ không gọi mạng;
 *   · mở trò chơi lúc mất mạng chỉ còn ngân hàng cũ;
 *   · Firestore hỏng hay bị xoá nhầm thì trong git không có đường lùi nào.
 *
 * Đúng chuyện đã xảy ra: tệp cũ `seed-160.json` đứng yên ở 160 câu suốt trong
 * khi Firestore đã lên 252. `npm run kiem-tra:dong-bo` sinh ra để chặn việc đó
 * lặp lại.
 *
 * CHỈ ĐỌC Firestore, không ghi gì lên đó.
 */
import { writeFileSync } from 'node:fs';
import {
  TEP_NGAN_HANG, docEnv, thieuCauHinh, taiTuFirestore, chuanHoa, vanTay, docTepNganHang,
} from './ngan-hang-chung.mts';

const env = docEnv();
const thieu = thieuCauHinh(env);
if (thieu.length) {
  console.error('Thiếu trong .env.local: ' + thieu.join(', '));
  console.error('Chép từ .env.example rồi điền cấu hình Firebase của dự án.');
  process.exit(1);
}

console.log('Đang đọc bank_questions của dự án ' + env.VITE_FIREBASE_PROJECT_ID + ' …');
const cau = await taiTuFirestore(env);

if (!cau.length) {
  /* Ngân hàng rỗng gần như luôn là lỗi mạng hoặc sai cấu hình, chứ không phải
     thầy vừa xoá sạch mấy trăm câu. Ghi đè tệp trong repo bằng mảng rỗng là
     xoá mất bản lùi duy nhất — dừng hẳn thay vì ghi. */
  console.error('Firestore trả về 0 câu. KHÔNG ghi đè tệp cũ.');
  console.error('Kiểm lại mạng và VITE_FIREBASE_PROJECT_ID rồi chạy lại.');
  process.exit(1);
}

const cu = docTepNganHang();
/* Ghi bản đã chuẩn hoá (sắp theo id, khoá sắp theo alphabet). Firestore không
   hứa thứ tự nào cả; ghi thẳng thì lần xuất nào git cũng báo cả tệp thay đổi
   dù nội dung y hệt, và bản khác biệt trở nên vô dụng. */
writeFileSync(TEP_NGAN_HANG, JSON.stringify(chuanHoa(cau), null, 1) + '\n', 'utf8');

const theoChuong: Record<string, number> = {};
const theoDang: Record<string, number> = {};
let chuaGanBai = 0;
for (const c of cau as any[]) {
  theoChuong['ch' + c.ch] = (theoChuong['ch' + c.ch] || 0) + 1;
  theoDang[c.t || 'mc'] = (theoDang[c.t || 'mc'] || 0) + 1;
  if (!c.lessonId) chuaGanBai++;
}

console.log(`\nĐã ghi ${cau.length} câu vào public/bank/ngan-hang.json`
  + (cu ? ` (trước đó ${cu.length} câu)` : ''));
console.log('  theo chương: ', JSON.stringify(theoChuong));
console.log('  theo dạng:   ', JSON.stringify(theoDang));
console.log('  chưa gắn bài:', chuaGanBai, 'câu');
console.log('  vân tay:     ', vanTay(cau));
console.log('\nBước tiếp theo — dựng lại phần trò chơi dùng tới ngân hàng này:');
console.log('  npm run gan:cau-hoi');
console.log('  npm run kiem-tra');
console.log('  git add public/bank/ngan-hang.json public/games && git commit');
process.exit(0);
