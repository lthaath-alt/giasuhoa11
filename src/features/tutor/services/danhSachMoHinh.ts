// ─── Model dự phòng của gia sư, và tên các đường gọi ─────────────────────────
//
// Hạn mức miễn phí của Gemini tính theo DỰ ÁN và theo TỪNG MODEL (quotaId
// `GenerateRequestsPerDayPerProjectPerModel-FreeTier`). Model chính hết 20
// lượt thì các model khác trong cùng dự án vẫn còn lượt riêng của chúng.
//
// Thứ tự: các bản Flash trước — gần model chính nhất về chất lượng, khoảng 20
// lượt/ngày mỗi bản; các bản Flash-Lite sau — nhẹ hơn, khoảng 500 lượt/ngày mỗi
// bản (số của bên thứ ba, chủ dự án đối chiếu trong AI Studio).
//
// Chỉ đời 3.x: chúng nhận `thinkingLevel` như model chính. Đời 2.5 đòi
// `thinkingBudget`, thêm vào thì phải sửa `giaSuFirebaseAI.ts`.
// Đo bằng ListModels ngày 01/10/2026: cả sáu tên đều được cấp cho dự án.
// `kiem-tra:gemini` hỏi lại mỗi lần chạy.
//
// Tệp thuần, không import gì.

export const GEMINI_XOAY: readonly string[] = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];

/** Ai đã trả lời lượt này — ghi vào `chats.nha_cung_cap`. */
export type NhaCungCap = 'gemini-firebase' | 'gemini-khoa-rieng';

/** Lượt này đi đường nào — ghi vào `chats.duong`. Lọc `'chinh'` là ra đúng
    những lượt do model gốc trả lời, cho phân tích của đề tài. */
export type Duong = 'chinh' | 'xoay-gemini' | 'khoa-rieng';
