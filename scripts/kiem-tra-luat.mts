/**
 * Kiểm luật Firestore bằng emulator.
 *
 * Chạy:  npm run kiem-tra:luat   (và chạy trong `npm run kiem-tra`)
 *
 * VÌ SAO CÓ TỆP NÀY. Trước đây luật chỉ kiểm được bằng Rules Playground, bấm
 * tay từng phép trên Console. Ngày 13/09/2026 mất nửa buổi vì ô Build document
 * ghi tên trường là `role ` — thừa một dấu cách, thành một trường khác, nên
 * phép thử ra ALLOWED trong khi luật hoàn toàn đúng. Máy không gõ nhầm dấu
 * cách. Và Playground KHÔNG mô phỏng được `list`, nên hai đường quan trọng
 * nhất của khối `users` chưa từng được đo lần nào.
 *
 * THIẾU JAVA 11+ THÌ BỎ QUA, không báo hỏng. Máy chủ dự án chỉ có Java 8 và
 * không cài được bản mới; phép này chạy thật trên GitHub Actions.
 *
 * Script tự gọi lại chính mình: lần đầu chạy ngoài emulator thì kiểm điều kiện
 * rồi spawn `firebase emulators:exec`, lần sau (có cờ H11_TRONG_EMULATOR) thì
 * chạy các phép.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const DU_AN = 'demo-giasuhoa11';   // tiền tố `demo-` = không bao giờ chạm hạ tầng thật
const CONG = 8080;

/** Đọc số hiệu chính của Java. `1.8.0_502` -> 8; `21.0.12` -> 21. Không gọi
 *  được `java` thì trả 0. */
function soHieuJava(): number {
  const r = spawnSync('java', ['-version'], { encoding: 'utf8' });
  if (r.error) return 0;
  const chu = `${r.stderr || ''}${r.stdout || ''}`;
  const m = chu.match(/version "(\d+)(?:\.(\d+))?/);
  if (!m) return 0;
  return m[1] === '1' ? Number(m[2] ?? 0) : Number(m[1]);
}

/** Gọi được `firebase` không. Dùng bản trong node_modules, không phụ thuộc máy. */
function coFirebase(): boolean {
  const r = spawnSync('npx', ['--no-install', 'firebase', '--version'], {
    encoding: 'utf8', shell: process.platform === 'win32',
  });
  return !r.error && r.status === 0;
}

async function main() {
  console.log('== Luật Firestore ==');

  if (process.env.H11_TRONG_EMULATOR !== '1') {
    const java = soHieuJava();
    if (java < 11) {
      console.log(`  BỎ QUA  emulator cần Java 11+, máy này có ${java || 'không có Java'}`);
      console.log('          (phép này chạy thật trên GitHub Actions)');
      process.exit(0);
    }
    if (!coFirebase()) {
      console.log('  BỎ QUA  chưa cài firebase-tools — chạy `npm ci` rồi thử lại');
      process.exit(0);
    }

    const con = spawnSync('npx', [
      'firebase', 'emulators:exec', '--only', 'firestore', '--project', DU_AN,
      'npx tsx scripts/kiem-tra-luat.mts',
    ], {
      cwd: GOC,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, H11_TRONG_EMULATOR: '1' },
    });
    process.exit(con.status ?? 1);
  }

  const hong = await chayCacPhep();

  if (hong === 0) { console.log('\n>>> TẤT CẢ ĐẠT'); process.exit(0); }
  console.log(`\n>>> CÓ ${hong} MỤC KHÔNG ĐẠT`);
  process.exit(1);
}

/** Việc 2 viết thân hàm này. Trả về số phép hỏng. */
async function chayCacPhep(): Promise<number> {
  console.log('  (chưa có phép nào — xem Việc 2 của kế hoạch)');
  return 0;
}

export const docLuat = () => readFileSync(join(GOC, 'firestore.rules'), 'utf8');
export const CAU_HINH = { DU_AN, CONG };

main();
