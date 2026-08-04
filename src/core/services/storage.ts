import { User, ChatMessage, LearningProgress, School, SchoolClass } from '../../features/auth/types';
import { Chapter, Lesson } from '../../features/lessons/types';
import { CHEMISTRY_11_CURRICULUM } from '../../features/lessons/constants';

// ─── localStorage Keys ────────────────────────────────────────────────────────

const USERS_KEY           = 'h11_tutor_users';
const CHATS_KEY           = 'h11_tutor_chats';
const PROGRESS_KEY        = 'h11_tutor_progress';
const GUEST_CHAT_COUNT_KEY= 'h11_tutor_guest_chat_count';
const CURRICULUM_KEY      = 'h11_tutor_curriculum';
const SCHOOLS_KEY         = 'h11_tutor_schools';
const CLASSES_KEY         = 'h11_tutor_classes';

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Tạo ID đơn giản từ email (hoặc timestamp nếu không có email).
 * Dùng để đảm bảo tính ổn định – cùng email → cùng ID sau nhiều lần migrate.
 */
function makeId(seed: string): string {
  // Simple deterministic id based on seed string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `uid_${Math.abs(hash).toString(36)}_${seed.replace(/[^a-z0-9]/gi, '').slice(0, 8)}`;
}

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

// ─── Migration ────────────────────────────────────────────────────────────────

/**
 * Nâng cấp một User record cũ (trước khi có schema v2) lên schema mới.
 * Hàm này KHÔNG thay đổi bất kỳ trường nào đã tồn tại.
 * An toàn để gọi nhiều lần (idempotent).
 */
function migrateUser(raw: any): User {
  const email: string = raw.email || '';
  const id: string = raw.id || `uid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    email,
    password: raw.password || '',
    name: raw.name || 'Người dùng',
    role: raw.role || 'student',
    status: raw.status || 'active',
    authProvider: raw.authProvider || 'local',
    canChangePassword: raw.canChangePassword ?? true,
    createdAt: raw.createdAt || new Date().toISOString(),
    ...raw,
  };
}

export const initializeMockData = () => {};

export const StorageService = {

  // ── Users ──────────────────────────────────────────────────────────────────

  /** Lấy toàn bộ người dùng, tự động migrate schema cũ → mới */
  getUsers(): User[] {
    const data = localStorage.getItem(USERS_KEY);
    let raw: any[] = data ? JSON.parse(data) : [];
    if (!Array.isArray(raw) || raw.length === 0) {
      raw = [
        {
          id: 'uid_admin_1',
          email: 'admin@system.local',
          username: 'admin',
          password: 'adminpassword',
          name: 'Quản trị viên Hệ thống',
          role: 'system_admin',
          status: 'active',
          authProvider: 'local',
          canChangePassword: true,
          createdAt: new Date().toISOString(),
        }
      ];
    }
    // Migrate mỗi record lên schema v2 (idempotent)
    const migrated = raw.map(migrateUser);
    // Lưu lại sau migrate để lần sau không cần migrate nữa
    localStorage.setItem(USERS_KEY, JSON.stringify(migrated));
    return migrated;
  },

  /** Lưu danh sách người dùng */
  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  /** Tìm người dùng theo email */
  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  /** Tìm người dùng theo username nội bộ */
  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find(u => u.username?.toLowerCase() === username.toLowerCase());
  },

  /**
   * Tìm người dùng bằng email HOẶC username.
   * Dùng cho form đăng nhập (học sinh có thể không có email thật).
   */
  getUserByIdentifier(identifier: string): User | undefined {
    const lower = identifier.toLowerCase();
    return this.getUsers().find(
      u => u.email.toLowerCase() === lower || u.username?.toLowerCase() === lower
    );
  },

  /** Tìm người dùng theo Google ID (sub) */
  getUserByGoogleId(googleId: string): User | undefined {
    return this.getUsers().find(u => u.googleId === googleId);
  },

  /** Thêm người dùng mới – trả về false nếu email/username đã tồn tại */
  addUser(user: User): boolean {
    const users = this.getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (emailExists) return false;

    if (user.username) {
      const usernameExists = users.some(
        u => u.username?.toLowerCase() === user.username!.toLowerCase()
      );
      if (usernameExists) return false;
    }

    users.push(user);
    this.saveUsers(users);
    return true;
  },

  /** Cập nhật toàn bộ thông tin của một user theo email */
  updateUser(email: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return false;
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return true;
  },

  /** Cập nhật toàn bộ thông tin của một user theo id */
  updateUserById(id: string, updates: Partial<User>): boolean {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return false;
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return true;
  },

  /** Xoá người dùng theo id */
  deleteUserById(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    this.saveUsers(filtered);
    return true;
  },

  /** Cập nhật trạng thái tài khoản (Admin duyệt/từ chối) */
  updateUserStatus(email: string, status: 'active' | 'rejected'): boolean {
    return this.updateUser(email, { status });
  },

  // ── Chats ──────────────────────────────────────────────────────────────────

  /** Lấy toàn bộ tin nhắn chat */
  getChats(): ChatMessage[] {
    initializeMockData();
    const data = localStorage.getItem(CHATS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** Lưu toàn bộ tin nhắn */
  saveChats(chats: ChatMessage[]): void {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  },

  /** Lấy tin nhắn theo học sinh và bài học */
  getLessonChats(userEmail: string, lessonId: string): ChatMessage[] {
    return this.getChats().filter(c => c.userEmail === userEmail && c.lessonId === lessonId);
  },

  /** Thêm tin nhắn mới */
  addChatMessage(chat: ChatMessage): void {
    const chats = this.getChats();
    chats.push(chat);
    this.saveChats(chats);
  },

  /** Xóa lịch sử chat của một học sinh tại một bài học */
  clearLessonChats(userEmail: string, lessonId: string): void {
    const chats = this.getChats();
    const filtered = chats.filter(c => !(c.userEmail === userEmail && c.lessonId === lessonId));
    this.saveChats(filtered);
  },

  // ── Progress ───────────────────────────────────────────────────────────────

  /** Lấy toàn bộ tiến độ học tập */
  getProgress(): LearningProgress[] {
    initializeMockData();
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** Lưu tiến độ học tập */
  saveProgress(progress: LearningProgress[]): void {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  },

  /** Lấy tiến độ của học sinh cụ thể */
  getUserProgress(email: string): LearningProgress {
    const progressList = this.getProgress();
    let userProgress = progressList.find(p => p.userEmail === email);
    if (!userProgress) {
      userProgress = { userEmail: email, completedLessons: [] };
      progressList.push(userProgress);
      this.saveProgress(progressList);
    }
    return userProgress;
  },

  /** Đánh dấu hoàn thành/chưa hoàn thành một bài học */
  toggleLessonCompletion(email: string, lessonId: string): LearningProgress {
    const progressList = this.getProgress();
    let userProgress = progressList.find(p => p.userEmail === email);
    if (!userProgress) {
      userProgress = { userEmail: email, completedLessons: [] };
      progressList.push(userProgress);
    }

    if (userProgress.completedLessons.includes(lessonId)) {
      userProgress.completedLessons = userProgress.completedLessons.filter(id => id !== lessonId);
    } else {
      userProgress.completedLessons.push(lessonId);
    }

    const index = progressList.findIndex(p => p.userEmail === email);
    if (index !== -1) progressList[index] = userProgress;

    this.saveProgress(progressList);
    return userProgress;
  },

  // ── Guest Chat Count ───────────────────────────────────────────────────────

  getGuestChatCount(): number {
    const count = localStorage.getItem(GUEST_CHAT_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  },

  incrementGuestChatCount(): number {
    const current = this.getGuestChatCount();
    const next = current + 1;
    localStorage.setItem(GUEST_CHAT_COUNT_KEY, next.toString());
    return next;
  },

  resetGuestChatCount(): void {
    localStorage.setItem(GUEST_CHAT_COUNT_KEY, '0');
  },

  // ── Curriculum ─────────────────────────────────────────────────────────────

  /** Lấy danh mục chương trình, merge textbook từ constants */
  getCurriculum(): Chapter[] {
    const data = localStorage.getItem(CURRICULUM_KEY);
    const stored: Chapter[] = data ? JSON.parse(data) : CHEMISTRY_11_CURRICULUM;

    return stored.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => {
        const constChapter = CHEMISTRY_11_CURRICULUM.find((c) => c.id === chapter.id);
        const constLesson = constChapter?.lessons.find((l) => l.id === lesson.id);
        return {
          ...lesson,
          textbook: constLesson?.textbook,
        };
      }),
    }));
  },

  saveCurriculum(curriculum: Chapter[]): void {
    localStorage.setItem(CURRICULUM_KEY, JSON.stringify(curriculum));
  },

  deleteChapter(chapterId: string): void {
    const curr = this.getCurriculum();
    this.saveCurriculum(curr.filter(c => c.id !== chapterId));
  },

  addChapter(chapter: Chapter): void {
    const curr = this.getCurriculum();
    curr.push(chapter);
    this.saveCurriculum(curr);
  },

  updateChapter(chapterId: string, updatedTitle: string): void {
    const curr = this.getCurriculum();
    const index = curr.findIndex(c => c.id === chapterId);
    if (index !== -1) {
      curr[index].title = updatedTitle;
      this.saveCurriculum(curr);
    }
  },

  deleteLesson(chapterId: string, lessonId: string): void {
    const curr = this.getCurriculum();
    const chIndex = curr.findIndex(c => c.id === chapterId);
    if (chIndex !== -1) {
      curr[chIndex].lessons = curr[chIndex].lessons.filter(l => l.id !== lessonId);
      this.saveCurriculum(curr);
    }
  },

  addLesson(chapterId: string, lesson: Lesson): void {
    const curr = this.getCurriculum();
    const chIndex = curr.findIndex(c => c.id === chapterId);
    if (chIndex !== -1) {
      curr[chIndex].lessons.push(lesson);
      this.saveCurriculum(curr);
    }
  },

  updateLesson(chapterId: string, lessonId: string, updatedLesson: Partial<Lesson>): void {
    const curr = this.getCurriculum();
    const chIndex = curr.findIndex(c => c.id === chapterId);
    if (chIndex !== -1) {
      const lesIndex = curr[chIndex].lessons.findIndex(l => l.id === lessonId);
      if (lesIndex !== -1) {
        curr[chIndex].lessons[lesIndex] = {
          ...curr[chIndex].lessons[lesIndex],
          ...updatedLesson
        };
        this.saveCurriculum(curr);
      }
    }
  },

  // ── Schools ────────────────────────────────────────────────────────────────

  /** Lấy toàn bộ danh sách trường học */
  getSchools(): School[] {
    initializeMockData();
    const data = localStorage.getItem(SCHOOLS_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** Lưu danh sách trường học */
  saveSchools(schools: School[]): void {
    localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
  },

  /** Tìm trường theo ID */
  getSchoolById(schoolId: string): School | undefined {
    return this.getSchools().find(s => s.id === schoolId);
  },

  /** Thêm trường mới */
  addSchool(school: School): boolean {
    const schools = this.getSchools();
    if (schools.some(s => s.id === school.id)) return false;
    schools.push(school);
    this.saveSchools(schools);
    return true;
  },

  /** Cập nhật thông tin trường */
  updateSchool(schoolId: string, updates: Partial<School>): boolean {
    const schools = this.getSchools();
    const index = schools.findIndex(s => s.id === schoolId);
    if (index === -1) return false;
    schools[index] = { ...schools[index], ...updates };
    this.saveSchools(schools);
    return true;
  },

  /** Xóa trường */
  deleteSchool(schoolId: string): void {
    this.saveSchools(this.getSchools().filter(s => s.id !== schoolId));
  },

  // ── Classes ────────────────────────────────────────────────────────────────

  /** Lấy toàn bộ danh sách lớp học */
  getClasses(): SchoolClass[] {
    initializeMockData();
    const data = localStorage.getItem(CLASSES_KEY);
    return data ? JSON.parse(data) : [];
  },

  /** Lưu danh sách lớp học */
  saveClasses(classes: SchoolClass[]): void {
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
  },

  /** Lấy lớp theo ID */
  getClassById(classId: string): SchoolClass | undefined {
    return this.getClasses().find(c => c.id === classId);
  },

  /** Lấy tất cả lớp của một trường */
  getClassesBySchool(schoolId: string): SchoolClass[] {
    return this.getClasses().filter(c => c.schoolId === schoolId);
  },

  /** Lấy lớp mà giáo viên đang quản lý */
  getClassByTeacher(teacherEmail: string): SchoolClass | undefined {
    return this.getClasses().find(
      c => c.teacherEmail.toLowerCase() === teacherEmail.toLowerCase()
    );
  },

  /** Thêm lớp mới */
  addClass(schoolClass: SchoolClass): boolean {
    const classes = this.getClasses();
    if (classes.some(c => c.id === schoolClass.id)) return false;
    classes.push(schoolClass);
    this.saveClasses(classes);
    return true;
  },

  /** Tìm lớp theo mã mời (inviteCode) — KHÔNG phân biệt hoa/thường */
  getClassByInviteCode(code: string): SchoolClass | undefined {
    return this.getClasses().find(
      c => c.inviteCode?.toUpperCase() === code.toUpperCase()
    );
  },

  /** Cập nhật thông tin lớp */
  updateClass(classId: string, updates: Partial<SchoolClass>): boolean {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return false;
    classes[index] = { ...classes[index], ...updates };
    this.saveClasses(classes);
    return true;
  },

  /** Xóa lớp */
  deleteClass(classId: string): void {
    this.saveClasses(this.getClasses().filter(c => c.id !== classId));
  },

  /**
   * Thêm học sinh vào lớp (dùng email hoặc username làm identifier).
   * Trả về false nếu học sinh đã có trong lớp.
   */
  addStudentToClass(classId: string, studentIdentifier: string): boolean {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return false;

    const lower = studentIdentifier.toLowerCase();
    if (classes[index].studentIdentifiers.some(id => id.toLowerCase() === lower)) {
      return false; // Đã có trong lớp
    }

    classes[index].studentIdentifiers.push(studentIdentifier);
    this.saveClasses(classes);
    return true;
  },

  /** Xóa học sinh khỏi lớp */
  removeStudentFromClass(classId: string, studentIdentifier: string): void {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === classId);
    if (index === -1) return;
    const lower = studentIdentifier.toLowerCase();
    classes[index].studentIdentifiers = classes[index].studentIdentifiers.filter(
      id => id.toLowerCase() !== lower
    );
    this.saveClasses(classes);
  },
};

