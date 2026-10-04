/* "Ẩn khỏi màn hình" thay cho "Xóa lịch sử chat" (03/10/2026).

   Nút cũ xóa thật tài liệu `chats` trên Firestore, tức là xóa luôn số liệu
   thực nghiệm của đề tài. Nay chỉ ghi một MỐC THỜI GIAN vào localStorage của
   máy này: tin có timestamp tới mốc đó không hiện nữa, và cũng không gửi kèm
   làm ngữ cảnh cho gia sư — để gia sư "quên" như sau khi xóa ở bản cũ.
   Tin vẫn nằm nguyên trên Firestore; thầy cô vẫn xem được.

   Khoá localStorage mang mã tài khoản (uid Auth), không mang email hay tên. */

export interface TinCoMoc {
  timestamp: string;
}

const TIEN_TO = 'h11_an_chat';

/** Khoá localStorage cho (tài khoản, bài). Khách vãng lai dùng chung chữ "khach". */
export function khoaAnTin(maTaiKhoan: string | undefined, lessonId: string): string {
  return `${TIEN_TO}:${maTaiKhoan || 'khach'}:${lessonId}`;
}

/** Mốc đã ẩn (ms), hoặc null. localStorage hỏng hay bị chặn thì coi như chưa ẩn. */
export function docMocAn(khoa: string): number | null {
  try {
    const v = localStorage.getItem(khoa);
    const ms = v === null ? NaN : Number(v);
    return Number.isFinite(ms) ? ms : null;
  } catch {
    return null;
  }
}

/** Ghi mốc mới, hoặc xóa mốc khi `ms` là null. Trả false nếu máy không cho ghi. */
export function ghiMocAn(khoa: string, ms: number | null): boolean {
  try {
    if (ms === null) localStorage.removeItem(khoa);
    else localStorage.setItem(khoa, String(ms));
    return true;
  } catch {
    return false;
  }
}

/** Mốc để ẩn hết các tin đang có: thời điểm của tin MỚI NHẤT (không lấy giờ máy,
    để đồng hồ máy chạy lệch cũng không ẩn nhầm tin sắp tới). null nếu không có tin. */
export function mocAnTatCa(tin: readonly TinCoMoc[]): number | null {
  let lonNhat = NaN;
  for (const m of tin) {
    const ms = Date.parse(m.timestamp);
    if (Number.isFinite(ms) && !(ms <= lonNhat)) lonNhat = ms;
  }
  return Number.isFinite(lonNhat) ? lonNhat : null;
}

/** Tách tin còn hiện và số tin đã ẩn. Tin có timestamp hỏng thì cứ hiện, đừng làm mất. */
export function locTheoMoc<T extends TinCoMoc>(tin: readonly T[], moc: number | null): { hien: T[]; soAn: number } {
  if (moc === null) return { hien: [...tin], soAn: 0 };
  const hien = tin.filter((m) => !(Date.parse(m.timestamp) <= moc));
  return { hien, soAn: tin.length - hien.length };
}
