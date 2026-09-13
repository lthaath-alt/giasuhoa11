/* Gộp một lỗi gọi Gemini thành MỘT chuỗi để thongBaoHetLuot đọc.

   Vì sao cần: `@google/genai` nhét cả JSON lỗi (quotaId, retryDelay) vào
   `message`. `firebase/ai` thì KHÔNG — message chỉ có "[429 Too Many
   Requests] …", còn quotaId và retryDelay nằm trong `customErrorData.
   errorDetails` (đọc từ mã nguồn @firebase/ai 12.16.0). Đọc mỗi `message`
   thì hết lượt NGÀY bị báo thành hết lượt PHÚT, và học sinh ngồi bấm lại cả
   buổi — đúng lỗi mà thongBaoHetLuot sinh ra để chặn.

   Tệp này cố ý không import gì, để script Node gọi được. */
export const loiThanhChuoi = (loi: unknown): string => {
  const e = loi as { message?: unknown; customErrorData?: unknown } | null | undefined;
  const message = typeof e?.message === 'string' ? e.message : String(loi ?? '');
  return e?.customErrorData ? `${message} ${JSON.stringify(e.customErrorData)}` : message;
};
