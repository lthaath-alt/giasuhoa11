/**
 * Sao lưu toàn bộ Firestore ra JSON, ngay trên máy đang chạy. CHỈ ĐỌC.
 *
 * Chạy:
 *   npm run sao-luu
 *   npm run sao-luu -- --hien        (hiện chữ khi gõ mật khẩu)
 *
 * ─── Vì sao có tệp này ──────────────────────────────────────────────────────
 * Đợt P0 (22/09/2026) sẽ sửa prompt, sửa máy trạng thái sư phạm và đụng tới
 * đường ghi `chats`. Nguyên tắc số 1 của chủ đề tài: có bản sao trước đã. Dự án
 * chạy trên bậc miễn phí nên KHÔNG có bản sao tự động nào của Firebase — thứ
 * duy nhất đang giữ lịch sử là `public/bank/ngan-hang.json`, và nó chỉ chụp
 * ngân hàng câu hỏi, không chụp `users`, `chats`, `progress` hay `bai_nop`.
 *
 * ─── Vì sao nó không được ghi một chữ nào ───────────────────────────────────
 * Nó đăng nhập bằng tài khoản giáo viên, tức tài khoản có quyền sửa ngân hàng
 * câu hỏi và sổ lớp. Một lệnh ghi lọt vào đây biến công cụ cứu dữ liệu thành
 * công cụ phá dữ liệu, và nó chạy đúng lúc người ta tin nó nhất: ngay trước
 * một đợt sửa lớn, khi chưa có bản sao nào khác để mà quay về.
 * `npm run kiem-tra:an-ninh` canh điều đó, và nó quét cả chú thích — nên trong
 * tệp này đừng viết tên một hàm ghi ra, kể cả để làm ví dụ.
 *
 * ─── Tài khoản ─────────────────────────────────────────────────────────────
 * `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`, cùng lối với
 * `sua:cau-hoi`; thiếu thì hỏi ngay tại máy, hiện dấu sao. KHÔNG nhận mật khẩu
 * qua tham số dòng lệnh — dòng lệnh nằm trong lịch sử shell và trong danh sách
 * tiến trình của cả máy.
 *
 * Cần vai `teacher` trở lên: luật chặn `list` trên `users`, `bai_nop` và
 * `progress`, nên chạy bằng tài khoản học sinh sẽ ra một bản sao rỗng ở đúng
 * những chỗ đáng giá nhất.
 *
 * ─── Bản sao ra nằm ở đâu, và vì sao không lên git ──────────────────────────
 * `sao-luu/<YYYY-MM-DD-HHmm>/<collection>.json`, kèm `README.txt` ghi giờ, tài
 * khoản và số tài liệu từng collection. `.gitignore` chặn `sao-luu/` vì bản
 * sao mang email, tên thật và toàn bộ hội thoại của học sinh với gia sư.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { GOC, docEnv, cauHinh, thieuCauHinh } from './ngan-hang-chung.mts';
import { hoi, hoiKin } from './hoi-ban-phim.mts';

/**
 * Toàn bộ collection dự án đang dùng, đối chiếu ngày 22/09/2026 với HAI nguồn
 * cho khớp nhau: các hằng `COL_*` trong `src/` và các mục `match /…/` trong
 * `firestore.rules`. Cả hai nguồn ra đúng 15 cái này, không hơn không kém.
 *
 * Dự án KHÔNG dùng subcollection nào (đã ghi trong `firestore.rules`, khối cấm
 * ở cuối tệp), nên đọc phẳng từng collection là đủ. Ngày nào có subcollection
 * thì phép đọc này sẽ bỏ sót IM LẶNG — thêm collection mới thì thêm vào đây,
 * cùng lúc với lúc thêm luật cho nó.
 */
const COLLECTIONS = [
  // Nội dung học — đọc công khai
  'bank_questions', 'questions', 'curriculum_chapters', 'exams', 'equations',
  'matrix_resources', 'system_settings', 'schools',
  // Dữ liệu người — cần đăng nhập, phần lớn cần vai giáo viên mới `list` được
  'users', 'classes', 'progress', 'chats', 'bai_nop', 'quan_tri',
  // Hạn mức chat. Luật chỉ cho mỗi người đọc bản ghi của CHÍNH MÌNH, không cho
  // `list` — nên chỗ này gần như chắc chắn báo `permission-denied`. Vẫn giữ
  // trong danh sách để bản sao nói rõ là "không lấy được", chứ không lặng lẽ
  // thiếu một collection.
  'gioi_han_chat',
];

const cacCo = process.argv.slice(2);
const hienMatKhau = cacCo.includes('--hien');

const env = docEnv();
const thieuCH = thieuCauHinh(env);
if (thieuCH.length) {
  console.error(`Thiếu cấu hình Firebase: ${thieuCH.join(', ')}`);
  process.exit(1);
}

let email = env.GIAO_VIEN_EMAIL ?? '';
let matKhau = env.GIAO_VIEN_MATKHAU ?? '';

if (email && matKhau) {
  console.log(`Dùng tài khoản trong .env.local: ${email}`);
} else {
  if (email || matKhau) {
    console.log('(.env.local mới có một nửa — cần CẢ GIAO_VIEN_EMAIL lẫn GIAO_VIEN_MATKHAU)');
  }
  console.log('Cần vai giáo viên trở lên: luật chặn `list` trên `users`, `bai_nop`, `progress`.');
  email = await hoi('Email : ');
  if (!email) { console.error('Chưa nhập email.'); process.exit(1); }
  matKhau = await hoiKin(hienMatKhau ? 'Mật khẩu (HIỆN CHỮ): ' : 'Mật khẩu (hiện dấu sao): ', hienMatKhau);
  if (!matKhau) { console.error('Chưa nhập mật khẩu.'); process.exit(1); }
}

const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
const db = getFirestore(app);
const auth = getAuth(app);

try {
  await signInWithEmailAndPassword(auth, email, matKhau);
} catch (e) {
  /* KHÔNG in lại email/mật khẩu vào thông báo lỗi. */
  console.error(`\nĐăng nhập không được: ${(e as { code?: string }).code ?? 'lỗi không rõ'}`);
  process.exit(1);
}
const uidToi = auth.currentUser?.uid ?? '';
console.log(`Đã đăng nhập. uid: ${uidToi || '(không rõ)'}`);

/* In VAI ra rồi dừng luôn nếu là học sinh. Không có bước này thì bản sao vẫn
   chạy tới cuối, vẫn in "Xong", chỉ là bốn tệp đáng giá nhất rỗng — và người
   chạy chỉ phát hiện ra vào đúng hôm cần khôi phục. */
let vai = '(không đọc được)';
if (uidToi) {
  try {
    vai = String((await getDoc(doc(db, 'users', uidToi))).data()?.role ?? '(không rõ)');
  } catch {
    /* Hồ sơ đọc không được thì cứ chạy tiếp — luật sẽ trả lời thay ở từng
       collection, và README.txt sẽ ghi lại từng chỗ bị từ chối. */
  }
}
console.log(`Vai: ${vai}`);
if (vai === 'student') {
  console.error('Vai `student` không `list` được `users`/`bai_nop`/`progress`.');
  console.error('Bản sao sẽ rỗng ở đúng những chỗ cần nhất. Dừng lại trước khi tốn công.');
  await signOut(auth).catch(() => { /* thoát được thì tốt, không thì thôi */ });
  process.exit(1);
}

/* Mốc thời gian theo giờ ĐỊA PHƯƠNG, không phải UTC: người chạy đối chiếu thư
   mục với đồng hồ trên máy mình. Có cả giờ và phút chứ không chỉ ngày — bài
   học số 9 trong CLAUDE.md, tên tệp chỉ có ngày đã từng ghi đè mất một báo cáo
   thật vì chạy hai lượt trong cùng một ngày. */
const n = new Date();
const hai = (v: number) => String(v).padStart(2, '0');
const moc = `${n.getFullYear()}-${hai(n.getMonth() + 1)}-${hai(n.getDate())}`
  + `-${hai(n.getHours())}${hai(n.getMinutes())}`;
const thuMuc = join(GOC, 'sao-luu', moc);
mkdirSync(thuMuc, { recursive: true });

console.log(`\nĐọc ${COLLECTIONS.length} collection…\n`);

const dem: Record<string, number | string> = {};
let soLoi = 0;

for (const ten of COLLECTIONS) {
  try {
    const anh = await getDocs(collection(db, ten));
    /* `__id` chứ không phải `id`: vài collection đã có sẵn trường `id` riêng
       trong dữ liệu (xem `bai_nop`, luật đòi `d.id == id`), và ghi đè nó là
       bản sao nói dối về chính thứ nó đang chụp. */
    const hang = anh.docs.map(d => ({ __id: d.id, ...d.data() }));
    writeFileSync(join(thuMuc, `${ten}.json`), JSON.stringify(hang, null, 1), 'utf8');
    dem[ten] = hang.length;
    console.log(`  ${ten.padEnd(20)} ${String(hang.length).padStart(5)} tài liệu`);
  } catch (e) {
    /* Không đọc được thì GHI LẠI, đừng nuốt im: một bản sao thiếu collection mà
       không ai biết còn tệ hơn không có bản sao, vì nó cho người ta cảm giác an
       toàn giả. `permission-denied` ở đây thường nghĩa là tài khoản chưa đủ vai,
       hoặc luật không cho `list` trên collection đó. */
    const loi = (e as { code?: string }).code ?? (e as Error).message;
    dem[ten] = `LỖI: ${loi}`;
    soLoi++;
    console.warn(`  ${ten.padEnd(20)}   ${dem[ten]}`);
  }
}

writeFileSync(join(thuMuc, 'README.txt'),
  [
    `Sao lưu Firestore — dự án giasuhoa11`,
    `Lúc      : ${n.toISOString()}  (giờ máy: ${n.toLocaleString()})`,
    `Tài khoản: ${email}  (vai: ${vai})`,
    `Lệnh     : npm run sao-luu`,
    '',
    'CHỈ ĐỌC — script không ghi gì lên Firestore.',
    'Tệp này CHỨA EMAIL VÀ HỘI THOẠI CỦA HỌC SINH. Không commit, không gửi đi.',
    '',
    'Số tài liệu từng collection:',
    ...Object.entries(dem).map(([k, v]) => `  ${k.padEnd(20)} ${v}`),
    '',
  ].join('\n'), 'utf8');

/* ── Đọc lại từ đĩa để xác nhận, đừng tin thông báo của chính mình ──────────
   Bài học số 1 trong CLAUDE.md: đã có lần script in ra "thành công" trong khi
   chưa ghi được gì. Ở đây rủi ro thật là đĩa đầy hoặc quyền ghi thư mục —
   `writeFileSync` ném thì thấy ngay, nhưng một tệp ghi DỞ thì không. */
console.log('\nĐọc lại từ đĩa để xác nhận:');
let khop = 0;
let can = 0;
for (const [ten, v] of Object.entries(dem)) {
  if (typeof v !== 'number') continue;
  can++;
  try {
    const lai = JSON.parse(readFileSync(join(thuMuc, `${ten}.json`), 'utf8')) as unknown[];
    const dung = Array.isArray(lai) && lai.length === v;
    if (dung) khop++;
    console.log(`  ${dung ? 'ĐÚNG' : 'SAI '}  ${ten.padEnd(20)} ${lai.length}/${v}`);
  } catch (e) {
    console.log(`  SAI   ${ten.padEnd(20)} không đọc lại được: ${(e as Error).message}`);
  }
}

await signOut(auth).catch(() => { /* thoát được thì tốt, không thì thôi */ });

console.log(`\n${'─'.repeat(70)}`);
console.log(`Thư mục : sao-luu/${moc}`);
console.log(`Đọc được: ${can}/${COLLECTIONS.length} collection · đọc lại khớp: ${khop}/${can}`);
if (soLoi) {
  console.log(`\n${soLoi} collection KHÔNG lấy được — xem README.txt trong thư mục trên.`);
  console.log('Nếu chỗ thiếu là `users`/`chats`/`progress`/`bai_nop` thì bản sao này CHƯA đủ dùng.');
}

/* Firestore giữ kết nối mở nên Node không tự thoát — phải gọi tường minh. Mã
   thoát khác 0 khi bản sao không trọn vẹn, để còn xâu chuỗi được với `&&`. */
process.exit(khop === can && !soLoi ? 0 : 1);
