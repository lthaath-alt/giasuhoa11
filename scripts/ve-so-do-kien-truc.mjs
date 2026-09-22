/**
 * Kết xuất sơ đồ kiến trúc ra PNG cho báo cáo NCKH (Hình 1).
 *
 * Chạy:  node scripts/ve-so-do-kien-truc.mjs
 * Nguồn: docs/anh-minh-chung/so-do-kien-truc.html
 *
 * Vì sao dựng bằng HTML rồi nhờ Chrome chụp, thay vì vẽ tay rồi xuất ảnh: sơ
 * đồ này mang SỐ ĐO của dự án (1.554 câu, temperature 0,3, 4 mức bế tắc…). Số
 * nào cũng có thể đổi, và một tấm ảnh vẽ tay thì không ai sửa nổi. Để nguồn là
 * HTML trong git thì sửa một dòng rồi chạy lại là xong, và người sau đọc được
 * tấm ảnh này lấy số từ đâu.
 *
 * deviceScaleFactor 2 để chữ còn nét khi hội đồng phóng to hoặc in ra giấy.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { statSync } from 'node:fs';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const VAO = join(GOC, 'docs/anh-minh-chung/so-do-kien-truc.html');
const RA = join(GOC, 'docs/anh-minh-chung/Hinh 1. So do kien truc he thong.png');

const trinhDuyet = await chromium.launch({ channel: 'chrome' });
const trang = await trinhDuyet.newPage({ deviceScaleFactor: 2 });
await trang.goto(pathToFileURL(VAO).href, { waitUntil: 'load' });

/* Chờ phông tải xong. Thiếu bước này thì Chrome chụp lúc còn phông dự phòng,
   và chữ trong ảnh không khớp chữ trên màn hình. */
await trang.evaluate(() => document.fonts.ready);
await trang.waitForTimeout(500);

const khung = trang.locator('#khung');
await khung.screenshot({ path: RA });
await trinhDuyet.close();

console.log(`Kich thuoc tep: ${(statSync(RA).size / 1024).toFixed(0)} KB`);
