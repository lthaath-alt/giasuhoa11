import { Quiz, QuizQuestionResult } from './types';

const STORAGE_KEY = 'h11_quizzes';

export const QuizStorage = {
  getQuizzes(): Quiz[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveQuizzes(quizzes: Quiz[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  },

  getQuizById(id: string): Quiz | undefined {
    return this.getQuizzes().find(q => q.id === id);
  },

  addQuiz(quiz: Quiz): boolean {
    const quizzes = this.getQuizzes();
    if (quizzes.some(q => q.id === quiz.id)) return false;
    quizzes.push(quiz);
    this.saveQuizzes(quizzes);
    return true;
  },

  updateQuiz(id: string, updates: Partial<Quiz>): boolean {
    const quizzes = this.getQuizzes();
    const idx = quizzes.findIndex(q => q.id === id);
    if (idx === -1) return false;
    quizzes[idx] = { ...quizzes[idx], ...updates };
    this.saveQuizzes(quizzes);
    return true;
  },

  /** Lấy lịch sử làm bài kiểm tra của học sinh cho bài học cụ thể */
  getUserQuizHistory(email: string, lessonId: string): Quiz[] {
    return this.getQuizzes()
      .filter(q => q.userEmail.toLowerCase() === email.toLowerCase() && q.lessonId === lessonId && q.status === 'submitted')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /** Lấy danh sách ID câu hỏi học sinh đã từng làm */
  getQuestionsDone(email: string, lessonId: string): string[] {
    const history = this.getUserQuizHistory(email, lessonId);
    const ids = new Set<string>();
    for (const quiz of history) {
      if (quiz.results) {
        Object.keys(quiz.results).forEach(qId => ids.add(qId));
      }
    }
    return Array.from(ids);
  },

  /** Lấy danh sách ID câu hỏi học sinh làm SAI ở lần làm bài kiểm tra gần nhất */
  getQuestionsFailed(email: string, lessonId: string): string[] {
    const history = this.getUserQuizHistory(email, lessonId);
    if (history.length === 0) return [];

    // Lấy bài kiểm tra gần nhất
    const latestQuiz = history[0];
    if (!latestQuiz.results) return [];

    return (Object.values(latestQuiz.results) as QuizQuestionResult[])
      .filter(r => !r.correct)
      .map(r => r.questionId);
  }
};
