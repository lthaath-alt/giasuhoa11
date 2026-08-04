import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, ChatMessage, LearningProgress, School, SchoolClass } from '../../features/auth/types';
import { Chapter, Lesson } from '../../features/lessons/types';
import { StorageService, generateRandomPassword, generateInviteCode } from '../services/storage';
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
  /** Nếu không truyền, hệ thống tự tạo mật khẩu ngẫu nhiên */
  password?: string;
  classId: string;
  schoolId: string;
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
   * Không gửi email thật (mock – localStorage only).
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
  toggleLessonCompletion: (lessonId: string) => void;
  clearLessonHistory: (lessonId: string) => void;
  getUserProgress: (email: string) => LearningProgress | null;
  isLessonCompleted: (lessonId: string) => boolean;
  resetGuestChats: () => void;

  // ── Chương trình học ──────────────────────────────────────────────────────────

  deleteChapter: (chapterId: string) => void;
  deleteLesson: (chapterId: string, lessonId: string) => void;
  addChapter: (title: string) => void;
  addLesson: (chapterId: string, title: string, summary: string, formulae: string[], commonQuestions: any[]) => void;
  updateChapter: (chapterId: string, title: string) => void;
  updateLesson: (chapterId: string, lessonId: string, updatedLesson: Partial<Lesson>) => void;

  // ── Quản lý lớp và tham gia lớp (Bước 2) ─────────────────────────────────────────

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

  // Nạp dữ liệu khi khởi động
  useEffect(() => {
    const allUsers   = StorageService.getUsers();       // tự migrate nếu cần
    const allChats   = StorageService.getChats();
    const guestChats = StorageService.getGuestChatCount();
    const curr       = StorageService.getCurriculum();
    const allSchools = StorageService.getSchools();
    const allClasses = StorageService.getClasses();
    const allExams = StorageService.getExams();
    const allEqs = StorageService.getEquations();
    const allMatrix = StorageService.getMatrixResources();
    const allQs = StorageService.getQuestions();

    // ── Migrate: đổi role 'admin' cũ thành 'super_admin' ────────────────
    const migratedUsers = allUsers.map(u =>
      (u.role as string) === 'admin' ? { ...u, role: 'super_admin' as UserRole } : u
    );
    const hasMigrations = migratedUsers.some((u, i) => u !== allUsers[i]);
    if (hasMigrations) {
      StorageService.saveUsers(migratedUsers);
    }

    setUsers(hasMigrations ? migratedUsers : allUsers);
    setChats(allChats);
    setGuestChatCount(guestChats);
    setCurriculum(curr);
    setSchools(allSchools);
    setClasses(allClasses);
    setExams(allExams);
    setEquations(allEqs);
    setMatrixResources(allMatrix);
    setLibraryQuestions(allQs);

    // Không tự động khôi phục session cũ từ cache localStorage
    localStorage.removeItem('h11_current_user_data');
    localStorage.removeItem('h11_current_user_email');
    setCurrentUser(null);
    setLoading(false);
  }, []);

  // ── Helper: lưu session ────────────────────────────────────────────────────

  const persistSession = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('h11_current_user_email', user.email);
    localStorage.setItem('h11_current_user_data', JSON.stringify(user));
  };

  // ── Đăng nhập bằng Firestore (collection "users", username + plain text password) ──

  const login = async (identifier: string, password: string) => {
    // 1. Thực hiện xác thực trực tiếp với Firestore collection "users"
    const fsRes = await loginWithFirestore(identifier, password);

    if (fsRes.success && fsRes.user) {
      // Chuẩn hoá role: 'admin' cũ → 'super_admin'
      const rawRole = fsRes.user.role as string;
      const resolvedRole: UserRole = rawRole === 'admin' ? 'super_admin' : (rawRole as UserRole) || 'student';
      const appUser: User = {
        id: fsRes.user.uid,
        email: `${fsRes.user.username}@firestore.local`,
        username: fsRes.user.username,
        password: fsRes.user.password,
        name: fsRes.user.fullName,
        role: resolvedRole,
        status: 'active',
        authProvider: 'local',
        canChangePassword: true,
        createdAt: typeof fsRes.user.createdAt === 'string' ? fsRes.user.createdAt : new Date().toISOString(),
      };

      persistSession(appUser);
      return { success: true, message: 'Đăng nhập thành công!', user: appUser };
    }

    // 2. Dự phòng (Fallback): Nếu không tìm thấy trên Firestore hoặc Firestore lỗi kết nối, kiểm tra StorageService local
    const user = StorageService.getUserByIdentifier(identifier);
    if (user && user.password === password) {
      if (user.status === 'pending') {
        const who = user.role === 'teacher' ? 'Admin trường' : 'Giáo viên / Quản trị viên';
        return { success: false, message: `Tài khoản đang chờ ${who} phê duyệt. Vui lòng liên hệ để được kích hoạt.` };
      }
      if (user.status === 'rejected') {
        return { success: false, message: 'Tài khoản đã bị từ chối. Vui lòng liên hệ Admin để kiểm tra thông tin.' };
      }
      persistSession(user);
      return { success: true, message: 'Đăng nhập thành công!', user };
    }

    if (fsRes.message === 'Sai tài khoản hoặc mật khẩu' || !user) {
      return { success: false, message: 'Sai tài khoản hoặc mật khẩu' };
    }
    if (!user) {
      return { success: false, message: fsRes.message || 'Sai tài khoản hoặc mật khẩu' };
    }
    if (user.password !== password) {
      return { success: false, message: 'Sai tài khoản hoặc mật khẩu' };
    }

    // Kiểm tra trạng thái với thông báo phân biệt theo role (với user local)
    if (user.status === 'pending') {
      const who = user.role === 'teacher'
        ? 'Admin trường'
        : 'Giáo viên / Quản trị viên';
      return {
        success: false,
        message: `Tài khoản đang chờ ${who} phê duyệt. Vui lòng liên hệ để được kích hoạt.`,
      };
    }
    if (user.status === 'rejected') {
      return {
        success: false,
        message: 'Tài khoản đã bị từ chối. Vui lòng liên hệ Admin để kiểm tra thông tin.',
      };
    }

    persistSession(user);
    return { success: true, message: 'Đăng nhập thành công!', user };
  };

  // ── Đăng nhập / Đăng ký bằng Google ──────────────────────────────────────

  const loginWithGoogle = async (googleInfo: GoogleUserInfo) => {
    // 1. Tìm theo googleId (đăng nhập lại sau lần đầu)
    const byGoogleId = StorageService.getUserByGoogleId(googleInfo.sub);
    if (byGoogleId) {
      if (byGoogleId.status === 'rejected') {
        return { success: false, message: 'Tài khoản đã bị từ chối. Liên hệ Admin để hỗ trợ.' };
      }
      persistSession(byGoogleId);
      return { success: true, message: 'Đăng nhập Google thành công!', user: byGoogleId };
    }

    // 2. Kiểm tra email đã tồn tại (tài khoản trường học hoặc local)
    const byEmail = StorageService.getUserByEmail(googleInfo.email);
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
    // Validate mật khẩu: ≥8 ký tự, có ít nhất 1 chữ và 1 số
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
      canChangePassword: false, // free_user chỉ được reset qua "Quên mật khẩu"
      createdAt: new Date().toISOString(),
    };

    const ok = StorageService.addUser(newUser);
    if (!ok) {
      return { success: false, message: 'Email này đã tồn tại trong bộ nhớ local.' };
    }

    setUsers(StorageService.getUsers());
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

    const ok = StorageService.addUser(newUser);
    if (!ok) return { success: false, message: 'Email này đã tồn tại trong hệ thống!' };

    setUsers(StorageService.getUsers());
    return {
      success: true,
      message: 'Đăng ký thành công! Tài khoản của bạn đã được gửi tới hệ thống để phê duyệt.',
    };
  };

  // ── Đăng xuất ────────────────────────────────────────────────────────────

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('h11_current_user_email');
    localStorage.removeItem('h11_current_user_data');
  };

  // ── Quên mật khẩu ────────────────────────────────────────────────────────

  const forgotPassword = async (identifier: string) => {
    const user = StorageService.getUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản với email/username này.' };
    }

    // Học sinh thuộc trường học không tự reset được – phải liên hệ GV
    if (user.role === 'student') {
      return {
        success: false,
        message: 'Tài khoản học sinh do Giáo viên quản lý. Vui lòng liên hệ giáo viên để được cấp lại mật khẩu.',
      };
    }

    const newPassword = generateRandomPassword();
    StorageService.updateUser(user.email, { password: newPassword });
    setUsers(StorageService.getUsers());

    // Nếu đang đăng nhập, đồng bộ session
    if (currentUser?.email === user.email) {
      setCurrentUser({ ...currentUser, password: newPassword });
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
    const updated = [...exams, newExam];
    StorageService.saveExams(updated);
    setExams(updated);
  };

  const deleteExam = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    StorageService.saveExams(updated);
    setExams(updated);
  };

  const addEquation = (eq: Omit<Equation, 'id' | 'createdAt'>) => {
    const newEq: Equation = {
      ...eq,
      id: `eq_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...equations, newEq];
    StorageService.saveEquations(updated);
    setEquations(updated);
  };

  const deleteEquation = (id: string) => {
    const updated = equations.filter(e => e.id !== id);
    StorageService.saveEquations(updated);
    setEquations(updated);
  };

  const addMatrixResource = (res: Omit<MatrixResource, 'id' | 'createdAt'>) => {
    const newRes: MatrixResource = {
      ...res,
      id: `matrix_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...matrixResources, newRes];
    StorageService.saveMatrixResources(updated);
    setMatrixResources(updated);
  };

  const deleteMatrixResource = (id: string) => {
    const updated = matrixResources.filter(r => r.id !== id);
    StorageService.saveMatrixResources(updated);
    setMatrixResources(updated);
  };

  const addLibraryQuestion = (q: Omit<Question, 'id' | 'createdAt'>) => {
    const newQ: Question = {
      ...q,
      id: `q_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...libraryQuestions, newQ];
    StorageService.saveQuestions(updated);
    setLibraryQuestions(updated);
  };

  const deleteLibraryQuestion = (id: string) => {
    const updated = libraryQuestions.filter(q => q.id !== id);
    StorageService.saveQuestions(updated);
    setLibraryQuestions(updated);
  };

  // ── Admin: duyệt / từ chối / xóa tài khoản ──────────────────────────────

  const approveUser = (email: string) => {
    StorageService.updateUserStatus(email, 'active');
    const updated = StorageService.getUsers();
    setUsers(updated);
    if (currentUser?.email.toLowerCase() === email.toLowerCase()) {
      setCurrentUser({ ...currentUser, status: 'active' });
    }
  };

  const rejectUser = (email: string) => {
    StorageService.updateUserStatus(email, 'rejected');
    const updated = StorageService.getUsers();
    setUsers(updated);
    if (currentUser?.email.toLowerCase() === email.toLowerCase()) {
      setCurrentUser({ ...currentUser, status: 'rejected' });
    }
  };

  const deleteUser = (id: string) => {
    StorageService.deleteUserById(id);
    setUsers(StorageService.getUsers());
  };

  const updateUserInfo = (id: string, updates: Partial<User>) => {
    StorageService.updateUserById(id, updates);
    setUsers(StorageService.getUsers());
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

    const ok = StorageService.addSchool(school);
    if (!ok) return { success: false, message: 'Trường này đã tồn tại trong hệ thống.' };

    setSchools(StorageService.getSchools());
    return { success: true, message: `Đã tạo trường "${trimmed}" thành công.`, school };
  };

  const createTeacher = async (data: CreateTeacherData) => {
    if (!data.name.trim() || !data.email.trim()) {
      return { success: false, message: 'Tên và email giáo viên không được để trống.' };
    }
    if (!data.schoolId) {
      return { success: false, message: 'Vui lòng chỉ định trường học cho giáo viên.' };
    }

    // Kiểm tra email đã tồn tại chưa
    const existing = StorageService.getUserByEmail(data.email);
    if (existing) {
      return { success: false, message: `Email ${data.email} đã được đăng ký trong hệ thống.` };
    }

    const password = data.password || generateRandomPassword();
    const id = `uid_teacher_${Date.now()}`;

    const teacher: User = {
      id,
      email: data.email.toLowerCase().trim(),
      password,
      name: data.name.trim(),
      role: 'teacher',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };

    const ok = StorageService.addUser(teacher);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản giáo viên. Vui lòng thử lại.' };

    setUsers(StorageService.getUsers());

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
    const existing = StorageService.getUserByEmail(data.email);
    if (existing) {
      return { success: false, message: `Email ${data.email} đã được đăng ký trong hệ thống.` };
    }
    const password = data.password || generateRandomPassword();
    const id = `uid_school_admin_${Date.now()}`;
    const schoolAdmin: User = {
      id,
      email: data.email.toLowerCase().trim(),
      password,
      name: data.name.trim(),
      role: 'school_admin',
      status: 'active',
      authProvider: 'local',
      schoolId: data.schoolId,
      canChangePassword: true,
      createdAt: new Date().toISOString(),
    };
    const ok = StorageService.addUser(schoolAdmin);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản admin trường. Vui lòng thử lại.' };
    // Thêm email vào School.adminEmails
    const allSchools = StorageService.getSchools();
    const school = allSchools.find(s => s.id === data.schoolId);
    if (school && !school.adminEmails.includes(schoolAdmin.email)) {
      school.adminEmails.push(schoolAdmin.email);
      StorageService.saveSchools(allSchools);
      setSchools(StorageService.getSchools());
    }
    setUsers(StorageService.getUsers());
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

    const teacher = StorageService.getUserByEmail(teacherEmail);
    if (!teacher || teacher.role !== 'teacher') {
      return { success: false, message: 'Giáo viên không tồn tại hoặc email không hợp lệ.' };
    }

    // Một GV chỉ được quản lý 1 lớp tại một thời điểm
    const existingClass = StorageService.getClassByTeacher(teacherEmail);
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
      teacherEmail: teacherEmail.toLowerCase(),
      studentIdentifiers: [],
      inviteCode: generateInviteCode(),
      createdAt: new Date().toISOString(),
    };

    const ok = StorageService.addClass(schoolClass);
    if (!ok) return { success: false, message: 'Không thể tạo lớp. Vui lòng thử lại.' };

    // Cập nhật schoolId của GV nếu chưa có
    if (!teacher.schoolId) {
      StorageService.updateUser(teacherEmail, { schoolId });
    }

    setClasses(StorageService.getClasses());
    return { success: true, message: `Đã tạo lớp "${className.trim()}" thành công.`, schoolClass };
  };

  // ── Quản lý Học sinh ─────────────────────────────────────────────────────

  const createStudent = async (data: CreateStudentData) => {
    if (!data.name.trim()) return { success: false, message: 'Tên học sinh không được để trống.' };
    if (!data.email && !data.username) {
      return { success: false, message: 'Vui lòng cung cấp email hoặc username cho học sinh.' };
    }

    // Kiểm tra trùng lặp
    if (data.email) {
      const existing = StorageService.getUserByEmail(data.email);
      if (existing) return { success: false, message: `Email ${data.email} đã được sử dụng.` };
    }
    if (data.username) {
      const existing = StorageService.getUserByUsername(data.username);
      if (existing) return { success: false, message: `Username "${data.username}" đã được sử dụng.` };
    }

    const password = data.password || generateRandomPassword();
    const identifier = data.email || data.username!;
    const id = `uid_student_${Date.now()}`;

    const student: User = {
      id,
      email: data.email?.toLowerCase().trim() || `${data.username}@internal.local`,
      username: data.username?.trim(),
      password,
      name: data.name.trim(),
      role: 'student',
      status: 'active', // GV tạo → kích hoạt ngay, không cần duyệt
      authProvider: 'local',
      schoolId: data.schoolId,
      classId: data.classId,
      canChangePassword: false,
      createdAt: new Date().toISOString(),
    };

    const ok = StorageService.addUser(student);
    if (!ok) return { success: false, message: 'Không thể tạo tài khoản học sinh. Vui lòng thử lại.' };

    // Thêm vào danh sách lớp
    StorageService.addStudentToClass(data.classId, identifier);

    setUsers(StorageService.getUsers());
    setClasses(StorageService.getClasses());

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
    return StorageService.getClassByTeacher(currentUser.email);
  };

  // ── Chat ─────────────────────────────────────────────────────────────────

  const addMessage = async (lessonId: string, content: string) => {
    const userEmail = currentUser ? currentUser.email : 'guest';

    if (!currentUser) {
      const currentCount = StorageService.getGuestChatCount();
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

    StorageService.addChatMessage(userMsg);

    if (!currentUser) {
      const nextCount = StorageService.incrementGuestChatCount();
      setGuestChatCount(nextCount);
    }

    let updatedChats = StorageService.getChats();
    setChats(updatedChats);

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
      StorageService.addChatMessage(cooldownMsg);
      setChats(StorageService.getChats());
      return; // Skip gọi AI
    }

    const currentHistory = updatedChats.filter(
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
      
      // Xóa tag khỏi tin nhắn để hiển thị cho người dùng
      aiResponseText = aiResponseText.replace(/\[SIGNAL:OFFTOPIC\]/g, '').trim();

      if (cooldownActivated) {
        aiResponseText += formatCooldownActivationNotice();
      }
    }

    let finalAiResponse = aiResponseText;
    
    // ĐIỀU KIỆN KÍCH HOẠT: Khi AI báo đã hoàn thành (nhánh lý thuyết hoặc tính toán)
    if (aiResponseText.includes('Chúc mừng em! Em đã tự mình') || aiResponseText.includes('Chúc mừng em đã hoàn thành bài toán!')) {
      const chapter = curriculum.find(c => c.lessons.some(l => l.id === lessonId));
      const chapterId = chapter ? chapter.id : 'c1';
      
      const quiz = QuizService.createQuiz(chapterId, lessonId, userEmail);
      const quizLink = `${window.location.origin}${window.location.pathname}#/quiz/${quiz.id}`;
      
      finalAiResponse += `\n\n👉 **Hãy làm bài kiểm tra ngắn ngay tại đây để củng cố kiến thức nhé:** [Làm bài kiểm tra ngay](${quizLink})`;
    }

    const aiMsg: ChatMessage = {
      id: `m-ai-${Date.now() + 1}`,
      userEmail,
      lessonId,
      sender: 'ai',
      content: finalAiResponse,
      timestamp: new Date().toISOString(),
    };

    StorageService.addChatMessage(aiMsg);
    setChats(StorageService.getChats());
  };

  // ── Tiến độ học tập ───────────────────────────────────────────────────────

  const toggleLessonCompletion = (lessonId: string) => {
    if (!currentUser) return;
    StorageService.toggleLessonCompletion(currentUser.email, lessonId);
    setCurrentUser({ ...currentUser });
  };

  const clearLessonHistory = (lessonId: string) => {
    const email = currentUser ? currentUser.email : 'guest';
    StorageService.clearLessonChats(email, lessonId);
    setChats(StorageService.getChats());
  };

  const getUserProgress = (email: string): LearningProgress | null => {
    return StorageService.getUserProgress(email);
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    if (!currentUser) return false;
    const progress = StorageService.getUserProgress(currentUser.email);
    return progress.completedLessons.includes(lessonId);
  };

  const resetGuestChats = () => {
    StorageService.resetGuestChatCount();
    setGuestChatCount(0);
  };

  // ── Chương trình học ─────────────────────────────────────────────────────

  const deleteChapter = (chapterId: string) => {
    StorageService.deleteChapter(chapterId);
    setCurriculum(StorageService.getCurriculum());
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    StorageService.deleteLesson(chapterId, lessonId);
    setCurriculum(StorageService.getCurriculum());
  };

  const addChapter = (title: string) => {
    const newChapter: Chapter = { id: `chuong-${Date.now()}`, title, lessons: [] };
    StorageService.addChapter(newChapter);
    setCurriculum(StorageService.getCurriculum());
  };

  const addLesson = (
    chapterId: string,
    title: string,
    summary: string,
    formulae: string[],
    commonQuestions: any[]
  ) => {
    const newLesson: Lesson = { id: `bai-${Date.now()}`, title, summary, formulae, commonQuestions };
    StorageService.addLesson(chapterId, newLesson);
    setCurriculum(StorageService.getCurriculum());
  };

  const updateChapter = (chapterId: string, title: string) => {
    StorageService.updateChapter(chapterId, title);
    setCurriculum(StorageService.getCurriculum());
  };

  const updateLesson = (chapterId: string, lessonId: string, updatedLesson: Partial<Lesson>) => {
    StorageService.updateLesson(chapterId, lessonId, updatedLesson);
    setCurriculum(StorageService.getCurriculum());
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

    // Kiểm tra email đã tồn tại ở localStorage
    const existing = StorageService.getUserByEmail(email);
    if (existing) return { success: false, message: `Email ${email} đã được đăng ký trong hệ thống!` };

    let assignedClassId: string | undefined;
    let assignedSchoolId: string | undefined;

    // Xử lý mã lớp nếu có
    if (inviteCode && inviteCode.trim()) {
      const schoolClass = StorageService.getClassByInviteCode(inviteCode.trim());
      if (!schoolClass) {
        return { success: false, message: `Mã lớp “${inviteCode.toUpperCase()}” không tồn tại. Vui lòng kiểm tra lại.` };
      }
      assignedClassId = schoolClass.id;
      assignedSchoolId = schoolClass.schoolId;
    }

    const isManaged = Boolean(assignedClassId);
    const identifier = email.toLowerCase().trim();
    const targetRole = isManaged ? 'student' : 'free_user';

    // 1. Đẩy tài khoản mới trực tiếp lên Firestore collection "users"
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

    // 2. Lưu vào StorageService để duy trì local state đồng bộ
    const ok = StorageService.addUser(newUser);
    if (!ok) return { success: false, message: 'Không thể lưu tài khoản vào bộ nhớ cục bộ.' };

    // Nếu có lớp, thêm học sinh vào danh sách lớp
    if (assignedClassId) {
      StorageService.addStudentToClass(assignedClassId, identifier);
    }

    setUsers(StorageService.getUsers());
    setClasses(StorageService.getClasses());
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
    while (StorageService.getClassByInviteCode(inviteCode) && attempts < 10) {
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

    const ok = StorageService.addClass(schoolClass);
    if (!ok) return { success: false, message: 'Không thể tạo lớp. Vui lòng thử lại.' };

    setClasses(StorageService.getClasses());
    return { success: true, message: `Đã tạo lớp “${className.trim()}” thành công.`, schoolClass };
  };

  // ── Học sinh đã đăng nhập tham gia lớp qua mã mời ────────────────────

  const joinClassByCode = async (code: string) => {
    if (!currentUser) return { success: false, message: 'Bạn cần đăng nhập trước khi tham gia lớp.' };
    if (!code.trim()) return { success: false, message: 'Vui lòng nhập mã lớp.' };

    // Kiểm tra đã có lớp rồi chưa
    if (currentUser.classId || currentUser.joinedClassId) {
      return { success: false, message: 'Bạn đã thuộc một lớp học. Liên hệ giáo viên nếu cần thay đổi.' };
    }

    const schoolClass = StorageService.getClassByInviteCode(code.trim());
    if (!schoolClass) {
      return { success: false, message: `Mã lớp “${code.toUpperCase()}” không tồn tại. Vui lòng kiểm tra lại.` };
    }

    // Cập nhật user: chuyển thành student thuộc lớp
    const identifier = currentUser.username || currentUser.email;
    StorageService.updateUser(currentUser.email, {
      role: 'student',
      classId: schoolClass.id,
      joinedClassId: schoolClass.id,
      schoolId: schoolClass.schoolId,
    });
    StorageService.addStudentToClass(schoolClass.id, identifier);

    const updatedUser = StorageService.getUserByEmail(currentUser.email)!;
    setUsers(StorageService.getUsers());
    setClasses(StorageService.getClasses());
    setCurrentUser(updatedUser);
    localStorage.setItem('h11_current_user_email', updatedUser.email);

    return { success: true, message: `Đã tham gia lớp “${schoolClass.name}” thành công!`, className: schoolClass.name };
  };

  // ── Giáo viên/Admin chấm lại điểm câu tự luận của học sinh ────────────

  const updateQuizEssayScore = async (quizId: string, questionId: string, newScore: number) => {
    const quiz = QuizStorage.getQuizById(quizId);
    if (!quiz || !quiz.results) return { success: false, message: 'Không tìm thấy bài kiểm tra.' };

    const result = quiz.results[questionId];
    if (!result) return { success: false, message: 'Không tìm thấy kết quả câu hỏi.' };

    // Cập nhật điểm và đánh giá
    result.score = newScore;
    result.correct = newScore >= result.maxScore * 0.7; // Đạt >= 70% điểm câu tự luận được tính là đúng
    result.confidence = 'high'; // Đánh dấu độ tin cậy cao sau khi có GV/Admin chấm lại
    
    // Thêm prefix nhận biết điểm đã được duyệt thủ công
    if (!result.feedback.includes('[Đã chấm lại]')) {
      result.feedback = `[Đã chấm lại bởi Giáo viên/Admin] ${result.feedback}`;
    }

    // Tính lại tổng điểm
    const totalScore = Object.values(quiz.results).reduce((sum, r) => sum + r.score, 0);
    quiz.score = Math.round(totalScore * 100) / 100;

    QuizStorage.updateQuiz(quizId, quiz);
    
    // Đồng bộ lại UI state bằng cách ép render lại các component lấy trực tiếp từ Storage
    setClasses([...StorageService.getClasses()]); 

    return { success: true, message: 'Đã cập nhật điểm thành công!' };
  };

  // ── Provider ──────────────────────────────────────────────────────────────

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
        createStudent,
        getMyClass,
        addMessage,
        toggleLessonCompletion,
        clearLessonHistory,
        getUserProgress,
        isLessonCompleted,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
