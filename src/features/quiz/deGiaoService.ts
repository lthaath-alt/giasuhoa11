/**
 * Đề kiểm tra giáo viên GIAO cho lớp — collection `de_giao/{id}`.
 *
 * Vì sao có tệp này (22/09/2026): trước đó mọi đề đều do CHÍNH học sinh bấm ra
 * từ màn học (`QuizService.createQuiz`), nên giáo viên không có đường nào giao
 * một đề chung cho cả lớp. Bài kiểm tra đã nộp thì đã lên Firestore từ
 * 18/09/2026 (`baiNopService.ts`); đây là chiều ngược lại — đề đi TỪ máy giáo
 * viên tới máy học sinh.
 *
 * Luật: `firestore.rules`, khối `match /de_giao/{id}`.
 *
 * GIỚI HẠN ĐÃ BIẾT — đáp án nằm trong tài liệu mà học sinh đọc được.
 * Chấm điểm chạy trên trình duyệt của học sinh (`QuizService.submitQuiz`), nên
 * đáp án BẮT BUỘC phải tới được máy em. Em nào mở devtools là đọc được đáp án
 * trước khi làm. Đây đúng là giới hạn đã ghi ở `bai_nop` mục 4 trong CLAUDE.md,
 * cùng một nguyên nhân và cùng một cách chữa thật: chấm lại ở máy chủ bằng
 * Cloud Function, tức gói Blaze trả tiền. Đừng vá bằng cách giấu đáp án đi —
 * giấu kiểu đó chỉ tốn công, không chặn được ai.
 */
import {
  collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where,
} from 'firebase/firestore';
import { db } from '../../core/services/firebase';
import type { DeGiao } from './types';

export const COL_DE_GIAO = 'de_giao';

/**
 * Bản sạch để ghi lên Firestore.
 *
 * Vòng JSON bỏ mọi `undefined`: Firestore TỪ CHỐI cả tài liệu nếu gặp một giá
 * trị `undefined`, mà câu lấy từ kho hay mang `topic: undefined` hoặc
 * `correctAnswer: undefined`. Giống hệt `chuanBiBaiNop`, và vấp một lần là đủ.
 */
function chuanBiDe(de: DeGiao): DeGiao {
  const ban = JSON.parse(JSON.stringify(de)) as DeGiao;
  ban.teacherEmail = (de.teacherEmail || '').trim().toLowerCase();
  return ban;
}

/** Ghi (hoặc ghi đè) một đề. Ném lỗi để màn hình báo — giao đề mà im lặng
 *  hỏng thì cô tưởng lớp đã nhận được đề. */
export async function luuDeGiao(de: DeGiao): Promise<void> {
  await setDoc(doc(db, COL_DE_GIAO, de.id), chuanBiDe(de));
}

/** Một đề theo id. Trả `null` cả khi chưa có lẫn khi không có quyền. */
export async function docDeGiao(id: string): Promise<DeGiao | null> {
  try {
    const anh = await getDoc(doc(db, COL_DE_GIAO, id));
    return anh.exists() ? (anh.data() as DeGiao) : null;
  } catch {
    return null;
  }
}

/**
 * Mọi đề đã giao cho một lớp, mới nhất trước.
 *
 * Sắp xếp Ở ĐÂY chứ không dùng `orderBy`: thêm `orderBy('createdAt')` cạnh
 * `where('classId')` là Firestore đòi một chỉ mục ghép, mà `firestore.indexes.json`
 * phải deploy riêng — quên deploy thì truy vấn hỏng trên bản thật trong khi máy
 * đang dùng vẫn chạy. Một lớp có vài chục đề, sắp bằng JS không tốn gì.
 */
export async function docDeCuaLop(classId: string): Promise<DeGiao[]> {
  if (!classId) return [];
  const anh = await getDocs(query(collection(db, COL_DE_GIAO), where('classId', '==', classId)));
  const ra: DeGiao[] = [];
  anh.forEach(d => ra.push(d.data() as DeGiao));
  return ra.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Giáo viên đóng đề sớm, hoặc mở lại đề vừa đóng nhầm. */
export async function datTrangThaiDong(id: string, dong: boolean): Promise<void> {
  await updateDoc(doc(db, COL_DE_GIAO, id), { dong });
}

/** Xoá hẳn một đề. Bài đã nộp KHÔNG mất theo — chúng nằm ở `bai_nop`, và luật
 *  chặn xoá tài liệu ở đó. */
export async function xoaDeGiao(id: string): Promise<void> {
  await deleteDoc(doc(db, COL_DE_GIAO, id));
}
