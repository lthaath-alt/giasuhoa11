// ─── Ghép câu lệnh hệ thống cho MỘT lượt gia sư ──────────────────────────────
//
// Tách khỏi `geminiTutorService.dungYeuCau` ngày 01/10/2026 để mọi đường gọi
// mô hình — trình duyệt, máy chủ dự phòng, script thử — dùng CHUNG một chỗ
// ghép. Hai chỗ tự ghép thì sớm muộn lệch nhau, và nhóm thực nghiệm không còn
// được dạy bằng đúng một câu lệnh. `kiem-tra:thuc-nghiem` so đầu ra với bản
// ghép cũ đóng băng, từng ký tự.
//
// Chỉ import tệp thuần, để Node và Pages Function nạp thẳng được.
import { dungPrompt, type NhanhThucNghiem } from './promptSuPham';
import { buildLessonCatalog, buildLessonContext, buildProgramContext } from './lessonContext';

const VACH = '='.repeat(60);

export interface ThamSoCauLenh {
  nhanh: NhanhThucNghiem;
  /** Mã bài đang mở; 'global-advisor' nghĩa là khung iChat chung */
  lessonId: string;
  /** Chỉ dẫn của máy trạng thái (`xuLyTruocLuot().chiDanThem`) */
  chiDanThem?: string;
  /** Chỉ thị của bộ chặn rò — chỉ có ở lượt sinh lại */
  chiThiChan?: string;
}

export function dungHuongDanHeThong(t: ThamSoCauLenh): string {
  /* Nội dung bài đang mở; không mở bài nào (khung iChat chung) thì rỗng. */
  const nguCanhBai = buildLessonContext(t.lessonId);
  /* Không mở bài nào thì đưa dàn bài cả chương trình vào chỗ trống. */
  const danBaiChung = nguCanhBai ? '' : buildProgramContext();
  return [
    dungPrompt(t.nhanh),
    VACH,
    /* Danh mục mã bài LUÔN đính kèm, để nhãn ra đề mang đúng mã bài. */
    buildLessonCatalog(),
    ...(nguCanhBai ? [VACH, nguCanhBai] : []),
    ...(danBaiChung ? [VACH, danBaiChung] : []),
    /* Chỉ dẫn của máy trạng thái đặt CUỐI CÙNG: gần lượt hỏi nhất, và câu
       lệnh đã dặn mục "TRẠNG THÁI" được ưu tiên hơn quy tắc bước. */
    ...(t.chiDanThem ? [VACH, t.chiDanThem] : []),
    /* Chỉ thị của bộ chặn rò đứng sau cùng, chỉ có ở lượt sinh lại. */
    ...(t.chiThiChan ? [VACH, t.chiThiChan] : []),
  ].join('\n\n');
}
