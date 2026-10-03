/**
 * Kiểm luật Firestore bằng emulator.
 *
 * Chạy:  npm run kiem-tra:luat   (và chạy trong `npm run kiem-tra`)
 *
 * VÌ SAO CÓ TỆP NÀY. Trước đây luật chỉ kiểm được bằng Rules Playground, bấm
 * tay từng phép trên Console. Ngày 13/09/2026 mất nửa buổi vì ô Build document
 * ghi tên trường là `role ` — thừa một dấu cách, thành một trường khác, nên
 * phép thử ra ALLOWED trong khi luật hoàn toàn đúng. Máy không gõ nhầm dấu
 * cách. Và Playground KHÔNG mô phỏng được `list`, nên hai đường quan trọng
 * nhất của khối `users` chưa từng được đo lần nào.
 *
 * THIẾU JAVA 21+ THÌ BỎ QUA, không báo hỏng; phép này vẫn chạy thật trên
 * GitHub Actions. Máy cũ của dự án chỉ có Java 8. Máy mới (03/10/2026) có
 * Temurin 21 nên chạy được tại chỗ.
 *
 * Script tự gọi lại chính mình: lần đầu chạy ngoài emulator thì kiểm điều kiện
 * rồi spawn `firebase emulators:exec`, lần sau (có cờ H11_TRONG_EMULATOR) thì
 * chạy các phép.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where,
} from 'firebase/firestore';

/** Một bài kiểm tra đã nộp, đúng hình dạng `Quiz` mà web ghi lên `bai_nop`. */
const baiMau = (id: string, email: string, score: number, maxScore: number) => ({
  id, lessonId: 'b1', chapterId: 'c1', userEmail: email, questions: [], answers: {},
  status: 'submitted', score, maxScore, createdAt: '2026-09-18T00:00:00Z',
  expiresAt: '2026-09-19T00:00:00Z', results: {},
});

/** Một đề giáo viên giao, đúng hình dạng `DeGiao` mà web ghi lên `de_giao`. */
const deMau = (id: string, teacherEmail: string, soCau = 10) => ({
  id, tieuDe: 'Kiểm tra 15 phút', classId: 'lop_1', tenLop: '11H',
  teacherEmail, teacherName: 'GV',
  questions: Array.from({ length: soCau }, (_, i) => ({ id: 'q' + i, content: 'Câu ' + i })),
  maxScore: soCau, soPhut: 15,
  moLuc: '2026-09-22T00:00:00Z', dongLuc: '2026-09-29T00:00:00Z',
  createdAt: '2026-09-22T00:00:00Z', dong: false,
});

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const DU_AN = 'demo-giasuhoa11';   // tiền tố `demo-` = không bao giờ chạm hạ tầng thật
const CONG = 8080;

/* firebase-tools 15 từ chối chạy emulator dưới Java 21
   (`MIN_SUPPORTED_JAVA_MAJOR_VERSION = 21` trong lib/emulator/commandUtils.js,
   đo 03/10/2026). Trước đây kiểm 11+: Java 11 lọt qua bước này rồi mới hỏng
   ở firebase. Nâng firebase-tools thì xem lại số này. */
const JAVA_TOI_THIEU = 21;

/** Đọc số hiệu chính của Java. `1.8.0_502` -> 8; `21.0.12` -> 21. Không gọi
 *  được `java` thì trả 0. */
function soHieuJava(): number {
  const r = spawnSync('java', ['-version'], { encoding: 'utf8' });
  if (r.error) return 0;
  const chu = `${r.stderr || ''}${r.stdout || ''}`;
  const m = chu.match(/version "(\d+)(?:\.(\d+))?/);
  if (!m) return 0;
  return m[1] === '1' ? Number(m[2] ?? 0) : Number(m[1]);
}

/** Gọi được `firebase` không. Dùng bản trong node_modules, không phụ thuộc máy. */
function coFirebase(): boolean {
  const r = spawnSync('npx', ['--no-install', 'firebase', '--version'], {
    encoding: 'utf8', shell: process.platform === 'win32',
  });
  return !r.error && r.status === 0;
}

async function main() {
  console.log('== Luật Firestore ==');

  if (process.env.H11_TRONG_EMULATOR !== '1') {
    const java = soHieuJava();
    if (java < JAVA_TOI_THIEU) {
      console.log(`  BỎ QUA  emulator cần Java ${JAVA_TOI_THIEU}+, máy này có ${java || 'không có Java'}`);
      console.log('          (phép này chạy thật trên GitHub Actions)');
      process.exit(0);
    }
    if (!coFirebase()) {
      console.log('  BỎ QUA  chưa cài firebase-tools — chạy `npm ci` rồi thử lại');
      process.exit(0);
    }

    /* Windows cần `shell: true` mới gọi được `npx`, mà khi đó Node nối các
       đối số bằng dấu cách, KHÔNG đặt trong nháy: lệnh con bị tách thành ba
       đối số và firebase báo "Too many arguments" (đo 03/10/2026, lần đầu
       chạy được tới đây trên Windows). Bọc nháy kép để shell giữ nguyên một
       đối số. Linux không qua shell nên giữ nguyên. */
    const lenhCon = 'npx tsx scripts/kiem-tra-luat.mts';
    const con = spawnSync('npx', [
      'firebase', 'emulators:exec', '--only', 'firestore', '--project', DU_AN,
      process.platform === 'win32' ? `"${lenhCon}"` : lenhCon,
    ], {
      cwd: GOC,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, H11_TRONG_EMULATOR: '1' },
    });
    process.exit(con.status ?? 1);
  }

  const hong = await chayCacPhep();

  if (hong === 0) { console.log('\n>>> TẤT CẢ ĐẠT'); process.exit(0); }
  console.log(`\n>>> CÓ ${hong} MỤC KHÔNG ĐẠT`);
  process.exit(1);
}

/* Bảy nhân vật. Mỗi người phải có hồ sơ THẬT trong `users`, vì luật đọc vai
   bằng get(users/{uid}) — không có hồ sơ thì laGiaoVien() luôn sai và phép
   thử đạt vì lý do sai. */
const NGUOI = {
  chu:   { uid: 'uid_chu',    email: 'ktranquang713@gmail.com', role: 'admin'   },
  dong:  { uid: 'uid_dong',   email: 'lthaa.th@gmail.com',      role: 'teacher' },
  gv:    { uid: 'uid_gv',     email: 'gv@truong.local',         role: 'teacher' },
  hs:    { uid: 'uid_hs',     email: 'hs@truong.local',         role: 'student' },
  hs2:   { uid: 'uid_hs2',    email: 'hs2@truong.local',        role: 'student' },
  hs3:   { uid: 'uid_hs3',    email: 'hs3@truong.local',        role: 'student' },
  admin2:{ uid: 'uid_admin2', email: 'admin2@truong.local',     role: 'admin'   },
};

async function gieo(moi: RulesTestEnvironment) {
  await moi.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    for (const n of Object.values(NGUOI)) {
      await setDoc(doc(db, 'users', n.uid), {
        email: n.email, username: n.email, name: n.uid,
        role: n.role, status: 'active',
      });
    }
    await setDoc(doc(db, 'quan_tri', 'dong_quan_tri'), {
      emails: [NGUOI.dong.email],
    });
    await setDoc(doc(db, 'bank_questions', 'cau_1'), { q: 'Fe + HCl ?' });
    await setDoc(doc(db, 'classes', 'lop_1'), { name: '11H', inviteCode: '11H01' });
    await setDoc(doc(db, 'progress', NGUOI.hs.email), { diem: 8 });
    await setDoc(doc(db, 'chats', 'chat_1'), { userEmail: NGUOI.hs.email, noiDung: 'chao' });
    await setDoc(doc(db, 'bai_nop', 'bn_1'), baiMau('bn_1', NGUOI.hs.email, 5, 10));
    await setDoc(doc(db, 'de_giao', 'de_1'), deMau('de_1', NGUOI.gv.email));
  });
}

/** Tư cách đã đăng nhập, có email trong token — luật dùng
 *  `request.auth.token.email` nên KHÔNG được quên tham số thứ hai. */
const nhu = (moi: RulesTestEnvironment, n: { uid: string; email: string }) =>
  moi.authenticatedContext(n.uid, { email: n.email }).firestore();

/** Việc 2 viết thân hàm này. Trả về số phép hỏng. */
async function chayCacPhep(): Promise<number> {
  let sai = 0;
  const dem = (dieu: boolean, ten: string, chiTiet = '') => {
    if (!dieu) sai++;
    console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);
  };
  const duoc = async (p: Promise<unknown>, ten: string) => {
    try { await assertSucceeds(p); dem(true, ten); }
    catch (e) { dem(false, ten, 'lẽ ra ĐƯỢC nhưng bị chặn: ' + (e as Error).message); }
  };
  const chan = async (p: Promise<unknown>, ten: string) => {
    try { await assertFails(p); dem(true, ten); }
    catch { dem(false, ten, 'lẽ ra BỊ CHẶN nhưng lại cho qua'); }
  };

  const moi = await initializeTestEnvironment({
    projectId: CAU_HINH.DU_AN,
    firestore: { rules: docLuat(), host: '127.0.0.1', port: CAU_HINH.CONG },
  });
  await moi.clearFirestore();
  await gieo(moi);

  const chu = nhu(moi, NGUOI.chu);
  const dong = nhu(moi, NGUOI.dong);
  const gv = nhu(moi, NGUOI.gv);
  const hs = nhu(moi, NGUOI.hs);
  const khach = moi.unauthenticatedContext().firestore();

  // 1-2: đường đăng nhập
  await duoc(getDoc(doc(hs, 'users', NGUOI.hs.uid)), '1. học sinh đọc hồ sơ CỦA CHÍNH MÌNH');
  await chan(getDoc(doc(hs, 'users', NGUOI.hs2.uid)), '2. học sinh đọc hồ sơ người khác');

  // 3-4: `list` — hai đường Playground không mô phỏng được
  await chan(getDocs(collection(hs, 'users')), '3. học sinh liệt kê toàn bộ users');
  await duoc(getDocs(collection(gv, 'users')), '4. giáo viên liệt kê toàn bộ users');

  // 5-8: sáu cửa hậu trên hồ sơ của chính mình
  await duoc(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { name: 'Tên mới' }),
    '5. học sinh sửa `name` của mình');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '6. học sinh tự nâng vai');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { classId: 'lop_1' }),
    '7a. học sinh tự đặt `classId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { schoolId: 'truong_1' }),
    '7b. học sinh tự đặt `schoolId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { joinedClassId: 'lop_1' }),
    '7c. học sinh tự đặt `joinedClassId`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { username: 'khac' }),
    '8a. học sinh tự đổi `username`');
  await chan(updateDoc(doc(hs, 'users', NGUOI.hs.uid), { email: 'khac@x.local' }),
    '8b. học sinh tự đổi `email`');

  // 9-13: ai được đặt vai
  await duoc(updateDoc(doc(chu, 'users', NGUOI.hs2.uid), { role: 'teacher' }),
    '9. chủ dự án đặt vai giáo viên');
  await chan(updateDoc(doc(gv, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '10. giáo viên thường đặt vai');
  await duoc(updateDoc(doc(dong, 'users', NGUOI.hs.uid), { role: 'teacher' }),
    '11. đồng quản trị đặt vai giáo viên');
  await chan(updateDoc(doc(dong, 'users', NGUOI.hs.uid), { role: 'admin' }),
    '12. đồng quản trị phong quản trị hệ thống');
  await chan(updateDoc(doc(dong, 'users', NGUOI.admin2.uid), { role: 'teacher' }),
    '13. đồng quản trị hạ vai một quản trị');

  // Phép 9 và 11 vừa nâng `hs2` và `hs` lên teacher. Trước 03/10/2026 không
  // ai trả lại, nên mọi phép "học sinh …" phía sau chạy bằng vai giáo viên:
  // 21e, 21g, 21l, 22g báo SAI từ 22/09 vì luật cho giáo viên làm đúng những
  // việc đó (đo: ngay trước nhóm 21, hs.role = hs2.role = 'teacher'). Trả cả
  // hai về học sinh như lúc gieo, để các phép sau đo luật của HỌC SINH.
  await moi.withSecurityRulesDisabled(async ctx => {
    for (const n of [NGUOI.hs, NGUOI.hs2]) {
      await updateDoc(doc(ctx.firestore(), 'users', n.uid), { role: 'student' });
    }
  });

  // 14: xoá hồ sơ
  await chan(deleteDoc(doc(gv, 'users', NGUOI.hs.uid)), '14. giáo viên xoá hồ sơ');

  // 15-16: khách chưa đăng nhập
  await duoc(getDoc(doc(khach, 'bank_questions', 'cau_1')),
    '15. khách đọc `bank_questions` (đồng bộ đêm sống nhờ điều này)');
  await chan(getDocs(collection(khach, 'users')), '16a. khách liệt kê `users`');
  await chan(getDocs(collection(khach, 'classes')), '16b. khách liệt kê `classes`');
  await chan(getDoc(doc(khach, 'progress', NGUOI.hs.email)), '16c. khách đọc `progress`');
  await chan(getDoc(doc(khach, 'chats', 'chat_1')), '16d. khách đọc `chats`');

  // 17: bộ lọc XSS ngay lúc GHI. Có phép đối chứng câu sạch, để phép bẩn
  //     không đạt vì một lý do khác.
  await duoc(setDoc(doc(gv, 'bank_questions', 'cau_sach'), { q: 'H2SO4 đặc nóng?' }),
    '17a. giáo viên ghi câu hỏi sạch');
  await chan(setDoc(doc(gv, 'bank_questions', 'cau_ban'),
    { q: 'xin chào <script>alert(1)</script>' }),
    '17b. giáo viên ghi câu hỏi chứa thẻ script');

  // 18: cái bẫy affectedKeys — `deleteClass` ghi role: 'student' đè lên hồ sơ
  //     vốn đã là student. Giá trị không đổi nên `role` KHÔNG nằm trong
  //     affectedKeys(), và giáo viên vẫn phải xoá được lớp.
  //     Nhắm vào `hs3`: hồ sơ này chưa từng đổi vai, nên chắc chắn là ghi đè
  //     cùng giá trị. (`hs` từng bị phép 11 đổi thành teacher; nay đã được trả
  //     về student ngay sau phép 13, nhưng giữ `hs3` cho khỏi phụ thuộc thứ tự.)
  await duoc(updateDoc(doc(gv, 'users', NGUOI.hs3.uid), { role: 'student', classId: null }),
    '18. giáo viên ghi `role: student` đè lên hồ sơ vốn đã student');

  // 20: bộ đếm lượt thử của khách + khoá spam (14/09/2026). Khách dùng uid
  //     ĐĂNG NHẬP ẨN DANH; luật cấm đếm lùi, cấm tăng quá 1 lượt, cấm rút ngắn khoá.
  const gioiHan = (luotKhach: number, khoaDen = 0, luotPhatSpam = 0) =>
    ({ luotKhach, thoiDiemGui: [1], bamTinGanDay: ['0a1b2c3d'], luotPhatSpam, khoaDen });
  const anDanh = moi.authenticatedContext('uid_khach_an_danh', {
    firebase: { sign_in_provider: 'anonymous' },
  }).firestore();
  await duoc(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(1)),
    '20a. khách ẩn danh tạo bộ đếm của chính mình');
  await duoc(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(2)),
    '20b. khách tăng đúng một lượt');
  await chan(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(0)),
    '20c. khách đếm lùi bộ đếm về 0');
  await chan(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(5)),
    '20d. khách tăng vọt nhiều lượt một lần');
  await duoc(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(2, 9_000_000_000_000, 1)),
    '20e. ghi khoá spam');
  await chan(setDoc(doc(anDanh, 'gioi_han_chat', 'uid_khach_an_danh'), gioiHan(2, 0, 1)),
    '20f. khách tự gỡ khoá spam');
  await chan(getDoc(doc(hs, 'gioi_han_chat', 'uid_khach_an_danh')),
    '20g. học sinh đọc bộ đếm của người khác');
  await chan(getDoc(doc(khach, 'gioi_han_chat', 'uid_khach_an_danh')),
    '20h. chưa đăng nhập đọc bộ đếm');

  // 21: bài kiểm tra đã nộp (18/09/2026)
  const hs2 = nhu(moi, NGUOI.hs2);
  await duoc(setDoc(doc(hs, 'bai_nop', 'bn_2'), baiMau('bn_2', NGUOI.hs.email, 3, 10)),
    '21a. học sinh nộp bài của chính mình');
  await chan(setDoc(doc(hs, 'bai_nop', 'bn_3'), baiMau('bn_3', NGUOI.hs2.email, 3, 10)),
    '21b. học sinh nộp bài đứng tên bạn khác');
  await chan(setDoc(doc(hs, 'bai_nop', 'bn_4'), baiMau('bn_4', NGUOI.hs.email, 11, 10)),
    '21c. điểm lớn hơn điểm tối đa');
  await chan(setDoc(doc(hs, 'bai_nop', 'bn_5'), baiMau('bn_x', NGUOI.hs.email, 3, 10)),
    '21d. id trong dữ liệu khác id tài liệu');
  await chan(updateDoc(doc(hs, 'bai_nop', 'bn_1'), { score: 10 }),
    '21e. học sinh tự nâng điểm bài đã nộp');
  await duoc(getDoc(doc(hs, 'bai_nop', 'bn_1')),
    '21f. học sinh đọc bài của chính mình');
  await chan(getDoc(doc(hs2, 'bai_nop', 'bn_1')),
    '21g. học sinh đọc bài của bạn');
  await duoc(getDocs(query(collection(gv, 'bai_nop'), where('userEmail', 'in', [NGUOI.hs.email]))),
    '21h. giáo viên liệt kê bài của học sinh');
  await duoc(updateDoc(doc(gv, 'bai_nop', 'bn_1'), { score: 7, results: {} }),
    '21i. giáo viên chấm lại điểm');
  await chan(updateDoc(doc(gv, 'bai_nop', 'bn_1'), { userEmail: NGUOI.hs2.email }),
    '21j. giáo viên đổi chủ bài nộp');
  await chan(getDocs(collection(khach, 'bai_nop')),
    '21k. chưa đăng nhập liệt kê bài nộp');
  await chan(getDocs(collection(hs, 'bai_nop')),
    '21l. học sinh liệt kê bài của cả lớp');

  // 22: đề giáo viên giao cho lớp (22/09/2026)
  await duoc(setDoc(doc(gv, 'de_giao', 'de_2'), deMau('de_2', NGUOI.gv.email)),
    '22a. giáo viên giao đề đứng tên mình');
  await chan(setDoc(doc(gv, 'de_giao', 'de_3'), deMau('de_3', NGUOI.dong.email)),
    '22b. giáo viên giao đề đứng tên cô khác');
  await chan(setDoc(doc(gv, 'de_giao', 'de_4'), deMau('de_x', NGUOI.gv.email)),
    '22c. id trong dữ liệu khác id tài liệu');
  await chan(setDoc(doc(gv, 'de_giao', 'de_5'), deMau('de_5', NGUOI.gv.email, 51)),
    '22d. đề quá 50 câu');
  await duoc(getDoc(doc(hs, 'de_giao', 'de_1')),
    '22e. học sinh mở link đề của lớp');
  await duoc(getDocs(query(collection(hs, 'de_giao'), where('classId', '==', 'lop_1'))),
    '22f. học sinh liệt kê đề của lớp mình');
  await chan(setDoc(doc(hs, 'de_giao', 'de_6'), deMau('de_6', NGUOI.hs.email)),
    '22g. học sinh tự giao đề');
  await chan(updateDoc(doc(hs, 'de_giao', 'de_1'), { dong: true }),
    '22h. học sinh đóng đề của cô');
  await chan(deleteDoc(doc(hs, 'de_giao', 'de_1')),
    '22i. học sinh xoá đề');
  await chan(getDoc(doc(khach, 'de_giao', 'de_1')),
    '22j. chưa đăng nhập mở link đề');
  await duoc(updateDoc(doc(gv, 'de_giao', 'de_1'), { dong: true }),
    '22k. giáo viên đóng đề của mình');
  await chan(deleteDoc(doc(nhu(moi, NGUOI.dong), 'de_giao', 'de_1')),
    '22l. giáo viên khác xoá đề không phải của mình');

  // 23: những luật trước 03/10/2026 chưa có phép nào đo. Kẻ thử là `hs3` —
  //     học sinh chưa từng đổi vai. Mỗi chỗ chặn có phép đối chứng ĐƯỢC, để
  //     phép chặn không đạt vì một lý do khác.
  const hs3 = nhu(moi, NGUOI.hs3);
  // 23a-d: danh sách đồng quản trị. Ghi được vào đây là tự phong quản trị.
  await chan(setDoc(doc(hs3, 'quan_tri', 'dong_quan_tri'), { emails: [NGUOI.hs3.email] }),
    '23a. học sinh tự ghi mình vào danh sách đồng quản trị');
  await chan(getDoc(doc(hs3, 'quan_tri', 'dong_quan_tri')),
    '23b. học sinh đọc danh sách đồng quản trị');
  await chan(setDoc(doc(dong, 'quan_tri', 'dong_quan_tri'), { emails: [NGUOI.dong.email, NGUOI.gv.email] }),
    '23c. đồng quản trị tự thêm người vào danh sách');
  await duoc(setDoc(doc(chu, 'quan_tri', 'dong_quan_tri'), { emails: [NGUOI.dong.email] }),
    '23d. chủ dự án ghi danh sách đồng quản trị (giữ nguyên nội dung)');
  // 23e-f: lớp học
  await chan(setDoc(doc(hs3, 'classes', 'lop_hs'), { name: 'Lớp tự lập', inviteCode: 'HS000' }),
    '23e. học sinh tự tạo lớp');
  await chan(updateDoc(doc(hs3, 'classes', 'lop_1'), { inviteCode: 'HACK1' }),
    '23f. học sinh sửa mã mời của lớp');
  await duoc(getDoc(doc(hs3, 'classes', 'lop_1')), '23g. học sinh đọc lớp (đối chứng)');
  // 23h-j: kho nội dung chỉ giáo viên ghi. Câu sạch, để chỉ còn vai quyết định.
  await chan(setDoc(doc(hs3, 'bank_questions', 'cau_hs'), { q: 'Câu học sinh tự thêm?' }),
    '23h. học sinh thêm câu sạch vào bank_questions');
  await chan(deleteDoc(doc(hs3, 'bank_questions', 'cau_1')), '23i. học sinh xoá câu hỏi');
  for (const ten of ['questions', 'curriculum_chapters', 'exams', 'equations', 'matrix_resources']) {
    await chan(setDoc(doc(hs3, ten, 'x_hs'), { q: 'sạch' }), `23j. học sinh ghi \`${ten}\``);
  }
  // 23k-m: cấu hình hệ thống chỉ quản trị ghi
  await chan(setDoc(doc(gv, 'system_settings', 'chung'), { batAI: false }),
    '23k. giáo viên thường ghi `system_settings`');
  await chan(setDoc(doc(hs3, 'schools', 'truong_hs'), { ten: 'Trường giả' }),
    '23l. học sinh ghi `schools`');
  await duoc(setDoc(doc(chu, 'system_settings', 'chung'), { batAI: true }),
    '23m. quản trị ghi `system_settings` (đối chứng)');
  // 23n-p: tiến độ của từng em
  await duoc(getDoc(doc(hs, 'progress', NGUOI.hs.email)), '23n. học sinh đọc tiến độ của mình (đối chứng)');
  await chan(getDoc(doc(hs3, 'progress', NGUOI.hs.email)), '23o. học sinh đọc tiến độ của bạn');
  await chan(setDoc(doc(hs3, 'progress', NGUOI.hs.email), { diem: 0 }), '23p. học sinh ghi đè tiến độ của bạn');
  // 23q-t: lịch sử chat
  await duoc(getDoc(doc(hs, 'chats', 'chat_1')), '23q. học sinh đọc chat của mình (đối chứng)');
  await chan(getDoc(doc(hs3, 'chats', 'chat_1')), '23r. học sinh đọc chat của bạn');
  await chan(setDoc(doc(hs3, 'chats', 'chat_gia'), { userEmail: NGUOI.hs.email, noiDung: 'giả' }),
    '23s. học sinh tạo chat đứng tên bạn');
  await chan(deleteDoc(doc(hs3, 'chats', 'chat_1')), '23t. học sinh xoá chat của bạn');
  // 23u: collection không có trong luật thì chặn hết, kể cả quản trị
  await chan(setDoc(doc(chu, 'la_lung', 'x'), { a: 1 }), '23u. ghi vào collection không có trong luật');

  /* PHÉP TỰ PHÁ. Một bộ kiểm luôn xanh mà chưa bao giờ bắt được gì thì đáng
     ngờ hơn đáng mừng — bài học đã trả giá một lần, xem "Rút kinh nghiệm"
     trong CLAUDE.md. Ở đây ta vá luật TRONG BỘ NHỚ cho `allow delete` mở
     toang, rồi đòi phép 14 phải đổi kết quả. Không đổi nghĩa là bộ kiểm này
     không thực sự đọc luật, và mọi dòng OK phía trên đều vô nghĩa.
     Tệp `firestore.rules` trên đĩa KHÔNG bị đụng tới. */
  const luatPha = docLuat().replace(
    'allow delete: if laChuDuAn();',
    'allow delete: if true;',
  );
  if (luatPha === docLuat()) {
    dem(false, '19. phép tự phá',
      'không tìm thấy dòng `allow delete: if laChuDuAn();` để vá — luật đã đổi, sửa lại phép này');
  } else {
    const moiPha = await initializeTestEnvironment({
      projectId: CAU_HINH.DU_AN + '-pha',
      firestore: { rules: luatPha, host: '127.0.0.1', port: CAU_HINH.CONG },
    });
    await gieo(moiPha);
    const gvPha = nhu(moiPha, NGUOI.gv);
    let choQua = false;
    try { await assertSucceeds(deleteDoc(doc(gvPha, 'users', NGUOI.hs2.uid))); choQua = true; }
    catch { choQua = false; }
    dem(choQua, '19. phép tự phá — nới `allow delete` thì phép 14 phải đổi kết quả',
      choQua ? '' : 'nới luật mà kết quả không đổi: bộ kiểm này KHÔNG đọc luật thật');
    await moiPha.cleanup();
  }

  await moi.cleanup();
  return sai;
}

export const docLuat = () => readFileSync(join(GOC, 'firestore.rules'), 'utf8');
export const CAU_HINH = { DU_AN, CONG };

main();
