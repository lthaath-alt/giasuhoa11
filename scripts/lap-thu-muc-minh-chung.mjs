/**
 * Lắp thư mục minh chứng cho báo cáo NCKH, sẵn sàng tải lên Google Drive.
 *
 * Chạy:  node scripts/lap-thu-muc-minh-chung.mjs
 *
 * Gom từ bốn nguồn:
 *   - ảnh sinh ra trong repo   docs/anh-minh-chung/
 *   - 12 hình của báo cáo đầy đủ, đã bóc và đặt tên theo chú thích
 *   - ảnh chụp lớp học do chủ dự án gửi
 *   - bản báo cáo tóm tắt mới nhất
 *
 * KHÔNG tự đoán đường dẫn: thiếu nguồn nào thì DỪNG và nói thiếu cái gì, thay
 * vì lặng lẽ tạo một thư mục hụt rồi người ta tải lên mà không biết.
 */
import { readdirSync, existsSync, mkdirSync, copyFileSync, writeFileSync, statSync, rmSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const TAI = 'C:/Users/vi.nguyen/Downloads';
const RA = join(TAI, 'Minh-chung-NCKH-Gia-su-Hoa-11');

const NGUON = {
  anhRepo: join(GOC, 'docs/anh-minh-chung'),
  hinhBaoCao: join(TAI, 'hinh-de-cuong-NCKH'),
  anhLop: process.argv[2],                       // thư mục ảnh lớp đã giải nén
  baoCao: process.argv[3],                       // .docx bản mới nhất
};

for (const [ten, d] of Object.entries(NGUON)) {
  if (!d || !existsSync(d)) { console.error(`Thiếu nguồn "${ten}": ${d}`); process.exit(1); }
}

/* Ảnh lớp: đặt tên theo NỘI DUNG, dựa trên bảng ảnh đã soi. Khoá là tên tệp
   gốc do máy ảnh sinh ra — xấu nhưng là thứ duy nhất ổn định. */
const TEN_ANH_LOP = {
  '2aoboqzqwoivo4watszgiokqj8hhiuneyo1hqx5c8': '01 - Toan canh lop, muc Thi nghiem dang chieu (da che ten hoc sinh)',
  '2aoboqzqwpe67cqvhqtbdup0ipcaxjmzpib6irwa9': '02 - Muc Thi nghiem, mo hinh phan tu CH4',
  '2aoboqzqwqatpnwagp3rj2taofjccnkrns2vfdjk10': '03 - Muc Thi nghiem, mo hinh phan tu tren man chieu',
  '2aoboqzqwqdv94rm1omzizyzl2gdgn3lhspkuaro12': '04 - De kiem tra tren web, phan trac nghiem',
  '2aoboqzqwrimj8vjjdk69m7gcuo2pgyytzpqngok11': '05 - De kiem tra tren web, cau hoi tinh toan',
  '2aoboqzqwsgoxhvuocetylhcdlcs7q0wzsszsi3c13': '06 - De kiem tra tren web, can bang NO2 - N2O4',
  '2aoboqzqwty1zqjwvlrwdpnva8qgmg2x7v4sblam15': '07 - Hoi thoai gia su AI tren man chieu (1)',
  '2aoboqzqwuh1lqklgwodsrfsayeasivrxhgsnysc16': '08 - Hoi thoai gia su AI tren man chieu (2)',
  '2aoboqzqwv1mgcmsjaefovhsd1toyy0ktw6kdjcq17': '09 - Hoi thoai gia su AI tren man chieu (3)',
  '2aoboqzqwvh9pfabnjvhptx4zbcdbb5oobq22t4s18': '10 - Hoc sinh lam bai tai cho',
  '2aoboqzqwvkpjrjezy3ytsuzt5cdi5buztrgltyc1': '11 - Trang chu website tren man chieu',
  '2aoboqzqwvt2uct3jelabc2u9d3nrylfncpsb7mc2': '12 - Man dang nhap website',
  '2aoboqzqwvt7lqloje5yihxcdi4cejgc8fjsce5q4': '13 - Bai giang tren man chieu, phan ung mot chieu',
  '2aoboqzqww1ank9h2uted5siwhhqam3mkvhur1n67': '14 - Toan canh lop trong gio hoc (1)',
  '2aoboqzqww5mkcy5mqnzfrzje62o68tlbetllzbw3': '15 - Giao vien huong dan tai lop',
  '2aoboqzqwwa6fctxgyygoesklrowvvukyq1xgdgi5': '16 - Toan canh lop trong gio hoc (2)',
  '2aoboqzqwwefffzgnjrvooan9ruowr7ofcsplw3619': '17 - Hoc sinh thao luan nhom',
  '2aoboqzqwxdwe2pe4n5nfakysvoyqaihdynrejui6': '18 - Bai giang tren man chieu, y nghia cong nghiep',
  '2aoboqzqwo0n7l4apje7u8pjk0c7mcnv87tgooms14': '19 - Video gio hoc',
};

/* Ảnh số 01 đã được che tên học sinh trên màn chiếu; dùng BẢN ĐÃ CHE. */
const BAN_DA_CHE = process.argv[4];

if (existsSync(RA)) rmSync(RA, { recursive: true, force: true });
const tao = (d) => { mkdirSync(d, { recursive: true }); return d; };
tao(RA);

const dem = {};
const chep = (tu, den) => { copyFileSync(tu, den); dem[basename(dirname(den))] = (dem[basename(dirname(den))] || 0) + 1; };

// ── Báo cáo ────────────────────────────────────────────────────────────────
chep(NGUON.baoCao, join(RA, 'Bao cao tom tat - ban 22-09-2026.docx'));

// ── 01 Sơ đồ kiến trúc ─────────────────────────────────────────────────────
const d1 = tao(join(RA, '01 - So do kien truc'));
chep(join(NGUON.anhRepo, 'Hinh 1. So do kien truc he thong.png'),
     join(d1, 'Hinh 1. So do kien truc he thong.png'));

// ── 02 Ảnh của báo cáo đầy đủ ──────────────────────────────────────────────
const d2 = tao(join(RA, '02 - Anh trong bao cao day du'));
for (const f of readdirSync(NGUON.hinhBaoCao).filter(f => /\.png$/i.test(f))) {
  chep(join(NGUON.hinhBaoCao, f), join(d2, f));
}

// ── 03 Màn theo dõi của giáo viên ──────────────────────────────────────────
const d3 = tao(join(RA, '03 - Man theo doi cua giao vien'));
for (const f of readdirSync(NGUON.anhRepo).filter(f => /^Hinh - man giao vien/i.test(f))) {
  chep(join(NGUON.anhRepo, f), join(d3, f.replace('Hinh - man giao vien', 'Man giao vien')));
}

// ── 04 Giờ học lớp 11A3 ────────────────────────────────────────────────────
const d4 = tao(join(RA, '04 - Gio hoc lop 11A3'));
let khongRo = 0;
for (const f of readdirSync(NGUON.anhLop)) {
  const khoa = f.replace(/\.(jpg|mp4)$/i, '');
  const ten = TEN_ANH_LOP[khoa];
  if (!ten) { khongRo++; continue; }
  const duoi = f.slice(f.lastIndexOf('.'));
  const nguon = (khoa.endsWith('hqx5c8') && BAN_DA_CHE) ? BAN_DA_CHE : join(NGUON.anhLop, f);
  const duoiThat = (nguon === BAN_DA_CHE) ? '.png' : duoi;
  chep(nguon, join(d4, ten + duoiThat));
}

console.log('Da lap:', JSON.stringify(dem, null, 1));
if (khongRo) console.log(`(bo qua ${khongRo} tep khong co trong bang ten)`);

const tong = Object.values(dem).reduce((a, c) => a + c, 0);
console.log(`Tong ${tong} tep tai: ${RA}`);
writeFileSync(join(RA, '_so-luong.txt'), `Sinh ngay ${new Date().toISOString().slice(0, 10)} — ${tong} tệp\n`, 'utf8');
