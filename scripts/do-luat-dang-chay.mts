/**
 * Luật đang CHẠY trên Firebase có khớp `firestore.rules` trong git không?
 *
 * Chạy:  npm run do:luat                    (mặc định: bai_nop, de_giao)
 *        npm run do:luat -- de_giao classes
 *
 * CHỈ ĐỌC. Không ghi, không xoá gì.
 *
 * VÌ SAO CÓ TỆP NÀY (22/09/2026). Tệp `firestore.rules` trong git chỉ là bản
 * thảo; luật đang chạy nằm trên Firebase Console và chỉ đổi khi có người bấm
 * Publish. Khối bắt-tất-cả ở cuối là `allow read, write: if false`, nên một
 * collection MỚI thêm vào tệp mà chưa publish thì bị chặn sạch — và triệu
 * chứng là "bấm nút không có tác dụng", không phải một thông báo nói rõ.
 *
 * Hôm đó mất một lượt gỡ rối cho đúng chuyện này: `de_giao` vừa thêm vào tệp,
 * giáo viên bấm "Giao đề" thì Firebase từ chối. Đọc mã không trả lời được câu
 * hỏi "luật nào đang chạy" — phải hỏi máy chủ. Đây là bài học số 9 trong mục
 * "Rút kinh nghiệm": cái gì hỏi được máy chủ thì đừng suy ra từ mã nguồn.
 *
 * Cách đọc kết quả: collection ĐỌC ĐƯỢC nghĩa là luật của nó đã publish.
 * BỊ TỪ CHỐI nghĩa là hoặc chưa publish, hoặc luật cố tình chặn vai này —
 * nên luôn đo kèm một collection ĐỐI CHỨNG đã biết chắc là publish rồi.
 */
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { cauHinh, docEnv, thieuCauHinh } from './ngan-hang-chung.mts';

const COL_MAC_DINH = ['bai_nop', 'de_giao'];
const cols = process.argv.slice(2).filter(a => !a.startsWith('-'));
const canDo = cols.length ? cols : COL_MAC_DINH;

const env = docEnv();
const thieu = thieuCauHinh(env);
if (thieu.length) {
  console.error(`Thiếu cấu hình Firebase: ${thieu.join(', ')}`);
  process.exit(1);
}

/* Tài khoản giáo viên, lấy từ `.env.local` như `sua:cau-hoi`. KHÔNG nhận mật
   khẩu qua tham số dòng lệnh — dòng lệnh nằm trong lịch sử shell và trong danh
   sách tiến trình của cả máy. */
const email = (env.GIAO_VIEN_EMAIL || '').trim();
const matKhau = env.GIAO_VIEN_MATKHAU || '';
if (!email || !matKhau) {
  console.log('\n  BỎ QUA — thiếu GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');
  console.log('  (xem .env.example)\n');
  process.exit(0);
}

const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
const db = getFirestore(app);
const auth = getAuth(app);

console.log('\n== Luật đang chạy trên Firebase ==\n');

try {
  await signInWithEmailAndPassword(auth, email, matKhau);
  console.log(`  Đăng nhập: OK (${email})`);
} catch (e) {
  console.error(`  Đăng nhập THẤT BẠI: ${(e as { code?: string })?.code || e}`);
  process.exit(1);
}

const chan: string[] = [];
for (const col of canDo) {
  try {
    const anh = await getDocs(collection(db, col));
    console.log(`  \`${col}\`: ĐỌC ĐƯỢC — ${anh.size} tài liệu`);
  } catch (e) {
    const ma = (e as { code?: string })?.code || String(e);
    console.log(`  \`${col}\`: BỊ TỪ CHỐI (${ma})`);
    chan.push(col);
  }
}

await signOut(auth);

if (chan.length) {
  console.log(`\n  ${chan.length} collection bị chặn: ${chan.join(', ')}`);
  console.log('  Nếu khối luật của chúng ĐÃ có trong firestore.rules thì luật chưa được publish:');
  console.log('      npx firebase deploy --only firestore:rules\n');
} else {
  console.log('\n  Mọi collection đo được đều đọc được — luật đã publish.\n');
}

/* KHÔNG thoát bằng mã lỗi: đây là công cụ ĐO, không phải hàng rào. Để nó trả
   mã khác 0 thì ai đó sẽ nối vào `npm run kiem-tra`, và chuỗi kiểm sẽ đỏ trên
   mọi máy không có `.env.local`. */
process.exit(0);
