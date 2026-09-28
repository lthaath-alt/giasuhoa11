/**
 * KIỂU CỦA MỘT KỊCH BẢN THÍ NGHIỆM 3D.
 *
 * Mỗi thí nghiệm trong `thiNghiemTheoBai.ts` có thể gắn một kịch bản: danh sách
 * BƯỚC (đúng thứ tự thao tác trong SGK) và một hàm vẽ. Hàm vẽ nhận số bước hiện
 * tại + tiến độ trong bước (0→1) rồi tự suy ra màu dung dịch, mức chất lỏng,
 * lượng khí… nên tua tới lui bước nào cũng ra đúng cảnh của bước đó.
 *
 * Trạng thái `tt` chỉ giữ thứ KHÔNG suy lại được: các đợt hạt đang bay (bọt
 * khí, khói, kết tủa). Lùi bước hoặc bấm Làm lại thì khung chạy gọi `tao()` để
 * dựng lại từ đầu.
 *
 * Phần chữ (hiện tượng, phương trình) đi kèm kịch bản chứ không nằm trong hàm
 * vẽ: học sinh đọc được cả khi tắt hiệu ứng chuyển động.
 */
import { Camera, Chieu, V3 } from './dungCu3d';
import { MoPhong } from '../../thiNghiemTheoBai';

export interface Buoc {
  /** Tên bước, hiện trên dải chọn bước. */
  nhan: string;
  /** Thời lượng khi chạy tự động, tính bằng giây. */
  giay: number;
  /** Quan sát được gì ở bước này — hiện dưới khung hình. */
  hienTuong: string;
}

export interface KhungVe<S = unknown> {
  ctx: CanvasRenderingContext2D;
  W: number; H: number;
  /** Giây trôi qua từ khung hình trước; bằng 0 khi người dùng tắt chuyển động. */
  dt: number;
  cam: Camera;
  /** Chiếu điểm 3D của cảnh xuống canvas. */
  P: Chieu;
  /** Số px cho một đơn vị cảnh ở gần tâm. */
  S: number;
  buoc: number;
  /** Tiến độ trong bước hiện tại, 0→1. */
  tienDo: number;
  /** Giây đã trôi trong bước hiện tại. */
  tGiay: number;
  /** Giây đã trôi từ đầu kịch bản — dùng cho lửa rung, hạt lắc. */
  tong: number;
  /** Người dùng bật "giảm chuyển động": vẽ cảnh tĩnh của bước, không animation. */
  tinh: boolean;
  tt: S;
}

export interface KichBan<S = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Trùng với `moPhong` của thí nghiệm trong thiNghiemTheoBai.ts. */
  id: MoPhong;
  /** Bài trong chương trình, ví dụ 'bai-7'. */
  baiId: string;
  ten: string;
  /** Nhãn ngắn hiện cạnh tiêu đề, ví dụ 'Bài 7'. */
  nhan: string;
  /** Phương trình hoá học của thí nghiệm, hiện dưới khung hình. */
  ptHoaHoc: string[];
  /** Mô tả cho người dùng trình đọc màn hình. */
  moTaAria: string;
  buoc: Buoc[];
  cam?: Camera;
  /** Hệ số phóng to cảnh; > 1 là kéo lại gần. Cảnh rộng (nhiều dụng cụ đứng
   *  cạnh nhau) để < 1 cho khỏi cắt mép. Bỏ trống = 1. */
  phong?: number;
  /** Chỗ đặt gốc toạ độ theo chiều dọc khung hình (0 = sát mép trên).
   *  Bỏ trống = 0,45: chừa chỗ bên dưới cho đèn cồn và mặt bàn. */
  cy?: number;
  tao: () => S;
  ve: (k: KhungVe<S>) => void;
}

/** Giữ kiểu trạng thái riêng của từng kịch bản mà vẫn xếp chung một danh sách. */
export const dinhNghia = <S,>(k: KichBan<S>): KichBan => k as KichBan;

/** Vị trí giữa hai điểm — dùng cho thứ đang được dời chỗ theo tiến độ bước. */
export const giua = (a: V3, b: V3, k: number): V3 => {
  const t = Math.max(0, Math.min(1, k));
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
};
