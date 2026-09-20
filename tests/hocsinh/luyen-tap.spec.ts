import { test, expect, Page } from '@playwright/test';
import { taiKhoanThu } from '../moiTruong';
import { vaoTrongApp } from '../chung';

/**
 * Hai thứ thêm ngày 20/09/2026 mà KHÔNG bộ kiểm nào trong `scripts/` nhìn
 * thấy được, vì chúng chỉ hiện sau khi đăng nhập: nút "Chơi để ôn" ở từng
 * bài, và lối "chơi xong màn là mở lại lượt" khi đang bị khoá 10 phút.
 *
 * Phép thử ở đây CỐ Ý nông. Nó trả lời đúng một câu: "thứ vừa thêm có thật
 * sự hiện ra trước mắt học sinh không". Phần logic sâu hơn — mốc thời gian
 * `luc`, điều kiện mở khoá — đã có sáu phép trong `kiem-tra:luyen-tap` lo,
 * và chúng chạy trong một phần nghìn thời gian của một lượt mở trình duyệt.
 *
 * LƯU Ý về dữ liệu: web luôn nối Firestore THẬT, kể cả ở máy dev (dự án không
 * có emulator cho phần web). Nên mọi phép thử ở đây ghi tiến độ thật lên tài
 * khoản thử. Hãy dùng một tài khoản học sinh riêng để thử, đừng dùng tài
 * khoản của một em đang học.
 */
/* Tìm nút theo CHỮ NHÌN THẤY, đừng tìm theo tên trợ năng.
   `<Tooltip>` của MUI mặc định LÀM NHÃN cho phần tử con, nên tên trợ năng của
   nút này là câu trong tooltip ("Ôn bài này bằng trò chơi — màn N") chứ không
   phải chữ "Chơi để ôn" in trên nút. `getByRole('button', { name: 'Chơi để
   ôn' })` vì thế không tìm thấy gì, trong khi nút hiện rành rành trên màn
   hình — đã mất một lượt chạy vì chỗ này. */
const NUT_CHOI = (page: Page) => page.locator('button:has-text("Chơi để ôn")');

test.describe('Luyện tập (đã đăng nhập)', () => {
  test.skip(
    !taiKhoanThu(),
    'Chưa có tài khoản thử trong .env.local — xem .env.example',
  );

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    /* Phiên đã lưu vẫn còn sống, nên web hỏi "Tiếp tục với <tên>?" trước khi
       cho vào trong — giống hệt lúc vừa gõ mật khẩu. */
    await vaoTrongApp(page);
    await page.locator('#nav-practice-btn').click();
  });

  test('vào được tab Luyện tập mà không rơi ra màn đăng nhập', async ({ page }) => {
    /* Phiên lưu ra tệp mà thiếu IndexedDB thì đúng chỗ này sẽ lộ: web đá về
       màn đăng nhập, hoặc hiện "Luyện tập cần đăng nhập". */
    await expect(page.locator('body')).not.toContainText('Luyện tập cần đăng nhập');
    await expect(page.locator('#login-email-field')).toBeHidden();
  });

  test('mỗi bài có nút "Chơi để ôn"', async ({ page }) => {
    await expect(NUT_CHOI(page).first()).toBeVisible({ timeout: 30_000 });
    /* Có ở NHIỀU bài, không phải chỉ đúng một chỗ lẻ. */
    expect(await NUT_CHOI(page).count()).toBeGreaterThan(1);
  });

  test('bấm "Chơi để ôn" thì mở khu Trò chơi, KHÔNG mở tab mới', async ({ page, context }) => {
    const soTabTruoc = context.pages().length;
    await NUT_CHOI(page).first().click();

    /* Vì sao canh chỗ này: trò chơi gửi tiến độ về bằng `postMessage` tới cửa
       sổ CHA. Mở ở tab mới là tiến độ rơi vào hư không, và em chơi xong mà
       khoá vẫn không mở — hỏng âm thầm, không lỗi nào hiện ra. */
    await expect(page.locator('iframe')).toBeVisible({ timeout: 30_000 });
    expect(context.pages().length, 'không được đẻ ra tab mới').toBe(soTabTruoc);
  });
});
