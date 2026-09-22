/**
 * Chụp ảnh minh chứng MÀN GIÁO VIÊN cho báo cáo NCKH (Phụ lục 4).
 *
 * Chạy:  node scripts/chup-man-giao-vien.mjs
 *
 * Tài khoản lấy từ GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong `.env.local` —
 * script đọc, không ai phải nhìn thấy mật khẩu, và nó KHÔNG đi qua tham số
 * dòng lệnh.
 *
 * ─── Vì sao màn này chụp được mà màn GIA SƯ AI thì không ──────────────────
 * App Check chỉ bật cho Firebase AI Logic. Trang theo dõi chỉ đọc Cloud
 * Firestore, nên reCAPTCHA Enterprise không xen vào và trình duyệt tự động
 * vẫn vào được. Ngược lại, mọi lượt gọi gia sư AI từ Playwright đều bị chặn
 * bằng 403 "App attestation failed" — xem mục kiểm thử đầu-cuối trong
 * CLAUDE.md. Đừng mất công thử lại.
 *
 * Ảnh CHE thông tin cá nhân trước khi chụp: danh sách lớp có email và tên thật
 * của học sinh, mà ảnh này sẽ nằm trong một thư mục chia sẻ công khai.
 */
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const RA = join(GOC, 'docs/anh-minh-chung');
const DICH = process.env.E2E_URL || 'https://giasuhoa11.pages.dev';

const env = {};
for (const ten of ['.env', '.env.local']) {
  try {
    for (const d of readFileSync(join(GOC, ten), 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(d);
      if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch { /* không có tệp thì thôi */ }
}
if (!env.GIAO_VIEN_EMAIL || !env.GIAO_VIEN_MATKHAU) {
  console.error('Thiếu GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local — xem .env.example');
  process.exit(1);
}

mkdirSync(RA, { recursive: true });

const trinhDuyet = await chromium.launch({ channel: 'chrome' });
const trang = await trinhDuyet.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });

console.log(`Mở ${DICH} …`);
await trang.goto(DICH, { waitUntil: 'domcontentloaded' });

await trang.locator('#role-option-teacher').click();
await trang.locator('#login-email-field').fill(env.GIAO_VIEN_EMAIL);
await trang.locator('#login-password-field').fill(env.GIAO_VIEN_MATKHAU);
await trang.getByRole('button', { name: /Đăng nhập \(Giáo viên/ }).click();

/* Đăng nhập xong web dừng ở màn "Chào mừng trở lại" chứ không tự vào trong —
   chủ ý, xem chú thích trong tests/chung.ts. */
const tiepTuc = trang.locator('#continue-session-btn');
await tiepTuc.waitFor({ state: 'visible', timeout: 45_000 }).catch(() => {});
if (await tiepTuc.isVisible()) await tiepTuc.click();

await trang.waitForTimeout(6000);
console.log('Đã vào trong app. Đang tìm khu giáo viên …');

/**
 * CHE dữ liệu cá nhân TRƯỚC KHI chụp.
 *
 * Lần chạy đầu (21/09/2026) làm mờ theo `[data-che]` — một selector app KHÔNG
 * hề dùng — nên ảnh ra vẫn in rõ HỌ TÊN THẬT của cả 28 em lớp 11A3, và suýt
 * nữa được tải lên một thư mục Drive chia sẻ công khai. Nay che theo CẤU TRÚC
 * bảng và tự ĐẾM lại xem đã che được bao nhiêu ô; che được 0 ô thì DỪNG, không
 * chụp.
 *
 * Số liệu tổng hợp (sĩ số, điểm trung bình, số bài đã nộp) thì GIỮ — đó mới là
 * thứ báo cáo cần chứng minh, và nó không chỉ đích danh ai.
 */
const che = () => trang.evaluate(() => {
  const mo = (el) => {
    el.style.filter = 'blur(6px)';
    el.style.userSelect = 'none';
  };
  let dem = 0;

  // Cột "Học sinh" trong mọi bảng: tìm theo vị trí của ô tiêu đề mang chữ đó
  for (const bang of document.querySelectorAll('table')) {
    const dauCot = [...bang.querySelectorAll('thead th')].map(t => (t.textContent || '').trim());
    const cot = dauCot.findIndex(t => /^(Học sinh|Họ và tên|Email|Tên đăng nhập)/i.test(t));
    if (cot < 0) continue;
    for (const hang of bang.querySelectorAll('tbody tr')) {
      const o = hang.children[cot];
      if (o) { mo(o); dem++; }
    }
  }

  // Tên người đang đăng nhập ở góc trên phải
  for (const el of document.querySelectorAll('header *, [class*="Header"] *')) {
    const t = (el.textContent || '').trim();
    if (t && t.length < 40 && el.children.length === 0 && /^[\p{L}\s.]+$/u.test(t)
        && !/^(Vào học tập|Đăng xuất|GIÁO VIÊN|Gia sư Hóa 11)$/i.test(t)) {
      mo(el); dem++;
    }
  }
  return dem;
});

/* Che NGAY TRƯỚC mỗi lần chụp, không che một lần rồi thôi: bảng học sinh chỉ
   xuất hiện sau khi bấm sang mục "Theo dõi học sinh", tức sau lần che đầu. */
const chup = async (ten) => {
  const soOChe = await che();
  console.log(`  đã che ${soOChe} ô chứa thông tin cá nhân`);
  if (soOChe === 0) {
    console.error('  CHE ĐƯỢC 0 Ô — dừng, KHÔNG chụp. Cấu trúc trang đã đổi, sửa bộ chọn rồi chạy lại.');
    await trinhDuyet.close();
    process.exit(1);
  }
  const duong = join(RA, ten);
  await trang.screenshot({ path: duong });
  console.log('  đã chụp:', ten);
};

await chup('Hinh - man giao vien 1.png');

/* Mở mục "Theo dõi học sinh" nếu có nút/tab mang chữ đó. */
const theoDoi = trang.getByText(/Theo dõi học sinh/i).first();
if (await theoDoi.isVisible().catch(() => false)) {
  await theoDoi.click();
  await trang.waitForTimeout(5000);
  await chup('Hinh - man giao vien 2 (theo doi hoc sinh).png');
} else {
  console.log('  KHÔNG thấy mục "Theo dõi học sinh" — in ra các nút đang có để dò:');
  const nut = await trang.locator('button, [role="tab"]').allInnerTexts();
  console.log('  ' + nut.filter(Boolean).map(t => t.replace(/\s+/g, ' ').trim()).slice(0, 40).join(' | '));
}

await trinhDuyet.close();
console.log('\nXONG. Xem lại ảnh TRƯỚC KHI tải lên Drive — nếu còn thấy email hay tên thật của học sinh thì ĐỪNG tải lên.');
