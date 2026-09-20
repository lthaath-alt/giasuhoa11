import { test as setup, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { taiKhoanThu, TEP_PHIEN } from './moiTruong';
import { vaoTrongApp } from './chung';

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

  /* Gõ mật khẩu xong phải VÀO THẲNG. Màn "Chào mừng trở lại" chỉ dành cho lần
     mở lại tab khi phiên cũ còn sống — vừa gõ mật khẩu mà web còn hỏi "tiếp
     tục?" thì thành hỏi hai lần cho một lần đăng nhập.
     Đua hai bên chứ không chỉ xem cuối cùng ra gì: nếu màn hỏi-tiếp-tục hiện
     ra dù chỉ thoáng qua, phép thử này phải kêu. */
  const khungLoi = page.locator('#login-error-alert');
  const thanhDieuHuong = page.locator('#nav-practice-btn');
  const tiepTuc = page.locator('#continue-session-btn');

  const ai = await Promise.race([
    thanhDieuHuong.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'vao-thang'),
    tiepTuc.waitFor({ state: 'visible', timeout: 45_000 }).then(() => 'hoi-tiep-tuc'),
  ]).catch(() => 'khong-vao-duoc');

  if (ai === 'khong-vao-duoc') {
    const bao = (await khungLoi.isVisible()) ? (await khungLoi.innerText()).trim() : '';
    throw new Error(bao ? `Web không cho vào, nó báo: "${bao}"` : 'Hết giờ chờ mà không vào được');
  }
  expect(ai, 'gõ mật khẩu xong phải vào thẳng, không hỏi "Tiếp tục với ..."').toBe('vao-thang');

  /* Và không được có khung đỏ nào khi đã vào đúng. Web từng nhét chính câu
     "Đăng nhập thành công!" vào khung lỗi màu đỏ — xem ghi chú cuối tệp. */
  await expect(khungLoi).toBeHidden();

  await vaoTrongApp(page);

  mkdirSync(dirname(TEP_PHIEN), { recursive: true });
  await page.context().storageState({ path: TEP_PHIEN, indexedDB: true });
});

/* GHI CHÚ — lỗi của WEB, bộ này bắt được ngay lượt chạy đầu, ĐÃ SỬA 20/09/2026.
   Học sinh đăng nhập ĐÚNG mật khẩu vẫn thấy một khung ĐỎ ghi "Đăng nhập thành
   công!", và không được đưa thẳng vào trong; phải bấm thêm "Tiếp tục với ...".
   Nguyên nhân: `AppContext.login()` trả `user: users.find(u => u.id === uid)`,
   mà `users` chỉ có dữ liệu khi tài khoản được quyền `list` trên collection
   `users` — tức từ giáo viên trở lên. Với học sinh, `users` rỗng nên `user`
   là `undefined`, `LoginForm` rơi vào nhánh `else` và đem chính câu báo THÀNH
   CÔNG đi `setError`. Nay `login()` chỉ trả về VAI, lấy thẳng từ hồ sơ vừa
   đọc. Hai phép canh ở trên giữ cho nó không quay lại. */
