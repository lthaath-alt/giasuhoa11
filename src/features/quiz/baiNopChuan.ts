import type { Quiz } from './types';

/**
 * Bản sao sạch của một bài đã nộp, để ghi lên Firestore.
 *
 * - Bỏ mọi trường `undefined`: Firestore TỪ CHỐI cả tài liệu nếu gặp một giá
 *   trị `undefined`, mà câu hỏi lấy từ kho hay mang `image: undefined`.
 * - Email về chữ thường: luật so `userEmail` với email trong token Auth, vốn
 *   luôn là chữ thường. Lệch hoa/thường là học sinh bị chặn nộp bài của chính mình.
 *
 * Cố ý KHÔNG import Firebase, để `kiem-tra:luyen-tap` gọi được ngoài trình duyệt.
 */
export function chuanBiBaiNop(quiz: Quiz): Quiz {
  const ban = JSON.parse(JSON.stringify(quiz)) as Quiz;
  ban.userEmail = (quiz.userEmail || '').trim().toLowerCase();
  return ban;
}
