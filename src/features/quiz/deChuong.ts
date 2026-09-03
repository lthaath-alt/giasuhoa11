// ─── Chọn câu cho đề kiểm tra tổng hợp một chương ────────────────────────────
//
// Tách riêng khỏi `quizService.ts` và CỐ Ý không import gì ngoài kiểu dữ liệu:
// quizService kéo theo questionBank → bankStore → firebase, mà firebase đọc
// `import.meta.env` và gọi `getAuth()` ngay lúc import. Chạy ngoài Vite (các
// script kiểm tra) là ném lỗi trước khi chạy được dòng nào.
//
// Phần chọn câu là logic thuần, không đọc ghi gì — để riêng ở đây thì viết được
// bài kiểm tra tự động cho nó, mà không phải dựng cả Firebase giả.

import { Question, DifficultyLevel } from '../library/types';

/**
 * Cơ cấu đề 10 câu.
 *
 * Mô hình câu hỏi cũ chỉ có 3 bậc (Thấp / Trung bình / Cao) trong khi ngân hàng
 * có 4 (nhận biết / thông hiểu / vận dụng / vận dụng cao), và `toLegacy` gộp
 * vận dụng cao vào "Cao". Nên 3 · 3 · 4 ở đây tương ứng 3 nhận biết · 3 thông
 * hiểu · 3 vận dụng · 1 vận dụng cao mà thầy cô quen thấy trong đề 15 phút.
 */
export const CO_CAU_DE_CHUONG: { muc: DifficultyLevel; can: number }[] = [
  { muc: 'Thấp', can: 3 },
  { muc: 'Trung bình', can: 3 },
  { muc: 'Cao', can: 4 },
];

export const SO_CAU_DE_CHUONG = 10;

function xaoTron<T>(ds: T[]): T[] {
  const a = [...ds];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Chọn tối đa 10 câu cho đề tổng hợp chương.
 *
 * Ưu tiên câu chưa từng làm → câu từng làm sai → câu đã làm đúng, để lần sau
 * làm lại không gặp y hệt đề cũ.
 *
 * Mức nào thiếu thì bù bằng câu bất kỳ còn lại chứ không bỏ trống: thà đề lệch
 * cơ cấu một chút còn hơn trả về đề 4 câu mà không nói gì cho học sinh biết.
 */
export function chonCauChoDeChuong(
  nganHang: Question[],
  doneIds: string[] = [],
  failedIds: string[] = [],
): Question[] {
  if (!nganHang.length) return [];

  const uuTien = (q: Question) =>
    !doneIds.includes(q.id) ? 0 : failedIds.includes(q.id) ? 1 : 2;

  const chon: Question[] = [];
  const daLay = new Set<string>();

  for (const { muc, can } of CO_CAU_DE_CHUONG) {
    const nhom = xaoTron(nganHang.filter(q => q.difficulty === muc && !daLay.has(q.id)))
      .sort((a, b) => uuTien(a) - uuTien(b));
    nhom.slice(0, can).forEach(q => { chon.push(q); daLay.add(q.id); });
  }

  if (chon.length < SO_CAU_DE_CHUONG) {
    xaoTron(nganHang.filter(q => !daLay.has(q.id)))
      .sort((a, b) => uuTien(a) - uuTien(b))
      .slice(0, SO_CAU_DE_CHUONG - chon.length)
      .forEach(q => { chon.push(q); daLay.add(q.id); });
  }

  const nang: Record<DifficultyLevel, number> = { 'Thấp': 1, 'Trung bình': 2, 'Cao': 3 };
  return chon.sort((a, b) => nang[a.difficulty] - nang[b.difficulty]);
}
