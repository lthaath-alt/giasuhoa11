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

  /* KHÔNG có trường `password`, và cố ý như vậy từ 10/09/2026.
     Mật khẩu nay do Firebase Auth giữ ở dạng đã băm, không bao giờ về tới
     trình duyệt. Trước đó nó nằm ngay đây và trong collection `users` — mà
     `users` phải cho đọc công khai để hệ đăng nhập cũ chạy được, nên bất kỳ ai
     cũng tải về được mật khẩu của mọi người.
     Bỏ trường này khỏi kiểu là hàng rào MẠNH NHẤT trong cả đợt: mọi chỗ còn
     mang mật khẩu đi đều thành lỗi biên dịch, không cần regex nào đi tìm.
     Muốn truyền mật khẩu để TẠO tài khoản thì truyền thẳng vào
     `createAccountWithFirestore(...)` — nó chuyển tiếp cho Firebase Auth chứ
     không ghi xuống Firestore. */

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
   * Khác với classId (do Admin/GV gán), joinedClassId là do học sinh tự xin vào.
   * Học sinh có thể chuyển thành học sinh có lớp khi join (classId được đặt).
   */
  joinedClassId?: string;

  /**
   * Mã lớp học sinh đã chọn để XIN vào lớp — chưa được duyệt.
   *
   * Khác `classId`: đây mới là nguyện vọng. Học sinh KHÔNG tự đặt được
   * `classId` cho mình (luật Firestore chặn `affectedKeys()` chạm vào
   * `classId`/`schoolId`), nên đường duy nhất vào lớp là giáo viên bấm Duyệt
   * trong `ClassManagement` — và chính giáo viên ghi `classId` cùng
   * `classes.studentIdentifiers`.
   *
   * Cố ý KHÔNG kiểm mã có thật hay không lúc nhập: màn đăng ký chạy khi chưa
   * đăng nhập, mà từ đợt 2 `classes` chỉ nạp sau khi đăng nhập — mảng lúc đó
   * rỗng nên mọi lần tra đều trả "mã không tồn tại", kể cả mã đúng. Mã sai
   * đơn giản là không trùng lớp nào và không hiện ra ở đâu.
   */
  pendingClassCode?: string;

  /**
   * Nguyện vọng làm giáo viên — chưa được duyệt.
   *
   * Cùng khuôn với `pendingClassCode`: người xin ghi được trường này lên hồ sơ
   * của CHÍNH MÌNH (luật chỉ đòi `role == 'student'` lúc tự đăng ký và không
   * cấm trường phụ), nhưng KHÔNG tự đặt được `role` — đổi `role` là việc của
   * `laChuDuAn()` hoặc `laDongQuanTri()`.
   *
   * Chỉ coi là đơn khi giá trị ĐÚNG là 'teacher' VÀ `role === 'student'`. Giá
   * trị lạ thì lờ đi: đợt 2b đã trả giá vì một mã lớp gõ sai khoá học sinh khỏi
   * mọi lớp, do không ai thấy đơn để từ chối.
   */
  pendingRole?: 'teacher';

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

  /* ── Telemetry cho đề tài (thêm 14/09/2026, xem telemetryService.ts) ──────
     Tên trường theo đúng đặc tả số liệu của đề tài (gạch dưới), khác lối
     camelCase của ba trường đầu. CỐ Ý KHÔNG đổi tên `userEmail`/`lessonId`/
     `sender`: luật Firestore của `chats` kiểm quyền bằng `userEmail`, và các
     tin đã lưu đều mang tên cũ. Mọi trường dưới đây là TÙY CHỌN — tin lưu
     trước ngày này không có chúng. */
  /** Mã phiên giải một vấn đề; đổi khi xong bài hoặc ngừng 30 phút */
  session_id?: string;
  /** Mã băm FNV-1a của email (giả danh, KHÔNG phải ẩn danh tuyệt đối) */
  user_hash?: string;
  nhanh?: 'socratic' | 'truc-tiep';
  buoc?: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'loc';
  loai_luot?: 'goi_mo' | 'kiem_tra_hieu' | 'giai_thich' | 'tra_cuu' | 'hanh_chinh';
  /** Nấc giàn giáo máy trạng thái đã áp cho lượt trả lời này */
  muc_goi_y?: 0 | 1 | 2 | 3;
  /** Tin của học sinh là tin bế tắc (do mã nhận diện) */
  be_tac?: boolean;
  ma_ngo_nhan?: string;
  /** Loại ngoài môn: hai loại đầu do mô hình gắn nhãn, hai loại sau do mã phát hiện */
  ngoai_mon?: 'CAM_XUC_TIEU_CUC' | 'LAC_DE' | 'SPAM_ATTACK' | 'GIAN_LAN';
  model_name?: string;
  /** Thời gian học sinh chờ (ms), gồm cả lúc gõ cửa model đã hết lượt (từ 01/10/2026); KHÔNG gồm độ trễ giả lập */
  latency_ms?: number;
  /** Bộ chặn rò đáp số (P0-2) đã can thiệp vào lượt này */
  chan_ro?: boolean;
  /** Mô hình quên nhãn ẩn hoặc viết sai định dạng (P0-6) — đếm để biết nhãn hụt bao nhiêu */
  nhan_hong?: boolean;
  /** Nguồn đã trả lời (01/10/2026): 'gemini-firebase' | 'gemini-khoa-rieng'. Lượt không gọi mô hình thì trống */
  nha_cung_cap?: string;
  /** Đường đã đi: 'chinh' | 'xoay-gemini' | 'khoa-rieng'. Lọc 'chinh' để phân tích riêng model gốc.
      Trống ở các dòng TRƯỚC 01/10/2026 (trường này chưa tồn tại — lượt đó chỉ có thể là model
      chính hoặc khoá riêng của em) và ở lượt KHÔNG gọi model nào (gian lận phát hiện sớm, câu trả
      lời dựng sẵn); phân tích "chỉ model chính" trên dữ liệu cũ phải xử trống đúng theo hai ca
      trên, không coi trống là thiếu dữ liệu. */
  duong?: string;
  /** Ý định tin của EM do bộ phân loại logistic nhóm tự huấn luyện đoán (chạy bóng, 02/10/2026) — không đổi hành vi gia sư */
  y_dinh?: string;
  /** Xác suất của nhãn đoán (0–1, 3 chữ số) */
  y_dinh_xs?: number;
  /** Phiên bản tệp mô hình đã đoán — huấn luyện lại thì so theo phiên bản */
  y_dinh_phien_ban?: string;
}

export interface QuizAttempt {
  quizId: string;
  score: number;
  timestamp: string;
}

export interface LessonProgress {
  lessonId: string;
  /** Bài đã học: đạt 70% đề của bài HOẶC xem hết slide. KHÔNG phải điều kiện mở
   *  bài sau — cái đó là `bestScore`, xem `features/lessons/khoaBai.ts`. */
  basicCompleted: boolean;
  quizAttempts: QuizAttempt[];
  /** Điểm cao nhất ở đề kiểm tra của bài, thang 10. Bài sau mở khi số này ≥ 7. */
  bestScore: number;
  /* Ba trường dưới thuộc phần "Nâng cao" đã bỏ ngày 04/10/2026. GIỮ trong kiểu vì
     hồ sơ cũ trên Firestore còn mang chúng và các chỗ dựng hồ sơ mặc định vẫn
     điền; không nơi nào còn đọc để quyết định điều gì. Đừng dựa vào chúng. */
  advancedUnlocked: boolean;
  advancedCompleted: boolean;
  skippedAdvanced: boolean;
}

export interface LearningProgress {
  userEmail: string;
  completedLessons: string[]; // Danh sách các lessonId đã hoàn thành (legacy, fallback)
  details?: Record<string, LessonProgress>; // Map lessonId -> LessonProgress
  /* Tiến độ các trò chơi có chia màn: { 'ran-va-thang': { 'bai-4': {...} } }.
     CỐ Ý tách khỏi completedLessons — đó là tiến độ ĐỌC BÀI trên web, hai thứ
     khác nhau: em có thể qua màn trò chơi mà chưa đọc bài, và ngược lại. Trộn
     chung thì thanh tiến độ học tập bị trò chơi làm sai lệch. */
  /* `hang` là danh hiệu cao nhất từng đạt ở màn đó: 'xuatsac' | 'gioi' | 'kha'.
     Để dạng chuỗi tự do chứ không dựng kiểu chung, vì trò chơi là tệp HTML tĩnh
     nằm ngoài phần biên dịch của web — hai bên không dùng chung được kiểu nào. */
  /* `luc` là mốc thời gian (ms) của lần chơi XONG gần nhất — thêm 20/09/2026 để
     Luyện tập biết em chơi trước hay sau khi bị khoá. Bản ghi cũ không có nó. */
  troChoi?: Record<string, Record<string, { xong: boolean; cauDung: number; hang?: string; luc?: number }>>;
  /* Tiến độ mục Luyện tập: { 'bai-2': { mc: {...}, tf: {...}, tn: {...} } }.
     Kiểu đầy đủ là `TienDoLuyenTap` trong `features/practice/types.ts`. Để
     `unknown` ở đây vì `features/auth` nằm dưới cùng chuỗi import — khai kiểu
     thật sẽ tạo vòng phụ thuộc auth → practice → bank → auth. Chỗ dùng tự ép
     kiểu về TienDoLuyenTap. */
  luyenTap?: Record<string, unknown>;
}
