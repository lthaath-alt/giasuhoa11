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

/**
 * Câu trả lời của gia sư đã TỰ nói bài chưa mở / đang khoá hay chưa.
 *
 * Web vốn nối thêm một dòng "(Đề của Bài N chưa mở: …)" mỗi khi mô hình phát nhãn
 * ra đề cho bài đang khoá. Từ khi gia sư nhận lời dặn khoá bài (xem
 * `chiDanKhoaChoGiaSu`), chính nó đã giải thích điều đó — đo 04/10/2026: câu trả
 * lời ra HAI đoạn liền nhau cùng nói "bài chưa mở, làm Bài 2 trước". Dòng của
 * web chỉ còn là lưới đỡ cho lúc mô hình quên giải thích.
 */
export function daNoiBaiChuaMo(traLoi: string): boolean {
  /* "khoá" và "khóa" là hai cách đặt dấu của cùng một chữ. */
  return /chưa mở|đang khoá|đang khóa|bị khoá|bị khóa|mở khoá|mở khóa/iu.test(traLoi.normalize('NFC'));
}

/**
 * Lời dặn KHOÁ BÀI gửi kèm cho gia sư ở mỗi lượt, hoặc `undefined` nếu không có
 * gì để dặn (khách, thầy cô, hay học sinh đã mở hết mọi bài).
 *
 * Vì sao cần (đo 04/10/2026 với tài khoản thử): em mới đạt Bài 1 xin "đề luyện
 * tập Bài 5". Web từ chối đúng cái đề tính điểm, nhưng Chemai thì vẫn soạn luôn
 * hai câu luyện Bài 5 ngay trong khung chat — khoá thành ra chỉ khoá một nửa.
 *
 * CHỈ cấm việc gia sư tự RA bài luyện / phát nhãn ra đề cho bài đang khoá. Em
 * mang bài tập của chính em tới hỏi, hay hỏi để hiểu lý thuyết, thì vẫn được
 * hướng dẫn: lớp có thể đang học Bài 5 trong khi em chưa kịp làm đề Bài 2 trên
 * web, và chặn luôn cả việc hỏi bài là bỏ rơi em đúng lúc cần.
 *
 * Trả `undefined` khi không có gì để dặn là điều BẮT BUỘC: lời dặn được nối vào
 * `chiDanThem` của câu lệnh hệ thống, mà `kiem-tra:thuc-nghiem` so câu lệnh đó
 * từng ký tự với bản đóng băng. Lời dặn giống hệt nhau cho cả hai nhánh thực
 * nghiệm, nên không làm lệch biến đề tài đang đo.
 */
export function chiDanKhoaChoGiaSu(
  dsBai: Lesson[],
  layTienDo: (maBai: string) => { bestScore?: number } | null | undefined,
  vai: UserRole | null | undefined,
): string | undefined {
  if (vai !== 'student') return undefined;
  const dangKhoa = dsBai.filter(b => xetKhoaBai(dsBai, b.id, layTienDo, vai).khoa);
  if (dangKhoa.length === 0) return undefined;
  /* Chuỗi khoá chỉ có MỘT bài "làm được ngay" cho mọi bài đang khoá: bài học
     đầu tiên (không kể ôn tập) em chưa đạt đề. */
  const tenBaiNgay = baiLamDuocNgay(dsBai, dangKhoa[0].id, layTienDo, vai)?.title ?? 'bài trước';
  return [
    'TRẠNG THÁI KHOÁ BÀI (do web quyết định theo điểm đề kiểm tra của em, không thương lượng được):',
    `- Các bài ĐANG KHOÁ với em này: ${dangKhoa.map(b => b.id).join(', ')}.`,
    `- Em XIN ĐỀ hoặc xin bộ câu hỏi luyện tập của một bài đang khoá: KHÔNG ra câu hỏi luyện nào cho bài đó, và KHÔNG phát nhãn [SIGNAL:YEU_CAU_DE:…] hay [SIGNAL:XONG_BAI:…] mang mã bài đó. Nói ngắn gọn rằng bài đó chưa mở, em cần đạt từ ${DIEM_MO_BAI_SAU}/10 đề kiểm tra của "${tenBaiNgay}" trước; rồi mời em xin đề của "${tenBaiNgay}" để làm.`,
    '- Em mang bài tập của chính em tới hỏi, hoặc hỏi để hiểu lý thuyết, thì vẫn hướng dẫn như thường dù thuộc bài nào.',
  ].join('\n');
}
