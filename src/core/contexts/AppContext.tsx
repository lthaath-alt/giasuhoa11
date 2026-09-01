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
import { QuizStorage } from '../../features/quiz/quizStorage';
import { loginWithFirestore, createAccountWithFirestore } from '../services/firestoreAuth';
import { FirestoreService } from '../services/firestoreService';
import { runMigrationIfNeeded } from '../services/migrationService';
import { ErrorLogService } from '../services/errorLog';
import { UserRole } from '../../features/auth/types';
import { LibraryExam, Equation, MatrixResource, Question } from '../../features/library/types';

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
   * Học sinh tự đăng ký tài khoản (có hoặc không có mã lớp).
   * - Có mã lớp hợp lệ: tạo role='student', gán vào lớp.
   * - Không có mã lớp: tạo role='free_user', học sinh tự do.
   */
  registerWithOptionalClass: (
    name: string,
    email: string,
    password: string,
    inviteCode?: string
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
   * Học sinh đã đăng nhập nhập mã lớp để tham gia.
   * Chuyển free_user/student chưa có lớp → student thuộc lớp.
   * Lịch sử học tập được GIỮ NGUYÊN.
   */
  joinClassByCode: (code: string) => Promise<{
    success: boolean;
    message: string;
    className?: string;
  }>;

  /** Giáo viên/Admin chấm lại điểm câu tự luận của học sinh */
  updateQuizEssayScore: (
    quizId: string,
    questionId: string,
    newScore: number
  ) => Promise<{ success: boolean; message: string }>;

  // ── Cài đặt hệ thống ─────────────────────────────────────────────────────────
  systemSettings: { allowUserApiKey?: boolean };
  updateSystemSettings: (settings: { allowUserApiKey?: boolean }) => Promise<boolean>;
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

  // ── Progress cache (load theo user khi đăng nhập) ─────────────────────────
  const [progressCache, setProgressCache] = useState<Record<string, LearningProgress>>({});

  // ── Nạp dữ liệu khi khởi động từ Firestore ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      // 1. Chạy migration localStorage → Firestore nếu chưa làm
      await runMigrationIfNeeded();

      // 2. Load song song tất cả collections từ Firestore
      const [
        allUsers,
        allSchools,
        allClasses,
        allQuestions,
        allExams,
        allEqs,
        allMatrix,
        curriculumOverrides,
        settings,
      ] = await Promise.all([
        FirestoreService.getUsers(),
        FirestoreService.getSchools(),
        FirestoreService.getClasses(),
        FirestoreService.getQuestions(),
        FirestoreService.getExams(),
        FirestoreService.getEquations(),
        FirestoreService.getMatrixResources(),
        FirestoreService.getCurriculumOverrides(),
        FirestoreService.getSystemSettings(),
      ]);

      // 3. Migrate role cũ 'admin' → 'super_admin' (nếu còn sót)
      const migratedUsers = allUsers.map(u =>
        (u.role as string) === 'admin' ? { ...u, role: 'super_admin' as UserRole } : u
      );

      // 4. Cập nhật state
      setUsers(migratedUsers);
      setSchools(allSchools);
      setClasses(allClasses);
      setLibraryQuestions(allQuestions);
      setExams(allExams);
      setEquations(allEqs);
      setMatrixResources(allMatrix);
      setSystemSettings(settings);

      // 5. Merge curriculum với constants
      setCurriculum(mergeCurriculumWithConstants(curriculumOverrides));

      // 6. Guest chat count (vẫn từ localStorage — thuộc thiết bị)
      setGuestChatCount(GuestChatStorage.getCount());

      // 7. Không tự động khôi phục session — user phải đăng nhập lại
      localStorage.removeItem('h11_current_user_data');
      localStorage.removeItem('h11_current_user_email');
      setCurrentUser(null);

      setLoading(false);
    };

    init();
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

    if (fsRes.success && fsRes.user) {
      const rawRole = fsRes.user.role as string;
      const resolvedRole: UserRole = rawRole === 'admin' ? 'super_admin' : (rawRole as UserRole) || 'student';

      // Tìm user đầy đủ từ state (đã load khi init)
      const lower = identifier.toLowerCase();
      const stateUser = users.find(
        u => u.email.toLowerCase() === lower ||
             u.username?.toLowerCase() === lower
      );

      const appUser: User = stateUser || {
        id: fsRes.user.uid,
        email: `${fsRes.user.username}@firestore.local`,
        username: fsRes.user.username,
        password: fsRes.user.password,
        name: fsRes.user.fullName,
        role: resolvedRole,
        status: 'active',
        authProvider: 'local',
        canChangePassword: true,
        createdAt: typeof fsRes.user.createdAt === 'string'
          ? fsRes.user.createdAt
          : new Date().toISOString(),
      };

      // Load progress cho user này
      await loadProgressForUser(appUser.email);

      persistSession(appUser);
      return { success: true, message: 'Đăng nhập thành công!', user: appUser };
    }

    return { success: false, message: fsRes.message || 'Sai tài khoản hoặc mật khẩu' };
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
      role: 'free_user',
      email: identifier,
      status: 'active',
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const id = fsRes.user?.uid || `uid_google_${googleInfo.sub.slice(0, 12)}`;
    const newUser: User = {
      id,
      email: googleInfo.email,
      username: identifier,
      password,
      name: googleInfo.name,
      role: 'free_user',
      status: 'active',
      authProvider: 'google',
      googleId: googleInfo.sub,
      canChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    // Cập nhật Firestore với googleId (nếu chưa có)
    await FirestoreService.updateUserById(id, { googleId: googleInfo.sub });

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
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const id = fsRes.user?.uid || `uid_${Date.now()}_${email.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;
    const newUser: User = {
      id,
      email,
      username: identifier,
      password,
      name,
      role: 'student',
      status: 'pending',
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

  const logout = () => {
    setCurrentUser(null);
    setChats([]);
    localStorage.removeItem('h11_current_user_email');
    localStorage.removeItem('h11_current_user_data');
  };

  // ── Quên mật khẩu ────────────────────────────────────────────────────────

  const forgotPassword = async (identifier: string) => {
    const lower = identifier.toLowerCase();
    const user = users.find(
      u => u.email.toLowerCase() === lower || u.username?.toLowerCase() === lower
    );
    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản với email/username này.' };
    }

    if (user.role === 'student') {
      return {
        success: false,
        message: 'Tài khoản học sinh do Giáo viên quản lý. Vui lòng liên hệ giáo viên để được cấp lại mật khẩu.',
      };
    }

    const newPassword = generateRandomPassword();
    // Cập nhật Firestore
    await FirestoreService.updateUserById(user.id, { password: newPassword });

    // Cập nhật state
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, password: newPassword } : u));

    if (currentUser?.id === user.id) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : prev);
    }

    return {
      success: true,
      message: `Mật khẩu mới đã được tạo. Hãy sao chép và lưu lại ngay bây giờ!`,
      newPassword,
      email: user.email,
    };
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
    const id = `uid_teacher_${Date.now()}`;

    const teacher: User = {
      id,
      email: lower,
      password,
      name: data.name.trim(),
      role: 'teacher',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    const ok = await FirestoreService.addUser(teacher);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản giáo viên. Vui lòng thử lại.' };

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
    if (currentUser?.role !== 'super_admin') {
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
    const id = `uid_school_admin_${Date.now()}`;
    const schoolAdmin: User = {
      id,
      email: lower,
      password,
      name: data.name.trim(),
      role: 'school_admin',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    const ok = await FirestoreService.addUser(schoolAdmin);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản admin trường. Vui lòng thử lại.' };

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
    // Để an toàn, cập nhật tất cả học sinh trong lớp thành free_user và classId = null
    const studentUsers = users.filter(u => targetClass.studentIdentifiers.includes(u.email) || targetClass.studentIdentifiers.includes(u.username!));
    for (const student of studentUsers) {
      await FirestoreService.updateUserById(student.id, { classId: null, role: 'free_user' });
    }
    
    // Cập nhật local state users
    setUsers(prev => prev.map(u => studentUsers.some(su => su.id === u.id) ? { ...u, classId: undefined, role: 'free_user' } : u));
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
    const id = `uid_student_${Date.now()}`;

    const student: User = {
      id,
      email: data.email?.toLowerCase().trim() || `${data.username}@internal.local`,
      username: data.username?.trim(),
      password,
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

    const ok = await FirestoreService.addUser(student);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản học sinh. Vui lòng thử lại.' };

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

    // ĐIỀU KIỆN KÍCH HOẠT: Khi AI báo đã hoàn thành
    if (
      aiResponseText.includes('Chúc mừng em! Em đã tự mình') ||
      aiResponseText.includes('Chúc mừng em đã hoàn thành bài toán!')
    ) {
      const chapter = curriculum.find(c => c.lessons.some(l => l.id === lessonId));

      /* Không tìm ra chương thì THÔI, không đoán bừa. Trước đây chỗ này rơi về
         'c1' — một mã chương không có thật (mã thật là 'chuong-1'). Màn hình tư
         vấn chung còn gọi addMessage('global-advisor', ...), một lessonId không
         thuộc bài nào, nên luôn rơi vào nhánh này và luôn dựng đề từ bộ dự
         phòng của bài khác. */
      const quiz = chapter
        ? await QuizService.createQuiz(chapter.id, lessonId, userEmail, libraryQuestions)
        : null;

      if (quiz) {
        const quizLink = `${window.location.origin}${window.location.pathname}#/quiz/${quiz.id}`;
        finalAiResponse += `\n\n👉 **Hãy làm bài kiểm tra ngắn ngay tại đây để củng cố kiến thức nhé:** [Làm bài kiểm tra ngay](${quizLink})`;
      } else {
        /* Bài chưa có câu hỏi nào: im lặng bỏ link, KHÔNG giao đề của bài khác.
           Ghi log để Admin biết bài nào cần gắn câu hỏi. */
        console.warn(
          `[Quiz] Không tạo được đề cho bài "${lessonId}" ` +
          (chapter ? '(bài chưa có câu hỏi nào).' : '(lessonId không thuộc chương nào).') +
          ' Đã bỏ link kiểm tra.',
        );
        ErrorLogService.logError({
          level: 'Cảnh Báo Hệ Thống',
          component: 'AppContext.addMessage',
          message: `Bài "${lessonId}" chưa có câu hỏi trong ngân hàng nên không tạo được bài kiểm tra.`,
          userEmail,
        });
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

  // ── Học sinh tự đăng ký (có hoặc không có mã lớp) ────────────────────────

  const registerWithOptionalClass = async (
    name: string,
    email: string,
    password: string,
    inviteCode?: string
  ) => {
    if (!name.trim()) return { success: false, message: 'Vui lòng nhập họ tên.' };
    if (!email.trim()) return { success: false, message: 'Vui lòng nhập email.' };
    if (password.length < 8) return { success: false, message: 'Mật khẩu phải có ít nhất 8 ký tự.' };
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return { success: false, message: 'Mật khẩu phải chứa cả chữ cái và chữ số.' };
    }

    // Kiểm tra email đã tồn tại trong state
    const lower = email.toLowerCase().trim();
    const existing = users.find(u => u.email.toLowerCase() === lower);
    if (existing) return { success: false, message: `Email ${email} đã được đăng ký trong hệ thống!` };

    let assignedClassId: string | undefined;
    let assignedSchoolId: string | undefined;

    if (inviteCode && inviteCode.trim()) {
      const code = inviteCode.trim().toUpperCase();
      const schoolClass = classes.find(c => c.inviteCode?.toUpperCase() === code);
      if (!schoolClass) {
        return { success: false, message: `Mã lớp "${inviteCode.toUpperCase()}" không tồn tại. Vui lòng kiểm tra lại.` };
      }
      assignedClassId = schoolClass.id;
      assignedSchoolId = schoolClass.schoolId;
    }

    const isManaged = Boolean(assignedClassId);
    const identifier = lower;
    const targetRole = isManaged ? 'student' : 'free_user';

    // Đẩy lên Firestore collection "users"
    const fsRes = await createAccountWithFirestore({
      username: identifier,
      password: password,
      fullName: name.trim(),
      role: targetRole,
      email: identifier,
      classId: assignedClassId,
      schoolId: assignedSchoolId,
      status: 'active',
    });

    if (!fsRes.success) {
      return { success: false, message: fsRes.message };
    }

    const id = fsRes.user?.uid || `uid_student_self_${Date.now()}`;
    const newUser: User = {
      id,
      email: identifier,
      username: identifier,
      password,
      name: name.trim(),
      role: targetRole as UserRole,
      status: 'active',
      authProvider: 'local',
      classId: assignedClassId,
      joinedClassId: assignedClassId,
      schoolId: assignedSchoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);

    if (assignedClassId) {
      // Cập nhật class trên Firestore
      await FirestoreService.addStudentToClass(assignedClassId, identifier);
      setClasses(prev => prev.map(c =>
        c.id === assignedClassId
          ? { ...c, studentIdentifiers: [...c.studentIdentifiers, identifier] }
          : c
      ));
    }

    persistSession(newUser);
    return { success: true, message: 'Tạo tài khoản thành công!', user: newUser };
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
    if (!code.trim()) return { success: false, message: 'Vui lòng nhập mã lớp.' };

    if (currentUser.classId || currentUser.joinedClassId) {
      return { success: false, message: 'Bạn đã thuộc một lớp học. Liên hệ giáo viên nếu cần thay đổi.' };
    }

    const upper = code.trim().toUpperCase();
    const schoolClass = classes.find(c => c.inviteCode?.toUpperCase() === upper);
    if (!schoolClass) {
      return { success: false, message: `Mã lớp "${code.toUpperCase()}" không tồn tại. Vui lòng kiểm tra lại.` };
    }

    const identifier = currentUser.username || currentUser.email;
    const updates = {
      role: 'student' as UserRole,
      classId: schoolClass.id,
      joinedClassId: schoolClass.id,
      schoolId: schoolClass.schoolId,
    };

    // Cập nhật Firestore
    await FirestoreService.updateUserById(currentUser.id, updates);
    await FirestoreService.addStudentToClass(schoolClass.id, identifier);

    // Cập nhật state
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setClasses(prev => prev.map(c =>
      c.id === schoolClass.id
        ? { ...c, studentIdentifiers: [...c.studentIdentifiers, identifier] }
        : c
    ));

    localStorage.setItem('h11_current_user_email', updatedUser.email);

    return { success: true, message: `Đã tham gia lớp "${schoolClass.name}" thành công!`, className: schoolClass.name };
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
        registerWithOptionalClass,
        createClassSelf,
        joinClassByCode,
        updateQuizEssayScore,
        systemSettings,
        updateSystemSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
