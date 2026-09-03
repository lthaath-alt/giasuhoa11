/**
 * Phân tích số liệu nghiên cứu có nhóm đối chứng.
 *
 * Chạy:  npm run phan-tich -- scripts/du-lieu/diem-thuc-nghiem.csv
 *
 * Đầu vào là một tệp CSV do giáo viên nhập tay hoặc xuất từ hệ thống, đúng 4 cột:
 *
 *     ma_hoc_sinh,nhanh,diem_truoc,diem_sau
 *     hs-1a2b3c4,socratic,4.5,7.0
 *     hs-9z8y7x6,truc-tiep,5.0,6.5
 *
 * CỐ Ý nhận CSV chứ không đọc thẳng cơ sở dữ liệu: số liệu nghiên cứu phải nằm
 * ở một tệp cố định, xem được bằng mắt, nộp kèm được cho hội đồng và chạy lại
 * lúc nào cũng ra đúng con số đó. Đọc thẳng Firestore thì mỗi lần chạy một kết
 * quả, không ai kiểm chứng lại được.
 *
 * ─── Đọc kết quả thế nào ────────────────────────────────────────────────────
 * Con số quan trọng nhất KHÔNG phải p, mà là **Cohen's d** — mức chênh lệch
 * thực sự. Với cỡ mẫu lớn, một khác biệt bé tí vẫn ra p nhỏ; ngược lại lớp học
 * chỉ 30–40 em thì p có thể không đạt dù cách dạy thật sự tốt hơn. Báo cáo cả
 * hai, và luôn kèm khoảng tin cậy.
 */
import { readFileSync } from 'node:fs';

import { tb, doLech, pHaiPhia, tWelch, cohenD, ySo } from './thong-ke.mjs';

// ── Đọc dữ liệu ─────────────────────────────────────────────────────────────

interface Ban { ma: string; nhanh: string; truoc: number; sau: number }

function docCsv(duong: string): Ban[] {
  /* Bỏ dòng trống và dòng chú thích bắt đầu bằng #, để tệp số liệu ghi được
     ngày thu, lớp nào, ai nhập — những thứ hội đồng sẽ hỏi. */
  const dong = readFileSync(duong, 'utf8').split(/\r?\n/)
    .map(d => d.trim()).filter(d => d && !d.startsWith('#'));
  const dau = dong[0].toLowerCase();
  if (!dau.includes('nhanh') || !dau.includes('diem_truoc') || !dau.includes('diem_sau'))
    throw new Error('Dòng tiêu đề phải là: ma_hoc_sinh,nhanh,diem_truoc,diem_sau');
  const ra: Ban[] = [];
  dong.slice(1).forEach((d, i) => {
    const c = d.split(',').map(x => x.trim());
    if (c.length < 4) throw new Error(`Dòng ${i + 2} thiếu cột: ${d}`);
    const truoc = Number(c[2].replace(',', '.'));
    const sau = Number(c[3].replace(',', '.'));
    if (!Number.isFinite(truoc) || !Number.isFinite(sau))
      throw new Error(`Dòng ${i + 2} có điểm không đọc được: ${d}`);
    if (c[1] !== 'socratic' && c[1] !== 'truc-tiep')
      throw new Error(`Dòng ${i + 2}: nhánh phải là socratic hoặc truc-tiep, đang là "${c[1]}"`);
    ra.push({ ma: c[0], nhanh: c[1], truoc, sau });
  });
  return ra;
}

// ── Chạy ────────────────────────────────────────────────────────────────────

const duong = process.argv[2] ?? 'scripts/du-lieu/diem-thuc-nghiem.csv';
let ds: Ban[];
try {
  ds = docCsv(duong);
} catch (e: any) {
  console.error('Không đọc được dữ liệu:', e.message);
  console.error('\nCách dùng:  npm run phan-tich -- <đường dẫn tệp csv>');
  process.exit(1);
}

const A = ds.filter(x => x.nhanh === 'socratic');
const B = ds.filter(x => x.nhanh === 'truc-tiep');

const so = (n: number, c = 2) => n.toFixed(c).replace('.', ',');

console.log('\n══ SỐ LIỆU NGHIÊN CỨU ══');
console.log(`Tệp: ${duong}`);
console.log(`Tổng số học sinh: ${ds.length}  (Socratic ${A.length} · Đối chứng ${B.length})`);

if (A.length < 2 || B.length < 2) {
  console.error('\nMỗi nhóm cần ít nhất 2 em mới tính được. Dừng ở đây.');
  process.exit(1);
}
if (A.length < 15 || B.length < 15) {
  console.log('\n⚠ CẢNH BÁO CỠ MẪU: dưới 15 em một nhóm thì kiểm định gần như');
  console.log('  không phát hiện được khác biệt vừa phải, kể cả khi nó có thật.');
  console.log('  Vẫn cứ báo cáo, nhưng phải nói rõ hạn chế này.');
}

const tienA = A.map(x => x.sau - x.truoc);
const tienB = B.map(x => x.sau - x.truoc);

console.log('\n── Mô tả ──');
console.log('nhóm       n    trước         sau           tiến bộ');
for (const [ten, g, t] of [['Socratic ', A, tienA], ['Đối chứng', B, tienB]] as const) {
  console.log(`${ten}  ${String(g.length).padStart(2)}   `
    + `${so(tb(g.map(x => x.truoc)))} (±${so(doLech(g.map(x => x.truoc)))})   `
    + `${so(tb(g.map(x => x.sau)))} (±${so(doLech(g.map(x => x.sau)))})   `
    + `${tb(t) >= 0 ? '+' : ''}${so(tb(t))} (±${so(doLech(t))})`);
}

console.log('\n── Kiểm 1: hai nhóm có tương đương từ ĐẦU không? ──');
{
  /* Bắt buộc phải kiểm. Nếu ngay từ đầu nhóm Socratic đã giỏi hơn thì điểm sau
     cao hơn chẳng chứng minh được gì về cách dạy. Chia ngẫu nhiên là để tránh
     chuyện đó, nhưng với lớp nhỏ vẫn lệch được — phải kiểm chứ đừng tin suông. */
  const r = tWelch(A.map(x => x.truoc), B.map(x => x.truoc));
  const canh = r.p < 0.05;
  console.log(`  t(${so(r.df, 1)}) = ${so(r.t)} · p = ${so(r.p, 4)}`);
  console.log(canh
    ? '  ⚠ HAI NHÓM ĐÃ LỆCH NHAU TỪ ĐẦU (p < 0,05). Kết quả sau không quy được\n'
      + '    về cách dạy. Phải phân tích ANCOVA lấy điểm trước làm hiệp biến,\n'
      + '    hoặc chia nhóm lại rồi làm đợt khác.'
    : '  ✓ Không thấy lệch đáng kể — chia nhóm ngẫu nhiên đã làm đúng việc của nó.');
}

console.log('\n── Kiểm 2: MỨC TIẾN BỘ có khác nhau không? (câu hỏi chính) ──');
{
  const r = tWelch(tienA, tienB);
  const { d, g } = cohenD(tienA, tienB);
  console.log(`  Socratic tiến ${so(tb(tienA))} điểm · Đối chứng tiến ${so(tb(tienB))} điểm`);
  console.log(`  Chênh lệch: ${tb(tienA) - tb(tienB) >= 0 ? '+' : ''}${so(tb(tienA) - tb(tienB))} điểm`);
  console.log(`  Welch t(${so(r.df, 1)}) = ${so(r.t)} · p = ${so(r.p, 4)}`);
  console.log(`  Cohen's d = ${so(d)} · Hedges' g = ${so(g)}  (${ySo(g)})`);

  console.log('\n  ĐỌC KẾT QUẢ:');
  if (r.p < 0.05 && Math.abs(g) >= 0.2) {
    console.log(`  Khác biệt có ý nghĩa thống kê (p < 0,05) và mức chênh ${ySo(g)}.`);
    console.log(`  Nhóm ${tb(tienA) > tb(tienB) ? 'Socratic' : 'đối chứng'} tiến bộ hơn.`);
  } else if (r.p < 0.05) {
    console.log('  Có ý nghĩa thống kê nhưng mức chênh quá nhỏ để nói là có ích trên lớp.');
  } else {
    console.log('  CHƯA đủ bằng chứng kết luận hai cách dạy khác nhau.');
    console.log('  Lưu ý: "chưa đủ bằng chứng" KHÔNG có nghĩa là "hai cách như nhau".');
    console.log(`  Với n = ${ds.length} thì chỉ phát hiện nổi khác biệt từ mức ${ySo(0.8)} trở lên.`);
  }
}

console.log('\n── Kiểm 3: mỗi nhóm tự nó có tiến bộ không? ──');
{
  /* Kiểm t cặp: so điểm sau với điểm trước của CHÍNH em đó. Cả hai nhóm cùng
     tiến bộ là chuyện bình thường (các em có học trên lớp suốt đợt); mục này chỉ
     để biết đợt nghiên cứu có diễn ra thật hay không. */
  for (const [ten, t] of [['Socratic ', tienA], ['Đối chứng', tienB]] as const) {
    const n = t.length;
    const tstat = tb(t) / (doLech(t) / Math.sqrt(n));
    const p = pHaiPhia(tstat, n - 1);
    console.log(`  ${ten}: t(${n - 1}) = ${so(tstat)} · p = ${so(p, 4)}`
      + `  ${p < 0.05 ? '→ có tiến bộ rõ rệt' : '→ chưa rõ rệt'}`);
  }
}

console.log('\n── Câu để chép vào báo cáo ──');
{
  const r = tWelch(tienA, tienB);
  const { g } = cohenD(tienA, tienB);
  console.log(`  Nhóm dùng gia sư gợi mở (n = ${A.length}) tiến bộ trung bình ${so(tb(tienA))} điểm`);
  console.log(`  (ĐLC ${so(doLech(tienA))}), nhóm đối chứng (n = ${B.length}) tiến bộ ${so(tb(tienB))} điểm`);
  console.log(`  (ĐLC ${so(doLech(tienB))}). Kiểm định t Welch cho hai mẫu độc lập:`);
  console.log(`  t(${so(r.df, 1)}) = ${so(r.t)}, p = ${so(r.p, 4)}, Hedges' g = ${so(g)}.`);
}

console.log('\n── Cỡ mẫu: cần bao nhiêu em mới đủ sức phát hiện? ──');
{
  /* Câu hỏi hội đồng gần như chắc chắn sẽ hỏi khi kết quả ra p > 0,05:
     "không thấy khác biệt, hay không đủ sức để thấy?"

     Công thức chuẩn cho kiểm định t hai mẫu, mức ý nghĩa 0,05 hai phía, lực
     kiểm định 80%:   n mỗi nhóm ≈ 2 × (1,96 + 0,84)² / d²  ≈  15,7 / d²
     Đây là xấp xỉ dùng phân phối chuẩn, hơi thiếu vài em khi mẫu rất nhỏ —
     đủ dùng để lập kế hoạch, và tra lại được trong bất kỳ giáo trình nào. */
  const can = (d: number) => Math.ceil(15.68 / (d * d));
  console.log('  (mức ý nghĩa 0,05 hai phía · lực kiểm định 80%)');
  for (const [ten, d] of [['lớn  (g = 0,8)', 0.8], ['vừa  (g = 0,5)', 0.5], ['nhỏ  (g = 0,2)', 0.2]] as const)
    console.log(`  Muốn phát hiện chênh lệch mức ${ten}: cần ${can(d)} em MỖI NHÓM (tổng ${can(d) * 2})`);

  const nMoiNhom = Math.min(A.length, B.length);
  const gPhatHien = Math.sqrt(15.68 / nMoiNhom);
  console.log(`\n  Đang có ${nMoiNhom} em mỗi nhóm → chỉ đủ sức phát hiện chênh lệch từ`);
  console.log(`  g ≈ ${so(gPhatHien)} trở lên (${ySo(gPhatHien)}).`);
  if (gPhatHien > 0.8)
    console.log('  ⚠ Ngưỡng này CAO HƠN mức "lớn". Kết quả không đạt ý nghĩa thống kê'
      + '\n    KHÔNG chứng minh hai cách dạy như nhau — chỉ nói lên mẫu còn mỏng.');
}

console.log('\n── Điều PHẢI nói trong phần hạn chế ──');
console.log('  · Không làm mù được: học sinh biết mình đang được dạy kiểu nào.');
console.log('  · Đo bằng bài kiểm tra giấy, không đo được kỹ năng tự học lâu dài.');
console.log('  · Một lớp, một trường, một chương — chưa suy rộng ra được.');
console.log('  · Đợt học ngắn; hiệu ứng mới lạ có thể ảnh hưởng cả hai nhóm.');
console.log('  · Model đóng và có thể được nhà cung cấp cập nhật giữa chừng —');
console.log('    phải ghi rõ tên model và ngày chạy trong báo cáo.\n');
