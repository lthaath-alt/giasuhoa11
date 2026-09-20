import { Page, expect } from '@playwright/test';

/**
 * Đi từ màn đăng nhập vào bên trong app.
 *
 * Vì sao cần hàm riêng: đăng nhập xong web KHÔNG tự nhảy vào trong. Nó dừng ở
 * màn "Chào mừng trở lại" với nút "Tiếp tục với <tên>", để người dùng tự bấm —
 * xem `LoginPage.tsx`, khối `if (currentUser && !dangVao)`. Đó là chủ ý, không
 * phải lỗi, nên phép thử phải bấm nút đó chứ không phải sửa web.
 *
 * Màn này hiện ở HAI chỗ, nên mọi lối vào đều phải gọi hàm này: ngay sau khi
 * gõ mật khẩu, và cả những lần mở trang bằng phiên đã lưu sẵn — lúc đó phiên
 * còn sống nên web lại hỏi "tiếp tục?" y như vậy.
 */
export async function vaoTrongApp(page: Page): Promise<void> {
  const tiepTuc = page.locator('#continue-session-btn');
  const thanhDieuHuong = page.locator('#nav-practice-btn');

  /* Chờ web dừng hẳn ở một trong hai màn rồi mới quyết định. Bấm sớm quá thì
     nút chưa gắn xong, bấm vào chỗ trống. */
  await expect
    .poll(
      async () => {
        if (await thanhDieuHuong.isVisible()) return 'o-trong-roi';
        if (await tiepTuc.isVisible()) return 'dang-hoi-tiep-tuc';
        return 'dang-cho';
      },
      { message: 'chờ web dựng xong màn sau đăng nhập', timeout: 45_000 },
    )
    .not.toBe('dang-cho');

  if (await tiepTuc.isVisible()) await tiepTuc.click();

  await expect(thanhDieuHuong).toBeVisible({ timeout: 30_000 });
}
