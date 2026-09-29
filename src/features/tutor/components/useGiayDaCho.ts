import { useEffect, useState } from 'react';

/* Đếm số giây đã chờ một lượt trả lời của gia sư.
 *
 * Vì sao cần (21/09/2026): đo trên máy thật, một lượt hỏi mất 40–90 giây. Suốt
 * thời gian đó khung chat chỉ hiện đúng một dòng "Thầy đang viết câu trả
 * lời..." không đổi, nên không phân biệt được "đang nghĩ" với "đã treo" — lần
 * thử ngày 21/09/2026 trên bản đang chạy, người thử bỏ cuộc sau ba phút vì
 * tưởng web hỏng. Hiện thêm số giây là cách rẻ nhất để nói: vẫn đang chạy.
 */
export function useGiayDaCho(dangCho: boolean): number {
  const [giay, setGiay] = useState(0);

  useEffect(() => {
    if (!dangCho) { setGiay(0); return; }
    const batDau = Date.now();
    setGiay(0);
    const dem = setInterval(() => setGiay(Math.floor((Date.now() - batDau) / 1000)), 1000);
    return () => clearInterval(dem);
  }, [dangCho]);

  return giay;
}

/** Dòng chữ hiện trong lúc chờ — im lặng lúc đầu, nói rõ khi chờ lâu. */
export function chuDangCho(giay: number, mac = 'Chemai đang viết câu trả lời...'): string {
  if (giay < 15) return mac;
  if (giay < 45) return `${mac} (${giay} giây — câu này thầy cần nghĩ lâu hơn chút)`;
  return `${mac} (${giay} giây — nếu quá lâu, em cứ gửi lại câu hỏi nhé)`;
}
