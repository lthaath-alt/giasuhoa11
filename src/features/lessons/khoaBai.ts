import type { Lesson } from './types';
import type { UserRole } from '../auth/types';

/**
 * Khoá bài tuần tự — MỘT luật, dùng chung ở mọi chỗ (04/10/2026).
 *
 * Chủ dự án chốt hai điều:
 *   1. Một bài chỉ mở khi BÀI CHẶN của nó đã đạt từ 7/10 đề kiểm tra. Xem hết
 *      slide KHÔNG tính.
 *   2. Bài ôn tập / hệ thống hoá KHÔNG chặn bài sau. Bài chặn của một bài là bài
 *      học gần nhất phía trước mà không phải bài ôn tập: Bài 10 mở khi Bài 8
 *      đạt, và Bài 9 (ôn tập) cũng mở khi Bài 8 đạt.
 *
 * Vì sao có điều 2: đo trên ngân hàng ngày 04/10/2026 (1.780 câu), các bài 9,
 * 14, 18, 22, 25 không có câu nào gắn riêng và bài 3 chỉ có một câu. Bài không
 * có câu thì không tạo được đề, tức không ai "đạt đề" của nó được — để chúng
 * chặn thì bài 10 trở đi khoá vĩnh viễn với mọi học sinh. `kiem-tra:chuong-trinh`
 * canh chiều ngược lại: bài nào CÓ chặn bài khác thì ngân hàng phải đủ câu ra đề.
 *
 * Bản khoá trước 04/10/2026 viết lại điều kiện ở từng nơi (QuizPage,
 * LessonSidebar) và đòi thêm cờ phần "Nâng cao" (`advancedCompleted` hoặc
 * `skippedAdvanced`). Không nơi nào đặt được hai cờ đó khi em đạt ngay lần đầu,
 * nên em được 9 điểm vẫn bị chặn bài sau. Nay chỉ còn một phép so, trên đúng con
 * số đề kiểm tra ghi lại: `bestScore` (thang 10, bằng phần trăm đúng chia 10 —
 * xem `nopBai` ở QuizPage).
 *
 * Hàm thuần, không đọc Firebase.
 */

/** Điểm thang 10 phải đạt ở đề kiểm tra của bài chặn thì bài sau mới mở */
export const DIEM_MO_BAI_SAU = 7;

/**
 * Bài ôn tập / hệ thống hoá kiến thức — nhận theo TÊN bài trong chương trình
 * ("Bài 3: Ôn tập…", "Bài 9: Hệ thống hoá…"), không theo một danh sách mã gõ
 * tay: chương trình do máy sinh, thêm bớt bài thì luật tự theo.
 */
export function laBaiOnTap(bai: Pick<Lesson, 'title'>): boolean {
  const ten = bai.title.normalize('NFC');
  const sauDauHaiCham = ten.includes(':') ? ten.slice(ten.indexOf(':') + 1) : ten;
  /* "hoá" và "hóa" là hai cách đặt dấu của cùng một chữ; chương trình dùng cả hai. */
  return /^\s*(ôn tập|hệ thống hoá|hệ thống hóa)/iu.test(sauDauHaiCham);
}

export interface KetQuaKhoaBai {
  khoa: boolean;
  /** BÀI CHẶN: bài phải đạt đề thì `maBai` mới mở. Vắng mặt khi `maBai` không
   *  phải bài nào, hoặc phía trước nó không còn bài học nào (không kể ôn tập). */
  baiTruoc?: Lesson;
}

/**
 * @param dsBai     mọi bài của chương trình, đúng thứ tự học
 * @param maBai     bài cần xét. Mã không phải bài nào (mã chương của đề cả
 *                  chương, `de-giao:…` của đề giáo viên giao) thì không khoá.
 * @param layTienDo tiến độ của MỘT bài; `null` nghĩa là chưa làm gì ở bài đó
 * @param vai       chỉ học sinh bị khoá. Khách, giáo viên, quản trị xem tự do.
 */
export function xetKhoaBai(
  dsBai: Lesson[],
  maBai: string,
  layTienDo: (maBai: string) => { bestScore?: number } | null | undefined,
  vai: UserRole | null | undefined,
): KetQuaKhoaBai {
  const viTri = dsBai.findIndex(b => b.id === maBai);
  if (viTri <= 0) return { khoa: false };

  let baiTruoc: Lesson | undefined;
  for (let i = viTri - 1; i >= 0; i--) {
    if (!laBaiOnTap(dsBai[i])) { baiTruoc = dsBai[i]; break; }
  }
  if (!baiTruoc) return { khoa: false };
  if (vai !== 'student') return { khoa: false, baiTruoc };

  const diem = layTienDo(baiTruoc.id)?.bestScore ?? 0;
  return { khoa: diem < DIEM_MO_BAI_SAU, baiTruoc };
}

/**
 * Bài em LÀM ĐƯỢC NGAY để tiến tới `maBai` đang khoá: lần ngược chuỗi bài chặn
 * tới bài đầu tiên không bị khoá. Trả `undefined` khi `maBai` không khoá.
 *
 * Cần vì bài chặn trực tiếp có thể cũng đang khoá: em mới đạt Bài 1 mà xin đề
 * Bài 5 thì bài chặn là Bài 4, nhưng Bài 4 lại chờ Bài 2. Bảo em "làm Bài 4
 * trước" là dắt em sang một lần từ chối nữa (đo 04/10/2026 với tài khoản thử);
 * điều em làm được ngay là Bài 2.
 */
export function baiLamDuocNgay(
  dsBai: Lesson[],
  maBai: string,
  layTienDo: (maBai: string) => { bestScore?: number } | null | undefined,
  vai: UserRole | null | undefined,
): Lesson | undefined {
  let xet = xetKhoaBai(dsBai, maBai, layTienDo, vai);
  if (!xet.khoa) return undefined;
  /* Mỗi vòng lùi ít nhất một bài, nên không quá `dsBai.length` vòng. */
  for (let i = 0; i < dsBai.length && xet.baiTruoc; i++) {
    const xetChan = xetKhoaBai(dsBai, xet.baiTruoc.id, layTienDo, vai);
    if (!xetChan.khoa) return xet.baiTruoc;
    xet = xetChan;
  }
  return xet.baiTruoc;
}
