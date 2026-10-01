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

console.log('\n' + (hong === 0 ? '>>> TẤT CẢ ĐẠT' : `>>> CÓ ${hong} MỤC KHÔNG ĐẠT`) + '\n');
process.exit(hong === 0 ? 0 : 1);
