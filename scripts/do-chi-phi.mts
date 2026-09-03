/**
 * Đo lượng token thực tế hệ thống gửi đi, để dự trù kinh phí API.
 *
 * Chạy:  npm run do-chi-phi
 *
 * Dùng endpoint countTokens của Google — endpoint này ĐẾM chứ không sinh nội
 * dung, có hạn mức riêng và không tiêu lượt gọi generateContent. Nhờ vậy đo
 * được bao nhiêu lần cũng không ảnh hưởng hạn mức 20 lượt/ngày.
 *
 * Vì sao phải đo chứ không ước lượng: cách nhẩm "chia số ký tự cho 3" sai khá
 * xa với tiếng Việt có dấu, vì bộ tách từ của model cắt dấu thanh thành token
 * riêng. Sai số dồn lại trên hàng nghìn lượt gọi thành sai số kinh phí.
 *
 * Điểm dễ bỏ sót khi dự trù: LỊCH SỬ HỘI THOẠI ĐƯỢC GỬI LẠI MỖI LƯỢT. Một cuộc
 * trò chuyện 10 lượt KHÔNG tốn bằng 10 lần lượt đầu — nó tốn theo cấp số cộng,
 * vì lượt thứ n mang theo cả n−1 lượt trước. Script này tính đúng phần đó.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { dungPrompt } from '../src/features/tutor/services/promptSuPham';
import { buildLessonCatalog, buildLessonContext, buildProgramContext } from '../src/features/tutor/services/lessonContext';
import { GEMINI_MODEL_NAME } from '../src/core/constants';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');

let key = '';
try {
  key = (readFileSync(join(GOC, '.env.local'), 'utf8')
    .match(/^GEMINI_API_KEY=(.*)$/m)?.[1] ?? '').trim().replace(/^["']|["']$/g, '');
} catch { /* báo ở dưới */ }
if (!key) {
  console.error('Không tìm thấy GEMINI_API_KEY trong .env.local');
  process.exit(1);
}

const MODEL = process.argv[2] || GEMINI_MODEL_NAME;

/** Đếm token bằng API thật. Không in key ra màn hình. */
async function dem(text: string): Promise<number> {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:countTokens`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] }),
    },
  );
  if (!r.ok) throw new Error(`countTokens lỗi ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return (await r.json()).totalTokens as number;
}

const so = (n: number) => n.toLocaleString('vi-VN');

console.log(`\n══ ĐO LƯỢNG TOKEN — model ${MODEL} ══\n`);

// ── Các khối ngữ cảnh ───────────────────────────────────────────────────────
const khoi: Record<string, string> = {
  'Câu lệnh hệ thống (nhánh socratic)': dungPrompt('socratic'),
  'Câu lệnh hệ thống (nhánh đối chứng)': dungPrompt('truc-tiep'),
  'Danh mục 25 bài (luôn gửi)': buildLessonCatalog(),
  'Toàn văn một bài (bài 10 — dài nhất)': buildLessonContext('bai-10'),
  'Dàn bài cả chương trình (khung iChat)': buildProgramContext(),
};

const token: Record<string, number> = {};
console.log('Khối ngữ cảnh                              ký tự      token   tỉ lệ');
console.log('─'.repeat(70));
for (const [ten, noi] of Object.entries(khoi)) {
  token[ten] = await dem(noi);
  console.log(`${ten.padEnd(40)} ${String(so(noi.length)).padStart(8)}  ${String(so(token[ten])).padStart(8)}   ${(noi.length / token[ten]).toFixed(2)}`);
}

console.log('\n(Cột cuối là số ký tự trên mỗi token. Cách nhẩm "chia 3" quen dùng');
console.log(' cho tiếng Anh KHÔNG áp dụng được ở đây.)');

// ── Ngữ cảnh mỗi lượt hỏi, theo hai tình huống ─────────────────────────────
const KHI_MO_BAI = token['Câu lệnh hệ thống (nhánh socratic)']
  + token['Danh mục 25 bài (luôn gửi)']
  + token['Toàn văn một bài (bài 10 — dài nhất)'];

const KHI_ICHAT = token['Câu lệnh hệ thống (nhánh socratic)']
  + token['Danh mục 25 bài (luôn gửi)']
  + token['Dàn bài cả chương trình (khung iChat)'];

console.log('\n── Ngữ cảnh CỐ ĐỊNH mỗi lượt hỏi ──');
console.log(`  Khi học sinh đang mở một bài : ${so(KHI_MO_BAI)} token`);
console.log(`  Khi hỏi ở khung iChat chung  : ${so(KHI_ICHAT)} token`);

// ── Một cuộc trò chuyện tốn bao nhiêu ──────────────────────────────────────
/* Lịch sử được gửi lại mỗi lượt, nên tổng token của một cuộc n lượt là
   n × ngữ_cảnh_cố_định + phần lịch sử cộng dồn. Ước lượng mỗi lượt hỏi của
   học sinh ~40 token, mỗi lượt trả lời của gia sư ~300 token (đã giới hạn
   3–6 câu trong câu lệnh hệ thống). */
const HOI = 40, TRA = 300;

function mocCuoc(soLuot: number, coDinh: number) {
  let vao = 0;
  for (let n = 1; n <= soLuot; n++) {
    const lichSu = (n - 1) * (HOI + TRA);
    vao += coDinh + lichSu + HOI;
  }
  return { vao, ra: soLuot * TRA };
}

console.log('\n── Một cuộc trò chuyện tốn bao nhiêu (khung iChat) ──');
console.log('số lượt      token vào      token ra    ghi chú');
console.log('─'.repeat(64));
for (const n of [1, 5, 10, 20]) {
  const c = mocCuoc(n, KHI_ICHAT);
  const so1 = mocCuoc(1, KHI_ICHAT).vao;
  console.log(`${String(n).padStart(5)}    ${String(so(c.vao)).padStart(11)}   ${String(so(c.ra)).padStart(9)}    `
    + (n === 1 ? '' : `gấp ${(c.vao / (so1 * n)).toFixed(2)}× so với ${n} lượt rời rạc`));
}

// ── Dự trù cho đợt thực nghiệm ─────────────────────────────────────────────
console.log('\n── Dự trù cho đợt thực nghiệm 2 tuần ──');
console.log('Giả định: mỗi học sinh có vài cuộc trò chuyện, trung bình 6 lượt/cuộc.\n');
console.log('số HS   lượt/HS   tổng lượt      token VÀO       token RA');
console.log('─'.repeat(64));

const ketQua: { hs: number; luot: number; vao: number; ra: number }[] = [];
for (const hs of [100, 200, 300]) {
  for (const luotMoiHs of [10, 25, 50]) {
    const soCuoc = luotMoiHs / 6;
    const c = mocCuoc(6, KHI_ICHAT);
    const vao = Math.round(hs * soCuoc * c.vao);
    const ra = Math.round(hs * soCuoc * c.ra);
    ketQua.push({ hs, luot: hs * luotMoiHs, vao, ra });
    console.log(`${String(hs).padStart(5)}   ${String(luotMoiHs).padStart(7)}   ${String(so(hs * luotMoiHs)).padStart(9)}   ${String(so(vao)).padStart(12)}   ${String(so(ra)).padStart(12)}`);
  }
}

console.log('\n── Quy ra tiền ──');
console.log('KHÔNG ghi cứng đơn giá vào đây: giá dịch vụ thay đổi theo thời gian và');
console.log('theo model. Tra đơn giá hiện hành tại trang giá của Google rồi nhân vào');
console.log('cột token ở trên. Công thức:\n');
console.log('   chi phí = (token VÀO ÷ 1.000.000) × giá_vào');
console.log('           + (token RA  ÷ 1.000.000) × giá_ra\n');
console.log('Bảng dưới quy đổi sẵn theo vài mức đơn giá để thấy độ nhạy — CHƯA phải');
console.log('giá thật, chỉ để biết bậc độ lớn:\n');

const truHop = ketQua.find(k => k.hs === 200 && k.luot === 200 * 25)!;
console.log(`Lấy trường hợp 200 học sinh × 25 lượt = ${so(truHop.luot)} lượt gọi:`);
console.log(`  token vào ${so(truHop.vao)} · token ra ${so(truHop.ra)}\n`);
console.log('giá vào   giá ra    →  thành tiền (USD)');
console.log('─'.repeat(44));
for (const [gv, gr] of [[0.075, 0.30], [0.15, 0.60], [0.30, 1.20]] as const) {
  const tien = (truHop.vao / 1e6) * gv + (truHop.ra / 1e6) * gr;
  console.log(`$${gv.toFixed(3)}/M  $${gr.toFixed(2)}/M   →  $${tien.toFixed(2)}`);
}

console.log('\n── Cách giảm chi phí ──');
console.log('Model này hỗ trợ createCachedContent (bộ nhớ đệm ngữ cảnh). Câu lệnh hệ');
console.log(`thống và danh mục bài là phần CỐ ĐỊNH ~${so(token['Câu lệnh hệ thống (nhánh socratic)'] + token['Danh mục 25 bài (luôn gửi)'])} token, lặp lại y hệt ở mọi`);
console.log('lượt gọi của mọi học sinh. Đưa phần đó vào bộ đệm thì chỉ trả tiền một');
console.log('lần thay vì trả lại mỗi lượt. Đây là khoản tiết kiệm lớn nhất và nên làm');
console.log('trước khi triển khai cho cả khối.\n');
