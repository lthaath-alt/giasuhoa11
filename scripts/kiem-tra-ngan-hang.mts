/**
 * Kiểm tra chuyển đổi ngân hàng câu hỏi giữa web và trò chơi.
 *
 * Chạy:  npm run kiem-tra:ngan-hang
 *
 * Không gọi mạng. Đây là chỗ dễ hỏng ngầm nhất trong dự án: web và trò chơi
 * dùng hai dạng dữ liệu khác nhau, đồng bộ hai chiều qua IndexedDB. Chuyển
 * sai một lượt là mất câu hỏi thật của giáo viên mà không ai biết ngay.
 *
 * Phép thử cốt lõi là KHỨ HỒI: web -> trò chơi -> web phải ra đúng câu ban đầu.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { fromLegacy, toLegacy, toChapter } from '../src/features/bank/convert';
import { pointsOf, chuanHoaCau, LEVELS, CHAPTERS, QTYPE_NAME } from '../src/features/bank/types';
import type { BankQuestion } from '../src/features/bank/types';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten + (chiTiet ? '  — ' + chiTiet : ''));
  if (!dieu) hong++;
};

console.log('\n== Bảng hằng số ==');
ok(CHAPTERS.length === 6, '6 chương', String(CHAPTERS.length));
ok(LEVELS.length === 4, '4 mức độ (nb/th/vd/vdc)', LEVELS.map(l => l.key).join(', '));
ok(Object.keys(QTYPE_NAME).length === 4, '4 dạng câu hỏi', Object.keys(QTYPE_NAME).join(', '));
/* Điểm phải TĂNG DẦN theo mức độ. Nếu một mức khó lại cho điểm thấp hơn mức dễ
   thì học sinh chọn toàn câu dễ vẫn thắng, hỏng luôn ý nghĩa trò chơi. */
const diem = LEVELS.map(l => l.pts);
ok(diem.every((p, i) => i === 0 || p >= diem[i - 1]),
  'điểm tăng dần theo mức độ', diem.join(' → '));

console.log('\n== toChapter: chặn dữ liệu rác ==');
/* Chương phải là 1..6. Dữ liệu hỏng lọt qua sẽ làm câu hỏi biến mất khỏi mọi
   bộ lọc theo chương mà không báo lỗi gì. */
for (const [vao, mong] of [[1, 1], [6, 6], ['3', 3], [0, 1], [7, 1], [99, 1],
                           [null, 1], [undefined, 1], ['abc', 1], [-2, 1], [2.7, 2]] as const) {
  const ra = toChapter(vao as unknown);
  ok(ra === mong, `toChapter(${JSON.stringify(vao)}) = ${mong}`, ra !== mong ? `nhận ${ra}` : '');
}

console.log('\n== Khứ hồi web → trò chơi → web ==');
const seed: any[] = JSON.parse(readFileSync(join(GOC, 'public/bank/seed-160.json'), 'utf8'));
console.log(`  (dùng ${seed.length} câu thật trong public/bank/seed-160.json)`);

/* 148/160 câu mẫu không có trường `t`. Web đọc ngân hàng qua BankFirestore
   .getAll(), vốn đã chạy chuanHoaCau() cho từng câu, nên phép thử cũng phải đi
   qua đúng cửa đó — nếu không là thử một đường mà thực tế không ai đi. */
const soThieuT = seed.filter((q: any) => !q.t).length;
ok(true, `ngân hàng có ${soThieuT}/${seed.length} câu thiếu trường "t" (dạng câu)`,
  'chuanHoaCau() phải bù lại');
const daChuan = (seed as BankQuestion[]).map(chuanHoaCau);
ok(daChuan.every(q => !!q.t), 'sau chuanHoaCau mọi câu đều có dạng câu');

/* Dạng cũ của web KHÔNG có trường chương — `fromLegacy` nhận chương qua tham số
   ctx, và migrate.ts truyền vào đúng như vậy. Phép thử phải làm y hệt, nếu
   không thì mọi câu đều "lệch" chương chỉ vì bài thử gọi thiếu tham số. */
const diVong = (q: BankQuestion) => fromLegacy(toLegacy(q), { chapterId: 'c' + q.ch });

let lechNoiDung = 0;
const viDuLech: string[] = [];
const mc = daChuan.filter(q => q.t === 'mc');
for (const q of mc) {
  const m: any = diVong(q);
  const canh = (x: any) => JSON.stringify({ q: x.q, o: x.o, a: x.a, ch: x.ch, t: x.t });
  if (canh(q) !== canh(m)) {
    lechNoiDung++;
    if (viDuLech.length < 3) viDuLech.push(`  ${q.id}\n    trước: ${canh(q)}\n    sau  : ${canh(m)}`);
  }
}
ok(lechNoiDung === 0,
  'câu trắc nghiệm đi vòng web → trò chơi → web: đề, 4 phương án, đáp án, chương đều nguyên vẹn',
  lechNoiDung ? `${lechNoiDung}/${mc.length} câu lệch` : `${mc.length}/${mc.length} câu khớp`);
if (viDuLech.length) console.log(viDuLech.join('\n'));

console.log('\n== Những mất mát ĐÃ BIẾT của mô hình cũ ==');
/* Hai chỗ dưới đây là hạn chế có chủ ý, đã ghi trong convert.ts: dạng cũ của
   web chỉ có 3 mức (không có "vận dụng cao") và Đúng/Sai chỉ có MỘT mệnh đề.
   Không coi là lỗi, nhưng khoá lại để nếu mất mát lan rộng thêm thì biết ngay. */
const doiMuc = daChuan.filter(q => (diVong(q) as any).lv !== q.lv);
const kieuDoi = [...new Set(doiMuc.map(q => `${q.lv} → ${(diVong(q) as any).lv}`))];
ok(kieuDoi.length <= 1 && (kieuDoi[0] ?? 'vdc → vd') === 'vdc → vd',
  'mức độ chỉ mất đúng một kiểu: vdc → vd (dạng cũ không có mức vận dụng cao)',
  `${doiMuc.length} câu · ${kieuDoi.join(', ') || 'không câu nào đổi'}`);

const tfTn = daChuan.filter(q => q.t === 'tf' || q.t === 'tn');
const giuDang = tfTn.filter(q => (diVong(q) as any).t === q.t).length;
ok(giuDang === tfTn.filter(q => q.t === 'tf').length,
  'Đúng/Sai giữ nguyên dạng; Trả lời ngắn chuyển thành Tự luận (dạng cũ không có "tn")',
  `${giuDang}/${tfTn.length} câu giữ dạng`);

console.log('\n== Tính điểm ==');
for (const l of LEVELS) {
  const q = { id: 'x', q: 'thử', ch: 1, lv: l.key, t: 'mc', o: ['a', 'b'], a: 0 } as BankQuestion;
  ok(pointsOf(q) > 0, `câu mức "${l.key}" có điểm dương`, String(pointsOf(q)));
}

console.log('\n== Dữ liệu seed-160 có hợp lệ không ==');
const xau = seed.filter((q: any) =>
  !q.q || !q.id ||
  !(q.ch >= 1 && q.ch <= 6) ||
  !LEVELS.some(l => l.key === q.lv) ||
  ((q.t ?? 'mc') === 'mc' && (!Array.isArray(q.o) || q.o.length < 2 || !(q.a >= 0 && q.a < q.o.length))));
ok(xau.length === 0, 'mọi câu trong ngân hàng đều đủ trường và đáp án hợp lệ',
  xau.length ? xau.slice(0, 3).map((q: any) => q.id).join(', ') : `${seed.length} câu sạch`);

const trung = seed.map((q: any) => q.id).filter((v, i, a) => a.indexOf(v) !== i);
ok(trung.length === 0, 'không có id trùng nhau', trung.slice(0, 5).join(', ') || 'tất cả id riêng biệt');

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC HỎNG`) + '\n');
process.exit(hong === 0 ? 0 : 1);
