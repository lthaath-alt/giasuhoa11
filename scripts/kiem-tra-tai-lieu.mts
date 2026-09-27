/**
 * Kiểm tài liệu chỉ dẫn có còn khớp mã nguồn không.
 *
 * Chạy:  npm run kiem-tra:tai-lieu
 * Không gọi mạng.
 *
 * ─── Vì sao cần ─────────────────────────────────────────────────────────────
 * `CLAUDE.md` là tệp đầu tiên mọi phiên làm việc đọc. Nó lệch khỏi mã thì mọi
 * việc sau đó đi lệch theo, mà không có gì báo — build vẫn xanh, kiểu vẫn đúng.
 *
 * Đã lệch nặng một lần, phát hiện ngày 08/09/2026: tệp mô tả bốn thư mục
 * `src/lib/`, `src/services/`, `src/components/`, `src/guards/` chưa bao giờ tồn
 * tại; chỉ sai đường dẫn Auth (`AuthContext.tsx` trong khi tệp thật là
 * `AppContext.tsx`); ghi ba gói `react-hook-form`, `zod`, `recharts` chưa bao
 * giờ được cài; ghi sai màu chủ đạo và sai cả bốn tên vai trò người dùng.
 *
 * Bộ kiểm này chỉ bắt được loại lỗi ĐẾM ĐƯỢC — đường dẫn không tồn tại, lệnh
 * npm không có, gói chưa cài. Nó KHÔNG đọc hiểu được câu chữ, nên vẫn phải đọc
 * bằng mắt khi sửa lớn. Bắt được một phần còn hơn không bắt được gì.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);
};

/* Những chuỗi tài liệu CỐ Ý nhắc tới để CẢNH BÁO là chúng không tồn tại. Không
   có danh sách này thì bộ kiểm đi tố cáo chính lời cảnh báo — và người sửa sẽ
   xoá lời cảnh báo cho hết lỗi, tức là mất đúng phần có ích nhất. */
const CO_Y_VANG = new Set([
  'src/lib/', 'src/services/', 'src/components/', 'src/guards/', 'core/theme/',
  'core/services/', 'react-hook-form', 'zod', 'recharts',
  // Tệp cấu hình riêng từng máy: nhắc tới để nói rõ nó VẪN bị .gitignore chặn,
  // nên trên máy chưa sinh ra nó thì đường dẫn này không tồn tại là đúng.
  'settings.local.json',
  // Phiên đăng nhập Playwright cất ra: chỉ sinh ra sau khi chạy
  // `npm run kiem-tra:e2e` với tài khoản thử, và `.gitignore` chặn nó vì nó
  // mang token thật. Máy vừa clone về KHÔNG có thư mục này, và đó là đúng.
  'tests/.auth/',
  // Bản dựng: chỉ có sau `npm run build`, và `.gitignore` chặn nó. Máy vừa
  // clone hay worktree chưa build thì không có — đo ngày 27/09/2026, bốn tệp
  // tài liệu đỏ oan trong worktree chỉ vì nhắc tới thư mục này.
  'dist/',
]);
/* Không phải đường dẫn: mẫu đặt tên, đường dẫn URL, đuôi tệp đứng một mình,
   và đường dẫn TÀI LIỆU FIRESTORE (`quan_tri/dong_quan_tri` là một document
   trên Firestore, không phải tệp trên đĩa — 13/09/2026). Liệt kê từng chuỗi
   một chứ đừng bỏ qua theo mẫu: bỏ theo mẫu là mở cửa cho đường dẫn tệp thật
   viết sai lọt qua. Cùng lý do đó, MÃ LỖI của Firebase cũng mang dấu gạch
   chéo (`auth/admin-restricted-operation`) mà không phải tệp — 16/09/2026. */
const KHONG_PHAI_DUONG_DAN = new Set(['PascalCase.tsx', '.tsx', '.json', 'pages/', '/login', '/*',
  'quan_tri/dong_quan_tri', 'auth/admin-restricted-operation']);

/* Chuỗi khớp mẫu tên lệnh (`a-b:c-d`) nhưng KHÔNG phải lệnh npm. Hôm nay chỉ
   có một: `about:srcdoc` là một lược đồ địa chỉ của trình duyệt, xuất hiện
   trong mục cảnh báo CSP. Cũng liệt kê từng chuỗi một như danh sách trên —
   bỏ qua theo mẫu là mở cửa cho tên lệnh viết sai lọt qua. */
const KHONG_PHAI_LENH = new Set(['about:srcdoc']);

function moiTep(thuMuc: string, ra: string[] = []): string[] {
  for (const t of readdirSync(thuMuc, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.specify'].includes(t.name)) continue;
    const p = join(thuMuc, t.name);
    if (t.isDirectory()) moiTep(p, ra); else ra.push(p);
  }
  return ra;
}
const TEN_TEP = new Set(moiTep(GOC).map(p => basename(p)));
const PKG = JSON.parse(readFileSync(join(GOC, 'package.json'), 'utf8'));
const GOI_KHAI = new Set(Object.keys({ ...PKG.dependencies, ...PKG.devDependencies }));

/* CLAUDE.md nay chỉ còn giữ quy tắc thường dùng; phần chi tiết tách sang
   `docs/claude-reference/`. Nếu danh sách này vẫn chỉ có hai tệp như trước thì
   90% tài liệu nằm NGOÀI tầm canh — mà lệch tài liệu chính là thứ bộ kiểm này
   sinh ra để bắt. Đọc thư mục thay vì liệt kê tay, để tệp mới thêm vào là được
   soi luôn, không phải nhớ sửa chỗ này. */
const THU_MUC_THAM_CHIEU = 'docs/claude-reference';
const TAI_LIEU = [
  'CLAUDE.md',
  /* Bản rút gọn cho trợ lý KHÔNG phải Claude Code (Antigravity, Cursor…). Nó
     nhắc đường dẫn và lệnh y như CLAUDE.md nên cũng lệch được y như vậy. */
  'AGENTS.md',
  '.specify/memory/constitution.md',
  ...(existsSync(join(GOC, THU_MUC_THAM_CHIEU))
    ? readdirSync(join(GOC, THU_MUC_THAM_CHIEU))
        .filter(t => t.endsWith('.md'))
        .sort()
        .map(t => `${THU_MUC_THAM_CHIEU}/${t}`)
    : []),
];

for (const tep of TAI_LIEU) {
  const duong = join(GOC, tep);
  if (!existsSync(duong)) { ok(false, `${tep} tồn tại`); continue; }
  const md = readFileSync(duong, 'utf8');
  console.log(`\n== ${tep} ==`);

  const nhac = [...new Set([...md.matchAll(/`([^`\n]+)`/g)].map(m => m[1])
    .filter(t => /^[\w./@-]+$/.test(t))
    .filter(t => t.includes('/') || /\.(tsx?|css|json|md|yml|html|mts|py)$/.test(t))
    .filter(t => !t.startsWith('npm ') && !CO_Y_VANG.has(t) && !KHONG_PHAI_DUONG_DAN.has(t))
    // Địa chỉ web, không phải đường dẫn tệp.
    .filter(t => !/^(https?:\/\/|[\w-]+\.(com|org|io|dev|net)\/)/.test(t))
    // Tên lệnh gạch chéo của trợ lý (/speckit-plan), cũng không phải đường dẫn.
    .filter(t => !/^\/[\w-]+$/.test(t)))];

  const thieu: string[] = [];
  for (const d of nhac) {
    const sach = d.replace(/^\.\//, '');
    /* Gói npm có phạm vi (@mui/material) thì tra trong package.json. Bản đầu tra
       node_modules/ ở gốc repo, nên worktree (node_modules nằm ở repo cha, Node
       tự tìm lên) và máy chưa `npm install` đều đỏ oan cả ba gói đang dùng thật.
       package.json mới là nơi quyết định dự án dùng gói nào — và chặt hơn: gói
       chỉ có mặt vì là phụ thuộc gián tiếp không còn được tính là "đã cài". */
    if (sach.startsWith('@')) {
      if (!GOI_KHAI.has(sach)) thieu.push(d);
      continue;
    }
    // Thử từ gốc repo, rồi từ src/, rồi tra theo tên tệp trong toàn cây.
    if (existsSync(join(GOC, sach)) || existsSync(join(GOC, 'src', sach))
        || TEN_TEP.has(basename(sach))) continue;
    thieu.push(d);
  }
  ok(thieu.length === 0, `${nhac.length} đường dẫn nhắc tới đều có thật`,
     thieu.length ? 'không tìm thấy: ' + thieu.join(', ') : '');

  /* Hai cách tài liệu gọi tên một lệnh, và PHẢI bắt cả hai.

     Bản đầu chỉ bắt dạng `npm run x`. Nhưng phần lớn tài liệu viết TRẦN —
     `kiem-tra:mau`, `xuat:ngan-hang` — để câu văn khỏi dài. Đo ngày 16/09/2026:
     18 tên lệnh viết trần đang nằm NGOÀI tầm canh, tức đổi tên một bộ kiểm
     trong `package.json` mà quên sửa tài liệu thì không gì kêu cả. Đúng loại
     lỗi mà chính bộ kiểm này sinh ra để bắt.

     Mẫu `^[a-z-]+:[a-z-]+$` cố ý hẹp: không nhận chữ số nên `sha256-…` không
     lọt, và đòi phần sau dấu hai chấm không có dấu gạch chéo nên `https://…`
     cũng không lọt. */
  const dangDayDu = [...md.matchAll(/`npm run ([\w:-]+)`/g)].map(m => m[1]);
  const dangTran = [...md.matchAll(/`([^`\n]+)`/g)].map(m => m[1])
    .filter(t => /^[a-z-]+:[a-z-]+$/.test(t) && !KHONG_PHAI_LENH.has(t));
  const lenh = [...new Set([...dangDayDu, ...dangTran])];

  const coLenh = Object.keys(
    JSON.parse(readFileSync(join(GOC, 'package.json'), 'utf8')).scripts as Record<string, string>);
  const lenhLa = lenh.filter(l => !coLenh.includes(l));
  ok(lenhLa.length === 0, `${lenh.length} lệnh npm nhắc tới đều có thật`,
     lenhLa.length ? 'không có: ' + lenhLa.map(l => 'npm run ' + l).join(', ') : '');
}

/* Vai trò người dùng: tài liệu từng ghi 'Teacher' | 'Student' trong khi mã có
   bốn vai chữ thường. Neo thẳng vào tệp kiểu để lần sau đổi là biết ngay. */
console.log('\n== Vai trò người dùng khớp giữa tài liệu và mã ==');
{
  const kieu = readFileSync(join(GOC, 'src/features/auth/types.ts'), 'utf8');
  const m = /export type UserRole\s*=\s*([^;]+);/.exec(kieu);
  const vai = m ? [...m[1].matchAll(/'([\w_]+)'/g)].map(x => x[1]) : [];
  const md = readFileSync(join(GOC, 'CLAUDE.md'), 'utf8');
  const thieu = vai.filter(v => !md.includes(`'${v}'`));
  ok(vai.length > 0, 'đọc được UserRole trong src/features/auth/types.ts', vai.join(' | '));
  ok(thieu.length === 0, 'CLAUDE.md nhắc đủ mọi vai trò',
     thieu.length ? 'thiếu: ' + thieu.join(', ') : '');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
