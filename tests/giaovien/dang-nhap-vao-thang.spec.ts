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
 * ĐANG ĐỎ, phát hiện 22/09/2026 — và đây là lỗi của WEB, không phải của phép
 * thử. Ảnh Playwright chụp lúc trượt cho thấy màn "Chào mừng trở lại" hiện ra
 * kèm ĐÚNG email vừa gõ, tức `currentUser` đã về nhưng cờ `dangVao` chưa kịp
 * bật.
 *
 * Nguyên nhân là một cuộc đua trong `LoginPage.tsx`:
 *   - `onAuthStateChanged` đặt `currentUser` ngay khi Firebase Auth xong;
 *   - `handleSuccess` (đặt `dangVao = true`) chỉ chạy khi `login()` TRẢ VỀ, mà
 *     `login()` còn phải đọc `users/{uid}` để lấy vai.
 * Bên nào xong trước thì thắng. Khối `if (currentUser && !dangVao)` ở dòng 199
 * vẽ màn "Chào mừng trở lại", nên Auth về trước là màn đó hiện.
 *
 * Vì sao lộ ra ở vai GIÁO VIÊN chứ không phải học sinh: đường đăng nhập của
 * giáo viên đọc thêm dữ liệu (vai này có quyền `list` trên `users`), nên
 * `login()` trả về muộn hơn và cửa sổ đua rộng hơn hẳn.
 *
 * CỐ Ý KHÔNG TỰ VÁ: sửa nó là chạm vào luồng đăng nhập — vùng đã có hai lần
 * trả giá, và cách chữa (đặt `dangVao` trước khi gọi `login()`, hay để
 * `AppContext` tự điều hướng) là quyết định kiến trúc của chủ dự án, không
 * phải việc tiện tay. Phép thử này đứng đây để cái sai không bị quên.
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
});
