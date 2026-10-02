// ─── Chạy BÓNG bộ phân loại ý định trên trình duyệt (02/10/2026) ────────────
//
// Nạp mô hình MỘT lần rồi đoán ý định tin nhắn của em, để GHI vào `chats`.
// Đây là phép đo cho đề tài, không phải tính năng: mọi lỗi — chưa có mô hình,
// mạng chậm, tệp hỏng — đều bỏ qua lặng lẽ, gia sư chạy y như chưa có tệp này.
//
// Mô hình nằm ở `public/mo-hinh/` (cùng nguồn, CSP `connect-src 'self'` đã cho
// phép). Nhóm huấn luyện lại thì chỉ thay tệp, không phải sửa mã.
import { duDoanYDinh, laMoHinhHopLe, type MoHinhYDinh } from './phanLoaiYDinh';

const DUONG_MO_HINH = '/mo-hinh/phan-loai-y-dinh.json';
/** Chờ nạp tối đa chừng này rồi thôi — không được làm chậm tin nhắn của em. */
const HAN_NAP_MS = 1_500;

let dangNap: Promise<MoHinhYDinh | null> | null = null;

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
  const m = await Promise.race([
    napMoHinh(),
    new Promise<null>((r) => setTimeout(() => r(null), HAN_NAP_MS)),
  ]);
  if (!m) return undefined;
  const kq = duDoanYDinh(m, noiDung);
  return { y_dinh: kq.nhan, y_dinh_xs: Math.round(kq.xacSuat * 1000) / 1000, y_dinh_phien_ban: m.phien_ban };
}
