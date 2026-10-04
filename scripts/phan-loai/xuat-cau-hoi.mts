/**
 * Xuất câu hỏi THẬT của học sinh một lớp thành câu chưa gán nhãn cho bộ phân
 * loại ý định (03/10/2026). CHỈ ĐỌC Firestore.
 *
 * Chạy (từ gốc repo):
 *   npm run xuat:cau-hoi -- --lop 11A3            chạy thử: in số câu + 3 câu đã che
 *   npm run xuat:cau-hoi -- --lop 11A3 --that     ghi tệp
 *   tuỳ chọn: --tu 2026-10-01 --den 2026-10-31 (lọc ngày), --hat 42 (thứ tự xáo),
 *             --dong-y D:\rieng\dong-y.csv (chỉ lấy các em có email trong tệp,
 *             dùng khi có em rút lại), --hien (hiện chữ khi gõ mật khẩu)
 *
 * ─── Lớp nào được xuất ──────────────────────────────────────────────────────
 * Chỉ lớp có trong DONG_Y bên dưới: chủ nhiệm đề tài cho phép VÀ phụ huynh đã
 * đồng ý. Thêm lớp mới thì thêm một dòng kèm ngày đồng ý, sau khi nhóm đã lưu
 * giấy đồng ý (xem quy tắc 1, HUONG-DAN-GAN-NHAN.md).
 *
 * ─── Ra gì ──────────────────────────────────────────────────────────────────
 * Một đợt `scripts/phan-loai/du-lieu/that/dot-<ngày>/` (xem ghiDot): chua-gan.csv (cột
 * như nhan.csv, nhãn trống, nguồn "that", thêm cột ngữ cảnh chemai_vua_noi = tin gia sư ngay
 * trước tin của em, đã che, chỉ để người gán đọc) kèm .meta.txt ghi nguồn và sự đồng ý để trích
 * vào báo cáo, và a.csv, b.csv cho hai người gán. Bước sau: `npm run phan-loai:huan-luyen
 * -- <thư mục đợt>` (nap_dot.py). Chỉ có nội dung câu đã che (xem loc-cau-that.mts): không
 * email, không mã học sinh, không bài, không giờ gửi, thứ tự đã xáo. `.gitignore`
 * chặn thư mục `that/`: bước che tên bằng máy không bắt hết, nên tệp này vẫn là
 * dữ liệu riêng tư.
 *
 * ─── Tài khoản ──────────────────────────────────────────────────────────────
 * Cùng lối với `xuat:nghien-cuu`: vai giáo viên trở lên (luật `chats` cho
 * `laGiaoVien()` đọc), email và mật khẩu lấy từ `.env.local` nếu có, không thì hỏi
 * tại máy. Không nhận mật khẩu qua tham số dòng lệnh. Script này không ghi một
 * chữ nào lên Firestore; `kiem-tra:an-ninh` quét cả chú thích, nên đừng viết tên
 * hàm ghi nào vào tệp này.
 */
import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { GOC, docEnv, cauHinh, thieuCauHinh } from '../ngan-hang-chung.mts';
import { hoi, hoiKin } from '../hoi-ban-phim.mts';
import {
  NGUON_GV, NGUON_HS, NGU_CANH_TOI_DA, cauDaCo, chonCauHoi, danhSachTen, docDanhSachDongY, ghiDot, laThanhVienLop, xao, type TinTho,
} from './loc-cau-that.mts';
import type { SchoolClass, User } from '../../src/features/auth/types';

/** Lớp được phép xuất → ghi chú đồng ý đi vào tệp .meta.txt. */
const DONG_Y: Record<string, string> = {
  '11A3': 'chủ nhiệm đề tài cho phép, phụ huynh đồng ý (hỏi ngày 03/10/2026)',
};

// ── Tham số ─────────────────────────────────────────────────────────────────

const co = process.argv.slice(2);
const layCo = (ten: string): string | undefined => {
  const i = co.indexOf(ten);
  return i >= 0 ? co[i + 1] : undefined;
};
const ghiThat = co.includes('--that');
/* Lấy thêm câu của tài khoản giáo viên / quản trị gửi gia sư (nguồn "that-gv", tách khỏi câu
   học sinh khi báo cáo). Người lớn, dùng hệ thống để soạn bài và thử gia sư. */
const kemGiaoVien = co.includes('--kem-giao-vien');
const hienMatKhau = co.includes('--hien');
const tenLop = layCo('--lop');
const tepDongY = layCo('--dong-y');
const tuNgay = layCo('--tu');
const denNgay = layCo('--den');
const hat = Number(layCo('--hat') ?? 42) || 42;

if (!tenLop) {
  console.error('Thiếu --lop. Ví dụ: npm run xuat:cau-hoi -- --lop 11A3');
  process.exit(1);
}
const ghiChuDongY = DONG_Y[tenLop];
if (!ghiChuDongY) {
  console.error(`Lớp "${tenLop}" chưa có trong danh sách đồng ý của script (đang có: ${Object.keys(DONG_Y).join(', ')}).`);
  console.error('Chỉ thêm lớp sau khi chủ nhiệm cho phép và phụ huynh đồng ý — sửa hằng DONG_Y trong xuat-cau-hoi.mts.');
  process.exit(1);
}
const NGAY = /^\d{4}-\d{2}-\d{2}$/;
for (const [ten, v] of [['--tu', tuNgay], ['--den', denNgay]] as const) {
  if (v !== undefined && !NGAY.test(v)) {
    console.error(`${ten} phải viết dạng YYYY-MM-DD, đang là "${v}".`);
    process.exit(1);
  }
}

let emailTrongTep: Set<string> | null = null;
if (tepDongY) {
  try {
    emailTrongTep = new Set(docDanhSachDongY(readFileSync(tepDongY, 'utf8')).map(n => n.email.toLowerCase()));
  } catch (e) {
    console.error(`Không đọc được tệp đồng ý: ${(e as Error).message}`);
    process.exit(1);
  }
}

/* Câu đã có trong các tệp gán nhãn và các đợt xuất trước, để đợt sau không xuất lại. */
const THU_MUC = join(GOC, 'scripts/phan-loai/du-lieu');
const RA = join(THU_MUC, 'that');
const daCo = cauDaCo(THU_MUC);

// ── Đăng nhập ───────────────────────────────────────────────────────────────

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
  console.log('Cần vai giáo viên trở lên: luật chỉ cho giáo viên đọc `chats` và `users` của cả lớp.');
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
  console.error(`\nĐăng nhập không được: ${(e as { code?: string }).code ?? 'lỗi không rõ'}`);
  process.exit(1);
}
const thoat = async (ma: number): Promise<never> => {
  await signOut(auth).catch(() => { /* thoát được thì tốt */ });
  process.exit(ma);   // Firestore giữ kết nối mở nên Node không tự thoát
};
const uid = auth.currentUser?.uid ?? '';
const vai = uid ? String((await getDoc(doc(db, 'users', uid)).catch(() => null))?.data()?.role ?? '(không rõ)') : '(không rõ)';
console.log(`Đã đăng nhập. Vai: ${vai}`);
if (vai === 'student') {
  console.error('Vai `student` không đọc được `chats` của bạn khác. Dừng.');
  await thoat(1);
}

// ── Đọc lớp, học sinh, tin nhắn ─────────────────────────────────────────────

const docHet = async <T,>(ten: string): Promise<T[]> => {
  try {
    const anh = await getDocs(collection(db, ten));
    return anh.docs.map(d => ({ id: d.id, ...d.data() }) as T);
  } catch (e) {
    console.error(`Không đọc được \`${ten}\`: ${(e as { code?: string }).code ?? (e as Error).message}`);
    return thoat(1);
  }
};

const lop = (await docHet<SchoolClass>('classes')).filter(c => (c.name ?? '').trim().toUpperCase() === tenLop.toUpperCase());
if (lop.length !== 1) {
  console.error(lop.length ? `Có ${lop.length} lớp tên "${tenLop}" (khác trường?). Script chưa phân biệt được — dừng.`
    : `Không có lớp nào tên "${tenLop}".`);
  await thoat(1);
}
const nguoiDung = await docHet<User>('users');
const hocSinh = nguoiDung.filter(u => u.role === 'student');
const thanhVien = hocSinh.filter(u => laThanhVienLop(u, lop[0]));
let emailDuocLay = thanhVien.map(u => (u.email ?? '').toLowerCase()).filter(Boolean);
console.log(`Lớp ${tenLop}: ${thanhVien.length} học sinh.`);
if (emailTrongTep) {
  const truoc = emailDuocLay.length;
  emailDuocLay = emailDuocLay.filter(e => emailTrongTep!.has(e));
  console.log(`  Lọc theo tệp --dong-y: còn ${emailDuocLay.length}/${truoc} em.`);
}
const tin = await docHet<TinTho>('chats');

const hoTenCanChe = nguoiDung.map(u => u.name ?? '');   // che cả tên giáo viên
const { cau: cauHs, nguCanh: nguCanhHs, dem } = chonCauHoi(tin, { emailDuocLay, hoTenCanChe, daCo, tuNgay, denNgay, hat });
let cauGv: string[] = [];
let nguCanhGv: string[] = [];
if (kemGiaoVien) {
  const emailGv = nguoiDung.filter(u => u.role === 'teacher' || u.role === 'admin' || u.role === 'school_admin')
    .map(u => (u.email ?? '').toLowerCase()).filter(Boolean);
  ({ cau: cauGv, nguCanh: nguCanhGv } = chonCauHoi(tin, { emailDuocLay: emailGv, hoTenCanChe, daCo: [...daCo, ...cauHs], tuNgay, denNgay, hat }));
  console.log(`Tài khoản giáo viên / quản trị: ${emailGv.length}; câu mới của họ: ${cauGv.length} (nguồn ${NGUON_GV}).`);
}
/* Xáo chung hai nguồn để thứ tự dòng không lộ nguồn; cột nguon trong chua-gan.csv vẫn giữ. */
const cap = xao([...cauHs.map((c, i) => [c, NGUON_HS, nguCanhHs[i]] as const),
  ...cauGv.map((c, i) => [c, NGUON_GV, nguCanhGv[i]] as const)], hat);
const cau = cap.map(([c]) => c);
const nguonCau = cap.map(([, n]) => n);
const nguCanh = cap.map(([, , g]) => g);
console.log(`\nTin người dùng gửi gia sư (mọi lớp, mọi vai): ${dem.tinEm}`);
console.log(`  ngoài lớp ${tenLop}${emailTrongTep ? ' / ngoài tệp đồng ý' : ''}: ${dem.ngoaiLop}`);
console.log(`  ngoài khoảng ngày: ${dem.ngoaiNgay}`);
console.log(`  rỗng sau khi che: ${dem.rong}`);
console.log(`  trùng câu đã gán / đã xuất: ${dem.trungDaCo}`);
console.log(`  trùng nhau trong đợt này: ${dem.trungNhau}`);
console.log(`Câu mới để gán nhãn: ${cau.length}${kemGiaoVien ? ` (${cauHs.length} học sinh + ${cauGv.length} giáo viên/quản trị)` : ''}`);
console.log(`  có tin gia sư ngay trước (cột chemai_vua_noi): ${nguCanh.filter(Boolean).length}`);

if (!ghiThat) {
  console.log('\nChạy thử. Ba câu đầu (đã che):');
  for (const c of cau.slice(0, 3)) console.log(`  ${c.length > 120 ? c.slice(0, 120) + '…' : c}`);
  console.log('\nThêm --that để ghi tệp.');
  await thoat(0);
}

if (!cau.length) {
  console.log('\nKhông có câu mới, không tạo đợt.');
  await thoat(0);
}
const ngay = new Date().toISOString().slice(0, 10);
const dsTen = danhSachTen(hocSinh.map(u => u.name ?? ''));
const dot = ghiDot(RA, ngay, cau, [
  `Nguồn   : collection chats, tin học sinh lớp ${tenLop} gửi gia sư (${cauHs.length} câu, nguồn ${NGUON_HS})`
    + (kemGiaoVien ? ` + tài khoản giáo viên/quản trị (${cauGv.length} câu, nguồn ${NGUON_GV})` : ''),
  `Đồng ý  : ${ghiChuDongY}`,
  `Lọc thêm: ${emailTrongTep ? `tệp --dong-y, ${emailDuocLay.length} em` : 'không'}`,
  `Khoảng  : ${tuNgay ?? 'đầu'} → ${denNgay ?? 'nay'}`,
  `Xuất lúc: ${new Date().toISOString()}  (hạt giống xáo: ${hat})`,
  `Số câu  : ${cau.length} (bỏ ${dem.trungDaCo} câu trùng câu đã gán, ${dem.trungNhau} câu trùng nhau)`,
  'Ẩn danh : bỏ email, mã học sinh, bài, giờ gửi; xáo thứ tự; che email, số điện thoại,',
  '          họ tên học sinh có trong hồ sơ. Tên một chữ, biệt danh, tên trường KHÔNG che được:',
  '          người gán nhãn đọc lại và che tay.',
  'Ngữ cảnh: cột chemai_vua_noi = tin gia sư ngay trước tin của em trong cùng cuộc chat (cùng bài),',
  `          che như trên, giữ ${NGU_CANH_TOI_DA} ký tự cuối; có ở ${nguCanh.filter(Boolean).length}/${cau.length} câu.`,
  '          Chỉ để người gán đọc; mô hình chỉ học cột tin_nhan.',
], dsTen, nguonCau, nguCanh);
const dotRel = relative(GOC, dot).replace(/\\/g, '/');
console.log(`\nĐã tạo đợt ${cau.length} câu: ${dotRel}/`);
console.log(`  a.csv, b.csv  hai bản cho hai người gán (không có cột nguồn)`);
console.log('  cột chemai_vua_noi: tin gia sư ngay trước tin của em, CHỈ để đọc khi gán; nhãn vẫn gán cho cột tin_nhan');
console.log(`  chua-gan.csv  bản gốc; chua-gan.meta.txt chép vào báo cáo`);
console.log(`Danh sách ${dsTen.length} tên học sinh (chỉ tên) để dò từ vựng: scripts/phan-loai/du-lieu/that/ten-hoc-sinh.txt`);
console.log('\nBước tiếp:');
console.log('  1. Đọc lại a.csv (cả cột chemai_vua_noi), che tay tên, biệt danh, tên trường máy còn sót; sửa y hệt trong b.csv và chua-gan.csv.');
console.log('  2. Hai bạn gán ĐỘC LẬP: một bạn điền cột nhan + nguoi_gan trong a.csv, bạn kia trong b.csv.');
console.log(`  3. npm run phan-loai:huan-luyen -- ${dotRel}`);
console.log(`DOT_MOI=${dot}`);   // hang_ngay.py đọc dòng này
await thoat(0);
