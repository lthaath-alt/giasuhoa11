/**
 * Kiểm tra dữ liệu chương trình 25 bài trong src/features/lessons/constants.ts.
 *
 * Chạy:  npm run kiem-tra:chuong-trinh
 *
 * Không gọi mạng, không tốn lượt API. Chạy sau mỗi lần sinh lại constants.ts.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { CHEMISTRY_11_CURRICULUM } from '../src/features/lessons/constants';
import { buildLessonContext, buildProgramContext } from '../src/features/tutor/services/lessonContext';
import { xetKhoaBai, baiLamDuocNgay, laBaiOnTap, DIEM_MO_BAI_SAU } from '../src/features/lessons/khoaBai';

const HERE = dirname(fileURLToPath(import.meta.url));

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten + (chiTiet ? '  — ' + chiTiet : ''));
  if (!dieu) hong++;
};

const bais: any[] = CHEMISTRY_11_CURRICULUM.flatMap((c: any) => c.lessons);

console.log('\n== Cấu trúc ==');
ok(CHEMISTRY_11_CURRICULUM.length === 6, '6 chương', String(CHEMISTRY_11_CURRICULUM.length));
ok(bais.length === 25, '25 bài', String(bais.length));

const ids = bais.map(b => b.id);
const mong = Array.from({ length: 25 }, (_, i) => 'bai-' + (i + 1));
ok(JSON.stringify(ids) === JSON.stringify(mong),
  'id bai-1..bai-25 liên tục, đúng thứ tự — phải khớp với slide bài giảng và ngân hàng câu hỏi');

const thieuTomTat = bais.filter(b => !b.summary || b.summary.length < 60);
ok(thieuTomTat.length === 0, 'mọi bài đều có tóm tắt ≥ 60 ký tự',
  thieuTomTat.map(b => b.id).join(', ') || 'tất cả đạt');

const thieuSGK = bais.filter(b => !b.textbook || !b.textbook.sections?.length);
ok(thieuSGK.length === 0, 'mọi bài đều có nội dung SGK',
  thieuSGK.map(b => b.id).join(', ') || 'tất cả đạt');

console.log('\n== Thuật ngữ theo chương trình KNTT 2018 ==');
/* Tài liệu .docx của giáo viên soạn qua nhiều năm nên lẫn tên gọi chương trình
   2006. Giữ danh sách này để lần sau thêm bài mới thì phát hiện ngay.
   CỐ Ý không kiểm "oxi hoá" (2018 vẫn dùng "số oxi hoá") và "đồng" (là
   "đồng phân / đồng đẳng", không phải kim loại copper). */
const TEN_CU = ['ancol', 'axit', 'ete', 'cacbonat', 'cacbua', 'xianua', 'nitơ',
  'clo hóa', 'clo hoá', 'anđehit', 'andehit', 'xeton', 'ankan', 'anken', 'benzen',
  'etilen', 'glixerol', 'amoniac', 'sunfat', 'sunfua', 'hiđro', 'cacbon'];
const chu = JSON.stringify(CHEMISTRY_11_CURRICULUM);
const conSot = TEN_CU
  .map(t => [t, (chu.match(new RegExp('(^|[^A-Za-zÀ-ỹ])(' + t + ')([^A-Za-zÀ-ỹ]|$)', 'gi')) || []).length])
  .filter(([, n]) => (n as number) > 0);
ok(conSot.length === 0, 'không còn tên gọi của chương trình 2006',
  conSot.map(([t, n]) => `${t} ×${n}`).join(', ') || 'sạch');

console.log('\n== Giữ nguyên phần giáo viên soạn tay ==');
/* Sáu bài này giáo viên tự soạn trong web, công phu hơn phần trích tự động,
   nên tuyệt đối không được để quá trình sinh lại làm mất. Trước đây chúng bị
   đánh số 1–6 trong khi bài THẬT là 1, 2, 4, 6, 10, 15. */
const tay: any[] = JSON.parse(readFileSync(join(HERE, 'du-lieu', 'soan-tay-goc.json'), 'utf8'));
const CHUYEN: Record<string, string> = {
  'bai-1': 'bai-1', 'bai-2': 'bai-2', 'bai-3': 'bai-4',
  'bai-4': 'bai-6', 'bai-5': 'bai-10', 'bai-6': 'bai-15',
};
/* So sánh BỎ QUA kiểu chữ số: bộ sinh hạ chỉ số công thức (N2 -> N₂), đó là
   thay đổi có chủ ý chứ không phải làm mất nội dung. Đưa cả hai bên về chữ số
   thường rồi mới so, nên mọi sửa đổi THẬT vào chữ nghĩa vẫn bị bắt.

   CỐ Ý không chép lại hàm ha_chi_so của bộ sinh sang đây: chép thì mỗi lần sửa
   bộ sinh là phép thử lại canh một bản cũ mà không ai hay — đúng lỗi đã mắc với
   bộ thử gia sư AI. Đưa về dạng chung rồi so là không có gì để lệch. */
const boChiSo = (o: any) =>
  JSON.stringify(o).replace(/[₀-₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c)));

for (const t of tay) {
  const moi = bais.find(b => b.id === CHUYEN[t.id]);
  const giong = !!moi && ['summary', 'commonQuestions', 'textbook'].every(
    k => boChiSo(moi[k]) === boChiSo(t[k]));
  ok(giong, `${t.id} → ${CHUYEN[t.id]} giữ nguyên từng chữ`);
}

console.log('\n== Ngữ cảnh gửi cho AI ==');
/* Câu luyện tập VẪN giữ đáp án trong dữ liệu để trình đọc SGK hiển thị đúng,
   nhưng lessonContext.ts chỉ được gửi phần đề bài sang AI — nếu không, gia sư
   sẽ đọc thấy đáp án và rất dễ đưa thẳng cho học sinh. */
let daiNhat = 0, loLot = 0, tongDapAn = 0;
for (const b of bais) {
  const ctx: string = buildLessonContext(b.id);
  daiNhat = Math.max(daiNhat, ctx.length);
  if (!ctx.includes(b.title)) ok(false, `ngữ cảnh ${b.id} thiếu tên bài`);
  for (const q of b.textbook?.practiceQuestions ?? []) {
    if (!q.answer) continue;
    tongDapAn++;
    if (ctx.includes(String(q.answer).slice(0, 40))) loLot++;
  }
}
ok(tongDapAn > 0, 'dữ liệu VẪN giữ đáp án cho trình đọc SGK', tongDapAn + ' câu');
ok(loLot === 0, 'KHÔNG đáp án nào lọt vào ngữ cảnh gửi AI', loLot + ' câu lọt');
/* Ngưỡng phải khớp TRAN_KY_TU trong lessonContext.ts. Vượt trần thì phần đuôi
   bị cắt — mất câu luyện tập và lời dặn cuối mà không có dấu hiệu gì. */
ok(daiNhat <= 4600, 'ngữ cảnh dài nhất ≤ 4600 ký tự (trần của lessonContext)', String(daiNhat));

console.log('\n== Công thức hoá học phải có chỉ số dưới ==');
/* Văn bản trích từ .docx mất hết định dạng, nên dữ liệu từng mang "N2", "NH3",
   "H2SO4" và phần đọc SGK hiển thị đúng chuỗi viết sai đó cho học sinh — trong
   khi gia sư AI ngay bên cạnh lại viết đúng "N₂". Bộ sinh (2-sinh-bai-hoc.py)
   nay tự hạ chỉ số; ba mục dưới đây canh cho nó không hạ nhầm chỗ. */
{
  const chu: string[] = [];
  const gom = (x?: string) => { if (x) chu.push(x); };
  for (const b of bais as any[]) {
    gom(b.summary); (b.formulae ?? []).forEach(gom);
    for (const s of b.textbook?.sections ?? []) { gom(s.sectionTitle); (s.keyPoints ?? []).forEach(gom); }
    (b.textbook?.objectives ?? []).forEach(gom);
    (b.commonQuestions ?? []).forEach((q: any) => { gom(q.question); gom(q.hint); });
    (b.textbook?.practiceQuestions ?? []).forEach((q: any) => { gom(q.question); gom(q.answer); });
  }
  const tatCa = chu.join('\n');
  const SUB = /[₀-₉]/;

  /* Công thức còn viết thô: chữ số dính ngay sau ký hiệu nguyên tố. CỐ Ý bỏ qua
     đoạn có dấu +/- dính liền (Fe2+, SO42-) — ở đó chữ số có thể là điện tích,
     bộ sinh chọn không đoán và để nguyên. */
  const tho = [...new Set(tatCa.match(/\b(?:[A-Z][a-z]?\d+)+[A-Za-z]*\b(?![+-])/g) ?? [])];
  ok(tho.length === 0, 'không còn công thức viết thô kiểu N2 / H2SO4', tho.slice(0, 10).join(', '));

  /* Hệ số cân bằng đứng ngay trước công thức — "4NH3", "5O2" — từng làm cả cụm
     bị bỏ sót, vì giữa chữ số và chữ cái không có ranh giới từ nên neo  trượt.
     Đo được 7 công thức lọt kiểu này. Hệ số phải là chữ số thường, phần sau ký
     hiệu nguyên tố mới hạ xuống: "4NH₃". */
  const dinhHeSo = [...new Set(tatCa.match(/\d+(?:[A-Z][a-z]?\d+)+/g) ?? [])];
  ok(dinhHeSo.length === 0, 'công thức dính sau hệ số cân bằng cũng được hạ chỉ số',
     dinhHeSo.slice(0, 8).join(', '));

  const soChiSo = (tatCa.match(/[₀-₉]/g) ?? []).length;
  ok(soChiSo > 300, 'có đủ chỉ số dưới trong nội dung bài', soChiSo + ' ký tự');

  /* Không được hạ nhầm số thứ tự và hằng số — đây mới là rủi ro thật của việc
     tự động hạ chỉ số. */
  ok(!SUB.test(bais.map(b => b.title).join(' ')), 'KHÔNG hạ nhầm số trong tên bài');
  const ids: string[] = [];
  const gomId = (o: any) => {
    if (Array.isArray(o)) return o.forEach(gomId);
    if (o && typeof o === 'object') { if (typeof o.id === 'string') ids.push(o.id); Object.values(o).forEach(gomId); }
  };
  gomId(bais);
  const idHong = ids.filter(i => SUB.test(i));
  ok(idHong.length === 0, `KHÔNG hạ nhầm số trong mã (${ids.length} mã)`, idHong.join(', '));
  ok(tatCa.includes('24,79'), 'hằng số 24,79 L/mol còn nguyên vẹn');
}

console.log('\n== Dàn bài cả chương trình (khung iChat tư vấn chung) ==');
/* Khối này chỉ gửi ở khung iChat, nơi học sinh không mở bài nào. Nó phải đủ
   để thầy tra ra bài, mà vẫn không lọt đáp án và không bị cắt cụt. */
{
  const dan: string = buildProgramContext();
  ok(!dan.includes('đã lược bớt'), 'không bị cắt cụt (dưới trần 30000)', dan.length + ' ký tự');

  const soBai = (dan.match(/^▸ /gm) ?? []).length;
  ok(soBai === bais.length, `có đủ ${bais.length} bài`, soBai + ' bài');

  const thieuTen = bais.filter(b => !dan.includes(b.title));
  ok(thieuTen.length === 0, 'bài nào cũng có tên trong dàn bài',
     thieuTen.map(b => b.id).join(', '));

  const thieuMa = bais.filter(b => !dan.includes(`(mã: ${b.id})`));
  ok(thieuMa.length === 0, 'bài nào cũng kèm mã bài', thieuMa.map(b => b.id).join(', '));

  /* Cùng lý do với ngữ cảnh từng bài: dàn bài KHÔNG được mang đáp án sang, nếu
     không thầy đọc thấy rồi đưa thẳng cho học sinh. */
  let lot = 0;
  for (const b of bais) {
    for (const q of b.textbook?.practiceQuestions ?? []) {
      if (q.answer && dan.includes(String(q.answer).slice(0, 40))) lot++;
    }
  }
  ok(lot === 0, 'KHÔNG đáp án luyện tập nào lọt vào dàn bài', lot + ' câu lọt');

  /* Lời dặn cách dùng nằm ở CUỐI khối. Còn đọc được nghĩa là chưa bị cắt mất.
     Nội dung lời dặn đổi ngày 14/09/2026: bản cũ bảo "VẪN hỏi học sinh thuộc
     chương nào", mâu thuẫn với câu lệnh hệ thống ("đừng bắt em đoán mò") —
     biên bản thẩm định bắt được. Nay gia sư tự nói bài/chương, không bắt đoán. */
  ok(dan.includes('KHÔNG bắt học sinh đoán chương') && !dan.includes('VẪN hỏi học sinh'),
     'còn nguyên lời dặn bước xác định chương, và không bắt học sinh đoán chương');
}

/* ── Khoá bài tuần tự (04/10/2026) ───────────────────────────────────────────
   Luật do chủ dự án chốt: bài N chỉ mở khi bài N−1 ĐẠT TỪ 7/10 ĐỀ KIỂM TRA.
   Xem slide không tính. Bản khoá trước đó đòi thêm cờ "Nâng cao" không nơi nào
   đặt được, nên em đạt 70% ngay lần đầu vẫn bị chặn bài sau — phép kiểm dưới
   canh đúng trường hợp đó. Hàm thuần, không đọc Firebase. */
console.log('\n== Khoá bài tuần tự ==');
{
  const ds = bais as any[];
  const tienDo = (bang: Record<string, any>) => (ma: string) => bang[ma] ?? null;
  const trong = tienDo({});

  ok(DIEM_MO_BAI_SAU === 7, 'ngưỡng mở bài sau là 7 điểm thang 10', String(DIEM_MO_BAI_SAU));

  ok(!xetKhoaBai(ds, 'bai-5', trong, null).khoa, 'khách (chưa đăng nhập) không bị khoá bài nào');
  ok(!xetKhoaBai(ds, 'bai-5', trong, 'teacher').khoa, 'giáo viên không bị khoá');
  ok(!xetKhoaBai(ds, 'bai-5', trong, 'school_admin').khoa && !xetKhoaBai(ds, 'bai-5', trong, 'admin').khoa,
    'quản trị trường và quản trị web không bị khoá');

  ok(!xetKhoaBai(ds, 'bai-1', trong, 'student').khoa, 'học sinh: bài 1 luôn mở');
  ok(xetKhoaBai(ds, 'bai-2', trong, 'student').khoa, 'học sinh chưa có tiến độ: bài 2 khoá');

  const chiXemSlide = tienDo({ 'bai-1': { basicCompleted: true, bestScore: 0 } });
  ok(xetKhoaBai(ds, 'bai-2', chiXemSlide, 'student').khoa,
    'bài 1 mới chỉ xem hết slide (chưa đạt đề) thì bài 2 VẪN khoá');

  ok(xetKhoaBai(ds, 'bai-2', tienDo({ 'bai-1': { bestScore: 6.9 } }), 'student').khoa, 'bài 1 được 6,9 thì bài 2 khoá');
  ok(!xetKhoaBai(ds, 'bai-2', tienDo({ 'bai-1': { bestScore: 7 } }), 'student').khoa, 'bài 1 được đúng 7 thì bài 2 mở');

  /* Chính lỗi của bản khoá cũ: đạt ngay lần đầu, không cờ Nâng cao nào. */
  const datLanDau = tienDo({ 'bai-1': {
    basicCompleted: true, bestScore: 9.4,
    advancedUnlocked: true, advancedCompleted: false, skippedAdvanced: false,
  } });
  ok(!xetKhoaBai(ds, 'bai-2', datLanDau, 'student').khoa,
    'đạt 9,4 ngay lần đầu, không cờ Nâng cao nào: bài 2 PHẢI mở');
  ok(xetKhoaBai(ds, 'bai-3', datLanDau, 'student').khoa, 'chỉ bài 1 đạt thì bài 3 vẫn khoá (bài chặn của nó là bài 2)');

  ok(xetKhoaBai(ds, 'bai-2', trong, 'student').baiTruoc?.id === 'bai-1'
    && xetKhoaBai(ds, 'bai-25', trong, 'student').baiTruoc?.id === 'bai-24',
    'trả về đúng bài chặn để màn khoá gọi tên');

  /* Bài ôn tập KHÔNG chặn bài sau (chủ dự án chốt 04/10/2026): chúng không có
     câu hỏi riêng nên không ai "đạt đề" của chúng được. */
  const onTap = ds.filter(laBaiOnTap).map(b => b.id);
  ok(JSON.stringify(onTap) === JSON.stringify(['bai-3', 'bai-9', 'bai-14', 'bai-18', 'bai-22', 'bai-25']),
    'nhận đúng 6 bài ôn tập / hệ thống hoá theo tên bài', onTap.join(', '));

  const dat8 = tienDo({ 'bai-8': { bestScore: 8 } });
  ok(xetKhoaBai(ds, 'bai-10', trong, 'student').baiTruoc?.id === 'bai-8',
    'bài 10 đứng sau bài ôn tập 9: bài chặn là bài 8');
  ok(!xetKhoaBai(ds, 'bai-10', dat8, 'student').khoa && !xetKhoaBai(ds, 'bai-9', dat8, 'student').khoa,
    'bài 8 đạt thì cả bài 9 (ôn tập) lẫn bài 10 đều mở');
  ok(xetKhoaBai(ds, 'bai-10', tienDo({ 'bai-9': { bestScore: 10 } }), 'student').khoa,
    'chỉ bài 9 có điểm mà bài 8 chưa đạt thì bài 10 vẫn khoá');
  ok(xetKhoaBai(ds, 'bai-4', trong, 'student').baiTruoc?.id === 'bai-2'
    && xetKhoaBai(ds, 'bai-15', trong, 'student').baiTruoc?.id === 'bai-13'
    && xetKhoaBai(ds, 'bai-19', trong, 'student').baiTruoc?.id === 'bai-17'
    && xetKhoaBai(ds, 'bai-23', trong, 'student').baiTruoc?.id === 'bai-21',
    'bài đầu mỗi chương nhảy qua bài ôn tập của chương trước');

  /* Bài LÀM ĐƯỢC NGAY: lời nhắn cho em phải chỉ tới bài em mở được, không phải
     tới một bài chặn cũng đang khoá. */
  ok(baiLamDuocNgay(ds, 'bai-5', datLanDau, 'student')?.id === 'bai-2',
    'mới đạt bài 1 mà xin bài 5: bài làm được ngay là bài 2 (không phải bài 4 đang khoá)');
  ok(baiLamDuocNgay(ds, 'bai-5', trong, 'student')?.id === 'bai-1', 'chưa đạt bài nào: bài làm được ngay là bài 1');
  const datToi7 = tienDo(Object.fromEntries([1, 2, 4, 5, 6, 7].map(i => ['bai-' + i, { bestScore: 8 }])));
  ok(baiLamDuocNgay(ds, 'bai-12', datToi7, 'student')?.id === 'bai-8',
    'đạt tới bài 7 mà xin bài 12: bài làm được ngay là bài 8 (bài 9 ôn tập không tính)');
  ok(baiLamDuocNgay(ds, 'bai-2', datLanDau, 'student') === undefined
    && baiLamDuocNgay(ds, 'bai-5', trong, 'teacher') === undefined,
    'bài không khoá (hoặc không phải học sinh) thì không có gì phải làm trước');

  /* Chiều ngược lại, đo trên DỮ LIỆU: bài nào đứng ra chặn bài khác thì ngân
     hàng phải đủ câu để ra đề (`createQuiz` cần ít nhất 5 câu cho một đề đủ),
     nếu không chuỗi khoá kẹt ngay tại đó. Đọc bản chụp trong repo — bản này
     đồng bộ từ Firestore, xem `kiem-tra:dong-bo`. */
  const nganHang = JSON.parse(readFileSync(join(HERE, '..', 'public', 'bank', 'ngan-hang.json'), 'utf8')) as any[];
  const soCau: Record<string, number> = {};
  for (const q of nganHang) if (q.lessonId) soCau[q.lessonId] = (soCau[q.lessonId] || 0) + 1;
  const baiChan = new Set(ds.map(b => xetKhoaBai(ds, b.id, trong, 'student').baiTruoc?.id).filter(Boolean) as string[]);
  const chanMaThieuCau = [...baiChan].filter(ma => (soCau[ma] || 0) < 5);
  ok(chanMaThieuCau.length === 0,
    `cả ${baiChan.size} bài đứng ra chặn bài khác đều có từ 5 câu trong ngân hàng`,
    chanMaThieuCau.map(ma => `${ma}: ${soCau[ma] || 0} câu`).join(', ') || 'ít nhất '
      + Math.min(...[...baiChan].map(ma => soCau[ma] || 0)) + ' câu/bài');

  /* Đề cả chương mang mã chương, đề giáo viên giao mang tiền tố `de-giao:` —
     cả hai không phải bài nào, không được khoá. */
  ok(!xetKhoaBai(ds, 'chuong-2', trong, 'student').khoa, 'mã chương (đề cả chương) không bị khoá');
  ok(!xetKhoaBai(ds, 'de-giao:abc123', trong, 'student').khoa, 'đề giáo viên giao không bị khoá');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
