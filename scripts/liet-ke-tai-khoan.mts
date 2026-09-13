/**
 * Liệt kê tài khoản theo vai — CHỈ ĐỌC, chạy trên máy của chủ dự án.
 *
 * Vì sao cần script này: từ 12/09/2026 luật Firestore chặn `users` với người
 * chưa đăng nhập (`allow list: if laGiaoVien()`), nên không còn cách nào xem
 * danh sách tài khoản mà không đăng nhập. Đó là chủ ý — lỗ hổng lớn nhất của
 * dự án chính là `users` từng đọc được công khai, gồm cả email học sinh.
 *
 * MẬT KHẨU:
 *   - hỏi ngay trên máy người chạy, hiện ra dấu sao chứ không hiện chữ,
 *   - KHÔNG nhận qua tham số dòng lệnh (tham số nằm lại trong lịch sử shell),
 *   - KHÔNG ghi ra tệp, KHÔNG in ra, KHÔNG gửi đi đâu ngoài Firebase Auth.
 *
 * Script này KHÔNG GHI gì xuống Firestore. Nó chỉ `getDocs` rồi in ra.
 *
 *   npm run liet-ke:tai-khoan
 *   npm run liet-ke:tai-khoan -- ten@email.com     (điền sẵn email cho nhanh)
 *   npm run liet-ke:tai-khoan -- --hien            (hiện mật khẩu dạng chữ)
 */
import readline from 'node:readline';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { docEnv, cauHinh, thieuCauHinh } from './ngan-hang-chung.mts';

/** Hỏi một dòng bình thường, có hiện chữ. */
function hoi(cauHoi: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(xong => {
    /* Chạy không có bàn phím (đầu vào bị chuyển hướng) thì readline đóng mà
       KHÔNG gọi callback — thiếu dòng này là script lặng lẽ thoát, người chạy
       tưởng nó hỏng. */
    rl.on('close', () => xong(''));
    rl.question(cauHoi, v => { rl.close(); xong(v.trim()); });
  });
}

/**
 * Hỏi mật khẩu.
 *
 * Bản đầu (13/09/2026) không vẽ gì cả khi người dùng gõ. Chủ dự án thử trên
 * Windows PowerShell và báo "không nhập được ô mật khẩu" — phím CÓ vào, chỉ là
 * màn hình đứng im nên không ai biết. Một ô nhập không phản hồi thì người dùng
 * kết luận là hỏng, và kết luận đó hợp lý.
 *
 * Nay mỗi phím vẽ một dấu sao. Mặc định KHÔNG hiện chữ thật: terminal giữ lại
 * khung cuộn, mà khung cuộn hay bị chụp màn hình gửi đi. Muốn chữ thật thì
 * thêm cờ `--hien`.
 *
 * Đọc phím ở chế độ thô chứ không ghi đè `_writeToOutput` của readline: hàm đó
 * còn được gọi cho cả chuỗi điều khiển vẽ lại dòng, nên đếm dấu sao sai.
 */
function hoiKin(cauHoi: string, hien: boolean): Promise<string> {
  const ra = process.stdout;
  const vao = process.stdin;

  /* Không có bàn phím thật (đầu vào bị chuyển hướng) thì chế độ thô không bật
     được — lùi về đọc cả dòng như bình thường. */
  if (!vao.isTTY) return hoi(cauHoi);

  return new Promise(xong => {
    ra.write(cauHoi);
    vao.setRawMode(true);
    vao.resume();
    vao.setEncoding('utf8');

    let daGo = '';
    const nghe = (khoi: string) => {
      /* Phím mũi tên / Home / End gửi cả chuỗi thoát `[A`. Bỏ ký tự ESC
         rồi duyệt tiếp thì `[` và `A` lọt vào mật khẩu thành rác — phải bỏ cả
         khối. */
      if (khoi.charCodeAt(0) === 0x1b) return;
      for (const c of khoi) {
        if (c === '\r' || c === '\n') {
          vao.off('data', nghe);
          vao.setRawMode(false);
          vao.pause();
          ra.write('\n');
          xong(daGo);
          return;
        }
        if (c === '\u0003') {           // Ctrl+C
          vao.setRawMode(false);
          ra.write('\n');
          process.exit(130);
        }
        if (c === '\u007f' || c === '\b') {   // Backspace
          if (daGo.length) { daGo = daGo.slice(0, -1); ra.write('\b \b'); }
          continue;
        }
        if (c < ' ') continue;         // bỏ mọi phím điều khiển khác
        daGo += c;
        ra.write(hien ? c : '*');
      }
    };
    vao.on('data', nghe);
  });
}

type HoSo = {
  id: string;
  role?: string;
  email?: string;
  username?: string;
  name?: string;
  classId?: string;
  pendingClassCode?: string;
};

const TEN_VAI: Record<string, string> = {
  admin: 'QUẢN TRỊ HỆ THỐNG',
  school_admin: 'QUẢN TRỊ TRƯỜNG',
  teacher: 'GIÁO VIÊN',
  student: 'HỌC SINH',
};

/** Một uid thật của Firebase Auth dài 28 ký tự chữ+số. Id tự đặt thì không. */
function uidThat(id: string): boolean {
  return /^[A-Za-z0-9]{28}$/.test(id);
}

async function chinh() {
  const env = docEnv();
  const thieu = thieuCauHinh(env);
  if (thieu.length) {
    console.error(`Thiếu cấu hình Firebase: ${thieu.join(', ')}`);
    process.exit(1);
  }

  /* Cờ tách khỏi email, để `-- --hien` và `-- mail@x --hien` đều chạy. */
  const thamSo = process.argv.slice(2);
  const hienMatKhau = thamSo.includes('--hien');
  const emailSan = thamSo.find(t => !t.startsWith('--'));

  console.log('Đăng nhập để đọc danh sách tài khoản.');
  console.log('Phải là tài khoản GIÁO VIÊN trở lên — luật chỉ cho vai đó đọc `users`.\n');

  const email = emailSan || await hoi('Email : ');
  if (!email) { console.error('Chưa nhập email.'); process.exit(1); }

  const nhan = hienMatKhau ? 'Mật khẩu (HIỆN CHỮ): ' : 'Mật khẩu (hiện dấu sao): ';
  const matKhau = await hoiKin(nhan, hienMatKhau);
  if (!matKhau) { console.error('Chưa nhập mật khẩu.'); process.exit(1); }

  const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
  const auth = getAuth(app);

  try {
    await signInWithEmailAndPassword(auth, email, matKhau);
  } catch (e) {
    /* KHÔNG in lại email/mật khẩu vào thông báo lỗi. */
    console.error(`\nĐăng nhập không được: ${(e as { code?: string }).code ?? 'lỗi không rõ'}`);
    console.error('Sai mật khẩu thì mã là auth/invalid-credential.');
    process.exit(1);
  }

  const uidToi = auth.currentUser?.uid ?? '(không rõ)';
  console.log(`\nĐã đăng nhập. uid của bạn: ${uidToi}\n`);

  let hoSo: HoSo[];
  try {
    const snap = await getDocs(collection(getFirestore(app), 'users'));
    hoSo = snap.docs.map(d => ({ ...(d.data() as Omit<HoSo, 'id'>), id: d.id }));
  } catch (e) {
    console.error(`Không đọc được \`users\`: ${(e as { code?: string }).code ?? e}`);
    console.error('permission-denied nghĩa là tài khoản này không phải giáo viên/quản trị.');
    await signOut(auth);
    process.exit(1);
  }

  for (const vai of ['admin', 'school_admin', 'teacher', 'student']) {
    const nhom = hoSo.filter(u => u.role === vai);
    if (!nhom.length) continue;
    console.log(`\n═══ ${TEN_VAI[vai]} — ${nhom.length} tài khoản ═══`);
    for (const u of nhom) {
      const dangNhapBang = u.email || u.username || '(KHÔNG CÓ — không đăng nhập được)';
      console.log(`  ${dangNhapBang}`);
      console.log(`      uid : ${u.id}${uidThat(u.id) ? '' : '   ⚠ KHÔNG phải uid Auth — hồ sơ mồ côi'}`);
      if (u.name) console.log(`      tên : ${u.name}`);
      if (u.classId) console.log(`      lớp : ${u.classId}`);
      if (u.pendingClassCode) console.log(`      đơn chờ duyệt, mã: ${u.pendingClassCode}`);
    }
  }

  const laVai = (u: HoSo) => Boolean(u.role && TEN_VAI[u.role]);
  const khac = hoSo.filter(u => !laVai(u));
  if (khac.length) {
    console.log(`\n═══ VAI LẠ hoặc KHÔNG CÓ VAI — ${khac.length} ═══`);
    for (const u of khac) console.log(`  ${u.id}   role=${u.role ?? '(trống)'}`);
  }

  const moCoi = hoSo.filter(u => !uidThat(u.id));
  console.log(`\n───────────────────────────────────────────────`);
  console.log(`Tổng ${hoSo.length} hồ sơ.`);
  if (moCoi.length) {
    console.log(`⚠ ${moCoi.length} hồ sơ có id KHÔNG phải uid Auth: ${moCoi.map(u => u.id).join(', ')}`);
    console.log('  Không ai đăng nhập được vào chúng. Kiểm tab Authentication rồi xoá.');
  }
  console.log('\nMật khẩu vừa nhập KHÔNG được lưu ở đâu cả. Quên thì đặt lại ở');
  console.log('Firebase Console → Authentication, không có cách lấy lại bản cũ.');

  await signOut(auth);
  process.exit(0);
}

chinh().catch(e => { console.error(e); process.exit(1); });
