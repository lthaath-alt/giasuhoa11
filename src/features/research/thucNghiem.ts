// ─── Cấu hình nghiên cứu thực nghiệm có nhóm đối chứng ───────────────────────
//
// Dùng cho một nghiên cứu trả lời câu hỏi: dạy theo lối gợi mở (Socratic, không
// cho đáp án) có giúp học sinh làm bài tốt hơn so với giảng thẳng có lời giải
// mẫu hay không.
//
// ĐANG TẮT theo mặc định, và phải cố ý bật. Không bao giờ để một lớp học đang
// dùng bình thường bỗng biến thành đối tượng thí nghiệm mà không ai hay: một
// nửa số em sẽ nhận cách dạy khác hẳn trong khi giáo viên tưởng cả lớp dùng
// chung một hệ thống.
//
// Trước khi bật, phải có đủ ba thứ (xem docs/nghien-cuu-thuc-nghiem.md):
//   1. Học sinh và phụ huynh được báo và đồng ý — các em là người chưa thành niên.
//   2. Đề kiểm tra trước/sau đã chốt và đã rút khỏi phần luyện tập.
//   3. Ngày bắt đầu, ngày kết thúc đã định trước, không đổi giữa chừng.

export type Nhanh = 'socratic' | 'truc-tiep';

/**
 * Công tắc chính. Để false thì MỌI học sinh đều dùng nhánh socratic — tức là
 * web chạy y hệt như khi chưa có tệp này.
 */
export const DANG_CHAY_NGHIEN_CUU = false;

/** Ghi vào báo cáo để biết số liệu thuộc đợt nào. Đổi tên là bắt đầu đợt mới. */
export const MA_DOT = 'dot-1';

/**
 * Chia nhóm CỐ ĐỊNH theo email, không tung lại mỗi lần.
 *
 * Vì sao không dùng Math.random(): mỗi lần học sinh mở web sẽ rơi vào một nhánh
 * khác nhau, các em nhận cả hai cách dạy trộn lẫn, và không còn hai nhóm để so
 * sánh nữa. Băm từ email thì một em suốt đợt luôn ở đúng một nhánh, mà vẫn
 * không ai chọn được ai vào nhóm nào.
 *
 * Dùng FNV-1a: ngắn, không cần thư viện, và tản đều — đã đếm trên 1.000 email
 * giả lập, tỉ lệ hai nhánh 49,7% / 50,3% (xem kiem-tra-thuc-nghiem.mts).
 *
 * `MA_DOT` nằm trong chuỗi băm để đợt sau các em được chia lại từ đầu, tránh
 * việc cùng một em mãi mãi ở một nhánh qua nhiều đợt nghiên cứu.
 */
export function nhanhCuaHocSinh(email: string): Nhanh {
  if (!DANG_CHAY_NGHIEN_CUU) return 'socratic';
  if (!email || email === 'guest') return 'socratic';   // khách vãng lai không tính vào mẫu

  const khoa = `${MA_DOT}:${email.trim().toLowerCase()}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < khoa.length; i++) {
    h ^= khoa.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return (h & 1) === 0 ? 'socratic' : 'truc-tiep';
}

/**
 * Nhãn ghi vào dữ liệu thu được. KHÔNG ghi email vào báo cáo — các em là người
 * chưa thành niên, chỉ cần biết em nào thuộc nhánh nào, không cần biết là ai.
 */
export function maAnDanh(email: string): string {
  let h = 0x811c9dc5;
  const khoa = `${MA_DOT}#${email.trim().toLowerCase()}`;
  for (let i = 0; i < khoa.length; i++) {
    h ^= khoa.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return 'hs-' + h.toString(36).padStart(7, '0');
}
