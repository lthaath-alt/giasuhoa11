/**
 * Gán SỐ BÁO DANH cho học sinh, lấy từ danh sách lớp dạng CSV.
 *
 * Chạy:
 *   npm run gan:so-thu-tu -- "C:\\...\\danh-sach-11A3.csv"          # chạy thử
 *   npm run gan:so-thu-tu -- "C:\\...\\danh-sach-11A3.csv" --that   # ghi thật
 *
 * VÌ SAO CÓ TỆP NÀY (23/09/2026). Danh sách lớp trên giấy tờ nhà trường có một
 * thứ tự do người xếp, không suy ra được bằng quy tắc chữ nghĩa nào: sổ 11A3
 * để "Nguyễn Hoàng Thanh An" số 1 và "Nguyễn Bảo An" số 5, giữa hai em có ba
 * em tên Anh/Ánh. `hocSinhCuaLop` xếp theo `studentNumber`, nhưng đo hôm đó
 * **0/38 em có số** — nên mọi bảng đều rơi về thứ tự Firestore trả, tức ngẫu
 * nhiên với người đọc. Gõ tay 38 số qua giao diện thì vừa lâu vừa dễ lệch một
 * dòng mà không ai phát hiện.
 *
 * NĂM CÁI TRÓI, cùng lối với `sua:cau-hoi` — đừng nới cái nào mà không hỏi
 * chủ dự án:
 *
 * 1. **Chỉ ghi ĐÚNG MỘT trường: `studentNumber`.** Không đụng `role` (luật
 *    chặn), không đụng `classId`, không đụng gì khác.
 * 2. **Mặc định KHÔNG ghi.** Chạy thử in ra sẽ đổi gì rồi mới quyết định.
 * 3. **KHÔNG ĐỌC cột mật khẩu.** Danh sách lớp của trường hay có cột "Pass";
 *    script này chỉ lấy ba cột STT / Họ tên / Gmail. Mật khẩu không được đi
 *    qua đây, không vào log, không vào bộ nhớ.
 * 4. **Khớp bằng EMAIL**, không khớp bằng tên. Hai em trùng tên là chuyện
 *    thường; khớp nhầm thì hai em đổi số cho nhau và không ai thấy.
 * 5. **Báo cáo từng dòng không khớp**, không im lặng bỏ qua. Một em trong sổ
 *    mà không có tài khoản là thông tin cần biết, không phải rác cần giấu.
 *
 * Tài khoản để ghi: `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local`
 * (vai `teacher` là đủ — luật cho giáo viên sửa hồ sơ học sinh trừ `role`).
 *
 * Tệp CSV **chứa email học sinh**, nên để ngoài repo; đừng commit nó.
 */
import { readFileSync } from 'node:fs';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';
import { cauHinh, docEnv, thieuCauHinh } from './ngan-hang-chung.mts';

// ─── Đọc CSV ─────────────────────────────────────────────────────────────────

/**
 * Tách một dòng CSV, hiểu cả ô được bọc trong dấu nháy kép.
 *
 * Không dùng `split(',')` trần: tên người Việt hiếm khi có dấu phẩy, nhưng
 * Google Sheets bọc nháy kép mọi ô có phẩy hoặc xuống dòng, và một ô như vậy
 * làm lệch TOÀN BỘ các cột sau nó — tức gán nhầm số cho cả lớp.
 */
function tachDong(dong: string): string[] {
  const o: string[] = [];
  let hienTai = '';
  let trongNhay = false;
  for (let i = 0; i < dong.length; i++) {
    const c = dong[i];
    if (trongNhay) {
      if (c === '"' && dong[i + 1] === '"') { hienTai += '"'; i++; }
      else if (c === '"') trongNhay = false;
      else hienTai += c;
    } else if (c === '"') trongNhay = true;
    else if (c === ',') { o.push(hienTai); hienTai = ''; }
    else hienTai += c;
  }
  o.push(hienTai);
  return o.map(s => s.trim());
}

const khongDau = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export interface DongSo { stt: number; email: string; ten: string; }

/**
 * Đọc CSV ra danh sách { stt, email, ten }.
 *
 * Tự tìm dòng tiêu đề thay vì ghim cứng dòng 1: bảng của trường hay có một
 * dòng tên bảng ở trên cùng ("Danh sách học sinh lớp 11A3"), và ghim cứng thì
 * lần sau ai thêm một dòng trống là hỏng.
 *
 * XUẤT RA cho bộ kiểm gọi được — phần đọc tệp là chỗ dễ sai nhất và không cần
 * mạng để kiểm.
 */
export function docDanhSach(noiDung: string): { ds: DongSo[]; loi: string[] } {
  const dong = noiDung.split(/\r?\n/).filter(d => d.trim());
  const loi: string[] = [];

  const iTieuDe = dong.findIndex(d => {
    const o = tachDong(d).map(khongDau);
    return o.some(x => x === 'stt') && o.some(x => x.includes('mail'));
  });
  if (iTieuDe < 0) {
    return { ds: [], loi: ['Không thấy dòng tiêu đề có cả cột "STT" và cột chứa "mail".'] };
  }

  const tieuDe = tachDong(dong[iTieuDe]).map(khongDau);
  const cSTT = tieuDe.findIndex(x => x === 'stt');
  const cMail = tieuDe.findIndex(x => x.includes('mail'));
  const cTen = tieuDe.findIndex(x => x.includes('ho va ten') || x === 'ho ten' || x === 'ten');

  const ds: DongSo[] = [];
  const daThayStt = new Set<number>();
  const daThayMail = new Set<string>();

  for (let i = iTieuDe + 1; i < dong.length; i++) {
    const o = tachDong(dong[i]);
    const stt = Number((o[cSTT] || '').replace(/\D+/g, ''));
    const email = (o[cMail] || '').trim().toLowerCase();
    const ten = cTen >= 0 ? (o[cTen] || '').trim() : '';

    if (!stt && !email) continue;                 // dòng trống, bỏ qua im lặng
    if (!stt) { loi.push(`Dòng ${i + 1}: thiếu STT (${email || ten})`); continue; }
    if (!email.includes('@')) { loi.push(`Dòng ${i + 1}: thiếu email hợp lệ (STT ${stt}, ${ten})`); continue; }

    /* Trùng STT hay trùng email là dấu hiệu sổ bị chép lỗi. Ghi đè lặng lẽ thì
       hai em mất số của nhau. */
    if (daThayStt.has(stt)) { loi.push(`Dòng ${i + 1}: STT ${stt} đã dùng ở dòng trên`); continue; }
    if (daThayMail.has(email)) { loi.push(`Dòng ${i + 1}: email lặp lại (${email})`); continue; }
    daThayStt.add(stt);
    daThayMail.add(email);
    ds.push({ stt, email, ten });
  }
  return { ds, loi };
}

// ─── Chạy ────────────────────────────────────────────────────────────────────

/* Cho phép `import` từ bộ kiểm mà không chạy phần mạng. */
const laChayThang = process.argv[1]?.replace(/\\/g, '/').endsWith('gan-so-thu-tu.mts');
if (!laChayThang) { /* được import để kiểm — không làm gì thêm */ }
else {
  const cauLenh = process.argv.slice(2);
  const ghiThat = cauLenh.includes('--that');
  const tepCsv = cauLenh.find(a => !a.startsWith('--'));

  if (!tepCsv) {
    console.error('Thiếu đường dẫn tệp CSV.\n  npm run gan:so-thu-tu -- "duong/dan/danh-sach.csv"');
    process.exit(1);
  }

  const { ds, loi } = docDanhSach(readFileSync(tepCsv, 'utf8'));
  console.log(`\nĐọc "${tepCsv}": ${ds.length} dòng có STT và email.`);
  loi.forEach(l => console.log('  BỎ QUA  ' + l));
  if (!ds.length) process.exit(1);

  const env = docEnv();
  const thieu = thieuCauHinh(env);
  if (thieu.length) { console.error(`Thiếu cấu hình Firebase: ${thieu.join(', ')}`); process.exit(1); }
  const email = (env.GIAO_VIEN_EMAIL || '').trim();
  const matKhau = env.GIAO_VIEN_MATKHAU || '';
  if (!email || !matKhau) {
    console.error('Thiếu GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');
    process.exit(1);
  }

  const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
  const db = getFirestore(app);
  const auth = getAuth(app);
  await signInWithEmailAndPassword(auth, email, matKhau);
  console.log(`Đăng nhập: ${email}`);

  const hoSo = (await getDocs(collection(db, 'users'))).docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  console.log(`Đọc được ${hoSo.length} hồ sơ.\n`);
  console.log(ghiThat ? '*** CHẾ ĐỘ GHI THẬT ***\n' : 'Chạy thử — KHÔNG ghi gì. Thêm `--that` để ghi thật.\n');

  /* Khớp bằng email HOẶC username: em không có email thật dùng
     `<username>@internal.local`, và sổ của trường ghi địa chỉ nào cũng có. */
  const tim = (e: string) => hoSo.find(u =>
    (u.email || '').trim().toLowerCase() === e || (u.username || '').trim().toLowerCase() === e);

  let doi = 0, giuNguyen = 0, khongThay = 0, thatBai = 0;
  for (const d of ds) {
    const u = tim(d.email);
    if (!u) { console.log(`  KHÔNG THẤY TÀI KHOẢN  STT ${String(d.stt).padStart(2)} · ${d.ten} · ${d.email}`); khongThay++; continue; }
    if (u.studentNumber === d.stt) { giuNguyen++; continue; }

    const cu = u.studentNumber === undefined ? '(chưa có)' : String(u.studentNumber);
    console.log(`  ${ghiThat ? 'GHI  ' : 'SẼ GHI'}  STT ${String(d.stt).padStart(2)} ← ${cu.padStart(9)}  ${d.ten}`);
    doi++;
    if (ghiThat) {
      try {
        await updateDoc(doc(db, 'users', u.id), { studentNumber: d.stt });
      } catch (e) {
        console.log(`         THẤT BẠI: ${(e as { code?: string })?.code || e}`);
        thatBai++;
      }
    }
  }

  console.log(`\nTổng: ${doi} cần đổi · ${giuNguyen} đã đúng · ${khongThay} không có tài khoản`);

  if (ghiThat) {
    /* Đọc LẠI từ Firestore để xác nhận — bài học số 1, đừng tin dòng chữ
       "xong" của chính script mình viết. */
    const lai = (await getDocs(collection(db, 'users'))).docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const timLai = (e: string) => lai.find(u =>
      (u.email || '').trim().toLowerCase() === e || (u.username || '').trim().toLowerCase() === e);
    const lech = ds.filter(d => { const u = timLai(d.email); return u && u.studentNumber !== d.stt; });
    console.log(lech.length === 0
      ? '\nĐọc lại Firestore: MỌI số đã khớp sổ.'
      : `\nĐọc lại Firestore: CÒN ${lech.length} em chưa khớp — ${lech.map(l => l.stt).join(', ')}`);
    if (thatBai) console.log(`${thatBai} lượt ghi bị từ chối.`);
  }

  await signOut(auth);
}
