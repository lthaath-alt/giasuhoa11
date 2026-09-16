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
 * Trần ký tự cho dàn bài cả chương trình.
 *
 * Đo thực tế: 25 bài với tóm tắt + công thức + tên mục + ý chính là khoảng
 * 17.000 ký tự nội dung, cộng nhãn và gạch đầu dòng ra ngót 24.000. Để trần
 * 30.000 là còn dư chỗ cho vài bài soạn thêm mà chưa phải sửa mã.
 */
const TRAN_CHUONG_TRINH = 30000;

/**
 * Dàn bài CẢ CHƯƠNG TRÌNH — chỉ dùng cho khung iChat tư vấn chung.
 *
 * Vì sao cần: ở khung iChat, `buildLessonContext` trả chuỗi rỗng vì học sinh
 * không mở bài nào cả. Trước đây thầy chỉ nhận được danh mục TÊN 25 bài, tức là
 * biết bài nào tồn tại nhưng không biết trong bài có gì — hỏi "quy tắc
 * Markovnikov học ở bài nào" thì thầy phải đoán. Mà khung iChat mới chính là
 * nơi học sinh hỏi vắt qua nhiều bài nhất.
 *
 * Mức chi tiết chọn ở giữa: tóm tắt, công thức, tên mục và ý chính của từng
 * bài. CỐ Ý bỏ phần gợi ý dẫn dắt của giáo viên và câu luyện tập — riêng hai
 * phần đó đã 19.000 ký tự, gấp đôi cả khối này, mà chúng chỉ phát huy khi học
 * sinh đang mở đúng bài đó (lúc ấy `buildLessonContext` đã kèm đủ rồi).
 *
 * Gửi kèm mỗi lượt hỏi ở khung iChat. Không tốn thêm lượt gọi API nào — hạn
 * mức miễn phí của Google đếm theo SỐ LƯỢT gọi chứ không theo số chữ.
 */
export function buildProgramContext(): string {
  const tongSoBai = CHEMISTRY_11_CURRICULUM.reduce((n, c) => n + c.lessons.length, 0);
  const baiCuoi = CHEMISTRY_11_CURRICULUM.at(-1)?.lessons.at(-1);

  const L: string[] = [];
  L.push('DÀN BÀI CẢ CHƯƠNG TRÌNH HOÁ 11 (KNTT) — em đang ở khung hỏi đáp chung, '
    + 'không mở sẵn bài nào. Đây là toàn bộ nội dung có trong chương trình.');
  L.push(`Chương trình gồm đúng ${tongSoBai} bài, bài cuối là "${baiCuoi?.title ?? ''}". `
    + 'Không có bài nào ngoài khoảng này; hỏi về bài ngoài khoảng đó thì nói rõ là '
    + 'không có, TUYỆT ĐỐI không bịa.');

  CHEMISTRY_11_CURRICULUM.forEach(c => {
    L.push(`\n══ ${c.title} ══`);
    c.lessons.forEach(l => {
      L.push(`\n▸ ${l.title}  (mã: ${l.id})`);
      if (l.summary) L.push(`  Trọng tâm: ${l.summary}`);
      if (l.formulae?.length) L.push(`  Công thức: ${l.formulae.join(' | ')}`);
      const tb = l.textbook;
      if (tb?.sections?.length) {
        tb.sections.forEach(sec => {
          L.push(`  • ${sec.sectionTitle}`);
          if (sec.keyPoints?.length) sec.keyPoints.forEach(k => L.push(`     - ${k}`));
        });
      }
    });
  });

  /* Dàn bài là để thầy BIẾT, không phải để thầy trả lời thay.
     Bản trước dặn ở đây "bước A1/B1 VẪN hỏi học sinh thuộc chương nào", trong
     khi câu lệnh hệ thống dặn "ĐỪNG bắt em đoán mò" — hai lời dặn đá nhau và
     biên bản thẩm định 14/09/2026 bắt được. Nay chỉ còn MỘT luật, nằm trong
     promptSuPham.ts (mục XÁC ĐỊNH BÀI/CHƯƠNG); chỗ này nhắc lại đúng luật đó. */
  L.push('\nCÁCH DÙNG DÀN BÀI TRÊN:');
  L.push('- Ở bước A1/B1: tự nói kiến thức này thuộc bài/chương nào theo dàn bài, gộp vào '
    + 'lượt với bước kế tiếp. KHÔNG bắt học sinh đoán chương rồi chấm đúng sai, và không '
    + 'bao giờ nói sai tên chương.');
  L.push('- Học sinh hỏi thuần tuý tra cứu ("cái này học ở bài nào thầy?", "chương 3 có '
    + 'những bài gì?") thì trả lời thẳng — đó là câu hỏi tra mục lục, không phải bài '
    + 'tập, không cần chạy quy trình 6 bước.');
  L.push('- Cần chi tiết sâu hơn dàn bài này (câu luyện tập, ví dụ mẫu, gợi ý dẫn dắt '
    + 'của giáo viên) thì mời các em mở đúng bài đó ở mục Bài giảng — ở đó thầy có '
    + 'đầy đủ nội dung bài.');

  const out = L.join('\n');
  return out.length > TRAN_CHUONG_TRINH
    ? out.slice(0, TRAN_CHUONG_TRINH) + '\n… (đã lược bớt phần còn lại)'
    : out;
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
