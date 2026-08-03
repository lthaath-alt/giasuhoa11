import { Question, LibraryStore } from './types';

// ─── localStorage Key ─────────────────────────────────────────────────────────

const LIBRARY_KEY = 'h11_library';

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Tạo composite key cho bài học: chapterId + lessonId */
export function makeLibraryKey(chapterId: string, lessonId: string): string {
  return `${chapterId}__${lessonId}`;
}

// ─── LibraryStorage ───────────────────────────────────────────────────────────

export const LibraryStorage = {

  /** Lấy toàn bộ store */
  getStore(): LibraryStore {
    const raw = localStorage.getItem(LIBRARY_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as LibraryStore;
    } catch {
      return {};
    }
  },

  /** Lưu toàn bộ store */
  saveStore(store: LibraryStore): void {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(store));
  },

  /**
   * Lấy danh sách câu hỏi của một bài học.
   * Trả về mảng rỗng nếu chưa có dữ liệu.
   */
  getQuestions(chapterId: string, lessonId: string): Question[] {
    const store = this.getStore();
    const key = makeLibraryKey(chapterId, lessonId);
    return store[key] ?? [];
  },

  /**
   * Nối thêm câu hỏi vào bài học — KHÔNG ghi đè câu cũ.
   * Câu mới được gán ID và timestamp.
   */
  appendQuestions(chapterId: string, lessonId: string, newQuestions: Omit<Question, 'id' | 'createdAt'>[]): Question[] {
    const store = this.getStore();
    const key = makeLibraryKey(chapterId, lessonId);
    const existing = store[key] ?? [];

    const timestamp = new Date().toISOString();
    const withIds: Question[] = newQuestions.map((q, idx) => ({
      ...q,
      id: `q_${Date.now()}_${idx}`,
      createdAt: timestamp,
    }));

    store[key] = [...existing, ...withIds];
    this.saveStore(store);
    return store[key];
  },

  /**
   * Cập nhật một câu hỏi theo ID.
   * Trả về false nếu không tìm thấy.
   */
  updateQuestion(chapterId: string, lessonId: string, questionId: string, updates: Partial<Question>): boolean {
    const store = this.getStore();
    const key = makeLibraryKey(chapterId, lessonId);
    const list = store[key];
    if (!list) return false;

    const idx = list.findIndex(q => q.id === questionId);
    if (idx === -1) return false;

    list[idx] = { ...list[idx], ...updates };
    store[key] = list;
    this.saveStore(store);
    return true;
  },

  /**
   * Xóa một câu hỏi theo ID.
   */
  deleteQuestion(chapterId: string, lessonId: string, questionId: string): void {
    const store = this.getStore();
    const key = makeLibraryKey(chapterId, lessonId);
    if (!store[key]) return;
    store[key] = store[key].filter(q => q.id !== questionId);
    this.saveStore(store);
  },

  /**
   * Xóa toàn bộ câu hỏi của một bài học
   * (dùng khi bài học bị xóa khỏi curriculum).
   */
  clearLesson(chapterId: string, lessonId: string): void {
    const store = this.getStore();
    const key = makeLibraryKey(chapterId, lessonId);
    delete store[key];
    this.saveStore(store);
  },

  /**
   * Đếm tổng số câu hỏi của tất cả bài trong một chương.
   */
  countByChapter(chapterId: string): number {
    const store = this.getStore();
    let total = 0;
    for (const key of Object.keys(store)) {
      if (key.startsWith(`${chapterId}__`)) {
        total += store[key].length;
      }
    }
    return total;
  },

  /**
   * Số câu hỏi tối thiểu khuyến cáo mỗi bài.
   */
  MIN_QUESTIONS_WARNING: 10,
};
