/**
 * Gọi Gemini bằng khoá riêng của học sinh — đường DỰ PHÒNG khi hạn mức chung
 * của cả web đã hết trong ngày.
 *
 * Cố ý nhận đúng `YeuCauGiaSu` như đường Firebase AI Logic, và trả về đúng một
 * chuỗi, để hai đường cho ra cùng một thứ. Chỗ gọi không cần biết lượt này đi
 * đường nào.
 *
 * Khoá KHÔNG bao giờ được ghi ra ngoài máy em: không log, không telemetry,
 * không Firestore. Xem `keyRieng.ts`.
 */
import { GoogleGenAI } from '@google/genai';
import type { YeuCauGiaSu } from './giaSuFirebaseAI';

export async function hoiGeminiBangKeyRieng(y: YeuCauGiaSu, key: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: key });
  const r = await ai.models.generateContent({
    model: y.model,
    contents: y.contents,
    config: {
      systemInstruction: y.systemInstruction,
      temperature: y.temperature,
      topP: y.topP,
    },
  });
  return r.text ?? '';
}
