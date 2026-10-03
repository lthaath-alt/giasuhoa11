/**
 * Kiểm bộ phân loại ý định tự huấn luyện (02/10/2026).
 *
 * Chạy:  npm run kiem-tra:phan-loai
 * Không gọi mạng, không cần Python: so với các tệp mẫu đã xuất sẵn.
 *
 * Điều quan trọng nhất ở đây là phía TypeScript tính RA ĐÚNG như phía Python.
 * Lệch chuẩn hoá một ký tự thì mô hình vẫn chạy, vẫn ra nhãn — chỉ là nhãn sai,
 * và không ai thấy.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chuanHoaYDinh, tachTuYDinh, duDoanYDinh, laMoHinhHopLe, type MoHinhYDinh } from '../src/features/tutor/services/phanLoaiYDinh';
/* `yDinhNen.ts` chỉ import tệp thuần `phanLoaiYDinh` ở trên, nên Node nạp được
   bình thường — không cần mô phỏng DOM/trình duyệt gì thêm, chỉ cần tự thay
   `globalThis.fetch` cho từng ca. */
import { doanYDinhNen, datLaiYDinhNenChoKiemTra } from '../src/features/tutor/services/yDinhNen';
import {
  cheThongTin, cumTenCanChe, chonCauHoi, xao, docCsv, docDanhSachDongY, cotTinNhan, csvChuaGan, danhSachTen,
  CHE_EMAIL, CHE_SDT, CHE_TEN,
} from './phan-loai/loc-cau-that.mts';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const docJson = (p: string): unknown => JSON.parse(readFileSync(join(GOC, p), 'utf8'));

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

console.log('\n== Chuẩn hoá khớp vectơ chung với Python ==');
{
  const vecto = docJson('scripts/phan-loai/du-lieu/vecto-chuan-hoa.json') as { vao: string; ra: string }[];
  for (const v of vecto) {
    const ra = chuanHoaYDinh(v.vao);
    ok(ra === v.ra, `"${v.vao}" → "${v.ra}"`, ra === v.ra ? '' : `ra "${ra}"`);
  }
  ok(JSON.stringify(tachTuYDinh('k biet')) === '["k","biet"]', 'giữ từ một ký tự ("k biet")');
  ok(tachTuYDinh('   ').length === 0, 'chuỗi trắng thì không có từ nào');
}

/** So xác suất TS với xác suất scikit-learn đã xuất sẵn. Sai số cho phép 1e-4
    vì trọng số được làm tròn 6 chữ số khi xuất. */
const soKhop = (tepMoHinh: string, tepDuDoan: string, ten: string) => {
  const m = docJson(tepMoHinh);
  ok(laMoHinhHopLe(m), `${ten}: tệp mô hình đúng hình dạng`);
  if (!laMoHinhHopLe(m)) return;
  const mau = docJson(tepDuDoan) as { tin: string; xac_suat: number[] }[];
  let lechMax = 0;
  let khacNhan = 0;
  for (const c of mau) {
    const kq = duDoanYDinh(m, c.tin);
    kq.phanBo.forEach((p, k) => { lechMax = Math.max(lechMax, Math.abs(p - c.xac_suat[k])); });
    const kPy = c.xac_suat.indexOf(Math.max(...c.xac_suat));
    if (m.nhan[kPy] !== kq.nhan) khacNhan++;
  }
  ok(lechMax < 1e-4, `${ten}: xác suất TS khớp scikit-learn trên ${mau.length} câu`, `lệch lớn nhất ${lechMax.toExponential(2)}`);
  ok(khacNhan === 0, `${ten}: cùng nhãn đoán ở mọi câu`, `${khacNhan} câu khác nhãn`);
};

console.log('\n== Đoán trên TypeScript khớp scikit-learn ==');
soKhop('scripts/phan-loai/du-lieu/mau-mo-hinh.json', 'scripts/phan-loai/du-lieu/mau-du-doan.json', 'mô hình mẫu');
if (existsSync(join(GOC, 'public/mo-hinh/phan-loai-y-dinh.json')) && existsSync(join(GOC, 'scripts/phan-loai/ket-qua/du-doan.json'))) {
  soKhop('public/mo-hinh/phan-loai-y-dinh.json', 'scripts/phan-loai/ket-qua/du-doan.json', 'mô hình thật');
} else {
  console.log('  BỎ QUA  chưa có mô hình thật (nhóm chưa gán nhãn và huấn luyện)');
}

console.log('\n== Tệp mô hình hỏng thì từ chối, không đoán bừa ==');
{
  const m = docJson('scripts/phan-loai/du-lieu/mau-mo-hinh.json') as MoHinhYDinh;
  ok(!laMoHinhHopLe(null), 'null');
  ok(!laMoHinhHopLe({ ...m, chuan_hoa_phien_ban: 2 }), 'khác phiên bản chuẩn hoá');
  ok(!laMoHinhHopLe({ ...m, chan: m.chan.slice(1) }), 'thiếu hệ số chặn');
  ok(!laMoHinhHopLe({ ...m, he_so: m.he_so.map(h => h.slice(1)) }), 'hệ số lệch số cột với idf');
  ok(laMoHinhHopLe(JSON.parse(JSON.stringify(m))), 'tệp đúng thì nhận');
  const kq = duDoanYDinh(m, 'constructor toString __proto__');
  ok(Number.isFinite(kq.xacSuat), 'từ trùng tên thuộc tính JS không làm hỏng phép đoán');
  ok(Math.abs(duDoanYDinh(m, '').phanBo.reduce((a, b) => a + b, 0) - 1) < 1e-9, 'tin rỗng vẫn ra phân bố tổng bằng 1');
}

console.log('\n== CHẠY BÓNG: bộ phân loại không được đổi hành vi gia sư ==');
{
  for (const t of ['geminiTutorService.ts', 'pedagogicalStateMachine.ts', 'chuoiDuPhong.ts', 'promptSuPham.ts', 'dungCauLenh.ts']) {
    const ma = readFileSync(join(GOC, 'src/features/tutor/services', t), 'utf8');
    ok(!/phanLoaiYDinh|yDinhNen/.test(ma), `${t} không dùng bộ phân loại`);
  }
  const ctx = readFileSync(join(GOC, 'src/core/contexts/AppContext.tsx'), 'utf8');
  ok((ctx.match(/doanYDinhNen\(/g) ?? []).length === 1, 'AppContext gọi bộ phân loại đúng một chỗ');
  ok(/\.\.\.yDinh\b/.test(ctx), 'kết quả chỉ được trải vào tin nhắn để GHI lại');
  const DUONG_YDINH_NEN = join(GOC, 'src/features/tutor/services/yDinhNen.ts');
  const nen = existsSync(DUONG_YDINH_NEN) ? readFileSync(DUONG_YDINH_NEN, 'utf8') : '';
  ok(nen.includes("'/mo-hinh/phan-loai-y-dinh.json'") && /content-type/i.test(nen),
     'nạp mô hình cùng nguồn và kiểm kiểu nội dung (luật SPA trả index.html kèm 200)');
}

console.log('\n== Hành vi doanYDinhNen: nạp mô hình, chỉ chờ 1 lần mỗi phiên trang ==');
{
  const fetchGoc = globalThis.fetch;
  const dungFetch = (dung: () => Promise<Response>) => { globalThis.fetch = dung as typeof fetch; };

  // (a) Luật SPA trả index.html kèm 200 khi chưa có tệp — không phải JSON.
  datLaiYDinhNenChoKiemTra();
  dungFetch(() => Promise.resolve(new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } })));
  const raA = await doanYDinhNen('em khong hieu bai nay a');
  ok(raA === undefined, 'HTML 200 (luật SPA trả index.html) → không đoán, trả undefined');

  // (b) JSON hợp lệ — đúng mô hình mẫu đã dùng ở các phép kiểm trên.
  datLaiYDinhNenChoKiemTra();
  const mauMoHinh = docJson('scripts/phan-loai/du-lieu/mau-mo-hinh.json') as MoHinhYDinh;
  dungFetch(() => Promise.resolve(new Response(JSON.stringify(mauMoHinh), { status: 200, headers: { 'content-type': 'application/json' } })));
  const raB = await doanYDinhNen('em khong hieu bai nay a');
  ok(!!raB && mauMoHinh.nhan.includes(raB.y_dinh), 'JSON mô hình hợp lệ → y_dinh là một nhãn có thật của mô hình', raB ? raB.y_dinh : 'undefined');
  ok(!!raB && Number.isInteger(raB.y_dinh_xs * 1000), 'y_dinh_xs làm tròn tối đa 3 chữ số', raB ? String(raB.y_dinh_xs) : '');
  ok(!!raB && raB.y_dinh_phien_ban === mauMoHinh.phien_ban, 'y_dinh_phien_ban đúng theo mô hình đã nạp', raB?.y_dinh_phien_ban);

  // (c) JSON nhưng hình dạng sai (ví dụ tệp hỏng giữa đường) — laMoHinhHopLe từ chối.
  datLaiYDinhNenChoKiemTra();
  dungFetch(() => Promise.resolve(new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })));
  const raC = await doanYDinhNen('em khong hieu bai nay a');
  ok(raC === undefined, 'JSON đúng kiểu nội dung nhưng sai hình dạng mô hình → trả undefined');

  /* (d) Tệp mô hình TREO (fetch không bao giờ resolve/reject) — phép kiểm hồi
     quy cho điểm QUAN TRỌNG của vòng sửa 1: lần gọi đầu phải chờ ~1,5 s rồi
     thôi, nhưng lần gọi SAU (trong khi mạng vẫn còn treo) KHÔNG được chờ lại —
     nếu không, mọi tin nhắn của em trong cả phiên sẽ chậm thêm 1,5 s. */
  datLaiYDinhNenChoKiemTra();
  dungFetch(() => new Promise<Response>(() => { /* không bao giờ settle */ }));
  const t0 = Date.now();
  const raD1 = await doanYDinhNen('em khong hieu bai nay a');
  const msLanDau = Date.now() - t0;
  ok(raD1 === undefined, 'tệp mô hình treo: lần gọi ĐẦU vẫn trả undefined sau khi hết hạn chờ');
  ok(msLanDau >= 1400, 'lần gọi ĐẦU chờ đủ khoảng 1,5 s, không trả non ngay', `${msLanDau} ms`);
  const t1 = Date.now();
  const raD2 = await doanYDinhNen('em khong hieu bai nay a');
  const msLanSau = Date.now() - t1;
  ok(raD2 === undefined, 'lần gọi SAU khi mô hình vẫn treo: vẫn trả undefined');
  ok(msLanSau < 100, 'lần gọi SAU KHÔNG chờ lại 1,5 s — đọc thẳng trạng thái đã biết', `${msLanSau} ms`);

  /* (e) Mạng chậm: mô hình về SAU 1,5 s (phép kiểm hồi quy cho sửa vòng 2,
     điểm QUAN TRỌNG của lần sửa này) — lần gọi ĐẦU vẫn hết hạn chờ như cũ,
     nhưng khi mô hình thật về rồi, các tin SAU đó phải có y_dinh. Trước sửa,
     `moHinhSan` chỉ được gán trong `race` nên mãi mãi là null dù mô hình đã
     về — cả phiên trang mất `y_dinh`. */
  datLaiYDinhNenChoKiemTra();
  dungFetch(() => new Promise<Response>((resolve) => {
    setTimeout(() => resolve(new Response(JSON.stringify(mauMoHinh), { status: 200, headers: { 'content-type': 'application/json' } })), 1700);
  }));
  const t2 = Date.now();
  const raE1 = await doanYDinhNen('em khong hieu bai nay a');
  const msE1 = Date.now() - t2;
  ok(raE1 === undefined, 'mạng chậm: lần gọi ĐẦU (mô hình chưa về trong 1,5 s) vẫn trả undefined', `${msE1} ms`);
  await new Promise((r) => setTimeout(r, 400));
  const t3 = Date.now();
  const raE2 = await doanYDinhNen('em khong hieu bai nay a');
  const msE2 = Date.now() - t3;
  ok(!!raE2 && mauMoHinh.nhan.includes(raE2.y_dinh),
     'mạng chậm: mô hình về sau 1,5 s vẫn được dùng cho tin nhắn SAU, không mất cả phiên', raE2 ? raE2.y_dinh : 'undefined');
  ok(msE2 < 100, 'lần gọi SAU khi mô hình đã về: trả ngay, không chờ lại 1,5 s', `${msE2} ms`);

  /* (f) Mô hình hình dạng đúng (qua `laMoHinhHopLe`, vì hàm đó chỉ kiểm hình
     dạng) nhưng hệ số là NaN (ví dụ JSON ghi dở giữa đường) — softmax của NaN
     ra NaN, không throw. Mock trực tiếp đối tượng `Response`-giống (không
     JSON.stringify) vì NaN qua JSON sẽ hoá thành null, che mất lỗi cần kiểm. */
  datLaiYDinhNenChoKiemTra();
  const moHinhNaN: MoHinhYDinh = JSON.parse(JSON.stringify(mauMoHinh));
  moHinhNaN.he_so = moHinhNaN.he_so.map((hang) => hang.map(() => NaN));
  dungFetch(() => Promise.resolve({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => moHinhNaN,
  } as unknown as Response));
  const raF = await doanYDinhNen('em khong hieu bai nay a');
  ok(raF === undefined, 'mô hình hệ số NaN (hình dạng vẫn đúng) → không ghi nhãn bịa đặt, trả undefined');

  globalThis.fetch = fetchGoc;
  datLaiYDinhNenChoKiemTra();
}

console.log('\n== Xuất câu hỏi thật: che thông tin, lọc lớp, bỏ trùng (loc-cau-that.mts) ==');
{
  /* Toàn bộ là dữ liệu GIẢ viết tại chỗ: tên, email, số điện thoại đều bịa. */
  const ten = cumTenCanChe(['Nguyễn Hoàng Thanh An', 'Trần Bảo Ân', 'Lê Minh']);
  const che = (s: string) => cheThongTin(s, ten);

  ok(che('thầy ơi mail em là em.hs+11a3@gmail.com') === `thầy ơi mail em là ${CHE_EMAIL}`, 'che email');
  ok(che('sđt em 0912 345 678 nha') === `sđt em ${CHE_SDT} nha`, 'che số điện thoại có dấu cách', che('sđt em 0912 345 678 nha'));
  ok(che('gọi 0912345678 hoặc +84912345678') === `gọi ${CHE_SDT} hoặc ${CHE_SDT}`, 'che số liền và số +84');
  for (const hoa of ['trộn 100 mL HCl 0,1 M với 100 mL NaOH 0,06 M', 'pH lần lượt 0.1 0.2 0.3 0.4 0.5', 'Kc = 0,0123456789']) {
    ok(che(hoa) === hoa, `KHÔNG che nhầm số liệu hoá học: "${hoa}"`);
  }
  ok(che('Nguyễn Hoàng Thanh An chỉ em bài này') === `${CHE_TEN} chỉ em bài này`, 'che họ tên đầy đủ (một dấu [tên] cho cả cụm)');
  ok(che('nguyen hoang thanh an chi em') === `${CHE_TEN} chi em`, 'che cả khi gõ không dấu');
  ok(che('hỏi Thanh An đi') === `hỏi ${CHE_TEN} đi`, 'che cụm tên đệm + tên');
  ok(che('Trần Bảo Ân, Lê Minh làm chung') === `${CHE_TEN}, ${CHE_TEN} làm chung`, 'hai tên cạnh nhau che riêng từng tên');
  ok(che('em hỏi anh An') === 'em hỏi anh An', 'tên một chữ KHÔNG che (giới hạn đã ghi, người gán che tay)');
  ok(che('bảo an toàn phòng thí nghiệm') === 'bảo an toàn phòng thí nghiệm', 'chữ thường trùng một nửa tên không bị che');

  const lop = ['a@hs.vn', 'b@hs.vn'];
  const tin = [
    { sender: 'user', userEmail: 'A@hs.vn', content: 'em chịu bài này', timestamp: '2026-10-02T08:00:00Z' },
    { sender: 'user', userEmail: 'b@hs.vn', content: 'Em chịu bài này!!', timestamp: '2026-10-02T09:00:00Z' },
    { sender: 'ai', userEmail: 'a@hs.vn', content: 'Em thử viết phương trình trước nhé', timestamp: '2026-10-02T08:00:01Z' },
    { sender: 'user', userEmail: 'c@lopkhac.vn', content: 'tin lớp khác', timestamp: '2026-10-02T08:00:00Z' },
    { sender: 'user', userEmail: 'a@hs.vn', content: 'cho em đáp án luôn đi ạ', timestamp: '2026-10-02T10:00:00Z' },
    { sender: 'user', userEmail: 'a@hs.vn', content: 'Thầy ơi Kc là gì', timestamp: '2026-09-01T10:00:00Z' },
    { sender: 'user', userEmail: 'b@hs.vn', content: '   ', timestamp: '2026-10-02T10:00:00Z' },
    { sender: 'user', userEmail: 'b@hs.vn', content: 'Trần Bảo Ân gọi 0912345678', timestamp: '2026-10-03T10:00:00Z' },
  ];
  const kq = chonCauHoi(tin, {
    emailDuocLay: lop, hoTenCanChe: ['Trần Bảo Ân'], daCo: ['Cho em ĐÁP ÁN luôn đi ạ'],
    tuNgay: '2026-10-01', hat: 42,
  });
  ok(kq.dem.tinEm === 7, 'chỉ đếm tin của EM, bỏ tin gia sư', String(kq.dem.tinEm));
  ok(kq.dem.ngoaiLop === 1, 'tin của em ngoài lớp bị loại (email so không phân biệt hoa thường)');
  ok(kq.dem.ngoaiNgay === 1 && kq.dem.rong === 1, 'lọc theo --tu, bỏ tin rỗng');
  ok(kq.dem.trungDaCo === 1, 'câu đã có trong tệp đã gán (khác hoa thường, dấu câu) không xuất lại');
  ok(kq.dem.trungNhau === 1, '"em chịu bài này" và "Em chịu bài này!!" chỉ giữ một');
  ok(kq.cau.length === 2 && kq.cau.includes(`${CHE_TEN} gọi ${CHE_SDT}`), 'ra 2 câu, câu có tên và số đã che', JSON.stringify(kq.cau));
  ok(!JSON.stringify(kq).includes('@'), 'kết quả không chứa email nào');
  ok(JSON.stringify(chonCauHoi(tin, { emailDuocLay: lop, hoTenCanChe: [], daCo: [], hat: 42 }).cau)
    === JSON.stringify(chonCauHoi(tin, { emailDuocLay: lop, hoTenCanChe: [], daCo: [], hat: 42 }).cau),
    'cùng hạt giống thì cùng thứ tự xáo');
  const muoi = Array.from({ length: 10 }, (_, i) => i);
  ok(xao(muoi, 1).join() !== muoi.join() && [...xao(muoi, 1)].sort((x, y) => x - y).join() === muoi.join(),
    'xáo đổi thứ tự nhưng không mất phần tử');

  ok(docCsv('﻿tin_nhan,nhan\r\n"a, ""b""\nc",x\r\n').length === 2 && docCsv('tin_nhan,nhan\n"a, ""b""\nc",x\n')[1][0] === 'a, "b"\nc',
    'đọc CSV có ngoặc kép, dấu phẩy và xuống dòng trong ô');
  ok(cotTinNhan('tin_nhan,nhan,nguoi_gan,nguon\nem chịu,be_tac,x,tu-viet\n').join() === 'em chịu', 'lấy cột tin_nhan của tệp đã gán');
  ok(docDanhSachDongY('Email,Ho_Ten\na@hs.vn,Trần Bảo Ân\n,\n').length === 1, 'đọc tệp đồng ý, bỏ dòng thiếu email');
  let loi = '';
  try { docDanhSachDongY('ten\nAn\n'); } catch (e) { loi = (e as Error).message; }
  ok(/email/.test(loi), 'tệp đồng ý thiếu cột email thì báo lỗi rõ');
  ok(JSON.stringify(danhSachTen(['  Trần  Bảo Ân ', '', 'An Nguyễn', 'Trần Bảo Ân'])) === '["An Nguyễn","Trần Bảo Ân"]',
    'danh sách tên để dò từ vựng: gọn khoảng trắng, bỏ rỗng, bỏ trùng, không có email');
  const csv = csvChuaGan(['a, "b"', 'em chịu']);
  ok(csv.startsWith('﻿tin_nhan,nhan,nguoi_gan,nguon\r\n"a, ""b""",,,that\r\n'), 'CSV ra đúng 4 cột như nhan.csv, nguồn "that", có BOM cho Excel');
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
