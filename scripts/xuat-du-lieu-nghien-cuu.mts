/**
 * P0-5 — xuất dữ liệu nghiên cứu từ `chats`. CHỈ ĐỌC.
 *
 * Chạy:
 *   npm run xuat:nghien-cuu
 *   npm run xuat:nghien-cuu -- --tu 2026-09-01 --den 2026-09-27
 *   npm run xuat:nghien-cuu -- --mau 30          (rút 30 lượt cho giáo viên chấm tay)
 *   npm run xuat:nghien-cuu -- --mau 30 --hat 12345   (rút lại ĐÚNG mẫu cũ)
 *   npm run xuat:nghien-cuu -- --hien            (hiện chữ khi gõ mật khẩu)
 *
 * ─── Hai tệp ra, và vì sao là hai ──────────────────────────────────────────
 *   theo-hoc-sinh.csv  mỗi em một dòng, chỉ số tổng hợp, KHÔNG có email và
 *                      KHÔNG có một chữ nào của hội thoại. Đây là tệp đem đi
 *                      phân tích và trích vào báo cáo.
 *   mau-cham.csv       N lượt rút ngẫu nhiên, CÓ nguyên văn câu hỏi và câu trả
 *                      lời, kèm hai cột trống để giáo viên tự chấm đúng/sai
 *                      kiến thức. Nhãn `loai_luot` trong dữ liệu là do MÔ HÌNH
 *                      tự gắn, tức tự báo cáo; không có người chấm lại một mẫu
 *                      thì mọi tỉ lệ Socratic trong báo cáo đều là lời khai của
 *                      chính bị cáo.
 *
 * ─── Vì sao nó không được ghi một chữ nào lên Firestore ────────────────────
 * Cùng lý do với `npm run sao-luu`: nó đăng nhập bằng tài khoản giáo viên, tức
 * tài khoản sửa được ngân hàng câu hỏi và sổ lớp. Một lệnh ghi lọt vào đây thì
 * công cụ dựng ra để ĐỌC dữ liệu thực nghiệm trở thành công cụ làm hỏng chính
 * dữ liệu ấy — và 1554 câu hỏi cùng toàn bộ hội thoại lớp 11A3 không có bản sao
 * nào khác ngoài thư mục `sao-luu/`. `npm run kiem-tra:an-ninh` canh điều đó và
 * nó quét cả chú thích, nên trong tệp này đừng viết tên một hàm ghi ra, kể cả
 * để làm ví dụ.
 *
 * ─── ĐỒNG Ý THAM GIA NGHIÊN CỨU: chưa lọc được ─────────────────────────────
 * P1-7 (hỏi và lưu sự đồng ý của học sinh và phụ huynh) CHƯA làm, nên hồ sơ
 * `users` chưa có trường `dongYNghienCuu`. Bản xuất này vì thế gồm CẢ những em
 * chưa từng được hỏi. Các em là người chưa thành niên, nên đó không phải một
 * chi tiết kỹ thuật: script in cảnh báo ra màn hình, ghi vào README.txt, và
 * ghi `CHUA_LOC_DONG_Y` vào CỘT ĐẦU của từng dòng trong cả hai tệp CSV. Cảnh
 * báo chỉ nói trên màn hình thì cuộn qua là mất, còn tệp CSV thì sống tiếp và
 * đi kèm báo cáo.
 * Khi P1-7 xong, script tự phát hiện trường mới và DỪNG lại, bắt người sửa nó
 * thêm phép lọc — xem khối "đã có dấu đồng ý" bên dưới.
 *
 * ─── Tài khoản ─────────────────────────────────────────────────────────────
 * `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`, cùng lối với
 * `sao-luu` và `sua:cau-hoi`; thiếu thì hỏi ngay tại máy, hiện dấu sao. KHÔNG
 * nhận mật khẩu qua tham số dòng lệnh — dòng lệnh nằm trong lịch sử shell và
 * trong danh sách tiến trình của cả máy. Cần vai `teacher` trở lên: luật chặn
 * `list` trên `chats` và `users`.
 *
 * ─── Bản xuất nằm ở đâu, và vì sao không lên git ───────────────────────────
 * `xuat-nghien-cuu/<YYYY-MM-DD-HHmm>/`. `.gitignore` chặn thư mục đó: tệp
 * mau-cham.csv mang nguyên văn những gì học sinh gõ cho gia sư, và mã `user_hash`
 * là giả danh chứ không phải ẩn danh — ai có danh sách email của lớp là băm lại
 * được để biết dòng nào của em nào.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { GOC, docEnv, cauHinh, thieuCauHinh } from './ngan-hang-chung.mts';
import { hoi, hoiKin } from './hoi-ban-phim.mts';
import { gopTheoHocSinh, csvHocSinh, bocCsv, userHash } from '../src/features/tutor/services/telemetryService';
import type { ChatMessage } from '../src/features/auth/types';

/** Giá trị cột `canh_bao` ở MỌI dòng. Đổi chuỗi này thì đổi cả README.txt. */
const CANH_BAO = 'CHUA_LOC_DONG_Y';

// ── Tham số dòng lệnh ───────────────────────────────────────────────────────

const co = process.argv.slice(2);
const layCo = (ten: string): string | undefined => {
  const i = co.indexOf(ten);
  return i >= 0 ? co[i + 1] : undefined;
};
const hienMatKhau = co.includes('--hien');
const tuNgay = layCo('--tu');
const denNgay = layCo('--den');
const soMau = Number(layCo('--mau') ?? 0) || 0;
/* Hạt giống ghi vào README để rút lại ĐÚNG mẫu cũ. Một mẫu chấm không lặp lại
   được thì người phản biện không kiểm chứng được con số Cohen's κ trong báo cáo. */
const hat = Number(layCo('--hat') ?? 0) || Date.now();

const NGAY = /^\d{4}-\d{2}-\d{2}$/;
for (const [ten, v] of [['--tu', tuNgay], ['--den', denNgay]] as const) {
  if (v !== undefined && !NGAY.test(v)) {
    console.error(`${ten} phải viết dạng YYYY-MM-DD, đang là "${v}".`);
    process.exit(1);
  }
}
if (tuNgay && denNgay && tuNgay > denNgay) {
  console.error(`--tu (${tuNgay}) muộn hơn --den (${denNgay}); khoảng này không có ngày nào.`);
  process.exit(1);
}

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
  if (email || matKhau) {
    console.log('(.env.local mới có một nửa — cần CẢ GIAO_VIEN_EMAIL lẫn GIAO_VIEN_MATKHAU)');
  }
  console.log('Cần vai giáo viên trở lên: luật chặn `list` trên `chats` và `users`.');
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
let vai = '(không đọc được)';
if (uidToi) {
  try {
    vai = String((await getDoc(doc(db, 'users', uidToi))).data()?.role ?? '(không rõ)');
  } catch { /* luật sẽ trả lời thay ở từng collection bên dưới */ }
}
console.log(`Đã đăng nhập. Vai: ${vai}`);
if (vai === 'student') {
  console.error('Vai `student` không `list` được `chats`. Bản xuất sẽ rỗng — dừng trước khi tốn công.');
  await signOut(auth).catch(() => { /* thoát được thì tốt */ });
  process.exit(1);
}

const thoat = async (ma: number): Promise<never> => {
  await signOut(auth).catch(() => { /* thoát được thì tốt */ });
  /* Firestore giữ kết nối mở nên Node không tự thoát — phải gọi tường minh. */
  process.exit(ma);
};

// ── Đọc dữ liệu ─────────────────────────────────────────────────────────────

console.log('\nĐọc `chats`…');
let tin: ChatMessage[];
try {
  const anh = await getDocs(collection(db, 'chats'));
  tin = anh.docs.map(d => ({ id: d.id, ...d.data() }) as ChatMessage)
    .filter(m => typeof m.timestamp === 'string' && m.timestamp);
  console.log(`  ${anh.size} tài liệu, ${tin.length} tin có mốc thời gian đọc được.`);
} catch (e) {
  console.error(`  Không đọc được \`chats\`: ${(e as { code?: string }).code ?? (e as Error).message}`);
  await thoat(1);
}

/* Đọc `users` CHỈ để trả lời đúng một câu: dấu đồng ý tham gia nghiên cứu đã
   có chưa. Không lấy gì khác từ đó, và không có email nào đi vào bản xuất. */
console.log('Đọc `users` để kiểm dấu đồng ý tham gia nghiên cứu…');
let soHoSinh = 0;
let coDauDongY = false;
try {
  const anh = await getDocs(collection(db, 'users'));
  for (const d of anh.docs) {
    const u = d.data() as Record<string, unknown>;
    if (u.role === 'student') soHoSinh++;
    if (u.dongYNghienCuu !== undefined) coDauDongY = true;
  }
  console.log(`  ${anh.size} hồ sơ, trong đó ${soHoSinh} học sinh.`);
} catch (e) {
  console.warn(`  Không đọc được \`users\`: ${(e as { code?: string }).code ?? (e as Error).message}`);
  console.warn('  Bỏ qua — phần đếm học sinh trong README sẽ để trống.');
}

if (coDauDongY) {
  /* P1-7 đã làm xong sau khi script này ra đời. DỪNG chứ không tự đoán cách
     lọc: đoán sai theo hướng "lọc nhầm ra ít em" thì chỉ thiếu dữ liệu, nhưng
     đoán sai theo hướng ngược lại là đưa em chưa đồng ý vào số liệu nghiên cứu
     — và không có gì trong bản xuất cho thấy điều đó đã xảy ra. */
  console.error('\nHồ sơ `users` ĐÃ có trường `dongYNghienCuu` (P1-7 xong rồi).');
  console.error('Script này chưa biết lọc theo nó. Sửa nó trước khi xuất, đừng chạy tiếp:');
  console.error('  - chỉ giữ tin của những em có dấu đồng ý;');
  console.error('  - đổi cột `canh_bao` thành số hiệu đợt xin đồng ý;');
  console.error('  - sửa lại cảnh báo trong README.txt và trong chú thích đầu tệp.');
  await thoat(1);
}

// ── Gộp và ghi ──────────────────────────────────────────────────────────────

const dong = gopTheoHocSinh(tin, tuNgay, denNgay);
const trongKhoang = (ts: string) =>
  (!tuNgay || ts >= tuNgay) && (!denNgay || ts <= `${denNgay}T23:59:59.999Z`);
const tinTrongKhoang = tin.filter(m => trongKhoang(m.timestamp));

const n = new Date();
const hai = (v: number) => String(v).padStart(2, '0');
/* Mốc có cả giờ và phút, theo giờ máy — bài học số 9 trong CLAUDE.md: tên tệp
   chỉ có ngày đã từng ghi đè mất một báo cáo thật khi chạy hai lượt cùng ngày. */
const moc = `${n.getFullYear()}-${hai(n.getMonth() + 1)}-${hai(n.getDate())}`
  + `-${hai(n.getHours())}${hai(n.getMinutes())}`;
const thuMuc = join(GOC, 'xuat-nghien-cuu', moc);
mkdirSync(thuMuc, { recursive: true });

writeFileSync(join(thuMuc, 'theo-hoc-sinh.csv'), csvHocSinh(dong, CANH_BAO), 'utf8');
console.log(`\ntheo-hoc-sinh.csv : ${dong.length} học sinh, ${tinTrongKhoang.length} lượt trong khoảng.`);

// ── Mẫu cho giáo viên chấm tay ──────────────────────────────────────────────

/**
 * Một lượt gia sư kèm câu hỏi ngay trước nó trong CÙNG phiên. Chấm câu trả lời
 * mà không thấy câu hỏi thì người chấm phải đoán ngữ cảnh, và hai người chấm sẽ
 * đoán khác nhau — đúng thứ làm hỏng chỉ số đồng thuận.
 */
interface CapLuot { giaSu: ChatMessage; hocSinh?: ChatMessage }

function ghepCapLuot(ds: ChatMessage[]): CapLuot[] {
  const theoPhien = new Map<string, ChatMessage[]>();
  for (const m of ds) {
    const khoa = `${m.user_hash ?? userHash(m.userEmail) ?? ''}::${m.session_id ?? ''}`;
    const da = theoPhien.get(khoa);
    if (da) da.push(m); else theoPhien.set(khoa, [m]);
  }
  const cap: CapLuot[] = [];
  for (const ms of theoPhien.values()) {
    const xep = [...ms].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    let hocSinhGanNhat: ChatMessage | undefined;
    for (const m of xep) {
      if (m.sender === 'user') hocSinhGanNhat = m;
      else cap.push({ giaSu: m, hocSinh: hocSinhGanNhat });
    }
  }
  return cap;
}

/**
 * Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32). Dùng thay
 * `Math.random()` để cùng một `--hat` rút lại đúng mẫu cũ — mẫu chấm phải lặp
 * lại được thì người khác mới kiểm chứng được kết quả chấm.
 */
function taoBoSinh(hatGiong: number): () => number {
  let a = hatGiong >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chặn công thức Excel. Ô bắt đầu bằng `=`, `+`, `-`, `@` được Excel hiểu là
 * công thức, và học sinh gõ gì vào ô chat là ta chép thẳng vào đây — tin nội
 * dung do người dùng viết là đúng cái lỗ XSS mà dự án đã vá năm ngoái, chỉ
 * khác là lần này nó nổ trong Excel của giáo viên.
 */
const anToanExcel = (s: string): string => (/^[=+\-@\t\r]/.test(s) ? `'${s}` : s);

let soDongMau = 0;
if (soMau > 0) {
  const cap = ghepCapLuot(tinTrongKhoang);
  const sinh = taoBoSinh(hat);
  /* Xáo Fisher-Yates trên bản SAO, rồi cắt N đầu. Không dùng
     `sort(() => sinh() - 0.5)`: phép so sánh không nhất quán làm thuật toán sắp
     xếp trả về thứ tự lệch, mẫu ra không đều. */
  const xao = [...cap];
  for (let i = xao.length - 1; i > 0; i--) {
    const j = Math.floor(sinh() * (i + 1));
    [xao[i], xao[j]] = [xao[j], xao[i]];
  }
  const chon = xao.slice(0, soMau);
  soDongMau = chon.length;

  const cotMau = ['canh_bao', 'user_hash', 'session_id', 'lesson_id', 'timestamp', 'nhanh',
    'loai_luot_may_gan', 'cau_hoi_cua_em', 'tra_loi_cua_gia_su',
    'dung_sai_kien_thuc', 'loai_loi'];
  const dongMau = chon.map(c => [
    CANH_BAO,
    c.giaSu.user_hash ?? userHash(c.giaSu.userEmail) ?? '',
    c.giaSu.session_id ?? '',
    c.giaSu.lessonId,
    c.giaSu.timestamp,
    c.giaSu.nhanh ?? '',
    c.giaSu.loai_luot ?? '',
    anToanExcel(c.hocSinh?.content ?? ''),
    anToanExcel(c.giaSu.content ?? ''),
    '', '',                     // hai cột để giáo viên tự điền
  ].map(bocCsv).join(','));

  writeFileSync(join(thuMuc, 'mau-cham.csv'),
    '﻿' + [cotMau.join(','), ...dongMau].join('\n'), 'utf8');
  console.log(`mau-cham.csv      : ${soDongMau}/${cap.length} lượt, hạt giống ${hat}.`);
  if (soDongMau < soMau) console.log(`  (xin ${soMau} nhưng cả khoảng chỉ có ${cap.length} lượt gia sư)`);
}

writeFileSync(join(thuMuc, 'README.txt'), [
  'Bản xuất dữ liệu nghiên cứu — dự án giasuhoa11 (P0-5)',
  `Lúc      : ${n.toISOString()}  (giờ máy: ${n.toLocaleString()})`,
  `Tài khoản: ${email}  (vai: ${vai})`,
  `Khoảng   : ${tuNgay ?? '(từ đầu)'} → ${denNgay ?? '(tới nay)'}`,
  `Lệnh     : npm run xuat:nghien-cuu${tuNgay ? ` -- --tu ${tuNgay}` : ''}`
    + `${denNgay ? ` --den ${denNgay}` : ''}${soMau ? ` --mau ${soMau} --hat ${hat}` : ''}`,
  '',
  'CHỈ ĐỌC — script không ghi gì lên Firestore.',
  '',
  '*** CẢNH BÁO: CHƯA LỌC THEO SỰ ĐỒNG Ý THAM GIA NGHIÊN CỨU ***',
  'P1-7 chưa làm, hồ sơ học sinh chưa có trường `dongYNghienCuu`, nên bản xuất',
  'này gồm CẢ những em chưa từng được hỏi có đồng ý hay không. Các em là người',
  'chưa thành niên. Vì vậy:',
  '  - Không đưa số liệu này vào báo cáo nộp ra ngoài trước khi xin được sự đồng ý.',
  `  - Mọi dòng trong hai tệp CSV mang cột đầu \`canh_bao\` = ${CANH_BAO}.`,
  '  - `user_hash` là GIẢ DANH, không phải ẩn danh: ai có danh sách email của lớp',
  '    là băm lại được để biết dòng nào của em nào.',
  '',
  'Tệp:',
  `  theo-hoc-sinh.csv  ${dong.length} dòng — mỗi em một dòng, không có email, không có hội thoại.`,
  soMau
    ? `  mau-cham.csv       ${soDongMau} dòng — CÓ nguyên văn hội thoại, hai cột cuối để giáo viên chấm.`
    : '  mau-cham.csv       (không xuất — chạy lại với --mau N nếu cần)',
  '',
  `Số tin đọc được    : ${tin.length}`,
  `Số tin trong khoảng: ${tinTrongKhoang.length}`,
  `Số học sinh trong \`users\`: ${soHoSinh || '(không đọc được)'}`,
  '',
  'KHÔNG commit thư mục này. `.gitignore` chặn `xuat-nghien-cuu/`.',
  '',
].join('\n'), 'utf8');

// ── Đọc lại từ đĩa để xác nhận ──────────────────────────────────────────────

/* Bài học số 1 trong CLAUDE.md: đừng tin dòng chữ "xong" của chính script mình
   viết. Đếm lại số dòng trong tệp đã ghi, và kiểm BOM còn nguyên — một tệp mất
   BOM vẫn mở được, chỉ là tiếng Việt thành ký tự rác, và người mở sẽ đi sửa
   Excel chứ không nghĩ tới script này. */
console.log('\nĐọc lại từ đĩa để xác nhận:');
let hong = 0;
const canKiem: [string, number][] = [['theo-hoc-sinh.csv', dong.length]];
if (soMau > 0) canKiem.push(['mau-cham.csv', soDongMau]);

for (const [ten, soDongMong] of canKiem) {
  try {
    const noi = readFileSync(join(thuMuc, ten), 'utf8');
    const soDong = noi.split('\n').length - 1;      // trừ dòng tiêu đề
    const dungBom = noi.startsWith('﻿');
    const dung = dungBom && soDong === soDongMong;
    if (!dung) hong++;
    console.log(`  ${dung ? 'ĐÚNG' : 'SAI '}  ${ten.padEnd(20)} ${soDong}/${soDongMong} dòng`
      + `${dungBom ? '' : ' — THIẾU BOM, Excel sẽ hiện ký tự rác'}`);
  } catch (e) {
    hong++;
    console.log(`  SAI   ${ten.padEnd(20)} không đọc lại được: ${(e as Error).message}`);
  }
}

console.log(`\n${'─'.repeat(70)}`);
console.log(`Thư mục: xuat-nghien-cuu/${moc}`);
console.log(`\n*** ${CANH_BAO}: bản xuất này gồm cả tài khoản CHƯA đồng ý tham gia`);
console.log('    nghiên cứu (P1-7 chưa làm). Đừng nộp ra ngoài trước khi xin được');
console.log('    sự đồng ý — chi tiết trong README.txt của thư mục trên. ***');

await thoat(hong === 0 ? 0 : 1);
