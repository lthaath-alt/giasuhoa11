import { test, expect, Page } from '@playwright/test';
import { dangNhapGiaoVien } from '../chung';
import { taiKhoanGiaoVien } from '../moiTruong';

/**
 * Giáo viên giao đề cho lớp — bấm thật từ đầu tới cuối.
 *
 * VÌ SAO CÓ TỆP NÀY (22/09/2026). Tính năng giao đề lên tới tay giáo viên
 * trong tình trạng **không bấm được**, và không phép kiểm nào thấy: `npm run
 * lint` xanh, cả 14 bộ trong `scripts/` xanh. Hai lý do gộp lại:
 *
 *   1. Luật của collection `de_giao` chưa được publish lên Firebase, nên
 *      Firestore từ chối ghi. Tệp `firestore.rules` trong git chỉ là bản thảo.
 *   2. Khung báo lỗi nằm ở ĐẦU form còn nút ở CUỐI, cách nhau hơn một màn
 *      hình, nên giáo viên không thấy lời giải thích nào.
 *
 * Không bộ kiểm tĩnh nào bắt được loại này, vì cả hai chỉ lộ ra khi có người
 * thật đăng nhập và bấm thật. Đúng cái lỗ hổng mà `kiem-tra:e2e` sinh ra để
 * bịt — chỉ là hôm đó `tests/` chưa có phép nào cho màn giáo viên.
 *
 * PHÉP THỬ NÀY GHI DỮ LIỆU THẬT lên Firestore (tạo một đề thật cho lớp thật)
 * rồi XOÁ đi ở cuối. Đề mang tên `[E2E] …` kèm mốc thời gian để không ai nhầm
 * nó với đề của giáo viên. Nếu phép thử chết giữa chừng, đề `[E2E]` có thể
 * còn sót lại — xoá tay trong bảng "Đề đã giao" là xong, bài đã nộp không mất
 * theo (luật chặn xoá tài liệu `bai_nop`).
 */

const TEN_DE = `[E2E] Đừng chấm — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

/** Mở màn giáo viên → mục "Theo dõi học sinh" → thẻ "Giao đề kiểm tra". */
async function moTheGiaoDe(page: Page): Promise<void> {
  await dangNhapGiaoVien(page);

  /* "Theo dõi học sinh" là mục mặc định của ManagementLayout khi có
     progressContent, nhưng bấm cho chắc — mặc định đổi được. */
  const mucTheoDoi = page.getByText('Theo dõi học sinh', { exact: true }).first();
  if (await mucTheoDoi.isVisible().catch(() => false)) await mucTheoDoi.click();

  await page.getByRole('tab', { name: 'Giao đề kiểm tra' }).click();

  /* Không có lớp thì GiaoDeTab chỉ vẽ một dòng "Bạn chưa có lớp nào" và KHÔNG
     vẽ nút nào — chờ nút cho hết giờ rồi báo "không tìm thấy phần tử" là giấu
     mất nguyên nhân. Bắt ca này riêng và nói thẳng ra.
     Lần "0 Lớp học" đo ngày 22/09/2026 là do `dangNhapGiaoVien` quên bấm thẻ
     "Giáo viên" nên phiên bị đăng xuất — đã sửa 23/09/2026, xem chú thích
     của hàm đó trong `chung.ts`. */
  const khongCoLop = page.getByText('Bạn chưa có lớp nào', { exact: false });
  const nutDeMau = page.locator('#giao-de-mau-btn');
  const thay = await Promise.race([
    nutDeMau.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'co-lop'),
    khongCoLop.waitFor({ state: 'visible', timeout: 30_000 }).then(() => 'khong-co-lop'),
  ]).catch(() => 'treo');

  if (thay === 'khong-co-lop') {
    throw new Error(
      'Màn giáo viên báo "Bạn chưa có lớp nào" dù tài khoản này LÀ chủ nhiệm một lớp. '
      + 'Trang không nạp được `classes` (console báo Missing or insufficient permissions). '
      + 'Đây là lỗi nạp dữ liệu của web, không phải của mục giao đề.',
    );
  }
  expect(thay, 'mở thẻ "Giao đề kiểm tra" mà không thấy gì').toBe('co-lop');
}

test.describe('Giáo viên giao đề cho lớp', () => {
  test('soạn đề mẫu 10 câu, giao cho lớp, rồi dọn', async ({ page }) => {
    test.skip(!taiKhoanGiaoVien(), 'Chưa có GIAO_VIEN_EMAIL / GIAO_VIEN_MATKHAU trong .env.local');
    await moTheGiaoDe(page);

    // ── Soạn đề ──────────────────────────────────────────────────────────
    await page.locator('#giao-de-mau-btn').click();

    /* Nút "Giao đề" chỉ hiện khi đề đã có câu. Nó hiện ra = bộ đề mẫu đã nạp. */
    const nutGiao = page.locator('#giao-de-submit-btn');
    await expect(nutGiao, 'bấm "Đề mẫu 10 câu" xong phải hiện nút Giao đề').toBeVisible();

    await expect(page.getByText('ĐỀ XEM TRƯỚC — 10 CÂU, 10 ĐIỂM')).toBeVisible();

    /* Đặt tên riêng để nhận ra và xoá được ở cuối. */
    const oTieuDe = page.getByLabel('Tên đề *');
    await oTieuDe.fill(TEN_DE);

    // ── Giao ─────────────────────────────────────────────────────────────
    await nutGiao.click();

    const hopThoaiXong = page.locator('#giao-de-xong');
    const khungLoi = page.locator('#giao-de-loi');

    const ketQua = await Promise.race([
      hopThoaiXong.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'xong'),
      khungLoi.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'loi'),
    ]).catch(() => 'im-lang');

    /* "im-lang" là triệu chứng gốc đã làm giáo viên mất buổi: bấm xong không
       có phản hồi nào. Dù đề có giao được hay không, web PHẢI nói một câu. */
    expect(ketQua, 'bấm Giao đề mà web không phản hồi gì — đúng lỗi 22/09/2026')
      .not.toBe('im-lang');

    if (ketQua === 'loi') {
      const chu = (await khungLoi.innerText()).trim();
      /* Không nuốt lỗi thành `skip`. Luật chưa publish nghĩa là tính năng
         HỎNG THẬT với giáo viên, khác hẳn "máy này thiếu Java" — cái sau là
         không kiểm được, cái này là đang gãy. Để nó đỏ. */
      throw new Error(`Giao đề thất bại. Web báo: "${chu}"`);
    }

    /* Thành công: hộp thoại phải đưa link thông báo dán được vào nhóm lớp. */
    await expect(page.getByText('#/de/', { exact: false })).toBeVisible();
    await page.getByRole('button', { name: 'Đóng' }).click();

    // ── Đề phải xuất hiện trong bảng ─────────────────────────────────────
    const hang = page.locator('tr', { hasText: TEN_DE });
    await expect(hang, 'đề vừa giao phải hiện trong bảng "Đề đã giao"').toBeVisible({ timeout: 30_000 });
    await expect(hang).toContainText('10');

    // ── Dọn: xoá đề vừa tạo ──────────────────────────────────────────────
    await hang.locator('[data-xoa]').click();
    await page.locator('#giao-de-xoa-xac-nhan').click();
    await expect(hang, 'xoá xong đề phải biến khỏi bảng').toBeHidden({ timeout: 30_000 });
  });
});
