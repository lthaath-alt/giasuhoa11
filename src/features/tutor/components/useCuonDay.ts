import { useCallback, useEffect, useRef, useState } from 'react';

/* Cuộn khung chat xuống tin mới nhất, nhưng KHÔNG giật em về đáy khi em đang
   kéo lên đọc lại bài (03/10/2026).

   Bản cũ trong TutorChat cuộn trong một effect phụ thuộc mảng tin vừa lọc —
   mảng đó mới tinh sau mỗi lần render, nên gõ một phím, hay đồng hồ khoá tạm
   đếm mỗi giây, cũng kéo em về đáy. Ở đây chỉ cuộn khi SỐ TIN hoặc trạng thái
   gửi đổi, và chỉ khi em đang ở gần đáy; em tự gửi tin thì luôn cuộn.
   iChat (DashboardPage) dùng chung hook này. */

/** Cách đáy bao nhiêu px thì vẫn coi là "đang ở đáy". */
const NGUONG_GAN_DAY = 120;

const giamChuyenDong = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * @param soTin  số tin đang hiện
 * @param dangGui đang chờ gia sư trả lời
 * @param khoa   đổi khoá (đổi bài, mở lại tab) là cuộn thẳng xuống đáy như lúc mới mở
 */
export function useCuonDay(soTin: number, dangGui: boolean, khoa: string) {
  const khungRef = useRef<HTMLDivElement>(null);
  const ganDay = useRef(true);
  /* Khoá đã cuộn lần đầu. Khung chưa gắn vào trang (tab iChat đang đóng) thì
     đặt lại, để lần mở sau vẫn xuống đáy. */
  const khoaDaCuon = useRef<string | null>(null);
  /* Hạn chót của lần tự cuộn đang chạy. Cuộn mượt phát nhiều sự kiện scroll
     giữa chừng, lúc còn xa đáy; không bỏ qua chúng thì nút "Tin mới nhất" nháy
     lên và tin tới giữa chừng không được cuộn theo. */
  const tuCuonDen = useRef(0);
  const [xaDay, setXaDay] = useState(false);

  const cuonXuong = useCallback((muot = true) => {
    const k = khungRef.current;
    if (!k) return;
    /* Đặt cờ ngay, không chờ sự kiện scroll: trình duyệt chỉ phát sự kiện đó
       khi vẽ khung hình, mà tab ẩn thì không vẽ (đo 03/10/2026). */
    ganDay.current = true;
    setXaDay(false);
    tuCuonDen.current = Date.now() + 800;
    k.scrollTo({ top: k.scrollHeight, behavior: muot && !giamChuyenDong() ? 'smooth' : 'auto' });
  }, []);

  const khiCuon = useCallback(() => {
    const k = khungRef.current;
    if (!k) return;
    const gan = k.scrollHeight - k.scrollTop - k.clientHeight < NGUONG_GAN_DAY;
    if (!gan && Date.now() < tuCuonDen.current) return;
    ganDay.current = gan;
    setXaDay(!gan);
  }, []);

  useEffect(() => {
    if (!khungRef.current) {
      khoaDaCuon.current = null;
      return;
    }
    if (khoaDaCuon.current !== khoa) {
      if (soTin === 0) return; // lịch sử chưa tải về
      khoaDaCuon.current = khoa;
      cuonXuong(false);
      return;
    }
    if (ganDay.current || dangGui) cuonXuong();
  }, [soTin, dangGui, khoa, cuonXuong]);

  return { khungRef, khiCuon, xaDay, cuonXuong };
}
