import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from '../../../core/services/firebase';
import { RECAPTCHA_ENTERPRISE_SITE_KEY } from '../../../core/services/firebaseCongKhai';

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

export async function hoiGeminiQuaFirebase(y: YeuCauGiaSu): Promise<string> {
  batAppCheck();
  const ai = getAI(app, { backend: new GoogleAIBackend() });
  const model = getGenerativeModel(ai, {
    model: y.model,
    systemInstruction: y.systemInstruction,
    generationConfig: { temperature: y.temperature, topP: y.topP },
  });
  const { response } = await model.generateContent({ contents: y.contents });
  // text() đã bỏ các phần "suy nghĩ" (thought) — giống response.text của @google/genai.
  return response.text();
}
