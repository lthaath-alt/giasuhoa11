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
}

export interface QuizHistoryItem {
  quizId: string;
  lessonId: string;
  score: number;
  maxScore: number;
  submittedAt: string;
}
