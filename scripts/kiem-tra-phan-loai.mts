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

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
