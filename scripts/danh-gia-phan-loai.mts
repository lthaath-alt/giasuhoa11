/**
 * So bộ phân loại tự huấn luyện với luật regex đang chạy, trên TẬP KIỂM —
 * 20 % câu mà mô hình không thấy lúc học.
 *
 * Chạy:  npm run danh-gia:phan-loai                (mô hình thật, sau khi huấn luyện)
 *        npm run danh-gia:phan-loai -- --mau       (mô hình mẫu, để thử đường ống)
 *
 * In bảng Markdown để dán vào báo cáo, và ghi ra scripts/phan-loai/ket-qua/so-sanh.md
 * (hoặc du-lieu/mau-so-sanh.md với --mau).
 *
 * Regex chỉ có ý kiến về HAI nhãn (bế tắc, gian lận phòng thi), nên so từng nhãn
 * theo kiểu có/không. Bốn nhãn kia chỉ mô hình làm được — báo riêng.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { duDoanYDinh, laMoHinhHopLe } from '../src/features/tutor/services/phanLoaiYDinh';
import { laTinBeTac, laNguCanhGianLanPhongThi } from '../src/features/tutor/services/pedagogicalStateMachine';

const GOC = join(dirname(fileURLToPath(import.meta.url)), '..');
const mau = process.argv.includes('--mau');
/* Học trên câu thật thì tập kiểm nằm trong du-lieu/that/ (bị .gitignore chặn):
   huan-luyen.py in sẵn lệnh có --tap-kiem đúng đường dẫn. so-sanh.md chỉ mang số. */
const iTapKiem = process.argv.indexOf('--tap-kiem');
const tapKiemRieng = iTapKiem >= 0 ? process.argv[iTapKiem + 1] : undefined;
const tepMoHinh = mau ? 'scripts/phan-loai/du-lieu/mau-mo-hinh.json' : 'public/mo-hinh/phan-loai-y-dinh.json';
const tepKiem = tapKiemRieng ? resolve(tapKiemRieng)
  : join(GOC, mau ? 'scripts/phan-loai/du-lieu/mau-tap-kiem.json' : 'scripts/phan-loai/ket-qua/tap-kiem.json');
const tepRa = mau ? 'scripts/phan-loai/du-lieu/mau-so-sanh.md' : 'scripts/phan-loai/ket-qua/so-sanh.md';

const m: unknown = JSON.parse(readFileSync(join(GOC, tepMoHinh), 'utf8'));
if (!laMoHinhHopLe(m)) { console.error(`${tepMoHinh} không đúng hình dạng mô hình.`); process.exit(1); }
const cau = JSON.parse(readFileSync(tepKiem, 'utf8')) as { tin_nhan: string; nhan: string }[];
/* Mô hình ghi số câu kiểm lúc học. Lệch số là đang chấm mô hình trên tập kiểm của LẦN
   HỌC KHÁC (vd. mô hình học trên câu thật mà quên --tap-kiem): số đo sẽ sai, dừng. */
const soCauKiem = (m as { so_do?: { so_cau_kiem?: number } }).so_do?.so_cau_kiem;
if (soCauKiem !== undefined && soCauKiem !== cau.length) {
  console.error(`Tập kiểm ${tepKiem} có ${cau.length} câu, mà mô hình học với ${soCauKiem} câu kiểm — không cùng một lần học.`);
  console.error('Học trên câu thật thì chạy lại với --tap-kiem <đường dẫn huan-luyen.py in ra>.');
  process.exit(1);
}
const doan = cau.map(c => duDoanYDinh(m, c.tin_nhan).nhan);

const pct = (x: number) => (x * 100).toFixed(1).replace('.', ',') + ' %';
/** precision, recall, F1 cho bài toán có/không. */
const prf = (that: boolean[], du: boolean[]) => {
  let tp = 0, fp = 0, fn = 0;
  that.forEach((t, i) => { if (t && du[i]) tp++; else if (!t && du[i]) fp++; else if (t && !du[i]) fn++; });
  const p = tp + fp ? tp / (tp + fp) : 0;
  const r = tp + fn ? tp / (tp + fn) : 0;
  return { p, r, f1: p + r ? 2 * p * r / (p + r) : 0, tp, fp, fn };
};

const dong: string[] = [];
const dung = doan.filter((d, i) => d === cau[i].nhan).length;
dong.push(`# So sánh bộ phân loại tự huấn luyện với luật regex`, '',
  `Mô hình \`${m.phien_ban}\`, tập kiểm ${cau.length} câu (máy không thấy lúc học).`, '',
  `Độ chính xác ${m.nhan.length} nhãn của mô hình: **${pct(dung / cau.length)}** (${dung}/${cau.length}).`, '',
  '| Nhãn | Cách | Precision | Recall | F1 | Bắt đúng | Báo nhầm | Bỏ sót |',
  '|---|---|---|---|---|---|---|---|');
const so = (nhan: string, luat: (s: string) => boolean) => {
  const that = cau.map(c => c.nhan === nhan);
  for (const [cach, du] of [['regex', cau.map(c => luat(c.tin_nhan))], ['mô hình', doan.map(d => d === nhan)]] as const) {
    const k = prf(that, du as boolean[]);
    dong.push(`| ${nhan} | ${cach} | ${pct(k.p)} | ${pct(k.r)} | ${pct(k.f1)} | ${k.tp} | ${k.fp} | ${k.fn} |`);
  }
};
so('be_tac', laTinBeTac);
so('gian_lan_phong_thi', laNguCanhGianLanPhongThi);
/* Mọi nhãn mô hình có, trừ hai nhãn regex cũng làm (đã so ở trên). Đọc từ mô hình: bộ nhãn từ
   04/10/2026 có thêm xin_de, từ 05/10/2026 thêm tra_loi_gia_su, và nhãn chưa đủ câu thì mô hình
   chưa học. */
const THU_TU = ['hoi_khai_niem', 'xin_dap_an', 'nop_bai_lam', 'xin_de', 'tra_loi_gia_su', 'ngoai_mon'];
const chiMoHinh = [...THU_TU.filter(n => m.nhan.includes(n)),
  ...m.nhan.filter(n => !THU_TU.includes(n) && n !== 'be_tac' && n !== 'gian_lan_phong_thi')];
dong.push('', `## ${chiMoHinh.length === 4 ? 'Bốn' : 'Các'} nhãn chỉ mô hình làm được`, '', '| Nhãn | Precision | Recall | F1 |', '|---|---|---|---|');
for (const nhan of chiMoHinh) {
  const k = prf(cau.map(c => c.nhan === nhan), doan.map(d => d === nhan));
  dong.push(`| ${nhan} | ${pct(k.p)} | ${pct(k.r)} | ${pct(k.f1)} |`);
}
dong.push('', `_Tập kiểm nhỏ thì mỗi câu đổi vài điểm phần trăm — ghi kèm số câu khi trích._`);

const ra = dong.join('\n') + '\n';
mkdirSync(dirname(join(GOC, tepRa)), { recursive: true });
writeFileSync(join(GOC, tepRa), ra, 'utf8');
console.log(ra);
console.log(`Đã ghi ${tepRa}`);
