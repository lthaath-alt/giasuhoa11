/**
 * Sửa MỘT TRƯỜNG của vài câu hỏi trong ngân hàng, theo một "phiếu sửa" đã soạn
 * sẵn và đã được kiểm tay.
 *
 * Chạy thử (KHÔNG ghi gì, không cần đăng nhập):
 *   npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json
 * Ghi thật:
 *   npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json --that
 *
 * ─── Vì sao công cụ này tồn tại, và vì sao nó hẹp đến thế ───────────────────
 * CLAUDE.md chốt: "Chủ dự án tự sửa trên Firestore. Không có script nào ghi đè
 * ngân hàng — đó là dữ liệu thật của 1554 câu, một lỗi trong script là hỏng
 * hàng loạt." Luật đó ĐÚNG và vẫn giữ. Cái nó chặn là một script biết sửa
 * NHIỀU thứ; còn dán tay ba câu vào Firebase Console thì dễ gõ nhầm một ký tự
 * trong công thức hoá học mà không ai phát hiện ra.
 *
 * Nên công cụ này cố tình bị trói năm nấc:
 *
 *   1. KHÔNG tự biết phải sửa gì. Mọi thứ nằm trong phiếu sửa, một tệp JSON
 *      theo git, đọc được bằng mắt, và do người soạn sau khi đã kiểm tay.
 *   2. CHỈ ghi đúng những trường phiếu nêu. Không đụng `e`, `a`, `o`,
 *      `ansText`, `num`, `tol`, `lessonId`, `ch` hay bất cứ gì khác.
 *   3. ĐIỀU KIỆN TIÊN QUYẾT: giá trị hiện tại trên Firestore phải khớp TỪNG KÝ
 *      TỰ với `cuPhaiLa` trong phiếu. Lệch một dấu cách là bỏ qua câu đó. Nhờ
 *      vậy chạy lại lần hai không làm gì (đã sửa rồi thì không còn khớp), và
 *      phiếu soạn từ một bản chụp cũ không đè mất thứ người khác vừa sửa.
 *   4. MẶC ĐỊNH KHÔNG GHI. Phải thêm `--that` mới ghi, và lúc đó mới hỏi đăng
 *      nhập. Chạy thử không cần tài khoản vì `bank_questions` đọc công khai.
 *   5. KHÔNG XOÁ, KHÔNG TẠO. Chỉ `updateDoc` trên tài liệu đã có.
 *
 * Mật khẩu hỏi ngay tại máy, hiện dấu sao, KHÔNG nhận qua tham số dòng lệnh và
 * không lưu ở đâu — cùng lối với `liet-ke:tai-khoan`. Luật Firestore đòi vai
 * giáo viên trở lên mới ghi được `bank_questions`.
 *
 * Sau khi ghi xong PHẢI đồng bộ lại bản chụp trong repo:
 *   npm run xuat:ngan-hang && npm run gan:cau-hoi
 */
import { readFileSync } from 'node:fs';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { docEnv, cauHinh, thieuCauHinh, COL, docTepNganHang } from './ngan-hang-chung.mts';
import { hoi, hoiKin } from './hoi-ban-phim.mts';
import { CHEMISTRY_11_CURRICULUM } from '../src/features/lessons/constants.ts';

interface MucSua {
  id: string;
  /** Tên trường được phép sửa: `q`, hoặc `st` (xem `y`). Mở rộng thì sửa DUOC_SUA. */
  truong: string;
  /** Chỉ với `st`/`stV`: số thứ tự ý (tính từ 0). */
  y?: number;
  /** Giá trị hiện tại, phải khớp từng ký tự thì mới ghi. Với `st` là chữ `s`,
   *  với `stV` là đáp án `v` của ý `y`. Kiểu theo trường — xem KIEU. */
  cuPhaiLa: string | number | boolean;
  moi: string | number | boolean;
  /** Bắt buộc `true` khi sửa trường ĐÁP ÁN (xem DAP_AN). */
  doiDapAn?: boolean;
}

/* Danh sách trắng. Mở rộng thì phải tự hỏi: trường đó có phải thứ học sinh
   nhìn thấy không, và sửa sai nó thì ai phát hiện ra? `a`/`num`/`tol` là đáp
   án — sửa nhầm là cả lớp bị chấm sai mà điểm vẫn trông hợp lý.

   `st` mở thêm ngày 26/09/2026 (chủ dự án duyệt) cho câu bdr93: một ý đúng/sai
   viết mơ hồ, học sinh hiểu đúng hoá học vẫn bị chấm sai. `st` là MẢNG chứa
   cả chữ (`s`) lẫn ĐÁP ÁN (`v`) của từng ý, nên nó bị trói chặt hơn `q`: chỉ
   đổi chữ của ĐÚNG MỘT ý; số ý, mọi `v`, và chữ các ý khác phải giữ nguyên —
   `mangMoiSt` kiểm lại điều đó trước khi ghi, và phần đọc lại kiểm lần nữa. */
const DUOC_SUA = new Set(['q', 'st', 'lessonId', 'e', 'num', 'ansText', 'a', 'stV']);

/* ĐÁP ÁN mở thêm 26/09/2026 (chủ dự án duyệt) cho ba câu sai khoá thật — cùng
   bộ số SO₂/O₂, ngân hàng tính hiệu suất theo chất DƯ nên ghi 40 % thay vì
   60 %: học sinh làm đúng bị chấm sai. Đây là loại sửa nguy nhất, nên:
     · phiếu phải ghi `doiDapAn: true` — không ai đổi đáp án "tiện tay";
     · đúng kiểu dữ liệu (số / chữ / đúng-sai), xem KIEU;
     · đổi `num` thì phải đổi `ansText` của cùng câu trong cùng phiếu (hai
       trường cùng mang đáp số, lệch nhau là chấm theo một bên);
     · `a` phải trỏ tới phương án có thật; in chữ của phương án cũ và mới;
     · `stV` chỉ đổi `v` của ĐÚNG MỘT ý, mọi thứ khác trong `st` giữ nguyên.
   `e` (lời giải) không phải đáp án nhưng học sinh đọc nó — mở cùng lúc để
   lời giải khớp đáp án mới. `tol` vẫn khoá. */
const DAP_AN = new Set(['num', 'ansText', 'a', 'stV']);
const KIEU: Record<string, (v: unknown) => boolean> = {
  num: v => typeof v === 'number' && Number.isFinite(v),
  a: v => Number.isInteger(v) && (v as number) >= 0,
  stV: v => typeof v === 'boolean',
  /* Câu CHƯA gắn bài không có `lessonId`: phiếu ghi `cuPhaiLa: null` (27/09/2026,
     cho 9 câu Chương 3). `moi` vẫn phải là bai-N — kiểm ở vòng hình dạng. */
  lessonId: v => v === null || (typeof v === 'string' && v.length > 0),
};
const kieuDung = (truong: string, v: unknown) =>
  (KIEU[truong] ?? ((x: unknown) => typeof x === 'string' && x.length > 0))(v);

/* `lessonId` mở thêm cùng ngày (chủ dự án duyệt) cho 14 câu gắn nhầm bài. Nó
   quyết định câu hiện ở bài nào, không phải đáp án — nhưng chuyển SANG CHƯƠNG
   KHÁC thì `ch`/`chapterId` lệch theo, nên chỉ cho chuyển trong cùng chương.
   Chương của từng bài lấy từ bản chụp: bài nào ứng với đúng một chương.
   Bài CHƯA có câu nào trong bản chụp (bai-19, 27/09/2026) thì bản chụp không
   biết — lấy từ chương trình KNTT trong `constants.ts`. Hai nguồn cùng biết
   mà nói khác nhau thì coi như không biết, script dừng. */
const BAI_HOP_LE = /^bai-\d+$/;
function chuongCuaBai(): Map<string, unknown> {
  const dem = new Map<string, Set<unknown>>();
  for (const c of docTepNganHang() ?? []) {
    const b = c.lessonId as string | undefined;
    if (b) dem.set(b, (dem.get(b) ?? new Set()).add(c.ch));
  }
  const tuBanChup = new Map([...dem].filter(([, s]) => s.size === 1).map(([b, s]) => [b, [...s][0]]));
  const kq = new Map<string, unknown>();
  for (const chuong of CHEMISTRY_11_CURRICULUM) {
    const so = Number(chuong.id.replace('chuong-', ''));
    for (const bai of chuong.lessons) {
      const chup = tuBanChup.get(bai.id);
      if (chup === undefined || chup === so) kq.set(bai.id, so);
    }
  }
  return kq;
}

type Y = { s: string; v: boolean };

const laMangSt = (truong: string) => truong === 'st' || truong === 'stV';

/** Giá trị hiện tại của thứ phiếu nhắm tới (`st` → `st[y].s`, `stV` → `st[y].v`). */
function giaTri(d: Record<string, unknown> | undefined, m: MucSua): unknown {
  if (m.truong === 'lessonId') return d?.lessonId ?? null;
  if (!laMangSt(m.truong)) return d?.[m.truong];
  const st = d?.st;
  const y = Array.isArray(st) ? (st[m.y!] as Y | undefined) : undefined;
  return m.truong === 'st' ? y?.s : y?.v;
}

/** Mảng `st` mới: chỉ đổi `s` (hoặc `v` với `stV`) của ý `y`. Ném lỗi nếu có gì khác bị đổi theo. */
function mangMoiSt(cu: Y[], m: MucSua): Y[] {
  const doiChu = m.truong === 'st';
  const moi = cu.map((x, i) => (i !== m.y ? { ...x } : doiChu ? { ...x, s: m.moi as string } : { ...x, v: m.moi as boolean }));
  const khac = moi.some((x, i) => (i !== m.y || !doiChu) && x.s !== cu[i].s)
    || moi.some((x, i) => (i !== m.y || doiChu) && x.v !== cu[i].v);
  if (moi.length !== cu.length || khac) throw new Error('mảng st mới đổi nhiều hơn một thứ của một ý');
  return moi;
}

const cacCo = process.argv.slice(2);
const tepPhieu = cacCo.find(t => !t.startsWith('--'));
const ghiThat = cacCo.includes('--that');
const hienMatKhau = cacCo.includes('--hien');

if (!tepPhieu) {
  console.error('Thiếu tệp phiếu sửa.');
  console.error('  npm run sua:cau-hoi -- docs/soat-hoa-hoc/sua-3-cau-Kc.json');
  process.exit(1);
}

let phieu: MucSua[];
try {
  phieu = JSON.parse(readFileSync(tepPhieu, 'utf8'));
} catch (e) {
  console.error(`Không đọc được phiếu sửa: ${(e as Error).message}`);
  process.exit(1);
}
if (!Array.isArray(phieu) || !phieu.length) {
  console.error('Phiếu sửa phải là một mảng và phải có ít nhất một mục.');
  process.exit(1);
}

/* Kiểm hình dạng phiếu TRƯỚC khi chạm mạng. Một phiếu thiếu `cuPhaiLa` mà lọt
   qua là mất luôn hàng rào số 3. */
for (const [i, m] of phieu.entries()) {
  const thieu = (['id', 'truong'] as const).filter(k => typeof m?.[k] !== 'string' || !m[k]);
  if (thieu.length) {
    console.error(`Mục ${i + 1} thiếu hoặc sai kiểu: ${thieu.join(', ')}`);
    process.exit(1);
  }
  if (!DUOC_SUA.has(m.truong)) {
    console.error(`Mục ${i + 1} (${m.id}) xin sửa trường "${m.truong}" — không nằm `
      + `trong danh sách được phép: ${[...DUOC_SUA].join(', ')}`);
    process.exit(1);
  }
  if (!kieuDung(m.truong, m.cuPhaiLa) || !kieuDung(m.truong, m.moi)) {
    console.error(`Mục ${i + 1} (${m.id}) có cuPhaiLa/moi sai kiểu cho trường \`${m.truong}\``);
    process.exit(1);
  }
  if (DAP_AN.has(m.truong) && m.doiDapAn !== true) {
    console.error(`Mục ${i + 1} (${m.id}) sửa trường ĐÁP ÁN \`${m.truong}\` nhưng phiếu không ghi "doiDapAn": true`);
    process.exit(1);
  }
  if (laMangSt(m.truong) && !(Number.isInteger(m.y) && m.y! >= 0 && m.y! <= 3)) {
    console.error(`Mục ${i + 1} (${m.id}) sửa \`${m.truong}\` nhưng thiếu \`y\` hợp lệ (số thứ tự ý, 0–3)`);
    process.exit(1);
  }
  if (m.truong === 'num' && !phieu.some(k => k.id === m.id && k.truong === 'ansText')) {
    console.error(`Mục ${i + 1} (${m.id}) đổi \`num\` mà không đổi \`ansText\` của cùng câu — hai trường sẽ lệch nhau`);
    process.exit(1);
  }
  if (m.truong === 'lessonId' && !((m.cuPhaiLa === null || BAI_HOP_LE.test(m.cuPhaiLa as string)) && BAI_HOP_LE.test(m.moi as string))) {
    console.error(`Mục ${i + 1} (${m.id}) sửa \`lessonId\` nhưng giá trị không có dạng bai-N`);
    process.exit(1);
  }
  if (m.cuPhaiLa === m.moi) {
    console.error(`Mục ${i + 1} (${m.id}) có giá trị mới TRÙNG giá trị cũ — phiếu soạn nhầm?`);
    process.exit(1);
  }
}

const env = docEnv();
const thieuCH = thieuCauHinh(env);
if (thieuCH.length) {
  console.error(`Thiếu cấu hình Firebase: ${thieuCH.join(', ')}`);
  process.exit(1);
}

const app = getApps().length ? getApp() : initializeApp(cauHinh(env));
const db = getFirestore(app);

console.log(`\nPhiếu sửa: ${tepPhieu}`);
console.log(`${phieu.length} câu, trường: ${[...new Set(phieu.map(m => m.truong))].join(', ')}`);
console.log(ghiThat ? '\n*** CHẾ ĐỘ GHI THẬT ***' : '\nChạy thử — KHÔNG ghi gì. Thêm `--that` để ghi thật.');

// ── Đối chiếu với Firestore trước, đăng nhập sau ────────────────────────────
//
// Đọc `bank_questions` không cần đăng nhập (luật để `allow read: if true` cho
// workflow đồng bộ đêm). Nhờ vậy chạy thử không đòi mật khẩu, và người dùng
// thấy TRƯỚC là sẽ đổi những gì rồi mới quyết định có gõ mật khẩu hay không.

/* `stCu`: ảnh chụp nguyên mảng `st` lúc đối chiếu. Trước khi ghi đọc lại và so
   nguyên mảng — ai sửa ý KHÁC trong lúc đó thì bỏ qua, không đè mất. */
interface SanSang { muc: MucSua; stCu?: string; }
const sanSang: SanSang[] = [];
let boQua = 0;
let khongThay = 0;

for (const muc of phieu) {
  const anh = await getDoc(doc(db, COL, muc.id));
  if (!anh.exists()) {
    console.log(`\n  KHÔNG THẤY  ${muc.id}`);
    khongThay++;
    continue;
  }
  const duLieu = anh.data() as Record<string, unknown>;
  const hienTai = giaTri(duLieu, muc);

  if (hienTai === muc.moi) {
    console.log(`\n  ĐÃ SỬA RỒI  ${muc.id} — bỏ qua`);
    boQua++;
    continue;
  }
  if (hienTai !== muc.cuPhaiLa) {
    console.log(`\n  LỆCH        ${muc.id} — KHÔNG ghi`);
    console.log(`    Phiếu chờ : ${JSON.stringify(String(muc.cuPhaiLa).slice(0, 90))}`);
    console.log(`    Firestore : ${JSON.stringify(String(hienTai).slice(0, 90))}`);
    console.log('    Ai đó đã sửa câu này sau khi soạn phiếu. Soạn lại phiếu rồi chạy lại.');
    boQua++;
    continue;
  }

  if (muc.truong === 'a') {
    const o = duLieu.o as string[] | undefined;
    if (!Array.isArray(o) || (muc.moi as number) >= o.length) {
      console.log(`\n  DỪNG        ${muc.id} — đáp án mới ${String(muc.moi)} không trỏ tới phương án nào (có ${o?.length ?? 0} phương án)`);
      boQua++;
      continue;
    }
  }

  if (muc.truong === 'lessonId') {
    const chuongMoi = chuongCuaBai().get(muc.moi as string);
    if (chuongMoi === undefined || chuongMoi !== duLieu.ch) {
      console.log(`\n  DỪNG        ${muc.id} — ${muc.moi} thuộc chương ${String(chuongMoi ?? '?')}, câu đang ở chương ${String(duLieu.ch)}; chỉ chuyển trong cùng chương`);
      boQua++;
      continue;
    }
  }

  let stCu: string | undefined;
  if (laMangSt(muc.truong)) {
    const cu = duLieu.st as Y[];
    try { mangMoiSt(cu, muc); } catch (e) {
      console.log(`\n  DỪNG        ${muc.id} — ${(e as Error).message}`);
      boQua++;
      continue;
    }
    stCu = JSON.stringify(cu);
  }

  const y = laMangSt(muc.truong) ? (duLieu.st as Y[])[muc.y!] : undefined;
  const noi = muc.truong === 'st' ? `\`st[${muc.y}].s\` (đáp án v = ${y!.v}, giữ nguyên)`
    : muc.truong === 'stV' ? `\`st[${muc.y}].v\` — ý: "${y!.s.slice(0, 70)}"`
    : `\`${muc.truong}\``;
  const dapAn = DAP_AN.has(muc.truong);
  console.log(`\n  SẼ SỬA      ${muc.id}  ·  trường ${noi}${dapAn ? '   *** ĐỔI ĐÁP ÁN ***' : ''}`);
  const chuPA = (i: unknown) => (muc.truong === 'a' ? `  ("${(duLieu.o as string[])[i as number]}")` : '');
  console.log(`    cũ  : ${String(muc.cuPhaiLa)}${chuPA(muc.cuPhaiLa)}`);
  console.log(`    mới : ${String(muc.moi)}${chuPA(muc.moi)}`);
  sanSang.push({ muc, stCu });
}

console.log(`\n${'─'.repeat(70)}`);
console.log(`Sẽ sửa: ${sanSang.length} · Bỏ qua: ${boQua} · Không thấy: ${khongThay}`);

if (!sanSang.length) {
  console.log('\nKhông có gì để ghi.');
  process.exit(khongThay ? 1 : 0);
}

if (!ghiThat) {
  console.log('\nĐây mới là chạy thử. Xem kỹ phần "cũ"/"mới" ở trên, đúng rồi thì chạy lại với `--that`.');
  process.exit(0);
}

// ── Ghi thật: tới đây mới cần đăng nhập ─────────────────────────────────────
//
// Hai đường, cùng một lối với `E2E_EMAIL`/`E2E_MATKHAU` của bộ kiểm trình
// duyệt:
//
//   • `GIAO_VIEN_EMAIL` + `GIAO_VIEN_MATKHAU` trong `.env.local` — để lệnh
//     chạy được mà không cần ai ngồi gõ. `.gitignore` chặn `.env*`.
//   • Không có thì hỏi ngay tại máy, hiện dấu sao.
//
// Dù đường nào cũng KHÔNG nhận mật khẩu qua tham số dòng lệnh: dòng lệnh nằm
// trong lịch sử shell và trong danh sách tiến trình của cả máy.
//
// Tài khoản đó chỉ cần vai `teacher`. Đừng dùng tài khoản `admin`: ghi
// `bank_questions` không cần tới nó, mà một tài khoản quản trị nằm trong tệp
// trên đĩa thì mở thêm cả `users` nếu máy bị lộ.
console.log('\nLuật Firestore chỉ cho vai GIÁO VIÊN trở lên ghi `bank_questions`.');

let email = env.GIAO_VIEN_EMAIL ?? '';
let matKhau = env.GIAO_VIEN_MATKHAU ?? '';

if (email && matKhau) {
  console.log(`Dùng tài khoản trong .env.local: ${email}`);
} else {
  if (email || matKhau) {
    console.log('(.env.local mới có một nửa — cần CẢ GIAO_VIEN_EMAIL lẫn GIAO_VIEN_MATKHAU)');
  }
  email = await hoi('Email : ');
  if (!email) { console.error('Chưa nhập email.'); process.exit(1); }
  matKhau = await hoiKin(hienMatKhau ? 'Mật khẩu (HIỆN CHỮ): ' : 'Mật khẩu (hiện dấu sao): ', hienMatKhau);
  if (!matKhau) { console.error('Chưa nhập mật khẩu.'); process.exit(1); }
}

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

/* In VAI ra cho thấy. Luật cho `get` hồ sơ của chính mình nên chỗ này tốn đúng
   một lượt đọc. Nó trả lời ngay hai câu hay phải đoán: tài khoản có đủ vai để
   ghi không, và có đang dùng nhầm một tài khoản quyền cao hơn mức cần không. */
if (uidToi) {
  try {
    const vai = (await getDoc(doc(db, 'users', uidToi))).data()?.role ?? '(không đọc được)';
    console.log(`Vai: ${vai}`);
    if (vai === 'student') {
      console.error('Vai `student` KHÔNG ghi được `bank_questions`. Dừng lại trước khi tốn công.');
      process.exit(1);
    }
    if (vai === 'admin' || vai === 'school_admin') {
      console.log('Lưu ý: việc này chỉ cần vai `teacher`. Dùng tài khoản quyền cao hơn mức cần là rủi ro thừa.');
    }
  } catch {
    console.log('Vai: (không đọc được hồ sơ — cứ thử ghi, luật sẽ nói không)');
  }
}
console.log('');

/* Mảng `st` mà CHÍNH lượt này đã ghi, theo id. Một câu có thể có nhiều mục
   `st` (hai ý của `cfgww`, 27/09/2026): ghi ý trước xong thì mảng trên
   Firestore khác `stCu` chụp lúc đối chiếu, và trước đây mục sau bị bỏ qua như
   thể người khác vừa sửa. So với bản mình vừa ghi thì mới phân biệt được. */
const stDaGhi = new Map<string, string>();
let xong = 0;
let hong = 0;
for (const { muc, stCu } of sanSang) {
  try {
    /* `updateDoc` chứ KHÔNG `setDoc`: setDoc thay cả tài liệu, tức mọi trường
       không nhắc tới sẽ biến mất. Đây đúng là kiểu "một lỗi trong script là
       hỏng hàng loạt" mà CLAUDE.md cảnh báo. */
    let giaTriGhi: unknown = muc.moi;
    if (laMangSt(muc.truong)) {
      const stGio = (await getDoc(doc(db, COL, muc.id))).data()?.st as Y[];
      if (JSON.stringify(stGio) !== (stDaGhi.get(muc.id) ?? stCu)) {
        console.log(`  BỎ QUA  ${muc.id} — mảng st đã đổi sau lúc đối chiếu`);
        hong++;
        continue;
      }
      /* Hai mục cùng một ý: mục sau không còn gặp chữ cũ nó chờ. */
      if (giaTri({ st: stGio }, muc) !== muc.cuPhaiLa) {
        console.log(`  BỎ QUA  ${muc.id} — ý ${muc.y} không còn là giá trị phiếu chờ`);
        hong++;
        continue;
      }
      giaTriGhi = mangMoiSt(stGio, muc);
    }
    await updateDoc(doc(db, COL, muc.id), { [laMangSt(muc.truong) ? 'st' : muc.truong]: giaTriGhi });
    if (laMangSt(muc.truong)) stDaGhi.set(muc.id, JSON.stringify(giaTriGhi));
    console.log(`  ĐÃ GHI  ${muc.id}`);
    xong++;
  } catch (e) {
    console.error(`  HỎNG    ${muc.id}: ${(e as { code?: string }).code ?? e}`);
    console.error('          permission-denied = tài khoản này chưa đủ vai giáo viên.');
    hong++;
  }
}

// ── Đọc lại để xác nhận, đừng tin thông báo của chính mình ──────────────────
//
// Bài học số 1 trong CLAUDE.md: đã có lần script in ra "thành công" trong khi
// chưa ghi được gì. Đọc lại là cách duy nhất biết chắc.
console.log('\nĐọc lại từ Firestore để xác nhận:');
let khop = 0;
for (const { muc, stCu } of sanSang) {
  const anh = await getDoc(doc(db, COL, muc.id));
  const duLieu = anh.data() as Record<string, unknown> | undefined;
  let dung = giaTri(duLieu, muc) === muc.moi;
  /* Với `st`/`stV` còn phải chắc mọi thứ khác trong mảng y như trước — tức
     đúng bằng mảng cuối cùng lượt này đã ghi cho câu đó (gồm cả các ý khác
     của cùng câu trong phiếu). Câu chưa ghi được thì không có mảng để so. */
  if (dung && laMangSt(muc.truong) && stCu) {
    dung = stDaGhi.get(muc.id) === JSON.stringify(duLieu?.st);
  }
  if (dung) khop++;
  console.log(`  ${dung ? 'ĐÚNG' : 'SAI '}  ${muc.id}`);
}

await signOut(auth).catch(() => { /* thoát được thì tốt, không thì thôi */ });

console.log(`\n${'─'.repeat(70)}`);
console.log(`Ghi: ${xong} · Hỏng: ${hong} · Đọc lại khớp: ${khop}/${sanSang.length}`);
if (khop === sanSang.length && !hong) {
  console.log('\nBước cuối, ĐỪNG QUÊN — bản chụp trong repo vẫn đang mang đề cũ:');
  console.log('  npm run xuat:ngan-hang && npm run gan:cau-hoi');
}
process.exit(hong || khop !== sanSang.length ? 1 : 0);
