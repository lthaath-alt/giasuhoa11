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

// ─── Kết quả cả lớp cho một đề ───────────────────────────────────────────────

/** Một dòng trong bảng kết quả: một em, một đề. */
export interface KetQuaEm {
  email: string;
  ten: string;
  /** Số báo danh, để đánh số cột đầu giống các bảng khác của màn giáo viên */
  soBaoDanh?: number;
  daNop: boolean;
  /** Điểm quy về thang 10; `null` khi em chưa nộp */
  diem10: number | null;
  soDung: number;
  soSai: number;
  soCau: number;
  /** ISO, lúc em bắt đầu bài — `Quiz.createdAt`. Vắng khi chưa nộp. */
  nopLuc?: string;
}

/**
 * Kết quả của CẢ LỚP cho một đề, kể cả em chưa nộp.
 *
 * Giữ nguyên thứ tự `hocSinh` truyền vào chứ không tự sắp xếp: danh sách đó đã
 * theo sổ lớp, và mọi bảng khác của màn giáo viên đang đánh số theo đúng thứ
 * tự ấy. Sắp lại ở đây là cùng một lớp mà hai bảng đánh số khác nhau.
 *
 * Em CHƯA nộp vẫn có một dòng. Bỏ các em đó đi thì bảng chỉ còn người đã làm,
 * và cô không nhìn ra ai chưa làm — mà đó mới là thứ cô cần trước giờ trả bài.
 *
 * Câu bỏ trống tính là SAI: `soSai = soCau − soDung`. Đếm riêng "chưa trả lời"
 * thì cột số phải cộng lại mới bằng tổng, còn thang điểm của Bộ vốn đã coi ý
 * bỏ trống là sai — xem `chamCau` trong `features/practice/logic.ts`.
 */
export function thongKeDeGiao(
  deGiaoId: string,
  hocSinh: { email: string; name: string; studentNumber?: number }[],
  baiNop: Quiz[],
): KetQuaEm[] {
  /* Chỉ lấy bài của ĐÚNG đề này. `docBaiNopCuaCacEm` trả về MỌI bài của lớp,
     gồm cả đề tự ôn của từng em. */
  const cuaDe = new Map<string, Quiz>();
  for (const q of baiNop) {
    if (q.deGiaoId !== deGiaoId || q.status !== 'submitted') continue;
    const e = (q.userEmail || '').trim().toLowerCase();
    const cu = cuaDe.get(e);
    /* Mã bài suy ra được nên mỗi em chỉ có một bài cho mỗi đề. Phòng khi dữ
       liệu cũ còn hai bản, lấy bản MỚI hơn — đó là bản cô đang chấm. */
    if (!cu || q.createdAt > cu.createdAt) cuaDe.set(e, q);
  }

  return hocSinh.map(hs => {
    const email = (hs.email || '').trim().toLowerCase();
    const bai = cuaDe.get(email);
    if (!bai) {
      return {
        email, ten: hs.name, soBaoDanh: hs.studentNumber,
        daNop: false, diem10: null, soDung: 0, soSai: 0, soCau: 0,
      };
    }

    const soCau = bai.questions.length;
    const soDung = Object.values(bai.results || {}).filter(r => r.correct).length;
    return {
      email, ten: hs.name, soBaoDanh: hs.studentNumber,
      daNop: true,
      diem10: bai.maxScore > 0 ? (bai.score / bai.maxScore) * 10 : 0,
      soDung,
      soSai: soCau - soDung,
      soCau,
      nopLuc: bai.createdAt,
    };
  });
}

/** Mấy con số tóm tắt trên đầu bảng kết quả. `diemTB` chỉ tính trên em ĐÃ nộp. */
export function tomTatDeGiao(ds: KetQuaEm[]): {
  siSo: number; daNop: number; diemTB: number | null;
} {
  const nop = ds.filter(k => k.daNop && k.diem10 !== null);
  return {
    siSo: ds.length,
    daNop: nop.length,
    /* Chia cho SỐ EM ĐÃ NỘP, không phải sĩ số. Chia cho sĩ số là mỗi em chưa
       làm kéo trung bình lớp xuống như thể em ấy được 0 — sai hẳn ý nghĩa. */
    diemTB: nop.length ? nop.reduce((t, k) => t + (k.diem10 as number), 0) / nop.length : null,
  };
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
