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
]);
/* Không phải đường dẫn: mẫu đặt tên, đường dẫn URL, đuôi tệp đứng một mình. */
const KHONG_PHAI_DUONG_DAN = new Set(['PascalCase.tsx', '.tsx', '.json', 'pages/', '/login', '/*']);

function moiTep(thuMuc: string, ra: string[] = []): string[] {
  for (const t of readdirSync(thuMuc, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', '.specify'].includes(t.name)) continue;
    const p = join(thuMuc, t.name);
    if (t.isDirectory()) moiTep(p, ra); else ra.push(p);
  }
  return ra;
}
const TEN_TEP = new Set(moiTep(GOC).map(p => basename(p)));

const TAI_LIEU = ['CLAUDE.md', '.specify/memory/constitution.md'];

for (const tep of TAI_LIEU) {
  const duong = join(GOC, tep);
  if (!existsSync(duong)) { ok(false, `${tep} tồn tại`); continue; }
  const md = readFileSync(duong, 'utf8');
  console.log(`\n== ${tep} ==`);

  const nhac = [...new Set([...md.matchAll(/`([^`\n]+)`/g)].map(m => m[1])
    .filter(t => /^[\w./@-]+$/.test(t))
    .filter(t => t.includes('/') || /\.(tsx?|css|json|md|yml|html|mts|py)$/.test(t))
    .filter(t => !t.startsWith('npm ') && !CO_Y_VANG.has(t) && !KHONG_PHAI_DUONG_DAN.has(t)))];

  const thieu: string[] = [];
  for (const d of nhac) {
    const sach = d.replace(/^\.\//, '');
    // Gói npm có phạm vi (@mui/material) thì tra trong node_modules.
    if (sach.startsWith('@')) {
      if (!existsSync(join(GOC, 'node_modules', sach))) thieu.push(d);
      continue;
    }
    // Thử từ gốc repo, rồi từ src/, rồi tra theo tên tệp trong toàn cây.
    if (existsSync(join(GOC, sach)) || existsSync(join(GOC, 'src', sach))
        || TEN_TEP.has(basename(sach))) continue;
    thieu.push(d);
  }
  ok(thieu.length === 0, `${nhac.length} đường dẫn nhắc tới đều có thật`,
     thieu.length ? 'không tìm thấy: ' + thieu.join(', ') : '');

  const lenh = [...new Set([...md.matchAll(/`npm run ([\w:-]+)`/g)].map(m => m[1]))];
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
