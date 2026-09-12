import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../../auth/types';
import { getSession } from './aiMockService';
import { ErrorLogService } from '../../../core/services/errorLog';
import { GEMINI_MODEL_NAME } from '../../../core/constants';
import { buildLessonContext, buildLessonCatalog, buildProgramContext } from './lessonContext';
import { dungPrompt } from './promptSuPham';
import { nhanhCuaHocSinh } from '../../research/thucNghiem';

/* Chuỗi này có THỂ là một API key không?

   Cố ý kiểm rất lỏng, và KHÔNG kiểm theo tiền tố. Google AI Studio đã đổi hình
   dạng key: key cũ bắt đầu bằng "AIza", key cấp gần đây bắt đầu bằng "AQ.".
   Bản trước chỉ nhận "AIza" nên người dùng dán một key MỚI hoàn toàn hợp lệ vào
   vẫn bị bỏ qua lặng lẽ — hộp thoại đóng như đã lưu xong mà gia sư thì vẫn chạy
   bằng key của web. Google còn có thể đổi hình dạng nữa, nên ở đây chỉ loại
   những thứ chắc chắn không phải key: chuỗi rỗng, chuỗi toàn dấu cách, chuỗi
   quá ngắn, hay cả một câu người dùng gõ nhầm vào ô.

   Đây là kiểm cho đỡ hỏng, KHÔNG phải kiểm bảo mật hay kiểm tính hợp lệ: key
   sai thì Google tự từ chối, và nút "Kiểm tra Key" mới là chỗ biết chắc.

   Tách riêng để hộp thoại cài đặt dùng CHUNG một luật với chỗ đọc key ở dưới. */
export const coDangKeyGoogle = (key: string): boolean => {
  const k = (key ?? '').trim();
  return k.length >= 20 && !/\s/.test(k);
};

// Get effective API key from localStorage or env
export const getEffectiveApiKey = (): string => {
  /* Key của người dùng được ưu tiên, nhưng chỉ khi nó TRÔNG như một key thật.

     Bản trước nhận bất cứ chuỗi nào khác rỗng. Một chuỗi rác — hay một chuỗi
     toàn dấu cách còn sót trong localStorage — vẫn đè lên key của web và làm
     gia sư câm hẳn, trong khi web thừa sức tự gọi được.

     Xem coDangKeyGoogle ở trên để biết "trông như key thật" nghĩa là gì và vì
     sao chỗ đó cố tình kiểm lỏng. */
  const userKey = (localStorage.getItem('gemini_api_key_user') ?? '').trim();
  if (coDangKeyGoogle(userKey)) return userKey;
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || 'MISSING_API_KEY';
};

// Create a new instance dynamically
const getAiInstance = () => {
  return new GoogleGenAI({ apiKey: getEffectiveApiKey() });
};


/* Câu lệnh hệ thống nay nằm ở promptSuPham.ts, tách theo nhánh thực nghiệm.
   Xem tệp đó để biết vì sao phải tách và ranh giới giữa hai nhánh ở đâu. */

/**
 * Xử lý chuỗi tin nhắn để định dạng thành mảng theo yêu cầu của Gemini API.
 * Gemini API yêu cầu alternating roles (user/model) và kết thúc bằng user.
 */
function buildGeminiHistory(history: ChatMessage[], currentUserMessage: string) {
  // Trích xuất history, mapping các sender thành role phù hợp
  const geminiHistory = history.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // Gắn thêm tin nhắn mới nhất
  geminiHistory.push({
    role: 'user',
    parts: [{ text: currentUserMessage }],
  });

  return geminiHistory;
}

/**
 * Đọc lỗi 429 của Gemini và nói cho học sinh biết phải làm gì.
 *
 * Bậc miễn phí có HAI hạn mức khác hẳn nhau, và cách xử lý cũng khác hẳn:
 *   - 5 lượt / phút  -> chờ vài chục giây là hỏi tiếp được
 *   - 20 lượt / NGÀY -> hết sạch, phải đợi sang ngày hôm sau
 *
 * Trước đây cả hai trường hợp đều báo chung "thử lại sau ít phút", nên học sinh
 * hết lượt của ngày sẽ ngồi bấm lại cả buổi mà không bao giờ được trả lời.
 *
 * Trả về chuỗi thông báo, hoặc '' nếu lỗi này không phải hết lượt.
 */
export const thongBaoHetLuot = (loi: string): string => {
  const m = (loi || '').toLowerCase();
  if (!(m.includes('429') || m.includes('quota') || m.includes('rate limit'))) return '';

  if (m.includes('perday')) {
    return 'Em đã dùng hết lượt hỏi miễn phí trong ngày của API key này rồi. '
      + 'Google cấp lại lượt mới vào đầu ngày hôm sau. '
      + 'Em chờ sang ngày mai, hoặc vào cài đặt ⚙️ để dùng một API key khác nhé!';
  }

  const giay = loi.match(/"retryDelay":\s*"(\d+)s"/)?.[1];
  return 'Em hỏi hơi nhanh nên chạm giới hạn số câu mỗi phút rồi. Em chờ khoảng '
    + (giay ? `${giay} giây` : 'một phút') + ' rồi hỏi lại nhé!';
};

/**
 * Hàm gọi API Gemini để lấy câu trả lời.
 */
export const generateAIResponse = async (
  lessonId: string,
  userQuestion: string,
  history: ChatMessage[],
  userEmail: string = 'guest'
): Promise<string> => {
  if (getEffectiveApiKey() === 'MISSING_API_KEY' || !getEffectiveApiKey()) {
    console.warn('Thiếu GEMINI_API_KEY. Fallback sang mock service.');
    // Lazy load mock service để tránh import circular hoặc phụ thuộc cứng
    const { generateAIResponse: mockGenerate } = await import('./aiMockService');
    return mockGenerate(lessonId, userQuestion, history, userEmail);
  }

  try {
    const formattedHistory = buildGeminiHistory(history, userQuestion);
    
    // Rút trích user message cuối ra khỏi history để truyền vào tham số message riêng
    const latestMessage = formattedHistory.pop()?.parts[0].text || '';

    /* Đính kèm nội dung bài học sinh đang mở. Không có bài nào khớp — ví dụ
       cuộc tư vấn chung — thì chuỗi rỗng và câu lệnh giữ nguyên như cũ. */
    const nguCanhBai = buildLessonContext(lessonId);

    /* Danh mục mã bài thì LUÔN đính kèm, kể cả ở cuộc tư vấn chung.
       Chính khung tư vấn chung mới là nơi học sinh hỏi lung tung về nhiều bài,
       nên đó là nơi cần mã bài nhất — mà lại là nơi `nguCanhBai` rỗng. */
    const danhMucBai = buildLessonCatalog();

    /* Không mở bài nào (khung iChat tư vấn chung) thì đưa DÀN BÀI CẢ CHƯƠNG
       TRÌNH thay vào chỗ trống đó.

       Trước đây khung này chỉ có danh mục TÊN 25 bài — thầy biết bài nào tồn
       tại nhưng không biết trong bài có gì, nên hỏi "cái này học ở bài nào"
       là phải đoán. Mà đây lại đúng là nơi học sinh hỏi vắt qua nhiều bài nhất.

       Khi ĐANG mở một bài thì KHÔNG kèm dàn bài: `nguCanhBai` đã có toàn văn
       bài đó rồi, thêm dàn bài chỉ làm loãng trọng tâm. */
    const danBaiChung = nguCanhBai ? '' : buildProgramContext();

    const response = await getAiInstance().models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: formattedHistory.concat({ role: 'user', parts: [{ text: latestMessage }] }),
      config: {
        systemInstruction: [
          /* Chia nhóm thực nghiệm ngay tại đây, chỗ duy nhất câu lệnh được ghép.
             Khi KHÔNG chạy nghiên cứu (mặc định) hàm này luôn trả 'socratic',
             tức là web chạy y như cũ. */
          dungPrompt(nhanhCuaHocSinh(userEmail)),
          '='.repeat(60),
          danhMucBai,
          ...(nguCanhBai ? ['='.repeat(60), nguCanhBai] : []),
          ...(danBaiChung ? ['='.repeat(60), danBaiChung] : []),
        ].join('\n\n'),
        temperature: 0.7, // Nhiệt độ vừa phải để sáng tạo nhưng vẫn giữ chuẩn kiến thức
        topP: 0.9,
      }
    });

    if (response.text) {
        return response.text;
    }
    
    return 'Xin lỗi em, thầy/cô đang gặp chút sự cố kỹ thuật. Em có thể nhắc lại câu hỏi được không?';
    
  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini API:', error);
    
    ErrorLogService.logError({
      level: 'Lỗi API/AI Service',
      component: 'geminiTutorService',
      message: error?.message || 'Lỗi gọi API Google GenAI',
      userEmail: userEmail
    });

    const msg = error?.message?.toLowerCase() || '';
    const hetLuot = thongBaoHetLuot(error?.message || '');
    if (hetLuot) return hetLuot;

    // Check for 400 bad request / Invalid API Key
    if (msg.includes('api_key_invalid') || msg.includes('api key not valid')) {
      return 'API key không hợp lệ. Vui lòng kiểm tra lại API key trong cài đặt ⚙️ nhé!';
    }

    // Fallback sang mock service nếu gọi thật bị lỗi (nhưng không phải do quota/key)
    const { generateAIResponse: mockGenerate } = await import('./aiMockService');
    return mockGenerate(lessonId, userQuestion, history, userEmail);
  }
};
