/**
 * Kiểm chuỗi dự phòng của gia sư AI (01/10/2026).
 *
 * Chạy:  npm run kiem-tra:du-phong
 * Không gọi mạng, không tốn lượt API: model, đồng hồ, bộ nhớ trình duyệt đều giả.
 *
 * Canh ba điều mà mắt thường không thấy: (1) model hết lượt NGÀY bị bỏ qua tới
 * đúng nửa đêm giờ Thái Bình Dương rồi được thử lại; (2) khoá riêng của em
 * không bị tiêu khi chỉ hết lượt PHÚT; (3) lỗi App Check thì dừng ngay, không
 * gõ cửa thêm model nào.
 */
import { phanLoaiLoiGemini, ngayTheoMuiGio, taoKhoHet, KHOA_KHO_HET } from '../src/features/tutor/services/hetLuotMoHinh';
import { GEMINI_XOAY } from '../src/features/tutor/services/danhSachMoHinh';
import { GEMINI_MODEL_NAME } from '../src/core/constants';
import { goiTheoChuoi, type BuocGoi, type MoiTruongChuoi } from '../src/features/tutor/services/chuoiDuPhong';
import { thongBaoHetLuot, thongBaoLoiKetNoi } from '../src/features/tutor/services/geminiTutorService';
import { loiThanhChuoi } from '../src/features/tutor/services/loiGemini';

let hong = 0;
const ok = (dieu: boolean, ten: string, chiTiet = '') => {
  if (!dieu) hong++;
  console.log(`  ${dieu ? 'OK  ' : 'SAI '} ${ten}${chiTiet ? '  — ' + chiTiet : ''}`);
};

/** Bộ nhớ trình duyệt giả: đủ hai hàm mà kho dùng. */
const luuTruGia = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, m };
};

/* Lỗi dựng theo đúng dạng `loiThanhChuoi` trả về cho firebase/ai (message +
   JSON customErrorData) — xem kiem-tra-het-luot.mts. */
const LOI_NGAY = 'AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/giasuhoa11/models/gemini-3.6-flash:generateContent: [429 Too Many Requests] You exceeded your current quota. (AI/fetch-error) {"status":429,"errorDetails":[{"violations":[{"quotaId":"GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}]}';
const LOI_PHUT = LOI_NGAY.replace('PerDay', 'PerMinute');
const LOI_404 = 'AI: Error fetching from https://firebasevertexai.googleapis.com/v1beta/projects/giasuhoa11/models/gemini-x:generateContent: [404 Not Found] models/gemini-x is not found (AI/fetch-error)';
const LOI_503 = 'AI: Error fetching from https://firebasevertexai.googleapis.com/...: [503 Service Unavailable] The model is overloaded due to high demand (AI/fetch-error)';
const LOI_APPCHECK = 'AppCheck: Requests throttled due to 403 error. Attempts allowed again after 23h:59m (appCheck/initial-throttle).';

console.log('\n== Đọc loại lỗi ==');
ok(phanLoaiLoiGemini(LOI_NGAY) === 'het-ngay', 'hết lượt NGÀY');
ok(phanLoaiLoiGemini(LOI_PHUT) === 'het-phut', 'hết lượt PHÚT');
ok(phanLoaiLoiGemini(LOI_404) === 'mo-hinh-hong', 'model không tồn tại (404)');
ok(phanLoaiLoiGemini(LOI_503) === 'may-chu', 'máy chủ quá tải (503)');
ok(phanLoaiLoiGemini(LOI_APPCHECK) === 'app-check', 'App Check bị khoá');
ok(phanLoaiLoiGemini('AbortError: signal timed out') === 'qua-han', 'quá hạn chờ');
ok(phanLoaiLoiGemini('TypeError: Failed to fetch') === 'mang', 'rớt mạng');
ok(phanLoaiLoiGemini('API key not valid. Please pass a valid API key.') === 'khac', 'khoá sai không bị coi là hết lượt');
ok(phanLoaiLoiGemini('[400 Bad Request] Request contains an invalid argument.') === 'khac',
   '400 do chính yêu cầu (không riêng model nào): KHÔNG xếp vào mo-hinh-hong — sửa theo soát Việc 3');

console.log('\n== Ngày theo giờ Thái Bình Dương (hạn mức hồi lại lúc nửa đêm ở đó) ==');
ok(ngayTheoMuiGio(new Date('2026-10-02T06:59:59Z')) === '2026-10-01', 'mùa hè: 13:59:59 giờ VN vẫn là ngày cũ');
ok(ngayTheoMuiGio(new Date('2026-10-02T07:00:00Z')) === '2026-10-02', 'mùa hè: 14:00 giờ VN sang ngày mới');
ok(ngayTheoMuiGio(new Date('2026-12-01T07:59:00Z')) === '2026-11-30', 'mùa đông: 14:59 giờ VN vẫn là ngày cũ');
ok(ngayTheoMuiGio(new Date('2026-12-01T08:00:00Z')) === '2026-12-01', 'mùa đông: 15:00 giờ VN sang ngày mới');

console.log('\n== Kho nhớ model đã hết lượt ==');
{
  const lt = luuTruGia();
  const kho = taoKhoHet(lt);
  const sang = new Date('2026-10-01T16:00:00Z');   // 09:00 Pacific ngày 01/10
  ok(kho.conDung('firebase', 'm1', sang), 'chưa đánh dấu thì còn dùng');
  kho.danhDau('firebase', 'm1', sang);
  ok(!kho.conDung('firebase', 'm1', new Date('2026-10-02T06:00:00Z')), 'đánh dấu xong: cả phần còn lại của ngày đó là chết');
  ok(kho.conDung('firebase', 'm1', new Date('2026-10-02T07:00:00Z')), 'qua nửa đêm Pacific thì sống lại');
  ok(kho.conDung('khoa', 'm1', sang), 'hạn mức khoá riêng của em tách khỏi hạn mức của web');
  kho.danhDau('firebase', 'm2', new Date('2026-10-03T16:00:00Z'));
  ok(!(lt.getItem(KHOA_KHO_HET) ?? '').includes('m1'), 'dấu của ngày cũ bị dọn khi ghi dấu mới');
  const hong1 = taoKhoHet({ getItem: () => '{không phải json', setItem: () => { throw new Error('đầy'); } });
  ok(hong1.conDung('firebase', 'm1', sang), 'bộ nhớ hỏng thì coi như còn dùng, không ném lỗi');
  hong1.danhDau('firebase', 'm1', sang);
  ok(taoKhoHet(null).conDung('firebase', 'm1', sang), 'không có localStorage (Node) vẫn chạy');
}

console.log('\n== Danh sách model xoay vòng ==');
ok(GEMINI_XOAY.length >= 4, `có ít nhất 4 model dự phòng (đang có ${GEMINI_XOAY.length})`);
ok(!GEMINI_XOAY.includes(GEMINI_MODEL_NAME), 'model chính không nằm lại trong danh sách xoay');
ok(GEMINI_XOAY.every(m => /^gemini-3/.test(m)), 'chỉ đời 3.x (nhận thinkingLevel như model chính)');
ok(new Set(GEMINI_XOAY).size === GEMINI_XOAY.length, 'không trùng tên');

console.log('\n== Gọi theo chuỗi ==');
{
  let gio = Date.parse('2026-10-01T16:00:00Z');            // 09:00 Pacific
  const moiTruong = (): MoiTruongChuoi => ({
    kho: taoKhoHet(luuTruGia()), bayGio: () => gio, nghiPhut: new Map(), tongHanMs: 90_000,
  });
  /** Bước giả: lần gọi thứ i làm theo hanhVi[i] (hết mảng thì lặp phần tử cuối). */
  const buoc = (ten: string, hanhVi: ('ok' | string)[], nhat: string[], them: Partial<BuocGoi> = {}): BuocGoi => {
    let lan = 0;
    return {
      duong: 'xoay-gemini', nhaCungCap: 'gemini-firebase', maMoHinh: ten, vung: 'firebase', ...them,
      goi: async (chiThi) => {
        nhat.push(ten + (chiThi ? '+chiThi' : ''));
        const h = hanhVi[Math.min(lan++, hanhVi.length - 1)];
        if (h === 'ok') return `trả lời của ${ten}`;
        throw new Error(h);
      },
    };
  };
  const thu = async (f: () => Promise<unknown>) => { try { await f(); return null; } catch (e) { return e; } };

  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', ['ok'], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.duong === 'chinh' && kq.maMoHinh === 'chinh' && nhat.join() === 'chinh',
       'ngày thường: chỉ gọi model chính, một lần');
  }
  {
    const mt = moiTruong();
    const nhat: string[] = [];
    const cacBuoc = [buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)];
    const kq = await goiTheoChuoi(cacBuoc, mt);
    ok(kq.maMoHinh === 'a' && kq.duong === 'xoay-gemini' && nhat.join() === 'chinh,a',
       'model chính hết lượt NGÀY thì lặng lẽ sang model kế');
    nhat.length = 0;
    await goiTheoChuoi(cacBuoc, mt);
    ok(nhat.join() === 'a', 'lượt sau cùng ngày: KHÔNG gõ cửa model đã chết nữa', nhat.join());
    gio = Date.parse('2026-10-02T07:00:00Z');               // nửa đêm Pacific
    nhat.length = 0;
    await goiTheoChuoi(cacBuoc, mt);
    ok(nhat[0] === 'chinh', 'qua nửa đêm Pacific: thử lại model chính', nhat.join());
    gio = Date.parse('2026-10-01T16:00:00Z');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_503], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.maMoHinh === 'a', 'máy chủ quá tải (503) thì sang model kế');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_404], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    ok(kq.maMoHinh === 'a', 'model không tồn tại (404) thì sang model kế');
  }
  {
    const nhat: string[] = [];
    const loi = await thu(() => goiTheoChuoi([
      buoc('chinh', [LOI_APPCHECK], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat),
    ], moiTruong()));
    ok(loi !== null && nhat.join() === 'chinh', 'App Check hỏng thì DỪNG, không gõ cửa model nào nữa');
  }
  {
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const loi = await thu(() => goiTheoChuoi([
      buoc('chinh', [LOI_PHUT], nhat, { duong: 'chinh' }), buoc('a', [LOI_NGAY], nhat), buoc('k', ['ok'], nhat, khoa),
    ], moiTruong()));
    ok(loi !== null && !nhat.includes('k'), 'chỉ hết lượt PHÚT thì KHÔNG tiêu khoá riêng của em', nhat.join());
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('mỗi phút'), 'và học sinh được bảo chờ một phút');
  }
  {
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const kq = await goiTheoChuoi([
      buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', [LOI_NGAY], nhat), buoc('k', ['ok'], nhat, khoa),
    ], moiTruong());
    ok(kq.duong === 'khoa-rieng' && kq.nhaCungCap === 'gemini-khoa-rieng',
       'mọi model chung hết lượt NGÀY thì mới dùng khoá riêng của em');
  }
  {
    /* Soát Việc 3: cổng khoá riêng rò ở 503/400 — "chỉ nghỉ phút" cũ không
       bắt được ca này vì 503/400 không hề đụng tới nghỉ phút. Gate đúng phải
       xét MỌI model chung còn sống trong kho (`conDung`), không chỉ xét
       "có đang nghỉ phút không". */
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const loi = await thu(() => goiTheoChuoi([
      buoc('chinh', [LOI_503], nhat, { duong: 'chinh' }), buoc('a', [LOI_503], nhat), buoc('k', ['ok'], nhat, khoa),
    ], moiTruong()));
    ok(loi !== null && !nhat.includes('k'),
       'máy chủ quá tải (503) ở mọi model chung: KHÔNG tiêu khoá riêng (chưa model nào chết trong kho)', nhat.join());
  }
  {
    /* Thứ tự trong `cacBuoc` không được quyết định gate: khoá riêng đứng
       NGAY ĐẦU mảng, trước cả model chung còn sống, vẫn phải bị chặn. */
    const nhat: string[] = [];
    const khoa = { duong: 'khoa-rieng' as const, nhaCungCap: 'gemini-khoa-rieng' as const, vung: 'khoa' as const, chiKhiChungHetNgay: true };
    const kq = await goiTheoChuoi([
      buoc('k', ['ok'], nhat, khoa), buoc('chinh', ['ok'], nhat, { duong: 'chinh' }),
    ], moiTruong());
    ok(kq.duong === 'chinh' && !nhat.includes('k'),
       'khoá riêng đứng ĐẦU mảng mà model chung còn sống: vẫn không được gọi trước nó', nhat.join());
  }
  {
    const mt = moiTruong();
    mt.kho.danhDau('firebase', 'chinh', new Date(gio));
    mt.kho.danhDau('firebase', 'a', new Date(gio));
    const nhat: string[] = [];
    const loi = await thu(() => goiTheoChuoi([buoc('chinh', ['ok'], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], mt));
    ok(loi !== null && nhat.length === 0, 'mọi model đã chết từ trước: không gọi ai cả');
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('toàn hệ thống'), 'và học sinh nhận đúng câu hết lượt trong ngày');
  }
  {
    const nhat: string[] = [];
    const kq = await goiTheoChuoi([buoc('chinh', [LOI_NGAY], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], moiTruong());
    await kq.goiLai('đừng nêu đáp số');
    ok(nhat.at(-1) === 'a+chiThi', 'lượt sinh lại của bộ chặn rò đi thẳng vào ĐÚNG model vừa trả lời', nhat.join());
  }
  {
    const nhat: string[] = [];
    const cham: BuocGoi = {
      duong: 'chinh', nhaCungCap: 'gemini-firebase', maMoHinh: 'chinh', vung: 'firebase',
      goi: async () => { nhat.push('chinh'); gio += 85_000; throw new Error(LOI_NGAY); },
    };
    const loi = await thu(() => goiTheoChuoi([cham, buoc('a', ['ok'], nhat)], moiTruong()));
    ok(loi !== null && nhat.join() === 'chinh', 'model chính ngốn 85 s rồi mới hỏng: không gọi thêm lượt chắc chắn quá hạn');
    /* Soát Việc 3: dừng vì HẾT HẠN phải nói đúng là quá hạn (chữ "timeout"),
       không phải lặp lại lỗi (có khi đã cũ) của bước trước — để
       `thongBaoLoiKetNoi` bảo em GỬI LẠI, không doạ hết lượt trong ngày. */
    ok(thongBaoLoiKetNoi(loiThanhChuoi(loi)).includes('gửi lại'),
       'và học sinh được bảo gửi lại câu hỏi, không phải bị doạ hết lượt', loiThanhChuoi(loi));
    gio = Date.parse('2026-10-01T16:00:00Z');
  }
  {
    let hanNhan = 0;
    const b: BuocGoi = {
      duong: 'chinh', nhaCungCap: 'gemini-firebase', maMoHinh: 'chinh', vung: 'firebase',
      goi: async (_c, han) => { hanNhan = han; return 'x'; },
    };
    await goiTheoChuoi([b], moiTruong());
    ok(hanNhan === 90_000, 'model chính vẫn được chờ đủ 90 giây như trước', String(hanNhan));
  }
  {
    /* Soát Việc 3: mọi bước đang nghỉ PHÚT (chưa ai hỏng hẳn, chỉ đang chờ)
       thì không gọi ai, và câu báo phải là "chờ một phút", không phải
       "hết lượt cả ngày" — khác hẳn trường hợp bị đánh dấu chết trong kho. */
    const mt = moiTruong();
    mt.nghiPhut.set('firebase:chinh', gio + 30_000);
    mt.nghiPhut.set('firebase:a', gio + 30_000);
    const nhat: string[] = [];
    const loi = await thu(() => goiTheoChuoi([buoc('chinh', ['ok'], nhat, { duong: 'chinh' }), buoc('a', ['ok'], nhat)], mt));
    ok(loi !== null && nhat.length === 0, 'mọi bước đang nghỉ phút từ trước: không gọi ai cả', nhat.join());
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('mỗi phút'), 'và học sinh được bảo chờ một phút, không phải hết lượt cả ngày');
  }
  {
    /* Mảng rỗng: không có bước nào để thử cũng phải báo lỗi (hết lượt toàn
       hệ thống), không được treo hay trả `undefined`. */
    const loi = await thu(() => goiTheoChuoi([], moiTruong()));
    ok(loi !== null, 'mảng bước rỗng: vẫn phải báo lỗi, không treo');
    ok(thongBaoHetLuot(loiThanhChuoi(loi)).includes('toàn hệ thống'), 'và đúng câu hết lượt toàn hệ thống');
  }
}

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
