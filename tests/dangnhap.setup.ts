import { test as setup, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { taiKhoanThu, TEP_PHIEN } from './moiTruong';

/**
 * Đăng nhập MỘT LẦN, cất phiên ra tệp cho mọi phép thử sau dùng lại.
 *
 * Ba điều đã trả giá để biết, đừng sửa mất:
 *
 * 1. **Phải có `indexedDB: true`.** Firebase Auth giữ phiên trong IndexedDB
 *    chứ không phải cookie hay localStorage. Thiếu cờ này thì tệp phiên lưu
 *    ra vẫn "thành công" nhưng rỗng ruột, và mọi phép thử sau mở ra là màn
 *    đăng nhập — hỏng mà thông báo lỗi không hề nhắc tới đăng nhập.
 *    (Chính tài liệu Playwright lấy Firebase Authentication làm ví dụ.)
 *
 * 2. **Mật khẩu KHÔNG nằm trong tệp này**, cũng không nằm trong bất kỳ tệp
 *    nào lên git. Nó ở `.env.local` (đã bị `.gitignore` chặn bằng `.env*`).
 *    Chính kịch bản gõ mật khẩu vào ô — người viết mã không cần đọc nó, và
 *    AI thì không được phép đọc.
 *
 * 3. **Thiếu tài khoản thì BỎ QUA, không báo trượt.** Máy vừa clone về chưa
 *    có `.env.local`; để nó đỏ lòm thì người ta sẽ quen mắt với màu đỏ, rồi
 *    một hôm trượt thật cũng không ai nhìn.
 */
setup('đăng nhập bằng tài khoản học sinh thử', async ({ page }) => {
  const tk = taiKhoanThu();
  setup.skip(
    !tk,
    'Chưa có tài khoản thử. Thêm E2E_EMAIL và E2E_MATKHAU vào .env.local '
    + '(xem .env.example) rồi chạy lại.',
  );
  if (!tk) return;

  await page.goto('/');

  /* Màn đăng nhập mặc định đã ở vai Học sinh; ô nhập là bằng chứng. */
  await expect(page.locator('#login-email-field')).toBeVisible();

  await page.locator('#login-email-field').fill(tk.email);
  await page.locator('#login-password-field').fill(tk.matKhau);
  await page.locator('#login-submit-btn').click();

  /* Sai mật khẩu thì web hiện khung lỗi chứ không đứng im. Bắt lấy nó để
     báo đúng bệnh, thay vì để phép thử chết vì hết giờ chờ. */
  const khungLoi = page.locator('#login-error-alert');
  await expect
    .poll(
      async () => (await khungLoi.isVisible())
        ? 'loi'
        : (await page.locator('#nav-practice-btn').isVisible()) ? 'vao-duoc' : 'dang-cho',
      { message: 'chờ đăng nhập xong', timeout: 45_000 },
    )
    .not.toBe('dang-cho');

  if (await khungLoi.isVisible()) {
    throw new Error(`Web từ chối đăng nhập: ${await khungLoi.innerText()}`);
  }

  await expect(page.locator('#nav-practice-btn')).toBeVisible();

  mkdirSync(dirname(TEP_PHIEN), { recursive: true });
  await page.context().storageState({ path: TEP_PHIEN, indexedDB: true });
});
