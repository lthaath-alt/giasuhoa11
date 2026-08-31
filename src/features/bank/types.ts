// ─── Ngân hàng câu hỏi hợp nhất ──────────────────────────────────────────────
//
// Một mô hình duy nhất dùng chung cho web và trò chơi "Vòng Quanh Hóa 11".
//
// Lấy đúng hình dạng của ngân hàng trong game (ch / lv / t) làm gốc, vì game
// đã có 160 câu mẫu và bộ 4 mức × 4 dạng chi tiết hơn web. Những trường web
// có mà game chưa có được thêm vào dạng TÙY CHỌN, để game bỏ qua cũng không
// sao mà web vẫn giữ đủ tính năng.
//
// Quy ước bắt buộc giữ: bài toán dùng điều kiện chuẩn 24,79 L/mol (chương
// trình 2018).

/** Chương 1–6 theo Kết nối tri thức */
export type Chapter = 1 | 2 | 3 | 4 | 5 | 6;

/** Mức độ — trùng LVKEYS của game */
export type Level = 'nb' | 'th' | 'vd' | 'vdc';

/** Dạng câu — trùng QTYPES của game */
export type QType = 'mc' | 'tf' | 'tn' | 'tl';

export const LEVELS: { key: Level; name: string; pts: number }[] = [
  { key: 'nb', name: 'Nhận biết', pts: 10 },
  { key: 'th', name: 'Thông hiểu', pts: 20 },
  { key: 'vd', name: 'Vận dụng', pts: 30 },
  { key: 'vdc', name: 'Vận dụng cao', pts: 40 },
];

export const QTYPE_NAME: Record<QType, string> = {
  mc: 'Trắc nghiệm',
  tf: 'Đúng/Sai',
  tn: 'Trả lời ngắn',
  tl: 'Tự luận',
};

export const CHAPTERS: { id: Chapter; name: string }[] = [
  { id: 1, name: 'Cân bằng hóa học' },
  { id: 2, name: 'Nitrogen – Sulfur' },
  { id: 3, name: 'Đại cương hóa học hữu cơ' },
  { id: 4, name: 'Hydrocarbon' },
  { id: 5, name: 'Dẫn xuất halogen – Alcohol – Phenol' },
  { id: 6, name: 'Hợp chất carbonyl – Carboxylic acid' },
];

/** Một ý trong câu Đúng/Sai — chấm điểm từng phần */
export interface TfStatement {
  /** Nội dung ý */
  s: string;
  /** Ý này đúng hay sai */
  v: boolean;
}

/** Một ý trong đáp án tự luận (web có, game chưa có) */
export interface EssayPoint {
  label: string;
  content: string;
}

/**
 * Câu hỏi trong ngân hàng hợp nhất.
 *
 * Các trường đánh dấu "chỉ web" là phần mở rộng: game không đọc tới nhưng
 * PHẢI giữ nguyên khi lưu lại, nếu không sửa câu trong game sẽ làm mất dữ
 * liệu của web.
 */
export interface BankQuestion {
  id: string;
  ch: Chapter;
  lv: Level;
  t: QType;

  /** Nội dung câu hỏi (có thể chứa <sub>, <sup> giữ từ file Word) */
  q: string;
  /** Lời giải thích hiện sau khi trả lời */
  e?: string;
  /** Một ảnh dạng data URI — game hỗ trợ sẵn */
  img?: string;
  /** Nguồn: "edited" nếu là câu mẫu đã sửa */
  src?: string;

  // ── Trắc nghiệm ──
  /** Đúng 4 phương án */
  o?: string[];
  /** Chỉ số phương án đúng, 0–3 */
  a?: number;

  // ── Đúng/Sai ──
  /** Tối thiểu 2 ý */
  st?: TfStatement[];

  // ── Trả lời ngắn ──
  /** Đáp án người nhập gõ vào, ví dụ "2,479" */
  ansText?: string;
  /** Giá trị số đã chuẩn hóa từ ansText */
  num?: number;
  /** Đơn vị, ví dụ "lít" */
  unit?: string;
  /** Sai số cho phép */
  tol?: number;

  // ── Tự luận ──
  /** Đáp án tham khảo để giáo viên đối chiếu khi chấm */
  ans?: string;

  // ── Phần mở rộng, chỉ web dùng ──
  /** Nhiều ảnh (web nhập từ Word có thể ra nhiều ảnh) */
  imgs?: string[];
  /** Đáp án tự luận tách theo từng ý để chấm chi tiết */
  essayPoints?: EssayPoint[];
  /** Điểm riêng; bỏ trống thì lấy theo mức độ trong LEVELS */
  points?: number;
  /** Gắn câu hỏi vào một bài học cụ thể */
  lessonId?: string;
  /** Chương dạng chuỗi của web, ví dụ "c1" */
  chapterId?: string;
  /** Chủ đề tự do */
  topic?: string;

  createdBy?: string;
  createdAt?: string;
}

/**
 * Kho lưu — TRÙNG KHỚP hình dạng game đang ghi vào IndexedDB
 * (kho "hoa11", store "kv", khóa "bank").
 *
 * Không được đổi tên khóa: game đọc thẳng object này.
 */
export interface BankStore {
  v: number;
  /** Câu tự nhập (không phải 160 câu mẫu dựng sẵn trong game) */
  questions: BankQuestion[];
  /** Id câu mẫu đã xoá, dạng "b:<chương>:<mức>:<idx>" */
  deleted: string[];
  /** Câu mẫu đã sửa, khóa là id câu mẫu */
  overrides: Record<string, BankQuestion>;
  /** Hàng chờ duyệt của game */
  pending: BankQuestion[];
  /** Mã PIN mở khu giáo viên trong game */
  pin: string;
}

export function emptyStore(): BankStore {
  return { v: 1, questions: [], deleted: [], overrides: {}, pending: [], pin: '2018' };
}

/** Điểm của một câu: ưu tiên điểm riêng, không có thì lấy theo mức độ */
export function pointsOf(q: BankQuestion): number {
  if (typeof q.points === 'number' && q.points > 0) return q.points;
  const lv = LEVELS.find(l => l.key === q.lv);
  return lv ? lv.pts : 10;
}
