import { ChatMessage } from '../../auth/types';
import { ErrorLogService } from '../../../core/services/errorLog';
import { GEMINI_MODEL_NAME } from '../../../core/constants';
import { buildLessonContext, buildLessonCatalog, buildProgramContext } from './lessonContext';
import { dungPrompt, THAM_SO_SINH } from './promptSuPham';
import { nhanhCuaHocSinh } from '../../research/thucNghiem';
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';
import { loiThanhChuoi } from './loiGemini';
import { xuLyTruocLuot } from './pedagogicalStateMachine';

/* ── Không còn đường "key riêng người dùng tự nhập" (bỏ ngày 14/09/2026) ──────
   Trước đây học sinh được dán API key Gemini của chính mình; key nằm trần trong
   localStorage (`gemini_api_key_user`), và thông báo hết lượt còn khuyên em
   "vào cài đặt để dùng một API key khác". Hai vấn đề: key lộ trên máy dùng
   chung, và điều khoản Gemini API cấm ứng dụng dành cho người dưới 18 tuổi —
   xui học sinh lớp 11 tự tạo key là đẩy các em vào đúng chỗ đó.
   Nay web chỉ còn MỘT đường: Firebase AI Logic (giaSuFirebaseAI.ts). Key cũ còn
   sót trên máy được xoá trong `donDepLuuTruCu()` (core/services/storage.ts). */

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
export const thongBaoHetLuot = (loi: string): string => {
  const m = (loi || '').toLowerCase();
  if (!(m.includes('429') || m.includes('quota') || m.includes('rate limit'))) return '';

  if (m.includes('perday')) {
    return 'Gia sư AI đã dùng hết lượt trả lời trong ngày của toàn hệ thống, '
      + 'nên tạm thời chưa trả lời được. Lượt mới được cấp lại vào đầu ngày mai. '
      + 'Trong lúc chờ, em xem lại bài giảng hoặc làm phần luyện tập của bài này nhé.';
  }

  const giay = loi.match(/"retryDelay":\s*"(\d+)s"/)?.[1];
  return 'Gia sư đang nhận quá nhiều câu hỏi nên chạm giới hạn số câu mỗi phút. Em chờ khoảng '
    + (giay ? `${giay} giây` : 'một phút') + ' rồi hỏi lại nhé!';
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
}

/** Nhãn gọn cho nhật ký lỗi — không chép toàn văn lỗi của nhà cung cấp. */
const loaiLoi = (msg: string): string => {
  if (msg.includes('429') || msg.includes('quota')) return msg.includes('perday') ? 'het-luot-ngay' : 'het-luot-phut';
  if (msg.includes('app check') || msg.includes('appcheck')) return 'app-check';
  if (msg.includes('firebasevertexai')) return 'ai-logic';
  return 'khac';
};

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

    const yeuCau = {
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
      ].join('\n\n'),
      temperature: THAM_SO_SINH.temperature,
      topP: THAM_SO_SINH.topP,
    };

    const batDau = performance.now();
    const traLoi = await (await import('./giaSuFirebaseAI')).hoiGeminiQuaFirebase(yeuCau);
    const latencyMs = Math.round(performance.now() - batDau);

    if (traLoi) return { ...coBan, text: traLoi, latencyMs, modelName: GEMINI_MODEL_NAME };
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

    const hetLuot = thongBaoHetLuot(chuoiLoi);
    if (hetLuot) return { ...coBan, text: hetLuot };

    /* Lỗi ở đường Firebase (App Check từ chối, AI Logic chưa bật, máy chủ lỗi)
       thì BÁO THẬT, không rơi sang kịch bản mẫu: kịch bản mẫu trông như AI trả
       lời, học sinh không biết là hỏng, và chủ dự án cũng không biết mà sửa. */
    if (msg.includes('firebasevertexai') || msg.includes('app check') || msg.includes('appcheck')) {
      return { ...coBan, text: 'Gia sư AI đang tạm mất kết nối với máy chủ. Em thử lại sau ít phút nhé!' };
    }

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
