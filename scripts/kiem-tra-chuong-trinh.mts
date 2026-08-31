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
import { buildLessonContext } from '../src/features/tutor/services/lessonContext';

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
for (const t of tay) {
  const moi = bais.find(b => b.id === CHUYEN[t.id]);
  const giong = !!moi && ['summary', 'commonQuestions', 'textbook'].every(
    k => JSON.stringify(moi[k]) === JSON.stringify(t[k]));
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
ok(daiNhat <= 4000, 'ngữ cảnh dài nhất ≤ 4000 ký tự', String(daiNhat));

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
