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
 *
 * Lọc và xuất (16/09/2026) — sinh ra vì "bí với đống tài khoản thử": bản đầu
 * in hết mọi hồ sơ, mỗi hồ sơ 3-5 dòng, nên tìm một tài khoản phải cuộn dài.
 *
 *   -- --tim demo          chỉ hiện hồ sơ có "demo" trong email/tên/uid
 *   -- --vai teacher       chỉ một vai
 *   -- --gon               mỗi tài khoản MỘT dòng, dạng bảng
 *   -- --csv ds.csv        xuất ra tệp mở bằng Excel
 *
 * Các cờ ghép được: `-- --vai student --tim thu --gon`.
 */
import { writeFileSync } from 'node:fs';
import readline from 'node:readline';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

  /* Cờ tách khỏi email, để `-- --hien` và `-- mail@x --hien` đều chạy.

     Cờ CÓ GIÁ TRỊ phải được nuốt cùng giá trị của nó TRƯỚC khi đi tìm email.
     Bản cũ lấy email bằng `find(t => !t.startsWith('--'))`, nên thêm
     `--vai teacher` là `teacher` bị hiểu thành email, script hỏi mật khẩu rồi
     mới báo đăng nhập hỏng — người chạy không đời nào đoán ra vì sao. */
  const thamSo = process.argv.slice(2);
  const CO_GIA_TRI: Record<string, string> = { '--tim': 'demo', '--vai': 'teacher', '--csv': 'ds.csv' };
  const co: Record<string, string> = {};
  const conLai: string[] = [];
  for (let i = 0; i < thamSo.length; i++) {
    const t = thamSo[i];
    if (t in CO_GIA_TRI) {
      const giaTri = thamSo[i + 1];
      if (!giaTri || giaTri.startsWith('--')) {
        console.error(`Cờ ${t} cần một giá trị đi kèm. Ví dụ: ${t} ${CO_GIA_TRI[t]}`);
        process.exit(1);
      }
      co[t] = giaTri;
      i++;                                   // nuốt luôn giá trị, khỏi lọt vào email
    } else if (t.startsWith('--')) {
      co[t] = '1';
    } else {
      conLai.push(t);
    }
  }

  const hienMatKhau = co['--hien'] === '1';
  const inGon = co['--gon'] === '1';
  const timChu = (co['--tim'] ?? '').toLowerCase();
  const vaiLoc = co['--vai'] ?? '';
  const tepCsv = co['--csv'] ?? '';
  const emailSan = conLai[0];

  if (vaiLoc && !TEN_VAI[vaiLoc]) {
    console.error(`Vai không hợp lệ: ${vaiLoc}`);
    console.error(`Chọn một trong: ${Object.keys(TEN_VAI).join(', ')}`);
    process.exit(1);
  }

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

  /* Đồng quản trị KHÔNG phải một vai — nó là quyền cộng thêm, cất ở một tài
     liệu riêng. Vì thế nó không bao giờ hiện ra như một nhóm trong bảng dưới,
     và người đọc dễ tưởng việc chỉ định đã không ăn. Đánh dấu cạnh tên cho rõ.

     Đọc lỗi là đường chạy BÌNH THƯỜNG: luật chỉ cho chủ dự án và chính đồng
     quản trị đọc tài liệu này. Một giáo viên thường chạy script vẫn xem được
     danh sách tài khoản, chỉ là không thấy dấu sao — im lặng, đừng báo lỗi. */
  let dongQuanTri = new Set<string>();
  try {
    const d = await getDoc(doc(getFirestore(app), 'quan_tri', 'dong_quan_tri'));
    const ds = d.exists() ? (d.data() as { emails?: unknown }).emails : undefined;
    if (Array.isArray(ds)) {
      dongQuanTri = new Set(ds.filter((x): x is string => typeof x === 'string').map(x => x.toLowerCase()));
    }
  } catch {
    dongQuanTri = new Set();
  }
  const laDongQuanTri = (u: HoSo) => Boolean(u.email && dongQuanTri.has(u.email.toLowerCase()));

  /* Lọc CHỈ đổi phần liệt kê và tệp CSV. Các cảnh báo ở cuối (hồ sơ mồ côi,
     đồng quản trị còn vai student) vẫn tính trên TOÀN BỘ dữ liệu — một cảnh
     báo bị bộ lọc giấu đi là cảnh báo vô dụng, và người chạy sẽ tưởng đã hết
     vấn đề chỉ vì đang gõ `--vai teacher`. */
  const khop = (u: HoSo) => {
    if (vaiLoc && u.role !== vaiLoc) return false;
    if (timChu) {
      const kho = [u.email, u.username, u.name, u.id].filter(Boolean).join(' ').toLowerCase();
      if (!kho.includes(timChu)) return false;
    }
    return true;
  };
  const hoSoLoc = hoSo.filter(khop);

  if (vaiLoc || timChu) {
    const dieuKien = [vaiLoc && `vai=${vaiLoc}`, timChu && `tìm="${timChu}"`].filter(Boolean).join(', ');
    console.log(`Đang lọc: ${dieuKien}  →  ${hoSoLoc.length}/${hoSo.length} hồ sơ\n`);
    if (!hoSoLoc.length) console.log('Không hồ sơ nào khớp. Thử bỏ bớt điều kiện.\n');
  }

  if (inGon) {
    /* Xếp theo vai rồi theo tên đăng nhập, để mắt quét được theo cụm. */
    const THU_TU = ['admin', 'school_admin', 'teacher', 'student'];
    const hang = (u: HoSo) => { const i = THU_TU.indexOf(u.role ?? ''); return i < 0 ? 99 : i; };
    const ten = (u: HoSo) => u.email || u.username || '';
    const dsGon = [...hoSoLoc].sort((a, b) => hang(a) - hang(b) || ten(a).localeCompare(ten(b)));

    console.log('  VAI                ĐĂNG NHẬP BẰNG                      TÊN                     LỚP');
    console.log('  ' + '─'.repeat(96));
    for (const u of dsGon) {
      const dau = [laDongQuanTri(u) ? '★' : '', uidThat(u.id) ? '' : '⚠mồ côi', u.pendingClassCode ? '⏳đơn' : '']
        .filter(Boolean).join(' ');
      console.log('  '
        + (TEN_VAI[u.role ?? ''] ?? u.role ?? '(không vai)').padEnd(19)
        + (u.email || u.username || '(không đăng nhập được)').padEnd(36)
        + (u.name ?? '').padEnd(24)
        + (u.classId ?? '—').padEnd(8)
        + dau);
    }
  } else {
    for (const vai of ['admin', 'school_admin', 'teacher', 'student']) {
      const nhom = hoSoLoc.filter(u => u.role === vai);
      if (!nhom.length) continue;
      console.log(`\n═══ ${TEN_VAI[vai]} — ${nhom.length} tài khoản ═══`);
      for (const u of nhom) {
        const dangNhapBang = u.email || u.username || '(KHÔNG CÓ — không đăng nhập được)';
        console.log(`  ${dangNhapBang}${laDongQuanTri(u) ? '   ★ ĐỒNG QUẢN TRỊ' : ''}`);
        console.log(`      uid : ${u.id}${uidThat(u.id) ? '' : '   ⚠ KHÔNG phải uid Auth — hồ sơ mồ côi'}`);
        if (u.name) console.log(`      tên : ${u.name}`);
        if (u.classId) console.log(`      lớp : ${u.classId}`);
        if (u.pendingClassCode) console.log(`      đơn chờ duyệt, mã: ${u.pendingClassCode}`);
      }
    }

    const laVai = (u: HoSo) => Boolean(u.role && TEN_VAI[u.role]);
    const khac = hoSoLoc.filter(u => !laVai(u));
    if (khac.length) {
      console.log(`\n═══ VAI LẠ hoặc KHÔNG CÓ VAI — ${khac.length} ═══`);
      for (const u of khac) console.log(`  ${u.id}   role=${u.role ?? '(trống)'}`);
    }
  }

  if (tepCsv) {
    const oCsv = (v: unknown) => {
      const s = v === undefined || v === null ? '' : String(v);
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const dauCot = ['vai', 'email', 'ten_dang_nhap', 'ten', 'uid', 'lop', 'don_cho_duyet', 'dong_quan_tri', 'ho_so_mo_coi'];
    const cacDong = hoSoLoc.map(u => [
      u.role ?? '', u.email ?? '', u.username ?? '', u.name ?? '', u.id,
      u.classId ?? '', u.pendingClassCode ?? '',
      laDongQuanTri(u) ? 'x' : '', uidThat(u.id) ? '' : 'x',
    ].map(oCsv).join(','));

    /* Dấu BOM ở đầu tệp: thiếu nó thì Excel trên Windows đọc UTF-8 theo bảng
       mã ANSI, tên tiếng Việt nát thành ký tự lạ — và người dùng sẽ đổ cho
       script chứ không đổ cho Excel. CSV xuống dòng bằng CRLF theo RFC 4180. */
    writeFileSync(tepCsv, '﻿' + [dauCot.join(','), ...cacDong].join('\r\n') + '\r\n', 'utf8');
    console.log(`\n✔ Đã ghi ${cacDong.length} dòng vào ${tepCsv}`);
    console.log('  ⚠ Tệp này CHỨA EMAIL HỌC SINH. Đừng commit, đừng gửi ra ngoài.');
  }

  const moCoi = hoSo.filter(u => !uidThat(u.id));
  console.log(`\n───────────────────────────────────────────────`);
  console.log(`Tổng ${hoSo.length} hồ sơ${hoSoLoc.length !== hoSo.length ? ` (đang hiện ${hoSoLoc.length} sau khi lọc)` : ''}.`);
  /* Mọi dòng dưới đây tính trên TOÀN BỘ, không theo bộ lọc — xem chú thích ở
     chỗ khai `hoSoLoc`. */

  /* Nói rõ đồng quản trị là quyền CỘNG THÊM, không phải một vai — nếu không,
     người đọc thấy tên họ nằm trong nhóm HỌC SINH và tưởng chỉ định đã hỏng. */
  if (dongQuanTri.size) {
    console.log(`★ ${dongQuanTri.size} đồng quản trị: ${[...dongQuanTri].join(', ')}`);
    console.log('  Đây là quyền cộng thêm, KHÔNG phải một vai — họ vẫn nằm trong nhóm vai của mình.');
    const ngoaiDs = [...dongQuanTri].filter(e => !hoSo.some(u => u.email?.toLowerCase() === e));
    if (ngoaiDs.length) {
      console.log(`  ⚠ ${ngoaiDs.length} email không có hồ sơ nào: ${ngoaiDs.join(', ')}`);
    }
    const laHocSinh = hoSo.filter(u => laDongQuanTri(u) && u.role === 'student');
    if (laHocSinh.length) {
      console.log(`  ⚠ ${laHocSinh.length} người còn vai 'student' nên KHÔNG vào được màn duyệt đơn:`);
      console.log(`     ${laHocSinh.map(u => u.email).join(', ')}`);
      console.log("     Đổi vai thành 'teacher' thì mới dùng được quyền này.");
    }
  } else {
    console.log('★ Chưa chỉ định đồng quản trị nào (hoặc tài khoản này không được đọc danh sách đó).');
  }

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
