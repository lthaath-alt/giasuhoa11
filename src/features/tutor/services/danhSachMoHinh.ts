// ─── Model dự phòng của gia sư, và tên các đường gọi ─────────────────────────
//
// Hạn mức miễn phí của Gemini tính theo DỰ ÁN và theo TỪNG MODEL (quotaId
// `GenerateRequestsPerDayPerProjectPerModel-FreeTier`). Model chính hết 20
// lượt thì các model khác trong cùng dự án vẫn còn lượt riêng của chúng.
//
// Thứ tự: các bản Flash trước — gần model chính nhất về chất lượng, khoảng 20
// lượt/ngày mỗi bản; bản Flash-Lite cuối cùng — nhẹ hơn, khoảng 500 lượt/ngày
// (số của bên thứ ba, chủ dự án đối chiếu trong AI Studio).
//
// BỎ `gemini-3.1-flash-lite` ngày 02/10/2026: bộ `thu:ai` cho 14/20 (model
// chính 19/20), và nó TRẢ LỜI THẲNG đáp án thay vì dẫn dắt — phạm đúng nguyên
// tắc của nhánh Socratic. `gemini-3.5-flash-lite` được giữ ở cuối dù chỉ 15/20:
// không có nó thì dự phòng chỉ còn khoảng 80 lượt/ngày. Số liệu đầy đủ:
// docs/danh-gia-mo-hinh-xoay-vong.md. Thêm model vào đây thì chạy `thu:ai` trước.
//
// Chỉ đời 3.x: chúng nhận `thinkingLevel` như model chính. Đời 2.5 đòi
// `thinkingBudget`, thêm vào thì phải sửa `giaSuFirebaseAI.ts`.
// Đo bằng ListModels ngày 01/10/2026: mọi tên dưới đây đều được cấp cho dự án.
// `kiem-tra:gemini` hỏi lại mỗi lần chạy.
//
// Tệp thuần, không import gì.

export const GEMINI_XOAY: readonly string[] = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
];

/** Ai đã trả lời lượt này — ghi vào `chats.nha_cung_cap`. */
export type NhaCungCap = 'gemini-firebase' | 'gemini-khoa-rieng';

/** Lượt này đi đường nào — ghi vào `chats.duong`. Lọc `'chinh'` là ra đúng
    những lượt do model gốc trả lời, cho phân tích của đề tài. */
export type Duong = 'chinh' | 'xoay-gemini' | 'khoa-rieng';
