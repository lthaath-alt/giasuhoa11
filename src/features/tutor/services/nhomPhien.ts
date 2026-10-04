/* Gom tin chat thành từng phiên để khung chat gập được phần cũ (03/10/2026).

   Chỉ dựng lại cách HIỂN THỊ, không đổi dữ liệu: dùng `session_id` mà
   telemetryService đã ghi (đổi khi xong bài hoặc ngừng 30 phút). Tin lưu trước
   14/09/2026 không có trường này thì gom theo ngày của `timestamp`.
   Hàm thuần, không đụng React hay Firestore — `kiem-tra:su-pham` chạy thẳng. */

export interface TinCoThoiGian {
  timestamp: string;
  session_id?: string;
}

export interface NhomTin<T> {
  /** Khoá ổn định của nhóm, dùng làm `key` khi render */
  khoa: string;
  /** true: gom theo session_id; false: tin cũ, gom theo ngày */
  theoPhien: boolean;
  /** Thời điểm tin đầu tiên của nhóm (ms), NaN nếu timestamp hỏng */
  batDau: number;
  tin: T[];
}

const THU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const hai = (n: number) => String(n).padStart(2, '0');

/** Ngày theo giờ máy của em (không theo UTC), để tin lúc 0 giờ 30 không rơi sang hôm trước. */
function khoaNgay(ms: number): string {
  if (Number.isNaN(ms)) return 'ngay:khong-ro';
  const d = new Date(ms);
  return `ngay:${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}

/**
 * Gom các tin LIỀN NHAU cùng phiên (hoặc cùng ngày, với tin không có phiên).
 * Giữ nguyên thứ tự vào; mảng vào đã xếp theo thời gian như Firestore trả.
 */
export function nhomTheoPhien<T extends TinCoThoiGian>(tin: readonly T[]): NhomTin<T>[] {
  const ra: NhomTin<T>[] = [];
  let khoaTruoc: string | null = null;
  for (const m of tin) {
    const ms = Date.parse(m.timestamp);
    const khoa = m.session_id ? `phien:${m.session_id}` : khoaNgay(ms);
    if (khoa !== khoaTruoc) {
      /* Cùng một phiên có thể xuất hiện lại sau một nhóm khác: thêm số thứ tự
         để `key` không trùng. */
      ra.push({ khoa: `${khoa}#${ra.length}`, theoPhien: !!m.session_id, batDau: ms, tin: [] });
      khoaTruoc = khoa;
    }
    ra[ra.length - 1].tin.push(m);
  }
  return ra;
}

/** Nhãn vạch phiên: "Thứ Bảy 03/10 · 13:05 · 12 tin". Nhóm theo ngày thì không ghi giờ. */
export function nhanNhom(nhom: NhomTin<unknown>): string {
  const soTin = `${nhom.tin.length} tin`;
  if (Number.isNaN(nhom.batDau)) return `Không rõ ngày · ${soTin}`;
  const d = new Date(nhom.batDau);
  const ngay = `${THU[d.getDay()]} ${hai(d.getDate())}/${hai(d.getMonth() + 1)}`;
  return nhom.theoPhien
    ? `${ngay} · ${hai(d.getHours())}:${hai(d.getMinutes())} · ${soTin}`
    : `${ngay} · ${soTin}`;
}
