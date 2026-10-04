import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend, ThinkingLevel } from 'firebase/ai';
import { app } from '../../../core/services/firebase';
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';
import { HAN_CHO_MS } from './chuoiDuPhong';

/* Gọi Gemini qua Firebase AI Logic — đường MẶC ĐỊNH của bản build.

   Vì sao không gọi thẳng Gemini bằng key như trước: key phải nằm trong gói JS
   thì trình duyệt mới gọi được, và ngày 13/09/2026 nó đã nằm nguyên văn trên
   Netlify. Key dạng `AQ.` lại không giới hạn được theo website. Ở đây Firebase
   giữ quyền gọi Gemini phía máy chủ; trình duyệt chỉ nộp token App Check.

   Tệp này CHỈ được nạp động từ geminiTutorService (`await import(...)`):
   firebase/ai + app-check + reCAPTCHA chỉ tải khi có người hỏi gia sư, và
   script Node import geminiTutorService không kéo theo chúng. */

export interface YeuCauGiaSu {
  model: string;
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
  systemInstruction: string;
  temperature: number;
  topP: number;
}

let daBatAppCheck = false;

function batAppCheck(): void {
  if (daBatAppCheck) return;
  /* Máy dev không qua được reCAPTCHA (localhost cố ý KHÔNG nằm trong key).
     Debug token chỉ bật khi `npm run dev`; khi build `import.meta.env.DEV`
     là false nên cả nhánh bị cắt khỏi gói JS. */
  if (import.meta.env.DEV) {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: string | boolean })
      .FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_ENTERPRISE_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
  daBatAppCheck = true;
}

/* Hạn chờ một lượt hỏi, tính bằng mili giây.

   `@firebase/ai` để mặc định 180 giây. Đo ngày 21/09/2026: một lượt hỏi ở
   khung iChat mất 60–120 giây vì mô hình "suy nghĩ" trước khi trả lời, và
   trong suốt thời gian đó khung chat chỉ hiện "Thầy đang viết câu trả lời..."
   — học sinh (và ban giám khảo) không phân biệt được là chậm hay hỏng. Ba
   phút chờ thì lượt học coi như mất.

   Chọn 90 giây, đo trên máy thật ngày 21/09/2026: một lượt trả lời mất
   40–90 giây (thử với cả dàn bài chương trình lẫn bỏ dàn bài — không khác
   mấy, nên chậm là ở phía mô hình chứ không phải do câu lệnh dài). Đặt 45
   giây thì cắt mất những lượt lẽ ra sắp có câu trả lời; đặt 180 giây như mặc
   định thì học sinh ngồi nhìn "đang viết" tới ba phút. Khung chat có thêm
   dòng nhắc sau 15 giây để em biết là thầy vẫn đang nghĩ, không phải treo.
   Hằng số nằm ở chuoiDuPhong.ts từ 01/10/2026: cả chuỗi dùng chung một hạn. */

export async function hoiGeminiQuaFirebase(y: YeuCauGiaSu, hanChoMs: number = HAN_CHO_MS): Promise<string> {
  batAppCheck();
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: y.model,
    systemInstruction: y.systemInstruction,
    generationConfig: {
      temperature: y.temperature,
      topP: y.topP,
      /* Gia sư chỉ ĐẶT CÂU HỎI dẫn dắt, không giải bài hộ, nên phần "suy nghĩ"
         dài của mô hình gần như không thêm giá trị sư phạm mà đẩy thời gian
         chờ lên hàng phút. Hạ xuống mức thấp để lượt hỏi trả lời nhanh —
         `npm run kiem-tra:su-pham` vẫn canh chất lượng câu hỏi. */
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  }, { timeout: hanChoMs });
  const { response } = await model.generateContent({ contents: y.contents });
  // text() đã bỏ các phần "suy nghĩ" (thought) — giống response.text của @google/genai.
  return response.text();
}
