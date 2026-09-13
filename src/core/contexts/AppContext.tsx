import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, ChatMessage, LearningProgress, School, SchoolClass } from '../../features/auth/types';
import { Chapter, Lesson } from '../../features/lessons/types';
import { generateRandomPassword, generateInviteCode, generateClassPassword, GuestChatStorage, mergeCurriculumWithConstants } from '../services/storage';
import { generateAIResponse } from '../../features/tutor/services/geminiTutorService';
import {
  getRemainingCooldown,
  recordOffTopicStrike,
  formatCooldownMessage,
  formatCooldownActivationNotice
} from '../../features/tutor/services/cooldownService';
import { GoogleUserInfo } from '../services/googleAuth';
import { QuizService } from '../../features/quiz/quizService';
import { BankFirestore } from '../../features/bank/bankStore';
import { toLegacy, toChapter } from '../../features/bank/convert';
import { QuizStorage } from '../../features/quiz/quizStorage';
import { loginWithFirestore, createAccountWithFirestore, resetPasswordWithFirestore } from '../services/firestoreAuth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { FirestoreService } from '../services/firestoreService';
import { runMigrationIfNeeded } from '../services/migrationService';
import { ErrorLogService } from '../services/errorLog';
import { UserRole, chuanHoaVaiTro } from '../../features/auth/types';
import { LibraryExam, Equation, MatrixResource, Question } from '../../features/library/types';
import { EMAIL_CHU_DU_AN, laChuDuAn } from '../services/quanTri';

// ─── Shared Data Types ────────────────────────────────────────────────────────

export interface CreateTeacherData {
  name: string;
  email: string;
  /** Nếu không truyền, hệ thống tự tạo mật khẩu ngẫu nhiên */
  password?: string;
  schoolId: string;
}

export interface CreateSchoolAdminData {
  name: string;
  email: string;
  /** Nếu không truyền, hệ thống tự tạo mật khẩu ngẫu nhiên */
  password?: string;
  schoolId: string;
}

export interface CreateStudentData {
  name: string;
  /** Email thật (nếu có). Không bắt buộc. */
  email?: string;
  /** Username nội bộ (nếu không có email). Ít nhất 1 trong 2 phải có. */
  username?: string;
  /** Nếu không truyền, hệ thống tự tạo mật khẩu theo cấu trúc lớp */
  password?: string;
  classId: string;
  schoolId: string;
  /** Số báo danh trong lớp. Nếu không truyền, tự lấy số tiếp theo. */
  studentNumber?: number;
}

/** Thông tin đăng nhập hiển thị cho Admin/GV sau khi tạo tài khoản */
export interface AuthCredentials {
  /** Email hoặc username dùng để đăng nhập */
  identifier: string;
  password: string;
  name: string;
}

// ─── Context Interface ────────────────────────────────────────────────────────

export interface AppContextType {
  currentUser: User | null;
  users: User[];
  chats: ChatMessage[];
  guestChatCount: number;
  loading: boolean;
  curriculum: Chapter[];
  schools: School[];
  classes: SchoolClass[];

  // ── Xác thực ────────────────────────────────────────────────────────────────

  /** Đăng nhập bằng email/username + mật khẩu */
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;

  /**
   * Xử lý sau khi Google trả về thông tin user.
   * - Nếu đã có tài khoản Google: đăng nhập luôn.
   * - Nếu email trùng với tài khoản local/trường học: báo lỗi.
   * - Nếu mới hoàn toàn: yêu cầu đặt mật khẩu (requireSetPassword = true).
   */
  loginWithGoogle: (googleInfo: GoogleUserInfo) => Promise<{
    success: boolean;
    message: string;
    requireSetPassword?: boolean;
    user?: User;
  }>;

  /**
   * Hoàn tất đăng ký sau bước OAuth Google – đặt mật khẩu lần đầu.
   * Chỉ gọi khi loginWithGoogle trả về requireSetPassword = true.
   */
  completeGoogleRegistration: (googleInfo: GoogleUserInfo, password: string) => Promise<{
    success: boolean;
    message: string;
    user?: User;
  }>;

  /**
   * Đăng ký tài khoản học sinh thủ công (chờ Admin duyệt).
   * Dành cho luồng cũ; trong hệ thống mới khuyến khích dùng Google.
   */
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>;

  /** Đăng xuất */
  logout: () => void;

  /**
   * Quên mật khẩu: tạo mật khẩu ngẫu nhiên mới, trả về để hiển thị trên UI.
   * Không gửi email thật (mock).
   */
  forgotPassword: (identifier: string) => Promise<{
    success: boolean;
    message: string;
    newPassword?: string;
    email?: string;
  }>;

  // ── Library & Databank ──────────────────────────────────────────────────────
  exams: LibraryExam[];
  addExam: (exam: Omit<LibraryExam, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;

  equations: Equation[];
  addEquation: (eq: Omit<Equation, 'id' | 'createdAt'>) => void;
  deleteEquation: (id: string) => void;

  matrixResources: MatrixResource[];
  addMatrixResource: (res: Omit<MatrixResource, 'id' | 'createdAt'>) => void;
  deleteMatrixResource: (id: string) => void;

  libraryQuestions: Question[];
  addLibraryQuestion: (q: Omit<Question, 'id' | 'createdAt'>) => void;
  deleteLibraryQuestion: (id: string) => void;

  // ── Quản lý người dùng (Admin hệ thống) ────────────────────────────────────

  approveUser: (email: string) => void;
  rejectUser: (email: string) => void;
  deleteUser: (id: string) => void;
  updateUserInfo: (id: string, updates: Partial<User>) => void;

  // ── Quản lý Trường học ──────────────────────────────────────────────────────

  /** Admin hệ thống tạo trường mới và gán adminEmail */
  createSchool: (name: string, adminEmail: string) => Promise<{
    success: boolean;
    message: string;
    school?: School;
  }>;

  /**
   * Super Admin tạo tài khoản Admin trường học.
   * Trả về credentials để hiển thị / in ra.
   */
  createSchoolAdmin: (data: CreateSchoolAdminData) => Promise<{
    success: boolean;
    message: string;
    credentials?: AuthCredentials;
  }>;

  /**
   * Admin trường tạo tài khoản Giáo viên.
   * Trả về credentials để hiển thị / in ra.
   */
  createTeacher: (data: CreateTeacherData) => Promise<{
    success: boolean;
    message: string;
    credentials?: AuthCredentials;
  }>;

  // ── Quản lý Lớp học ──────────────────────────────────────────────────────────

  /** Admin trường tạo lớp và gán GVCN */
  createClass: (schoolId: string, className: string, teacherEmail: string) => Promise<{
    success: boolean;
    message: string;
    schoolClass?: SchoolClass;
  }>;

  /** Sửa thông tin lớp */
  updateClass: (classId: string, className: string, teacherEmail: string) => Promise<{
    success: boolean;
    message: string;
  }>;

  /** Xoá lớp */
  deleteClass: (classId: string) => Promise<{
    success: boolean;
    message: string;
  }>;

  /**
   * Giáo viên tạo tài khoản học sinh trong lớp mình.
   * Trả về credentials để hiển thị / in ra.
   */
  createStudent: (data: CreateStudentData) => Promise<{
    success: boolean;
    message: string;
    credentials?: AuthCredentials;
  }>;

  /** Lấy lớp mà GV hiện tại đang quản lý */
  getMyClass: () => SchoolClass | undefined;

  // ── Chat & Tiến độ ────────────────────────────────────────────────────────────

  addMessage: (lessonId: string, content: string) => Promise<void>;
  /**
   * Load lịch sử chat từ Firestore cho (userEmail, lessonId) rồi merge vào state.
   * Gọi khi vào bài học để hiển thị đúng lịch sử.
   */
  loadLessonChats: (lessonId: string) => Promise<void>;
  toggleLessonCompletion: (lessonId: string) => void;
  updateLessonProgress: (lessonId: string, updates: Partial<import('../../features/auth/types').LessonProgress>) => Promise<void>;
  clearLessonHistory: (lessonId: string) => void;
  getUserProgress: (email: string) => LearningProgress | null;
  luuTienDoTroChoi: (email: string, tro: string, bai: string,
                     ketQua: { xong: boolean; cauDung: number; hang?: string }) => Promise<void>;
  luuTienDoLuyenTap: (email: string, bai: string, phan: string,
                      tienDoPhan: unknown) => Promise<void>;
  getLessonProgress: (lessonId: string) => import('../../features/auth/types').LessonProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
  hasAdvancedStudentTitle: (email: string) => boolean;
  resetGuestChats: () => void;

  // ── Chương trình học ──────────────────────────────────────────────────────────

  deleteChapter: (chapterId: string) => void;
  deleteLesson: (chapterId: string, lessonId: string) => void;
  addChapter: (title: string) => void;
  addLesson: (chapterId: string, title: string, summary: string, formulae: string[], commonQuestions: any[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updateLesson: (chapterId: string, lessonId: string, updatedLesson: Partial<Lesson>) => void;

  // ── Quản lý lớp và tham gia lớp ─────────────────────────────────────────────

  /**
   * Học sinh tự đăng ký tài khoản (role='student', chưa có lớp).
   * Chọn lớp làm ở tab Học sinh sau khi đăng nhập.
   */
  registerStudent: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;

  /**
   * Người ngoài tự đăng ký, xin làm giáo viên (role vẫn là 'student' cho tới
   * khi chủ dự án/đồng quản trị duyệt). Gọi lại `registerStudent` rồi ghi
   * thêm `pendingRole: 'teacher'`.
   */
  registerTeacherApplicant: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;

  /**
   * Giáo viên tự tạo lớp (không qua Admin).
   * Sinh inviteCode tự động.
   */
  createClassSelf: (className: string) => Promise<{
    success: boolean;
    message: string;
    schoolClass?: SchoolClass;
  }>;

  /**
   * Học sinh đã đăng nhập chọn lớp để gửi đơn xin vào.
   * Gán học sinh chưa có lớp vào một lớp (đặt classId).
   * Lịch sử học tập được GIỮ NGUYÊN.
   */
  joinClassByCode: (code: string) => Promise<{
    success: boolean;
    message: string;
    className?: string;
  }>;

  /** Giáo viên duyệt đơn xin vào lớp (thêm học sinh vào lớp) */
  approveJoinRequest: (studentId: string, classId: string) => Promise<{ success: boolean; message: string }>;
  /** Giáo viên từ chối đơn xin vào lớp (chỉ xoá nguyện vọng) */
  rejectJoinRequest: (studentId: string) => Promise<{ success: boolean; message: string }>;

  /** Giáo viên/Admin chấm lại điểm câu tự luận của học sinh */
  updateQuizEssayScore: (
    quizId: string,
    questionId: string,
    newScore: number
  ) => Promise<{ success: boolean; message: string }>;

  // ── Cài đặt hệ thống ─────────────────────────────────────────────────────────
  systemSettings: { allowUserApiKey?: boolean };
  updateSystemSettings: (settings: { allowUserApiKey?: boolean }) => Promise<boolean>;

  // ── Đồng quản trị ────────────────────────────────────────────────────────────
  dongQuanTri: string[];
  laChuDuAnHienTai: boolean;
  laDongQuanTriHienTai: boolean;
  themDongQuanTri: (email: string) => Promise<{ success: boolean; message: string }>;
  boDongQuanTri: (email: string) => Promise<{ success: boolean; message: string }>;
}

// ─── Context & Provider ───────────────────────────────────────────────────────

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [guestChatCount, setGuestChatCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [curriculum, setCurriculum] = useState<Chapter[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [exams, setExams] = useState<LibraryExam[]>([]);
  const [equations, setEquations] = useState<Equation[]>([]);
  const [matrixResources, setMatrixResources] = useState<MatrixResource[]>([]);
  const [libraryQuestions, setLibraryQuestions] = useState<Question[]>([]);
  const [systemSettings, setSystemSettings] = useState<{ allowUserApiKey?: boolean }>({ allowUserApiKey: true });
  const [dongQuanTri, setDongQuanTri] = useState<string[]>([]);

  // ── Progress cache (load theo user khi đăng nhập) ─────────────────────────
  const [progressCache, setProgressCache] = useState<Record<string, LearningProgress>>({});

  // ── Nạp dữ liệu khi khởi động từ Firestore ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Chạy migration localStorage → Firestore nếu chưa làm
      await runMigrationIfNeeded();

      /* 2. Tải NỘI DUNG HỌC — những collection đọc công khai.
            `users` và `classes` KHÔNG tải ở đây: từ đợt 2 (10/09/2026), luật
            Firestore đòi đăng nhập mới đọc được hai collection đó, vì chúng
            mang họ tên và email học sinh. Chúng được tải trong useEffect nghe
            `onAuthStateChanged` bên dưới.
            Đã kiểm: trang công khai `DashboardPage` không dùng cả hai. */
      const [
        allSchools,
        allQuestions,
        allExams,
        allEqs,
        allMatrix,
        curriculumOverrides,
        settings,
      ] = await Promise.all([
        FirestoreService.getSchools(),
        FirestoreService.getQuestions(),
        FirestoreService.getExams(),
        FirestoreService.getEquations(),
        FirestoreService.getMatrixResources(),
        FirestoreService.getCurriculumOverrides(),
        FirestoreService.getSystemSettings(),
      ]);

      // 3. Cập nhật state
      setSchools(allSchools);
      setLibraryQuestions(allQuestions);
      setExams(allExams);
      setEquations(allEqs);
      setMatrixResources(allMatrix);
      setSystemSettings(settings);

      // 4. Merge curriculum với constants
      setCurriculum(mergeCurriculumWithConstants(curriculumOverrides));

      // 6. Guest chat count (vẫn từ localStorage — thuộc thiết bị)
      setGuestChatCount(GuestChatStorage.getCount());

      // 7. Phiên nay do Firebase Auth quản — xem useEffect riêng ngay bên dưới.
      //    Hai khoá localStorage này là tàn dư của hệ đăng nhập cũ, dọn cho sạch.
      localStorage.removeItem('h11_current_user_data');
      localStorage.removeItem('h11_current_user_email');

      setLoading(false);
    };

    init();
  }, []);

  /* ── Phiên đăng nhập: nghe Firebase Auth ───────────────────────────────────
   *
   * ĐỔI HÀNH VI (10/09/2026): trước đây `init()` CỐ Ý xoá session mỗi lần mở
   * trang, nên bấm F5 là văng ra màn đăng nhập. Firebase Auth giữ phiên trong
   * IndexedDB, nên nay F5 vẫn còn đăng nhập.
   *
   * Phải là useEffect RIÊNG, và hồ sơ phải đọc THẲNG từ Firestore — KHÔNG lấy
   * từ mảng `users` trong state. Hai lý do:
   *
   *   1. Hàm gọi lại này sống lâu hơn lần chạy đăng ký nó. Đóng gói mảng
   *      `users` vào trong là giữ mãi một ảnh chụp cũ, và người VỪA đăng ký
   *      xong sẽ không có trong ảnh chụp đó — đăng ký thành công nhưng bị đá
   *      ngược ra màn đăng nhập.
   *   2. Đặt `users` vào mảng phụ thuộc thì mỗi lần danh sách đổi lại đăng ký
   *      lại người nghe. Đọc thẳng thì mảng phụ thuộc rỗng mới là đúng.
   */
  useEffect(() => {
    const thoi = onAuthStateChanged(auth, async (nguoiAuth) => {
      if (!nguoiAuth) {
        setCurrentUser(null);
        /* Dọn luôn hai collection mang dữ liệu người. Không dọn thì sau khi
           đăng xuất, danh sách học sinh vẫn nằm trong bộ nhớ trình duyệt của
           máy đó — người kế tiếp mở máy vẫn đọc được qua công cụ nhà phát
           triển. */
        setUsers([]);
        setClasses([]);
        localStorage.removeItem('h11_current_user_email');
        localStorage.removeItem('h11_current_user_data');
        return;
      }

      /* Hồ sơ đọc TRƯỚC, hai collection người đọc sau — ngược với bản cũ.
         Lý do: `getUsers()` là truy vấn không ràng buộc, mà luật mới đòi
         `request.auth.uid == userId` từng tài liệu, nên HỌC SINH gọi là chắc
         chắn bị từ chối. Biết vai rồi mới gọi thì đỡ một vòng mạng và một
         dòng lỗi vô ích mỗi lần học sinh đăng nhập. */

      /* Thử LẠI một lần trước khi kết luận là không có hồ sơ. Người vừa đăng
         ký xong: `createUserWithEmailAndPassword` bắn sự kiện này NGAY, chạy
         đua với `setDoc` ghi hồ sơ. Thua cuộc đua mà đá luôn ra thì người mới
         đăng ký xong bị văng về màn đăng nhập dù tài khoản hoàn toàn hợp lệ. */
      let anh = await getDoc(doc(db, 'users', nguoiAuth.uid));
      if (!anh.exists()) {
        await new Promise(r => setTimeout(r, 600));
        anh = await getDoc(doc(db, 'users', nguoiAuth.uid));
      }
      if (!anh.exists()) {
        /* Có phiên Auth mà không có hồ sơ — đừng đoán, đừng tự tạo. Đây là dấu
           hiệu dữ liệu lệch, phải để người quản trị nhìn thấy. */
        await signOut(auth);
        setCurrentUser(null);
        return;
      }

      const d = anh.data();
      const hoSo: User = {
        ...(d as any),
        id: anh.id,
        email: d.email || d.username || nguoiAuth.email || '',
        name: d.fullName || d.name || '',
        role: chuanHoaVaiTro(d.role as string),
      };

      await loadProgressForUser(hoSo.email);
      persistSession(hoSo);

      /* `classes` thì học sinh đọc được (luật chỉ đòi đã đăng nhập) và màn
         "xin vào lớp" cần nó. `users` thì chỉ giáo viên/quản trị đọc được. */
      setClasses(await FirestoreService.getClasses());
      if (hoSo.role !== 'student') {
        const dsNguoiDung = await FirestoreService.getUsers();
        setUsers(dsNguoiDung.map(u => {
          const chuan = chuanHoaVaiTro(u.role as string);
          return chuan === u.role ? u : { ...u, role: chuan };
        }));
      }
      /* Đồng bộ vào mảng `users` để phần còn lại của app thấy bản mới nhất. */
      setUsers(prev => prev.some(u => u.id === hoSo.id)
        ? prev.map(u => u.id === hoSo.id ? hoSo : u)
        : [...prev, hoSo]);

      /* Đọc lỗi (người thường không có quyền) thì `docDongQuanTri` đã trả mảng
         rỗng — coi như không phải đồng quản trị, KHÔNG báo lỗi cho người dùng. */
      setDongQuanTri(await FirestoreService.docDongQuanTri());
    });

    return () => thoi();   // huỷ đăng ký khi component rời đi
  }, []);

  // ── Helper: lưu session (localStorage — chỉ cho thiết bị hiện tại) ─────────

  const persistSession = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('h11_current_user_email', user.email);
    localStorage.setItem('h11_current_user_data', JSON.stringify(user));
  };

  // ── Load progress cho user đã đăng nhập ─────────────────────────────────────

  const loadProgressForUser = async (email: string): Promise<LearningProgress> => {
    if (progressCache[email]) return progressCache[email];
    const progress = await FirestoreService.getUserProgress(email);
    setProgressCache(prev => ({ ...prev, [email]: progress }));
    return progress;
  };

  // ── Đăng nhập bằng Firestore ─────────────────────────────────────────────────

  const login = async (identifier: string, password: string) => {
    const fsRes = await loginWithFirestore(identifier, password);
    if (!fsRes.success || !fsRes.user) {
      return { success: false, message: fsRes.message || 'Sai email hoặc mật khẩu' };
    }

    /* KHÔNG tự dựng `appUser` ở đây nữa: `onAuthStateChanged` chạy ngay sau khi
       đăng nhập thành công và tự đặt `currentUser` từ hồ sơ Firestore. Dựng hai
       lần là hai nguồn sự thật.
       Bản cũ còn nguy hơn thế: khi không tìm thấy user trong state nó bịa ra
       email dạng `<username>@firestore.local`. Mà `progress` và `chats` trỏ tới
       người dùng BẰNG EMAIL — nên tiến độ học sẽ ghi vào một địa chỉ không có
       thật, và người dùng thấy mình mất sạch tiến độ. */
    const stateUser = users.find(u => u.id === fsRes.user!.uid);
    return { success: true, message: 'Đăng nhập thành công!', user: stateUser };
  };

  // ── Đăng nhập / Đăng ký bằng Google ──────────────────────────────────────

  const loginWithGoogle = async (googleInfo: GoogleUserInfo) => {
    // 1. Tìm theo googleId trong state
    const byGoogleId = users.find(u => u.googleId === googleInfo.sub);
    if (byGoogleId) {
      if (byGoogleId.status === 'rejected') {
        return { success: false, message: 'Tài khoản đã bị từ chối. Liên hệ Admin để hỗ trợ.' };
      }
      await loadProgressForUser(byGoogleId.email);
      persistSession(byGoogleId);
      return { success: true, message: 'Đăng nhập Google thành công!', user: byGoogleId };
    }

    // 2. Kiểm tra email đã tồn tại chưa
    const byEmail = users.find(u => u.email.toLowerCase() === googleInfo.email.toLowerCase());
    if (byEmail) {
      return {
        success: false,
        message:
          `Email ${googleInfo.email} đã được đăng ký trong hệ thống với tài khoản khác ` +
          `(${byEmail.role === 'student' ? 'Học sinh' : byEmail.role === 'teacher' ? 'Giáo viên' : 'Admin'}). ` +
          'Vui lòng đăng nhập bằng email và mật khẩu.',
      };
    }

    // 3. Tài khoản Google hoàn toàn mới → yêu cầu đặt mật khẩu
    return {
      success: true,
      requireSetPassword: true,
      message: 'Xác thực Google thành công! Vui lòng đặt mật khẩu để hoàn tất đăng ký.',
    };
  };

  const completeGoogleRegistration = async (googleInfo: GoogleUserInfo, password: string) => {
    if (password.length < 8) {
      return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự!' };
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Mật khẩu phải chứa cả chữ cái và chữ số!' };
    }

    const identifier = googleInfo.email.toLowerCase().trim();
    const fsRes = await createAccountWithFirestore({
      username: identifier,
      password: password,
      fullName: googleInfo.name,
      role: 'student',
      email: identifier,
      status: 'active',
      dangTuDangKy: true,   // tạo trên app CHÍNH -> đăng nhập luôn sau khi tạo
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const newUser: User = {
      id: fsRes.user!.uid,
      email: googleInfo.email,
      username: identifier,
      name: googleInfo.name,
      role: 'student',
      status: 'active',
      authProvider: 'google',
      googleId: googleInfo.sub,
      canChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    // Cập nhật Firestore với googleId (nếu chưa có)
    await FirestoreService.updateUserById(newUser.id, { googleId: googleInfo.sub });

    setUsers(prev => [...prev, newUser]);
    persistSession(newUser);
    return { success: true, message: 'Đăng ký thành công! Chào mừng bạn.', user: newUser };
  };

  // ── Đăng ký học sinh thủ công (luồng cũ) ────────────────────

  const register = async (email: string, password: string, name: string) => {
    const identifier = email.toLowerCase().trim();
    const fsRes = await createAccountWithFirestore({
      username: identifier,
      password: password,
      fullName: name,
      role: 'student',
      email: identifier,
      status: 'pending',
      dangTuDangKy: true,   // tạo trên app CHÍNH -> đăng nhập luôn sau khi tạo
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    /* Id nay LUÔN là uid của Firebase Auth. Bản cũ có nhánh dự phòng bịa ra
       `uid_<thời điểm>_<email>` khi thiếu — nay không cần: tạo tài khoản thành
       công thì chắc chắn có uid, còn thất bại thì đã trả về ở trên rồi. */
    const newUser: User = {
      id: fsRes.user!.uid,
      email,
      username: identifier,
      name,
      role: 'student',
      status: 'pending',
      /* Vẫn là 'local': trường này nói CÁCH đăng nhập (email+mật khẩu hay
         Google), không nói chỗ lưu mật khẩu. Cách đăng nhập không đổi. */
      authProvider: 'local',
      canChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    return {
      success: true,
      message: 'Đăng ký thành công! Tài khoản của bạn đã được gửi tới hệ thống để phê duyệt.',
    };
  };

  // ── Đăng xuất ────────────────────────────────────────────────────────────

  const logout = async () => {
    /* `signOut` làm `onAuthStateChanged` chạy, và chính chỗ đó dọn
       `currentUser` + localStorage. Đặt `setCurrentUser(null)` ở đây nữa là
       thừa, nhưng giữ lại thì giao diện đổi ngay không phải đợi vòng lặp sự
       kiện — người dùng bấm Đăng xuất là thấy phản hồi tức thì. */
    setCurrentUser(null);
    setChats([]);
    await signOut(auth);
  };

  // ── Quên mật khẩu ────────────────────────────────────────────────────────

  const forgotPassword = async (identifier: string) => {
    /* Bản cũ TỰ SINH mật khẩu mới, ghi thẳng vào Firestore rồi hiện lên màn
       hình. Ai mở được màn đó là đổi được mật khẩu người khác — và mật khẩu
       mới nằm luôn trong `users`, nơi ai cũng đọc được. Nay chỉ gửi thư; chỉ
       chủ hộp thư mới đặt lại được.
       Bỏ luôn quy tắc "học sinh phải nhờ giáo viên": nó ra đời vì admin phải
       gõ mật khẩu hộ, mà nay không ai gõ hộ ai nữa. */
    return await resetPasswordWithFirestore(identifier.trim().toLowerCase());
  };

  // ── Library & Databank Methods ──────────────────────────────────────────────

  const addExam = (exam: Omit<LibraryExam, 'id' | 'createdAt'>) => {
    const newExam: LibraryExam = {
      ...exam,
      id: `exam_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExams(prev => [...prev, newExam]);
    // Fire-and-forget: ghi Firestore ở background
    FirestoreService.addExam(newExam);
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    FirestoreService.deleteExam(id);
  };

  const addEquation = (eq: Omit<Equation, 'id' | 'createdAt'>) => {
    const newEq: Equation = {
      ...eq,
      id: `eq_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setEquations(prev => [...prev, newEq]);
    FirestoreService.addEquation(newEq);
  };

  const deleteEquation = (id: string) => {
    setEquations(prev => prev.filter(e => e.id !== id));
    FirestoreService.deleteEquation(id);
  };

  const addMatrixResource = (res: Omit<MatrixResource, 'id' | 'createdAt'>) => {
    const newRes: MatrixResource = {
      ...res,
      id: `matrix_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMatrixResources(prev => [...prev, newRes]);
    FirestoreService.addMatrixResource(newRes);
  };

  const deleteMatrixResource = (id: string) => {
    setMatrixResources(prev => prev.filter(r => r.id !== id));
    FirestoreService.deleteMatrixResource(id);
  };

  const addLibraryQuestion = (q: Omit<Question, 'id' | 'createdAt'>) => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setLibraryQuestions(prev => [...prev, newQ]);
    FirestoreService.addQuestion(newQ);
  };

  const deleteLibraryQuestion = (id: string) => {
    setLibraryQuestions(prev => prev.filter(q => q.id !== id));
    FirestoreService.deleteQuestion(id);
  };

  // ── Admin: duyệt / từ chối / xóa tài khoản ──────────────────────────────

  const approveUser = (email: string) => {
    const lower = email.toLowerCase();
    setUsers(prev => prev.map(u =>
      u.email.toLowerCase() === lower ? { ...u, status: 'active' } : u
    ));
    // Tìm user để lấy id cho Firestore update
    const user = users.find(u => u.email.toLowerCase() === lower);
    if (user) {
      FirestoreService.updateUserById(user.id, { status: 'active' });
    }
    if (currentUser?.email.toLowerCase() === lower) {
      setCurrentUser(prev => prev ? { ...prev, status: 'active' } : prev);
    }
  };

  const rejectUser = (email: string) => {
    const lower = email.toLowerCase();
    setUsers(prev => prev.map(u =>
      u.email.toLowerCase() === lower ? { ...u, status: 'rejected' } : u
    ));
    const user = users.find(u => u.email.toLowerCase() === lower);
    if (user) {
      FirestoreService.updateUserById(user.id, { status: 'rejected' });
    }
    if (currentUser?.email.toLowerCase() === lower) {
      setCurrentUser(prev => prev ? { ...prev, status: 'rejected' } : prev);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    FirestoreService.deleteUserById(id);
  };

  const updateUserInfo = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    FirestoreService.updateUserById(id, updates);
  };

  // ── Quản lý Trường học ────────────────────────────────────────────────────

  const createSchool = async (name: string, adminEmail: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { success: false, message: 'Tên trường không được để trống.' };

    const school: School = {
      id: `school_${Date.now()}`,
      name: trimmed,
      adminEmails: [adminEmail.toLowerCase()],
      createdAt: new Date().toISOString(),
    };

    const ok = await FirestoreService.addSchool(school);
    if (!ok) return { success: false, message: 'Trường này đã tồn tại trong hệ thống.' };

    setSchools(prev => [...prev, school]);
    return { success: true, message: `Đã tạo trường "${trimmed}" thành công.`, school };
  };

  const createTeacher = async (data: CreateTeacherData) => {
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, message: 'Tên và email giáo viên không được để trống.' };
    }
    if (!data.schoolId) {
      return { success: false, message: 'Vui lòng chỉ định trường học cho giáo viên.' };
    }

    const lower = data.email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === lower);
    if (existing) {
      return { success: false, message: `Email ${data.email} đã được đăng ký trong hệ thống.` };
    }

    const password = data.password || generateRandomPassword();

    /* Tạo qua Firebase Auth thay vì bịa id rồi ghi thẳng Firestore.
       Bản cũ đặt `id = uid_teacher_<thời điểm>` và KHÔNG tạo tài khoản Auth
       nào. Từ 10/09/2026 app hỏi Firebase Auth khi đăng nhập, nên mọi tài
       khoản tạo theo lối cũ đều là hồ sơ mồ côi: có trong danh sách, nhìn thì
       bình thường, nhưng không ai đăng nhập được. Đây là chức năng chính của
       nhà trường nên lỗi này sẽ lộ ra rất nhanh và rất khó chịu.
       `createAccountWithFirestore` dùng Firebase App PHỤ, nên phiên của người
       đang tạo (hiệu trưởng / quản trị) không bị đụng. */
    const fsRes = await createAccountWithFirestore({
      username: lower,
      email: lower,
      password,
      fullName: data.name.trim(),
      role: 'teacher',
      schoolId: data.schoolId,
      status: 'active',
    });
    if (!fsRes.success || !fsRes.user) {
      return { success: false, message: fsRes.message || 'Không thể tạo tài khoản giáo viên. Vui lòng thử lại.' };
    }

    const teacher: User = {
      id: fsRes.user.uid,
      email: lower,
      name: data.name.trim(),
      role: 'teacher',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, teacher]);

    const credentials: AuthCredentials = {
      identifier: teacher.email,
      password,
      name: teacher.name,
    };

    return {
      success: true,
      message: `Đã tạo tài khoản giáo viên cho ${teacher.name}.`,
      credentials,
    };
  };

  // ── Tạo tài khoản School Admin ───────────────────────────────────────────

  const createSchoolAdmin = async (data: CreateSchoolAdminData) => {
    if (currentUser?.role !== 'admin') {
      return { success: false, message: 'Chỉ Admin Website mới có quyền tạo tài khoản admin trường.' };
    }
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, message: 'Tên và email không được để trống.' };
    }
    if (!data.schoolId) {
      return { success: false, message: 'Vui lòng chỉ định trường học cho admin.' };
    }

    const lower = data.email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === lower);
    if (existing) {
      return { success: false, message: `Email ${data.email} đã được đăng ký trong hệ thống.` };
    }

    const password = data.password || generateRandomPassword();

    /* Cũng đi qua Firebase Auth — xem lời giải thích ở `createTeacher`.
       Đây chính là chức năng mà chốt chặn vai trò trong `firestoreAuth.ts`
       từng chặn nhầm, nên chốt đó đã chuyển ra `FirestoreAccountManager`. */
    const fsRes = await createAccountWithFirestore({
      username: lower,
      email: lower,
      password,
      fullName: data.name.trim(),
      role: 'school_admin',
      schoolId: data.schoolId,
      status: 'active',
    });
    if (!fsRes.success || !fsRes.user) {
      return { success: false, message: fsRes.message || 'Không thể tạo tài khoản admin trường. Vui lòng thử lại.' };
    }

    const schoolAdmin: User = {
      id: fsRes.user.uid,
      email: lower,
      name: data.name.trim(),
      role: 'school_admin',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    // Thêm email vào School.adminEmails trên Firestore
    const school = schools.find(s => s.id === data.schoolId);
    if (school && !school.adminEmails.includes(schoolAdmin.email)) {
      const updatedAdminEmails = [...school.adminEmails, schoolAdmin.email];
      await FirestoreService.updateSchool(data.schoolId, { adminEmails: updatedAdminEmails });
      setSchools(prev => prev.map(s =>
        s.id === data.schoolId ? { ...s, adminEmails: updatedAdminEmails } : s
      ));
    }

    setUsers(prev => [...prev, schoolAdmin]);

    const credentials: AuthCredentials = {
      identifier: schoolAdmin.email,
      password,
      name: schoolAdmin.name,
    };
    return { success: true, message: `Đã tạo tài khoản admin trường cho ${schoolAdmin.name}.`, credentials };
  };

  // ── Quản lý Lớp học ──────────────────────────────────────────────────────

  const createClass = async (schoolId: string, className: string, teacherEmail: string) => {
    if (!className.trim()) return { success: false, message: 'Tên lớp không được để trống.' };

    const lower = teacherEmail.toLowerCase();
    const teacher = users.find(u => u.email.toLowerCase() === lower);
    if (!teacher || teacher.role !== 'teacher') {
      return { success: false, message: 'Giáo viên không tồn tại hoặc email không hợp lệ.' };
    }

    // Một GV chỉ được quản lý 1 lớp tại một thời điểm
    const existingClass = classes.find(c => c.teacherEmail.toLowerCase() === lower);
    if (existingClass) {
      return {
        success: false,
        message: `${teacher.name} đang quản lý lớp "${existingClass.name}". Mỗi giáo viên chỉ quản lý 1 lớp.`,
      };
    }

    const schoolClass: SchoolClass = {
      id: `class_${Date.now()}`,
      schoolId,
      name: className.trim(),
      teacherEmail: lower,
      studentIdentifiers: [],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    };

    const ok = await FirestoreService.addClass(schoolClass);
    if (!ok) return { success: false, message: 'Không thể tạo lớp. Vui lòng thử lại.' };

    // Cập nhật schoolId của GV nếu chưa có
    if (!teacher.schoolId) {
      await FirestoreService.updateUserById(teacher.id, { schoolId });
      setUsers(prev => prev.map(u => u.id === teacher.id ? { ...u, schoolId } : u));
    }

    setClasses(prev => [...prev, schoolClass]);
    return { success: true, message: `Đã tạo lớp "${className.trim()}" thành công.`, schoolClass };
  };

  const updateClass = async (classId: string, className: string, teacherEmail: string) => {
    if (!className.trim()) return { success: false, message: 'Tên lớp không được để trống.' };

    const lower = teacherEmail.toLowerCase();
    const teacher = users.find(u => u.email.toLowerCase() === lower);
    if (!teacher || teacher.role !== 'teacher') {
      return { success: false, message: 'Giáo viên không tồn tại hoặc email không hợp lệ.' };
    }

    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return { success: false, message: 'Lớp học không tồn tại.' };

    // Kiểm tra xem GV mới có đang quản lý lớp khác không (trừ lớp hiện tại)
    const existingClass = classes.find(c => c.teacherEmail.toLowerCase() === lower && c.id !== classId);
    if (existingClass) {
      return {
        success: false,
        message: `${teacher.name} đang quản lý lớp "${existingClass.name}". Mỗi giáo viên chỉ quản lý 1 lớp.`,
      };
    }

    const updates = { name: className.trim(), teacherEmail: lower };
    const ok = await FirestoreService.updateClass(classId, updates);
    if (!ok) return { success: false, message: 'Lỗi khi cập nhật lớp.' };

    setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...updates } : c));
    return { success: true, message: 'Cập nhật thông tin lớp thành công.' };
  };

  const deleteClass = async (classId: string) => {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return { success: false, message: 'Lớp học không tồn tại.' };

    await FirestoreService.deleteClass(classId);

    // Gỡ học sinh khỏi lớp (chuyển về học sinh tự do hoặc xoá classId)
    // Để an toàn, cập nhật tất cả học sinh trong lớp thành học sinh chưa có lớp: classId = null
    const studentUsers = users.filter(u => targetClass.studentIdentifiers.includes(u.email) || targetClass.studentIdentifiers.includes(u.username!));
    for (const student of studentUsers) {
      await FirestoreService.updateUserById(student.id, { classId: null, role: 'student' });
    }
    
    // Cập nhật local state users
    setUsers(prev => prev.map(u => studentUsers.some(su => su.id === u.id) ? { ...u, classId: undefined, role: 'student' } : u));
    setClasses(prev => prev.filter(c => c.id !== classId));
    
    return { success: true, message: `Đã xóa lớp "${targetClass.name}" thành công.` };
  };

  // ── Quản lý Học sinh ─────────────────────────────────────────────────────

  const createStudent = async (data: CreateStudentData) => {
    if (!data.name.trim()) return { success: false, message: 'Tên học sinh không được để trống.' };
    if (!data.email && !data.username) {
      return { success: false, message: 'Vui lòng cung cấp email hoặc username cho học sinh.' };
    }

    if (data.email) {
      const existing = users.find(u => u.email.toLowerCase() === data.email!.toLowerCase());
      if (existing) return { success: false, message: `Email ${data.email} đã được sử dụng.` };
    }
    if (data.username) {
      const existing = users.find(u => u.username?.toLowerCase() === data.username!.toLowerCase());
      if (existing) return { success: false, message: `Username "${data.username}" đã được sử dụng.` };
    }

    // Xác định số báo danh
    const targetClass = classes.find(c => c.id === data.classId);
    const classStudents = users.filter(u =>
      u.classId === data.classId && u.role === 'student' && u.studentNumber !== undefined
    );

    let studentNumber: number;
    if (data.studentNumber !== undefined) {
      // Kiểm tra không trùng
      const duplicate = classStudents.find(u => u.studentNumber === data.studentNumber);
      if (duplicate) {
        return { success: false, message: `Số báo danh ${data.studentNumber} đã được sử dụng bởi học sinh "${duplicate.name}".` };
      }
      studentNumber = data.studentNumber;
    } else {
      // Tự động lấy số tiếp theo
      const maxNum = classStudents.reduce((max, u) => Math.max(max, u.studentNumber ?? 0), 0);
      studentNumber = maxNum + 1;
    }

    // Sinh mật khẩu có cấu trúc nếu thuộc lớp
    const password = data.password || (
      targetClass
        ? generateClassPassword(targetClass.name, studentNumber)
        : generateRandomPassword()
    );
    const identifier = data.email || data.username!;
    const emailDangNhap = data.email?.toLowerCase().trim() || `${data.username}@internal.local`;

    /* Đi qua Firebase Auth — xem lời giải thích ở `createTeacher`.
       Lưu ý về học sinh KHÔNG có email thật: địa chỉ `<username>@internal.local`
       đúng cú pháp nên Firebase Auth nhận, và các em đăng nhập bình thường bằng
       địa chỉ đó. Nhưng nó không phải hộp thư thật, nên các em KHÔNG dùng được
       chức năng "quên mật khẩu" — mất mật khẩu thì giáo viên phải tạo lại tài
       khoản. Đây là hệ quả của thiết kế cũ (học sinh không cần email), không
       phải điều đợt chuyển này gây ra. */
    const fsRes = await createAccountWithFirestore({
      username: emailDangNhap,
      email: emailDangNhap,
      password,
      fullName: data.name.trim(),
      role: 'student',
      schoolId: data.schoolId,
      classId: data.classId,
      status: 'active',
    });
    if (!fsRes.success || !fsRes.user) {
      return { success: false, message: fsRes.message || 'Không thể tạo tài khoản học sinh. Vui lòng thử lại.' };
    }

    const student: User = {
      id: fsRes.user.uid,
      email: emailDangNhap,
      username: data.username?.trim(),
      name: data.name.trim(),
      role: 'student',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      classId: data.classId,
      studentNumber,
      canChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    // Thêm vào danh sách lớp trên Firestore
    await FirestoreService.addStudentToClass(data.classId, identifier);

    setUsers(prev => [...prev, student]);
    setClasses(prev => prev.map(c =>
      c.id === data.classId
        ? { ...c, studentIdentifiers: [...c.studentIdentifiers, identifier] }
        : c
    ));

    const credentials: AuthCredentials = {
      identifier,
      password,
      name: student.name,
    };

    return {
      success: true,
      message: `Đã tạo tài khoản học sinh cho ${student.name}.`,
      credentials,
    };
  };

  // ── Truy vấn ─────────────────────────────────────────────────────────────

  const getMyClass = (): SchoolClass | undefined => {
    if (!currentUser || currentUser.role !== 'teacher') return undefined;
    return classes.find(c => c.teacherEmail.toLowerCase() === currentUser.email.toLowerCase());
  };

  // ── Chat ─────────────────────────────────────────────────────────────────

  /**
   * Load lịch sử chat của (currentUser, lessonId) từ Firestore vào state.
   * Idempotent: nếu đã có trong state thì không load lại.
   */
  const loadLessonChats = async (lessonId: string) => {
    if (!currentUser) return; // guest không load
    const email = currentUser.email;
    // Kiểm tra đã có trong state chưa (tránh fetch lại)
    const alreadyLoaded = chats.some(c => c.userEmail === email && c.lessonId === lessonId);
    if (alreadyLoaded) return;
    const fetched = await FirestoreService.getChatsByUserLesson(email, lessonId);
    if (fetched.length > 0) {
      setChats(prev => {
        // Merge: loại trùng ID
        const existingIds = new Set(prev.map(c => c.id));
        const newOnes = fetched.filter(c => !existingIds.has(c.id));
        return [...prev, ...newOnes];
      });
    }
  };

  const addMessage = async (lessonId: string, content: string) => {
    const userEmail = currentUser ? currentUser.email : 'guest';

    if (!currentUser) {
      const currentCount = GuestChatStorage.getCount();
      if (currentCount >= 25) {
        throw new Error(
          'Bạn đã hết lượt dùng thử miễn phí (tối đa 25 câu hỏi). ' +
          'Vui lòng đăng ký tài khoản để tiếp tục học tập không giới hạn.'
        );
      }
    }

    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      userEmail,
      lessonId,
      sender: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Cập nhật state ngay (optimistic)
    setChats(prev => [...prev, userMsg]);

    // Lưu Firestore (chỉ với user đăng nhập; guest không lưu)
    if (currentUser) {
      FirestoreService.addChatMessage(userMsg);
    } else {
      const nextCount = GuestChatStorage.increment();
      setGuestChatCount(nextCount);
    }

    // Bước 1: Kiểm tra cooldown trước khi gọi AI
    const remainingCooldown = getRemainingCooldown(userEmail);
    if (remainingCooldown > 0) {
      const cooldownMsg: ChatMessage = {
        id: `m-ai-cooldown-${Date.now()}`,
        userEmail,
        lessonId,
        sender: 'ai',
        content: formatCooldownMessage(remainingCooldown),
        timestamp: new Date().toISOString(),
      };
      setChats(prev => [...prev, cooldownMsg]);
      if (currentUser) FirestoreService.addChatMessage(cooldownMsg);
      return;
    }

    // Lấy lịch sử chat hiện tại cho bài học này từ state
    const currentHistory = chats.filter(
      c => c.userEmail === userEmail && c.lessonId === lessonId
    );

    // Giả lập độ trễ suy nghĩ của gia sư từ 5 đến 10 giây
    const thinkingDelayMs = Math.floor(Math.random() * 5000) + 5000;
    const [aiResponseTextObj] = await Promise.all([
      generateAIResponse(lessonId, content, currentHistory, userEmail),
      new Promise(resolve => setTimeout(resolve, thinkingDelayMs))
    ]);
    let aiResponseText = aiResponseTextObj as string;

    // Bước 2: Đọc nhãn tín hiệu AI trả về
    if (aiResponseText.includes('[SIGNAL:OFFTOPIC]')) {
      const userName = currentUser?.name || 'Khách vãng lai';
      const { cooldownActivated } = recordOffTopicStrike(userEmail, content, userName);
      aiResponseText = aiResponseText.replace(/\[SIGNAL:OFFTOPIC\]/g, '').trim();
      if (cooldownActivated) {
        aiResponseText += formatCooldownActivationNotice();
      }
    }

    let finalAiResponse = aiResponseText;

    /* Link bài kiểm tra CHỈ mở khi gia sư đã rà xong cả chương và phát nhãn
       [SIGNAL:XONG_CHUONG].

       Trước đây điều kiện là câu "Chúc mừng em…", tức chỉ cần giải xong MỘT bài
       tập là có link. Bài kiểm tra lại là bài tổng hợp cả chương và có tính
       điểm, nên mở sớm như vậy là bắt các em làm bài khi chưa ôn xong.

       Đề lấy từ ngân hàng Firestore, lọc đúng chương và trải đều 4 mức độ.

       (Đính chính: lúc đầu tôi tưởng bài kiểm tra không hề đọc ngân hàng vì
       thấy `LibraryStorage.getQuestions` trong quizService. Đọc kỹ thì đó là
       nhánh cũ; `createQuiz` hiện tại gom câu từ cả ba kho qua `layCauHoiCuaBai`
       và CÓ đọc `bank_questions`. Cái thiếu thật sự chỉ là đề theo CẢ CHƯƠNG —
       `createQuiz` lọc theo từng bài.) */
    if (aiResponseText.includes('[SIGNAL:XONG_CHUONG]')) {
      finalAiResponse = finalAiResponse.replace(/\[SIGNAL:XONG_CHUONG\]/g, '').trim();
      const chapter = curriculum.find(c => c.lessons.some(l => l.id === lessonId));

      /* Không tìm ra chương thì THÔI, không đoán bừa.

         Bản trước rơi về `chapterId = 'c1'` — một mã chương KHÔNG có thật
         (mã đúng là 'chuong-1'). Giữ nó thì `toChapter('c1')` vẫn ra số 1,
         nên mọi lessonId lạc (ví dụ 'global-advisor' của khung tư vấn chung)
         đều lặng lẽ nhận đề của Chương 1. */
      if (!chapter) {
        console.warn(
          `[Quiz] lessonId "${lessonId}" không thuộc chương nào — bỏ qua bài kiểm tra tổng hợp.`,
        );
      } else {
        try {
          const bank = await BankFirestore.getAll();
          const cuaChuong = bank
            .filter(q => q.ch === toChapter(chapter.id))
            .map(q => toLegacy(q));
          const quiz = QuizService.createChapterQuiz(chapter.id, userEmail, cuaChuong);
          if (quiz) {
            const quizLink = `${window.location.origin}${window.location.pathname}#/quiz/${quiz.id}`;
            finalAiResponse += `\n\n👉 **Em đã ôn xong chương này. Làm bài kiểm tra tổng hợp ${quiz.questions.length} câu tại đây nhé:** [Làm bài kiểm tra ngay](${quizLink})`;
          } else {
            finalAiResponse += '\n\n_(Ngân hàng câu hỏi của chương này chưa có câu nào nên chưa tạo được bài kiểm tra. Em báo thầy/cô nhé.)_';
          }
        } catch {
          // Mất mạng hay thiếu quyền: nói thật, đừng lặng lẽ không hiện link
          finalAiResponse += '\n\n_(Chưa đọc được ngân hàng câu hỏi nên chưa tạo được bài kiểm tra. Em thử lại sau nhé.)_';
        }
      }
    }

    /* ── Đề kiểm tra NGẮN theo TỪNG BÀI ────────────────────────────────────
       Hai nhãn kèm mã bài, do gia sư phát ra:
         [SIGNAL:XONG_BAI:bai-3]    học sinh vừa giải xong đúng vấn đề đã hỏi
         [SIGNAL:YEU_CAU_DE:bai-7]  học sinh chủ động xin đề về một bài

       Vì sao phải mang mã bài trong nhãn: ở khung tư vấn chung, `lessonId` luôn
       là 'global-advisor' — không phải bài nào cả. Đó chính là lý do các đề
       trước đây ra sai bài. Nay bài nào ra đề là do gia sư chỉ đích danh, không
       suy từ màn hình đang mở.

       `createQuiz` đã sẵn logic chống trùng đề: ưu tiên câu CHƯA làm, rồi tới
       câu từng làm SAI, cuối cùng mới tới câu từng làm đúng — và xáo trong từng
       nhóm lẫn xáo lần cuối. Nên làm lại lần hai sẽ ra đề khác. */
    const nhanRaDe = /\[SIGNAL:(XONG_BAI|YEU_CAU_DE):\s*([a-zA-Z0-9-]+)\s*\]/.exec(aiResponseText);
    if (nhanRaDe) {
      const [nguyenVan, loaiNhan, maBai] = nhanRaDe;
      finalAiResponse = finalAiResponse.replace(nguyenVan, '').trim();

      const chuongCuaBai = curriculum.find(c => c.lessons.some(l => l.id === maBai));

      if (!chuongCuaBai) {
        // Gia sư bịa mã bài: bỏ qua, KHÔNG giao nhầm đề của bài khác
        console.warn(`[Quiz] Gia sư phát mã bài không có thật: "${maBai}" — bỏ qua.`);
      } else {
        const deBai = await QuizService.createQuiz(
          chuongCuaBai.id, maBai, userEmail, libraryQuestions,
        );
        if (deBai) {
          const tenBai = chuongCuaBai.lessons.find(l => l.id === maBai)?.title ?? maBai;
          const link = `${window.location.origin}${window.location.pathname}#/quiz/${deBai.id}`;
          const mo = loaiNhan === 'YEU_CAU_DE'
            ? `👉 **Đề luyện tập về ${tenBai}** (${deBai.questions.length} câu):`
            : `👉 **Em vừa nắm được ${tenBai}. Làm nhanh ${deBai.questions.length} câu để chắc kiến thức nhé:**`;
          finalAiResponse += `\n\n${mo} [Làm bài kiểm tra ngay](${link})`;
        } else {
          finalAiResponse += '\n\n_(Bài này chưa có câu hỏi nào trong ngân hàng nên chưa tạo được đề. Em báo thầy/cô nhé.)_';
        }
      }
    }

    const aiMsg: ChatMessage = {
      id: `m-ai-${Date.now() + 1}`,
      userEmail,
      lessonId,
      sender: 'ai',
      content: finalAiResponse,
      timestamp: new Date().toISOString(),
    };

    setChats(prev => [...prev, aiMsg]);
    if (currentUser) FirestoreService.addChatMessage(aiMsg);
  };

  // ── Tiến độ học tập ───────────────────────────────────────────────────────

  const toggleLessonCompletion = async (lessonId: string) => {
    if (!currentUser) return;
    const email = currentUser.email;

    // Lấy progress hiện tại từ cache hoặc Firestore
    const currentProgress = progressCache[email] || await FirestoreService.getUserProgress(email) || { userEmail: email, completedLessons: [], details: {} };
    let completedLessons: string[];

    if (currentProgress.completedLessons.includes(lessonId)) {
      completedLessons = currentProgress.completedLessons.filter(id => id !== lessonId);
    } else {
      completedLessons = [...currentProgress.completedLessons, lessonId];
    }

    const updated: LearningProgress = { ...currentProgress, userEmail: email, completedLessons };
    setProgressCache(prev => ({ ...prev, [email]: updated }));

    // Ghi Firestore background
    FirestoreService.saveUserProgress(updated);

    // Trigger re-render
    setCurrentUser(prev => prev ? { ...prev } : prev);
  };

  const updateLessonProgress = async (lessonId: string, updates: Partial<import('../../features/auth/types').LessonProgress>) => {
    if (!currentUser) return;
    const email = currentUser.email;

    const currentProgress = progressCache[email] || await FirestoreService.getUserProgress(email) || { userEmail: email, completedLessons: [], details: {} };
    
    // Tự động map dữ liệu cũ sang mới
    const details = currentProgress.details || {};
    
    // Nếu chưa có chi tiết mà lại có trong completedLessons, map sang
    if (!details[lessonId] && currentProgress.completedLessons.includes(lessonId)) {
      details[lessonId] = {
        lessonId,
        basicCompleted: true,
        quizAttempts: [],
        bestScore: 0,
        advancedUnlocked: false,
        advancedCompleted: false,
        skippedAdvanced: true // Cũ mặc định coi như bỏ qua nâng cao
      };
    }

    const currentLesson = details[lessonId] || {
      lessonId,
      basicCompleted: false,
      quizAttempts: [],
      bestScore: 0,
      advancedUnlocked: false,
      advancedCompleted: false,
      skippedAdvanced: false
    };

    const newLessonProgress = { ...currentLesson, ...updates };
    details[lessonId] = newLessonProgress;

    // Cập nhật mảng legacy completedLessons để tương thích ngược
    const completedLessons = [...currentProgress.completedLessons];
    if (newLessonProgress.basicCompleted && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    } else if (!newLessonProgress.basicCompleted && completedLessons.includes(lessonId)) {
      const idx = completedLessons.indexOf(lessonId);
      if (idx > -1) completedLessons.splice(idx, 1);
    }

    const updated: LearningProgress = { ...currentProgress, userEmail: email, completedLessons, details };
    setProgressCache(prev => ({ ...prev, [email]: updated }));
    FirestoreService.saveUserProgress(updated);
    setCurrentUser(prev => prev ? { ...prev } : prev);
  };

  const clearLessonHistory = async (lessonId: string) => {
    const email = currentUser ? currentUser.email : 'guest';
    setChats(prev => prev.filter(c => !(c.userEmail === email && c.lessonId === lessonId)));
    if (currentUser) {
      FirestoreService.clearLessonChats(email, lessonId);
    }
  };

  /**
   * Ghi lại việc học sinh qua một màn trò chơi.
   *
   * Trò chơi là tệp tĩnh, không biết ai đang đăng nhập, nên nó chỉ nhắn ra
   * ngoài; chỗ này mới là nơi biết tài khoản và ghi xuống Firestore.
   *
   * Chỉ ghi khi kết quả TỐT HƠN lần trước. Em chơi lại màn cũ cho vui mà bị
   * ghi đè số câu đúng thấp hơn thì thành phạt em vì đã chơi lại.
   */
  const luuTienDoTroChoi = async (
    email: string, tro: string, bai: string,
    ketQua: { xong: boolean; cauDung: number; hang?: string },
  ): Promise<void> => {
    if (!email || email === 'guest') return;   // khách vãng lai không có chỗ lưu
    const hienCo = progressCache[email]
      || await FirestoreService.getUserProgress(email)
      || { userEmail: email, completedLessons: [], details: {} };

    const troChoi = { ...(hienCo.troChoi || {}) };
    const cuaTro = { ...(troChoi[tro] || {}) };
    const cu = cuaTro[bai];

    /* Danh hiệu là một thước đo RIÊNG, không suy ra được từ số câu đúng: ván
       ngắn không sai câu nào (🥇) vẫn ít câu đúng hơn ván dài sai mấy câu (🥉).
       Nên phải so cả hai mặt, và chỉ bỏ qua khi lần này không hơn ở mặt nào. */
    const bac = (h?: string) => (h === 'xuatsac' ? 3 : h === 'gioi' ? 2 : h === 'kha' ? 1 : 0);
    if (cu && cu.xong && cu.cauDung >= ketQua.cauDung && bac(cu.hang) >= bac(ketQua.hang)) return;

    const ghi: { xong: boolean; cauDung: number; hang?: string } = {
      xong: ketQua.xong || !!(cu && cu.xong),
      cauDung: Math.max(ketQua.cauDung, cu ? cu.cauDung : 0),
    };
    /* Firestore từ chối thẳng giá trị undefined, nên phải BỎ HẲN khoá chứ không
       gán undefined vào — gán thì cả lệnh ghi hỏng, mất luôn cả số câu đúng. */
    const hangTot = bac(ketQua.hang) >= bac(cu?.hang) ? ketQua.hang : cu?.hang;
    if (hangTot) ghi.hang = hangTot;
    cuaTro[bai] = ghi;
    troChoi[tro] = cuaTro;

    const moi: LearningProgress = { ...hienCo, troChoi };
    setProgressCache(p => ({ ...p, [email]: moi }));
    try {
      await FirestoreService.saveUserProgress(moi);
    } catch (err) {
      /* Mất mạng thì thôi — trò chơi đã tự lưu vào máy rồi, lần sau mở lại
         vẫn còn, chỉ là chưa đồng bộ sang máy khác. */
      console.warn('Chưa lưu được tiến độ trò chơi:', err);
    }
  };

  /**
   * Ghi tiến độ MỘT phần luyện tập của MỘT bài.
   *
   * Khác `luuTienDoTroChoi` ở chỗ KHÔNG so "tốt hơn thì mới ghi": tiến độ
   * luyện tập còn mang cả số lượt đã dùng, mốc hết khóa và cờ cần ôn lại —
   * những thứ phải ghi kể cả khi điểm lượt này thấp hơn lượt trước. Việc giữ
   * lại thành tích cũ (`dat`, `tiLeCaoNhat`) đã do `capNhatSauLuot` lo.
   */
  const luuTienDoLuyenTap = async (
    email: string, bai: string, phan: string, tienDoPhan: unknown,
  ): Promise<void> => {
    if (!email || email === 'guest') return;
    const hienCo = progressCache[email]
      || await FirestoreService.getUserProgress(email)
      || { userEmail: email, completedLessons: [], details: {} };

    const luyenTap = { ...(hienCo.luyenTap || {}) };
    const cuaBai = { ...(luyenTap[bai] as Record<string, unknown> || {}) };
    cuaBai[phan] = tienDoPhan;
    luyenTap[bai] = cuaBai;

    const moi: LearningProgress = { ...hienCo, luyenTap };
    setProgressCache(p => ({ ...p, [email]: moi }));
    try {
      await FirestoreService.saveUserProgress(moi);
    } catch (err) {
      /* Không nuốt im: tiến độ luyện tập CHỈ nằm trên Firestore (khác trò chơi
         có bản lưu trong máy). Ghi hỏng mà im lặng thì học sinh làm xong một
         phần, tải lại trang là mất sạch mà không hiểu vì sao. */
      console.error('Chưa lưu được tiến độ luyện tập:', err);
      throw err;
    }
  };

  const getUserProgress = (email: string): LearningProgress | null => {
    return progressCache[email] || null;
  };

  const getLessonProgress = (lessonId: string) => {
    if (!currentUser) return null;
    const progress = progressCache[currentUser.email];
    if (!progress) return null;
    
    if (progress.details && progress.details[lessonId]) {
      return progress.details[lessonId];
    }
    
    // Legacy fallback
    if (progress.completedLessons.includes(lessonId)) {
      return {
        lessonId,
        basicCompleted: true,
        quizAttempts: [],
        bestScore: 0,
        advancedUnlocked: false,
        advancedCompleted: false,
        skippedAdvanced: true
      };
    }
    return null;
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    const lp = getLessonProgress(lessonId);
    return lp ? lp.basicCompleted : false;
  };

  const hasAdvancedStudentTitle = (email: string): boolean => {
    const progress = progressCache[email];
    if (!progress || !progress.details) return false;
    return Object.values(progress.details).some(lp => lp.advancedUnlocked);
  };

  const resetGuestChats = () => {
    GuestChatStorage.reset();
    setGuestChatCount(0);
  };

  // ── Chương trình học ─────────────────────────────────────────────────────

  const deleteChapter = (chapterId: string) => {
    const updated = curriculum.filter(c => c.id !== chapterId);
    setCurriculum(updated);
    FirestoreService.deleteCurriculumChapter(chapterId);
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    const updated = curriculum.map(c =>
      c.id === chapterId
        ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) }
        : c
    );
    setCurriculum(updated);
    // Lưu chapter đã thay đổi lên Firestore
    const updatedChapter = updated.find(c => c.id === chapterId);
    if (updatedChapter) FirestoreService.saveCurriculumChapter(updatedChapter);
  };

  const addChapter = (title: string) => {
    const newChapter: Chapter = { id: `chuong-${Date.now()}`, title, lessons: [] };
    const updated = [...curriculum, newChapter];
    setCurriculum(updated);
    FirestoreService.saveCurriculumChapter(newChapter);
  };

  const addLesson = (
    chapterId: string,
    title: string,
    summary: string,
    formulae: string[],
    commonQuestions: any[]
  ) => {
    const newLesson: Lesson = { id: `bai-${Date.now()}`, title, summary, formulae, commonQuestions };
    const updated = curriculum.map(c =>
      c.id === chapterId ? { ...c, lessons: [...c.lessons, newLesson] } : c
    );
    setCurriculum(updated);
    const updatedChapter = updated.find(c => c.id === chapterId);
    if (updatedChapter) FirestoreService.saveCurriculumChapter(updatedChapter);
  };

  const updateChapter = (chapterId: string, title: string) => {
    const updated = curriculum.map(c =>
      c.id === chapterId ? { ...c, title } : c
    );
    setCurriculum(updated);
    const updatedChapter = updated.find(c => c.id === chapterId);
    if (updatedChapter) FirestoreService.saveCurriculumChapter(updatedChapter);
  };

  const updateLesson = (chapterId: string, lessonId: string, updatedLesson: Partial<Lesson>) => {
    const updated = curriculum.map(c =>
      c.id === chapterId
        ? {
            ...c,
            lessons: c.lessons.map(l =>
              l.id === lessonId ? { ...l, ...updatedLesson } : l
            ),
          }
        : c
    );
    setCurriculum(updated);
    const updatedChapter = updated.find(c => c.id === chapterId);
    if (updatedChapter) FirestoreService.saveCurriculumChapter(updatedChapter);
  };

  // ── Học sinh tự đăng ký ───────────────────────────────────────────────────

  /* Đăng ký học sinh tự do. KHÔNG nhận mã lớp nữa (12/09/2026): màn đăng ký
     chạy khi chưa đăng nhập nên không đọc được `classes`, không có cách nào cho
     chọn lớp ở đó. Học sinh vào rồi chọn lớp ở tab Học sinh.
     GHI CHÚ MÃ CHẾT: hàm `register` phía trên nay gần trùng hàm này và không có
     ai gọi. Để lại theo quy ước "thấy mã chết thì nhắc chứ đừng xoá". */
  const registerStudent = async (
    name: string,
    email: string,
    password: string
  ) => {
    if (!name.trim()) return { success: false, message: 'Vui lòng nhập họ tên.' };
    if (!email.trim()) return { success: false, message: 'Vui lòng nhập email.' };
    if (password.length < 8) return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Mật khẩu phải chứa cả chữ cái và chữ số.' };
    }

    const lower = email.toLowerCase().trim();

    /* Phép kiểm này chỉ chạy được khi người gọi ĐÃ đăng nhập; với khách thì
       mảng `users` rỗng nên nó không bao giờ bắt được gì. Hàng rào thật là
       Firebase Auth: nó trả `auth/email-already-in-use`. Giữ lại vì vô hại và
       cho thông báo đẹp hơn ở những đường có sẵn danh sách. */
    const existing = users.find(u => u.email.toLowerCase() === lower);
    if (existing) return { success: false, message: `Email ${email} đã được đăng ký trong hệ thống!` };

    const fsRes = await createAccountWithFirestore({
      username: lower,
      password: password,
      fullName: name.trim(),
      role: 'student',
      email: lower,
      status: 'active',
      dangTuDangKy: true,   // tạo trên app CHÍNH -> đăng nhập luôn sau khi tạo
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const newUser: User = {
      id: fsRes.user!.uid,
      email: lower,
      username: lower,
      name: name.trim(),
      role: 'student',
      status: 'active',
      authProvider: 'local',
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    persistSession(newUser);

    return { success: true, message: 'Tạo tài khoản thành công!', user: newUser };
  };

  /* Đăng ký làm giáo viên = đăng ký học sinh + một nguyện vọng.
     Tài khoản sinh ra với `role: 'student'` — đó là điều luật bắt buộc với mọi
     người tự đăng ký. Chỉ sau khi chủ dự án hoặc đồng quản trị bấm Duyệt thì
     `role` mới thành 'teacher'. */
  const registerTeacherApplicant = async (
    name: string,
    email: string,
    password: string
  ) => {
    const res = await registerStudent(name, email, password);
    if (!res.success || !res.user) return res;

    const ok = await FirestoreService.updateUserById(res.user.id, { pendingRole: 'teacher' });
    if (!ok) {
      return {
        success: true,
        message: 'Đã tạo tài khoản, nhưng chưa gửi được đơn xin làm giáo viên. Vào mục Học sinh để thử lại.',
        user: res.user,
      };
    }

    const capNhat: User = { ...res.user, pendingRole: 'teacher' };
    setUsers(prev => prev.map(u => (u.id === capNhat.id ? capNhat : u)));
    setCurrentUser(capNhat);
    return { success: true, message: 'Đã gửi đơn xin làm giáo viên. Chờ quản trị duyệt.', user: capNhat };
  };

  // ── Giáo viên tự tạo lớp ───────────────────────────────────────────

  const createClassSelf = async (className: string) => {
    if (!currentUser || currentUser.role !== 'teacher') {
      return { success: false, message: 'Chỉ giáo viên mới có thể tạo lớp.' };
    }
    if (!className.trim()) return { success: false, message: 'Tên lớp không được để trống.' };

    // Tạo inviteCode duy nhất (thử lại nếu trùng)
    let inviteCode = generateInviteCode();
    let attempts = 0;
    while (classes.some(c => c.inviteCode?.toUpperCase() === inviteCode) && attempts < 10) {
      inviteCode = generateInviteCode();
      attempts++;
    }

    const schoolClass: SchoolClass = {
      id: `class_self_${Date.now()}`,
      schoolId: currentUser.schoolId || `school_teacher_${currentUser.id}`,
      name: className.trim(),
      teacherEmail: currentUser.email,
      studentIdentifiers: [],
      inviteCode,
      createdAt: new Date().toISOString(),
    };

    const ok = await FirestoreService.addClass(schoolClass);
    if (!ok) return { success: false, message: 'Không thể tạo lớp. Vui lòng thử lại.' };

    setClasses(prev => [...prev, schoolClass]);
    return { success: true, message: `Đã tạo lớp "${className.trim()}" thành công.`, schoolClass };
  };

  // ── Học sinh đã đăng nhập tham gia lớp qua mã mời ────────────────────

  const joinClassByCode = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập trước khi tham gia lớp.' };
    if (!code.trim()) return { success: false, message: 'Vui lòng chọn lớp.' };

    if (currentUser.classId || currentUser.joinedClassId) {
      return { success: false, message: 'Bạn đã thuộc một lớp học. Liên hệ giáo viên nếu cần thay đổi.' };
    }
    /* KHÔNG chặn sớm chỉ vì đã có `pendingClassCode` cũ. Mã sai (gõ nhầm ở màn
       đăng ký, lúc đó không tra được vì `classes` rỗng) không trùng lớp nào,
       không giáo viên nào thấy để từ chối — chặn ở đây là khoá học sinh khỏi
       mọi lớp vĩnh viễn, chỉ Firebase Console mới cứu được. Mệnh đề tra mã
       ngay dưới đã báo lỗi cho mã sai; mã đúng thì cho ghi đè nguyện vọng cũ
       (luật Firestore cho phép — `pendingClassCode` không nằm trong danh sách
       trường bị cấm tự sửa). */
    const upper = code.trim().toUpperCase();

    /* Học sinh ĐÃ đăng nhập thì đọc được `classes` (luật chỉ đòi đã đăng
       nhập), nên ở đây tra mã được — khác màn đăng ký. Tra để báo sai ngay,
       đỡ để em chờ một đơn không bao giờ tới tay ai. */
    const schoolClass = classes.find(c => c.inviteCode?.toUpperCase() === upper);
    if (!schoolClass) {
      return { success: false, message: 'Lớp bạn chọn không còn tồn tại. Vui lòng tải lại trang rồi chọn lại.' };
    }

    /* CHỈ ghi vào hồ sơ của CHÍNH MÌNH, và chỉ đúng một trường nguyện vọng.
       Không đặt `classId`, không đụng `classes` — luật Firestore chặn cả hai,
       và đó là chủ ý: giáo viên là người duy nhất xếp lớp. */
    const ok = await FirestoreService.updateUserById(currentUser.id, {
      pendingClassCode: upper,
    });
    if (!ok) {
      return { success: false, message: 'Không gửi được đơn. Vui lòng thử lại.' };
    }

    const updatedUser = { ...currentUser, pendingClassCode: upper };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    return {
      success: true,
      message: `Đã gửi đơn xin vào lớp "${schoolClass.name}". Chờ giáo viên duyệt.`,
      className: schoolClass.name,
    };
  };

  // ── Giáo viên duyệt đơn xin vào lớp ──────────────────────────────────

  /* Hai lượt ghi dưới đây đều do GIÁO VIÊN thực hiện, và đó là cả điểm mấu
     chốt của đợt 2b: học sinh không ghi được vào `classes`, cũng không tự đặt
     được `classId` cho mình. Luật Firestore chặn cả hai đường. */
  const approveJoinRequest = async (studentId: string, classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return { success: false, message: 'Không tìm thấy lớp.' };
    const student = users.find(u => u.id === studentId);
    if (!student) return { success: false, message: 'Không tìm thấy học sinh.' };

    const identifier = student.username || student.email;

    const okHoSo = await FirestoreService.updateUserById(studentId, {
      classId: cls.id,
      joinedClassId: cls.id,
      schoolId: cls.schoolId,
    });
    if (!okHoSo) return { success: false, message: 'Không cập nhật được hồ sơ học sinh.' };

    await FirestoreService.addStudentToClass(cls.id, identifier);
    await FirestoreService.clearPendingClassCode(studentId);

    setUsers(prev => prev.map(u => u.id === studentId
      ? { ...u, classId: cls.id, joinedClassId: cls.id, schoolId: cls.schoolId, pendingClassCode: undefined }
      : u));
    setClasses(prev => prev.map(c => c.id === cls.id
      ? { ...c, studentIdentifiers: [...c.studentIdentifiers, identifier] }
      : c));

    return { success: true, message: `Đã thêm ${student.name} vào lớp "${cls.name}".` };
  };

  const rejectJoinRequest = async (studentId: string) => {
    const ok = await FirestoreService.clearPendingClassCode(studentId);
    if (!ok) return { success: false, message: 'Không xoá được đơn. Vui lòng thử lại.' };
    setUsers(prev => prev.map(u => u.id === studentId ? { ...u, pendingClassCode: undefined } : u));
    return { success: true, message: 'Đã từ chối đơn.' };
  };

  // ── Giáo viên/Admin chấm lại điểm câu tự luận của học sinh ────────────

  const updateQuizEssayScore = async (quizId: string, questionId: string, newScore: number) => {
    const quiz = QuizStorage.getQuizById(quizId);
    if (!quiz || !quiz.results) return { success: false, message: 'Không tìm thấy bài kiểm tra.' };

    const result = quiz.results[questionId];
    if (!result) return { success: false, message: 'Không tìm thấy kết quả câu hỏi.' };

    result.score = newScore;
    result.correct = newScore >= result.maxScore * 0.7;
    result.confidence = 'high';

    if (!result.feedback.includes('[Đã chấm lại]')) {
      result.feedback = `[Đã chấm lại bởi Giáo viên/Admin] ${result.feedback}`;
    }

    const totalScore = Object.values(quiz.results).reduce((sum, r) => sum + r.score, 0);
    quiz.score = Math.round(totalScore * 100) / 100;

    QuizStorage.updateQuiz(quizId, quiz);

    // Trigger re-render
    setClasses(prev => [...prev]);

    return { success: true, message: 'Đã cập nhật điểm thành công!' };
  };

  // ── Load chats khi đăng nhập hoặc vào bài học ────────────────────────────
  // Chats được load lazy (theo bài học) thay vì load toàn bộ khi init
  // Component TutorPage sẽ gọi getChatsByUserLesson trực tiếp

  // ── Provider ──────────────────────────────────────────────────────────────

  const updateSystemSettings = async (settings: { allowUserApiKey?: boolean }) => {
    const success = await FirestoreService.updateSystemSettings(settings);
    if (success) {
      setSystemSettings(prev => ({ ...prev, ...settings }));
    }
    return success;
  };

  // ── Đồng quản trị ─────────────────────────────────────────────────────────

  const laChuDuAnHienTai = laChuDuAn(currentUser?.email);
  const laDongQuanTriHienTai = Boolean(
    currentUser?.email && dongQuanTri.includes(currentUser.email.toLowerCase())
  );

  /* Thêm/bớt đồng quản trị. Hàng rào thật là luật (`allow write: if
     laChuDuAn()`); kiểm ở đây chỉ để báo lỗi sớm và tử tế. */
  const themDongQuanTri = async (email: string) => {
    const lower = email.trim().toLowerCase();
    if (!lower) return { success: false, message: 'Chưa nhập email.' };
    if (lower === EMAIL_CHU_DU_AN) {
      return { success: false, message: 'Chủ dự án vốn đã có toàn quyền, không cần thêm.' };
    }
    if (dongQuanTri.includes(lower)) {
      return { success: false, message: 'Người này đã là đồng quản trị.' };
    }
    const moi = [...dongQuanTri, lower];
    const ok = await FirestoreService.ghiDongQuanTri(moi);
    if (!ok) return { success: false, message: 'Không ghi được. Chỉ chủ dự án mới thêm được đồng quản trị.' };
    setDongQuanTri(moi);
    return { success: true, message: `Đã thêm ${lower} làm đồng quản trị.` };
  };

  const boDongQuanTri = async (email: string) => {
    const lower = email.trim().toLowerCase();
    const moi = dongQuanTri.filter(e => e !== lower);
    const ok = await FirestoreService.ghiDongQuanTri(moi);
    if (!ok) return { success: false, message: 'Không ghi được. Chỉ chủ dự án mới bớt được đồng quản trị.' };
    setDongQuanTri(moi);
    return { success: true, message: `Đã bỏ ${lower} khỏi danh sách đồng quản trị.` };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        chats,
        guestChatCount,
        loading,
        curriculum,
        schools,
        classes,
        exams,
        addExam,
        deleteExam,
        equations,
        addEquation,
        deleteEquation,
        matrixResources,
        addMatrixResource,
        deleteMatrixResource,
        libraryQuestions,
        addLibraryQuestion,
        deleteLibraryQuestion,
        login,
        loginWithGoogle,
        completeGoogleRegistration,
        register,
        logout,
        forgotPassword,
        approveUser,
        rejectUser,
        deleteUser,
        updateUserInfo,
        createSchool,
        createSchoolAdmin,
        createTeacher,
        createClass,
        updateClass,
        deleteClass,
        createStudent,
        getMyClass,
        addMessage,
        loadLessonChats,
        toggleLessonCompletion,
        updateLessonProgress,
        clearLessonHistory,
        luuTienDoTroChoi,
        luuTienDoLuyenTap,
    getUserProgress,
        getLessonProgress,
        isLessonCompleted,
        hasAdvancedStudentTitle,
        resetGuestChats,
        deleteChapter,
        deleteLesson,
        addChapter,
        addLesson,
        updateChapter,
        updateLesson,
        registerStudent,
        registerTeacherApplicant,
        createClassSelf,
        joinClassByCode,
        approveJoinRequest,
        rejectJoinRequest,
        updateQuizEssayScore,
        systemSettings,
        updateSystemSettings,
        dongQuanTri,
        laChuDuAnHienTai,
        laDongQuanTriHienTai,
        themDongQuanTri,
        boDongQuanTri,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
