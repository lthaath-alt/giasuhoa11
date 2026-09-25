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

/**
 * Phương án NEO — có mặt một cái là cả câu không được xáo (22/09/2026).
 *
 * "Tất cả đều sai", "cả A và B đều đúng", "cả A, B, C" chỉ có nghĩa khi nó
 * đứng CUỐI và khi những chữ cái nó nhắc tới còn nguyên chỗ. Xáo lên là câu
 * hỏi thành vô nghĩa: phương án A hoá ra "Tất cả đều sai", hoặc "cả A và B"
 * trỏ vào chính nó.
 *
 * Đo trên `public/bank/ngan-hang.json` ngày 22/09/2026: **12 trong 1.554 câu**
 * dính mẫu này, cộng thêm một câu trong đề mẫu `deMauCanBang.ts`. Ít, nhưng
 * hỏng thì hỏng câm — học sinh đọc ra một câu hỏi vô lý và tưởng mình dốt,
 * còn điểm vẫn ra một con số trông hợp lý.
 *
 * Cái giá phải trả: 12 câu đó giữ nguyên thế lệch đáp án mà `xaoPhuongAnWeb`
 * sinh ra để chữa. Đổi lại được sự đúng đắn — và chữa thật thì phải viết lại
 * nội dung 12 câu đó cho hết kiểu "tất cả đều đúng", việc của người soạn đề.
 */
const MAU_NEO = /^\s*(tất\s*cả|cả\s+[a-dA-D]\b|không\s+có\s+(đáp|phương|ý)|đáp\s*án\s*khác)/i;

/** Câu này có phương án nào phải đứng nguyên chỗ không? */
export function coPhuongAnNeo(noiDung: (string | undefined)[]): boolean {
  return noiDung.some(s => MAU_NEO.test(String(s ?? '')));
}

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
  if (coPhuongAnNeo(cau.o || [])) return cau;
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
  if (coPhuongAnNeo(cau.options.map(o => o.text))) return cau;
  const viTriDung = cau.options.findIndex(o => o.key === cau.correctAnswer);
  if (viTriDung < 0) return cau;   // đáp án không khớp chữ cái nào: để nguyên, đừng đoán

  const idx = hoanVi(cau.options.length);
  return {
    ...cau,
    options: cau.options.map((o, i) => ({ ...o, text: cau.options[idx[i]].text })),
    correctAnswer: cau.options[idx.indexOf(viTriDung)].key,
  };
}
