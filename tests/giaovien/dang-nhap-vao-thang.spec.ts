import { test, expect } from '@playwright/test';
import { taiKhoanGiaoVien } from '../moiTruong';

/**
 * Gõ mật khẩu xong, GIÁO VIÊN phải vào thẳng — không bị hỏi thêm câu nào.
 *
 * Đặc tả: CLAUDE.md, mục "Ba lối vào, ba hành vi khác nhau" (20/09/2026).
 * Màn "Chào mừng trở lại" chỉ dành cho lần MỞ LẠI TAB khi phiên cũ còn sống;
 * vừa gõ mật khẩu mà web còn hỏi "tiếp tục?" là hỏi hai lần cho một lần đăng
 * nhập. Bản học sinh của phép canh này nằm ở `dangnhap.setup.ts`.
 *
 * Lịch sử, để khỏi đi lại đường cũ: 22/09/2026 phép này ĐỎ, và chú thích ở
 * đây từng đổ cho một cuộc đua giữa `onAuthStateChanged` và `handleSuccess`
 * trong `LoginPage.tsx`. Kết luận đó SAI. Đo 23/09/2026: phép thử quên bấm
 * thẻ "Giáo viên", nên tài khoản giáo viên đăng nhập ở thẻ Học sinh, bị
 * `LoginForm` đăng xuất, rồi một lỗi đua THẬT trong `AppContext` (lượt
 * `onAuthStateChanged` cũ đặt lại `currentUser` sau khi đã đăng xuất) vẽ màn
 * "Tiếp tục với ...". Chọn đúng thẻ thì vào thẳng. Lỗi `AppContext` đã vá;
 * phép thứ hai bên dưới canh cho nó không quay lại.
 */
test.describe('Đăng nhập vai giáo viên', () => {
  /* Dùng ngữ cảnh SẠCH, không mượn phiên của `dangnhap-gv`: phép này đo đúng
     lần gõ mật khẩu đầu tiên, mà mang phiên cũ vào thì web hỏi "tiếp tục?" là
     đúng chứ không sai — đo nhầm thứ. */
  test.use({ storageState: { cookies: [], origins: [] } });

  test('gõ mật khẩu xong vào thẳng, không hỏi "Tiếp tục với ..."', async ({ page }) => {
    const tk = taiKhoanGiaoVien();
    test.skip(!tk, 'Chưa có GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');
    if (!tk) return;

    await page.goto('/');
    await expect(page.locator('#login-email-field')).toBeVisible();

    await page.locator('#role-option-teacher').click();
    await page.locator('#login-email-field').fill(tk.email);
    await page.locator('#login-password-field').fill(tk.matKhau);
    await page.locator('#login-submit-btn').click();

    const ai = await Promise.race([
      page.locator('#teacher-page').waitFor({ state: 'visible', timeout: 45_000 })
        .then(() => 'vao-thang'),
      page.locator('#continue-session-btn').waitFor({ state: 'visible', timeout: 45_000 })
        .then(() => 'hoi-tiep-tuc'),
    ]).catch(() => 'khong-vao-duoc');

    expect(
      ai,
      'gõ mật khẩu xong phải vào thẳng /teacher — xem chú thích đầu tệp, '
      + 'đây là cuộc đua giữa onAuthStateChanged và handleSuccess trong LoginPage.tsx',
    ).toBe('vao-thang');
  });

  /* Giáo viên quên đổi thẻ (thẻ mặc định là Học sinh). `LoginForm` báo lỗi và
     đăng xuất — nhưng trước khi vá, lượt `onAuthStateChanged` của lần đăng
     nhập vẫn chạy tiếp và đặt lại `currentUser` SAU khi đã đăng xuất: màn
     "Tiếp tục với ..." hiện ra với một phiên đã chết, bấm vào là màn giáo
     viên "0 Lớp học" kèm hàng loạt permission-denied. Đo 23/09/2026. */
  test('chọn nhầm thẻ Học sinh: báo lỗi và Ở LẠI form, không hiện "Tiếp tục với ..."', async ({ page }) => {
    const tk = taiKhoanGiaoVien();
    test.skip(!tk, 'Chưa có GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');
    if (!tk) return;

    await page.goto('/');
    await expect(page.locator('#login-email-field')).toBeVisible();

    await page.locator('#role-option-student').click();
    await page.locator('#login-email-field').fill(tk.email);
    await page.locator('#login-password-field').fill(tk.matKhau);
    await page.locator('#login-submit-btn').click();

    await expect(page.locator('#login-error-alert')).toContainText('Giáo viên', { timeout: 45_000 });

    /* Lượt `onAuthStateChanged` cũ về muộn nhất khoảng 1 giây sau khung lỗi
       (đo được 450ms). Chờ hẳn 8 giây rồi mới kết luận. */
    await page.waitForTimeout(8_000);
    await expect(page.locator('#continue-session-btn')).toHaveCount(0);
    await expect(page.locator('#login-error-alert')).toBeVisible();
  });
});
