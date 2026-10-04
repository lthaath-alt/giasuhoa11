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
  TIEN_TO_DE_GIAO, hetGioLuc, maBaiLam, taoBaiLam, thongKeDeGiao, tomTatDeGiao, tongDiem, trangThaiDe, dongSom,
} from '../src/features/quiz/taoDeGiao';
import { chuoiDapAnDungSai, coPhuongAnNeo, xaoPhuongAnWeb } from '../src/features/bank/xaoDapAn';
import {
  chamDapSo, chamDungSaiNhieuY, dapSoCua, giaiMaDungSai, maHoaDungSai,
} from '../src/features/quiz/chamDiem';
import { boDongLinkDe } from '../src/features/quiz/linkDe';
import { fromLegacy, toLegacy } from '../src/features/bank/convert';
import { chuanHoaCau } from '../src/features/bank/types';
import type { BankQuestion } from '../src/features/bank/types';
import { DE_MAU_CAN_BANG } from '../src/features/quiz/deMauCanBang';
import { CHEMISTRY_11_CURRICULUM } from '../src/features/lessons/constants';
import type { Question } from '../src/features/library/types';
import type { DeGiao, Quiz } from '../src/features/quiz/types';
import { soSanhHocSinh } from '../src/features/auth/thanhVienLop';
import type { User } from '../src/features/auth/types';

/** Tên riêng = chữ cuối, chỉ dùng để in kết quả cho dễ đọc. */
const tenCuoi = (s: string) => s.trim().split(/\s+/).pop() ?? '';

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
  /* Lời báo cho học sinh phải phân biệt "cô đóng sớm" với "hết hạn": trước
     04/10/2026 cả hai đều ra "Đề đã đóng. Hạn nộp là …" kèm một hạn còn ở tương lai. */
  ok(dongSom(deMau({ dong: true }), MO + 1000) === true, 'cô đóng khi chưa tới hạn → là đóng SỚM');
  ok(dongSom(deMau({ dong: true }), DONG + 1) === false, 'cô đóng nhưng hạn cũng đã qua → không còn là đóng sớm');
  ok(dongSom(deMau(), MO + 1000) === false && dongSom(deMau(), DONG + 1) === false, 'đề không bị đóng tay thì không bao giờ là đóng sớm');
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

// ─── Bảng kết quả cả lớp ─────────────────────────────────────────────────────
//
// Cô đọc bảng này ngay sau khi hết giờ để biết lớp làm được bao nhiêu. Sai ở
// đây thì KHÔNG AI THẤY: mỗi ô vẫn ra một con số trông hợp lý, chỉ là của
// nhầm em, nhầm đề, hoặc đếm thiếu câu.

console.log('\n== Bảng kết quả cả lớp cho một đề ==');
{
  const hocSinh = [
    { email: 'An@Truong.local', name: 'An', studentNumber: 1 },
    { email: 'binh@truong.local', name: 'Bình', studentNumber: 2 },
    { email: 'chi@truong.local', name: 'Chi', studentNumber: 3 },
  ];

  const baiMau = (email: string, deGiaoId: string, score: number, dung: number, soCau = 10,
                  createdAt = '2026-09-23T08:00:00.000Z'): Quiz => ({
    id: maBaiLam(deGiaoId, email),
    lessonId: TIEN_TO_DE_GIAO + deGiaoId,
    chapterId: TIEN_TO_DE_GIAO + deGiaoId,
    userEmail: email.toLowerCase(),
    questions: Array.from({ length: soCau }, (_, i) => cau(i + 1)),
    answers: {},
    status: 'submitted',
    score,
    maxScore: soCau,
    createdAt,
    expiresAt: createdAt,
    deGiaoId,
    tenDe: 'Đề thử',
    results: Object.fromEntries(Array.from({ length: soCau }, (_, i) => [
      `q${i + 1}`,
      { questionId: `q${i + 1}`, score: i < dung ? 1 : 0, maxScore: 1, correct: i < dung,
        studentAnswer: 'A', correctAnswer: 'B', feedback: '', confidence: 'high' as const },
    ])),
  });

  const de = deMau();
  const kq = thongKeDeGiao(de.id, hocSinh, [baiMau('an@truong.local', de.id, 8, 8)]);

  ok(kq.length === 3, 'mỗi em một dòng, kể cả em chưa nộp', `${kq.length} dòng`);
  ok(kq[0].daNop && !kq[1].daNop && !kq[2].daNop, 'đánh dấu đúng ai đã nộp');
  ok(kq[0].diem10 === 8, 'điểm quy về thang 10', String(kq[0].diem10));
  ok(kq[0].soDung === 8 && kq[0].soSai === 2, 'đếm đúng/sai khớp số câu',
    `${kq[0].soDung} đúng / ${kq[0].soSai} sai`);
  ok(kq[0].soDung + kq[0].soSai === kq[0].soCau, 'đúng + sai = tổng số câu (bỏ trống tính là sai)');
  ok(kq[1].diem10 === null, 'em chưa nộp KHÔNG có điểm 0 giả', String(kq[1].diem10));
  ok(kq[0].ten === 'An' && kq[2].ten === 'Chi', 'giữ nguyên thứ tự sổ lớp');

  /* Email trong sổ lớp viết hoa/thường lẫn lộn, còn `bai_nop` luôn chữ thường
     (xem `baiNopChuan.ts`). So thẳng là bài của em rơi vào ô "chưa nộp". */
  ok(kq[0].email === 'an@truong.local', 'khớp được email viết hoa với bài nộp chữ thường');

  /* `docBaiNopCuaCacEm` tra về MOI bai cua lop, gom ca de tu on. */
  const lanSang = thongKeDeGiao(de.id, hocSinh, [
    baiMau('an@truong.local', de.id, 8, 8),
    baiMau('binh@truong.local', 'de_KHAC', 10, 10),
  ]);
  ok(!lanSang[1].daNop, 'KHÔNG tính bài của đề khác vào đề đang xem');

  /* Bài tự ôn không có `deGiaoId` — phải bị bỏ qua, nếu không điểm bài ôn của
     em nhảy vào cột điểm bài kiểm tra của cô. */
  const baiTuOn = { ...baiMau('binh@truong.local', de.id, 10, 10) };
  delete (baiTuOn as { deGiaoId?: string }).deGiaoId;
  ok(!thongKeDeGiao(de.id, hocSinh, [baiTuOn])[1].daNop, 'KHÔNG tính bài tự ôn (không có deGiaoId)');

  /* Bài chưa nộp xong (`pending`) cũng không được tính là đã nộp. */
  const dangLam = { ...baiMau('binh@truong.local', de.id, 0, 0), status: 'pending' as const };
  ok(!thongKeDeGiao(de.id, hocSinh, [dangLam])[1].daNop, 'KHÔNG tính bài đang làm dở');

  /* Dữ liệu cũ lỡ còn hai bản cho một em: lấy bản MỚI hơn, đó là bản cô chấm. */
  const haiBan = thongKeDeGiao(de.id, hocSinh, [
    baiMau('an@truong.local', de.id, 3, 3, 10, '2026-09-23T08:00:00.000Z'),
    baiMau('an@truong.local', de.id, 9, 9, 10, '2026-09-23T09:00:00.000Z'),
  ]);
  ok(haiBan[0].diem10 === 9, 'trùng bài thì lấy bản mới hơn', String(haiBan[0].diem10));
}

console.log('\n== Mấy con số tóm tắt trên đầu bảng ==');
{
  const ds = [
    { email: 'a@x', ten: 'A', daNop: true, diem10: 8, soDung: 8, soSai: 2, soCau: 10 },
    { email: 'b@x', ten: 'B', daNop: true, diem10: 6, soDung: 6, soSai: 4, soCau: 10 },
    { email: 'c@x', ten: 'C', daNop: false, diem10: null, soDung: 0, soSai: 0, soCau: 0 },
  ];
  const t = tomTatDeGiao(ds);
  ok(t.siSo === 3 && t.daNop === 2, 'đếm đúng sĩ số và số em đã nộp', `${t.daNop}/${t.siSo}`);
  /* Chia cho SỐ EM ĐÃ NỘP, không phải sĩ số. Chia cho sĩ số ra 4,67 — mỗi em
     chưa làm kéo trung bình xuống như thể được 0 điểm. */
  ok(t.diemTB === 7, 'điểm TB chỉ tính trên em đã nộp', String(t.diemTB));
  ok(tomTatDeGiao([]).diemTB === null, 'chưa ai nộp thì không có điểm TB, không phải 0');
}

// ─── Thứ tự học sinh trong bảng ──────────────────────────────────────────────
//
// Bảng kết quả giữ nguyên thứ tự danh sách lớp truyền vào, mà danh sách đó do
// `hocSinhCuaLop` sắp. Sai ở đây thì cô phải dò mắt qua 38 dòng không thứ tự —
// không hỏng gì, chỉ là không ai dùng được.

console.log('\n== Thứ tự học sinh trong danh sách lớp ==');
{
  const em = (name: string, studentNumber?: number) =>
    ({ id: name, email: `${name}@x`, name, role: 'student', status: 'active',
       createdAt: '', authProvider: 'local', canChangePassword: false,
       ...(studentNumber === undefined ? {} : { studentNumber }) }) as unknown as User;

  const coSo = [em('Trần Gia Hân', 10), em('Nguyễn Thanh An', 1), em('Phí Gia Bảo', 7)]
    .sort(soSanhHocSinh);
  ok(coSo.map(e => e.studentNumber).join(',') === '1,7,10',
    'có số báo danh thì xếp theo số', coSo.map(e => e.studentNumber).join(','));

  /* Sổ điểm Việt Nam xếp theo TÊN, không theo họ. Xếp theo cả chuỗi họ tên là
     ra một danh sách toàn họ Nguyễn đứng đầu. */
  const theoTen = [em('Nguyễn Gia Bảo'), em('Trần Thanh An'), em('Đỗ Ngọc Châu')]
    .sort(soSanhHocSinh);
  ok(theoTen.map(e => tenCuoi(e.name)).join(',') === 'An,Bảo,Châu',
    'chưa có số thì xếp theo TÊN riêng, không theo họ', theoTen.map(e => e.name).join(' | '));

  /* Vần tiếng Việt: A < Ă < Â, và có dấu đứng sau không dấu. `localeCompare`
     với 'vi' biết điều đó; so bằng mã ký tự thì không. */
  const vanViet = [em('Lê Thiên Ân'), em('Lê Ngọc Ánh'), em('Lê Thanh An')].sort(soSanhHocSinh);
  ok(vanViet.map(e => tenCuoi(e.name)).join(',') === 'An,Ánh,Ân',
    'xếp đúng vần tiếng Việt (An < Ánh < Ân)', vanViet.map(e => tenCuoi(e.name)).join(','));

  /* Em CÓ số luôn đứng trước em chưa có — đừng để một em thiếu số chen vào
     giữa sổ điểm. */
  const tron = [em('Vũ Anh Khôi'), em('Trần Gia Hân', 10)].sort(soSanhHocSinh);
  ok(tron[0].studentNumber === 10, 'em có số báo danh đứng trước em chưa có');

  /* Trùng tên riêng thì thứ tự phải ỔN ĐỊNH giữa hai lần mở trang, nếu không
     mỗi lần cô mở lại là hai em đổi chỗ cho nhau. */
  const trungTen = () => [em('Đỗ Thiên Kim'), em('Đoàn Ngọc Thiên Kim')].sort(soSanhHocSinh)
    .map(e => e.name).join('|');
  ok(trungTen() === trungTen(), 'trùng tên riêng thì thứ tự vẫn ổn định', trungTen());
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

// ─── Chấm Đề kiểm tra: câu Đúng/Sai nhiều ý và câu trả lời ngắn ──────────────
//
// Đo 02/10/2026 trên web thật: trả lời ĐÚNG cả 8 câu của một đề Chemai phát mà
// chỉ được 5,5/8. Hai gốc, đều ở chỗ đổi mô hình `toLegacy`:
//   - câu trả lời ngắn thành "Tự luận" một ý, rồi bộ chấm dò từ khoá cộng cứng
//     0,25 cho mỗi ý — đáp số đúng cũng chỉ được 0,25/1, gõ "3.57" thay "3,57"
//     thì 0;
//   - câu Đúng/Sai 4 ý gộp thành MỘT mệnh đề, mất luôn đề dẫn, và đáp án gần
//     như luôn là "Sai" (đề làm lại hôm đó: 5/5 câu).
// Các phép dưới đây canh cho hai chỗ đó không quay lại.

console.log('\n== Chấm Đề kiểm tra: Đúng/Sai nhiều ý ==');
{
  const tf: BankQuestion = {
    id: 'tf1', ch: 1, lv: 'th', t: 'tf', q: 'Cho phương trình: NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.',
    st: [
      { s: 'H₂O là acid.', v: true }, { s: 'NH₄⁺ là base.', v: false },
      { s: 'NH₃ là base.', v: true }, { s: 'OH⁻ là acid.', v: false },
    ],
  };
  const web = toLegacy(tf);
  ok(web.type === 'Đúng/Sai' && web.content === tf.q, 'toLegacy giữ ĐỀ DẪN của câu Đúng/Sai nhiều ý',
    JSON.stringify(web.content).slice(0, 50));
  ok((web.yDungSai || []).length === 4 && web.yDungSai!.every((y, i) => y.s === tf.st![i].s && y.v === tf.st![i].v),
    'toLegacy mang đủ 4 ý kèm đúng/sai');
  ok(web.correctAnswer === 'a) Đúng · b) Sai · c) Đúng · d) Sai', 'đáp án ghi theo từng ý', String(web.correctAnswer));
  ok(JSON.stringify(fromLegacy(web).st) === JSON.stringify(tf.st) && fromLegacy(web).q === tf.q,
    'fromLegacy trả các ý và đề dẫn về nguyên chỗ');
  /* Chỉ soi phần MỚI thêm: các trường cũ (vd `createdBy`) vốn có thể undefined
     và đã được `chuanBiBaiNop` lọc bằng một vòng JSON trước khi ghi Firestore.
     Vòng JSON đó phải giữ nguyên các ý. */
  ok(web.yDungSai!.every(y => typeof y.s === 'string' && typeof y.v === 'boolean')
    && JSON.stringify(JSON.parse(JSON.stringify(web)).yDungSai) === JSON.stringify(web.yDungSai),
    'các ý không mang giá trị undefined và sống sót qua vòng JSON của bài nộp');

  const mh = maHoaDungSai([true, false, null, true]);
  ok(mh === 'DS-D', 'mã hoá câu trả lời từng ý', mh);
  ok(JSON.stringify(giaiMaDungSai('DS-D', 4)) === JSON.stringify([true, false, null, true]), 'giải mã ngược lại đúng');
  ok(JSON.stringify(giaiMaDungSai('', 4)) === JSON.stringify([null, null, null, null]), 'chuỗi rỗng là bốn ý bỏ trống');

  const c4 = chamDungSaiNhieuY(web, 'DSDS');
  ok(c4.diem === 1 && c4.dung, 'đúng 4/4 ý được trọn điểm', `${c4.diem}`);
  const c3 = chamDungSaiNhieuY(web, 'DSDD');
  ok(c3.diem === 0.5 && !c3.dung, 'đúng 3/4 ý được 0,5 (thang của Bộ, như Luyện tập)', `${c3.diem}`);
  const c2 = chamDungSaiNhieuY(web, 'DDDD');
  ok(c2.diem === 0.25, 'đúng 2/4 ý được 0,25', `${c2.diem}`);
  const c0 = chamDungSaiNhieuY(web, '');
  ok(c0.diem === 0 && !c0.dung, 'bỏ trống cả câu được 0', `${c0.diem}`);
  ok(/c\) \(bỏ trống\)/.test(chamDungSaiNhieuY(web, 'DS-S').traLoiHienThi), 'ý bỏ trống hiện rõ là bỏ trống');
  const d2 = chamDungSaiNhieuY({ ...web, points: 2 }, 'DSDS');
  ok(d2.diem === 2, 'câu 2 điểm thì đúng hết được 2', `${d2.diem}`);

  /* Xáo ý: chuỗi đáp án phải đi theo thứ tự mới, nếu không màn giáo viên hiện
     đáp án của thứ tự cũ. */
  const lech = Array.from({ length: 40 }, () => xaoPhuongAnWeb(web))
    .filter(x => x.correctAnswer !== chuoiDapAnDungSai(x.yDungSai!));
  ok(lech.length === 0, 'xáo ý xong chuỗi đáp án đi theo', lech.length ? `lệch ${lech.length}/40` : '40/40 lượt khớp');
  const doiCho = Array.from({ length: 40 }, () => xaoPhuongAnWeb(web))
    .filter(x => x.yDungSai!.map(y => y.s).join('|') !== web.yDungSai!.map(y => y.s).join('|'));
  ok(doiCho.length > 0, 'các ý Đúng/Sai được xáo', `đổi ${doiCho.length}/40 lượt`);

  /* Câu Đúng/Sai MỘT mệnh đề của kho cũ phải giữ nguyên lối cũ. */
  const mot = toLegacy({ id: 'tf2', ch: 1, lv: 'nb', t: 'tf', q: 'Kc phụ thuộc nhiệt độ.', st: [{ s: 'Kc phụ thuộc nhiệt độ.', v: true }] });
  ok(!mot.yDungSai && mot.correctAnswer === 'Đúng', 'câu một mệnh đề vẫn là Đúng/Sai đơn như cũ');
}

console.log('\n== Chấm Đề kiểm tra: câu trả lời ngắn ==');
{
  const tn: BankQuestion = { id: 'tn1', ch: 1, lv: 'vd', t: 'tn', q: 'Tính Kc.', ansText: '3,57', num: 3.57 };
  const web = toLegacy(tn);
  ok(web.type === 'Tự luận' && dapSoCua(web)?.text === '3,57', 'toLegacy mang đáp số sang đề', JSON.stringify(web.dapSo));
  ok(Object.values(web.dapSo || {}).every(v => v !== undefined), 'đáp số không mang giá trị undefined');

  const dung = ['3,57', '3.57', ' 3,57 ', 'Kc = 3,57'];
  const saiCham = dung.filter(t => !(chamDapSo(web, t).dung && chamDapSo(web, t).diem === 1));
  ok(saiCham.length === 0, 'đáp số đúng được TRỌN điểm dù gõ phẩy, chấm hay kèm chữ',
    saiCham.length ? 'chấm sai: ' + JSON.stringify(saiCham) : dung.join(' | '));
  ok(chamDapSo(web, '3,6').diem === 0 && !chamDapSo(web, '3,6').dung, 'đáp số sai được 0');
  ok(chamDapSo(web, '').diem === 0, 'bỏ trống được 0');

  const coSaiSo = toLegacy({ ...tn, id: 'tn2', ansText: '100', num: 100, tol: 0.5, unit: 'atm' });
  ok(chamDapSo(coSaiSo, '100,4').dung && !chamDapSo(coSaiSo, '101').dung, 'có sai số cho phép thì nhận trong sai số');
  ok(chamDapSo(coSaiSo, '100 atm').dung, 'gõ kèm đơn vị vẫn nhận');

  /* Bài đã tạo TRƯỚC khi vá (kể cả bài đang làm dở trong máy học sinh) không
     có `dapSo`, chỉ có một ý nhãn "Đáp án". Phải chấm được theo số. */
  const cu: Question = {
    id: 'cu1', type: 'Tự luận', difficulty: 'Cao', points: 1, content: 'Tính Kc.', images: [],
    essayPoints: [{ label: 'Đáp án', content: '0,074' }], createdAt: '2026-09-18T00:00:00.000Z',
  };
  ok(dapSoCua(cu)?.text === '0,074', 'câu cũ một ý nhãn "Đáp án" được nhận là câu trả lời ngắn');
  ok(chamDapSo(cu, 'Kc = 0,074').diem === 1 && chamDapSo(cu, '2').diem === 0, 'câu cũ chấm theo số: đúng trọn điểm, sai 0');

  const tuLuan: Question = { ...cu, id: 'tl1', essayPoints: [{ label: 'Ý 1', content: 'acid cho proton' }, { label: 'Ý 2', content: 'base nhận proton' }] };
  ok(dapSoCua(tuLuan) === null, 'câu tự luận nhiều ý KHÔNG bị coi là câu trả lời ngắn');
  const tuLuan1 = { ...cu, id: 'tl2', essayPoints: [{ label: 'Đáp án tham khảo', content: 'acid cho proton' }] };
  ok(dapSoCua(tuLuan1) === null, 'câu tự luận một ý nhãn "Đáp án tham khảo" vẫn là tự luận');
}

console.log('\n== Link đề do Chemai tự chép lại ==');
{
  const tra = 'Chào em!\n\nEm thử nghĩ xem?\n\n👉 **Đề luyện tập về Bài 1** (8 câu): [Làm bài kiểm tra ngay](http://localhost:3000/#/quiz/quiz_1789723767818_81)';
  const sach = boDongLinkDe(tra);
  ok(!sach.includes('#/quiz/') && sach.includes('Em thử nghĩ xem?'), 'bỏ đúng dòng mang link đề, giữ phần còn lại',
    JSON.stringify(sach).slice(0, 60));
  ok(!boDongLinkDe('Xem https://x.pages.dev/#/de/de_1_2 nhé').includes('#/de/'), 'bỏ cả dòng mang link đề giáo viên giao');
  ok(boDongLinkDe('Kc = [NH₃]² / ([N₂][H₂]³)') === 'Kc = [NH₃]² / ([N₂][H₂]³)', 'không đụng câu bình thường');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
