/**
 * Che (làm mờ) một hoặc nhiều vùng chữ nhật trên ảnh, rồi ghi ra tệp mới.
 *
 * Chạy:
 *   node scripts/che-vung-anh.mjs <ảnh vào> <ảnh ra> x,y,w,h [x,y,w,h ...]
 *
 * Toạ độ tính theo PIXEL THẬT của ảnh gốc, gốc toạ độ ở góc trên trái.
 *
 * Vì sao cần: ảnh minh chứng cho báo cáo sẽ nằm trong một thư mục Drive chia
 * sẻ được, mà ảnh chụp lớp học hay lọt họ tên thật trên màn chiếu, trên bảng
 * điểm, trên giấy kiểm tra. Đã suýt đưa lên một ảnh in rõ tên 28 em lớp 11A3;
 * xem mục kiểm thử đầu-cuối trong CLAUDE.md.
 *
 * Làm mờ chứ không bôi đen: người xem vẫn thấy được đó là chỗ có chữ, nên ảnh
 * không bị hiểu nhầm là đã cắt ghép.
 */
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { statSync } from 'node:fs';

const [vao, ra, ...vung] = process.argv.slice(2);
if (!vao || !ra || !vung.length) {
  console.error('Thiếu tham số.');
  console.error('  node scripts/che-vung-anh.mjs vao.jpg ra.jpg 1300,445,110,45');
  process.exit(1);
}

const hcn = vung.map(v => {
  const s = v.split(',').map(Number);
  if (s.length !== 4 || s.some(Number.isNaN)) {
    console.error(`Vùng không hợp lệ: "${v}" — phải là x,y,w,h`);
    process.exit(1);
  }
  return { x: s[0], y: s[1], w: s[2], h: s[3] };
});

const trinhDuyet = await chromium.launch({ channel: 'chrome' });
const trang = await trinhDuyet.newPage();
await trang.goto(pathToFileURL(vao).href);

const co = await trang.evaluate((hcn) => {
  const im = document.querySelector('img');
  const W = im.naturalWidth, H = im.naturalHeight;
  document.body.style.cssText = 'margin:0;padding:0;background:#000';
  document.documentElement.style.cssText = 'margin:0;padding:0';
  im.style.cssText = `display:block;width:${W}px;height:${H}px;max-width:none;max-height:none`;

  /* Mỗi vùng là một lớp phủ dùng backdrop-filter — nó làm mờ CHÍNH PHẦN ẢNH
     nằm dưới, nên không phải vẽ lại ảnh hay cắt ghép gì. */
  for (const v of hcn) {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:${v.x}px;top:${v.y}px;`
      + `width:${v.w}px;height:${v.h}px;backdrop-filter:blur(12px);`
      + `-webkit-backdrop-filter:blur(12px);z-index:9`;
    document.body.appendChild(d);
  }
  return { W, H };
}, hcn);

await trang.setViewportSize({ width: co.W, height: co.H });
await trang.waitForTimeout(500);
await trang.screenshot({ path: ra, clip: { x: 0, y: 0, width: co.W, height: co.H } });
await trinhDuyet.close();

console.log(`Đã che ${hcn.length} vùng trên ảnh ${co.W}×${co.H}`);
console.log(`  ra: ${ra} — ${(statSync(ra).size / 1024).toFixed(0)} KB`);
console.log('  XEM LẠI ẢNH trước khi chia sẻ; công cụ này không tự biết còn chỗ nào lộ.');
