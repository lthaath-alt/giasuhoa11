// ─── Enums / Union Types ─────────────────────────────────────────────────────

/**
 * Vai trò người dùng trong hệ thống — 4 bậc, khớp đúng 4 guard trong RouteGuards.
 *
 * Gộp lại ngày 01/09/2026 từ 7 tên rời rạc trong dữ liệu thật:
 *   super_admin, admin, system_admin  ->  admin
 *   school_admin                      ->  school_admin  (KHÔNG gộp lên admin:
 *                                        admin trường chỉ quản một trường)
 *   teacher                           ->  teacher
 *   student, free_user                ->  student
 *
 * `free_user` (học sinh chưa vào lớp) bị bỏ vì trùng thông tin: "có lớp hay
 * không" đã nằm ở `classId`. Quyền tự đổi mật khẩu nay đọc từ `canChangePassword`
 * chứ không suy ra từ vai trò.
 */
export type UserRole = 'admin' | 'school_admin' | 'teacher' | 'student';

/** Tên vai trò cũ -> tên mới. Giữ để dữ liệu chưa kịp đổi vẫn đọc lên đúng. */
export const VAI_TRO_CU: Record<string, UserRole> = {
  super_admin: 'admin',
  system_admin: 'admin',
  admin: 'admin',
  school_admin: 'school_admin',
  teacher: 'teacher',
  student: 'student',
  free_user: 'student',
};

/** Đưa mọi cách ghi vai trò (cũ lẫn mới) về đúng 4 bậc hiện hành. */
export function chuanHoaVaiTro(raw?: string): UserRole {
  return VAI_TRO_CU[String(raw || '').trim()] ?? 'student';
}

/** Trạng thái tài khoản */
export type UserStatus = 'active' | 'pending' | 'rejected';

/** Nhà cung cấp xác thực */
export type AuthProvider = 'local' | 'google';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  /** ID duy nhất (UUID hoặc email-based hash) */
  id: string;

  /** Email đăng nhập (bắt buộc cho mọi user trừ HS không có email thật) */
  email: string;

  /**
   * Username nội bộ – dùng cho học sinh không có email thật.
   * Định dạng gợi ý: "hs_<tenHS>_<lop>" hoặc do GV đặt.
   */
  username?: string;

  /** Mật khẩu (plain-text trong mock; có thể hash sau này) */
  password?: string;

  /** Họ và tên hiển thị */
  name: string;

  /** Vai trò: quản trị hệ thống | quản trị trường | giáo viên | học sinh */
  role: UserRole;

  /** Trạng thái tài khoản */
  status: UserStatus;

  /** Thời điểm tạo tài khoản (ISO string) */
  createdAt: string;

  // ── Thông tin trường học (chỉ áp dụng cho teacher / student) ──────────────

  /** ID của trường học mà user thuộc về */
  schoolId?: string;

  /** ID lớp học (áp dụng cho học sinh) */
  classId?: string;

  // ── Xác thực (Auth) ───────────────────────────────────────────────────────

  /** Nguồn đăng ký: 'local' (email+mật khẩu thủ công) | 'google' (qua Google OAuth) */
  authProvider: AuthProvider;

  /** Google Subject ID (sub) – nhận từ id_token của Google khi OAuth */
  googleId?: string;

  // ── Bảo mật ───────────────────────────────────────────────────────────────

  /**
   * Người dùng có được tự đổi mật khẩu không?
   *
   * ĐỌC THẲNG TỪ TRƯỜNG NÀY, đừng suy ra từ `role` hay `classId`. Trước đợt gộp
   * vai trò 01/09/2026, quy tắc "free_user thì false" chỉ nằm trong chú thích mà
   * chưa bao giờ được ghi vào dữ liệu — nên suy luận sẽ ra kết quả sai.
   *
   * Quy ước hiện hành:
   * - Học sinh do giáo viên tạo: false (GV cấp lại mật khẩu)
   * - Học sinh tự đăng ký, giáo viên, quản trị: true
   */
  canChangePassword: boolean;

  /** Mật khẩu mới được tạo ngẫu nhiên khi "Quên mật khẩu" (chờ user lấy) */
  pendingPassword?: string;

  /**
   * ID lớp học mà học sinh đã tham gia qua mã mời (join class by code).
   * Khác với classId (do Admin/GV gán), joinedClassId là do học sinh tự nhập mã.
   * Học sinh có thể chuyển thành học sinh có lớp khi join (classId được đặt).
   */
  joinedClassId?: string;

  /**
   * Số báo danh trong lớp (chỉ áp dụng cho học sinh được GV tạo tài khoản).
   * Dùng để sinh mật khẩu có cấu trúc: {TÊN_LỚP}_{SBD:02d}_{4random}.
   */
  studentNumber?: number;
}

// ─── School ──────────────────────────────────────────────────────────────────

export interface School {
  /** ID duy nhất của trường */
  id: string;

  /** Tên trường */
  name: string;

  /**
   * Danh sách email của Admin trường.
   * Một trường có thể có nhiều Admin.
   */
  adminEmails: string[];

  /** Thời điểm tạo (ISO string) */
  createdAt: string;
}

// ─── SchoolClass ──────────────────────────────────────────────────────────────

export interface SchoolClass {
  /** ID duy nhất của lớp */
  id: string;

  /** ID trường học sở hữu lớp này */
  schoolId: string;

  /** Tên lớp, ví dụ: "11A1", "11 Toán" */
  name: string;

  /**
   * Email của giáo viên chủ nhiệm quản lý lớp.
   * Một lớp chỉ có một GVCN tại một thời điểm.
   */
  teacherEmail: string;

  /**
   * Danh sách email hoặc username của học sinh trong lớp.
   * Học sinh không có email thật sẽ dùng username nội bộ.
   */
  studentIdentifiers: string[];

  /** Thời điểm tạo lớp (ISO string) */
  createdAt: string;

  /**
   * Mã mời duy nhất (6 ký tự in hoa) để học sinh tự tham gia lớp.
   * Được sinh tự động khi tạo lớp.
   * Vi dụ: "ABC123"
   */
  inviteCode: string;
}

// ─── Chat & Progress (giữ nguyên) ────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  userEmail: string; // 'guest' nếu là khách vãng lai
  lessonId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  timestamp: string;
}

export interface LessonProgress {
  lessonId: string;
  basicCompleted: boolean;
  quizAttempts: QuizAttempt[];
  bestScore: number;
  advancedUnlocked: boolean;
  advancedCompleted: boolean;
  skippedAdvanced: boolean;
}

export interface LearningProgress {
  userEmail: string;
  completedLessons: string[]; // Danh sách các lessonId đã hoàn thành (legacy, fallback)
  details?: Record<string, LessonProgress>; // Map lessonId -> LessonProgress
}
