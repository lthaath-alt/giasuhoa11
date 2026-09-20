import { test, expect } from '@playwright/test';
import { tranLuotKhach } from './moiTruong';

const TRAN_LUOT_KHACH = tranLuotKhach();

/**
 * Phần khách vãng lai thấy được — chạy trên mọi máy, không cần tài khoản nào.
 *
 * Con số lượt lấy THẲNG từ hằng số trong mã, không chép lại vào đây. Chép ra
 * đây là dựng thêm một chỗ thứ hai phải nhớ sửa, mà `kiem-tra:het-luot` sinh
 * ra chính là để chặn điều đó.
 */
test.describe('Khách vãng lai', () => {
  test('màn đăng nhập nói đúng số lượt được dùng thử', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#login-email-field')).toBeVisible();

    const chu = await page.locator('body').innerText();
    expect(chu).toContain(`${TRAN_LUOT_KHACH} câu hỏi`);
    /* Con số cũ phải biến mất hẳn, không chỉ là "có thêm số mới". */
    expect(chu).not.toContain('25 câu hỏi');
  });

  test('có lối vào dùng thử, và bấm là vào được', async ({ page }) => {
    await page.goto('/');
    const nut = page.locator('#continue-as-guest-btn');
    await expect(nut).toBeVisible();
    await nut.click();

    /* Vào được tức là thanh điều hướng của khu học hiện ra. */
    await expect(page.locator('#nav-practice-btn')).toBeVisible({ timeout: 30_000 });
  });

  test('mở thẳng một đường dẫn con không bị 404', async ({ page }) => {
    /* Đây là phép canh cho `public/_redirects`. SPA dùng HashRouter nên chỗ
       dễ gãy là chính trang gốc; bản Netlify từng 404 khi F5 vì thiếu tệp đó,
       và không có phép kiểm nào trong `scripts/` mở nổi trình duyệt để thấy. */
    const res = await page.goto('/login');
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator('body')).toContainText('Gia sư Hóa 11');
  });

  test('không có lỗi đỏ nào trong Console lúc mở trang', async ({ page }) => {
    const loi: string[] = [];
    page.on('console', m => { if (m.type() === 'error') loi.push(m.text()); });
    await page.goto('/');
    await expect(page.locator('#login-email-field')).toBeVisible();

    /* Bỏ qua đúng một loại: khung huy hiệu `about:srcdoc` của nhà cung cấp
       host tự chèn, CSP chặn script nội tuyến trong đó là CSP đang làm đúng
       việc. Xem mục "Một lỗi CSP trong Console là BÌNH THƯỜNG" ở CLAUDE.md. */
    const that = loi.filter(t => !/srcdoc/i.test(t));
    expect(that, `Console có lỗi:\n${that.join('\n')}`).toEqual([]);
  });
});
