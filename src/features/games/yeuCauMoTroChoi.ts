/**
 * Một chỗ nhắn "mở giúp trò chơi này" giữa Luyện tập và khu Trò chơi.
 *
 * Vì sao không truyền prop: `GameHubSection` nằm ở nhánh khác của cây giao
 * diện, cách `PracticeSection` bốn lớp. Vì sao không mở trò chơi ở tab mới:
 * trò chơi gửi tiến độ về bằng `postMessage` tới CỬA SỔ CHA, nên mở ở tab
 * riêng là mất sạch tiến độ — mà tiến độ chính là thứ Luyện tập dựa vào để mở
 * khoá.
 *
 * Dùng `sessionStorage` chứ không `localStorage`: lời nhắn này chỉ có nghĩa
 * trong đúng phiên đang mở, để lại sang hôm sau là mở nhầm trò.
 */
const KHOA = 'h11_mo_tro_choi';

export function datYeuCauMoTroChoi(troId: string): void {
  try { sessionStorage.setItem(KHOA, troId); } catch { /* chế độ riêng tư: bỏ qua */ }
}

/** Đọc rồi XOÁ luôn, để lần sau vào tab Trò chơi không tự mở lại. */
export function layYeuCauMoTroChoi(): string | null {
  try {
    const v = sessionStorage.getItem(KHOA);
    if (v) sessionStorage.removeItem(KHOA);
    return v;
  } catch {
    return null;
  }
}
