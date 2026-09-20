/**
 * Kiểm tra phần Luyện tập: chấm điểm, ngưỡng đạt, luật làm lại.
 *
 * Chạy:  npm run kiem-tra:luyen-tap
 *
 * Không gọi mạng — mọi phép thử chạy trên câu hỏi dựng sẵn.
 *
 * Đây là chỗ sai thì KHÔNG AI THẤY: điểm vẫn hiện ra một con số trông hợp lý,
 * học sinh vẫn qua hoặc trượt, chỉ là qua/trượt sai người. Nhất là thang đúng
 * sai của Bộ — bốn mức 0,1 / 0,25 / 0,5 / 1,0 không tuyến tính, gõ nhầm một
 * mức là cả lớp lệch điểm.
 */
import {
  chamCau, chamLuot, capNhatSauLuot, capLaiLuot, chonCauTuKho,
  khopTraLoiNgan, doiRaSo, trangThaiPhan, soLuotKhacNhau, moTaThieuCau,
  baiDaXong, conKhoa, soLuotConLai, daChoiSauKhi,
} from '../src/features/practice/logic';
import {
  tienDoRong, TienDoPhan, SO_LUOT_MOI_CHU_KY, NGUONG_DAT, PHUT_KHOA,
} from '../src/features/practice/types';
import type { BankQuestion } from '../src/features/bank/types';
import type { Question } from '../src/features/library/types';
import { xaoPhuongAnBank, xaoPhuongAnWeb } from '../src/features/bank/xaoDapAn';
import { chuanBiBaiNop } from '../src/features/quiz/baiNopChuan';
import type { Quiz } from '../src/features/quiz/types';
import { readFileSync } from 'node:fs';

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  console.log((dieu ? '  OK   ' : '  HỎNG ') + ten + (chiTiet ? '  — ' + chiTiet : ''));
  if (!dieu) hong++;
};

// ─── Câu hỏi dựng sẵn ────────────────────────────────────────────────────────

const cauMC = (id: string, dapAn = 1): BankQuestion => ({
  id, ch: 1, lv: 'nb', t: 'mc', q: 'Câu ' + id,
  o: ['A', 'B', 'C', 'D'], a: dapAn, lessonId: 'bai-1',
});

const cauTF = (id: string, ys: boolean[] = [true, false, true, false]): BankQuestion => ({
  id, ch: 1, lv: 'nb', t: 'tf', q: 'Câu ' + id,
  st: ys.map((v, i) => ({ s: 'Ý ' + i, v })), lessonId: 'bai-1',
});

const cauTN = (id: string, num: number, tol?: number): BankQuestion => ({
  id, ch: 1, lv: 'nb', t: 'tn', q: 'Câu ' + id,
  num, ansText: String(num).replace('.', ','), tol, lessonId: 'bai-1',
});

// ─── Thang điểm đúng/sai của Bộ ──────────────────────────────────────────────

console.log('\n== Thang đúng/sai theo Bộ GD&ĐT ==');
{
  const cau = cauTF('tf1', [true, false, true, false]);
  const dung = [true, false, true, false];

  const thu = (soYDung: number) => {
    /* Dựng câu trả lời sai đúng (4 - soYDung) ý cuối. */
    const dap = dung.map((v, i) => (i < soYDung ? v : !v));
    return chamCau(cau, dap).diem;
  };

  ok(thu(0) === 0,    'đúng 0 ý  → 0 điểm',    String(thu(0)));
  ok(thu(1) === 0.1,  'đúng 1 ý  → 0,1 điểm',  String(thu(1)));
  ok(thu(2) === 0.25, 'đúng 2 ý  → 0,25 điểm', String(thu(2)));
  ok(thu(3) === 0.5,  'đúng 3 ý  → 0,5 điểm',  String(thu(3)));
  ok(thu(4) === 1.0,  'đúng 4 ý  → 1,0 điểm',  String(thu(4)));

  /* Ý bỏ trống PHẢI tính là sai. Nếu bỏ qua ý trống, em chỉ trả lời ý nào chắc
     chắn sẽ được điểm cao hơn em trả lời hết — ngược hẳn thang của Bộ. */
  const boTrong = chamCau(cau, [true, null, null, null]);
  ok(boTrong.diem === 0.1, 'ý bỏ trống tính là sai', `đúng 1 ý → ${boTrong.diem} điểm`);

  const khongTraLoi = chamCau(cau, null);
  ok(khongTraLoi.diem === 0, 'không trả lời gì → 0 điểm', String(khongTraLoi.diem));

  ok(chamCau(cau, dung).dung === true, 'đúng cả 4 ý mới coi là "làm đúng câu"');
  ok(chamCau(cau, [true, false, true, true]).dung === false, 'đúng 3/4 ý vẫn là chưa đúng câu');
}

// ─── Trắc nghiệm nhiều lựa chọn ──────────────────────────────────────────────

console.log('\n== Nhiều lựa chọn ==');
{
  const cau = cauMC('mc1', 2);
  ok(chamCau(cau, 2).diem === 1, 'chọn đúng → 1 điểm');
  ok(chamCau(cau, 0).diem === 0, 'chọn sai → 0 điểm');
  ok(chamCau(cau, null).diem === 0, 'bỏ trống → 0 điểm');
  /* Chỉ số 0 là phương án A và là giá trị "falsy" trong JS. Viết ẩu kiểu
     `if (traLoi)` sẽ coi em chọn A là chưa trả lời. */
  ok(chamCau(cauMC('mc2', 0), 0).diem === 1, 'chọn phương án A (chỉ số 0) vẫn được chấm');
}

// ─── Trả lời ngắn ────────────────────────────────────────────────────────────

console.log('\n== Trả lời ngắn ==');
{
  ok(doiRaSo('1,7') === 1.7, 'dấu phẩy thập phân đọc được', String(doiRaSo('1,7')));
  ok(doiRaSo('1.7') === 1.7, 'dấu chấm thập phân đọc được');
  ok(doiRaSo(' 2,479 ') === 2.479, 'bỏ khoảng trắng thừa');
  ok(Number.isNaN(doiRaSo('')), 'chuỗi rỗng → NaN');

  const c = cauTN('tn1', 1.7, 0.05);
  ok(khopTraLoiNgan(c, '1,7'), 'gõ đúng bằng dấu phẩy');
  ok(khopTraLoiNgan(c, '1.7'), 'gõ đúng bằng dấu chấm');
  ok(khopTraLoiNgan(c, '1,73'), 'lệch 0,03 — trong sai số 0,05 thì vẫn đúng');
  ok(!khopTraLoiNgan(c, '1,8'), 'lệch 0,1 — ngoài sai số thì sai');
  ok(!khopTraLoiNgan(c, ''), 'bỏ trống là sai');
  ok(!khopTraLoiNgan(c, 'một phẩy bảy'), 'gõ chữ là sai');

  /* Câu không khai sai số phải so khớp chặt, KHÔNG được ngầm nới tay. */
  const chat = cauTN('tn2', 8);
  ok(khopTraLoiNgan(chat, '8'), 'không có sai số: gõ đúng vẫn đúng');
  ok(!khopTraLoiNgan(chat, '8,1'), 'không có sai số: lệch 0,1 là sai');
  /* 0,1 + 0,2 = 0,30000000000000004 trong dấu phẩy động — không được vì thế mà
     đánh trượt em gõ đúng. */
  ok(khopTraLoiNgan(cauTN('tn3', 0.1 + 0.2), '0,3'), 'sai lệch dấu phẩy động không làm em trượt');
}

// ─── Ngưỡng 70% của cả lượt ──────────────────────────────────────────────────

console.log('\n== Ngưỡng đạt ' + Math.round(NGUONG_DAT * 100) + '% ==');
{
  const nam = [cauMC('a'), cauMC('b'), cauMC('c'), cauMC('d'), cauMC('e')];
  const traLoi = (soDung: number) =>
    Object.fromEntries(nam.map((c, i) => [c.id, i < soDung ? 1 : 0]));

  ok(chamLuot(nam, traLoi(5)).dat, 'nhiều lựa chọn 5/5 → đạt');
  ok(chamLuot(nam, traLoi(4)).dat, 'nhiều lựa chọn 4/5 = 80% → đạt');
  ok(!chamLuot(nam, traLoi(3)).dat, 'nhiều lựa chọn 3/5 = 60% → chưa đạt');

  /* Phần đúng/sai 2 câu: tổng điểm là số thập phân nên rất dễ vấp lỗi làm tròn.
     4/4 + 3/4 = 1,5 / 2 = 75% → đạt. */
  const haiTF = [cauTF('t1'), cauTF('t2')];
  const dungHet = [true, false, true, false];
  const sai1Y = [true, false, true, true];
  const sai2Y = [true, false, false, true];

  const kq75 = chamLuot(haiTF, { t1: dungHet, t2: sai1Y });
  ok(Math.abs(kq75.tiLe - 0.75) < 1e-9 && kq75.dat,
    'đúng sai: 4/4 ý + 3/4 ý = 75% → đạt', `${kq75.diem}/${kq75.toiDa}`);

  const kq62 = chamLuot(haiTF, { t1: dungHet, t2: sai2Y });
  ok(!kq62.dat, 'đúng sai: 4/4 ý + 2/4 ý = 62,5% → chưa đạt', `${kq62.diem}/${kq62.toiDa}`);

  /* Đúng 7 phần 10 chẵn phải ĐẠT. Cộng dồn số thập phân có thể ra
     0,6999999999999 và đánh trượt oan nếu so sánh không có dung sai. */
  const muoiCau = Array.from({ length: 10 }, (_, i) => cauMC('m' + i));
  const bay = Object.fromEntries(muoiCau.map((c, i) => [c.id, i < 7 ? 1 : 0]));
  ok(chamLuot(muoiCau, bay).dat, 'đúng 7/10 = đúng 70% chẵn → phải ĐẠT');
}

// ─── Luật lượt làm lại và khóa ───────────────────────────────────────────────

console.log('\n== Lượt làm lại, khóa ' + PHUT_KHOA + ' phút ==');
{
  const nam = [cauMC('a'), cauMC('b'), cauMC('c'), cauMC('d'), cauMC('e')];
  const truot = Object.fromEntries(nam.map(c => [c.id, 0]));

  let td: TienDoPhan = tienDoRong();
  ok(soLuotConLai(td) === SO_LUOT_MOI_CHU_KY,
    `mới vào có ${SO_LUOT_MOI_CHU_KY} lượt`, String(soLuotConLai(td)));

  for (let i = 1; i <= SO_LUOT_MOI_CHU_KY; i++) {
    td = capNhatSauLuot(td, nam, chamLuot(nam, truot));
    const conKhoaNgay = conKhoa(td);
    if (i < SO_LUOT_MOI_CHU_KY) {
      ok(!conKhoaNgay && !td.canOnLai, `trượt lượt ${i}/${SO_LUOT_MOI_CHU_KY} → chưa khóa`);
    } else {
      ok(conKhoaNgay && !!td.canOnLai,
        `trượt hết ${SO_LUOT_MOI_CHU_KY} lượt → khóa và bắt ôn lại`);
    }
  }

  const conLai = (td.khoaDenLuc! - Date.now()) / 60000;
  ok(conLai > PHUT_KHOA - 1 && conLai <= PHUT_KHOA,
    `khóa đúng ${PHUT_KHOA} phút`, conLai.toFixed(2) + ' phút');

  const sauOn = capLaiLuot(td);
  ok(soLuotConLai(sauOn) === SO_LUOT_MOI_CHU_KY && !conKhoa(sauOn) && !sauOn.canOnLai,
    'ôn lại xong → mở khóa, cấp lại đủ lượt');
  ok(sauOn.daGap.length === nam.length,
    'ôn lại KHÔNG xóa lịch sử câu đã gặp', `${sauOn.daGap.length} câu`);

  /* Đã đạt rồi thì luyện thêm bao nhiêu lượt cũng không được khóa ngược lại. */
  let daDat: TienDoPhan = tienDoRong();
  const dungHet = Object.fromEntries(nam.map(c => [c.id, 1]));
  daDat = capNhatSauLuot(daDat, nam, chamLuot(nam, dungHet));
  ok(daDat.dat, 'đạt lượt đầu → ghi nhận đã qua');
  for (let i = 0; i < SO_LUOT_MOI_CHU_KY + 2; i++) {
    daDat = capNhatSauLuot(daDat, nam, chamLuot(nam, truot));
  }
  ok(daDat.dat && !conKhoa(daDat),
    'đã đạt rồi thì làm lại thoải mái, không bị khóa ngược');

  /* Điểm cao nhất phải GIỮ, không bị lượt sau kém hơn ghi đè. */
  ok(daDat.tiLeCaoNhat === 1, 'giữ điểm cao nhất dù lượt sau kém hơn', String(daDat.tiLeCaoNhat));
}

// ─── Câu đã sai được nhớ và được quên đúng lúc ───────────────────────────────

console.log('\n== Ghi nhớ câu làm sai ==');
{
  const nam = [cauMC('a'), cauMC('b'), cauMC('c'), cauMC('d'), cauMC('e')];
  let td = tienDoRong();

  td = capNhatSauLuot(td, nam, chamLuot(nam, { a: 1, b: 1, c: 0, d: 0, e: 0 }));
  ok(td.daSai.sort().join(',') === 'c,d,e', 'nhớ đúng câu làm sai', td.daSai.join(','));

  /* Sửa được câu từng sai thì phải BỎ khỏi danh sách, không thì câu đó cứ quay
     lại mãi dù em đã nắm rồi. */
  td = capNhatSauLuot(td, nam, chamLuot(nam, { a: 1, b: 1, c: 1, d: 1, e: 0 }));
  ok(td.daSai.join(',') === 'e', 'làm đúng lại thì bỏ khỏi danh sách câu yếu', td.daSai.join(','));
}

// ─── Rút câu: ưu tiên câu chưa gặp ───────────────────────────────────────────

console.log('\n== Đổi câu khi làm lại ==');
{
  /* Kho 20 câu, mỗi lượt 5 câu → đủ 4 lượt hoàn toàn khác nhau. */
  const kho = Array.from({ length: 20 }, (_, i) => cauMC('q' + i));
  let td = tienDoRong();
  const daRa = new Set<string>();
  let trung = 0;

  for (let luot = 1; luot <= 4; luot++) {
    const bo = chonCauTuKho(kho, 'mc', td);
    ok(bo.length === 5, `lượt ${luot} rút đủ 5 câu`, String(bo.length));
    bo.forEach(c => { if (daRa.has(c.id)) trung++; daRa.add(c.id); });
    td = capNhatSauLuot(td, bo, chamLuot(bo, {}));
  }
  ok(trung === 0, 'kho 20 câu → 4 lượt không lặp lại câu nào', `${trung} câu trùng`);
  ok(daRa.size === 20, 'đi hết kho sau 4 lượt', String(daRa.size));

  /* Kho vừa đủ 1 lượt: lượt 2 buộc phải lặp, nhưng KHÔNG được gãy. */
  const khoMong = Array.from({ length: 5 }, (_, i) => cauMC('p' + i));
  let td2 = tienDoRong();
  const bo1 = chonCauTuKho(khoMong, 'mc', td2);
  td2 = capNhatSauLuot(td2, bo1, chamLuot(bo1, { p0: 1 }));
  const bo2 = chonCauTuKho(khoMong, 'mc', td2);
  ok(bo2.length === 5, 'kho mỏng vẫn rút đủ câu cho lượt sau', String(bo2.length));

  /* Kho thiếu thì trả rỗng chứ không rút thiếu câu — đề 3 câu mà ngưỡng tính
     trên 5 câu thì điểm phần trăm sai hết. */
  ok(chonCauTuKho(khoMong.slice(0, 3), 'mc', tienDoRong()).length === 0,
    'kho thiếu câu → trả rỗng, không rút đề non');

  ok(soLuotKhacNhau(20, 'mc') === 4, 'kho 20 câu nhiều lựa chọn = 4 lượt khác nhau');
  ok(soLuotKhacNhau(7, 'mc') === 1, 'kho 7 câu = 1 lượt khác nhau');
  ok(soLuotKhacNhau(8, 'tf') === 4, 'kho 8 câu đúng sai = 4 lượt khác nhau');
}

// ─── Mở khóa theo thứ tự phần ────────────────────────────────────────────────

console.log('\n== Thứ tự ba phần trong một bài ==');
{
  const duCau = { mc: 10, tf: 10, tn: 10 };
  const trong = {};

  ok(trangThaiPhan('mc', trong, duCau) === 'san-sang', 'phần đầu mở sẵn');
  ok(trangThaiPhan('tf', trong, duCau) === 'chua-mo', 'chưa qua phần 1 thì phần 2 khóa');
  ok(trangThaiPhan('tn', trong, duCau) === 'chua-mo', 'chưa qua phần 2 thì phần 3 khóa');

  const quaMC = { mc: { ...tienDoRong(), dat: true } };
  ok(trangThaiPhan('tf', quaMC, duCau) === 'san-sang', 'qua phần 1 → mở phần 2');
  ok(trangThaiPhan('tn', quaMC, duCau) === 'chua-mo', 'qua phần 1 chưa mở được phần 3');

  const quaHai = { ...quaMC, tf: { ...tienDoRong(), dat: true } };
  ok(trangThaiPhan('tn', quaHai, duCau) === 'san-sang', 'qua phần 2 → mở phần 3');

  const quaBa = { ...quaHai, tn: { ...tienDoRong(), dat: true } };
  ok(baiDaXong(quaBa), 'qua cả ba phần → bài hoàn thành');
  ok(!baiDaXong(quaHai), 'mới qua hai phần thì bài chưa xong');

  // Kho thiếu câu
  const thieu = { mc: 10, tf: 1, tn: 0 };
  ok(trangThaiPhan('tf', quaMC, thieu) === 'thieu-cau', 'kho thiếu câu → báo thiếu, không mở');
  ok(moTaThieuCau(thieu).includes('câu đúng sai'), 'mô tả đúng chỗ thiếu', moTaThieuCau(thieu));

  /* Em đã qua phần này từ hồi kho còn đủ câu, sau đó thầy cô xóa bớt câu — vẫn
     phải giữ thành tích của em. */
  const datNhungThieu = { tf: { ...tienDoRong(), dat: true } };
  ok(trangThaiPhan('tf', datNhungThieu, thieu) === 'da-dat',
    'đã đạt thì kho hụt câu sau đó cũng không mất thành tích');
}

console.log('\n== Xáo vị trí phương án ==');
{
  /* Trong kho, đáp án đúng rơi vào B ở 48% số câu trắc nghiệm, và ý đầu của câu
     đúng/sai là "Đúng" ở 74% (đo ngày 14/09/2026). Xáo lúc giao đề chữa chỗ đó,
     nhưng chỉ đúng khi đáp án đi theo phương án — sai chỗ này thì học sinh bị
     chấm sai mà điểm vẫn ra một con số trông hợp lý. */
  const goc = cauMC('mc-xao', 1);
  goc.o = ['ph.an A', 'ph.an B', 'ph.an C', 'ph.an D'];

  let giuDapAn = true;
  const demViTri = [0, 0, 0, 0];
  for (let i = 0; i < 400; i++) {
    const moi = xaoPhuongAnBank(goc);
    if (moi.o!.length !== 4 || new Set(moi.o).size !== 4) { giuDapAn = false; break; }
    if (moi.o![moi.a!] !== goc.o[goc.a!]) { giuDapAn = false; break; }
    demViTri[moi.a!]++;
  }
  ok(giuDapAn, 'xáo xong, `a` vẫn trỏ đúng nội dung phương án đúng');
  ok(demViTri.every(n => n > 40), 'đáp án rơi đều bốn vị trí, không dồn vào một chữ cái',
    demViTri.join(' / '));
  ok(goc.o[goc.a!] === 'ph.an B', 'câu gốc trong kho KHÔNG bị sửa tại chỗ');

  const tf = cauTF('tf-xao', [true, false, false, false]);
  let yDauLaDung = 0;
  let giuSoYDung = true;
  for (let i = 0; i < 400; i++) {
    const moi = xaoPhuongAnBank(tf);
    if (moi.st!.filter(y => y.v).length !== 1) { giuSoYDung = false; break; }
    if (moi.st![0].v) yDauLaDung++;
  }
  ok(giuSoYDung, 'câu đúng/sai giữ nguyên số ý đúng sau khi xáo');
  ok(yDauLaDung > 40 && yDauLaDung < 360, 'ý "Đúng" không còn nằm cố định ở vị trí đầu',
    `${yDauLaDung}/400 lượt ý đầu là Đúng`);

  const web: Question = {
    id: 'web-1', type: 'Trắc nghiệm', difficulty: 'Thấp', points: 1,
    content: 'Câu hỏi', images: [], correctAnswer: 'C', createdAt: '2026-09-16T00:00:00Z',
    options: [
      { key: 'A', text: 'nội dung A' }, { key: 'B', text: 'nội dung B' },
      { key: 'C', text: 'nội dung C' }, { key: 'D', text: 'nội dung D' },
    ],
  };
  let webOk = true;
  const demChu: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (let i = 0; i < 400; i++) {
    const moi = xaoPhuongAnWeb(web);
    const chu = moi.options.map(o => o.key).join('');
    const dung = moi.options.find(o => o.key === moi.correctAnswer);
    if (chu !== 'ABCD' || dung?.text !== 'nội dung C') { webOk = false; break; }
    demChu[moi.correctAnswer!]++;
  }
  ok(webOk, 'đề kiểm tra: chữ cái vẫn A, B, C, D và đáp án trỏ đúng nội dung cũ');
  ok(Object.values(demChu).every(n => n > 40), 'đề kiểm tra: đáp án rải đều bốn chữ cái',
    Object.entries(demChu).map(([k, v]) => `${k}:${v}`).join(' '));

  const tuLuan: Question = { ...web, type: 'Tự luận', options: [], correctAnswer: undefined };
  ok(xaoPhuongAnWeb(tuLuan) === tuLuan, 'câu tự luận trả về nguyên vẹn');
}

/* Mở khoá luyện tập bằng trò chơi (20/09/2026). Em bị khoá 15 phút vì trượt
   hết lượt; chơi xong một màn của đúng bài đó thì được cấp lượt mới ngay. */
console.log('\n== Mở khoá luyện tập bằng trò chơi ==');
{
  const td = (xong: boolean, luc?: number) =>
    ({ troChoi: { 'ran-va-thang': { '3': { xong, cauDung: 6, ...(luc ? { luc } : {}) } } } }) as any;
  ok(daChoiSauKhi(td(true, 1_000), 'ran-va-thang', 3, 500), 'chơi xong SAU khi bị khoá → được mở lại');
  ok(!daChoiSauKhi(td(true, 1_000), 'ran-va-thang', 3, 2_000), 'màn chơi từ trước lúc khoá KHÔNG mở khoá được');
  ok(!daChoiSauKhi(td(true, 1_000), 'ran-va-thang', 4, 500), 'chơi màn của bài khác thì không tính');
  ok(!daChoiSauKhi(td(false, 9_000), 'ran-va-thang', 3, 500), 'bỏ dở giữa chừng thì không tính');
  ok(!daChoiSauKhi(td(true), 'ran-va-thang', 3, 500), 'bản ghi cũ chưa có mốc thời gian thì không tính');
  ok(!daChoiSauKhi(null, 'ran-va-thang', 3, 500), 'chưa có tiến độ nào thì không tính');
}

/* Bài đã nộp lên Firestore (18/09/2026). Trước đó bài chỉ nằm trong
   localStorage của máy học sinh, và trang giáo viên đọc localStorage của máy
   GIÁO VIÊN — nên luôn trống mà không báo lỗi gì. */
console.log('\n== Bài nộp lên Firestore ==');
{
  const goc = {
    id: 'quiz_1', lessonId: 'b1', chapterId: 'c1', userEmail: '  HS@Truong.Local ',
    questions: [{ id: 'q1', type: 'Trắc nghiệm', content: 'x', points: 1, image: undefined }],
    answers: { q1: 'A' }, status: 'submitted', score: 1, maxScore: 1,
    createdAt: '2026-09-18T00:00:00Z', expiresAt: '2026-09-19T00:00:00Z',
    results: { q1: { questionId: 'q1', score: 1, maxScore: 1, correct: true, studentAnswer: 'A', correctAnswer: 'A', feedback: 'ok', confidence: 'high' } },
  } as unknown as Quiz;
  const ra = chuanBiBaiNop(goc);
  ok(ra.userEmail === 'hs@truong.local', 'email về chữ thường, bỏ khoảng trắng (luật so với token Auth)');
  ok(!('image' in ra.questions[0]), 'không còn trường undefined (Firestore từ chối nó)');
  ok(goc.userEmail === '  HS@Truong.Local ' && 'image' in goc.questions[0], 'không sửa đối tượng gốc');
  ok(ra.results?.q1.score === 1 && ra.answers.q1 === 'A', 'giữ nguyên điểm và câu trả lời');

  // Bắt CHỖ GỌI và dòng import, không bắt chữ trong chú thích giải thích lịch sử.
  const dungQuizStorage = /QuizStorage\s*\.|from\s+['"][^'"]*quizStorage['"]/;
  const tab = readFileSync('src/features/teacher/components/QuizProgressTab.tsx', 'utf8');
  ok(!dungQuizStorage.test(tab), 'trang giáo viên KHÔNG đọc QuizStorage (đó là localStorage của máy giáo viên)');
  const ctx = readFileSync('src/core/contexts/AppContext.tsx', 'utf8');
  const dau = ctx.indexOf('const updateQuizEssayScore');
  const cham = ctx.slice(dau, ctx.indexOf('\n  };', dau));
  ok(dau > 0 && /docBaiNop\(/.test(cham) && /ghiDiemChamLai\(/.test(cham) && !dungQuizStorage.test(cham),
    'chấm lại tự luận đọc và ghi Firestore, không đụng localStorage');
  const nop = readFileSync('src/features/quiz/quizService.ts', 'utf8');
  ok(/luuBaiNop\(updatedQuiz\)/.test(nop), 'nộp bài xong có đẩy bản sao lên Firestore');
}

/* Màn theo dõi (18/09/2026). QuizProgressTab từng được sửa cho đọc Firestore mà
   KHÔNG trang nào gắn nó vào; còn "Học bạ thông minh" của học sinh hiện hai
   dòng điểm gõ cứng. Cả hai sẽ bị chụp vào báo cáo NCKH. */
console.log('\n== Màn theo dõi dùng số liệu thật ==');
{
  const gv = readFileSync('src/pages/TeacherPage.tsx', 'utf8');
  ok(/progressContent=\{<TheoDoiHocSinh\b/.test(gv), 'trang giáo viên có gắn mục "Theo dõi học sinh"');
  const td = readFileSync('src/features/teacher/components/TheoDoiHocSinh.tsx', 'utf8');
  ok(/<QuizProgressTab\b/.test(td) && /<ProgressChatsTab\b/.test(td), 'mục đó dựng cả bài kiểm tra lẫn hội thoại AI');
  const hs = readFileSync('src/features/student/components/StudentArea.tsx', 'utf8');
  ok(!/Fake data for demo|>\s*(9\.5|7\.0)\s*</.test(hs) && /baiDaNop\.map\(/.test(hs),
    'học bạ học sinh không còn điểm gõ cứng, liệt kê bài đã nộp thật');
  // Nút "Đánh dấu Xong" duy nhất gắn với bài thật nằm sau tab bị ẩn, nên
  // "Bài học đã hoàn thành" từng luôn 0. Nay đạt 7/10 bài kiểm tra là xong bài.
  const qp = readFileSync('src/pages/QuizPage.tsx', 'utf8');
  ok(/percent >= 70[\s\S]{0,700}basicCompleted = true/.test(qp), 'bài kiểm tra đạt 7/10 đánh dấu bài học hoàn thành');
}

console.log(hong === 0
  ? '\n✅ Tất cả phép thử đều đạt.\n'
  : `\n❌ ${hong} phép thử HỎNG.\n`);
process.exit(hong === 0 ? 0 : 1);
