/**
 * storage.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Chỉ còn các hàm localStorage thuần tuý dành cho:
 *  - Dọn dữ liệu nhạy cảm đời cũ (`donDepLuuTruCu`)
 *  - Curriculum helpers (generate IDs, passwords, invite codes)
 *
 * ⚠️  Tất cả dữ liệu ứng dụng (users, schools, classes, questions, exams,
 *     equations, progress, chats) đã được chuyển sang Firestore.
 *     Xem: src/core/services/firestoreService.ts
 */

import { CHEMISTRY_11_CURRICULUM } from '../../features/lessons/constants';
import { Chapter, Lesson } from '../../features/lessons/types';

// ─── localStorage Keys (chỉ giữ những key còn dùng) ─────────────────────────

const GUEST_CHAT_COUNT_KEY = 'h11_tutor_guest_chat_count';
const CURRICULUM_KEY       = 'h11_tutor_curriculum';

// ─── Pure Utilities (không phụ thuộc storage) ─────────────────────────────────

/**
 * Tạo mật khẩu ngẫu nhiên 10 ký tự: chữ thường + chữ HOA + số.
 * Đảm bảo thoả rule: ≥8 ký tự, có chữ và có số.
 */
export function generateRandomPassword(): string {
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const all    = lower + upper + digits;

  const pick = (src: string) => src[Math.floor(Math.random() * src.length)];

  // Đảm bảo có ít nhất 1 chữ HOA, 1 chữ thường, 1 số
  const required = [pick(lower), pick(upper), pick(digits)];
  const rest = Array.from({ length: 7 }, () => pick(all));
  const combined = [...required, ...rest];

  // Shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join('');
}

/**
 * Sinh mã mời ngẫu nhiên 6 ký tự in hoa + số (dễ nhớ, khó nhầm lẫn).
 * Loại bỏ các ký tự dễ nhầm (0/O, 1/I/L).
 * Ví dụ: "K3M9PQ"
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Sinh mật khẩu có cấu trúc cho học sinh trong lớp.
 * Format: {TÊN_LỚP}_{SBD_2_CHỮ_SỐ}_{4_KÝ_TỰ_NGẪU_NHIÊN}
 * Ví dụ: 11A1_08_K7m2
 *
 * Bộ ký tự 4 ký tự ngẫu nhiên: chữ HOA + chữ thường + số.
 * Loại bỏ các ký tự dễ nhầm: 0 O o 1 l I.
 */
export function generateClassPassword(className: string, studentNumber: number): string {
  const lower  = 'abcdefghjkmnpqrstuvwxyz';   // loại o
  const upper  = 'ABCDEFGHJKMNPQRSTUVWXYZ';   // loại O, I
  const digits = '23456789';                   // loại 0, 1
  const all    = lower + upper + digits;

  const pick = (src: string) => src[Math.floor(Math.random() * src.length)];

  // Đảm bảo 4 ký tự có ít nhất 1 loại mỗi nhóm
  const required = [pick(upper), pick(lower), pick(digits)];
  const extra    = [pick(all)];
  const chars    = [...required, ...extra];

  // Shuffle 4 ký tự
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const sbd = String(studentNumber).padStart(2, '0');
  // Làm sạch tên lớp (bỏ khoảng trắng, ký tự đặc biệt)
  const cleanClassName = className.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '');
  return `${cleanClassName}_${sbd}_${chars.join('')}`;
}

// ─── Dọn dữ liệu nhạy cảm đời cũ trong localStorage ──────────────────────────

/* Bộ đếm lượt thử của khách và khoá phạt lạc đề đã chuyển lên Firestore
   (features/tutor/services/gioiHanChatService.ts) ngày 14/09/2026, vì ở
   localStorage thì xoá một khoá là hết giới hạn. Hàm dưới gỡ những gì bản cũ
   để lại trên máy học sinh — thường là máy dùng chung ở phòng máy:
     - `gemini_api_key_user`: API key Gemini riêng, lưu dạng chữ trần;
     - `h11_cooldown_<email>` và `h11_cooldown_logs`: có NGUYÊN VĂN tin lạc đề,
       kể cả tin tục, và email học sinh trong tên khoá;
     - bộ đếm khách cũ.
   Chạy mỗi lần mở app, rẻ và không hỏng gì nếu khoá không tồn tại. */
export function donDepLuuTruCu(): void {
  try {
    const xoa: string[] = ['gemini_api_key_user', GUEST_CHAT_COUNT_KEY, 'h11_cooldown_logs'];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('h11_cooldown_')) xoa.push(k);
    }
    xoa.forEach(k => localStorage.removeItem(k));
  } catch {
    /* Trình duyệt chặn localStorage (chế độ riêng tư) thì không có gì để dọn. */
  }
}

// ─── Curriculum Local Cache ───────────────────────────────────────────────────
// Curriculum được load từ Firestore (overrides) + constants. Hàm này chỉ merge.

/**
 * Merge overrides từ Firestore với baseline constants.
 * Nếu Firestore không có override cho chapter/lesson, dùng từ constants.
 */
export function mergeCurriculumWithConstants(overrides: Chapter[]): Chapter[] {
  if (overrides.length === 0) {
    // Chưa có override nào → trả thẳng từ constants
    return CHEMISTRY_11_CURRICULUM;
  }

  // Build map để tra nhanh
  const overrideMap = new Map(overrides.map(c => [c.id, c]));

  // Merge: overrides thay thế chapters cùng ID; bổ sung chapters từ constants nếu không có override
  const allChapterIds = new Set([
    ...CHEMISTRY_11_CURRICULUM.map(c => c.id),
    ...overrides.map(c => c.id),
  ]);

  return Array.from(allChapterIds).map(chapterId => {
    const override = overrideMap.get(chapterId);
    const constant = CHEMISTRY_11_CURRICULUM.find(c => c.id === chapterId);

    if (!override) return constant!;
    if (!constant) return override;

    // Merge lessons: override lessons thay thế; bổ sung textbook từ constants
    const lessonMap = new Map(override.lessons.map((l: Lesson) => [l.id, l]));
    const allLessonIds = new Set([
      ...constant.lessons.map(l => l.id),
      ...override.lessons.map((l: Lesson) => l.id),
    ]);

    const mergedLessons = Array.from(allLessonIds).map(lessonId => {
      const overrideLesson = lessonMap.get(lessonId);
      const constLesson = constant.lessons.find(l => l.id === lessonId);
      if (!overrideLesson) return constLesson!;
      if (!constLesson) return overrideLesson;
      return {
        ...overrideLesson,
        textbook: constLesson.textbook, // luôn lấy textbook từ constants
      };
    });

    return { ...override, title: override.title || constant.title, lessons: mergedLessons };
  });
}

// ─── StorageService (deprecated stub) ────────────────────────────────────────
// Để lại export rỗng để không bị lỗi import ở bất kỳ chỗ nào còn sót lại.
// Nếu sau này tìm thấy chỗ import StorageService còn dùng, hãy chuyển sang FirestoreService.

export const initializeMockData = () => {};

/** @deprecated Dùng FirestoreService thay thế */
export const StorageService = {
  // Chỉ giữ lại generateRandomPassword và generateInviteCode qua re-export
};
