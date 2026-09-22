/**
 * Kiểm tra phần "giáo viên giao đề cho lớp".
 *
 * Chạy:  npm run kiem-tra:de-giao
 *
 * Không gọi mạng. CỐ Ý chỉ import `taoDeGiao.ts` chứ không import
 * `deGiaoService.ts`: service kéo theo firebase, mà firebase gọi `getAuth()`
 * ngay lúc import và ném lỗi khi chạy ngoài Vite. Phần đáng kiểm là logic
 * thuần, và nó đã được tách ra đúng để kiểm được như vậy.
 *
 * Đây là vùng sai thì KHÔNG AI THẤY. Bốn cách hỏng đã lường trước:
 *
 *   1. Mã bài làm không ổn định → mỗi lần em mở lại link là một đề mới, và
 *      mỗi lần nộp là thêm một dòng điểm trong bảng của giáo viên.
 *   2. Hết giờ tính sai → em mở link lúc 23h50 vẫn có trọn 45 phút, nộp lúc
 *      0h35 hôm sau trong khi cô đã chốt điểm.
 *   3. `lessonId` trùng một bài thật → `QuizPage` khoá bài kiểm tra của cô lại
 *      vì em "chưa học xong bài trước".
 *   4. Bài nộp mang trường mà `firestore.rules` không khai → luật dùng
 *      `hasOnly`, nên em bấm nộp là bị từ chối, im lặng, ở đúng lúc tệ nhất.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import {
  TIEN_TO_DE_GIAO, hetGioLuc, maBaiLam, taoBaiLam, tongDiem, trangThaiDe,
} from '../src/features/quiz/taoDeGiao';
import { coPhuongAnNeo, xaoPhuongAnWeb } from '../src/features/bank/xaoDapAn';
import { fromLegacy, toLegacy } from '../src/features/bank/convert';
import { chuanHoaCau } from '../src/features/bank/types';
import type { BankQuestion } from '../src/features/bank/types';
import { DE_MAU_CAN_BANG } from '../src/features/quiz/deMauCanBang';
import { CHEMISTRY_11_CURRICULUM } from '../src/features/lessons/constants';
import type { Question } from '../src/features/library/types';
import type { DeGiao } from '../src/features/quiz/types';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten + (chiTiet ? '  — ' + chiTiet : ''));
  if (!dieu) hong++;
};

// ─── Đề dựng sẵn: 10 câu trắc nghiệm, đúng khuôn cô giao ─────────────────────

const cau = (i: number): Question => ({
  id: `q${i}`,
  type: 'Trắc nghiệm',
  difficulty: 'Trung bình',
  points: 1,
  content: `Câu ${i}?`,
  images: [],
  options: [
    { key: 'A', text: 'A' + i }, { key: 'B', text: 'B' + i },
    { key: 'C', text: 'C' + i }, { key: 'D', text: 'D' + i },
  ],
  correctAnswer: 'B',
  createdAt: '2026-09-22T00:00:00.000Z',
});

const MO = Date.parse('2026-09-22T07:00:00.000Z');
const DONG = Date.parse('2026-09-22T09:00:00.000Z');

const deMau = (sua: Partial<DeGiao> = {}): DeGiao => ({
  id: 'de_1758500000000_123',
  tieuDe: 'Kiểm tra 15 phút — Chương 2',
  classId: 'lop_a3',
  tenLop: '11A3',
  teacherEmail: 'co@truong.local',
  teacherName: 'Cô Lan',
  questions: Array.from({ length: 10 }, (_, i) => cau(i + 1)),
  maxScore: 10,
  soPhut: 45,
  moLuc: new Date(MO).toISOString(),
  dongLuc: new Date(DONG).toISOString(),
  createdAt: new Date(MO).toISOString(),
  dong: false,
  ...sua,
});

// ─── Trạng thái đề theo thời gian ────────────────────────────────────────────

console.log('\n== Đề mở lúc nào, đóng lúc nào ==');
{
  const de = deMau();
  ok(trangThaiDe(de, MO - 60_000) === 'chua-mo', 'trước giờ mở → chưa mở');
  ok(trangThaiDe(de, MO) === 'dang-mo', 'đúng giây mở → đang mở');
  ok(trangThaiDe(de, (MO + DONG) / 2) === 'dang-mo', 'giữa giờ → đang mở');
  ok(trangThaiDe(de, DONG + 1) === 'da-dong', 'quá hạn nộp → đã đóng');
  /* Cô bấm "Đóng đề sớm" thì phải đóng NGAY, kể cả khi hạn ghi trên đề còn xa
     — nếu không, cô kết thúc tiết kiểm tra rồi mà em vẫn vào làm tiếp được. */
  ok(trangThaiDe(deMau({ dong: true }), MO + 1000) === 'da-dong', 'cô đóng sớm thì đóng ngay, bất kể hạn');
}

// ─── Mã bài làm ──────────────────────────────────────────────────────────────

console.log('\n== Mã bài làm của từng em ==');
{
  const de = deMau();
  const ma = maBaiLam(de.id, 'an.nguyen@truong.local');

  ok(ma === maBaiLam(de.id, 'an.nguyen@truong.local'), 'gọi hai lần ra cùng một mã (mở lại link là gặp lại bài cũ)');
  ok(ma === maBaiLam(de.id, '  An.Nguyen@Truong.Local '), 'hoa/thường và khoảng trắng không đẻ ra mã thứ hai');
  ok(ma !== maBaiLam(de.id, 'binh@truong.local'), 'hai em khác nhau thì hai mã khác nhau');
  ok(ma !== maBaiLam('de_khac', 'an.nguyen@truong.local'), 'hai đề khác nhau thì hai mã khác nhau');

  /* Mã này cũng là id tài liệu `bai_nop/{id}`. Firestore từ chối id chứa dấu
     `/`, và từ chối id chỉ gồm dấu chấm. */
  ok(!ma.includes('/'), 'mã không chứa dấu / (id tài liệu Firestore)', ma);
  ok(/^[a-z0-9_-]+$/.test(ma), 'mã chỉ gồm ký tự an toàn', ma);
  ok(ma.length < 1500, 'mã ngắn hơn giới hạn 1500 byte của id tài liệu');
}

// ─── Hết giờ làm bài ─────────────────────────────────────────────────────────

console.log('\n== Hết giờ lúc nào ==');
{
  const de = deMau();                       // 45 phút, hạn 09:00

  const somSua = Date.parse('2026-09-22T07:10:00.000Z');
  ok(hetGioLuc(de, somSua) === new Date(somSua + 45 * 60_000).toISOString(),
    'vào sớm thì được trọn 45 phút', hetGioLuc(de, somSua));

  /* Vào lúc 08:30 mà đề đóng lúc 09:00: chỉ còn 30 phút, KHÔNG phải 45. Bỏ vế
     này là em nộp sau khi cô đã chốt điểm. */
  const muon = Date.parse('2026-09-22T08:30:00.000Z');
  ok(hetGioLuc(de, muon) === new Date(DONG).toISOString(),
    'vào muộn thì cắt theo hạn nộp, không được trọn số phút', hetGioLuc(de, muon));

  ok(new Date(hetGioLuc(de, somSua)).getTime() > somSua, 'mốc hết giờ luôn nằm sau lúc bắt đầu');
}

// ─── Dựng bài làm ────────────────────────────────────────────────────────────

console.log('\n== Bài làm dựng từ đề ==');
{
  const de = deMau();
  const bai = taoBaiLam(de, '  An.Nguyen@Truong.Local ', { batDau: MO + 60_000, xao: xaoPhuongAnWeb });

  ok(bai.questions.length === 10, 'đủ 10 câu', String(bai.questions.length));
  ok(bai.maxScore === tongDiem(de.questions), 'điểm tối đa bằng tổng điểm các câu', String(bai.maxScore));
  ok(bai.status === 'pending' && bai.score === 0, 'bài mới chưa nộp, chưa có điểm');
  ok(Object.keys(bai.answers).length === 0, 'chưa có câu trả lời nào');
  ok(bai.deGiaoId === de.id && bai.tenDe === de.tieuDe, 'mang theo mã đề và tên đề');
  ok(bai.userEmail === 'an.nguyen@truong.local',
    'email về chữ thường (luật Firestore so với token Auth)', bai.userEmail);
  ok(bai.id === maBaiLam(de.id, 'an.nguyen@truong.local'), 'id bài trùng mã suy ra từ đề + email');

  /* Thứ tự CÂU giữ nguyên như cô soạn; chỉ vị trí A–D trong từng câu là mỗi em
     một khác. Xáo cả thứ tự câu thì cô dò bài trên giấy phải đếm lại từ đầu. */
  ok(bai.questions.map(q => q.id).join(',') === de.questions.map(q => q.id).join(','),
    'thứ tự câu giữ nguyên như cô soạn');

  /* Đáp án phải đi theo phương án khi xáo. Sai chỗ này thì cả lớp bị chấm lệch
     mà điểm vẫn trông hợp lý. */
  const lech = bai.questions.filter((q, i) => {
    const dungMoi = q.options?.find(o => o.key === q.correctAnswer)?.text;
    const dungCu = de.questions[i].options?.find(o => o.key === de.questions[i].correctAnswer)?.text;
    return dungMoi !== dungCu;
  });
  ok(lech.length === 0, 'xáo phương án xong đáp án vẫn trỏ đúng nội dung cũ',
    lech.length ? `lệch ${lech.length} câu` : '10/10 câu khớp');

  ok(new Date(bai.expiresAt).getTime() === new Date(hetGioLuc(de, MO + 60_000)).getTime(),
    'hạn nộp của bài lấy từ hetGioLuc');
}

// ─── `lessonId` không được trùng bài thật ────────────────────────────────────

console.log('\n== Đề giao không đội lốt một bài trong chương trình ==');
{
  const bai = taoBaiLam(deMau(), 'an@truong.local');
  const maBaiThat = new Set(CHEMISTRY_11_CURRICULUM.flatMap(c => c.lessons).map(l => l.id));

  ok(bai.lessonId.startsWith(TIEN_TO_DE_GIAO), 'lessonId mang tiền tố de-giao:', bai.lessonId);
  /* `QuizPage` khoá bài kiểm tra khi bài học TRƯỚC chưa xong, và phép canh đó
     tra `lessonId` trong chương trình. Trùng một mã bài thật là em nào chưa
     học tới đó sẽ bị chặn khỏi chính bài kiểm tra cô giao. */
  ok(!maBaiThat.has(bai.lessonId), 'lessonId KHÔNG trùng bài nào trong chương trình (nếu trùng, QuizPage khoá bài kiểm tra lại)');
  ok(!maBaiThat.has(bai.chapterId), 'chapterId cũng vậy');
}

// ─── Bài nộp phải lọt qua `hasOnly` của firestore.rules ──────────────────────

console.log('\n== Trường của bài nộp khớp firestore.rules ==');
{
  const luat = readFileSync(join(GOC, 'firestore.rules'), 'utf8');
  const khoi = /function baiNopHopLe[\s\S]*?hasOnly\(\[([\s\S]*?)\]\)/.exec(luat);
  ok(Boolean(khoi), 'đọc được danh sách trường trong baiNopHopLe');

  if (khoi) {
    const choPhep = new Set(
      khoi[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean));
    const bai = taoBaiLam(deMau(), 'an@truong.local');
    const thua = Object.keys(bai).filter(k => !choPhep.has(k));
    /* `hasOnly` từ chối CẢ tài liệu nếu gặp một trường lạ. Thêm trường vào
       `Quiz` mà quên khai ở luật là em bấm nộp bị từ chối, im lặng, đúng lúc
       hết giờ. */
    ok(thua.length === 0, 'bài làm không mang trường nào ngoài danh sách của luật',
      thua.length ? 'thừa: ' + thua.join(', ') : [...choPhep].length + ' trường được khai');
    ok(choPhep.has('deGiaoId') && choPhep.has('tenDe'),
      'luật đã khai deGiaoId và tenDe (thiếu là bài của đề giao không nộp được)');
  }
}

// ─── Đề mẫu 10 câu Cân bằng hoá học ──────────────────────────────────────────
//
// Đề giấy của giáo viên, gõ tay từ ảnh chụp — tức đúng loại dữ liệu dễ sai mà
// không ai thấy: thiếu một phương án, `correctAnswer` trỏ vào chữ cái không có,
// hay hai câu trùng id thì web vẫn chạy, học sinh vẫn làm, chỉ là chấm sai.

console.log('\n== Đề mẫu 10 câu Cân bằng hoá học ==');
{
  ok(DE_MAU_CAN_BANG.length === 10, 'đúng 10 câu', String(DE_MAU_CAN_BANG.length));
  ok(tongDiem(DE_MAU_CAN_BANG) === 10, 'tổng 10 điểm (thang 10)', String(tongDiem(DE_MAU_CAN_BANG)));

  const id = DE_MAU_CAN_BANG.map(q => q.id);
  ok(new Set(id).size === id.length, 'không có id trùng nhau');

  const sai: string[] = [];
  for (const q of DE_MAU_CAN_BANG) {
    if (q.type !== 'Trắc nghiệm') sai.push(`${q.id}: không phải trắc nghiệm`);
    if (!q.content.trim()) sai.push(`${q.id}: nội dung rỗng`);
    if ((q.options || []).length !== 4) sai.push(`${q.id}: không đủ 4 phương án`);
    if ((q.options || []).some(o => !o.text.trim())) sai.push(`${q.id}: có phương án rỗng`);
    /* Đáp án phải trỏ vào một chữ cái CÓ THẬT trong câu. Gõ nhầm 'E' thì
       `submitQuiz` so chuỗi không khớp gì và cả lớp mất điểm câu đó. */
    if (!(q.options || []).some(o => o.key === q.correctAnswer)) {
      sai.push(`${q.id}: đáp án "${q.correctAnswer}" không có trong phương án`);
    }
  }
  ok(sai.length === 0, 'mọi câu đủ 4 phương án và đáp án trỏ đúng chữ cái',
    sai.length ? sai.join(' · ') : '10/10 câu hợp lệ');

  /* Đáp án KHÔNG được dồn hết vào một chữ cái — đúng cái bệnh mà
     `xaoPhuongAnWeb` sinh ra để chữa (B chiếm 48% ngân hàng). */
  const dem = new Map<string, number>();
  DE_MAU_CAN_BANG.forEach(q => dem.set(q.correctAnswer!, (dem.get(q.correctAnswer!) ?? 0) + 1));
  const nhieuNhat = Math.max(...dem.values());
  ok(nhieuNhat <= 6, 'đáp án không dồn hết vào một chữ cái',
    [...dem.entries()].sort().map(([k, v]) => `${k}:${v}`).join(' '));
}

// ─── Phương án "Tất cả đều đúng" phải đứng nguyên chỗ ────────────────────────

// ─── Lời giải phải tới được màn Đề kiểm tra ──────────────────────────────────
//
// Đo 22/09/2026: cả 1.554/1.554 câu trong ngân hàng đều có trường `e` (lời
// giải), nhưng `toLegacy` KHÔNG chép nó sang, nên không câu nào tới được màn
// Đề kiểm tra — em làm sai chỉ đọc được đúng một chữ cái đáp án. Hai phép dưới
// đây canh cho dòng vừa vá không bị xoá lại.

console.log('\n== Lời giải đi được từ ngân hàng sang đề ==');
{
  const nganHang: BankQuestion[] = JSON.parse(
    readFileSync(join(GOC, 'public/bank/ngan-hang.json'), 'utf8')).map(chuanHoaCau);

  const coLoiGiai = nganHang.filter(q => String(q.e ?? '').trim());
  ok(coLoiGiai.length > 0, 'ngân hàng có câu kèm lời giải',
    `${coLoiGiai.length}/${nganHang.length} câu`);

  const mat = coLoiGiai.slice(0, 200).filter(q => !String(toLegacy(q).giaiThich ?? '').trim());
  ok(mat.length === 0, 'toLegacy KHÔNG đánh rơi lời giải',
    mat.length ? `mất ở ${mat.length}/200 câu đầu` : '200/200 câu đầu giữ được');

  /* Vòng khứ hồi web → ngân hàng cũng phải giữ. Thiếu chiều này thì giáo viên
     sửa một câu trên màn web là lời giải biến mất khỏi kho. */
  const thu = toLegacy(coLoiGiai[0]);
  ok(fromLegacy(thu).e === thu.giaiThich, 'fromLegacy trả lời giải về đúng trường e');
}

console.log('\n== Lời giải của đề mẫu ==');
{
  const thieu = DE_MAU_CAN_BANG.filter(q => !String(q.giaiThich ?? '').trim());
  ok(thieu.length === 0, 'cả 10 câu đều có lời giải',
    thieu.length ? 'thiếu: ' + thieu.map(q => q.id).join(', ') : '10/10 câu');

  /* Lời giải đi vào `dangerouslySetInnerHTML` qua `locHtml`, và locHtml chỉ giữ
     tám thẻ. Dùng thẻ ngoài danh sách thì chữ vẫn còn nhưng định dạng mất —
     bắt ở đây để người viết biết ngay, đừng để phát hiện lúc chụp màn hình. */
  const CHO_PHEP = new Set(['sub', 'sup', 'b', 'strong', 'i', 'em', 'br', 'u']);
  const the = new Set<string>();
  DE_MAU_CAN_BANG.forEach(q => {
    for (const m of String(q.giaiThich).matchAll(/<\s*\/?\s*([a-zA-Z][a-zA-Z0-9]*)/g)) {
      the.add(m[1].toLowerCase());
    }
  });
  const la = [...the].filter(t => !CHO_PHEP.has(t));
  ok(la.length === 0, 'lời giải chỉ dùng thẻ mà locHtml giữ lại',
    la.length ? 'thẻ lạ: ' + la.join(', ') : [...the].sort().join(', '));

  /* Hai câu này có lời giải do chính giáo viên viết, và là hai chỗ dễ chấm
     nhầm nhất của đề. Lời giải cụt là mất luôn phần đáng giá nhất. */
  const dai = (id: string) => String(DE_MAU_CAN_BANG.find(q => q.id === id)?.giaiThich ?? '').length;
  ok(dai('dm-cb-07') > 300, 'câu 7 (giảm áp suất) có lời giải đầy đủ', dai('dm-cb-07') + ' ký tự');
  ok(dai('dm-cb-10') > 500, 'câu 10 (bẫy Kc = 0,534) có lời giải đầy đủ', dai('dm-cb-10') + ' ký tự');
}

// ─── Phản hồi phải nằm nơi mắt đang nhìn ─────────────────────────────────────
//
// Ngày 22/09/2026 giáo viên báo "bấm nút giao đề không được". Mã CÓ báo lỗi
// đúng, nhưng khung thông báo nằm ở ĐẦU form còn nút nằm ở CUỐI, cách nhau cả
// một danh sách 10 câu xem trước — tức cao hơn một màn hình. Bấm xong không
// thấy gì, và nguyên nhân thật (luật `de_giao` chưa publish) không tới được
// người cần đọc.
//
// Đây là loại lỗi `tsc` không thấy, phép kiểm logic không thấy, và ảnh chụp
// màn hình cũng không thấy nếu chụp đúng lúc form còn ngắn.

console.log('\n== Thông báo lỗi nằm sát nút Giao đề ==');
{
  const tab = readFileSync(join(GOC, 'src/features/teacher/components/GiaoDeTab.tsx'), 'utf8');

  const viTriNut = tab.indexOf('void giaoDe()');
  ok(viTriNut > 0, 'tìm thấy nút Giao đề trong GiaoDeTab.tsx');

  /* Khung <Alert> gần nhất ĐỨNG TRƯỚC nút phải nằm trong tầm mắt. Ngưỡng 900
     ký tự JSX ≈ vài phần tử, chắc chắn cùng một màn hình. */
  const truocNut = tab.slice(0, viTriNut);
  const viTriAlert = truocNut.lastIndexOf('<Alert');
  const cach = viTriNut - viTriAlert;
  ok(viTriAlert > 0 && cach < 900,
    'có khung báo lỗi ngay trên nút Giao đề',
    viTriAlert > 0 ? `cách ${cach} ký tự JSX` : 'không có <Alert> nào trước nút');

  /* Câu báo lỗi phải gọi tên nguyên nhân thật. Đổ chung cho "mạng hoặc quyền"
     là bắt người đọc đi dò cả hai hướng, mà cả hai đều sai. */
  ok(/permission-denied/.test(tab), 'phân biệt được lỗi permission-denied');
  ok(/firestore:rules/.test(tab),
    'lỗi permission-denied chỉ thẳng ra lệnh publish luật');
}

console.log('\n== Không xáo câu có phương án neo ==');
{
  const neo = DE_MAU_CAN_BANG.find(q => (q.options || []).some(o => /^tất cả/i.test(o.text)));
  ok(Boolean(neo), 'đề mẫu có một câu kiểu "Tất cả đều sai" để thử', neo?.id ?? 'không tìm thấy');

  if (neo) {
    /* Xáo 30 lượt mà vị trí vẫn y nguyên — nếu quên phép canh thì xác suất
       lọt qua 30 lượt gần như bằng 0. */
    const goc = (neo.options || []).map(o => o.text).join('|');
    const lech = Array.from({ length: 30 }, () => xaoPhuongAnWeb(neo))
      .filter(x => (x.options || []).map(o => o.text).join('|') !== goc);
    ok(lech.length === 0,
      'câu có "Tất cả đều sai" KHÔNG bị xáo (xáo lên là phương án A hoá ra "Tất cả đều sai")',
      lech.length ? `lệch ${lech.length}/30 lượt` : 'y nguyên qua 30 lượt');
  }

  /* Câu thường thì VẪN phải xáo — vá lỗi trên không được làm chết tính năng
     chống đoán mò. */
  const thuong = DE_MAU_CAN_BANG[0];
  const gocThuong = (thuong.options || []).map(o => o.text).join('|');
  const doi = Array.from({ length: 30 }, () => xaoPhuongAnWeb(thuong))
    .filter(x => (x.options || []).map(o => o.text).join('|') !== gocThuong);
  ok(doi.length > 0, 'câu thường vẫn được xáo như cũ', `đổi ${doi.length}/30 lượt`);

  ok(coPhuongAnNeo(['acid mạnh', 'base mạnh', 'cả A và B đều đúng', 'muối tan']),
    'nhận ra "cả A và B đều đúng"');
  ok(coPhuongAnNeo(['x', 'y', 'z', 'cả A, B, C.']), 'nhận ra "cả A, B, C."');
  ok(!coPhuongAnNeo(['Giảm áp suất', 'Tăng nồng độ', 'Giảm nhiệt độ', '0,1M']),
    'KHÔNG bắt nhầm phương án bình thường');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
