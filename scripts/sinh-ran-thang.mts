/**
 * Sinh nội dung RẮN và THANG cho trò "Rắn và Thang Hoá 11".
 *
 * Chạy:  npm run sinh:ran-thang
 * Ra:    public/games/du-lieu/ran-thang.json
 *
 * ─── Nguyên tắc quan trọng nhất ──────────────────────────────────────────────
 * TUYỆT ĐỐI KHÔNG viết một câu hoá học SAI vào trò chơi, kể cả khi dán nhãn nó
 * là "lỗi thường gặp". Học sinh lướt qua rất nhanh và cái đọng lại là câu chữ
 * chứ không phải cái nhãn — dạy sai kiểu đó còn hại hơn không dạy.
 *
 * Vì vậy rắn được viết theo hai lối, và chỉ hai lối đó:
 *
 *   1. Lỗi về QUY ƯỚC, nêu kèm cách đúng ngay trong cùng một câu.
 *      "Dùng đktc 22,4 L/mol — sách mới dùng đkc 24,79 L/mol."
 *      Bản thân câu này là câu ĐÚNG, vì nó nói rõ đâu mới là quy ước đúng.
 *
 *   2. BỎ SÓT một điều đúng — không phải khẳng định một điều sai.
 *      "Quên mất: <ý chính có thật của bài>."
 *      Câu trong dấu ngoặc lấy nguyên văn từ dữ liệu bài học, nên luôn đúng.
 *
 * Thang thì đơn giản hơn: lấy thẳng công thức và ý chính của chính bài đó, tức
 * là leo thang cũng là một lần ôn lại kiến thức đúng.
 *
 * ─── Vì sao sinh tự động ────────────────────────────────────────────────────
 * 25 bài × 8 mẩu = 200 mẩu. Viết tay hết thì lâu, mà nội dung vẫn phải lấy từ
 * chính dữ liệu bài học nên chép tay chỉ thêm cơ hội sai sót. Sinh từ nguồn thì
 * sửa bài học là trò chơi tự đúng theo.
 *
 * Giáo viên duyệt lại tệp JSON sinh ra rồi sửa thẳng vào đó cũng được — nhưng
 * nhớ rằng chạy lại lệnh này sẽ ghi đè. Muốn giữ sửa tay thì chép sang tệp khác.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { CHEMISTRY_11_CURRICULUM as CT } from '../src/features/lessons/constants';

/** Rắn dùng chung cho mọi bài: lỗi về quy ước, luôn nêu kèm cách đúng. */
const RAN_CHUNG: { noi: string; sua: string }[] = [
  {
    noi: 'Dùng "đktc" và 22,4 L/mol cho bài toán khí',
    sua: 'Sách Kết nối tri thức dùng đkc: 25 °C, 1 bar, 24,79 L/mol.',
  },
  {
    noi: 'Gọi tên chất theo lối cũ: "natri hiđroxit", "ancol", "anđehit"',
    sua: 'Chương trình 2018 gọi theo IUPAC: sodium hydroxide, alcohol, aldehyde.',
  },
  {
    noi: 'Viết phương trình mà quên cân bằng hệ số',
    sua: 'Cân bằng xong mới dùng được tỉ lệ mol để tính.',
  },
  {
    noi: 'Dùng mũi tên một chiều → cho phản ứng thuận nghịch',
    sua: 'Phản ứng thuận nghịch phải viết bằng mũi tên hai chiều ⇌.',
  },
  {
    noi: 'Ghi kết quả mà quên đơn vị',
    sua: 'Một đáp số không có đơn vị thì chưa phải đáp số.',
  },
  {
    noi: 'Viết số thập phân bằng dấu chấm: 24.79',
    sua: 'Tiếng Việt dùng dấu phẩy: 24,79.',
  },
];

interface Mau { loai: 'thang' | 'ran'; noi: string; sua?: string }

/** Cắt một câu dài cho vừa khung chữ trong trò chơi, không cắt giữa từ. */
function gonLai(s: string, toiDa = 92): string {
  const t = s.replace(/\s+/g, ' ').trim().replace(/[.;:]+$/, '');
  if (t.length <= toiDa) return t;
  const cat = t.slice(0, toiDa);
  const cho = cat.lastIndexOf(' ');
  return (cho > toiDa * 0.6 ? cat.slice(0, cho) : cat) + '…';
}

/** Trộn có hạt giống cố định, để chạy lại nhiều lần vẫn ra cùng kết quả.
 *  Sinh ngẫu nhiên thật thì mỗi lần chạy tệp JSON lại khác, git diff đầy rác
 *  mà nội dung chẳng đổi gì. */
function tron<T>(ds: T[], hat: number): T[] {
  const a = [...ds];
  let h = hat >>> 0;
  const ke = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 2 ** 32; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(ke() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ra: Record<string, { tenBai: string; chuong: string; thang: Mau[]; ran: Mau[] }> = {};
const canhBao: string[] = [];
let soBai = 0;

for (const c of CT) {
  for (const l of c.lessons as any[]) {
    soBai++;

    // ── THANG: kiến thức đúng của chính bài này ──────────────────────────
    const thang: Mau[] = [];
    for (const ct of l.formulae ?? [])
      thang.push({ loai: 'thang', noi: 'Nhớ đúng công thức: ' + gonLai(ct) });
    for (const s of l.textbook?.sections ?? [])
      for (const k of s.keyPoints ?? [])
        thang.push({ loai: 'thang', noi: gonLai(k) });
    for (const m of l.textbook?.objectives ?? [])
      thang.push({ loai: 'thang', noi: gonLai(m) });

    /* Bài ôn tập/hệ thống hoá không có công thức lẫn ý chính riêng — dữ liệu
       của chúng chỉ là phần tóm tắt. Đo được: bài 9 và bài 18 ra 0 thang.
       Tách tóm tắt thành từng câu để vẫn có nội dung leo thang, thay vì để màn
       đó trống trơn. */
    /* Bài ôn tập lấy thêm ý chính từ CÁC BÀI CÙNG CHƯƠNG. Đây không phải chắp
       vá cho đủ số: bài 9 tên là "Hệ thống hoá kiến thức về nitrogen – sulfur",
       nên nội dung đúng của nó chính là kiến thức các bài 4–8. */
    if (thang.length < 4) {
      for (const anh of c.lessons as any[]) {
        if (anh.id === l.id) continue;
        for (const s of anh.textbook?.sections ?? [])
          for (const k of s.keyPoints ?? [])
            if (k.length > 25) thang.push({ loai: 'thang', noi: gonLai(k) });
      }
    }

    if (thang.length < 4 && l.summary) {
      for (const cau of String(l.summary).split(/(?<=[.!?])\s+/)) {
        const t = cau.trim();
        if (t.length > 30) thang.push({ loai: 'thang', noi: gonLai(t) });
      }
    }

    // ── RẮN: quy ước chung + bỏ sót ý đúng của bài ───────────────────────
    const ran: Mau[] = tron(RAN_CHUNG, soBai * 97).slice(0, 4)
      .map(r => ({ loai: 'ran' as const, noi: r.noi, sua: r.sua }));

    /* Rắn riêng bài: CỐ Ý viết dạng "bỏ quên một ý ĐÚNG" chứ không viết một
       mệnh đề sai. Phần trong ngoặc lấy nguyên văn từ bài nên luôn đúng. */
    const yDung = (l.textbook?.sections ?? [])
      .flatMap((s: any) => s.keyPoints ?? [])
      .filter((k: string) => k.length > 25);
    /* Đổi cách nói theo vòng, vì cùng một câu lặp bốn lần trong một màn nhìn
       rất máy móc. Ý nghĩa không đổi: đều là BỎ SÓT một điều đúng, không phải
       khẳng định một điều sai. */
    const LOI_RAN = [
      'Học vội, bỏ sót một ý quan trọng',
      'Chỉ nhớ mỗi công thức, quên mất bản chất',
      'Đọc lướt nên trượt mất một ý của bài',
    ];
    tron(yDung, soBai * 31).slice(0, 3).forEach((k: string, i: number) =>
      ran.push({ loai: 'ran', noi: LOI_RAN[i % LOI_RAN.length], sua: gonLai(k) }));

    const thangCuoi = tron(thang, soBai * 13).slice(0, 4);
    const ranCuoi = tron(ran, soBai * 57).slice(0, 4);

    if (thangCuoi.length < 4) canhBao.push(`${l.id}: chỉ có ${thangCuoi.length} thang`);
    if (ranCuoi.length < 4) canhBao.push(`${l.id}: chỉ có ${ranCuoi.length} rắn`);

    ra[l.id] = { tenBai: l.title, chuong: c.title, thang: thangCuoi, ran: ranCuoi };
  }
}

mkdirSync('public/games/du-lieu', { recursive: true });
writeFileSync('public/games/du-lieu/ran-thang.json', JSON.stringify(ra, null, 1), 'utf8');

console.log(`Đã sinh cho ${soBai} bài → public/games/du-lieu/ran-thang.json`);
console.log(`  thang: ${Object.values(ra).reduce((s, x) => s + x.thang.length, 0)} mẩu`);
console.log(`  rắn  : ${Object.values(ra).reduce((s, x) => s + x.ran.length, 0)} mẩu`);
if (canhBao.length) {
  console.log('\nBài chưa đủ 4 mẩu (trò chơi vẫn chạy, chỉ ít biến hoá hơn):');
  canhBao.forEach(x => console.log('  ' + x));
} else {
  console.log('  Mọi bài đều đủ 4 thang và 4 rắn.');
}

console.log('\n── Xem thử bài 4 ──');
for (const t of ra['bai-4'].thang) console.log('  THANG  ' + t.noi);
for (const r of ra['bai-4'].ran) console.log('  RẮN    ' + r.noi + (r.sua ? '  →  ' + r.sua : ''));
