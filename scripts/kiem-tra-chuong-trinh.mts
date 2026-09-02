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

  /* Lời dặn cách dùng nằm ở CUỐI khối. Còn đọc được nghĩa là chưa bị cắt mất —
     mất nó thì thầy sẽ bỏ bước bắt học sinh xác định chương. */
  ok(dan.includes('Ở bước A1/B1 VẪN hỏi học sinh'),
     'còn nguyên lời dặn giữ bước xác định chương');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
