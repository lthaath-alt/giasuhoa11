/**
 * Gán câu hỏi trong ngân hàng cho từng BÀI học.
 *
 * Chạy:  npm run gan:cau-hoi
 * Ra:    public/games/du-lieu/cau-hoi-theo-bai.json
 *
 * ─── Vì sao cần ─────────────────────────────────────────────────────────────
 * Ngân hàng gắn chắc chắn theo CHƯƠNG (trường `ch` = 1…6); trường `lessonId`
 * thì có câu có câu không — thầy gắn tay trên web nên còn sót lại một phần.
 * Mà trò Rắn và Thang chia 25 màn theo 25 bài. Nếu mỗi màn cứ rút bừa một
 * câu trong chương thì màn "Bài 4: Nitrogen" và màn "Bài 8: Sulfuric acid" rút
 * từ chung một rổ — chơi thấy y hệt nhau, và câu hỏi thường lệch hẳn bài.
 *
 * ─── Cách làm ───────────────────────────────────────────────────────────────
 * Chấm điểm mức khớp giữa câu hỏi và bài, bằng từ khoá lấy từ chính nội dung
 * bài: tên bài, tóm tắt, công thức, ý chính. Câu nào khớp nhiều thì xếp trước.
 *
 * CỐ Ý không vứt bỏ câu điểm thấp: trò chơi lấy lần lượt từ đầu danh sách, hết
 * câu khớp thì tự dùng tiếp câu cùng chương. Nhờ vậy màn nào cũng đủ câu, mà
 * câu sát bài vẫn được ưu tiên — đúng như yêu cầu "ưu tiên câu riêng bài, thiếu
 * thì bù từ chương".
 *
 * Đây là cách gán MÁY, không phải thẩm định chuyên môn. Tệp JSON sinh ra kèm
 * điểm khớp để giáo viên soi lại và sửa tay chỗ nào thấy chưa đúng.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { CHEMISTRY_11_CURRICULUM as CT } from '../src/features/lessons/constants';

const bank = JSON.parse(readFileSync('public/bank/ngan-hang.json', 'utf8')) as any[];

/* Từ quá phổ biến thì có mặt ở mọi câu, giữ lại chỉ làm nhiễu điểm. */
const BO_QUA = new Set(('của và các là có trong cho với khi một những được không '
  + 'sau đây nào thì này đó về từ như để bị theo hay hoặc còn đến ra vào nên '
  + 'chất phản ứng dung dịch công thức hợp bài học sinh sau đúng hãy nêu tính '
  + 'trên dưới nhất nhiều hơn cùng nhưng mà do vì nếu sẽ đã đang cũng rất').split(/\s+/));

/** Cắt một đoạn thành tập từ khoá: từ dài ≥ 4 chữ, và mọi công thức hoá học. */
function tuKhoa(s: string): Set<string> {
  const ra = new Set<string>();
  if (!s) return ra;
  /* Công thức giữ nguyên chữ hoa/thường vì "CO" và "Co" là hai chất khác nhau.
     Bắt cả dạng có chỉ số dưới (N₂) lẫn dạng viết thô còn sót (N2). */
  for (const m of s.match(/(?:[A-Z][a-z]?[₀-₉\d]*)+/g) ?? [])
    if (m.length >= 2 && /[A-Z]/.test(m)) ra.add('#' + m);
  for (const m of s.toLowerCase().match(/[a-zà-ỹ]{4,}/g) ?? [])
    if (!BO_QUA.has(m)) ra.add(m);
  return ra;
}

function gop(...ds: (string | undefined)[]): Set<string> {
  const ra = new Set<string>();
  for (const s of ds) if (s) for (const t of tuKhoa(s)) ra.add(t);
  return ra;
}

const ket: Record<string, { tenBai: string; ch: number; cau: { id: string; diem: number }[] }> = {};
const thongKe: string[] = [];

for (const c of CT) {
  const ch = Number(c.id.replace('chuong-', ''));
  const cuaChuong = bank.filter(q => q.ch === ch);

  for (const l of c.lessons as any[]) {
    const kho = gop(
      l.title,
      l.summary,
      ...(l.formulae ?? []),
      ...(l.textbook?.sections ?? []).flatMap((s: any) => [s.sectionTitle, ...(s.keyPoints ?? [])]),
      ...(l.textbook?.objectives ?? []),
    );

    const cham = cuaChuong.map(q => {
      const tq = gop(q.q, ...(q.o ?? []), q.e);
      let diem = 0;
      /* Câu thầy đã TỰ GẮN vào bài này thì luôn xếp trước mọi câu đoán bằng từ
         khoá — cộng thẳng 100 điểm, cao hơn mọi điểm khớp có thể đạt được.
         Trước đây script bỏ qua hẳn trường `lessonId`, tức là vứt đi phần thẩm
         định của người dạy để tin vào phép đếm từ trùng. */
      if (q.lessonId && q.lessonId === l.id) diem += 100;
      for (const t of tq) {
        if (!kho.has(t)) continue;
        /* Trùng một công thức hoá học nói lên nhiều hơn trùng một từ thường:
           câu nhắc tới N₂ gần như chắc chắn thuộc bài Nitrogen, còn trùng từ
           "nhiệt độ" thì bài nào cũng có. */
        diem += t.startsWith('#') ? 3 : 1;
      }
      return { id: q.id as string, diem };
    }).sort((a, b) => b.diem - a.diem);

    ket[l.id] = { tenBai: l.title, ch, cau: cham };

    const khop = cham.filter(x => x.diem >= 3).length;
    const ganTay = cham.filter(x => x.diem >= 100).length;
    thongKe.push(`${l.id.padEnd(7)} ${String(ganTay).padStart(2)} gắn tay + ${String(khop - ganTay).padStart(2)} khớp rõ`
      + ` / ${String(cham.length).padStart(2)} câu cùng chương   ${l.title.slice(0, 38)}`);
  }
}

mkdirSync('public/games/du-lieu', { recursive: true });
writeFileSync('public/games/du-lieu/cau-hoi-theo-bai.json', JSON.stringify(ket, null, 1), 'utf8');

console.log('Đã gán → public/games/du-lieu/cau-hoi-theo-bai.json\n');
console.log('bài     câu thầy gắn tay + câu máy thấy khớp rõ (điểm ≥ 3)');
console.log('─'.repeat(74));
thongKe.forEach(x => console.log('  ' + x));

const it = Object.entries(ket).filter(([, v]) => v.cau.filter(x => x.diem >= 3).length < 6);
console.log(`\nBài có DƯỚI 6 câu khớp rõ: ${it.length}`);
if (it.length) console.log('  ' + it.map(([k]) => k).join(', ')
  + '\n  (vẫn chơi được — trò chơi tự lấy tiếp câu cùng chương)');

console.log('\n── Soi thử: 5 câu xếp đầu của bài 4 (Nitrogen) ──');
for (const x of ket['bai-4'].cau.slice(0, 5)) {
  const q = bank.find(b => b.id === x.id)!;
  console.log(`  [${String(x.diem).padStart(2)}đ] ${String(q.q).replace(/\s+/g, ' ').slice(0, 78)}`);
}
console.log('\n── Và 3 câu xếp cuối (để thấy khác biệt) ──');
for (const x of ket['bai-4'].cau.slice(-3)) {
  const q = bank.find(b => b.id === x.id)!;
  console.log(`  [${String(x.diem).padStart(2)}đ] ${String(q.q).replace(/\s+/g, ' ').slice(0, 78)}`);
}
