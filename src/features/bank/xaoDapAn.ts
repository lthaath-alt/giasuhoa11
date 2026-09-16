// ─── Xáo vị trí phương án trước khi giao đề ──────────────────────────────────
//
// Vì sao cần: đo trên 194 câu trắc nghiệm của ngân hàng ngày 14/09/2026, đáp án
// đúng rơi vào A 60 câu (31%), B 93 câu (48%), C 32 câu (16%), D 9 câu (5%);
// χ² ≈ 81 so với phân bố đều, p < 0,001. Riêng 160 câu mẫu của trò chơi thì B
// chiếm 57%. Câu Đúng/Sai cũng lệch: ý thứ nhất là "Đúng" ở 25/34 câu (74%).
// Học sinh chỉ cần chọn B là đúng gần một nửa số câu, nên điểm luyện tập và
// điểm đề kiểm tra không còn đo được năng lực.
//
// Cách chữa ở đây là xáo lúc GIAO ĐỀ, không sửa dữ liệu trong kho: câu hỏi
// trong ngân hàng giữ nguyên để giáo viên soạn và soát, còn mỗi lượt làm bài
// nhận một thứ tự khác.
//
// Xáo xong thì đáp án đi theo: `a` trỏ tới vị trí mới, và với câu Đúng/Sai thì
// cả mệnh đề lẫn giá trị đúng/sai đổi chỗ cùng nhau. Nhờ vậy mọi chỗ chấm điểm
// (`chamCau` của Luyện tập, `gradeQuiz` của Đề kiểm tra) không phải sửa gì.
//
// Tệp này KHÔNG import gì ngoài kiểu, để bộ kiểm chạy thẳng bằng Node.

import type { BankQuestion } from './types';
import type { Question } from '../library/types';

/** Fisher–Yates: mọi hoán vị có xác suất bằng nhau. */
function hoanVi(n: number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

/**
 * Xáo phương án cho một câu của ngân hàng hợp nhất (Luyện tập, trò chơi).
 * Câu trả lời ngắn và tự luận trả về nguyên vẹn.
 */
export function xaoPhuongAnBank(cau: BankQuestion): BankQuestion {
  if (cau.t === 'mc' && cau.o && cau.o.length > 1 && typeof cau.a === 'number') {
    const idx = hoanVi(cau.o.length);
    return {
      ...cau,
      o: idx.map(k => cau.o![k]),
      a: idx.indexOf(cau.a),
    };
  }
  if (cau.t === 'tf' && cau.st && cau.st.length > 1) {
    const idx = hoanVi(cau.st.length);
    return { ...cau, st: idx.map(k => cau.st![k]) };
  }
  return cau;
}

/**
 * Xáo phương án cho câu theo mô hình cũ của web (Đề kiểm tra).
 *
 * Chữ cái A–D đứng yên, chỉ NỘI DUNG phương án đổi chỗ, và `correctAnswer` trỏ
 * sang chữ cái đang giữ nội dung đúng. Làm ngược lại (xáo cả chữ cái) thì đề in
 * ra sẽ có thứ tự B, D, A, C.
 */
export function xaoPhuongAnWeb(cau: Question): Question {
  if (cau.type !== 'Trắc nghiệm' || !cau.options || cau.options.length < 2) return cau;
  const viTriDung = cau.options.findIndex(o => o.key === cau.correctAnswer);
  if (viTriDung < 0) return cau;   // đáp án không khớp chữ cái nào: để nguyên, đừng đoán

  const idx = hoanVi(cau.options.length);
  return {
    ...cau,
    options: cau.options.map((o, i) => ({ ...o, text: cau.options[idx[i]].text })),
    correctAnswer: cau.options[idx.indexOf(viTriDung)].key,
  };
}
