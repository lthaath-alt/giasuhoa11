/**
 * Đọc dữ liệu cho mục "Theo dõi học sinh" của trang giáo viên (18/09/2026).
 *
 * Luật cho giáo viên đọc `progress/{email}` và `chats` của mọi học sinh
 * (`laGiaoVien()`), còn `bai_nop` đọc qua `baiNopService.ts`.
 */
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../core/services/firebase';
import { FirestoreService } from '../../../core/services/firestoreService';
import type { ChatMessage, LearningProgress } from '../../auth/types';

/** Tiến độ của cả nhóm, khoá bằng email chữ thường. Một lượt đọc mỗi em. */
export async function docTienDoCacEm(emails: string[]): Promise<Record<string, LearningProgress>> {
  const ds = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];
  const ket = await Promise.all(ds.map(e => FirestoreService.getUserProgress(e)));
  return Object.fromEntries(ds.map((e, i) => [e, ket[i]]));
}

/** Mọi tin chat của một em, cũ trước. Chỉ lọc một trường nên không cần chỉ mục
 *  ghép; xếp ở máy thay cho `orderBy`. */
export async function docChatCuaEm(email: string): Promise<ChatMessage[]> {
  const anh = await getDocs(query(collection(db, 'chats'), where('userEmail', '==', email)));
  return anh.docs
    .map(d => ({ id: d.id, ...d.data() } as ChatMessage))
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
