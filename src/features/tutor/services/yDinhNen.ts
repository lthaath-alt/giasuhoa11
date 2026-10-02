// ─── Chạy BÓNG bộ phân loại ý định trên trình duyệt (02/10/2026) ────────────
//
// Nạp mô hình MỘT lần rồi đoán ý định tin nhắn của em, để GHI vào `chats`.
// Đây là phép đo cho đề tài, không phải tính năng: mọi lỗi — chưa có mô hình,
// mạng chậm, tệp hỏng — đều bỏ qua lặng lẽ, gia sư chạy y như chưa có tệp này.
//
// Mô hình nằm ở `public/mo-hinh/` (cùng nguồn, CSP `connect-src 'self'` đã cho
// phép). Nhóm huấn luyện lại thì chỉ thay tệp, không phải sửa mã.
//
// CHỈ CHỜ TỐI ĐA 1,5 s MỘT LẦN CHO CẢ PHIÊN TRANG (sửa vòng 1, điểm QUAN
// TRỌNG): bản đầu cho MỖI `addMessage` race lại 1,5 s với `napMoHinh()`. Nếu
// mạng/tệp mô hình bị treo (không bao giờ resolve, không timeout riêng của
// nó), `dangNap` không bao giờ settle — thì MỌI tin nhắn của em, suốt cả
// phiên, đều phải chờ thêm 1,5 s mới hiện bong bóng chat. Không được làm chậm
// tin nhắn của em: nay chỉ LẦN GỌI ĐẦU của trang mới chờ race; mạng chậm thì
// vài tin đầu của phiên thiếu `y_dinh` — chấp nhận được, đây là phép đo chạy
// bóng cho đề tài, không phải tính năng quyết định hành vi gia sư.
import { duDoanYDinh, laMoHinhHopLe, type MoHinhYDinh } from './phanLoaiYDinh';

const DUONG_MO_HINH = '/mo-hinh/phan-loai-y-dinh.json';
/** Chờ nạp tối đa chừng này rồi thôi — không được làm chậm tin nhắn của em. */
const HAN_NAP_MS = 1_500;

let dangNap: Promise<MoHinhYDinh | null> | null = null;
/** Mô hình đã nạp xong và hợp lệ, sẵn để đoán ngay — null nếu chưa nạp xong lần đầu, nạp hỏng, hoặc hết giờ. */
let moHinhSan: MoHinhYDinh | null = null;
/** Đã qua lượt chờ đầu tiên của trang (thành công hay thất bại) — các lượt gọi SAU chỉ đọc `moHinhSan`, không chờ gì nữa. */
let daHetCho = false;

function napMoHinh(): Promise<MoHinhYDinh | null> {
  dangNap ??= fetch(DUONG_MO_HINH)
    .then(async (r) => {
      /* Chưa có tệp thì luật SPA (`_redirects`) trả index.html kèm 200 — phải
         nhìn kiểu nội dung, không tin mã 200. */
      if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return null;
      const m: unknown = await r.json();
      return laMoHinhHopLe(m) ? m : null;
    })
    .catch(() => null);
  return dangNap;
}

export interface NhanYDinhGhi {
  y_dinh: string;
  /** Xác suất nhãn đoán, làm tròn 3 chữ số */
  y_dinh_xs: number;
  y_dinh_phien_ban: string;
}

export async function doanYDinhNen(noiDung: string): Promise<NhanYDinhGhi | undefined> {
  if (!daHetCho) {
    /* Chỉ lần gọi ĐẦU TIÊN của cả phiên trang mới chờ race 1,5 s. Mọi lượt
       gọi sau — kể cả khi `napMoHinh()` vẫn còn treo — đọc thẳng `moHinhSan`
       (dù null), KHÔNG chờ lại. */
    let hetGio: ReturnType<typeof setTimeout> | undefined;
    const m = await Promise.race([
      napMoHinh(),
      new Promise<null>((r) => { hetGio = setTimeout(() => r(null), HAN_NAP_MS); }),
    ]);
    clearTimeout(hetGio);
    moHinhSan = m;
    daHetCho = true;
    /* Lần nạp đầu hỏng (hết giờ, lỗi mạng, tệp sai hình dạng) thì CỐ Ý KHÔNG
       thử lại cho tới khi tải lại trang (reload mới khởi tạo lại `dangNap`/
       `moHinhSan`/`daHetCho` về trạng thái ban đầu) — tránh mỗi tin nhắn kế
       tiếp lại gõ cửa một tệp vừa biết là hỏng hoặc đang treo. */
  }
  if (!moHinhSan) return undefined;
  const kq = duDoanYDinh(moHinhSan, noiDung);
  return { y_dinh: kq.nhan, y_dinh_xs: Math.round(kq.xacSuat * 1000) / 1000, y_dinh_phien_ban: moHinhSan.phien_ban };
}

/** Chỉ dùng trong scripts/kiem-tra-phan-loai.mts: xoá trạng thái module-level để mỗi ca kiểm bắt đầu từ đầu, như vừa tải lại trang. */
export function datLaiYDinhNenChoKiemTra(): void {
  dangNap = null;
  moHinhSan = null;
  daHetCho = false;
}
