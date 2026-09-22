/**
 * P0-1 — đo xem `gemini-3.6-flash` có THẬT SỰ nhận temperature/topP không.
 *
 * Chạy:  npx tsx scripts/do-tham-so-sinh.mts
 *
 * Vì sao phải đo thay vì đọc tài liệu: tài liệu Google Cloud nói model này không
 * nhận giá trị tuỳ chỉnh cho temperature/top-K/top-P, trong khi mã của web đang
 * gửi `temperature: 0,3` và `topP: 0,85` ở cả ba đường gọi. Hai khả năng dẫn tới
 * hai kết luận trái ngược cho báo cáo NCKH: hoặc số liệu của đề tài được sinh ở
 * nhiệt độ 0,3 thật, hoặc nó được sinh ở mặc định của model và câu "chúng tôi hạ
 * nhiệt độ xuống 0,3 cho ổn định" trong slide là sai. Bài học số 9 của CLAUDE.md:
 * cái gì hỏi được máy chủ thì đừng suy ra từ mã nguồn.
 *
 * Ba phép, tổng 8 lượt gọi (hạn mức bậc miễn phí là 20 lượt/ngày/model):
 *   A. gửi temperature ngoài miền cho phép  → 400 nghĩa là tham số CÓ được đọc;
 *   B. ba lượt ở temperature 0 và ba lượt ở temperature 2, cùng một câu hỏi
 *      → sáu câu trả lời giống hệt nhau nghĩa là tham số bị BỎ QUA;
 *   C. đọc siêu dữ liệu model, xem có khai temperature/topP mặc định không.
 *
 * Phép B cần một câu hỏi mà mô hình có NHIỀU cách diễn đạt đúng — hỏi "kể tên ba
 * yếu tố" thì nhiệt độ nào cũng ra ba yếu tố ấy, và ta sẽ kết luận nhầm là tham
 * số bị bỏ qua. Vì vậy câu hỏi dưới đây yêu cầu mở đầu bằng một câu dẫn tự do.
 *
 * KHÔNG ghi gì lên Firestore. Dữ liệu thô ghi ra `docs/P0-1-do-tho.json`.
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GEMINI_MODEL_NAME } from '../src/core/constants';

const GOC = fileURLToPath(new URL('..', import.meta.url));

/* Đọc thẳng `.env.local` như `do-chi-phi.mts`, KHÔNG dùng `dotenv/config`:
   gói đó chỉ nạp `.env`, mà ở dự án này `.env` cố ý không mang khoá thật. */
let KEY = '';
try {
  KEY = (readFileSync(join(GOC, '.env.local'), 'utf8')
    .match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
} catch { /* báo ở dưới */ }
if (!KEY) {
  console.error('Không tìm thấy GEMINI_API_KEY trong .env.local');
  process.exit(1);
}
const NEN = 'https://generativelanguage.googleapis.com/v1beta/models';
const URL_SINH = `${NEN}/${GEMINI_MODEL_NAME}:generateContent`;

/* Câu hỏi cố ý có phần tự do (một câu dẫn) để nhiệt độ có chỗ thể hiện, nhưng
   vẫn nằm trong Hoá 11 để nếu cần thì đưa luôn vào phụ lục báo cáo. */
const CAU_HOI =
  'Viết một câu dẫn ngắn cho học sinh lớp 11 về chuyển dịch cân bằng hoá học, ' +
  'rồi liệt kê ba yếu tố làm cân bằng chuyển dịch, mỗi yếu tố một dòng.';

interface KetQua {
  ten: string;
  config: Record<string, unknown> | null;
  httpStatus: number;
  than: string;
}

const ketQua: KetQua[] = [];

async function goi(ten: string, generationConfig: Record<string, unknown>): Promise<void> {
  const r = await fetch(`${URL_SINH}?key=${KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: CAU_HOI }] }],
      generationConfig,
    }),
  });
  const than = await r.text();
  ketQua.push({ ten, config: generationConfig, httpStatus: r.status, than });
  console.log(`\n--- ${ten} --- HTTP ${r.status}`);
  console.log('   config gửi đi: ' + JSON.stringify(generationConfig));
  console.log('   thân trả về (600 ký tự đầu):');
  console.log('   ' + than.slice(0, 600).replace(/\n/g, '\n   '));
}

function chuVanBan(than: string): string {
  try {
    const j = JSON.parse(than);
    const parts = j?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p: { text?: string }) => p.text ?? '').join('').trim();
  } catch {
    return '';
  }
}

async function main(): Promise<void> {
  console.log(`\nP0-1 — đo tham số sinh trên model: ${GEMINI_MODEL_NAME}`);
  console.log('Tổng 8 lượt gọi (hạn mức miễn phí 20 lượt/ngày).');

  // ── Phép A: giá trị ngoài miền cho phép ─────────────────────────────────
  await goi('A. temperature=99 (ngoài miền 0–2)', { temperature: 99 });

  // ── Phép B: hai cực, mỗi cực ba lượt ────────────────────────────────────
  for (let i = 1; i <= 3; i++) {
    await goi(`B1.${i} temperature=0, topP=0.1`, { temperature: 0, topP: 0.1 });
  }
  for (let i = 1; i <= 3; i++) {
    await goi(`B2.${i} temperature=2, topP=1`, { temperature: 2, topP: 1 });
  }

  // ── Phép C: siêu dữ liệu model ──────────────────────────────────────────
  const rc = await fetch(`${NEN}/${GEMINI_MODEL_NAME}?key=${KEY}`);
  const meta = await rc.text();
  ketQua.push({ ten: 'C. GET model metadata', config: null, httpStatus: rc.status, than: meta });
  console.log(`\n--- C. siêu dữ liệu model --- HTTP ${rc.status}`);
  console.log('   ' + meta.slice(0, 700).replace(/\n/g, '\n   '));

  // ── Tổng hợp ────────────────────────────────────────────────────────────
  const lanh = ketQua.filter(k => k.ten.startsWith('B1')).map(k => chuVanBan(k.than));
  const nong = ketQua.filter(k => k.ten.startsWith('B2')).map(k => chuVanBan(k.than));
  const tatCa = [...lanh, ...nong].filter(s => s.length > 0);
  const soKhacNhau = new Set(tatCa).size;

  console.log('\n══ TỔNG HỢP ══');
  console.log(`Phép A: HTTP ${ketQua[0].httpStatus}` +
    (ketQua[0].httpStatus === 400
      ? '  → tham số ĐƯỢC đọc và kiểm tra miền giá trị'
      : '  → giá trị ngoài miền vẫn qua; xem thân trả về để biết có bị bỏ qua không'));
  console.log(`Phép B: ${soKhacNhau}/${tatCa.length} câu trả lời khác nhau` +
    (soKhacNhau <= 1
      ? '  → mọi lượt giống hệt nhau, tham số nhiều khả năng BỊ BỎ QUA'
      : '  → đầu ra có khác nhau giữa các lượt'));
  console.log(`   (trong đó nhóm lạnh khác nhau: ${new Set(lanh).size}/${lanh.length}` +
    `, nhóm nóng khác nhau: ${new Set(nong).size}/${nong.length})`);
  console.log('Phép C: xem docs/P0-1-do-tho.json, trường temperature/topP trong metadata.');

  mkdirSync(join(GOC, 'docs'), { recursive: true });
  const ra = join(GOC, 'docs', 'P0-1-do-tho.json');
  writeFileSync(ra, JSON.stringify({ model: GEMINI_MODEL_NAME, doLuc: new Date().toISOString(), cauHoi: CAU_HOI, ketQua }, null, 1), 'utf8');
  console.log(`\nDữ liệu thô: docs/P0-1-do-tho.json`);
}

main().catch(e => { console.error(e); process.exit(1); });
