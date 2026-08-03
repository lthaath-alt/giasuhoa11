/**
 * templateGenerator.ts
 * Tạo file Word mẫu (.docx) để Admin tải về và điền câu hỏi theo đúng định dạng.
 * Dùng kỹ thuật generate Blob từ nội dung XML docx tối giản (không cần thư viện).
 */

/** Nội dung template dưới dạng plain text (UTF-8) */
const TEMPLATE_CONTENT = `TEMPLATE NGÂN HÀNG CÂU HỎI — GIA SƯ HÓA 11
(Xóa dòng hướng dẫn này trước khi upload)
============================================================

HƯỚNG DẪN ĐIỀN:
- Mỗi câu hỏi bắt đầu bằng: Câu [số] [Loại] [Mức: ...] [Điểm: ...]
- Loại câu: Trắc nghiệm | Đúng/Sai | Tự luận
- Mức độ: Thấp | Trung bình | Cao
- Điểm: số dương (ví dụ: 1, 2, 3)
- Có thể chèn ảnh công thức/phương trình trực tiếp vào nội dung câu hỏi

============================================================
VÍ DỤ MẪU:

Câu 1 [Trắc nghiệm] [Mức: Thấp] [Điểm: 1]
Phản ứng nào sau đây là phản ứng thuận nghịch?
A. H₂ + Cl₂ → 2HCl
B. N₂ + 3H₂ ⇌ 2NH₃
C. 2KClO₃ → 2KCl + 3O₂
D. Na + H₂O → NaOH + ½H₂
Đáp án đúng: B

Câu 2 [Đúng/Sai] [Mức: Trung bình] [Điểm: 2]
Khi tăng nhiệt độ, hằng số cân bằng Kc của phản ứng thu nhiệt sẽ tăng lên.
Đáp án đúng: Đúng

Câu 3 [Tự luận] [Mức: Cao] [Điểm: 3]
Cho phản ứng: N₂(g) + 3H₂(g) ⇌ 2NH₃(g)  ΔH = -92 kJ/mol
Hãy cho biết cân bằng sẽ dịch chuyển theo chiều nào khi:
(a) Tăng áp suất
(b) Tăng nhiệt độ
(c) Thêm khí N₂ vào hệ
Đáp án mẫu:
Ý 1: (a) Tăng áp suất → cân bằng dịch sang chiều thuận (giảm số mol khí, từ 4 mol → 2 mol).
Ý 2: (b) Tăng nhiệt độ → cân bằng dịch sang chiều nghịch (thu nhiệt, ΔH > 0 chiều nghịch).
Ý 3: (c) Thêm N₂ → cân bằng dịch sang chiều thuận để tiêu thụ lượng N₂ tăng thêm.

============================================================
BẮT ĐẦU NHẬP CÂU HỎI TỪ ĐÂY:

Câu 1 [Trắc nghiệm] [Mức: Thấp] [Điểm: 1]
(Nhập nội dung câu hỏi)
A. (Nhập đáp án A)
B. (Nhập đáp án B)
C. (Nhập đáp án C)
D. (Nhập đáp án D)
Đáp án đúng: (A hoặc B hoặc C hoặc D)

Câu 2 [Đúng/Sai] [Mức: Trung bình] [Điểm: 2]
(Nhập phát biểu cần đánh giá Đúng/Sai)
Đáp án đúng: (Đúng hoặc Sai)

Câu 3 [Tự luận] [Mức: Cao] [Điểm: 3]
(Nhập đề bài tự luận — có thể kèm ảnh công thức bên dưới)
Đáp án mẫu:
Ý 1: (Nhập nội dung ý 1)
Ý 2: (Nhập nội dung ý 2)
Ý 3 (bổ sung): (Nhập nội dung ý 3 nếu có)
`;

/**
 * Tạo và tải xuống file Word mẫu (.doc dạng HTML disguised as Word).
 * Cách này không cần thư viện tạo docx, tương thích tốt với Microsoft Word.
 */
export function downloadWordTemplate(filename = 'template_ngan_hang_cau_hoi.doc'): void {
  // Tạo HTML giả lập Word document (Word có thể mở được)
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>90</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; margin: 2.54cm; }
    .title { font-size: 15pt; font-weight: bold; text-align: center; margin-bottom: 12pt; }
    .guide { background: #f0f0f0; padding: 10pt; border-left: 3pt solid #0062b8; margin-bottom: 16pt; }
    .question-header { font-weight: bold; color: #0062b8; margin-top: 18pt; }
    .answer { color: #cc0000; font-weight: bold; }
    .essay-point { margin-left: 24pt; }
    pre { font-family: 'Times New Roman', serif; white-space: pre-wrap; }
  </style>
</head>
<body>
<div class="title">TEMPLATE NGÂN HÀNG CÂU HỎI — GIA SƯ HÓA 11</div>
<div class="guide">
  <p><strong>HƯỚNG DẪN ĐIỀN:</strong></p>
  <p>• Mỗi câu hỏi bắt đầu bằng: <strong>Câu [số] [Loại] [Mức: ...] [Điểm: ...]</strong></p>
  <p>• Loại câu: <em>Trắc nghiệm</em> | <em>Đúng/Sai</em> | <em>Tự luận</em></p>
  <p>• Mức độ: <em>Thấp</em> | <em>Trung bình</em> | <em>Cao</em></p>
  <p>• Điểm: số dương (ví dụ: 1, 2, 3)</p>
  <p>• Có thể chèn ảnh công thức/phương trình trực tiếp vào nội dung câu hỏi</p>
  <p>• Subscript dùng Word Format → Subscript (Ctrl+= trong Word) để giữ định dạng H<sub>2</sub>O, CO<sub>2</sub>...</p>
</div>

<p style="text-align:center;color:#666;font-style:italic;">══════════ VÍ DỤ MẪU ══════════</p>

<p class="question-header">Câu 1 [Trắc nghiệm] [Mức: Thấp] [Điểm: 1]</p>
<p>Phản ứng nào sau đây là phản ứng thuận nghịch?</p>
<p>A. H<sub>2</sub> + Cl<sub>2</sub> → 2HCl</p>
<p>B. N<sub>2</sub> + 3H<sub>2</sub> ⇌ 2NH<sub>3</sub></p>
<p>C. 2KClO<sub>3</sub> → 2KCl + 3O<sub>2</sub></p>
<p>D. Na + H<sub>2</sub>O → NaOH + ½H<sub>2</sub></p>
<p class="answer">Đáp án đúng: B</p>

<p class="question-header">Câu 2 [Đúng/Sai] [Mức: Trung bình] [Điểm: 2]</p>
<p>Khi tăng nhiệt độ, hằng số cân bằng K<sub>c</sub> của phản ứng thu nhiệt sẽ tăng lên.</p>
<p class="answer">Đáp án đúng: Đúng</p>

<p class="question-header">Câu 3 [Tự luận] [Mức: Cao] [Điểm: 3]</p>
<p>Cho phản ứng: N<sub>2</sub>(g) + 3H<sub>2</sub>(g) ⇌ 2NH<sub>3</sub>(g) &nbsp;ΔH = −92 kJ/mol</p>
<p>Hãy cho biết cân bằng sẽ dịch chuyển theo chiều nào khi: (a) Tăng áp suất &nbsp;(b) Tăng nhiệt độ &nbsp;(c) Thêm N<sub>2</sub></p>
<p><strong>Đáp án mẫu:</strong></p>
<p class="essay-point">Ý 1: (a) Tăng áp suất → cân bằng dịch sang chiều thuận (giảm số mol khí, 4 mol → 2 mol).</p>
<p class="essay-point">Ý 2: (b) Tăng nhiệt độ → cân bằng dịch sang chiều nghịch (thu nhiệt).</p>
<p class="essay-point">Ý 3: (c) Thêm N<sub>2</sub> → cân bằng dịch sang chiều thuận.</p>

<p style="text-align:center;color:#666;font-style:italic;">══════════ BẮT ĐẦU NHẬP CÂU HỎI TỪ ĐÂY ══════════</p>

<p class="question-header">Câu 1 [Trắc nghiệm] [Mức: Thấp] [Điểm: 1]</p>
<p>(Nhập nội dung câu hỏi)</p>
<p>A. (Nhập đáp án A)</p>
<p>B. (Nhập đáp án B)</p>
<p>C. (Nhập đáp án C)</p>
<p>D. (Nhập đáp án D)</p>
<p class="answer">Đáp án đúng: (A hoặc B hoặc C hoặc D)</p>

<p class="question-header">Câu 2 [Đúng/Sai] [Mức: Trung bình] [Điểm: 2]</p>
<p>(Nhập phát biểu cần đánh giá Đúng/Sai)</p>
<p class="answer">Đáp án đúng: (Đúng hoặc Sai)</p>

<p class="question-header">Câu 3 [Tự luận] [Mức: Cao] [Điểm: 3]</p>
<p>(Nhập đề bài tự luận — có thể chèn ảnh công thức bên dưới)</p>
<p><strong>Đáp án mẫu:</strong></p>
<p class="essay-point">Ý 1: (Nhập nội dung ý 1)</p>
<p class="essay-point">Ý 2: (Nhập nội dung ý 2)</p>
<p class="essay-point">Ý 3 (bổ sung): (Nhập ý 3 nếu có)</p>

</body>
</html>`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=UTF-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
