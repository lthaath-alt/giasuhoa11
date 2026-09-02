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
 *
 * Nâng 4000 → 4600 khi thêm danh sách bài cùng chương: bài dài nhất chạm 4029,
 * tức vừa đúng bị cắt mất phần đuôi. Cắt ở đây thì mất câu luyện tập và lời dặn
 * cuối — thầy vẫn chạy nhưng nhạt đi mà không ai thấy.
 */
const TRAN_KY_TU = 4600;

function timBaiHoc(lessonId: string): { lesson: Lesson; chuong: string } | null {
  for (const c of CHEMISTRY_11_CURRICULUM) {
    const l = c.lessons.find(x => x.id === lessonId);
    if (l) return { lesson: l, chuong: c.title };
  }
  return null;
}

/**
 * Danh mục MÃ BÀI, để gia sư gắn đúng bài khi phát tín hiệu ra đề.
 *
 * CỐ Ý tách riêng và luôn đính kèm, kể cả ở cuộc tư vấn chung `global-advisor`
 * — nơi `buildLessonContext` trả chuỗi rỗng. Không có khối này thì gia sư không
 * biết `bai-3` ứng với bài nào, tín hiệu [SIGNAL:XONG_BAI:...] sẽ mang mã bịa,
 * và đề kiểm tra lại ra sai bài đúng như lỗi cũ.
 *
 * Chỉ gồm mã + tên, không kèm nội dung, nên rất nhẹ (~1,5 KB mỗi lượt).
 */
export function buildLessonCatalog(): string {
  const L: string[] = ['DANH MỤC BÀI HỌC — dùng để điền mã bài vào tín hiệu ra đề:'];
  CHEMISTRY_11_CURRICULUM.forEach(c => {
    L.push(c.title);
    c.lessons.forEach(l => L.push(`  ${l.id} = ${l.title}`));
  });
  L.push('Mã bài PHẢI chép nguyên văn từ danh sách trên (dạng bai-1 … bai-25). '
    + 'Không chắc là bài nào thì ĐỪNG phát tín hiệu ra đề.');
  return L.join('\n');
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

  /* Cho biết chương trình có bao nhiêu bài.
     Thiếu dòng này, khi học sinh hỏi "Bài 30 nói gì vậy thầy?" thì Gemini phải
     đoán: có lần nó nói đúng "chỉ có đến Bài 25", có lần nói "chỉ có đến Bài 26"
     — tức là bịa ra một bài không tồn tại. Con số lấy từ chính dữ liệu chứ
     không viết cứng, để thêm bớt bài thì câu này tự đúng theo. */
  const tongSoBai = CHEMISTRY_11_CURRICULUM.reduce((n, c) => n + c.lessons.length, 0);
  const baiCuoi = CHEMISTRY_11_CURRICULUM.at(-1)?.lessons.at(-1);

  L.push('NỘI DUNG BÀI HỌC EM ĐANG MỞ — bám vào đây, đừng giảng lệch sang bài khác.');
  L.push(`Chương trình Hoá học 11 (KNTT) gồm đúng ${tongSoBai} bài, `
    + `bài cuối cùng là "${baiCuoi?.title ?? ''}". Không có bài nào ngoài khoảng này; `
    + 'học sinh hỏi về một bài ngoài khoảng đó thì nói rõ là không có, TUYỆT ĐỐI không bịa.');
  L.push(`Chương: ${chuong}`);
  L.push(`Bài: ${lesson.title}`);

  /* Liệt kê các bài CÙNG CHƯƠNG. Gia sư cần danh sách này để chạy lượt rà nhanh
     trước khi mở bài kiểm tra tổng hợp — không có nó thì nó chỉ biết mỗi bài
     đang mở, và ba câu "trải đều chương" sẽ rơi hết vào một bài. */
  const chuongCuaBai = CHEMISTRY_11_CURRICULUM.find(c => c.lessons.some(l => l.id === lessonId));
  if (chuongCuaBai && chuongCuaBai.lessons.length > 1) {
    L.push('\nCác bài trong chương này (dùng khi rà nhanh cả chương):');
    chuongCuaBai.lessons.forEach(l => L.push(`- ${l.title}`));
  }

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

  // Đã biết chắc bài và chương thì hỏi lại chỉ làm học sinh thấy máy móc.
  L.push('QUAN TRỌNG: học sinh đang mở sẵn bài này nên BỎ QUA bước bắt các em xác định '
    + 'chương. Hãy tự xác nhận một câu ngắn rồi đi thẳng vào bước tiếp theo.');

  const s = L.join('\n');
  return s.length > TRAN_KY_TU
    ? s.slice(0, TRAN_KY_TU) + '\n… (đã lược bớt phần còn lại)'
    : s;
}
