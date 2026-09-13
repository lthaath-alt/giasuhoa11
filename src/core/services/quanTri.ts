/**
 * Ai là chủ dự án — bản dùng cho GIAO DIỆN.
 *
 * Hàng rào THẬT là `laChuDuAn()` trong `firestore.rules`. Hằng dưới đây chỉ
 * dùng để quyết định vẽ hay không vẽ một nút. Sửa nó KHÔNG cấp thêm quyền cho
 * ai: người không phải chủ dự án có bấm được nút cũng bị Firestore từ chối.
 *
 * Hai nơi này phải luôn trùng nhau — `npm run kiem-tra:an-ninh` canh điều đó.
 * Đổi email thì phải sửa CẢ HAI, và publish lại luật bằng tay.
 */
export const EMAIL_CHU_DU_AN = 'ktranquang713@gmail.com';

/** Người đang đăng nhập có phải chủ dự án không. Chỉ để vẽ giao diện. */
export function laChuDuAn(email?: string | null): boolean {
  return Boolean(email && email.toLowerCase() === EMAIL_CHU_DU_AN);
}
