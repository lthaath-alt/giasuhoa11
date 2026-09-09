/* ─── Kiểm tra bảng màu hai chế độ sáng / tối ─────────────────────────────────
 *
 * Viết bộ này sau khi làm nền tối và dính đúng ba lỗi dưới đây, cả ba đều KHÔNG
 * làm hỏng build, không có cảnh báo, chỉ hiện ra khi nhìn tận mắt vào đúng chế
 * độ đó — nghĩa là rất dễ lọt lên bản chạy thật:
 *
 *   1. Biến chỉ khai ở MỘT chế độ. Chế độ kia không có giá trị, trình duyệt vẽ
 *      màu rỗng (chữ đen / nền trong suốt) mà không báo gì.
 *   2. Dùng biến NỀN làm màu CHỮ (và ngược lại). Ở chế độ sáng --nen-the là
 *      trắng nên chữ trắng trên nút cam nhìn đúng; sang nền tối --nen-the thành
 *      xanh đen, thế là chữ tối trên nút tối, mất hút.
 *   3. Còn sót mã màu viết cứng. Nó không đổi theo chế độ nên thành mảng sáng
 *      chói giữa trang tối.
 *
 * Chạy: npm run kiem-tra:mau
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const GOC = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const CSS = join(GOC, 'src/index.css');

/* Tệp TRANH VẼ: màu trong đó là nét vẽ của hình minh hoạ, đảo theo nền chỉ làm
   hỏng hình. Cố ý không kiểm. */
const TEP_TRANH = new Set(['GameArt.tsx', 'doodles.tsx', 'ChemDoodles.tsx', 'Mascot.tsx']);
/* App.tsx giữ palette của MUI, bắt buộc là màu thật để MUI tính sắc độ. */
const TEP_MIEN = new Set(['App.tsx']);

let soLoi = 0;
const dat = (ten: string) => console.log(`  OK   ${ten}`);
const truot = (ten: string, chiTiet: string) => { soLoi++; console.log(`  SAI  ${ten}\n       ${chiTiet}`); };

function moiTep(thuMuc: string, ra: string[] = []): string[] {
  for (const t of readdirSync(thuMuc)) {
    const d = join(thuMuc, t);
    if (statSync(d).isDirectory()) moiTep(d, ra);
    else if (t.endsWith('.tsx')) ra.push(d);
  }
  return ra;
}

const css = readFileSync(CSS, 'utf8');
function khaiBao(chon: string): Set<string> {
  const i = css.indexOf(chon);
  if (i < 0) return new Set();
  const than = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  return new Set([...than.matchAll(/(--[a-z0-9-]+)\s*:/g)].map(m => m[1]));
}
const sang = khaiBao(':root {');
const toi = khaiBao(':root[data-theme="dark"]');

console.log('\n== Biến màu phải khai đủ ở CẢ HAI chế độ ==');
{
  const thieuToi = [...sang].filter(v => !toi.has(v));
  const thieuSang = [...toi].filter(v => !sang.has(v));
  if (thieuToi.length) truot('mọi biến của nền sáng đều có ở nền tối', `thiếu ở nền tối: ${thieuToi.join(', ')}`);
  else dat(`mọi biến của nền sáng đều có ở nền tối  — ${sang.size} biến`);
  if (thieuSang.length) truot('không có biến chỉ tồn tại ở nền tối', `thiếu ở nền sáng: ${thieuSang.join(', ')}`);
  else dat('không có biến chỉ tồn tại ở nền tối');
}

const dsTep = moiTep(join(GOC, 'src')).filter(f => !TEP_TRANH.has(basename(f)) && !TEP_MIEN.has(basename(f)));

console.log('\n== Biến dùng trong .tsx phải có khai báo ==');
{
  const thieu = new Map<string, string>();
  for (const f of dsTep) {
    for (const m of readFileSync(f, 'utf8').matchAll(/var\((--[a-z0-9-]+)\)/g)) {
      if (!sang.has(m[1]) && !thieu.has(m[1])) thieu.set(m[1], basename(f));
    }
  }
  if (thieu.size) truot('không gõ nhầm tên biến', [...thieu].map(([v, f]) => `${v} (${f})`).join(', '));
  else dat('không gõ nhầm tên biến');
}

console.log('\n== Không dùng lẫn vai NỀN và vai CHỮ ==');
{
  // --nen-* / --vien* là nền và viền; --chu-* là chữ. Riêng --chu-nguoc sinh ra
  // để LÀM CHỮ trên nền màu nên vẫn là vai chữ, không được đem làm nền.
  const lanNen: string[] = [];   // biến nền bị đem làm màu chữ
  const lanChu: string[] = [];   // biến chữ bị đem làm nền
  for (const f of dsTep) {
    // Dòng có chú thích `mau-ok` là chỗ đã xem tay và xác nhận đúng vai.
    const n = readFileSync(f, 'utf8')
      .split(/\r?\n/).filter(d => !d.includes('mau-ok')).join('\n');
    for (const m of n.matchAll(/(^|[^a-zA-Z-])color(?:=|: ?)["']var\((--[a-z0-9-]+)\)["']/g))
      if (/^--(nen|vien)/.test(m[2])) lanNen.push(`${basename(f)}: color → ${m[2]}`);
    /* Nhóm bắt ở đây là m[1], KHÔNG phải m[2]: phần đầu là (?:...) không bắt.
       Bản trước đọc nhầm m[2] nên luôn là undefined, và phép kiểm này chưa bao
       giờ chạy — nó báo ĐẠT suốt mà không hề soi dòng nào. Đúng vì thế mà lỗi
       "nền thanh quản trị dùng --chu-dam" lọt tới tận tay người dùng. */
    for (const m of n.matchAll(/(?:bgcolor|backgroundColor|background)(?:=|: ?)["']var\((--[a-z0-9-]+)\)["']/g))
      if (/^--chu/.test(m[1])) lanChu.push(`${basename(f)}: nền → ${m[1]}`);
  }
  if (lanNen.length) truot('không lấy biến NỀN làm màu chữ', lanNen.slice(0, 6).join(' | ') + (lanNen.length > 6 ? ` … (${lanNen.length} chỗ)` : ''));
  else dat('không lấy biến NỀN làm màu chữ');
  if (lanChu.length) truot('không lấy biến CHỮ làm màu nền', lanChu.slice(0, 6).join(' | ') + (lanChu.length > 6 ? ` … (${lanChu.length} chỗ)` : ''));
  else dat('không lấy biến CHỮ làm màu nền');
}

console.log('\n== Màu nhấn có bản NỀN riêng thì không được dùng làm nền ==');
{
  /* Luật tự bảo trì: HỄ có biến `--X-nen` thì `--X` chỉ dành cho vai CHỮ, và
     dùng `--X` làm nền là sai — vì ở chế độ tối `--X` đã được làm SÁNG lên cho
     dễ đọc trên nền đậm, đem làm nền nút mang chữ trắng thì trắng trên sáng.

     Thêm luật này sau khi lọt hai lỗi cùng kiểu tới tận tay người dùng: nút
     "Tung xúc xắc" trong trò chơi (tương phản 2,33) và nút "Xem SGK" ở trình
     đọc SGK (2,14). Hai phép kiểm cũ không bắt được vì chúng chỉ soi biến
     --chu* và --nen*, không soi màu nhấn. */
  const coBanNen = [...sang].filter(v => sang.has(v + '-nen')).map(v => v.replace(/^--/, ''));
  const pham: string[] = [];
  for (const f of dsTep) {
    const n = readFileSync(f, 'utf8')
      .split(/\r?\n/).filter(d => !d.includes('mau-ok')).join('\n');
    /* Bắt CẢ BIỂU THỨC sau `backgroundColor:`, không chỉ trường hợp `var(--x)`
       nằm ngay sát sau dấu hai chấm.

       Bản đầu của luật này đòi `var(--x)` đứng liền sau, nên mọi chỗ viết dạng
       ba ngôi (`active ? 'var(--teal)' : 'var(--nen-nhat)'`) đều lọt — và đó
       chính là dạng người ta hay viết cho trạng thái ĐANG CHỌN, tức đúng chỗ
       nút mang chữ trắng. Sáu chỗ lọt kiểu này: hai nút chọn vai và nút Đăng
       nhập ở màn đăng nhập, hai ảnh đại diện "đang chọn", cột biểu đồ điểm, và
       bong bóng chat của học sinh. Ở chế độ tối tất cả đều là chữ trắng trên
       nền sáng.

       Cắt ở dấu phẩy đầu tiên, tức hết GIÁ TRỊ của thuộc tính này. Không cắt
       thì `bgcolor: 'var(--nen-luc-nhat)', color: 'var(--teal)'` bị báo oan —
       `--teal` ở đó đang làm chữ, đúng vai. Biểu thức ba ngôi không chứa dấu
       phẩy nên vẫn lọt vào tầm soi. */
    for (const d of n.split('\n')) {
      const m0 = d.match(/(?:bgcolor|backgroundColor|background)(?:=\{?|: ?)([^,]*)/);
      if (!m0) continue;
      for (const m of m0[1].matchAll(/var\((--[a-z0-9-]+)\)/g)) {
        const ten = m[1].replace(/^--/, '');
        if (coBanNen.includes(ten)) pham.push(`${basename(f)}: nền → ${m[1]} (phải dùng --${ten}-nen)`);
      }
    }
  }
  if (coBanNen.length === 0) truot('có biến màu nhấn kèm bản nền riêng', 'chưa khai biến nào');
  else dat(`có ${coBanNen.length} màu nhấn kèm bản nền riêng — ` + coBanNen.map(x => '--' + x).join(', '));
  if (pham.length) truot('không lấy màu nhấn (vai chữ) làm nền', pham.slice(0, 6).join(' | '));
  else dat('không lấy màu nhấn (vai chữ) làm nền');
}

console.log('\n== Không còn mã màu viết cứng ==');
{
  const con: string[] = [];
  for (const f of dsTep) {
    const so = [...readFileSync(f, 'utf8').matchAll(/#[0-9a-fA-F]{6}\b/g)].length;
    if (so) con.push(`${basename(f)} (${so})`);
  }
  const TONG = con.reduce((s, x) => s + Number(x.match(/\((\d+)\)/)![1]), 0);
  // Ngưỡng: chốt ở mức hiện tại để con số chỉ được GIẢM, không được tăng thêm.
  const NGUONG = 70;
  if (TONG > NGUONG) truot(`mã màu cứng không vượt ${NGUONG}`, `đang có ${TONG}: ${con.slice(0, 8).join(', ')}`);
  else dat(`mã màu cứng còn ${TONG} (ngưỡng ${NGUONG}) — phần lớn là màu nhấn chỉ dùng một chỗ`);
}

console.log('\n== Tương phản chữ trên nền ==');
{
  /* Luật là 4,5 — mức WCAG AA cho chữ thường. Trước khi có mục này, hiến chương
     dự án đã ghi con số đó như thể đang có hiệu lực trong khi KHÔNG PHÉP KIỂM
     NÀO đo nó: đo tay ra 14 cặp không đạt, trong đó `--luc` làm chữ chỉ được
     2,32 mà đang dùng ở 11 chỗ. Một luật không ai canh thì chỉ là lời chúc. */
  const NGUONG = 4.5;

  function giaTri(chon: string): Record<string, string> {
    const i = css.indexOf(chon);
    const than = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
    const r: Record<string, string> = {};
    for (const m of than.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) r[m[1]] = m[2];
    return r;
  }
  const BANG = { 'sáng': giaTri(':root {'), 'tối': giaTri(':root[data-theme="dark"]') };

  const doSang = (hex: string) => {
    const [r, g, b] = hex.slice(1).match(/../g)!.map(x => {
      const c = parseInt(x, 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const tuongPhan = (a: string, b: string) => {
    const [x, y] = [doSang(a), doSang(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };

  const CHU_THAN = ['--chu-dam', '--chu-dam-2', '--chu-dam-3', '--chu', '--chu-2', '--chu-mo'];
  const NEN_CHINH = ['--nen-trang', '--nen-the', '--nen-nhat', '--nen-xam', '--nen-rat-nhat'];
  const NEN_NHAT = ['--nen-cam-nhat', '--nen-cam-nhat2', '--nen-luc-nhat', '--nen-luc-nhat2',
                    '--nen-vang-nhat', '--nen-xanh-nhat', '--nen-xanh-nhat2', '--nen-tim-nhat',
                    '--nen-tim-nhat2', '--nen-do-nhat', '--nen-do-nhat2'];
  const NHAN_LAM_CHU = ['--cam', '--teal', '--xanh', '--xanh-dam', '--do', '--luc', '--tim',
                        '--vang', '--vang-dam', '--cam-dam', '--luc-dam', '--luc-dam2',
                        '--xanh-troi', '--xanh-troi2', '--do-dam', '--tim-2', '--xanh-chu',
                        '--xanh-chu2'];
  /* Nền nút mang chữ trắng. --vang-nen CỐ Ý không nằm đây: chữ trắng trên vàng
     chỉ được 2,14, nên nó đi cùng --chu-tren-vang (xem cặp cố định bên dưới).
     Tra trong src/ thì --vang-nen chỉ làm thanh chỉ báo tab và nền khối, không
     có chữ trắng nào đặt lên. */
  const NEN_NUT = ['--xanh-nen', '--xanh-dam-nen', '--teal-nen', '--cam-nen', '--do-nen',
                   '--tim-nen', '--luc-nen'];
  const CO_DINH: [string, string][] = [
    ['--chu-ma', '--nen-ma'],
    ['--chu-tren-nen-dam', '--nen-dam'],
    ['--chu-tren-vang', '--vang-nen'],
    ['--chu-nguoc', '--nen-dam'],
  ];

  /* Danh sách miễn: cặp nào chấp nhận dưới ngưỡng thì phải ghi ra đây kèm LÝ DO,
     để món nợ đếm được chứ không nằm khuất. Hiện đang rỗng — mọi cặp đều đạt sau
     đợt làm đậm bảng màu chế độ sáng ngày 08/09/2026. */
  const MIEN: { chu: string; nen: string; vi_sao: string }[] = [];
  const duocMien = (c: string, n: string) => MIEN.some(m => m.chu === c && m.nen === n);

  const cap: [string, string][] = [
    ...CHU_THAN.flatMap(c => NEN_CHINH.map(n => [c, n] as [string, string])),
    ...NEN_NHAT.map(n => ['--chu-dam', n] as [string, string]),
    ...NHAN_LAM_CHU.map(c => [c, '--nen-the'] as [string, string]),
    ...NEN_NUT.map(n => ['--chu-nguoc', n] as [string, string]),
    ...CO_DINH,
  ];

  for (const [che, b] of Object.entries(BANG)) {
    const rot: string[] = [];
    let soCap = 0;
    for (const [c, n] of cap) {
      if (!b[c] || !b[n] || duocMien(c, n)) continue;
      soCap++;
      const t = tuongPhan(b[c], b[n]);
      if (t < NGUONG) rot.push(`${c} trên ${n} = ${t.toFixed(2)}`);
    }
    if (rot.length) truot(`chế độ ${che}: mọi cặp chữ/nền đạt ${NGUONG}`,
      `${rot.length}/${soCap} cặp chưa đạt — ${rot.slice(0, 6).join('; ')}`);
    else dat(`chế độ ${che}: cả ${soCap} cặp chữ/nền đều đạt ${NGUONG}`);
  }
  if (MIEN.length) console.log(`  GHI   còn ${MIEN.length} cặp trong danh sách miễn`);
}

console.log(soLoi === 0 ? '\n>>> TẤT CẢ ĐẠT\n' : `\n>>> CÓ ${soLoi} MỤC KHÔNG ĐẠT\n`);
process.exit(soLoi === 0 ? 0 : 1);
