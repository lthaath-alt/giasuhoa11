/**
 * Trò chơi nào ôn được cho bài nào.
 *
 * "Rắn và Thang" có 25 màn ứng đúng 25 bài của chương trình, nên nó là lựa
 * chọn mặc định cho mọi bài. Hai trò còn lại chỉ gắn với đúng phần nội dung
 * của chúng, ghi trong chính mô tả trò chơi ở `GameHubSection`.
 */
export interface TroChoiOn {
  /** Trùng với `id` trong danh sách GAMES của GameHubSection */
  id: string;
  ten: string;
  /** Màn ứng với bài này (1–25); dùng để nhắc em chọn đúng màn */
  man: number;
}

/**
 * @param lessonId  mã bài, ví dụ 'bai-2'
 * @param chiSoBai  thứ tự bài trong chương trình, tính từ 0
 */
export function troChoiCuaBai(lessonId: string, chiSoBai: number): TroChoiOn {
  const man = chiSoBai + 1;
  if (lessonId === 'bai-2') return { id: 'tham-tu-hoa-chat', ten: 'Thám Tử Hóa Chất', man };
  return { id: 'ran-va-thang', ten: 'Rắn và Thang', man };
}
