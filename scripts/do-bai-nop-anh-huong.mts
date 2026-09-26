/**
 * Đo xem bài nộp nào dính câu hỏi vừa sửa ĐÁP ÁN — CHỈ ĐỌC.
 *
 * Chạy:  npx tsx scripts/do-bai-nop-anh-huong.mts
 *
 * Sinh ngày 26/09/2026, sau khi sửa khoá sai của ba câu cùng bộ số SO₂/O₂
 * (`docs/soat-hoa-hoc/sua-3-cau-dap-an-sai.json`): hiệu suất đúng là 60 %,
 * ngân hàng từng ghi 40 %. Bài nộp lưu NGUYÊN câu hỏi và đáp án lúc làm, nên
 * sửa ngân hàng không chấm lại bài cũ. Script này chỉ trả lời: bài nào dính,
 * em đó trả lời gì, bị chấm oan hay được điểm oan.
 *
 * Ba câu không ảnh hưởng như nhau (xem `toLegacy` trong src/features/bank/convert.ts):
 *   r59e7 (mc)  khoá lưu là chữ cái: cũ B, đúng là D.
 *   fb6ic (tn)  chấm tự luận so với "Đáp án: 40 %"; em trả lời 60 dễ bị chấm sai.
 *   s8953 (tf)  bài kiểm tra gộp 4 ý thành MỘT mệnh đề "đúng khi mọi ý đúng";
 *               ý 3 vẫn Sai nên khoá gộp trước và sau đều là "Sai" — không lệch.
 *
 * KHÔNG in email hay tên: dữ liệu của học sinh vị thành niên. Mỗi em hiện bằng
 * 8 ký tự đầu của SHA-256(email) — đủ đếm số em, không đủ để người ngoài biết
 * là ai. Giáo viên tra bài theo MÃ BÀI NỘP trên trang theo dõi.
 *
 * Không ghi gì lên Firestore; tài khoản giáo viên chỉ dùng để ĐỌC `bai_nop`
 * (luật chặn `list` với vai khác). Mật khẩu hỏi tại máy như `sua:cau-hoi`.
 */
import { createHash } from 'node:crypto';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { docEnv, cauHinh, thieuCauHinh } from './ngan-hang-chung.mts';
import { hoi, hoiKin } from './hoi-ban-phim.mts';

const CAU: Record<string, { loai: string; dungMoi: (tl: string) => boolean; ghiChu: string }> = {
  bq_1789373737083_r59e7: { loai: 'mc', dungMoi: tl => tl.trim().toUpperCase() === 'D', ghiChu: 'khoá cũ B (40 %), đúng là D (60 %)' },
  bq_1789373737083_fb6ic: { loai: 'tn', dungMoi: tl => /(^|[^\d])60([^\d]|$)/.test(tl.replace(/\s/g, '')), ghiChu: 'đúng là 60' },
  bq_1789373737083_s8953: { loai: 'tf', dungMoi: () => false, ghiChu: 'khoá gộp vẫn "Sai" — không lệch điểm' },
};

const env = docEnv();
const thieu = thieuCauHinh(env);
if (thieu.length) { console.error(`Thiếu cấu hình Firebase: ${thieu.join(', ')}`); process.exit(1); }
const app = getApps().length ? getApp() : initializeApp(cauHinh(env));

let email = env.GIAO_VIEN_EMAIL ?? '';
let matKhau = env.GIAO_VIEN_MATKHAU ?? '';
if (!(email && matKhau)) {
  email = await hoi('Email giáo viên : ');
  matKhau = await hoiKin('Mật khẩu (hiện dấu sao): ', process.argv.includes('--hien'));
}
const auth = getAuth(app);
try { await signInWithEmailAndPassword(auth, email, matKhau); } catch (e) {
  console.error(`Đăng nhập không được: ${(e as { code?: string }).code ?? 'lỗi không rõ'}`);
  process.exit(1);
}

const anh = await getDocs(collection(getFirestore(app), 'bai_nop'));
console.log(`\nĐọc ${anh.size} bài nộp.`);

const bam = (s: string) => createHash('sha256').update(s.toLowerCase()).digest('hex').slice(0, 8);
let dinh = 0, oan = 0, duocOan = 0;
const em = new Set<string>();
for (const d of anh.docs) {
  const b = d.data() as {
    questions?: { id: string }[]; answers?: Record<string, string>;
    results?: Record<string, { correct?: boolean; score?: number; maxScore?: number; correctAnswer?: string; studentAnswer?: string }>;
    userEmail?: string; createdAt?: string; tenDe?: string; lessonId?: string; status?: string;
  };
  for (const q of b.questions ?? []) {
    const cau = CAU[q.id];
    if (!cau) continue;
    dinh++;
    em.add(bam(b.userEmail ?? ''));
    const kq = b.results?.[q.id];
    const tl = kq?.studentAnswer ?? b.answers?.[q.id] ?? '';
    const dungMoi = cau.dungMoi(tl);
    const chamDung = kq?.correct === true;
    let ketLuan = 'không lệch';
    if (cau.loai !== 'tf' && dungMoi && !chamDung) { ketLuan = 'BỊ CHẤM OAN (trả lời đúng, bị chấm sai)'; oan++; }
    else if (cau.loai !== 'tf' && !dungMoi && chamDung) { ketLuan = 'ĐƯỢC ĐIỂM OAN (trả lời theo khoá sai)'; duocOan++; }
    console.log(`\n  bài ${d.id}  ·  em ${bam(b.userEmail ?? '')}  ·  ${String(b.createdAt ?? '').slice(0, 10)}  ·  ${b.tenDe ?? b.lessonId ?? ''}  ·  ${b.status ?? ''}`);
    console.log(`    câu ${q.id.slice(-5)} (${cau.loai}; ${cau.ghiChu})`);
    console.log(`    em trả lời: ${JSON.stringify(tl).slice(0, 60)}  ·  đã chấm: ${kq ? (chamDung ? 'ĐÚNG' : 'SAI') + ` ${kq.score ?? '?'}/${kq.maxScore ?? '?'}` : 'chưa chấm'}  ·  khoá lưu: ${JSON.stringify(kq?.correctAnswer ?? '').slice(0, 30)}`);
    console.log(`    → ${ketLuan}`);
  }
}
await signOut(auth).catch(() => {});

console.log(`\n${'─'.repeat(70)}`);
console.log(`Lượt dính: ${dinh} (trên ${em.size} em) · Bị chấm oan: ${oan} · Được điểm oan: ${duocOan}`);
if (!dinh) console.log('Không bài nộp nào có ba câu này — không cần chấm lại.');
process.exit(0);
