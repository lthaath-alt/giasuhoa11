/**
 * firestoreService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service CRUD Firestore thay thế StorageService cho tất cả collection.
 *
 * Chiến lược:
 *  - Mỗi hàm là async, trả về Promise.
 *  - AppContext gọi một lần khi mount (load-once), sau đó giữ trong state.
 *  - Mutation: cập nhật state ngay (optimistic), ghi Firestore ở background.
 *  - Các hàm localStorage-only (guest count, session) vẫn ở storage.ts.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './firebase';
import { ErrorLogService } from './errorLog';
import { User, ChatMessage, LearningProgress, School, SchoolClass } from '../../features/auth/types';
import { Chapter } from '../../features/lessons/types';
import { LibraryExam, Equation, MatrixResource, Question } from '../../features/library/types';

// ─── Collection names ─────────────────────────────────────────────────────────

const COL_USERS        = 'users';
const COL_SCHOOLS      = 'schools';
const COL_CLASSES      = 'classes';
const COL_QUESTIONS    = 'questions';
const COL_EXAMS        = 'exams';
const COL_EQUATIONS    = 'equations';
const COL_MATRIX       = 'matrix_resources';
const COL_PROGRESS     = 'progress';
const COL_CHATS        = 'chats';
const COL_CURRICULUM   = 'curriculum_chapters';
const COL_SETTINGS     = 'system_settings';
const COL_QUAN_TRI     = 'quan_tri';

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Xoá các trường undefined khỏi object trước khi ghi Firestore.
 * Firestore không chấp nhận giá trị undefined.
 */
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

/** Bọc lỗi chung cho mọi hàm Firestore */
function handleError(component: string, error: any): void {
  console.error(`[FirestoreService.${component}]`, error);
  ErrorLogService.logError({
    level: 'Lỗi Cơ Sở Dữ Liệu',
    component: `FirestoreService.${component}`,
    message: error?.message || String(error),
  });
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export const FirestoreService = {

  // ── Users ──────────────────────────────────────────────────────────────────

  /**
   * Lấy toàn bộ người dùng từ Firestore collection "users".
   * Bao gồm cả user được tạo qua firestoreAuth.
   */
  async getUsers(): Promise<User[]> {
    try {
      const snap = await getDocs(collection(db, COL_USERS));
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email || data.username || '',
          username: data.username,
          name: data.name || data.fullName || '',
          role: data.role || 'student',
          status: data.status || 'active',
          authProvider: data.authProvider || 'local',
          schoolId: data.schoolId,
          classId: data.classId,
          joinedClassId: data.joinedClassId,
          googleId: data.googleId,
          canChangePassword: data.canChangePassword ?? true,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString(),
        } as User;
      });
    } catch (err) {
      handleError('getUsers', err);
      return [];
    }
  },

  /** Tìm user theo email hoặc username */
  async getUserByIdentifier(identifier: string): Promise<User | undefined> {
    try {
      const lower = identifier.toLowerCase();
      const colRef = collection(db, COL_USERS);
      let snap = await getDocs(query(colRef, where('username', '==', lower)));
      if (snap.empty) {
        snap = await getDocs(query(colRef, where('email', '==', lower)));
      }
      if (snap.empty) return undefined;
      const d = snap.docs[0];
      const data = d.data();
      return {
        id: d.id,
        email: data.email || data.username || '',
        username: data.username,
        name: data.name || data.fullName || '',
        role: data.role || 'student',
        status: data.status || 'active',
        authProvider: data.authProvider || 'local',
        schoolId: data.schoolId,
        classId: data.classId,
        joinedClassId: data.joinedClassId,
        canChangePassword: data.canChangePassword ?? true,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
      } as User;
    } catch (err) {
      handleError('getUserByIdentifier', err);
      return undefined;
    }
  },

  /**
   * Thêm user mới vào Firestore.
   * Dùng user.id làm document ID để đồng bộ với firestoreAuth.
   * Trả về false nếu đã tồn tại.
   */
  async addUser(user: User): Promise<boolean> {
    try {
      const docRef = doc(db, COL_USERS, user.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore({
        ...user,
        createdAt: user.createdAt || new Date().toISOString(),
      }));
      return true;
    } catch (err) {
      handleError('addUser', err);
      return false;
    }
  },

  /** Cập nhật user theo ID */
  async updateUserById(id: string, updates: Partial<User>): Promise<boolean> {
    try {
      const docRef = doc(db, COL_USERS, id);
      await updateDoc(docRef, cleanForFirestore(updates as Record<string, any>));
      return true;
    } catch (err) {
      handleError('updateUserById', err);
      return false;
    }
  },

  /**
   * Xoá nguyện vọng vào lớp, sau khi giáo viên duyệt hoặc từ chối.
   *
   * Phải dùng `deleteField()` chứ không gán `undefined`: `cleanForFirestore`
   * lọc bỏ `undefined` trước khi gửi, nên gán như vậy là KHÔNG ghi gì cả và
   * đơn cũ nằm lại mãi trong danh sách chờ.
   */
  async clearPendingClassCode(userId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_USERS, userId), { pendingClassCode: deleteField() });
      return true;
    } catch (err) {
      handleError('clearPendingClassCode', err);
      return false;
    }
  },

  /**
   * Xoá đơn xin làm giáo viên, sau khi được duyệt hoặc từ chối.
   *
   * Cùng lý do với `clearPendingClassCode`: `updateUserById` nhận
   * `Partial<User>` nên không nhận được `deleteField()` (không ép kiểu nói
   * dối), và `cleanForFirestore` chỉ lọc `undefined` chứ không xoá trường
   * trên Firestore — gán `undefined` là KHÔNG ghi gì cả, đơn cũ nằm lại mãi.
   */
  async clearPendingRole(userId: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_USERS, userId), { pendingRole: deleteField() });
      return true;
    } catch (err) {
      handleError('clearPendingRole', err);
      return false;
    }
  },

  /* Danh sách đồng quản trị. Một tài liệu duy nhất `quan_tri/dong_quan_tri`.
     Luật chỉ cho chủ dự án và chính đồng quản trị ĐỌC, nên người thường gọi
     hàm này sẽ nhận `permission-denied` — đó là đường chạy BÌNH THƯỜNG, trả
     mảng rỗng chứ đừng báo lỗi ra màn hình. */
  async docDongQuanTri(): Promise<string[]> {
    try {
      const s = await getDoc(doc(db, COL_QUAN_TRI, 'dong_quan_tri'));
      if (!s.exists()) return [];
      const ds = (s.data() as { emails?: unknown }).emails;
      return Array.isArray(ds) ? ds.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  },

  /** Ghi đè cả danh sách. Luật chỉ cho chủ dự án ghi. */
  async ghiDongQuanTri(emails: string[]): Promise<boolean> {
    try {
      await setDoc(doc(db, COL_QUAN_TRI, 'dong_quan_tri'), { emails });
      return true;
    } catch (err) {
      handleError('ghiDongQuanTri', err);
      return false;
    }
  },

  /** Cập nhật user theo email (tìm document trước) */
  async updateUserByEmail(email: string, updates: Partial<User>): Promise<boolean> {
    try {
      const lower = email.toLowerCase();
      const snap = await getDocs(query(collection(db, COL_USERS), where('email', '==', lower)));
      if (snap.empty) return false;
      await updateDoc(snap.docs[0].ref, cleanForFirestore(updates as Record<string, any>));
      return true;
    } catch (err) {
      handleError('updateUserByEmail', err);
      return false;
    }
  },

  /** Xoá user theo ID */
  async deleteUserById(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COL_USERS, id));
      return true;
    } catch (err) {
      handleError('deleteUserById', err);
      return false;
    }
  },

  // ── Schools ────────────────────────────────────────────────────────────────

  async getSchools(): Promise<School[]> {
    try {
      const snap = await getDocs(collection(db, COL_SCHOOLS));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as School));
    } catch (err) {
      handleError('getSchools', err);
      return [];
    }
  },

  /** Thêm trường. Dùng school.id làm document ID. Trả về false nếu đã tồn tại. */
  async addSchool(school: School): Promise<boolean> {
    try {
      const docRef = doc(db, COL_SCHOOLS, school.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore(school));
      return true;
    } catch (err) {
      handleError('addSchool', err);
      return false;
    }
  },

  async updateSchool(schoolId: string, updates: Partial<School>): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_SCHOOLS, schoolId), cleanForFirestore(updates as Record<string, any>));
      return true;
    } catch (err) {
      handleError('updateSchool', err);
      return false;
    }
  },

  async deleteSchool(schoolId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_SCHOOLS, schoolId));
    } catch (err) {
      handleError('deleteSchool', err);
    }
  },

  // ── Classes ────────────────────────────────────────────────────────────────

  async getClasses(): Promise<SchoolClass[]> {
    try {
      const snap = await getDocs(collection(db, COL_CLASSES));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolClass));
    } catch (err) {
      handleError('getClasses', err);
      return [];
    }
  },

  async addClass(schoolClass: SchoolClass): Promise<boolean> {
    try {
      const docRef = doc(db, COL_CLASSES, schoolClass.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore(schoolClass));
      return true;
    } catch (err) {
      handleError('addClass', err);
      return false;
    }
  },

  async updateClass(classId: string, updates: Partial<SchoolClass>): Promise<boolean> {
    try {
      await updateDoc(doc(db, COL_CLASSES, classId), cleanForFirestore(updates as Record<string, any>));
      return true;
    } catch (err) {
      handleError('updateClass', err);
      return false;
    }
  },

  async deleteClass(classId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_CLASSES, classId));
    } catch (err) {
      handleError('deleteClass', err);
    }
  },

  /**
   * Thêm học sinh vào studentIdentifiers của lớp.
   * Đọc document hiện tại → push → ghi lại (không dùng arrayUnion để tránh race condition đơn giản).
   */
  async addStudentToClass(classId: string, studentIdentifier: string): Promise<boolean> {
    try {
      const docRef = doc(db, COL_CLASSES, classId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return false;
      const cls = snap.data() as SchoolClass;
      const lower = studentIdentifier.toLowerCase();
      if ((cls.studentIdentifiers || []).some((id: string) => id.toLowerCase() === lower)) {
        return false; // Đã có
      }
      const updated = [...(cls.studentIdentifiers || []), studentIdentifier];
      await updateDoc(docRef, { studentIdentifiers: updated });
      return true;
    } catch (err) {
      handleError('addStudentToClass', err);
      return false;
    }
  },

  async removeStudentFromClass(classId: string, studentIdentifier: string): Promise<void> {
    try {
      const docRef = doc(db, COL_CLASSES, classId);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return;
      const cls = snap.data() as SchoolClass;
      const lower = studentIdentifier.toLowerCase();
      const updated = (cls.studentIdentifiers || []).filter(
        (id: string) => id.toLowerCase() !== lower
      );
      await updateDoc(docRef, { studentIdentifiers: updated });
    } catch (err) {
      handleError('removeStudentFromClass', err);
    }
  },

  // ── Questions ──────────────────────────────────────────────────────────────

  async getQuestions(): Promise<Question[]> {
    try {
      const snap = await getDocs(collection(db, COL_QUESTIONS));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
    } catch (err) {
      handleError('getQuestions', err);
      return [];
    }
  },

  async addQuestion(question: Question): Promise<boolean> {
    try {
      const docRef = doc(db, COL_QUESTIONS, question.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      // Lưu ý: nếu câu hỏi có images base64 lớn, có thể vượt 1MB limit của Firestore
      // Trong scope này giữ nguyên, nếu cần sẽ upload lên Firebase Storage riêng
      await setDoc(docRef, cleanForFirestore(question as unknown as Record<string, any>));
      return true;
    } catch (err) {
      handleError('addQuestion', err);
      return false;
    }
  },

  async deleteQuestion(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_QUESTIONS, id));
    } catch (err) {
      handleError('deleteQuestion', err);
    }
  },

  /**
   * Lưu toàn bộ danh sách câu hỏi (batch write).
   * Dùng khi import từ file Word.
   */
  async saveQuestions(questions: Question[]): Promise<void> {
    try {
      // Ghi theo batch (max 500 ops/batch)
      const BATCH_SIZE = 400;
      for (let i = 0; i < questions.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = questions.slice(i, i + BATCH_SIZE);
        for (const q of chunk) {
          const docRef = doc(db, COL_QUESTIONS, q.id);
          batch.set(docRef, cleanForFirestore(q as unknown as Record<string, any>));
        }
        await batch.commit();
      }
    } catch (err) {
      handleError('saveQuestions', err);
    }
  },

  // ── Exams ──────────────────────────────────────────────────────────────────

  async getExams(): Promise<LibraryExam[]> {
    try {
      const snap = await getDocs(collection(db, COL_EXAMS));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as LibraryExam));
    } catch (err) {
      handleError('getExams', err);
      return [];
    }
  },

  async addExam(exam: LibraryExam): Promise<boolean> {
    try {
      const docRef = doc(db, COL_EXAMS, exam.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore(exam as unknown as Record<string, any>));
      return true;
    } catch (err) {
      handleError('addExam', err);
      return false;
    }
  },

  async deleteExam(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_EXAMS, id));
    } catch (err) {
      handleError('deleteExam', err);
    }
  },

  // ── Equations ──────────────────────────────────────────────────────────────

  async getEquations(): Promise<Equation[]> {
    try {
      const snap = await getDocs(collection(db, COL_EQUATIONS));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Equation));
    } catch (err) {
      handleError('getEquations', err);
      return [];
    }
  },

  async addEquation(eq: Equation): Promise<boolean> {
    try {
      const docRef = doc(db, COL_EQUATIONS, eq.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore(eq as unknown as Record<string, any>));
      return true;
    } catch (err) {
      handleError('addEquation', err);
      return false;
    }
  },

  async deleteEquation(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_EQUATIONS, id));
    } catch (err) {
      handleError('deleteEquation', err);
    }
  },

  // ── Matrix Resources ────────────────────────────────────────────────────────

  async getMatrixResources(): Promise<MatrixResource[]> {
    try {
      const snap = await getDocs(collection(db, COL_MATRIX));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as MatrixResource));
    } catch (err) {
      handleError('getMatrixResources', err);
      return [];
    }
  },

  async addMatrixResource(res: MatrixResource): Promise<boolean> {
    try {
      const docRef = doc(db, COL_MATRIX, res.id);
      const existing = await getDoc(docRef);
      if (existing.exists()) return false;
      await setDoc(docRef, cleanForFirestore(res as unknown as Record<string, any>));
      return true;
    } catch (err) {
      handleError('addMatrixResource', err);
      return false;
    }
  },

  async deleteMatrixResource(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_MATRIX, id));
    } catch (err) {
      handleError('deleteMatrixResource', err);
    }
  },

  // ── Progress ───────────────────────────────────────────────────────────────

  /**
   * Lấy tiến độ học tập của user.
   * Document ID = email của user.
   * Trả về object mặc định nếu chưa có.
   */
  async getUserProgress(email: string): Promise<LearningProgress> {
    try {
      const docRef = doc(db, COL_PROGRESS, email.toLowerCase());
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        return { userEmail: email, completedLessons: [] };
      }
      return snap.data() as LearningProgress;
    } catch (err) {
      handleError('getUserProgress', err);
      return { userEmail: email, completedLessons: [] };
    }
  },

  /** Lưu/ghi đè toàn bộ tiến độ của user */
  async saveUserProgress(progress: LearningProgress): Promise<void> {
    try {
      const docRef = doc(db, COL_PROGRESS, progress.userEmail.toLowerCase());
      await setDoc(docRef, progress);
    } catch (err) {
      handleError('saveUserProgress', err);
    }
  },

  // ── Chats ──────────────────────────────────────────────────────────────────

  /**
   * Lấy tin nhắn của user cho một bài học cụ thể.
   * Mỗi tin nhắn là một document; query theo (userEmail, lessonId).
   */
  async getChatsByUserLesson(userEmail: string, lessonId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, COL_CHATS),
        where('userEmail', '==', userEmail),
        where('lessonId', '==', lessonId),
        orderBy('timestamp', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    } catch (err) {
      handleError('getChatsByUserLesson', err);
      return [];
    }
  },

  /** Thêm một tin nhắn mới vào Firestore */
  async addChatMessage(chat: ChatMessage): Promise<void> {
    try {
      // Dùng chat.id làm document ID để idempotent
      await setDoc(doc(db, COL_CHATS, chat.id), cleanForFirestore(chat));
    } catch (err) {
      handleError('addChatMessage', err);
    }
  },

  /** Xoá toàn bộ chat của user tại một bài học */
  async clearLessonChats(userEmail: string, lessonId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COL_CHATS),
        where('userEmail', '==', userEmail),
        where('lessonId', '==', lessonId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      handleError('clearLessonChats', err);
    }
  },

  // ── Curriculum ─────────────────────────────────────────────────────────────
  // Chỉ lưu "overrides" (tuỳ chỉnh admin) của từng Chapter.
  // Dữ liệu cơ bản vẫn đến từ CHEMISTRY_11_CURRICULUM constants.

  async getCurriculumOverrides(): Promise<Chapter[]> {
    try {
      const snap = await getDocs(collection(db, COL_CURRICULUM));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Chapter));
    } catch (err) {
      handleError('getCurriculumOverrides', err);
      return [];
    }
  },

  async saveCurriculumChapter(chapter: Chapter): Promise<void> {
    try {
      await setDoc(
        doc(db, COL_CURRICULUM, chapter.id),
        cleanForFirestore(chapter as unknown as Record<string, any>)
      );
    } catch (err) {
      handleError('saveCurriculumChapter', err);
    }
  },

  async deleteCurriculumChapter(chapterId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COL_CURRICULUM, chapterId));
    } catch (err) {
      handleError('deleteCurriculumChapter', err);
    }
  },

  // ─── System Settings ──────────────────────────────────────────────────────────

  async getSystemSettings(): Promise<{ allowUserApiKey?: boolean }> {
    try {
      const docRef = doc(db, COL_SETTINGS, 'global');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as { allowUserApiKey?: boolean };
      }
      return { allowUserApiKey: true };
    } catch (e) {
      handleError('getSystemSettings', e);
      return { allowUserApiKey: true };
    }
  },

  async updateSystemSettings(settings: { allowUserApiKey?: boolean }): Promise<boolean> {
    try {
      const docRef = doc(db, COL_SETTINGS, 'global');
      await setDoc(docRef, cleanForFirestore(settings), { merge: true });
      return true;
    } catch (e) {
      handleError('updateSystemSettings', e);
      return false;
    }
  }
};

export default FirestoreService;
