import { Page, expect } from '@playwright/test';
import { taiKhoanGiaoVien } from './moiTruong';

/**
 * Đăng nhập vai GIÁO VIÊN và dừng lại ở màn `/teacher`.
 *
 * Vì sao MỖI PHÉP THỬ tự đăng nhập, thay vì đăng nhập một lần rồi cất phiên ra
 * tệp như bản học sinh (22/09/2026): trong ngữ cảnh Playwright, Firebase Auth
 * **không lưu phiên xuống đĩa**. Đo được: sau khi đăng nhập thành công và vào
 * tới `#teacher-page`, kho `firebaseLocalStorageDb/firebaseLocalStorage` vẫn
 * RỖNG 0 bản ghi sau 30 giây chờ; `localStorage` không có khoá
 * `firebase:authUser:…` nào; và bấm F5 là văng thẳng về `/#/login`.
 *
 * Nên `storageState` chụp ra một tệp nhìn như thành công mà không mang theo
 * phiên nào — mọi phép thử mở ra đều thấy màn đăng nhập trống. Đăng nhập lại
 * mỗi phép tốn thêm vài giây, đổi lại là nó CHẠY.
 *
 * Việc "phiên có sống qua F5 không" là chuyện của luồng đăng nhập, không phải
 * của mục giao đề — đã báo riêng cho chủ dự án, đừng vá ở đây.
 */
export async function dangNhapGiaoVien(page: Page): Promise<void> {
  const tk = taiKhoanGiaoVien();
  if (!tk) throw new Error('Thiếu GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');

  await page.goto('/');
  await expect(page.locator('#login-email-field')).toBeVisible({ timeout: 30_000 });

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
