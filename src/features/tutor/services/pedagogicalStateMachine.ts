// ─── Máy trạng thái sư phạm — phần mã tự quyết, KHÔNG phó mặc cho mô hình ────
//
// Vì sao có tệp này: biên bản thẩm định ngày 14/09/2026 ghi lại những việc
// câu lệnh hệ thống dặn mà Gemini không làm theo, hoặc làm lúc có lúc không:
//   - học sinh nói "không biết" ba lần thì vẫn bị hỏi đọc số liệu trong đề;
//   - học sinh khai đang làm bài kiểm tra trên lớp mà gia sư vẫn dẫn giải;
//   - không có cách nào biết mô hình đang ở bước nào để đo cho đề tài.
// Những việc ĐẾM được và PHÁT HIỆN được bằng quy tắc thì làm ở đây, bằng mã,
// trước khi gửi yêu cầu. Mô hình chỉ nhận chỉ dẫn đã tính sẵn.
//
// Tệp này KHÔNG import gì cả, để `scripts/kiem-tra-su-pham.mts` nạp thẳng được
// bằng Node — cùng lý do với promptSuPham.ts.

/** Tin nhắn tối thiểu mà máy trạng thái cần — khớp `ChatMessage` của app. */
export interface TinNhanToiThieu {
  sender: 'user' | 'ai';
  content: string;
}

// ── 1. Bế tắc và giàn giáo nhận thức ────────────────────────────────────────

/**
 * Câu học sinh nói khi bế tắc. Bắt cả kiểu gõ tắt không dấu phổ biến.
 * Chỉ tính là bế tắc khi CẢ TIN NHẮN ngắn (xem `laTinBeTac`) — "em không biết
 * vì sao Kc không đổi khi thêm xúc tác" là một câu hỏi thật, không phải bế tắc.
 */
export const BE_TAC = /không biết|chịu thôi|không hiểu|bí quá|chả biết|k biết|ko biết|chịu rồi|hông biết|không nghĩ ra|chịu luôn|bó tay/i;

/** Tin dài hơn mức này thì học sinh đang trình bày, không phải đang buông. */
const TRAN_DO_DAI_BE_TAC = 90;

export function laTinBeTac(noiDung: string): boolean {
  const t = (noiDung ?? '').trim();
  return t.length > 0 && t.length <= TRAN_DO_DAI_BE_TAC && BE_TAC.test(t);
}

/**
 * Đếm số lượt bế tắc LIÊN TIẾP của học sinh, tính cả tin đang gửi.
 * Quét từ cuối lên, bỏ qua tin của gia sư; gặp một tin học sinh KHÔNG bế tắc
 * là dừng — em đã thử trả lời thì chuỗi bế tắc bị cắt.
 */
export function demBeTacLienTiep(lichSu: TinNhanToiThieu[], tinMoi: string): number {
  if (!laTinBeTac(tinMoi)) return 0;
  let dem = 1;
  for (let i = lichSu.length - 1; i >= 0; i--) {
    const m = lichSu[i];
    if (m.sender !== 'user') continue;
    if (!laTinBeTac(m.content)) break;
    dem++;
  }
  return dem;
}

/** Cụm từ cấm dùng khi học sinh đang bế tắc: nói "dễ" với em đang kẹt là làm em thấy mình kém. */
export const CUM_TU_CAM_KHI_BE_TAC = ['rất dễ', 'dễ thôi', 'dễ dàng', 'quen thuộc', 'sẽ ra ngay thôi', 'ra ngay thôi', 'đơn giản thôi'];

/**
 * Chỉ dẫn gắn thêm vào câu lệnh hệ thống cho lượt này, theo nấc giàn giáo.
 * Trả chuỗi rỗng nếu học sinh không bế tắc.
 *
 * BỐN nấc (18/09/2026, trước đó là ba):
 *   1  chẩn đoán chỗ vướng bằng câu hỏi ba lựa chọn;
 *   2  THU HẸP câu hỏi — cho sẵn một dữ kiện trung gian rồi hỏi một bước nhỏ,
 *      hoặc đổi câu hỏi mở thành câu hỏi có sẵn lựa chọn. Vẫn không đáp án;
 *   3  giải mẫu một bài cùng dạng khác số liệu;
 *   4+ làm hộ đúng bước hiện tại của bài gốc.
 *
 * Nấc 2 được chèn thêm theo yêu cầu của chủ đề tài: bế tắc sau hai lượt hỏi
 * thì hạ độ mở của câu hỏi trước đã, đừng nhảy ngay sang giải mẫu. Thứ tự này
 * giữ đúng nguyên tắc tăng dần mức hỗ trợ, và mỗi nấc vẫn trả việc lại cho
 * học sinh.
 */
export function chiDanGianGiao(soLanBeTac: number): string {
  if (soLanBeTac <= 0) return '';
  const cam = `Tuyệt đối không dùng các cụm: ${CUM_TU_CAM_KHI_BE_TAC.map(c => `"${c}"`).join(', ')}. KHÔNG kết thúc phiên, KHÔNG đẩy em sang làm bài kiểm tra.`;
  if (soLanBeTac === 1) {
    return [
      'TRẠNG THÁI (do hệ thống đếm, không phải đoán): HỌC SINH BẾ TẮC LẦN 1.',
      'Việc của lượt này: CHẨN ĐOÁN chỗ vướng. Hỏi đúng một câu kèm 3 lựa chọn A, B, C để em chọn:',
      'A. Em chưa hiểu đề hỏi gì.  B. Em chưa nhớ công thức/kiến thức cần dùng.  C. Em biết cách làm nhưng vướng ở phép tính.',
      'Có thể đổi chữ cho khớp bài đang làm, nhưng giữ đúng ba hướng chẩn đoán đó.',
      cam,
    ].join('\n');
  }
  if (soLanBeTac === 2) {
    return [
      'TRẠNG THÁI (do hệ thống đếm): HỌC SINH BẾ TẮC LẦN 2.',
      'Việc của lượt này: THU HẸP CÂU HỎI, vẫn KHÔNG đưa đáp án và KHÔNG giải mẫu.',
      'Cách thu hẹp: cho sẵn một dữ kiện trung gian mà em chưa tìm ra, rồi hỏi đúng MỘT bước nhỏ liền sau đó;',
      'hoặc đổi câu hỏi mở thành câu hỏi có 2–4 lựa chọn để em chỉ phải nhận ra, không phải tự nghĩ ra.',
      'Câu hỏi thu hẹp phải nhỏ tới mức em trả lời được bằng một dòng.',
      cam,
    ].join('\n');
  }
  if (soLanBeTac === 3) {
    return [
      'TRẠNG THÁI (do hệ thống đếm): HỌC SINH BẾ TẮC LẦN 3.',
      'Việc của lượt này: GIẢI MẪU trọn vẹn MỘT bài tương tự, CÙNG DẠNG nhưng KHÁC số liệu (worked example), trình bày từng bước ngắn gọn.',
      'Sau đó mời em áp dụng đúng các bước đó cho bài gốc, bắt đầu từ bước đầu tiên. Không giải bài gốc.',
      'Được phép dài hơn giới hạn độ dài thông thường ở lượt này.',
      cam,
    ].join('\n');
  }
  return [
    `TRẠNG THÁI (do hệ thống đếm): HỌC SINH BẾ TẮC LẦN ${soLanBeTac}.`,
    'Việc của lượt này: giải thích chi tiết và LÀM HỘ BƯỚC HIỆN TẠI của bài gốc (kể cả phép tính của bước đó), nói rõ vì sao làm vậy.',
    'Sau đó giao BƯỚC KẾ TIẾP cho em tự làm, kèm một gợi ý nhỏ. Không làm hộ quá một bước.',
    cam,
  ].join('\n');
}

// ── 2. Gian lận trong giờ kiểm tra ───────────────────────────────────────────

/**
 * Dấu hiệu học sinh đang ngồi trong giờ kiểm tra/thi.
 *
 * CỐ Ý đòi ngữ cảnh "đang làm/thi" hoặc "sắp thu bài", KHÔNG bắt chữ "bài kiểm
 * tra" trần: "cho em làm bài kiểm tra chương" là em xin đề luyện tập — chặn
 * câu đó là phạt oan đúng hành vi hệ thống muốn khuyến khích.
 */
const DAU_HIEU_PHONG_THI: RegExp[] = [
  /đang\s+(?:làm\s+)?(?:bài\s+)?(?:kiểm\s*tra|thi)\b/i,
  /(?:kiểm\s*tra|thi)\s+\d{1,3}\s*(?:phút|p)\b/i,
  /(?:cô|thầy|giám\s*thị)\s+(?:sắp|chuẩn\s*bị|đang|sắp\s+sửa)\s+thu\s+bài/i,
  /sắp\s+(?:hết\s+giờ|nộp\s+bài|thu\s+bài)/i,
  /trong\s+(?:giờ|phòng)\s+(?:kiểm\s*tra|thi)/i,
];

export function laNguCanhGianLanPhongThi(noiDung: string): boolean {
  const t = (noiDung ?? '').normalize('NFC');
  return DAU_HIEU_PHONG_THI.some(re => re.test(t));
}

export const LOI_TU_CHOI_GIAN_LAN =
  'Thầy/cô nhận thấy em đang trong thời gian làm bài kiểm tra trên lớp. Để đảm bảo tính trung thực học thuật, ' +
  'thầy/cô không thể hỗ trợ giải bài lúc này. Em hãy tự tin làm bài bằng chính năng lực của mình nhé!\n\n' +
  'Làm bài xong, em quay lại đây, thầy/cô cùng em xem lại những chỗ em còn phân vân.';

// ── 3. Phân loại tương tác ngoài môn học ─────────────────────────────────────

export type LoaiNgoaiMon = 'CAM_XUC_TIEU_CUC' | 'LAC_DE' | 'SPAM_ATTACK';

/** Chỉ SPAM_ATTACK mới bị tính lượt phạt. Nản, gắt, hỏi nhầm môn thì không. */
export const CO_TINH_LUOT_PHAT: Record<LoaiNgoaiMon, boolean> = {
  CAM_XUC_TIEU_CUC: false,
  LAC_DE: false,
  SPAM_ATTACK: true,
};

/**
 * Spam do MÃ phát hiện, không hỏi mô hình (hỏi mô hình thì chính kẻ spam đang
 * đốt hạn mức gọi AI). Hai dấu hiệu:
 *   - quá SPAM_SO_TIN tin trong SPAM_CUA_SO_MS;
 *   - gửi lại cùng một nội dung SPAM_LAP_LAI lần liền.
 */
export const SPAM_CUA_SO_MS = 60_000;
export const SPAM_SO_TIN = 6;
export const SPAM_LAP_LAI = 3;

export function laSpam(thoiDiemGui: number[], noiDungGanDay: string[], bayGio: number): boolean {
  const trongCuaSo = thoiDiemGui.filter(t => bayGio - t < SPAM_CUA_SO_MS).length;
  if (trongCuaSo >= SPAM_SO_TIN) return true;
  const chuan = (s: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const cuoi = noiDungGanDay.slice(-SPAM_LAP_LAI).map(chuan);
  return cuoi.length === SPAM_LAP_LAI && cuoi[0].length > 0 && cuoi.every(c => c === cuoi[0]);
}

// ── 4. Nhãn ẩn do mô hình phát — tách ra trước khi hiển thị và lưu ───────────

export type Buoc = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'loc';
export type LoaiLuot = 'goi_mo' | 'kiem_tra_hieu' | 'giai_thich' | 'tra_cuu' | 'hanh_chinh';

const BUOC_HOP_LE = new Set<string>(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'loc']);
const LOAI_LUOT_HOP_LE = new Set<string>(['goi_mo', 'kiem_tra_hieu', 'giai_thich', 'tra_cuu', 'hanh_chinh']);

export interface NhanAn {
  /** Nội dung đã gỡ sạch nhãn ẩn, sẵn sàng hiển thị */
  noiDung: string;
  buoc?: Buoc;
  loaiLuot?: LoaiLuot;
  maNgoNhan?: string;
  ngoaiMon?: Exclude<LoaiNgoaiMon, 'SPAM_ATTACK'>;
}

/**
 * Tách nhãn ẩn. Nhãn không hợp lệ (mô hình bịa) thì vẫn GỠ khỏi nội dung
 * nhưng không ghi nhận — thà thiếu số liệu còn hơn số liệu rác.
 *
 * Nhận luôn `[SIGNAL:OFFTOPIC]` đời cũ và coi như LAC_DE (không phạt): lịch sử
 * chat lưu trước ngày đổi prompt vẫn còn nhãn đó.
 */
export function tachNhanAn(traLoi: string): NhanAn {
  let t = traLoi ?? '';
  const kq: NhanAn = { noiDung: '' };

  const buoc = /\[BUOC:\s*([A-Za-z0-9]+)\s*\]/i.exec(t);
  if (buoc) {
    const v = buoc[1].toUpperCase() === 'LOC' ? 'loc' : buoc[1].toUpperCase();
    if (BUOC_HOP_LE.has(v)) kq.buoc = v as Buoc;
  }
  const luot = /\[LUOT:\s*([a-z_]+)\s*\]/i.exec(t);
  if (luot && LOAI_LUOT_HOP_LE.has(luot[1].toLowerCase())) kq.loaiLuot = luot[1].toLowerCase() as LoaiLuot;

  const ngo = /\[NGO_NHAN:\s*([a-z0-9_-]{2,40})\s*\]/i.exec(t);
  if (ngo) kq.maNgoNhan = ngo[1].toLowerCase();

  if (/\[SIGNAL:CAM_XUC_TIEU_CUC\]/i.test(t)) kq.ngoaiMon = 'CAM_XUC_TIEU_CUC';
  else if (/\[SIGNAL:(LAC_DE|OFFTOPIC)\]/i.test(t)) kq.ngoaiMon = 'LAC_DE';

  t = t
    .replace(/\[BUOC:[^\]]*\]/gi, '')
    .replace(/\[LUOT:[^\]]*\]/gi, '')
    .replace(/\[NGO_NHAN:[^\]]*\]/gi, '')
    .replace(/\[SIGNAL:(CAM_XUC_TIEU_CUC|LAC_DE|OFFTOPIC)\]/gi, '');

  kq.noiDung = t.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return kq;
}

// ── 5. Ghép chỉ dẫn cho một lượt ─────────────────────────────────────────────

export interface KetQuaTruocLuot {
  /** Có thì KHÔNG gọi mô hình, trả thẳng chuỗi này */
  traLoiNgay?: string;
  /** Gắn thêm vào cuối câu lệnh hệ thống (có thể rỗng) */
  chiDanThem: string;
  soLanBeTac: number;
  laGianLan: boolean;
}

/**
 * Chạy trước mỗi lượt gọi mô hình. Thứ tự ưu tiên:
 *   1. Gian lận trong giờ kiểm tra → từ chối ngay, không tốn lượt gọi AI.
 *   2. Bế tắc → gắn chỉ dẫn giàn giáo theo số lần đếm được.
 */
export function xuLyTruocLuot(lichSu: TinNhanToiThieu[], tinMoi: string, nhanh: 'socratic' | 'truc-tiep'): KetQuaTruocLuot {
  if (laNguCanhGianLanPhongThi(tinMoi)) {
    return { traLoiNgay: LOI_TU_CHOI_GIAN_LAN, chiDanThem: '', soLanBeTac: 0, laGianLan: true };
  }
  const soLanBeTac = demBeTacLienTiep(lichSu, tinMoi);
  /* Nhánh đối chứng vốn giảng thẳng có lời giải mẫu — giàn giáo bốn nấc là
     biến can thiệp của nhánh Socratic, gắn cho cả hai là xoá mất khác biệt
     cần đo. Nhánh đối chứng vẫn được đếm để làm số liệu. */
  const chiDanThem = nhanh === 'socratic' ? chiDanGianGiao(soLanBeTac) : '';
  return { chiDanThem, soLanBeTac, laGianLan: false };
}
