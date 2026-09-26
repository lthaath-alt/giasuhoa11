import { ChatMessage } from '../../auth/types';
import { ErrorLogService } from '../../../core/services/errorLog';
import { GEMINI_MODEL_NAME } from '../../../core/constants';
import { buildLessonContext, buildLessonCatalog, buildProgramContext } from './lessonContext';
import { dungPrompt, THAM_SO_SINH } from './promptSuPham';
import { nhanhCuaHocSinh } from '../../research/thucNghiem';
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';
import { loiThanhChuoi } from './loiGemini';
import { xuLyTruocLuot } from './pedagogicalStateMachine';
import { docKey, coKeyRieng } from './keyRieng';
import { locTraLoi, timDapAnChoTin, type CauCoDapSo } from './chanRoDapSo';

/* ── Hai đường gọi AI, và thứ tự giữa chúng ──────────────────────────────────
   Đường CHÍNH: Firebase AI Logic (`giaSuFirebaseAI.ts`) — không mang khoá nào
   trong gói JS, chặn lạm dụng bằng App Check.
   Đường DỰ PHÒNG: khoá riêng của học sinh (`giaSuKeyRieng.ts`), CHỈ dùng khi
   đường chính báo hết hạn mức theo NGÀY. Hết theo PHÚT thì chờ vài chục giây
   là xong, không tiêu lượt của em.

   Đường dự phòng này từng bị bỏ ngày 14/09/2026 vì key nằm trần trong
   localStorage (`gemini_api_key_user`) và vì điều khoản Gemini API đòi người
   tạo khoá từ 18 tuổi. Chủ dự án cho quay lại ngày 20/09/2026, với ba ràng
   buộc: chỉ mời khi thật sự bị chặn, hướng dẫn nói rõ phải nhờ bố mẹ hoặc thầy
   cô tạo giúp, và khoá không bao giờ rời khỏi máy em. Khoá cũ còn sót vẫn bị
   xoá trong `donDepLuuTruCu()`; khoá mới dùng tên khác (`keyRieng.ts`). */

/* Gia sư có gọi được AI thật không. Bản build luôn có khoá reCAPTCHA của App
   Check; thiếu (máy dev chưa cấu hình) thì rơi về kịch bản mẫu. */
export const coGiaSuAI = (): boolean => RECAPTCHA_ENTERPRISE_SITE_KEY.length > 0;

/**
 * Xử lý chuỗi tin nhắn để định dạng thành mảng theo yêu cầu của Gemini API.
 * Gemini API yêu cầu alternating roles (user/model) và kết thúc bằng user.
 */
function buildGeminiHistory(history: ChatMessage[], currentUserMessage: string) {
  const geminiHistory = history.map((msg) => ({
    role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
    parts: [{ text: msg.content }],
  }));
  geminiHistory.push({ role: 'user', parts: [{ text: currentUserMessage }] });
  return geminiHistory;
}

/**
 * Đọc lỗi 429 của Gemini và nói cho học sinh biết phải làm gì.
 *
 * Bậc miễn phí có HAI hạn mức khác hẳn nhau, và cách xử lý cũng khác hẳn:
 *   - theo phút  -> chờ vài chục giây là hỏi tiếp được
 *   - theo NGÀY  -> hết sạch cho CẢ WEB, phải đợi sang ngày hôm sau
 *
 * Hạn mức tính theo PROJECT, không theo học sinh: thông báo không được nói
 * "em đã dùng hết", vì em có thể mới hỏi câu đầu tiên.
 *
 * Trả về chuỗi thông báo, hoặc '' nếu lỗi này không phải hết lượt.
 */
export const thongBaoHetLuot = (loi: string, coKeyRieng = false): string => {
  const m = (loi || '').toLowerCase();
  if (!(m.includes('429') || m.includes('quota') || m.includes('rate limit'))) return '';

  if (m.includes('perday')) {
    const chung = 'Gia sư AI đã dùng hết lượt trả lời trong ngày của toàn hệ thống, '
      + 'nên tạm thời chưa trả lời được. Lượt mới được cấp lại vào đầu ngày mai. '
      + 'Trong lúc chờ, em xem lại bài giảng hoặc làm phần luyện tập của bài này nhé.';
    /* Em đã có khoá riêng mà vẫn ra lỗi này thì chính khoá của em cũng hết
       lượt — chỉ lại cách lấy khoá lúc đó là vô nghĩa. */
    if (coKeyRieng) return chung;
    return chung
      + '\n\nNếu em muốn hỏi tiếp ngay hôm nay: nhờ bố mẹ hoặc thầy cô lấy giúp em một khoá '
      + 'miễn phí của Google tại aistudio.google.com, rồi dán vào mục "Khoá riêng của em" ngay '
      + 'dưới ô chat. Google yêu cầu người tạo khoá phải từ 18 tuổi, nên bước này để người lớn '
      + 'làm giúp em. Khoá đó cho em hạn mức riêng, không ai giành của ai, và chỉ nằm trong máy '
      + 'em thôi. Làm một lần là dùng được mãi, mất chừng hai phút. Trong lúc chờ, em cứ ôn tiếp '
      + 'phần luyện tập nhé — hỏi được hay chưa thì bài vẫn đang tiến.';
  }

  const giay = loi.match(/"retryDelay":\s*"(\d+)s"/)?.[1];
  return 'Gia sư đang nhận quá nhiều câu hỏi nên chạm giới hạn số câu mỗi phút. Em chờ khoảng '
    + (giay ? `${giay} giây` : 'một phút') + ' rồi hỏi lại nhé!';
};

/**
 * Diễn giải lỗi KẾT NỐI của lượt gọi gia sư thành câu nói cho học sinh.
 * Trả '' nếu không nhận ra loại lỗi — khi đó đường gọi rơi về kịch bản mẫu.
 *
 * Tách thành hàm thuần để `kiem-tra:het-luot` kiểm được từng loại lỗi mà không
 * cần trình duyệt, không cần mạng, không tốn lượt API.
 */
export const thongBaoLoiKetNoi = (chuoiLoi: string): string => {
  const msg = (chuoiLoi || '').toLowerCase();

  /* ── App Check bị khoá: bảo TẢI LẠI TRANG, đừng bảo thử lại ───────────────
     Đo trên bản đang chạy lúc 22:31 ngày 25/09/2026: một lượt đổi thẻ App
     Check trả 403 (nhất thời — cùng lúc đó tab khác vẫn đổi được thẻ, mã trả
     về 200). `@firebase/app-check` coi 403 là lỗi cấu hình nên TỰ KHOÁ 24 GIỜ
     (`appCheck/initial-throttle`) và từ đó không gửi thêm request nào; mọi
     lượt hỏi sau đi kèm thẻ rỗng và máy chủ trả 401.

     Khoá ấy chỉ sống trong MỘT phiên trang. Đo lại: tab đang kẹt "còn 23 giờ"
     sau khi F5 thì hỏi được ngay, trả lời trong khoảng 30 giây.

     Vì thế câu cũ "Em thử lại sau ít phút nhé" là lời khuyên SAI: bấm gửi lại
     trong cùng phiên trang thì hỏng cho tới hết buổi, mà em không biết vì sao.
     Phải nói đúng việc cần làm. */
  if (msg.includes('app check token is invalid') || msg.includes('appcheck/throttled')
      || msg.includes('initial-throttle') || msg.includes('attempts allowed again')) {
    return 'Thầy đang không xác thực được với máy chủ nên chưa trả lời được. '
      + 'Em TẢI LẠI TRANG (phím F5) rồi hỏi lại giúp thầy nhé — lỗi này không tự hết '
      + 'nếu em chỉ bấm gửi lại.';
  }

  /* Chờ quá hạn (xem `HAN_CHO_MS`) hoặc rớt mạng giữa chừng. Nói thật là lượt
     này không tới nơi, và bảo em gửi lại — im lặng rồi rơi sang kịch bản mẫu
     là tệ nhất: em tưởng đó là câu trả lời của thầy. */
  if (msg.includes('abort') || msg.includes('timeout') || msg.includes('network')
      || msg.includes('failed to fetch')) {
    return 'Lượt hỏi này chờ máy chủ lâu quá nên thầy đành dừng lại. Em bấm gửi lại câu hỏi '
      + 'giúp thầy nhé — nếu vẫn không được thì mạng đang chập chờn, em thử lại sau vài phút.';
  }

  /* Máy chủ Firebase AI Logic trả 5xx: lỗi bên Google, không phải lỗi của em
     và cũng không phải hết lượt. Đo ngày 21/09/2026 trên bản đang chạy. */
  if (/\[5\d\d\s/.test(chuoiLoi) || /"?status"?:\s*5\d\d/.test(chuoiLoi)
      || msg.includes('internal server error') || msg.includes('service unavailable')) {
    return 'Máy chủ của gia sư AI đang trục trặc (lỗi phía máy chủ, không phải do em). '
      + 'Em thử gửi lại sau một phút nhé; trong lúc chờ, em xem lại bài giảng hoặc làm phần luyện tập.';
  }

  if (msg.includes('firebasevertexai') || msg.includes('app check') || msg.includes('appcheck')) {
    return 'Gia sư AI đang tạm mất kết nối với máy chủ. Em thử lại sau ít phút nhé!';
  }

  return '';
};

/** Kết quả một lượt, kèm số đo cho telemetry. */
export interface KetQuaGiaSu {
  text: string;
  nhanh: 'socratic' | 'truc-tiep';
  /** Thời gian gọi mô hình thật (ms); không có khi không gọi mô hình */
  latencyMs?: number;
  modelName?: string;
  /** Nấc giàn giáo đã áp (0 = không bế tắc; 3 = từ lần 3 trở lên) */
  mucGoiY: 0 | 1 | 2 | 3;
  beTac: boolean;
  /** Mã phát hiện ngữ cảnh gian lận phòng thi và từ chối, không gọi mô hình */
  gianLan: boolean;
  /** Bộ chặn rò đáp số (P0-2) đã can thiệp vào lượt này */
  daChanRo?: boolean;
}

/** Nhãn gọn cho nhật ký lỗi — không chép toàn văn lỗi của nhà cung cấp. */
const loaiLoi = (msg: string): string => {
  if (msg.includes('429') || msg.includes('quota')) return msg.includes('perday') ? 'het-luot-ngay' : 'het-luot-phut';
  if (msg.includes('app check') || msg.includes('appcheck')) return 'app-check';
  if (msg.includes('firebasevertexai')) return 'ai-logic';
  return 'khac';
};

/* ── Đáp án của bài đang mở, cho bộ chặn rò (P0-2) ───────────────────────────
   Nhớ theo bài trong SUỐT PHIÊN, vì `getByLesson` tốn khoảng 80 lượt đọc mỗi
   lần gọi (nhiều nhất 230 ở bài 2 — đo 20/09/2026). Hỏi lại mỗi lượt chat thì
   một lớp 40 em học một tiết đã đủ vỡ hạn mức 50.000 lượt đọc/ngày; nhớ lại
   thì mỗi em mỗi bài chỉ tốn một lần.

   Đọc HỎNG thì nhớ mảng rỗng và KHÔNG thử lại: mất mạng giữa buổi mà cứ gọi
   lại mỗi lượt là vừa chậm vừa tốn. Bộ chặn khi đó không có đáp án để so —
   đúng giới hạn đã ghi trong báo cáo. */
const dapAnTheoBai = new Map<string, CauCoDapSo[]>();

async function layCauCoDapSo(lessonId: string): Promise<CauCoDapSo[]> {
  if (!lessonId || lessonId === 'global-advisor') return [];
  const daNho = dapAnTheoBai.get(lessonId);
  if (daNho) return daNho;
  try {
    const { BankFirestore } = await import('../../bank/bankStore');
    const cau = (await BankFirestore.getByLesson(lessonId))
      .filter(c => typeof c.num === 'number')
      .map(c => ({ q: c.q, num: c.num, tol: c.tol }));
    dapAnTheoBai.set(lessonId, cau);
    return cau;
  } catch {
    dapAnTheoBai.set(lessonId, []);
    return [];
  }
}

/**
 * Gọi gia sư cho một lượt: chạy máy trạng thái sư phạm trước, rồi mới gọi mô hình.
 */
export const generateAIResponseChiTiet = async (
  lessonId: string,
  userQuestion: string,
  history: ChatMessage[],
  userEmail: string = 'guest'
): Promise<KetQuaGiaSu> => {
  const nhanh = nhanhCuaHocSinh(userEmail);
  const truoc = xuLyTruocLuot(history, userQuestion, nhanh);
  const mucGoiY = Math.min(truoc.soLanBeTac, 3) as 0 | 1 | 2 | 3;
  const coBan = { nhanh, mucGoiY, beTac: truoc.soLanBeTac > 0, gianLan: truoc.laGianLan };

  /* Gian lận phòng thi: trả lời ngay, không tốn lượt gọi AI. */
  if (truoc.traLoiNgay) return { ...coBan, text: truoc.traLoiNgay };

  if (!coGiaSuAI()) {
    console.warn('Chưa cấu hình gia sư AI. Fallback sang mock service.');
    const { generateAIResponse: mockGenerate } = await import('./aiMockService');
    return { ...coBan, text: await mockGenerate(lessonId, userQuestion, history, userEmail) };
  }

  try {
    const formattedHistory = buildGeminiHistory(history, userQuestion);
    const latestMessage = formattedHistory.pop()?.parts[0].text || '';

    /* Nội dung bài đang mở; không mở bài nào (khung iChat chung) thì rỗng. */
    const nguCanhBai = buildLessonContext(lessonId);
    /* Danh mục mã bài LUÔN đính kèm, để nhãn ra đề mang đúng mã bài. */
    const danhMucBai = buildLessonCatalog();
    /* Không mở bài nào thì đưa dàn bài cả chương trình vào chỗ trống. */
    const danBaiChung = nguCanhBai ? '' : buildProgramContext();

    const dungYeuCau = (chiThiChan?: string) => ({
      model: GEMINI_MODEL_NAME,
      contents: formattedHistory.concat({ role: 'user' as const, parts: [{ text: latestMessage }] }),
      systemInstruction: [
        dungPrompt(nhanh),
        '='.repeat(60),
        danhMucBai,
        ...(nguCanhBai ? ['='.repeat(60), nguCanhBai] : []),
        ...(danBaiChung ? ['='.repeat(60), danBaiChung] : []),
        /* Chỉ dẫn của máy trạng thái đặt CUỐI CÙNG: gần lượt hỏi nhất, và câu
           lệnh đã dặn mục "TRẠNG THÁI" được ưu tiên hơn quy tắc bước. */
        ...(truoc.chiDanThem ? ['='.repeat(60), truoc.chiDanThem] : []),
        /* Chỉ thị của bộ chặn rò đứng sau cùng, chỉ có ở lượt sinh lại. */
        ...(chiThiChan ? ['='.repeat(60), chiThiChan] : []),
      ].join('\n\n'),
      temperature: THAM_SO_SINH.temperature,
      topP: THAM_SO_SINH.topP,
    });

    const goiMoHinh = async (chiThiChan?: string): Promise<string> => {
      try {
        return await (await import('./giaSuFirebaseAI')).hoiGeminiQuaFirebase(dungYeuCau(chiThiChan));
      } catch (loiChung) {
        /* Hạn mức chung hết theo NGÀY mà em đã tự lấy khoá riêng thì đi tiếp
           bằng khoá của em. Hết theo PHÚT thì KHÔNG đụng tới khoá riêng: chờ
           vài chục giây là hỏi được, tiêu lượt của em làm gì. */
        const s = loiThanhChuoi(loiChung).toLowerCase();
        const key = s.includes('perday') ? docKey() : null;
        if (!key) throw loiChung;
        return await (await import('./giaSuKeyRieng')).hoiGeminiBangKeyRieng(dungYeuCau(chiThiChan), key);
      }
    };

    const batDau = performance.now();
    let traLoi = await goiMoHinh();
    const latencyMs = Math.round(performance.now() - batDau);

    /* ── P0-2: chặn rò đáp số (22/09/2026) ─────────────────────────────────
       Đặt Ở ĐÂY chứ không ở component: cả ba đường gọi (Firebase AI Logic,
       khoá riêng của em, và mock) đều đi qua hàm này. Chặn ở component thì
       hai đường sau lọt.

       Dò trên bản ĐÃ GỠ NHÃN, không dò trên bản thô: nhãn ẩn mang số
       ([BUOC:A6] có số 6), mà đáp án của một số câu cũng là 6 hay 8 — dò
       trên bản thô là tự tạo ra báo động giả. Nhưng khi không rò thì trả lại
       bản THÔ, vì AppContext còn cần nhãn ra đề trong đó.

       CHỈ áp cho nhánh 'socratic'. Nhánh đối chứng 'truc-tiep' vốn được giao
       việc giảng thẳng kèm lời giải mẫu có đáp số — chặn cả hai nhánh là xoá
       mất đúng biến mà đề tài đang đo, và `kiem-tra:thuc-nghiem` sinh ra để
       canh cho hai nhánh chỉ khác nhau ở cách dạy. */
    let daChanRo = false;
    const dapAn = nhanh === 'socratic'
      ? timDapAnChoTin(userQuestion, await layCauCoDapSo(lessonId))
      : undefined;
    if (dapAn && traLoi) {
      const { tachNhanAn } = await import('./pedagogicalStateMachine');
      const loc = await locTraLoi({
        traLoi: tachNhanAn(traLoi).noiDung,
        dapAn,
        sinhLai: async (chiThi) => tachNhanAn(await goiMoHinh(chiThi)).noiDung,
      });
      if (loc.daChan) {
        daChanRo = true;
        traLoi = loc.noiDung;
        console.warn('[chanRoDapSo] đã chặn một lượt rò đáp số', {
          lessonId, dapAn: dapAn.num, mucGoiY, phaiDungDuPhong: loc.phaiDungDuPhong,
          luc: new Date().toISOString(),
        });
      }
    }

    if (traLoi) return { ...coBan, text: traLoi, latencyMs, modelName: GEMINI_MODEL_NAME, daChanRo };
    return {
      ...coBan, latencyMs, modelName: GEMINI_MODEL_NAME,
      text: 'Xin lỗi em, thầy/cô đang gặp chút sự cố kỹ thuật. Em có thể nhắc lại câu hỏi được không?',
    };
  } catch (error: unknown) {
    const chuoiLoi = loiThanhChuoi(error);
    const msg = chuoiLoi.toLowerCase();
    console.error('Lỗi khi gọi Gemini API:', error);

    ErrorLogService.logError({
      level: 'Lỗi API/AI Service',
      component: 'geminiTutorService',
      message: `Gọi Gemini lỗi: ${loaiLoi(msg)}`,
      userEmail,
    });

    const hetLuot = thongBaoHetLuot(chuoiLoi, coKeyRieng());
    if (hetLuot) return { ...coBan, text: hetLuot };

    /* Lỗi ở đường Firebase (App Check từ chối, AI Logic chưa bật, máy chủ lỗi)
       thì BÁO THẬT, không rơi sang kịch bản mẫu: kịch bản mẫu trông như AI trả
       lời, học sinh không biết là hỏng, và chủ dự án cũng không biết mà sửa. */
    const loiKetNoi = thongBaoLoiKetNoi(chuoiLoi);
    if (loiKetNoi) return { ...coBan, text: loiKetNoi };

    const { generateAIResponse: mockGenerate } = await import('./aiMockService');
    return { ...coBan, text: await mockGenerate(lessonId, userQuestion, history, userEmail) };
  }
};

/** Giữ chữ ký cũ cho nơi chỉ cần chuỗi trả lời. */
export const generateAIResponse = async (
  lessonId: string,
  userQuestion: string,
  history: ChatMessage[],
  userEmail: string = 'guest'
): Promise<string> => (await generateAIResponseChiTiet(lessonId, userQuestion, history, userEmail)).text;
