import { defineConfig, devices } from '@playwright/test';
import { docEnvE2E } from './tests/moiTruong';

/**
 * Kiểm thử đầu-cuối bằng Playwright (20/09/2026).
 *
 * Vì sao có: `npm run lint` và 13 bộ kiểm trong `scripts/` không mở nổi trình
 * duyệt, nên mọi thứ chỉ hiện ra SAU KHI đăng nhập đều không ai canh — đúng
 * hai chỗ vừa thêm hôm 20/09 (nút "Chơi để ôn" và hộp thoại khoá riêng) đã
 * phải nhờ chủ dự án xem hộ vì AI không được gõ mật khẩu.
 *
 * Bộ này KHÔNG thay mười ba bộ kia. Chúng nhanh, chạy trên mọi máy, và bắt
 * được thứ trình duyệt không thấy (mã màu, tên trường trong luật, chuỗi chép
 * cứng). Bộ E2E chậm, cần mạng và cần tài khoản thật, nên chỉ nhận phần việc
 * mà chỉ trình duyệt mới làm được.
 */

const env = docEnvE2E();

/* Đích mặc định là máy dev. Muốn soi bản đã deploy thì:
     E2E_URL=https://giasuhoa11.pages.dev npm run kiem-tra:e2e             */
const DICH = process.env.E2E_URL || env.E2E_URL || 'http://localhost:3000';
const laMayDev = DICH.startsWith('http://localhost');

export default defineConfig({
  testDir: './tests',
  /* Cả suite chạy tuần tự. Các phép thử dùng CHUNG một tài khoản học sinh
     thật, nên chạy song song là hai phép cùng ghi tiến độ của một người rồi
     đá nhau — hỏng mà không hiểu vì sao. */
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  /* Chạy lại một lần trên CI: mạng ở đây chậm thất thường (đã đo: tải gói
     Chromium ~150MB đứt giữa chừng hai lần). Trên máy thì KHÔNG chạy lại —
     một phép thử lúc đạt lúc trượt là tin xấu, đừng giấu nó đi. */
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: DICH,
    /* DÙNG Chrome ĐÃ CÀI trên máy, không dùng bản Chromium Playwright tự tải.
       Đo 20/09/2026: `npx playwright install chromium` chết hai lần, đứt giữa
       chừng khi tải (cdn.playwright.dev vẫn trả lời, chỉ tải tệp lớn là gãy).
       Chrome và Edge trên máy đều lái được. Máy nào tải được bản đi kèm thì cứ
       bỏ dòng `channel` này đi, không ảnh hưởng gì. */
    channel: 'chrome',
    locale: 'vi-VN',
    screenshot: 'only-on-failure',
    /* KHÔNG quay video. Video cần thêm một tệp ffmpeg mà Playwright phải tải
       về, và mạng ở đây chặn đúng đường tải đó (đo 20/09/2026: cả chromium
       lẫn ffmpeg đều gãy). Bật `video` lên thì MỌI phép thử đều trượt ngay từ
       lúc mở trang, với thông báo nói về ffmpeg chứ không nói về web — mất
       thì giờ truy nhầm hướng. Ảnh chụp và trace không cần tệp ngoài nào. */
    trace: 'retain-on-failure',
  },

  /* Chỉ tự bật máy chủ khi đích là localhost. Trỏ sang bản đã deploy mà vẫn
     bật `npm run dev` thì vừa chậm vừa vô nghĩa. */
  webServer: laMayDev
    ? {
      command: 'npm run dev',
      url: DICH,
      reuseExistingServer: true,
      timeout: 120_000,
    }
    : undefined,

  projects: [
    /* Đăng nhập MỘT LẦN rồi cất phiên ra tệp, các phép sau dùng lại. */
    { name: 'dangnhap', testMatch: /dangnhap\.setup\.ts/ },

    /* Khách vãng lai: không cần tài khoản nào, nên luôn chạy được. */
    {
      name: 'khach',
      testMatch: /khach\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    /* Phần chỉ thấy được sau khi đăng nhập. */
    {
      name: 'hocsinh',
      testMatch: /hocsinh[\\/].*\.spec\.ts/,
      dependencies: ['dangnhap'],
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'tests/.auth/hocsinh.json',
      },
    },
  ],
});
