// ─── Nguồn câu hỏi của MỘT bài học ───────────────────────────────────────────
//
// Câu hỏi của web nằm ở ba nơi, vì ba màn hình khác nhau đẻ ra chúng:
//
//   1. Firestore `bank_questions` — "Ngân hàng dữ liệu" (BankManager), kho
//                                   chính hiện nay, dùng chung với trò chơi.
//   2. Firestore `questions`      — kho của màn hình Ngân hàng đời trước.
//   3. localStorage `h11_library` — "Thư viện" nhập từ file Word, chỉ nằm trên
//                                   đúng chiếc máy đã import.
//
// Trước đây `createQuiz` CHỈ đọc nguồn (3). Hệ quả: 216 câu đã gắn `lessonId`
// trong `bank_questions` không bao giờ vào được đề, localStorage thì rỗng, nên
// đề rơi xuống bộ câu cứng `DEFAULT_FALLBACK_QUESTIONS` — toàn câu alkane/hợp
// chất hữu cơ, bất kể học sinh đang học bài nào.
//
// File này là chỗ DUY NHẤT trả lời câu hỏi "bài này có những câu nào", để chỗ
// gọi khỏi phải nhớ có mấy kho.

import { Question, DifficultyLevel } from './types';
import { LibraryStorage } from './libraryStorage';
import { BankFirestore } from '../bank/bankStore';
import { toLegacy } from '../bank/convert';

/** Bật log chẩn đoán luồng tạo đề. Đặt false khi đã chạy ổn định. */
export const LOG_TAO_DE = false;

/**
 * Đưa mọi cách ghi mức độ về đúng 3 bậc của `DifficultyLevel`.
 *
 * Cần thiết vì các kho dùng thang khác nhau: ngân hàng ghi "Nhận biết / Thông
 * hiểu / Vận dụng / Vận dụng cao", còn thư viện và đề kiểm tra dùng "Thấp /
 * Trung bình / Cao". Trộn hai thang mà không quy đổi thì hàm sort của đề so
 * sánh với `undefined` → ra NaN → thứ tự câu trong đề loạn hẳn.
 */
export function chuanHoaDoKho(muc?: string): DifficultyLevel {
  switch ((muc || '').trim()) {
    case 'Thấp':
    case 'Nhận biết':
      return 'Thấp';
    case 'Cao':
    case 'Vận dụng':
    case 'Vận dụng cao':
      return 'Cao';
    case 'Trung bình':
    case 'Thông hiểu':
      return 'Trung bình';
    default:
      // Câu cũ thiếu mức độ: xếp giữa để không dồn hết lên đầu hay xuống cuối
      return 'Trung bình';
  }
}

/** Thứ tự sắp xếp câu trong đề: dễ trước, khó sau */
export const TRONG_SO_DO_KHO: Record<DifficultyLevel, number> = {
  'Thấp': 1,
  'Trung bình': 2,
  'Cao': 3,
};

/** Bổ sung các trường tùy chọn còn thiếu để câu hỏi dùng được ở mọi nơi */
function chuanHoaCau(q: Question, chapterId: string, lessonId: string): Question {
  return {
    ...q,
    images: q.images || [],
    difficulty: chuanHoaDoKho(q.difficulty),
    points: q.points || 1,
    createdAt: q.createdAt || new Date().toISOString(),
    chapterId: q.chapterId || chapterId,
    lessonId: q.lessonId || lessonId,
  };
}

/**
 * Lấy toàn bộ câu hỏi thuộc một bài học, gộp từ mọi kho.
 *
 * @param nganHangCu Câu hỏi kho `questions` đời cũ mà AppContext đã tải sẵn vào
 *                   `libraryQuestions` — truyền vào để khỏi gọi mạng lần nữa.
 *
 * CHỈ trả về câu thật sự gắn với bài này. KHÔNG có đường lui sang câu của bài
 * khác — thà đề trống còn hơn học sinh ôn Bài 1 mà phải làm đề Bài 12.
 */
export async function layCauHoiCuaBai(
  chapterId: string,
  lessonId: string,
  nganHangCu: Question[] = [],
): Promise<Question[]> {
  const ra: Question[] = [];
  const daCo = new Set<string>();

  const them = (q: Question) => {
    if (!q || !q.id || daCo.has(q.id)) return;
    daCo.add(q.id);
    ra.push(chuanHoaCau(q, chapterId, lessonId));
  };

  // Nguồn 1: ngân hàng hợp nhất trên Firestore — kho chính hiện nay
  const tuBank = (await BankFirestore.getByLesson(lessonId)).map(toLegacy);
  tuBank.forEach(them);
  const soBank = ra.length;

  // Nguồn 2: kho `questions` đời cũ, lọc theo bài
  nganHangCu.filter(q => q.lessonId === lessonId).forEach(them);
  const soCu = ra.length - soBank;

  // Nguồn 3: thư viện theo bài trong localStorage của máy này
  LibraryStorage.getQuestions(chapterId, lessonId).forEach(them);
  const soThuVien = ra.length - soBank - soCu;

  if (LOG_TAO_DE) {
    console.log(
      `[Quiz] Gom câu hỏi cho bài "${lessonId}" (chương "${chapterId}"): ` +
      `bank_questions=${soBank}, questions(cũ)=${soCu}, h11_library=${soThuVien}, ` +
      `TỔNG=${ra.length}`,
    );
  }

  return ra;
}
