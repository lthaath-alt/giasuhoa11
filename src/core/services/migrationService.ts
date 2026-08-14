/**
 * migrationService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Hàm di chuyển dữ liệu cũ từ localStorage lên Firestore (chạy MỘT LẦN).
 *
 * Cơ chế:
 *  - Kiểm tra flag "h11_migrated_v2" trong localStorage.
 *  - Nếu chưa có: đọc từng key localStorage cũ → đẩy lên Firestore nếu Firestore
 *    chưa có document đó → đánh dấu xong.
 *  - KHÔNG xoá localStorage cũ (để đối chiếu).
 *  - An toàn khi chạy nhiều lần (idempotent) vì chỉ addDoc khi chưa tồn tại.
 */

import { collection, doc, getDoc, setDoc, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, School, SchoolClass, LearningProgress, ChatMessage } from '../../features/auth/types';
import { LibraryExam, Equation, MatrixResource, Question } from '../../features/library/types';

// ─── localStorage keys cũ (giống storage.ts cũ) ──────────────────────────────
const LS = {
  USERS:     'h11_tutor_users',
  CHATS:     'h11_tutor_chats',
  PROGRESS:  'h11_tutor_progress',
  SCHOOLS:   'h11_tutor_schools',
  CLASSES:   'h11_tutor_classes',
  EXAMS:     'h11_tutor_exams',
  EQUATIONS: 'h11_tutor_equations',
  MATRIX:    'h11_tutor_matrix',
  QUESTIONS: 'h11_tutor_questions',
};

const MIGRATION_FLAG = 'h11_migrated_v2';

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;
}

/**
 * Chạy migration một lần.
 * Gọi hàm này ở đầu AppProvider, trước khi load data từ Firestore.
 */
export async function runMigrationIfNeeded(): Promise<void> {
  const alreadyMigrated = localStorage.getItem(MIGRATION_FLAG);
  if (alreadyMigrated === 'true') return;

  console.log('[Migration] Bắt đầu di chuyển dữ liệu từ localStorage → Firestore...');

  const results = {
    users: 0, schools: 0, classes: 0, questions: 0,
    exams: 0, equations: 0, matrix: 0, progress: 0, chats: 0,
  };

  try {

    // ── 1. Users ──────────────────────────────────────────────────────────────
    const lsUsers = readLS<User>(LS.USERS);
    for (const user of lsUsers) {
      if (!user.id) continue;
      const docRef = doc(db, 'users', user.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore({
          ...user,
          // Chuẩn hoá tên field để khớp với schema Firestore hiện tại
          fullName: user.name,
          name: user.name,
          email: user.email || user.username || '',
        }));
        results.users++;
      }
    }

    // ── 2. Schools ─────────────────────────────────────────────────────────────
    const lsSchools = readLS<School>(LS.SCHOOLS);
    for (const school of lsSchools) {
      if (!school.id) continue;
      const docRef = doc(db, 'schools', school.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(school));
        results.schools++;
      }
    }

    // ── 3. Classes ─────────────────────────────────────────────────────────────
    const lsClasses = readLS<SchoolClass>(LS.CLASSES);
    for (const cls of lsClasses) {
      if (!cls.id) continue;
      const docRef = doc(db, 'classes', cls.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(cls));
        results.classes++;
      }
    }

    // ── 4. Questions ───────────────────────────────────────────────────────────
    const lsQuestions = readLS<Question>(LS.QUESTIONS);
    for (const q of lsQuestions) {
      if (!q.id) continue;
      const docRef = doc(db, 'questions', q.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        try {
          await setDoc(docRef, cleanForFirestore(q as unknown as Record<string, any>));
          results.questions++;
        } catch (err: any) {
          // Có thể bị lỗi "document too large" nếu base64 quá lớn → bỏ qua câu đó
          console.warn(`[Migration] Bỏ qua question ${q.id} (có thể quá lớn):`, err?.message);
        }
      }
    }

    // ── 5. Exams ───────────────────────────────────────────────────────────────
    const lsExams = readLS<LibraryExam>(LS.EXAMS);
    for (const exam of lsExams) {
      if (!exam.id) continue;
      const docRef = doc(db, 'exams', exam.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(exam as unknown as Record<string, any>));
        results.exams++;
      }
    }

    // ── 6. Equations ───────────────────────────────────────────────────────────
    const lsEquations = readLS<Equation>(LS.EQUATIONS);
    for (const eq of lsEquations) {
      if (!eq.id) continue;
      const docRef = doc(db, 'equations', eq.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(eq as unknown as Record<string, any>));
        results.equations++;
      }
    }

    // ── 7. Matrix Resources ────────────────────────────────────────────────────
    const lsMatrix = readLS<MatrixResource>(LS.MATRIX);
    for (const res of lsMatrix) {
      if (!res.id) continue;
      const docRef = doc(db, 'matrix_resources', res.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(res as unknown as Record<string, any>));
        results.matrix++;
      }
    }

    // ── 8. Progress ────────────────────────────────────────────────────────────
    const lsProgress = readLS<LearningProgress>(LS.PROGRESS);
    for (const p of lsProgress) {
      if (!p.userEmail) continue;
      const docRef = doc(db, 'progress', p.userEmail.toLowerCase());
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, p);
        results.progress++;
      }
    }

    // ── 9. Chats ───────────────────────────────────────────────────────────────
    // Chỉ migrate chat của user đăng nhập (bỏ qua guest)
    const lsChats = readLS<ChatMessage>(LS.CHATS);
    for (const chat of lsChats) {
      if (!chat.id || chat.userEmail === 'guest') continue;
      const docRef = doc(db, 'chats', chat.id);
      const existing = await getDoc(docRef);
      if (!existing.exists()) {
        await setDoc(docRef, cleanForFirestore(chat));
        results.chats++;
      }
    }

    // ── Đánh dấu đã migrate ────────────────────────────────────────────────────
    localStorage.setItem(MIGRATION_FLAG, 'true');

    console.log('[Migration] ✅ Hoàn tất!', results);

  } catch (err) {
    console.error('[Migration] ❌ Lỗi khi migration:', err);
    // Không đánh dấu đã migrate → lần sau sẽ thử lại
  }
}
