/**
 * Link tài liệu do NGƯỜI DÙNG gõ vào (trường `driveLink` của "Kho bài tập chung"
 * và phần ma trận), đã kiểm: chỉ nhận `https` tới Google Drive hoặc Google Docs.
 * Trả về địa chỉ đã chuẩn hoá, hoặc `null` nếu không hợp lệ.
 *
 * Trước 04/10/2026 hai màn nhập tự kiểm bằng `link.includes('drive.google.com/')`.
 * Phép đó chỉ hỏi chuỗi có CHỨA đoạn chữ ấy không, nên cả ba thứ sau đều qua:
 *   - `javascript:alert('drive.google.com/')`
 *   - `https://trang-la.example/drive.google.com/abc`
 *   - `https://drive.google.com.trang-la.example/abc`
 * Link lưu xong lại thành `href` trên máy người khác (học sinh, giáo viên khác),
 * nên chỗ HIỆN link cũng phải đi qua hàm này — dữ liệu cũ trong Firestore được
 * nhập dưới phép kiểm lỏng. `kiem-tra:an-ninh` canh cả hai đầu.
 *
 * Tệp thuần, không import gì: chạy được trong bộ kiểm ngoài Vite.
 */
export function linkGoogleHopLe(raw?: string | null): string | null {
  try {
    const u = new URL(String(raw ?? '').trim());
    const duoc = u.protocol === 'https:'
      && (u.hostname === 'drive.google.com' || u.hostname === 'docs.google.com');
    return duoc ? u.href : null;
  } catch {
    return null;
  }
}
