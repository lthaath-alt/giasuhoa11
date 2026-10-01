/**
 * Canh chừng những thứ của Google mà `npm run soat:hoa-hoc` đang dựa vào.
 *
 * Chạy:  npm run kiem-tra:gemini
 * Cần mạng cho ĐÚNG MỘT phép; mất mạng thì phép đó tự bỏ qua.
 *
 * ─── Vì sao cần ─────────────────────────────────────────────────────────────
 * Ngày 20/09/2026, trong một buổi, Google đã làm hỏng giả định của dự án này
 * hai lần mà không có gì báo:
 *
 *   - Đường "đăng nhập bằng tài khoản Google" của Gemini CLI đã bị chấm dứt từ
 *     18/06/2026, nhưng chuỗi `LOGIN_WITH_GOOGLE` VẪN còn trong gói cài. Đọc mã
 *     thì tưởng dùng được; chỉ máy chủ mới biết là không.
 *   - Khoá `selectedType` nằm ở `security.auth.selectedType`, không phải
 *     `auth.selectedType`. Đọc hụt thì hàm dò trả 'khong-ro', mà 'khong-ro'
 *     từng bị hiểu là "đang dùng tài khoản trả phí" — tức hàng rào hạn mức TỰ
 *     TẮT. Một hàng rào tự tắt còn tệ hơn không có hàng rào.
 *
 * Cả hai đều là loại lỗi KHÔNG làm hỏng build, không làm đỏ `tsc`, và chỉ lộ ra
 * khi đã tốn hạn mức hoặc đã làm sai. Bộ kiểm này biến chúng thành thứ kêu được.
 *
 * Nó KHÔNG kiểm chất lượng câu trả lời của Gemini — đó là việc của người, ở
 * bước 2 của quy trình soát (xem CLAUDE.md).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GEMINI_MODEL_NAME } from '../src/core/constants';
import { GEMINI_XOAY } from '../src/features/tutor/services/danhSachMoHinh';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);
};
const tin = (ten: string, chiTiet = '') =>
  console.log(`  TIN  ${ten}${chiTiet ? '\n       ' + chiTiet : ''}`);

// ── 1. CLI còn đó và gọi được ──────────────────────────────────────────────
console.log('\n== Gemini CLI còn gọi được ==');

const chay = (args: string[], giay = 60) =>
  spawnSync('gemini', args, { encoding: 'utf8', shell: true, timeout: giay * 1000 });

const ban = chay(['--version'], 30);
const coCli = ban.status === 0 && /\d+\.\d+/.test(ban.stdout || '');

/* KHÔNG có CLI thì BỎ QUA phần CLI, đừng báo hỏng. Bộ này nằm trong chuỗi
   `npm run kiem-tra`, mà chuỗi đó phải chạy được trên MỌI máy và trên CI —
   nơi không ai cài Gemini CLI. Cùng lối với `kiem-tra:luat` khi thiếu Java.
   Các phép về `.env` bên dưới vẫn chạy, vì chúng thuộc về repo chứ không
   thuộc về máy. */
if (coCli) {
  ok(true, 'gọi được lệnh `gemini`', `bản ${(ban.stdout || '').trim()}`);
} else {
  console.log('  BỎ QUA  máy này không có Gemini CLI — phần CLI không kiểm được');
  console.log('          (`soat:hoa-hoc` vẫn chạy được bằng `--qua key`)');
}

const trogiup = coCli ? (chay(['--help'], 60).stdout || '') : '';

// ── 2. Bốn cờ mà soat-hoa-hoc.mts dựa vào ──────────────────────────────────
console.log('\n== Các cờ dòng lệnh vẫn còn ==');

if (!coCli) {
  console.log('  BỎ QUA  không có CLI để hỏi');
} else {
  for (const [co, viSao] of [
    ['--approval-mode', 'thiếu nó thì mất chế độ chỉ đọc — Gemini CLI sửa được tệp'],
    ['--prompt', 'đường đưa câu lệnh vào'],
    ['--model', 'chọn model'],
  ] as [string, string][]) {
    ok(trogiup.includes(co), `còn cờ \`${co}\``, trogiup.includes(co) ? '' : viSao);
  }
  ok(/approval-mode[\s\S]{0,400}?plan/.test(trogiup), 'còn chế độ `plan` (chỉ đọc)',
     'mất nó là con lính được quyền ghi tệp — phải đổi cách gọi ngay');
  ok(/Appended to input on stdin/i.test(trogiup), '`-p` vẫn được nối vào stdin',
     'nếu mất: soat-hoa-hoc.mts phải đổi cách truyền dữ liệu, xem hàm goiQuaCli');
}

// ── 3. Chỗ Google cất kiểu xác thực ────────────────────────────────────────
console.log('\n== Kiểu xác thực đọc được ==');

const tepCaiDat = join(homedir(), '.gemini', 'settings.json');
let kieu = 'khong-ro';
if (coCli && existsSync(tepCaiDat)) {
  const tim = (o: unknown): string | null => {
    if (!o || typeof o !== 'object') return null;
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (k === 'selectedType' && typeof v === 'string') return v;
      const sau = tim(v);
      if (sau) return sau;
    }
    return null;
  };
  try { kieu = tim(JSON.parse(readFileSync(tepCaiDat, 'utf8'))) ?? 'khong-ro'; } catch { /* để nguyên */ }
}
if (!coCli) console.log('  BỎ QUA  không có CLI nên không có cấu hình để đọc');
else ok(kieu !== 'khong-ro', 'tìm thấy `selectedType` trong ~/.gemini/settings.json',
   kieu !== 'khong-ro' ? `đang là: ${kieu}` :
   'Google đổi chỗ cất rồi. Hàm kieuXacThuc() trong soat-hoa-hoc.mts sẽ trả '
   + "'khong-ro', và nó CỐ Ý hiểu 'khong-ro' là đang ăn bậc miễn phí — nên hàng "
   + 'rào vẫn đứng, nhưng phải sửa lại hàm dò.');

/* `oauth-personal` là TRẠNG THÁI HỎNG, không phải tin vui. Đăng nhập bằng tài
   khoản Google vẫn lọt, nhưng mọi lượt gọi bị chặn bằng `IneligibleTierError:
   This client is no longer supported for Gemini Code Assist for individuals`.
   Đo thật 20/09/2026 sau khi chủ dự án thử đăng nhập. */
if (coCli) ok(kieu !== 'oauth-personal', 'CLI không ở trạng thái oauth-personal (đường đã chết)',
   kieu === 'oauth-personal'
     ? 'Google ngừng phục vụ tài khoản cá nhân qua CLI từ 18/06/2026. Chạy `gemini`, '
       + 'gõ /auth, chọn "Use Gemini API key" để đường CLI sống lại. '
       + '(`soat:hoa-hoc` tự lùi về khoá API nên vẫn chạy được, chỉ chậm hơn.)'
     : '');

if (kieu !== 'gemini-api-key' && kieu !== 'khong-ro' && kieu !== 'oauth-personal') {
  tin(`kiểu xác thực lạ: "${kieu}"`,
      'Chưa gặp bao giờ. Đo lại hạn mức thật rồi cập nhật LUOT_MOI_NGAY trong soat-hoa-hoc.mts.');
}

// ── 4. Cái bẫy `.env` giữ chỗ ──────────────────────────────────────────────
console.log('\n== Bẫy khoá giữ chỗ trong .env ==');

const docDong = (tep: string) => {
  try { return readFileSync(join(GOC, tep), 'utf8'); } catch { return ''; }
};
const envGoc = docDong('.env');
const coGiuCho = /^\s*GEMINI_API_KEY\s*=/m.test(envGoc);
ok(!coGiuCho, '`.env` KHÔNG khai GEMINI_API_KEY',
   coGiuCho ? 'Gemini CLI đọc `.env`, nên một chuỗi giữ chỗ ở đây sẽ được gửi cho Google '
     + 'và lệnh `gemini` báo "API key not valid" — thông báo dẫn sai hướng hoàn toàn. '
     + 'Khoá thật để ở `.env.local`.' : '');

/* Thiếu `.env.local` thì BỎ QUA, không báo hỏng: máy vừa clone về và CI đều
   không có tệp đó, mà chúng vẫn phải chạy được cả chuỗi `npm run kiem-tra`. */
const coKeyThat = /^\s*GEMINI_API_KEY\s*=\s*\S/m.test(docDong('.env.local'));
if (!coKeyThat) console.log('  BỎ QUA  máy này chưa có GEMINI_API_KEY trong .env.local');
else ok(true, '`.env.local` có khai GEMINI_API_KEY');

// ── 5. Model của web còn tồn tại (cần mạng) ────────────────────────────────
console.log('\n== Model còn tồn tại ==');

const key = (docDong('.env.local').match(/^\s*GEMINI_API_KEY\s*=\s*(.*)$/m)?.[1] ?? '')
  .trim().replace(/^["']|["']$/g, '');

if (!key) {
  console.log('  BỎ QUA  không có khoá trong .env.local, không hỏi được danh sách model');
} else {
  try {
    /* ListModels KHÔNG tiêu hạn mức sinh nội dung — hỏi được mỗi ngày mà không
       tốn lượt nào trong số 20 lượt/ngày. */
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
      { signal: AbortSignal.timeout(25_000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json() as { models?: { name?: string }[] };
    const ten = (j.models ?? []).map(m => (m.name ?? '').replace(/^models\//, ''));
    const co = ten.includes(GEMINI_MODEL_NAME);
    ok(co, `model \`${GEMINI_MODEL_NAME}\` còn được cấp`,
       co ? `Google đang cấp ${ten.length} model` :
       `Google KHÔNG còn cấp model này. Web gọi nó qua Firebase AI Logic, nên gia sư `
       + `sẽ chết. Đổi GEMINI_MODEL_NAME trong src/core/constants.ts.`);

    /* Model xoay vòng bị Google gỡ thì gia sư không chết (chuỗi đánh dấu nó
       hỏng rồi đi tiếp), nhưng mỗi ngày phí một lượt gõ cửa và mất một tầng
       dự phòng mà không ai biết. */
    for (const m of GEMINI_XOAY) {
      ok(ten.includes(m), `model xoay vòng \`${m}\` còn được cấp`,
         ten.includes(m) ? '' : 'Gỡ tên này khỏi GEMINI_XOAY trong src/features/tutor/services/danhSachMoHinh.ts.');
    }
  } catch (e) {
    console.log(`  BỎ QUA  không hỏi được danh sách model: ${(e as Error).message}`);
  }
}

// ── 6. Antigravity: chỉ để BIẾT, cố ý không phụ thuộc ──────────────────────
console.log('\n== Antigravity (chỉ ghi nhận, không tính là hỏng) ==');

const mayChu = join(homedir(), 'AppData', 'Local', 'Programs', 'antigravity',
  'resources', 'bin', 'language_server.exe');
if (!existsSync(mayChu)) {
  tin('không thấy Antigravity trên máy này', 'quy trình soát vẫn chạy được, chỉ mất đường dây dẫn tay');
} else {
  const tg = spawnSync(mayChu, ['agentapi', '--help'], { encoding: 'utf8', timeout: 60_000 });
  const chu = (tg.stdout || '') + (tg.stderr || '');
  tin(chu.includes('new-conversation')
    ? 'agentapi vẫn có `new-conversation`'
    : 'agentapi ĐÃ ĐỔI — không còn `new-conversation`',
    'Đây là API nội bộ không tài liệu. Dự án CỐ Ý không xây quy trình lên nó; '
    + 'dòng này chỉ để biết Google có động vào hay không.');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');

/* ĐẶT MÃ THOÁT, ĐỪNG GỌI `process.exit()` — bộ này có một lượt `fetch`.
 *
 * Đo ngày 21/09/2026 trên Windows, Node v24.18.0: gọi `process.exit()` ngay sau
 * lượt hỏi danh sách model làm Node chết lúc dọn dẹp, in
 * `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c`
 * rồi thoát với mã 127. Bộ kiểm vẫn in "TẤT CẢ ĐẠT" trước khi chết, nên nhìn
 * bảng kết quả thì tưởng đạt — mà mã 127 làm chuỗi `npm run kiem-tra` DỪNG
 * ngay đó, `kiem-tra:luat` không bao giờ chạy tới.
 *
 * Nguyên nhân: `fetch` (undici) còn giữ một socket keep-alive đang đóng dở;
 * `process.exit()` giật nền ra khỏi nó giữa chừng. Lặp lại 3/3 lần với đúng
 * lượt fetch này, và biến mất khi cắt lượt fetch đi.
 *
 * Đặt `process.exitCode` thì Node tự đóng nốt rồi thoát — đo lại: sạch, hết
 * 2,6 giây. Các bộ kiểm khác gọi `process.exit()` vẫn không sao vì chúng không
 * gọi mạng; nhưng bộ nào thêm `fetch` thì phải theo lối này. */
process.exitCode = hong === 0 ? 0 : 1;
