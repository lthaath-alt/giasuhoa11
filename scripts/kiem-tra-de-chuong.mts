/**
 * Kiểm tra việc chọn câu cho đề kiểm tra tổng hợp một chương.
 *
 * Chạy:  npm run kiem-tra:de-chuong
 *
 * Không gọi mạng. Dùng 160 câu thật trong public/bank/seed-160.json làm ngân
 * hàng, đi qua đúng đường mà web đi: chuanHoaCau → toLegacy → chonCauChoDeChuong.
 *
 * CỐ Ý chỉ import `deChuong.ts` chứ không import `quizService.ts`: quizService
 * kéo theo questionBank → bankStore → firebase, mà firebase gọi getAuth() ngay
 * lúc import và ném lỗi khi chạy ngoài Vite. Phần đáng kiểm là logic chọn câu,
 * và nó đã được tách ra đúng để kiểm được như vậy.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { toLegacy } from '../src/features/bank/convert';
import { chuanHoaCau } from '../src/features/bank/types';
import type { BankQuestion } from '../src/features/bank/types';
import { chonCauChoDeChuong, SO_CAU_DE_CHUONG } from '../src/features/quiz/deChuong';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

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
  const de = chonCauChoDeChuong(cuaChuong);

  ok(de.length === Math.min(SO_CAU_DE_CHUONG, cuaChuong.length),
    `chương ${ch}: đề ${de.length} câu (ngân hàng có ${cuaChuong.length})`,
    MUC.map(m => m + ' ' + de.filter(q => q.difficulty === m).length).join(' · '));

  const ids = de.map(q => q.id);
  ok(new Set(ids).size === ids.length, `chương ${ch}: không câu nào lặp lại`);

  /* Mọi câu phải THUỘC ĐÚNG CHƯƠNG. Lọt câu chương khác thì đề "tổng hợp
     chương" mất nghĩa, mà nhìn đề cũng không nhận ra ngay. */
  const hopLe = new Set(cuaChuong.map(q => q.id));
  ok(ids.every(id => hopLe.has(id)), `chương ${ch}: mọi câu đều thuộc đúng chương`);

  /* Câu trắc nghiệm phải còn đủ phương án và đáp án. Đây đúng chỗ `toLegacy`
     từng đánh rơi khi câu thiếu trường `t` — vỡ lại thì học sinh mở đề ra thấy
     câu hỏi trống trơn. */
  const tn = de.filter(q => q.type === 'Trắc nghiệm');
  const tnHong = tn.filter(q => !q.options || q.options.length < 2 || !q.correctAnswer);
  ok(tnHong.length === 0, `chương ${ch}: ${tn.length} câu trắc nghiệm còn đủ phương án và đáp án`,
    tnHong.map(q => q.id).join(', '));

  const nang = { 'Thấp': 1, 'Trung bình': 2, 'Cao': 3 } as const;
  const day = de.map(q => nang[q.difficulty]);
  ok(day.every((v, i) => i === 0 || v >= day[i - 1]), `chương ${ch}: xếp từ dễ đến khó`);
}

console.log('\n== Chống trùng đề ==');
const c2 = seed.filter(q => q.ch === 2).map(q => toLegacy(q));
const daLam = c2.slice(0, 12).map(q => q.id);
const deMoi = chonCauChoDeChuong(c2, daLam, []);

/* Điều kiện ĐÚNG không phải "tuyệt đối không lặp câu cũ". Cơ cấu đề là bắt buộc
   (3 · 3 · 4), nên khi một mức đã hết câu chưa làm thì buộc phải dùng lại — thà
   lặp còn hơn trả về đề lệch cơ cấu.
   Điều thật sự phải giữ: CHỈ dùng lại câu cũ khi mức đó KHÔNG CÒN câu mới nào.
   Ban đầu tôi đặt tiêu chí "không câu cũ nào lọt" và nó báo hỏng — hoá ra chương
   2 chỉ có 8 câu mức Thấp mà học sinh đã làm cả 8, nên lặp mới là đúng. */
const viPham: string[] = [];
(['Thấp', 'Trung bình', 'Cao'] as const).forEach(muc => {
  const cuTrongDe = deMoi.filter(q => q.difficulty === muc && daLam.includes(q.id)).length;
  const moiConLai = c2.filter(q => q.difficulty === muc && !daLam.includes(q.id)).length;
  const moiTrongDe = deMoi.filter(q => q.difficulty === muc && !daLam.includes(q.id)).length;
  if (cuTrongDe > 0 && moiTrongDe < moiConLai) {
    viPham.push(`${muc}: lấy ${cuTrongDe} câu cũ trong khi còn ${moiConLai - moiTrongDe} câu mới`);
  }
});
ok(viPham.length === 0,
  'chỉ dùng lại câu cũ khi mức đó đã hết câu mới',
  viPham.join(' · ') || `đề ${deMoi.length} câu · ngân hàng ${c2.length}, đã làm ${daLam.length}`);

console.log('\n== Ngân hàng rỗng ==');
ok(chonCauChoDeChuong([]).length === 0,
  'không có câu nào thì trả về mảng rỗng để web báo cho học sinh, không dựng đề giả');

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
