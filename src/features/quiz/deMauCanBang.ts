// ─── Đề mẫu 10 câu: Cân bằng hoá học ─────────────────────────────────────────
//
// Đề giấy của giáo viên, nhập ngày 22/09/2026 từ ảnh chụp. Bản gốc cắt từ nhiều
// phần đề khác nhau nên số câu không liền mạch (Câu 1, Câu 4, Câu 5, Câu 11,
// Câu 12, Câu 26…); ở đây ĐÁNH SỐ LẠI 1–10 theo mạch sư phạm: khái niệm →
// biểu thức Kc → chuyển dịch cân bằng → bài tập tính.
//
// Vì sao để trong mã chứ không nạp thẳng vào `bank_questions`: ghi ngân hàng là
// sửa dữ liệu thật của 1.554 câu, và quy trình của dự án bắt buộc chủ dự án tự
// làm việc đó (xem "Quy trình soát" trong CLAUDE.md). Bộ này chỉ là một đề
// DỰNG SẴN để giáo viên bấm một nút là có, không đụng tới kho.
//
// `points` mỗi câu 1 điểm → tổng 10, khớp thang điểm 10 quen thuộc.
//
// ĐÁP ÁN ĐÃ TỰ KIỂM TAY, hai chỗ đáng chú ý:
//
//   - Câu 7 (CaCO₃ ⇌ CaO + CO₂, ΔH > 0): đáp án là GIẢM ÁP SUẤT, không phải
//     giảm nhiệt độ. Vế trái không có chất khí, vế phải có 1 mol khí, nên giảm
//     áp suất đẩy cân bằng theo chiều tăng số mol khí — tức chiều thuận. Giảm
//     nhiệt độ thì ngược lại: phản ứng thuận thu nhiệt nên hạ nhiệt là đẩy về
//     chiều nghịch.
//   - Câu 10 (Kc = 0,534; nhiệt phân 0,1 mol CaCO₃ trong 1 L): đáp án là 0,1 M,
//     KHÔNG phải 0,534 M. Kc = [CO₂] nghĩa là ở cân bằng cần 0,534 mol CO₂ trong
//     1 L, mà cả bình chỉ có 0,1 mol CaCO₃ — tối đa sinh 0,1 mol CO₂. Vì
//     0,1 < 0,534 nên hệ KHÔNG đạt được cân bằng, CaCO₃ phân huỷ hết và
//     [CO₂] = 0,1 M. Phương án 0,534 M là bẫy đọc thẳng Kc ra đáp số.

import type { Question } from '../library/types';

export const TEN_DE_MAU = 'Kiểm tra 15 phút — Cân bằng hoá học';

const NGAY = '2026-09-22T00:00:00.000Z';

/** Bớt chỗ lặp: 10 câu chỉ khác nhau ở nội dung, phương án và đáp án. */
function cau(
  so: number,
  difficulty: Question['difficulty'],
  content: string,
  phuongAn: [string, string, string, string],
  correctAnswer: 'A' | 'B' | 'C' | 'D',
  giaiThich: string,
): Question {
  return {
    id: `dm-cb-${String(so).padStart(2, '0')}`,
    type: 'Trắc nghiệm',
    difficulty,
    points: 1,
    content,
    images: [],
    options: (['A', 'B', 'C', 'D'] as const).map((key, i) => ({ key, text: phuongAn[i] })),
    correctAnswer,
    giaiThich,
    topic: 'Cân bằng hoá học',
    chapterId: 'chuong-1',
    lessonId: 'bai-1',
    createdAt: NGAY,
  };
}

export const DE_MAU_CAN_BANG: Question[] = [
  cau(1, 'Thấp',
    'Trong phản ứng thuận nghịch, chiều từ trái sang phải được gọi là phản ứng:',
    ['trao đổi', 'thuận', 'oxi hoá – khử', 'nghịch'],
    'B',
    'Phản ứng thuận nghịch xảy ra đồng thời theo hai chiều ngược nhau trong cùng điều kiện. Chiều từ trái sang phải (chất đầu tạo thành sản phẩm) gọi là <b>phản ứng thuận</b>; chiều từ phải sang trái gọi là phản ứng nghịch.'),

  cau(2, 'Thấp',
    'Giá trị hằng số cân bằng K<sub>c</sub> của phản ứng thay đổi khi:',
    ['thay đổi áp suất', 'thay đổi nhiệt độ', 'thay đổi nồng độ các chất', 'thêm chất xúc tác'],
    'B',
    'K<sub>c</sub> chỉ phụ thuộc bản chất phản ứng và <b>nhiệt độ</b>.<br>'
    + '• Đổi nồng độ hay áp suất chỉ làm cân bằng chuyển dịch, rồi hệ thiết lập lại cân bằng mới với đúng giá trị K<sub>c</sub> cũ.<br>'
    + '• Chất xúc tác chỉ làm cân bằng được thiết lập nhanh hơn, không làm chuyển dịch cân bằng và không đổi K<sub>c</sub>.'),

  cau(3, 'Thấp',
    'Biểu thức tính hằng số cân bằng của phản ứng: CaO (s) + CO<sub>2</sub> (g) ⇌ CaCO<sub>3</sub> (s) là:',
    [
      'K<sub>c</sub> = 1 / [CO<sub>2</sub>]',
      'K<sub>c</sub> = [CaO].[CO<sub>2</sub>] / [CaCO<sub>3</sub>]',
      'K<sub>c</sub> = [CO<sub>2</sub>]',
      'K<sub>c</sub> = [CaCO<sub>3</sub>] / ([CaO].[CO<sub>2</sub>])',
    ],
    'A',
    'CaO và CaCO<sub>3</sub> đều là chất rắn nguyên chất nên <b>không có mặt</b> trong biểu thức hằng số cân bằng. '
    + 'Chỉ còn CO<sub>2</sub>, và nó nằm ở vế chất đầu nên đứng dưới mẫu:<br>'
    + 'K<sub>c</sub> = 1 / [CO<sub>2</sub>]'),

  cau(4, 'Thấp',
    'Cho phản ứng hoá học sau: 3Fe (s) + 4H<sub>2</sub>O (g) ⇌ Fe<sub>3</sub>O<sub>4</sub> (s) + 4H<sub>2</sub> (g). Biểu thức hằng số cân bằng của phản ứng trên là:',
    [
      'K<sub>c</sub> = [H<sub>2</sub>]<sup>4</sup> / [H<sub>2</sub>O]<sup>4</sup>',
      'K<sub>c</sub> = 4[H<sub>2</sub>].[Fe<sub>3</sub>O<sub>4</sub>] / (4[H<sub>2</sub>O].3[Fe])',
      'K<sub>c</sub> = 4[H<sub>2</sub>] / 4[H<sub>2</sub>O]',
      'K<sub>c</sub> = [H<sub>2</sub>]<sup>4</sup>.[Fe<sub>3</sub>O<sub>4</sub>] / ([H<sub>2</sub>O]<sup>4</sup>.[Fe]<sup>3</sup>)',
    ],
    'A',
    'Hai điều phải nhớ:<br>'
    + '• Fe và Fe<sub>3</sub>O<sub>4</sub> là chất rắn nguyên chất → loại khỏi biểu thức. Vì vậy các phương án còn [Fe] hay [Fe<sub>3</sub>O<sub>4</sub>] đều sai.<br>'
    + '• Hệ số cân bằng trở thành <b>số mũ</b>, không phải số nhân. Vậy K<sub>c</sub> = [H<sub>2</sub>]<sup>4</sup> / [H<sub>2</sub>O]<sup>4</sup>.'),

  cau(5, 'Trung bình',
    'Trong các phản ứng sau đây, phản ứng nào áp suất <b>không</b> ảnh hưởng đến cân bằng phản ứng?',
    [
      'N<sub>2</sub> (g) + O<sub>2</sub> (g) ⇌ 2NO (g)',
      'N<sub>2</sub> (g) + 3H<sub>2</sub> (g) ⇌ 2NH<sub>3</sub> (g)',
      '2SO<sub>2</sub> (g) + O<sub>2</sub> (g) ⇌ 2SO<sub>3</sub> (g)',
      '2NO (g) + O<sub>2</sub> (g) ⇌ 2NO<sub>2</sub> (g)',
    ],
    'A',
    'Áp suất chỉ ảnh hưởng tới cân bằng khi <b>tổng số mol khí hai vế khác nhau</b>. Đếm số mol khí:<br>'
    + '• N<sub>2</sub> + O<sub>2</sub> ⇌ 2NO: 1 + 1 = 2 và 2 → <b>bằng nhau, áp suất không ảnh hưởng</b>.<br>'
    + '• N<sub>2</sub> + 3H<sub>2</sub> ⇌ 2NH<sub>3</sub>: 4 và 2 → có ảnh hưởng.<br>'
    + '• 2SO<sub>2</sub> + O<sub>2</sub> ⇌ 2SO<sub>3</sub>: 3 và 2 → có ảnh hưởng.<br>'
    + '• 2NO + O<sub>2</sub> ⇌ 2NO<sub>2</sub>: 3 và 2 → có ảnh hưởng.'),

  cau(6, 'Trung bình',
    'Cho cân bằng hoá học: PCl<sub>5</sub> (g) ⇌ PCl<sub>3</sub> (g) + Cl<sub>2</sub> (g), Δ<sub>r</sub>H°<sub>298</sub> &gt; 0. Cân bằng chuyển dịch theo chiều thuận khi:',
    [
      'tăng nhiệt độ của hệ phản ứng',
      'tăng áp suất của hệ phản ứng',
      'thêm Cl<sub>2</sub> vào hệ phản ứng',
      'thêm PCl<sub>3</sub> vào hệ phản ứng',
    ],
    'A',
    'Δ<sub>r</sub>H°<sub>298</sub> &gt; 0 nên phản ứng thuận <b>thu nhiệt</b>. Tăng nhiệt độ thì cân bằng chuyển dịch theo chiều thu nhiệt, tức chiều thuận.<br>'
    + 'Ba phương án còn lại đều đẩy cân bằng theo chiều nghịch:<br>'
    + '• Tăng áp suất → chuyển về chiều giảm số mol khí, mà vế trái 1 mol còn vế phải 2 mol → chiều nghịch.<br>'
    + '• Thêm Cl<sub>2</sub> hoặc PCl<sub>3</sub> là thêm sản phẩm → chiều nghịch để tiêu bớt chúng.'),

  cau(7, 'Trung bình',
    'Cho cân bằng hoá học: CaCO<sub>3</sub> (s) ⇌ CaO (s) + CO<sub>2</sub> (g), Δ<sub>r</sub>H°<sub>298</sub> &gt; 0. Tác động nào sau đây vào hệ cân bằng để cân bằng đã cho chuyển dịch theo chiều thuận?',
    ['Giảm áp suất', 'Tăng nồng độ khí CO<sub>2</sub>', 'Giảm nhiệt độ', 'Tất cả đều sai'],
    'A',
    'Xét lần lượt từng tác động:<br>'
    + '• <b>Giảm áp suất</b>: vế trái chỉ có chất rắn (0 mol khí), vế phải có 1 mol khí CO<sub>2</sub>. '
    + 'Theo nguyên lí Le Chatelier, giảm áp suất chung thì cân bằng chuyển dịch theo chiều làm <b>tăng</b> số mol khí để chống lại tác động đó, tức chiều thuận. → Đây là đáp án.<br>'
    + '• <b>Tăng nồng độ CO<sub>2</sub></b>: CO<sub>2</sub> là sản phẩm, nên cân bằng chuyển dịch theo chiều nghịch để tiêu bớt lượng CO<sub>2</sub> vừa thêm.<br>'
    + '• <b>Giảm nhiệt độ</b>: Δ<sub>r</sub>H°<sub>298</sub> &gt; 0 nên phản ứng thuận thu nhiệt. Hạ nhiệt độ thì cân bằng chuyển dịch theo chiều toả nhiệt, tức chiều nghịch.'),

  cau(8, 'Trung bình',
    'Cho cân bằng sau trong bình kín: 2NO<sub>2</sub> (g) (màu nâu đỏ) ⇌ N<sub>2</sub>O<sub>4</sub> (g) (không màu). Biết khi hạ nhiệt độ của bình thì màu nâu đỏ nhạt dần. Phản ứng thuận có:',
    [
      'Δ<sub>r</sub>H°<sub>298</sub> &lt; 0, phản ứng thu nhiệt',
      'Δ<sub>r</sub>H°<sub>298</sub> &gt; 0, phản ứng thu nhiệt',
      'Δ<sub>r</sub>H°<sub>298</sub> &lt; 0, phản ứng toả nhiệt',
      'Δ<sub>r</sub>H°<sub>298</sub> &gt; 0, phản ứng toả nhiệt',
    ],
    'C',
    'Đọc dữ kiện màu trước: NO<sub>2</sub> màu nâu đỏ, N<sub>2</sub>O<sub>4</sub> không màu. Hạ nhiệt độ thì màu nâu đỏ nhạt dần '
    + '→ lượng NO<sub>2</sub> giảm → cân bằng đã chuyển dịch theo <b>chiều thuận</b>.<br>'
    + 'Mà hạ nhiệt độ luôn đẩy cân bằng theo chiều <b>toả nhiệt</b>. Vậy chiều thuận là chiều toả nhiệt, '
    + 'tức Δ<sub>r</sub>H°<sub>298</sub> &lt; 0.<br>'
    + 'Hai phương án A và D tự mâu thuẫn: Δ<sub>r</sub>H°<sub>298</sub> &lt; 0 phải đi với <i>toả nhiệt</i>, còn &gt; 0 mới là <i>thu nhiệt</i>.'),

  cau(9, 'Cao',
    'Cho cân bằng (trong bình kín) sau: CO (g) + H<sub>2</sub>O (g) ⇌ CO<sub>2</sub> (g) + H<sub>2</sub> (g), Δ<sub>r</sub>H°<sub>298</sub> &lt; 0. Trong các yếu tố: (1) tăng nhiệt độ; (2) thêm một lượng hơi nước; (3) thêm một lượng H<sub>2</sub>; (4) tăng áp suất chung của hệ; (5) dùng chất xúc tác. Dãy gồm các yếu tố đều làm thay đổi cân bằng của hệ là:',
    ['(1), (4), (5)', '(2), (3), (4)', '(1), (2), (3)', '(1), (2), (4)'],
    'C',
    'Loại hai yếu tố không có tác dụng trước:<br>'
    + '• (4) Tăng áp suất chung: hai vế đều có 2 mol khí (1 + 1 = 2), số mol khí <b>không đổi</b> nên áp suất không làm cân bằng chuyển dịch.<br>'
    + '• (5) Chất xúc tác: chỉ làm cân bằng được thiết lập nhanh hơn, không làm chuyển dịch cân bằng.<br>'
    + 'Ba yếu tố còn lại đều làm chuyển dịch: (1) đổi nhiệt độ (phản ứng toả nhiệt nên tăng nhiệt độ đẩy về chiều nghịch), '
    + '(2) thêm hơi nước là thêm chất đầu, (3) thêm H<sub>2</sub> là thêm sản phẩm. Vậy chọn (1), (2), (3).'),

  cau(10, 'Cao',
    'Cho phản ứng hoá học sau ở 800°C: CaCO<sub>3</sub> (s) ⇌ CaO (s) + CO<sub>2</sub> (g) có K<sub>c</sub> = 0,534. Nồng độ CO<sub>2</sub> thu được nếu nhiệt phân 0,1 mol CaCO<sub>3</sub> trong bình kín có thể tích 1 L ở 800°C là:',
    ['0,534M', '6,675.10<sup>-4</sup>M', '0,8M', '0,1M'],
    'D',
    '<b>Bước 1 — Viết biểu thức K<sub>c</sub>.</b> CaCO<sub>3</sub> và CaO đều là chất rắn nguyên chất nên không có mặt trong biểu thức:<br>'
    + 'K<sub>c</sub> = [CO<sub>2</sub>] = 0,534<br>'
    + 'Nghĩa là <i>nếu</i> hệ đạt tới cân bằng thì nồng độ CO<sub>2</sub> tại cân bằng phải bằng 0,534 M.<br><br>'
    + '<b>Bước 2 — Xét lượng chất ban đầu.</b> Bình có V = 1 L, nên để đạt 0,534 M cần:<br>'
    + 'n<sub>CO₂</sub> = 0,534 × 1 = 0,534 mol<br>'
    + 'Theo tỉ lệ 1 : 1, cần tối thiểu 0,534 mol CaCO<sub>3</sub> bị phân huỷ. Nhưng đề chỉ cho <b>0,1 mol</b> CaCO<sub>3</sub>.<br><br>'
    + '<b>Bước 3 — Kết luận.</b> Ngay cả khi toàn bộ 0,1 mol CaCO<sub>3</sub> phân huỷ hết:<br>'
    + '[CO<sub>2</sub>]<sub>tối đa</sub> = 0,1 / 1 = 0,1 M &lt; 0,534 M<br>'
    + 'Lượng CaCO<sub>3</sub> không đủ, nên nó phân huỷ hết và trong bình không còn chất rắn CaCO<sub>3</sub> để duy trì cân bằng hai chiều — '
    + '<b>hệ không đạt được trạng thái cân bằng</b>. Nồng độ CO<sub>2</sub> thu được là 0,1 M.<br><br>'
    + '<i>Bẫy:</i> phương án 0,534 M là kết quả của việc đọc thẳng K<sub>c</sub> ra đáp số mà không kiểm lượng chất ban đầu.'),
];
