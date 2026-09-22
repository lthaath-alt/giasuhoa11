// ─── Từ đề giáo viên GIAO → bài làm của một học sinh ─────────────────────────
//
// Tách khỏi `deGiaoService.ts` và CỐ Ý không import gì ngoài kiểu dữ liệu, y
// như `deChuong.ts` đã làm: service kéo theo `firebase.ts`, mà tệp đó đọc
// `import.meta.env` và gọi `getAuth()` ngay lúc import. Chạy ngoài Vite (bộ
// kiểm `npm run kiem-tra:de-giao`) là ném lỗi trước khi chạy được dòng nào.
//
// Phần ở đây là logic thuần: đề còn hạn không, bài làm mang mã gì, hết giờ lúc
// nào. Đúng ba câu hỏi mà sai thì không ai thấy — học sinh vẫn vào làm bài bình
// thường, chỉ là làm được đề đã đóng, hoặc mỗi lần mở link lại ra một đề mới.

import type { Question } from '../library/types';
import type { DeGiao, Quiz } from './types';

/**
 * Tiền tố `lessonId` của bài làm sinh từ đề giao.
 *
 * Đề của cô KHÔNG thuộc bài nào trong chương trình, và điều đó phải nhìn thấy
 * được từ `lessonId`. Hai chỗ dựa vào đúng tính chất này:
 *
 *   - `QuizPage` khoá bài kiểm tra khi bài học TRƯỚC chưa xong. Phép canh đó
 *     tra `lessonId` trong chương trình; mã không có trong đó thì `findIndex`
 *     trả -1 và khoá không bật. Nếu đặt `lessonId` là một mã bài thật, em nào
 *     chưa học tới bài đó sẽ bị chặn khỏi chính bài kiểm tra cô giao.
 *   - Cũng `QuizPage`, chỗ đánh dấu bài học hoàn thành khi đạt 7/10 — đề giao
 *     không được tính là đã học xong bài nào.
 */
export const TIEN_TO_DE_GIAO = 'de-giao:';

export type TrangThaiDe = 'chua-mo' | 'dang-mo' | 'da-dong';

/** Đề đang ở giai đoạn nào so với mốc thời gian `luc` (ms). */
export function trangThaiDe(de: DeGiao, luc: number = Date.now()): TrangThaiDe {
  if (de.dong) return 'da-dong';
  if (luc < new Date(de.moLuc).getTime()) return 'chua-mo';
  if (luc > new Date(de.dongLuc).getTime()) return 'da-dong';
  return 'dang-mo';
}

/**
 * Mã bài làm của MỘT em cho MỘT đề — phải suy ra được, không được sinh ngẫu nhiên.
 *
 * Mã này cũng là id tài liệu `bai_nop/{id}`, nên nó quyết định hai việc:
 *
 *   1. Mở lại link giữa chừng thì gặp lại đúng bài đang làm dở, không phải đề
 *      mới tinh. `QuizStorage.addQuiz` từ chối id trùng, nên chỉ cần mã ổn định.
 *   2. Mỗi em nộp ĐÚNG MỘT bài cho mỗi đề. Làm lại lần hai sẽ ghi đè bản cũ
 *      chứ không đẻ thêm một dòng điểm nữa trong bảng của giáo viên.
 *
 * Email đưa hết về chữ thường rồi thay mọi ký tự lạ bằng `-`: id tài liệu
 * Firestore không được chứa dấu `/`, và `@` với `.` tuy hợp lệ nhưng một id
 * chỉ gồm dấu chấm (`.` hay `..`) thì bị từ chối — cứ lọc hết cho khỏi phải nhớ.
 */
export function maBaiLam(deGiaoId: string, email: string): string {
  const slug = (email || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `dg_${deGiaoId}_${slug}`;
}

/**
 * Hết giờ làm bài lúc nào (ISO).
 *
 * Lấy mốc SỚM HƠN giữa "bắt đầu + số phút" và hạn nộp của đề. Bỏ vế thứ hai thì
 * em mở link lúc 23h50 vẫn có trọn 45 phút, tức nộp lúc 0h35 hôm sau trong khi
 * cô đã chốt điểm từ nửa đêm.
 *
 * `QuizPage` đọc thẳng `expiresAt` để đếm ngược và để chặn nộp muộn, nên không
 * cần thêm đồng hồ riêng cho đề giao.
 */
export function hetGioLuc(de: DeGiao, batDau: number = Date.now()): string {
  const theoGio = batDau + Math.max(1, de.soPhut) * 60_000;
  const theoHan = new Date(de.dongLuc).getTime();
  return new Date(Math.min(theoGio, theoHan)).toISOString();
}

/** Tổng điểm của một bộ câu hỏi. Câu không khai `points` tính 1 điểm. */
export function tongDiem(questions: Question[]): number {
  return questions.reduce((t, q) => t + (q.points || 1), 0);
}

/**
 * Dựng bài làm cho một em từ đề đã giao.
 *
 * `xao` là hàm xáo vị trí phương án — truyền từ ngoài vào (`xaoPhuongAnWeb`)
 * thay vì import, để bộ kiểm truyền hàm đồng nhất và so sánh được kết quả.
 *
 * Đề trong `de_giao` GIỮ NGUYÊN thứ tự câu cô soạn; chỉ vị trí A–D trong từng
 * câu là mỗi em một khác. Xáo cả thứ tự câu thì cô dò bài trên giấy với em nào
 * cũng phải đếm lại từ đầu.
 */
export function taoBaiLam(
  de: DeGiao,
  email: string,
  opts: { batDau?: number; xao?: (q: Question) => Question } = {},
): Quiz {
  const batDau = opts.batDau ?? Date.now();
  const xao = opts.xao ?? (q => q);
  const questions = de.questions.map(xao);

  return {
    id: maBaiLam(de.id, email),
    lessonId: TIEN_TO_DE_GIAO + de.id,
    chapterId: TIEN_TO_DE_GIAO + de.id,
    userEmail: (email || '').trim().toLowerCase(),
    questions,
    answers: {},
    status: 'pending',
    score: 0,
    maxScore: tongDiem(questions),
    createdAt: new Date(batDau).toISOString(),
    expiresAt: hetGioLuc(de, batDau),
    deGiaoId: de.id,
    tenDe: de.tieuDe,
  };
}
