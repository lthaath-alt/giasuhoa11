// ─── Link đề trong lời của gia sư ────────────────────────────────────────────
//
// Link làm bài (`#/quiz/<id>`, `#/de/<id>`) chỉ được do WEB nối vào cuối câu trả
// lời, sau khi đã thật sự tạo đề. Mô hình thì thấy các dòng "👉 … [Làm bài kiểm
// tra ngay](…)" trong lịch sử chat và chép lại y nguyên: đo 02/10/2026, một câu
// trả lời mang HAI dòng link giống hệt nhau, dòng đầu trỏ về một bài đã nộp từ
// ngày 18/09.
//
// Logic thuần, không import gì, để `kiem-tra:de-giao` gọi được bằng Node.

/** Bỏ mọi DÒNG có mang link đề; phần còn lại giữ nguyên. */
export function boDongLinkDe(text: string): string {
  return String(text ?? '')
    .split('\n')
    .filter(dong => !/#\/(quiz|de)\//.test(dong))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
