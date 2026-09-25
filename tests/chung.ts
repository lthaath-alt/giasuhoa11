import { Page, expect } from '@playwright/test';
import { taiKhoanGiaoVien } from './moiTruong';

/**
 * Đăng nhập vai GIÁO VIÊN và dừng lại ở màn `/teacher`.
 *
 * PHẢI bấm thẻ "Giáo viên" trước (23/09/2026). Thẻ mặc định là Học sinh, và
 * bản cũ của hàm này quên bấm: `LoginForm` thấy sai vai nên đăng xuất, rồi một
 * lỗi đua trong `AppContext` đặt lại `currentUser` cho phiên đã chết. Từ đó
 * sinh ra ba "phát hiện" sai trong CLAUDE.md — "gõ mật khẩu xong vẫn bị hỏi
 * Tiếp tục", "0 Lớp học", và "Playwright không lưu phiên xuống đĩa". Chọn
 * đúng thẻ thì vào thẳng `/teacher`, IndexedDB có phiên, F5 vẫn còn phiên.
 *
 * Mỗi phép vẫn tự đăng nhập (không dùng `storageState`) — giữ nguyên lối cũ
 * cho khỏi đổi cấu hình, chỉ tốn thêm vài giây mỗi phép.
 */
export async function dangNhapGiaoVien(page: Page): Promise<void> {
  const tk = taiKhoanGiaoVien();
  if (!tk) throw new Error('Thiếu GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');

  await page.goto('/');
  await expect(page.locator('#login-email-field')).toBeVisible({ timeout: 30_000 });

  await page.locator('#role-option-teacher').click();
  await page.locator('#login-email-field').fill(tk.email);
  await page.locator('#login-password-field').fill(tk.matKhau);
  await page.locator('#login-submit-btn').click();

  const manGiaoVien = page.locator('#teacher-page');
  const tiepTuc = page.locator('#continue-session-btn');
  const khungLoi = page.locator('#login-error-alert');

  const ai = await Promise.race([
    manGiaoVien.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'vao-thang'),
    tiepTuc.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'hoi-tiep-tuc'),
  ]).catch(() => 'khong-vao-duoc');

  if (ai === 'khong-vao-duoc') {
    const bao = (await khungLoi.isVisible()) ? (await khungLoi.innerText()).trim() : '';
    throw new Error(bao ? `Web không cho vào, nó báo: "${bao}"` : 'Hết giờ chờ mà không vào được');
  }

  /* Đi tiếp qua màn "Chào mừng trở lại" nếu gặp. Gặp nó sau khi vừa gõ mật
     khẩu là SAI so với đặc tả, nhưng cái sai đó có phép riêng phơi ra
     (`giaovien/dang-nhap-vao-thang.spec.ts`) — hàm này chỉ lo vào cho được. */
  if (ai === 'hoi-tiep-tuc') await tiepTuc.click();
  await expect(manGiaoVien, 'tài khoản GIAO_VIEN_EMAIL phải có vai teacher')
    .toBeVisible({ timeout: 30_000 });
}

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
