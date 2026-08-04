// ─── Thư viện câu hỏi — Types ─────────────────────────────────────────────────

/** Loại câu hỏi */
export type QuestionType = 'Trắc nghiệm' | 'Đúng/Sai' | 'Tự luận';

/** Mức độ khó */
export type DifficultyLevel = 'Thấp' | 'Trung bình' | 'Cao';

/**
 * Ảnh nhúng trong câu hỏi (extract từ file Word hoặc upload thủ công).
 * Lưu dưới dạng base64 để không cần server.
 */
export interface QuestionImage {
  id: string;
  /** Data URI: "data:image/png;base64,..." */
  base64: string;
  mimeType: string;
}

/** Đáp án cho câu Trắc nghiệm */
export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

/** Một ý trong đáp án Tự luận */
export interface EssayPoint {
  label: string;    // "Ý 1", "Ý 2", "Ý 3 (bổ sung)"…
  content: string;
}

/** Một câu hỏi trong ngân hàng */
export interface Question {
  id: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  points: number;

  /**
   * Nội dung câu hỏi — có thể chứa HTML <sub>, <sup> (subscript/superscript)
   * giữ nguyên từ file Word qua mammoth.
   */
  content: string;

  /** Ảnh nhúng gắn kèm câu hỏi (nếu có) */
  images: QuestionImage[];

  /** Chủ đề câu hỏi (VD: Cân bằng hóa học, v.v.) */
  topic?: string;

  /** Chỉ dùng cho Trắc nghiệm */
  options?: QuestionOption[];

  /**
   * Đáp án đúng:
   * - Trắc nghiệm: "A" | "B" | "C" | "D"
   * - Đúng/Sai: "Đúng" | "Sai"
   */
  correctAnswer?: string;

  /**
   * Đáp án mẫu tự luận — từng ý riêng biệt.
   * Yêu cầu ít nhất 1 ý; cảnh báo nếu Admin không tách ý.
   */
  essayPoints?: EssayPoint[];

  createdBy?: string;
  createdAt: string;
}

// ─── Đề thi, Phương trình, Ma trận ──────────────────────────────────────────

export interface LibraryExam {
  id: string;
  title: string;
  description: string;
  topic: string;
  type: 'Kho chung' | 'Do GV tự tải';
  questionCount?: number;
  driveLink?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Equation {
  id: string;
  equation: string;
  condition: string;
  type: string;
  notes: string;
  createdBy?: string;
  createdAt: string;
}

export interface MatrixResource {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  driveLink: string;
  createdBy?: string;
  createdAt: string;
}

/**
 * Dữ liệu câu hỏi của một bài học trong thư viện.
 * lessonId khớp với Lesson.id trong curriculum (AppContext).
 */
export interface LibraryLessonData {
  lessonId: string;
  chapterId: string;
  questions: Question[];
}

/**
 * Toàn bộ dữ liệu thư viện câu hỏi lưu trong localStorage.
 * Map: `${chapterId}__${lessonId}` → Question[]
 */
export type LibraryStore = Record<string, Question[]>;

// ─── Kết quả parse file Word ──────────────────────────────────────────────────

export interface ParsedQuestion extends Omit<Question, 'id' | 'createdAt'> {}

export interface ParseResult {
  /** Các câu hỏi parse thành công */
  questions: ParsedQuestion[];
  /** Lỗi parse (kèm vị trí câu để Admin sửa) */
  errors: ParseError[];
  /** Cảnh báo nhẹ (không chặn lưu) */
  warnings: ParseWarning[];
}

export interface ParseError {
  questionIndex: number; // 1-based
  message: string;
}

export interface ParseWarning {
  questionIndex: number;
  message: string;
}
