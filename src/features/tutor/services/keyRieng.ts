/**
 * Khoá Gemini RIÊNG của từng học sinh (20/09/2026).
 *
 * Vì sao có: hạn mức miễn phí tính theo PROJECT, nên hết lượt là hết cho cả
 * web — một lớp đang học giữa buổi thì đứng hình. Em tự lấy một khoá miễn phí
 * ở aistudio.google.com thì em có hạn mức riêng, không ai giành của ai.
 *
 * KHÔNG NHẦM với chuyện đã bị bỏ ngày 13/09/2026. Cái bị bỏ là đưa khoá vào
 * một biến môi trường tiền tố VITE lúc dựng — Vite chép nguyên văn vào
 * `dist/`, ai bấm F12 cũng lấy được. Khoá ở đây do chính em gõ lúc chạy, nằm
 * trong máy em, không có trong mã nguồn và không có trong gói JS.
 * (Cố ý không viết tên biến đó ra đây: `kiem-tra:an-ninh` quét cả chú thích,
 * và nó nên tiếp tục nghiêm như vậy.)
 *
 * Ba điều bắt buộc, `kiem-tra:an-ninh` canh:
 *   1. Chỉ `localStorage` — KHÔNG ghi Firestore. Khoá tính tiền theo tài khoản
 *      Google của chính em; đưa lên máy chủ chung là biến nó thành của chung.
 *   2. KHÔNG in ra console, KHÔNG đưa vào nhật ký lỗi.
 *   3. KHÔNG gửi kèm telemetry.
 */
const KHOA = 'h11_key_rieng';

/** Kiểm DẠNG thôi, không gọi mạng: khoá Google cấp bắt đầu bằng `AIza` (bản
 *  cũ) hoặc `AQ.` (cấp từ 2026), và không có khoảng trắng. */
export function keyHopLe(k: string): boolean {
  const s = (k || '').trim();
  return (/^AIza[A-Za-z0-9_-]{20,}$/.test(s) || /^AQ\.[A-Za-z0-9_-]{20,}$/.test(s));
}

export function docKey(): string | null {
  try {
    const k = localStorage.getItem(KHOA);
    return k && keyHopLe(k) ? k : null;
  } catch {
    return null;   // chế độ riêng tư chặn localStorage
  }
}

export function coKeyRieng(): boolean {
  return docKey() !== null;
}

/** Trả về false nếu khoá sai dạng — màn hình tự báo cho em, đừng lưu rác. */
export function luuKey(k: string): boolean {
  const s = (k || '').trim();
  if (!keyHopLe(s)) return false;
  try {
    localStorage.setItem(KHOA, s);
    return true;
  } catch {
    return false;
  }
}

export function xoaKey(): void {
  try { localStorage.removeItem(KHOA); } catch { /* không có gì để xoá */ }
}

/** Che khoá khi hiện lên màn hình: chỉ 4 ký tự cuối, đủ để em nhận ra khoá nào. */
export function cheKey(k: string): string {
  return k.length <= 4 ? '••••' : '•'.repeat(8) + k.slice(-4);
}
