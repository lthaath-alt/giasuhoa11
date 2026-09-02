/**
 * Kiểm tra việc sinh đề kiểm tra tổng hợp một chương.
 *
 * Chạy:  npm run kiem-tra:de-chuong
 *
 * Không gọi mạng: dùng 160 câu thật trong public/bank/seed-160.json làm ngân
 * hàng, đi qua đúng đường mà web đi (chuanHoaCau → toLegacy → createChapterQuiz).
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { toLegacy, toChapter } from '../src/features/bank/convert';
import { chuanHoaCau } from '../src/features/bank/types';
import type { BankQuestion } from '../src/features/bank/types';
import { QuizService } from '../src/features/quiz/quizService';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

/* QuizStorage và createChapterQuiz đụng tới localStorage, mà Node không có.
   Dựng một bản giả tối thiểu — đủ để hàm chạy, và cũng chính là cách kiểm rằng
   hàm không lén phụ thuộc thứ gì khác của trình duyệt. */
const kho: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => (k in kho ? kho[k] : null),
  setItem: (k: string, v: string) => { kho[k] = String(v); },
  removeItem: (k: string) => { delete kho[k]; },
  clear: () => { for (const k of Object.keys(kho)) delete kho[k]; },
};

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten + (chiTiet ? '  — ' + chiTiet : ''));
  if (!dieu) hong++;
};

const seed: BankQuestion[] = JSON.parse(
  readFileSync(join(GOC, 'public/bank/seed-160.json'), 'utf8')).map(chuanHoaCau);

console.log('\n== Đề tổng hợp từng chương ==');
const MUC = ['Thấp', 'Trung bình', 'Cao'] as const;

for (let ch = 1; ch <= 6; ch++) {
  const cuaChuong = seed.filter(q => q.ch === ch).map(q => toLegacy(q));
  const de = QuizService.createChapterQuiz('c' + ch, 'thu@test', cuaChuong);

  if (!cuaChuong.length) {
    ok(de === null, `chương ${ch}: ngân hàng trống thì trả về null, không dựng đề rỗng`);
    continue;
  }

  const soCau = de ? de.questions.length : 0;
  const theoMuc = MUC.map(m => (de?.questions.filter(q => q.difficulty === m).length) || 0);
  ok(!!de && soCau === Math.min(10, cuaChuong.length),
    `chương ${ch}: đề có ${soCau} câu (ngân hàng ${cuaChuong.length} câu)`,
    'Thấp ' + theoMuc[0] + ' · TB ' + theoMuc[1] + ' · Cao ' + theoMuc[2]);

  if (!de) continue;

  const ids = de.questions.map(q => q.id);
  ok(new Set(ids).size === ids.length, `chương ${ch}: không câu nào lặp lại trong đề`);

  /* Mọi câu phải THUỘC ĐÚNG CHƯƠNG. Lọt câu chương khác thì đề "tổng hợp chương"
     mất nghĩa, mà nhìn đề cũng không phát hiện ra ngay. */
  const idHopLe = new Set(cuaChuong.map(q => q.id));
  ok(ids.every(id => idHopLe.has(id)), `chương ${ch}: mọi câu đều thuộc đúng chương này`);

  ok(de.questions.every(q => !!q.content), `chương ${ch}: câu nào cũng có đề bài`);

  /* Câu trắc nghiệm phải còn đủ phương án và đáp án. Đây chính là chỗ toLegacy
     từng đánh rơi khi câu thiếu trường `t` — nếu vỡ lại thì học sinh mở đề ra
     thấy câu hỏi trống trơn. */
  const tn = de.questions.filter(q => q.type === 'Trắc nghiệm');
  const tnHong = tn.filter(q => !q.options || q.options.length < 2 || !q.correctAnswer);
  ok(tnHong.length === 0,
    `chương ${ch}: ${tn.length} câu trắc nghiệm còn đủ phương án và đáp án`,
    tnHong.length ? tnHong.map(q => q.id).join(', ') : '');

  ok(de.maxScore > 0, `chương ${ch}: có điểm tối đa`, String(de.maxScore));
  ok(de.chapterId === 'c' + ch, `chương ${ch}: đề ghi đúng mã chương`);
}

console.log('\n== Sắp xếp theo độ khó ==');
const de1 = QuizService.createChapterQuiz('c2', 'thu2@test',
  seed.filter(q => q.ch === 2).map(q => toLegacy(q)));
const nang = { 'Thấp': 1, 'Trung bình': 2, 'Cao': 3 } as const;
const day = (de1?.questions || []).map(q => nang[q.difficulty]);
ok(day.every((v, i) => i === 0 || v >= day[i - 1]),
  'đề xếp từ dễ đến khó', day.join(' → '));

console.log('\n== Ngân hàng rỗng ==');
ok(QuizService.createChapterQuiz('c1', 'thu3@test', []) === null,
  'không có câu nào thì trả về null để web báo cho học sinh, không dựng đề rỗng');

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
