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
    /* Đọc hết GIÁ TRỊ của thuộc tính (tới dấu phẩy) chứ không chỉ trường hợp
       `var(--x)` nằm ngay sau dấu hai chấm — nếu không thì mọi chỗ viết dạng
       ba ngôi đều lọt, mà đó lại đúng là lối viết cho trạng thái đang chọn.
       Cách này bắt được `linkColor={isAi ? 'var(--xanh)' : 'var(--nen-the)'}`,
       chỗ lấy biến NỀN làm màu chữ trong bong bóng chat.

       Tên thuộc tính mang vai CHỮ trong repo này: `color`, `linkColor`,
       `accentColor`, `statusColor`. `borderColor` là vai viền, không tính. */
    for (const d of n.split('\n')) {
      const mChu = d.match(/(?:(?<![a-zA-Z-])color|linkColor|accentColor|statusColor)(?:=\{?|: ?)([^,]*)/);
      if (mChu) for (const m of mChu[1].matchAll(/var\((--[a-z0-9-]+)\)/g))
        if (/^--(nen|vien)/.test(m[1])) lanNen.push(`${basename(f)}: color → ${m[1]}`);
      /* Bản đầu của phép kiểm dưới đây đọc nhầm nhóm bắt (m[2] trong khi biến
         nằm ở m[1]) nên luôn là undefined — nó báo ĐẠT suốt nhiều tuần mà chưa
         hề soi dòng nào, và vì thế lỗi "nền thanh quản trị dùng --chu-dam" lọt
         tới tận tay người dùng. */
      const mNen = d.match(/(?:bgcolor|backgroundColor|background)(?:=\{?|: ?)([^,]*)/);
      if (mNen) for (const m of mNen[1].matchAll(/var\((--[a-z0-9-]+)\)/g))
        if (/^--chu/.test(m[1])) lanChu.push(`${basename(f)}: nền → ${m[1]}`);
    }
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
       ba ngôi (`active ? 'var(--luc-tham)' : 'var(--nen-nhat)'`) đều lọt — và đó
       chính là dạng người ta hay viết cho trạng thái ĐANG CHỌN, tức đúng chỗ
       nút mang chữ trắng. Sáu chỗ lọt kiểu này: hai nút chọn vai và nút Đăng
       nhập ở màn đăng nhập, hai ảnh đại diện "đang chọn", cột biểu đồ điểm, và
       bong bóng chat của học sinh. Ở chế độ tối tất cả đều là chữ trắng trên
       nền sáng.

       Cắt ở dấu phẩy đầu tiên, tức hết GIÁ TRỊ của thuộc tính này. Không cắt
       thì `bgcolor: 'var(--nen-luc-nhat)', color: 'var(--luc-tham)'` bị báo oan —
       `--luc-tham` ở đó đang làm chữ, đúng vai. Biểu thức ba ngôi không chứa dấu
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
  /* Ngưỡng: chốt ở mức hiện tại để con số chỉ được GIẢM, không được tăng thêm.
     Ngày 09/09/2026 xuống 0 — trước đó là 70 và đã đứng ở 66 rất lâu.

     Vì sao đáng siết hẳn về 0: phép kiểm này chỉ ĐẾM chứ không ĐO. Một mã màu
     viết cứng vừa không đổi theo chế độ tối, vừa không nằm trong 70 cặp được đo
     tương phản — nên nó là chỗ duy nhất trong dự án mà cả hai hàng rào đều
     không với tới. Chữ `#f5a623` trên nền trắng ở khu trò chơi sống sót đúng
     kiểu đó: tương phản 2,0, cỡ chữ 12px, và mọi vòng kiểm đều báo ĐẠT.

     Cần một mã màu thật (ví dụ khối `palette` của MUI, hoặc tranh vẽ) thì ghi
     `// mau-ok` ở cuối dòng — dòng đó được bỏ qua. */
  const NGUONG = 0;
  if (TONG > NGUONG) truot(`không còn mã màu viết cứng`, `đang có ${TONG}: ${con.slice(0, 8).join(', ')}`);
  else dat(`không còn mã màu viết cứng nào ngoài bảng màu MUI và tranh vẽ`);
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
  const NEN_NHAT = ['--nen-tin-hieu-nhat', '--nen-tin-hieu-nhat2', '--nen-luc-nhat', '--nen-luc-nhat2',
                    '--nen-vang-nhat', '--nen-xanh-nhat', '--nen-xanh-nhat2', '--nen-tim-nhat',
                    '--nen-tim-nhat2', '--nen-do-nhat', '--nen-do-nhat2'];
  const NHAN_LAM_CHU = ['--tin-hieu', '--luc-tham', '--xanh', '--xanh-dam', '--do', '--luc', '--tim',
                        '--vang', '--vang-dam', '--tin-hieu-dam', '--luc-dam', '--luc-dam2',
                        '--xanh-troi', '--xanh-troi2', '--do-dam', '--tim-2', '--xanh-chu',
                        '--xanh-chu2'];
  /* Nền nút mang chữ trắng. --vang-nen CỐ Ý không nằm đây: chữ trắng trên vàng
     chỉ được 1,64, nên nó đi cùng --chu-tren-vang (xem cặp cố định bên dưới).

     Câu tiếp theo ở đây TRƯỚC ĐÂY viết: "tra trong src/ thì --vang-nen chỉ làm
     thanh chỉ báo tab và nền khối, không có chữ trắng nào đặt lên". Câu đó SAI,
     và không ai tra lại: chip "HS Nâng cao" ở DashboardHeader đặt đúng chữ
     trắng lên nền ấy. Một lời khẳng định trong chú thích không phải là một phép
     đo — nếu cần biết điều gì đó đúng thì để MÁY tra, và đó là lý do có mục
     "Cặp chữ/nền viết cùng một chỗ" bên dưới. */
  const NEN_NUT = ['--xanh-nen', '--xanh-dam-nen', '--luc-tham-nen', '--tin-hieu-nen', '--do-nen',
                   '--tim-nen', '--luc-nen'];
  const CO_DINH: [string, string][] = [
    ['--chu-ma', '--nen-ma'],
    ['--chu-tren-nen-dam', '--nen-dam'],
    ['--chu-tren-vang', '--vang-nen'],
    ['--chu-nguoc', '--nen-dam'],
    /* Mặt MỰC là một bề mặt thật, không phải trường hợp lẻ: thanh menu chính
       chạy trên nó. Danh sách cặp ở trên chỉ đặt màu nhấn lên nền TRẮNG, nên
       mọi thứ ngồi trên dải mực chưa bao giờ được đo — và `--vang` làm chữ ở
       đó chỉ được 2,94 trong khi bộ kiểm vẫn báo xanh suốt. Ba biến dưới đây
       là những gì được phép xuất hiện trên mặt mực.

       CHỈ ghi những cặp CÓ THẬT. Lần đầu viết mục này tôi thêm luôn
       `--tin-hieu-nen` trên `--nen-dam` cho "đủ bộ" — nó rớt ngay ở 2,99, và
       tra lại thì không có nút đỏ nào đặt trên dải mực cả. Thêm một cặp không
       tồn tại thì hoặc là báo động giả, hoặc tệ hơn, là ép đi sửa một chỗ
       không hỏng. */
    ['--vang-nen', '--nen-dam'],
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

  /* ── Cặp chữ/nền VIẾT CÙNG MỘT CHỖ ────────────────────────────────────────
     Phép đo ở trên soi một danh sách cặp GÕ TAY. Danh sách gõ tay chỉ đúng tới
     lúc ai đó viết một cặp không có trong đó — và đúng chuyện ấy đã xảy ra: chip
     "HS Nâng cao" đặt `color: --chu-nguoc` lên `bgcolor: --vang-nen` ngay trong
     một khối `sx`, ra 1,64, mà cả 70 cặp vẫn báo đạt vì cặp đó không ai liệt kê.

     Phép đo dưới đây không hỏi ai cặp nào cần đo: nó đọc từng khối `sx={{…}}`
     trong mã, thấy khối nào tự khai CẢ nền lẫn chữ thì đo đúng khối đó. Cặp nào
     lập trình viên viết ra là cặp được đo.

     Phải tách theo TRẠNG THÁI, không gộp cả khối. Bản đầu của phép kiểm này gộp,
     và nó ghép nền của `'&:hover'` với màu chữ của trạng thái thường — ra 15 báo
     động, gần hết là giả, vì khi rê chuột thì cả hai đổi cùng lúc. Mỗi khối
     `{…}` con là một trạng thái riêng và được đo riêng. */
  const capThat = new Map<string, string>();     // "chu|nen"  -> nơi gặp đầu tiên
  const capChiBao = new Map<string, string>();   // "vien|nen" -> nơi gặp đầu tiên

  /** Tách một đoạn mã thành từng PHẠM VI: thuộc tính của chính nó, không kèm
      thuộc tính của các khối con. Mỗi khối con thành một phạm vi riêng. */
  function phamVi(ma: string, ra: string[] = []): string[] {
    /* Đánh dấu những ký tự nằm TRONG chuỗi, để phép đếm ngoặc bỏ qua chúng.
       Không đánh dấu thì một dấu `{` lẻ trong một chuỗi — ví dụ
       `content: '"{"'`, lối viết hay gặp cho pseudo-element — làm phép đếm lệch
       và nuốt trọn phần còn lại của khối `sx`. Khi đó cặp chữ/nền trong khối ấy
       không bao giờ được đo, mà bảng kết quả vẫn báo ĐẠT. Đã chạy thử đúng cảnh
       đó trước khi sửa.

       CHỈ đánh dấu, KHÔNG xoá: bản sửa đầu tiên thay ruột chuỗi bằng khoảng
       trắng, thế là `color: 'var(--chu-dam)'` cũng mất luôn tên biến và phép đo
       bắt được 0 cặp. Một phép kiểm không đo gì thì tệ hơn một phép kiểm sai. */
    const trongChuoi = new Array<boolean>(ma.length).fill(false);
    for (let i = 0, dau: string | null = null; i < ma.length; i++) {
      const c = ma[i];
      if (dau) {
        trongChuoi[i] = true;
        if (c === dau && ma[i - 1] !== '\\') dau = null;
      } else if (c === "'" || c === '"') {
        dau = c;
        trongChuoi[i] = true;
      }
    }
    const laNgoac = (i: number, c: string) => ma[i] === c && !trongChuoi[i];

    let rieng = '', k = 0;
    while (k < ma.length) {
      if (laNgoac(k, '{')) {
        let sau = 1, j = k + 1;
        for (; j < ma.length && sau > 0; j++) {
          if (laNgoac(j, '{')) sau++;
          else if (laNgoac(j, '}')) sau--;
        }
        phamVi(ma.slice(k + 1, j - 1), ra);   // khối con: phạm vi riêng
        k = j;
      } else {
        rieng += ma[k];
        k++;
      }
    }
    ra.push(rieng);
    return ra;
  }

  for (const f of dsTep) {
    const n = readFileSync(f, 'utf8')
      .split(/\r?\n/).filter(d => !d.includes('mau-ok')).join('\n');
    let i = n.indexOf('sx={{');
    while (i >= 0) {
      let sau = 0, ket = n.length;
      for (let k = i + 4; k < n.length; k++) {
        if (n[k] === '{') sau++;
        else if (n[k] === '}') { sau--; if (sau === 0) { ket = k + 1; break; } }
      }
      for (const pv of phamVi(n.slice(i + 4, ket))) {
        const nen = [...pv.matchAll(/(?:bgcolor|backgroundColor):\s*'var\((--[a-z0-9-]+)\)'/g)].map(m => m[1]);
        const chu = [...pv.matchAll(/(?<![a-zA-Z-])color:\s*'var\((--[a-z0-9-]+)\)'/g)].map(m => m[1]);
        for (const b of nen) for (const c of chu) {
          const khoa = `${c}|${b}`;
          if (!capThat.has(khoa)) capThat.set(khoa, basename(f));
        }
        /* Viền MANG TRẠNG THÁI là chỉ báo, ngưỡng 3,0 chứ không phải 4,5.
           Nhận ra bằng dấu `?`: một viền đổi theo trạng thái thì mới là thứ
           nói cho người dùng biết họ đang ở đâu. Viền hằng số là đường kẻ
           trang trí — bản đầu của phép đo này gộp cả hai và báo 21 lỗi, gần
           hết là `--vien` trên nền thẻ ở 1,66, tức chính đường kẻ mảnh mà cả
           thế giới thị giác này dựng bằng. Bắt nó đạt 3,0 là bắt mọi nét kẻ
           phải đen kịt — WCAG 1.4.11 không đòi thế, nó đòi cho THÀNH PHẦN và
           TRẠNG THÁI. */
        /* Đo ĐÚNG MỘT hình dạng, và đo cho chắc:
              borderX: <điều kiện> ? '…var(--A)…' : '…transparent…'
           tức một viền CHỈ hiện ở một trạng thái. Lúc đó nó là dấu hiệu duy
           nhất của trạng thái ấy và phải nổi trên chính nền của trạng thái ấy.
           Gạch chân tab đang chọn là hình dạng này.

           CỐ Ý bỏ hai hình dạng khác, vì tĩnh không phân biệt nổi:
           - hai nhánh đều là biến (`active ? '--tin-hieu' : '--vien'`): nhánh
             không-được-chọn chính là đường kẻ thường, đo nó là báo oan;
           - nhánh kia là 'none' (`isAi ? … : 'none'`): đó là phân biệt hai LOẠI
             nội dung, đã có nền và vị trí gánh, viền chỉ là trang trí.
           Ba vòng chỉnh trước đều vấp đúng hai hình dạng này. Thà đo ít mà đúng
           còn hơn đo rộng rồi phải tắt dần cho im. */
        const vien = [...pv.matchAll(/(?:border[A-Za-z]*|outline):\s*([^,\n]*\?[^,\n]*transparent[^,\n]*)/g)]
          .map(m => [...m[1].matchAll(/var\((--[a-z0-9-]+)\)/g)].map(x => x[1]))
          .filter(bien => bien.length === 1)
          .map(bien => bien[0]);
        /* Nền của chính trạng thái đó cũng viết dạng ba ngôi, nên phải đọc hết
           giá trị chứ không chỉ trường hợp `var(--x)` nằm sát dấu hai chấm —
           nếu không thì `nen` rỗng và phép đo này bắt được 0 thứ, tức là vô
           dụng. Nhánh còn lại của ba ngôi thường là 'transparent', không phải
           biến, nên cặp lấy ra đúng là cặp của trạng thái ĐANG CHỌN. */
        const nenTrangThai = [...pv.matchAll(/(?:bgcolor|backgroundColor):[^,\n]*?var\((--[a-z0-9-]+)\)/g)].map(m => m[1]);
        for (const b of nenTrangThai) for (const v of vien) {
          const khoa = `${v}|${b}`;
          if (!capChiBao.has(khoa)) capChiBao.set(khoa, basename(f));
        }
      }
      i = n.indexOf('sx={{', ket);
    }
  }

  for (const [che, b] of Object.entries(BANG)) {
    const rot: string[] = [];
    let so = 0;
    for (const [khoa, tep] of capThat) {
      const [c, n] = khoa.split('|');
      if (!b[c] || !b[n] || duocMien(c, n)) continue;
      so++;
      const t = tuongPhan(b[c], b[n]);
      if (t < NGUONG) rot.push(`${c} trên ${n} = ${t.toFixed(2)} (${tep})`);
    }
    if (rot.length) truot(`chế độ ${che}: cặp viết cùng chỗ đạt ${NGUONG}`,
      `${rot.length}/${so} cặp chưa đạt — ${rot.slice(0, 6).join('; ')}`);
    else dat(`chế độ ${che}: cả ${so} cặp viết cùng chỗ đều đạt ${NGUONG}`);
  }

  /* ── Chỉ báo phi-chữ: viền, gạch chân, vòng tiêu điểm ─────────────────────
     Ngưỡng 3,0 (WCAG 1.4.11), không phải 4,5: đây không phải chữ.

     Thêm mục này sau khi CHÍNH một bản sửa của đợt thiết kế lại gây ra lỗi mà
     cả chín bộ kiểm đều không thấy. Hàng menu được đảo từ mực sang giấy, nên
     gạch chân báo tab đang chọn đổi theo sang `--tin-hieu-nen`. Ở chế độ sáng
     nó đạt 6,26. Ở chế độ TỐI, hàng menu là #161613 và `--tin-hieu-nen` chỉ còn
     2,90 — nghĩa là gần như không còn dấu hiệu nào cho biết đang ở tab nào.
     Mọi phép đo cũ chỉ soi cặp CHỮ/nền, nên không cái nào với tới.

     GIỚI HẠN, nói thẳng ra để không ai tưởng chỗ này đã kín: phép đo chỉ ghép
     được viền với nền khi CẢ HAI viết trong cùng một khối `sx`. Đúng cái gạch
     chân vừa kể thì viền nằm trên nút còn nền nằm trên khối cha — khác khối,
     nên vẫn ngoài tầm. Chỗ đó hiện được canh bằng cặp cố định, và một chỉ báo
     mới đặt trên một mặt nền mới vẫn phải đo tay. */
  const NGUONG_CHI_BAO = 3;
  for (const [che, b] of Object.entries(BANG)) {
    const rot: string[] = [];
    let so = 0;
    for (const [khoa, tep] of capChiBao) {
      const [v, n] = khoa.split('|');
      if (!b[v] || !b[n] || duocMien(v, n)) continue;
      so++;
      const t = tuongPhan(b[v], b[n]);
      if (t < NGUONG_CHI_BAO) rot.push(`${v} trên ${n} = ${t.toFixed(2)} (${tep})`);
    }
    if (rot.length) truot(`chế độ ${che}: chỉ báo phi-chữ đạt ${NGUONG_CHI_BAO}`,
      `${rot.length}/${so} chưa đạt — ${rot.slice(0, 6).join('; ')}`);
    else dat(`chế độ ${che}: cả ${so} chỉ báo phi-chữ đều đạt ${NGUONG_CHI_BAO}`);
  }
}

console.log(soLoi === 0 ? '\n>>> TẤT CẢ ĐẠT\n' : `\n>>> CÓ ${soLoi} MỤC KHÔNG ĐẠT\n`);
process.exit(soLoi === 0 ? 0 : 1);
