/**
 * Bài kiểm tra ĐÃ NỘP trên Firestore — collection `bai_nop/{quizId}`.
 *
 * Vì sao có tệp này (18/09/2026): `QuizStorage` ghi mọi bài vào localStorage
 * của máy đang dùng. Trang giáo viên đọc localStorage của máy GIÁO VIÊN, nên
 * học sinh làm bài ở nhà thì giáo viên thấy trống trơn, và điểm tự luận giáo
 * viên chấm lại chỉ nằm trên máy giáo viên.
 *
 * localStorage VẪN là kho làm việc của học sinh (đề đang làm, chống trùng đề —
 * cần chạy đồng bộ). Ở đây chỉ thêm một bản sao của mỗi bài đã nộp.
 * Luật: `firestore.rules`, khối `match /bai_nop/{id}`.
 */
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../core/services/firebase';
import { chuanBiBaiNop } from './baiNopChuan';
import { QuizStorage } from './quizStorage';
import type { Quiz } from './types';

export const COL_BAI_NOP = 'bai_nop';

/** id các bài MÁY NÀY đã đẩy lên xong, để lần đăng nhập sau khỏi đẩy lại. */
const KHOA_DA_DAY = 'h11_bai_nop_da_day';

function daDay(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KHOA_DA_DAY) || '[]')); }
  catch { return new Set(); }
}

function ghiDaDay(id: string): void {
  const s = daDay();
  s.add(id);
  try { localStorage.setItem(KHOA_DA_DAY, JSON.stringify([...s])); }
  catch { /* bộ nhớ đầy: lần sau đẩy lại, luật chặn ghi đè nên vô hại */ }
}

/**
 * Ghi bản sao một bài đã nộp. KHÔNG ném lỗi: nộp bài không được hỏng vì mạng.
 *
 * Lỗi GÌ cũng không đánh dấu "đã đẩy", kể cả `permission-denied`. Nếu coi bị
 * từ chối là xong thì web lên trước luật sẽ làm mất vĩnh viễn mọi bài nộp
 * trong khoảng đó. Cái giá: mỗi bài hỏng tốn một lượt ghi bị từ chối mỗi lần
 * đăng nhập — vô hại.
 */
export async function luuBaiNop(quiz: Quiz): Promise<boolean> {
  if (quiz.status !== 'submitted') return false;
  try {
    await setDoc(doc(db, COL_BAI_NOP, quiz.id), chuanBiBaiNop(quiz));
    ghiDaDay(quiz.id);
    return true;
  } catch (e) {
    console.warn('[baiNop] chưa đẩy được bài', quiz.id, e);
    return false;
  }
}

/** Một bài theo id. Trả `null` cả khi chưa có lẫn khi không có quyền — luật
 *  chặn hai trường hợp đó như nhau vì đọc `resource.data` của tài liệu rỗng. */
export async function docBaiNop(id: string): Promise<Quiz | null> {
  try {
    const anh = await getDoc(doc(db, COL_BAI_NOP, id));
    return anh.exists() ? (anh.data() as Quiz) : null;
  } catch {
    return null;
  }
}

/** Mọi bài đã nộp của một nhóm học sinh, mới nhất trước. Chia lô 30 email vì
 *  `where(…, 'in', …)` của Firestore nhận tối đa 30 giá trị. Chỉ giáo viên
 *  gọi được (luật `list`); lỗi thì ném ra để màn hình báo. */
export async function docBaiNopCuaCacEm(emails: string[]): Promise<Quiz[]> {
  const ds = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];
  const ra: Quiz[] = [];
  for (let i = 0; i < ds.length; i += 30) {
    const anh = await getDocs(query(collection(db, COL_BAI_NOP), where('userEmail', 'in', ds.slice(i, i + 30))));
    anh.forEach(d => ra.push(d.data() as Quiz));
  }
  return ra.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Giáo viên chấm lại tự luận. Luật chỉ cho đổi đúng hai trường này. */
export async function ghiDiemChamLai(id: string, score: number, results: Quiz['results']): Promise<void> {
  await updateDoc(doc(db, COL_BAI_NOP, id), {
    score,
    results: JSON.parse(JSON.stringify(results ?? {})),
  });
}

/** Bài nộp TRƯỚC khi có bản sửa này chỉ nằm trong máy. Đẩy những bài của
 *  CHÍNH em lên — máy dùng chung ở trường có thể chứa bài của bạn khác, và
 *  luật cũng chặn bài đứng tên người khác. Trả về số bài đẩy được. */
export async function dayBaiCuLen(email: string): Promise<number> {
  const e = email.trim().toLowerCase();
  const xong = daDay();
  const canDay = QuizStorage.getQuizzes().filter(q =>
    q.status === 'submitted' && (q.userEmail || '').trim().toLowerCase() === e && !xong.has(q.id));
  let n = 0;
  for (const q of canDay) if (await luuBaiNop(q)) n++;
  return n;
}
