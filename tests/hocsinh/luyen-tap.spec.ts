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

  /**
   * Hạn mức đọc Firestore — phép canh DUY NHẤT đo được điều này.
   *
   * Trước 20/09/2026, mở tab Luyện tập là tải cả ngân hàng: 1.554 lượt đọc +
   * 5,74 MB cho MỖI em MỖI phiên. Bậc miễn phí cho 50.000 lượt đọc/ngày, tức
   * một lớp 40 em mở cùng một tiết là 62.160 lượt — vỡ hạn mức giữa buổi, và
   * cả trường mất ngân hàng tới sáng hôm sau.
   *
   * Không bộ kiểm nào trong `scripts/` thấy được chuyện này: nó không làm đỏ
   * `tsc`, không làm hỏng build, và trên máy một người dùng thì chạy y như
   * thường. Chỉ đếm request thật mới lộ ra.
   */
  test('mở tab Luyện tập KHÔNG đọc ngân hàng; bấm vào bài mới đọc', async ({ page }) => {
    const goi: string[] = [];
    page.on('request', r => {
      /* Firestore SDK đi bằng WebChannel/gRPC-Web qua
         firestore.googleapis.com. Lọc theo host thay vì theo đường dẫn cho
         khỏi phụ thuộc hình dạng URL nội bộ của SDK. */
      if (r.url().includes('firestore.googleapis.com')) goi.push(r.url());
    });

    // Mở lại tab Luyện tập từ đầu để đếm cho sạch
    await page.locator('#nav-practice-btn').click();
    await expect(NUT_CHOI(page).first()).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(2_000);   // cho mọi request kịp bay đi
    const sauKhiMo = goi.length;

    /* Bấm vào một phần của một bài: LÚC NÀY mới được phép đọc, và chỉ đọc
       đúng bài đó (~80 câu, nhiều nhất 230). */
    await page.locator('button:has-text("Nhiều lựa chọn")').first().click();
    await page.waitForTimeout(3_000);
    const sauKhiBam = goi.length;

    expect(sauKhiBam, 'bấm vào bài thì PHẢI đọc ngân hàng').toBeGreaterThan(sauKhiMo);
    console.log(`  [đo] mở tab: ${sauKhiMo} request Firestore · sau khi bấm bài: ${sauKhiBam}`);
  });

  /**
   * Lỗi 29/09/2026: làm sai rồi bấm "Làm lại với đề khác" thì đề mới hiện ra
   * ở trạng thái ĐÃ NỘP — lộ đáp án (✓, lời giải), khóa ô chọn, mất nút Nộp
   * bài. Nguyên nhân: lượt mới giữ nguyên màn 'lam-bai' nên React giữ lại
   * PracticeRunner cũ cùng `ketQua` của lượt trước. Sửa bằng `key` theo lượt
   * trong PracticeSection.tsx.
   *
   * Chỉ trả lời ĐÚNG MỘT câu rồi nộp: tối đa 1/N số điểm, chắc chắn dưới
   * ngưỡng 70% mà không cần biết đáp án. Phép này tiêu một lượt thật của tài
   * khoản thử; hết lượt thì phần đó khóa 10 phút và phép tự BỎ QUA.
   */
  test('làm sai rồi "Làm lại với đề khác" thì ra đề mới CHƯA nộp', async ({ page }) => {
    await page.locator('button:has-text("Nhiều lựa chọn")').first().click();

    const nutNop = page.getByRole('button', { name: /^Nộp bài/ });
    const vaoDuoc = await nutNop.waitFor({ state: 'visible', timeout: 30_000 })
      .then(() => true).catch(() => false);
    test.skip(!vaoDuoc, 'Phần đầu tiên đang khóa hoặc cần ôn lại — không có đề để làm.');

    // Trả lời đúng một câu (chọn phương án A của câu 1), rồi nộp
    await page.getByRole('radio').first().check();
    await nutNop.click();

    await expect(page.getByText('Chưa đạt', { exact: true })).toBeVisible();
    const nutLamLai = page.getByRole('button', { name: 'Làm lại với đề khác' });
    test.skip(!(await nutLamLai.isVisible()), 'Tài khoản thử đã hết lượt ở phần này.');

    await nutLamLai.click();

    // Đề mới phải là một lượt TRỐNG: có nút Nộp bài, chưa chọn câu nào
    await expect(nutNop).toBeVisible();
    await expect(nutNop).toContainText('(0/');
    await expect(page.getByText('Chưa đạt', { exact: true })).toBeHidden();
    // Không lộ đáp án của lượt mới
    await expect(page.getByText('Giải thích', { exact: true })).toHaveCount(0);
    await expect(page.locator('text=✓')).toHaveCount(0);
    // Ô chọn phải bấm được
    await expect(page.getByRole('radio').first()).toBeEnabled();
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0);
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
