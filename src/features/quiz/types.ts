import { Question, QuestionType, DifficultyLevel } from '../library/types';

export interface QuizQuestion extends Omit<Question, 'correctAnswer' | 'essayPoints'> {
  // Giữ cấu trúc giống Question nhưng không có đáp án đúng để tránh học sinh soi devtools
  // Tuy nhiên, vì là offline hoàn toàn, ta lưu đáp án đúng tách biệt trong Quiz object ở Storage
}

export interface QuizQuestionResult {
  questionId: string;
  score: number;
  maxScore: number;
  correct: boolean;
  studentAnswer: string;
  correctAnswer: string;
  feedback: string; // Nhận xét của AI cho câu hỏi này
  confidence: 'high' | 'medium' | 'low'; // Độ tin cậy của AI khi chấm tự luận
  essayPointsPassed?: string[]; // Danh sách các ý tự luận được tính điểm
}

export interface Quiz {
  id: string;
  lessonId: string;
  chapterId: string;
  userEmail: string;
  questions: Question[]; // Lưu nguyên trạng Question để tiện render và so sánh
  answers: Record<string, string>; // key: questionId, value: câu trả lời của học sinh
  status: 'pending' | 'submitted';
  score: number;
  maxScore: number;
  createdAt: string;
  expiresAt: string;
  results?: Record<string, QuizQuestionResult>; // Kết quả chấm chi tiết từng câu

  /* ── Bài làm của một ĐỀ GIÁO VIÊN GIAO (22/09/2026) ─────────────────────────
     Hai trường này vắng mặt ở mọi bài tự ôn, nên có mặt là dấu hiệu duy nhất
     để phân biệt. Chỗ dùng: `QuizPage` không mời làm lại và không ghi tiến độ
     bài học cho đề của cô; màn giáo viên và học bạ học sinh hiện `tenDe` thay
     vì tra tên bài (đề giao không thuộc bài nào trong chương trình).
     PHẢI khai cả hai trong `baiNopHopLe` của firestore.rules — hàm đó dùng
     `hasOnly`, thiếu tên trường là em nộp bài bị từ chối. */
  /** Mã `de_giao` sinh ra bài này */
  deGiaoId?: string;
  /** Tên đề chép sẵn, để màn xem điểm khỏi phải đọc lại `de_giao` */
  tenDe?: string;
}

export interface QuizHistoryItem {
  quizId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}

// ─── Đề giáo viên GIAO cho cả lớp ────────────────────────────────────────────

/**
 * Một đề kiểm tra giáo viên giao cho một lớp — bản thật ở `de_giao/{id}`.
 *
 * Vì sao KHÔNG để trong localStorage như `Quiz`: đề giao phải tới được máy của
 * HỌC SINH. `QuizStorage` ghi vào localStorage của máy đang dùng, nên đề soạn
 * trên máy giáo viên thì không em nào mở được — đúng cái bẫy `bai_nop` đã vấp
 * ngày 18/09/2026, chỉ khác chiều đi.
 *
 * Đề mang theo NGUYÊN các câu hỏi chứ không mang danh sách id. Lý do: câu trong
 * `bank_questions` sửa được bất cứ lúc nào, mà một đề đã giao thì phải đứng yên
 * — cả lớp phải làm đúng đề cô giao, và giáo viên chấm lại sau một tháng vẫn
 * phải thấy đúng đề đó. Giá phải trả là tài liệu to (10 câu ≈ vài KB, ảnh base64
 * thì hơn), nhưng mỗi em chỉ đọc MỘT tài liệu cho cả bài kiểm tra.
 */
export interface DeGiao {
  id: string;
  /** Tên đề hiện cho học sinh, ví dụ "Kiểm tra 15 phút — Chương 2" */
  tieuDe: string;
  /** Lời dặn của giáo viên, hiện ở màn thông báo trước khi bấm làm bài */
  loiDan?: string;

  classId: string;
  /** Tên lớp chép sẵn, để màn thông báo khỏi phải đọc thêm `classes` */
  tenLop: string;
  teacherEmail: string;
  teacherName: string;

  questions: Question[];
  maxScore: number;
  /** Thời gian làm bài, tính bằng phút */
  soPhut: number;

  /** Mở đề từ lúc nào (ISO) — trước mốc này học sinh thấy "chưa tới giờ" */
  moLuc: string;
  /** Hạn nộp (ISO). Hết hạn là không vào làm được nữa. */
  dongLuc: string;
  createdAt: string;
  /** Giáo viên đóng đề sớm hơn `dongLuc` */
  dong: boolean;
}
