// ─── Nối nội dung bài học vào ngữ cảnh gửi cho AI ────────────────────────────
//
// Trước đây web chỉ gửi SYSTEM_PROMPT + lịch sử chat, nên thầy trả lời hoàn toàn
// bằng trí nhớ của Gemini, không bám vào sách của trường. Hệ quả là thầy có thể
// dùng quy ước cũ, gọi tên chất theo lối cũ, hoặc giảng lệch trọng tâm bài.
//
// Ở đây ta lấy đúng bài học sinh đang mở trong `CHEMISTRY_11_CURRICULUM` rồi
// đính kèm phần cốt lõi. Dữ liệu này nằm sẵn trong mã nguồn nên KHÔNG cần gọi
// mạng, không có độ trễ và không có đường hỏng.

import { CHEMISTRY_11_CURRICULUM } from '../../lessons/constants';
import { Lesson } from '../../lessons/types';

/**
 * Trần ký tự cho khối ngữ cảnh.
 *
 * Có bài kèm cả trang SGK nên nếu nhét hết sẽ đẩy giá mỗi lượt chat lên cao mà
 * phần đuôi hầu như không được dùng tới. Cắt ở mức đủ để thầy bám bài.
 */
const TRAN_KY_TU = 4000;

function timBaiHoc(lessonId: string): { lesson: Lesson; chuong: string } | null {
  for (const c of CHEMISTRY_11_CURRICULUM) {
    const l = c.lessons.find(x => x.id === lessonId);
    if (l) return { lesson: l, chuong: c.title };
  }
  return null;
}

/**
 * Dựng khối ngữ cảnh cho một bài học. Trả về chuỗi rỗng nếu không tìm thấy bài
 * — ví dụ cuộc trò chuyện tư vấn chung `global-advisor`.
 */
export function buildLessonContext(lessonId: string): string {
  const found = timBaiHoc(lessonId);
  if (!found) return '';

  const { lesson, chuong } = found;
  const L: string[] = [];

  L.push('NỘI DUNG BÀI HỌC EM ĐANG MỞ — bám vào đây, đừng giảng lệch sang bài khác.');
  L.push(`Chương: ${chuong}`);
  L.push(`Bài: ${lesson.title}`);

  if (lesson.summary) L.push(`\nTóm tắt trọng tâm:\n${lesson.summary}`);

  if (lesson.formulae?.length) {
    L.push('\nCông thức của bài:');
    lesson.formulae.forEach(f => L.push(`- ${f}`));
  }

  const tb = lesson.textbook;
  if (tb?.objectives?.length) {
    L.push('\nMục tiêu bài học:');
    tb.objectives.forEach(o => L.push(`- ${o}`));
  }

  if (tb?.sections?.length) {
    L.push('\nCác mục trong bài:');
    tb.sections.forEach(s => {
      L.push(`• ${s.sectionTitle}`);
      if (s.keyPoints?.length) s.keyPoints.forEach(k => L.push(`   - ${k}`));
    });
  }

  // Gợi ý sư phạm do chính giáo viên soạn — quý hơn mọi thứ khác trong khối này,
  // vì nó cho thầy biết NÊN DẪN DẮT THẾ NÀO chứ không chỉ nội dung là gì.
  if (lesson.commonQuestions?.length) {
    L.push('\nCâu hỏi thường gặp và hướng dẫn dẫn dắt do giáo viên soạn sẵn:');
    lesson.commonQuestions.forEach(q => {
      L.push(`• Hỏi: ${q.question}`);
      if (q.hint) L.push(`   Gợi ý nên dùng: ${q.hint}`);
    });
  }

  if (tb?.practiceQuestions?.length) {
    L.push('\nCâu luyện tập của bài (KHÔNG đưa đáp án cho học sinh):');
    tb.practiceQuestions.forEach(q => L.push(`• ${q.question}`));
  }

  L.push('\nDùng phần trên làm chuẩn. Nếu học sinh hỏi ngoài phạm vi bài này, cứ trả lời '
    + 'nhưng nhắc các em rằng nội dung đó thuộc bài khác.');

  const s = L.join('\n');
  return s.length > TRAN_KY_TU
    ? s.slice(0, TRAN_KY_TU) + '\n… (đã lược bớt phần còn lại)'
    : s;
}
