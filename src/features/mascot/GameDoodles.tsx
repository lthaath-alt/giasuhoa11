import React from 'react';
import { Box } from '@mui/material';

/* Hoạ tiết game retro rải quanh mục Trò chơi, sắp theo đúng bản phác của
   người dùng: hàng trên là LET'S PLAY / ngôi sao / cần điều khiển / chuột,
   giữa là Mario và chữ GAMER, hàng dưới là tay cầm / nấm / máy cầm tay.

   Khác với hình vẽ hoá học ở trang Giới thiệu (nét mờ, nằm sau nội dung),
   mấy hoạ tiết này là ảnh dán đè LÊN TRÊN như miếng sticker — đúng kiểu trong
   ảnh mẫu. Vì nằm trên nên bắt buộc phải có pointerEvents:'none', nếu không
   sẽ chặn mất nút "Chơi ngay" phía dưới. */

const THU_MUC = '/mascot/game/';

interface Mon {
  tep: string;
  ten: string;
  rong: number;
  top?: number | string;
  bottom?: number | string;
  left?: string;
  right?: string;
  xoay?: number;
  /** Ngưỡng bề ngang màn hình tối thiểu để hiện. Hẹp hơn thì ẩn cho đỡ rối. */
  tuKho?: 'sm' | 'md' | 'lg';
}

/* Hàng trên xếp theo DÒNG CHẢY cạnh nhân vật chứ không đặt tuyệt đối.

   Lý do: bong bóng thoại của nhân vật nằm trong dòng chảy, nên mép phải của
   nó dịch theo bề rộng container VÀ theo độ dài câu thoại bốc ngẫu nhiên
   (câu dài nhất rộng hơn câu ngắn nhất 109px). Trong khi đó vị trí đặt theo
   phần trăm lại chạy theo bề rộng MÀN HÌNH. Hai thứ khác nhịp nên khổ nào
   cũng có thể đụng — đo ở 1024 thì "Let's Play" đè lên bong bóng 65px.
   Giao cho flex tự chia chỗ thì hết hẳn loại lỗi này.

   `mt` lệch nhau để hàng không thẳng đơ như bảng biểu. */
const HANG_TREN: { tep: string; ten: string; rong: number; mt: number; xoay?: number; tuKho?: 'md' | 'lg' }[] = [
  { tep: 'lets-play.png', ten: "Chữ Let's Play kiểu pixel", rong: 128, mt: 2 },
  { tep: 'ngoi-sao.png', ten: 'Ngôi sao trò chơi', rong: 100, mt: -4, xoay: -6 },
  { tep: 'can-dieu-khien.png', ten: 'Cần điều khiển', rong: 84, mt: 20, tuKho: 'lg' },
  { tep: 'chuot.png', ten: 'Chuột máy tính', rong: 90, mt: 4, xoay: 8 },
];

const DS: Mon[] = [
  // ---- giữa: đè lên mép trên lưới thẻ ----
  /* Mario nằm ngang tầm dòng tiêu đề "Học Hóa 11 Qua Trò Chơi". Chữ tiêu đề
     rộng cố định 373px (đo được: x 48→421) còn 27% thì co theo màn hình, nên
     ở khổ 1024 anh ta tụt vào đúng chữ. Chặn sàn 440px để luôn đứng bên phải,
     chừa thêm chút khoảng hở. */
  { tep: 'mario.png', ten: 'Nhân vật pixel đang chạy', rong: 112, top: 148, left: 'max(440px, 27%)', tuKho: 'md' },
  { tep: 'gamer.png', ten: 'Chữ Gamer kiểu pixel', rong: 118, top: 116, left: '51%', xoay: -4, tuKho: 'lg' },

  // ---- hàng dưới ----
  /* Hai món này trước đây đặt lấn ra ngoài mép (left:-1%, bottom:-6) nên bị
     `overflow:hidden` của lớp xén mất một góc, nhìn như cắt thiếu. Kéo vào
     trong hẳn. */
  { tep: 'tay-cam.png', ten: 'Tay cầm chơi game', rong: 106, bottom: 18, left: 'max(10px, 0.5%)', xoay: -8, tuKho: 'sm' },
  { tep: 'nam.png', ten: 'Nấm 1-up', rong: 84, bottom: 8, left: '57%', tuKho: 'md' },
  { tep: 'may-cam-tay.png', ten: 'Máy chơi game cầm tay', rong: 74, bottom: 12, right: '2%', xoay: 6, tuKho: 'sm' },
];

/* ---- Mấy món vẽ thêm cho dải trống bên dưới lưới thẻ ----
   Ảnh của người dùng chỉ có 9 món, dùng hết ở trên rồi. Lặp lại y hệt thì
   nhìn cụt, nên vẽ thêm bằng SVG — vẫn đen đặc cho khớp với ngôi sao, tay
   cầm, chuột trong bộ ảnh gốc. */
const o = 6; // cạnh một ô pixel
const px = (luoi: string[]) =>
  luoi.flatMap((hang, y) =>
    [...hang].map((c, x) =>
      c === '#' ? <rect key={`${x}-${y}`} x={x * o} y={y * o} width={o} height={o} /> : null,
    ),
  );

const TRAI_TIM = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const CHU_THAP = ['.###.', '.###.', '#####', '#####', '.###.', '.###.'];

const VE_THEM: { ten: string; rong: number; left?: string; right?: string; bottom: number; xoay?: number; hinh: React.ReactNode }[] = [
  {
    ten: 'trai-tim', rong: 46, left: '9%', bottom: 34, xoay: -10,
    hinh: <svg viewBox={`0 0 ${7 * o} ${6 * o}`} width="100%" fill="currentColor">{px(TRAI_TIM)}</svg>,
  },
  {
    ten: 'dong-xu', rong: 44, left: '27%', bottom: 62,
    hinh: (
      <svg viewBox="0 0 48 48" width="100%" fill="none" stroke="currentColor" strokeWidth={6}>
        <circle cx="24" cy="24" r="19" />
        <path d="M24 12 L24 36" />
      </svg>
    ),
  },
  {
    ten: 'khoi-hoi', rong: 52, left: '48%', bottom: 30, xoay: 6,
    hinh: (
      <svg viewBox="0 0 52 52" width="100%">
        <rect x="3" y="3" width="46" height="46" rx="4" fill="none" stroke="currentColor" strokeWidth={6} />
        <text x="26" y="28" textAnchor="middle" dominantBaseline="central" fontSize="26"
              fontWeight={800} fill="currentColor">?</text>
      </svg>
    ),
  },
  {
    ten: 'nut-huong', rong: 40, right: '11%', bottom: 48, xoay: -8,
    hinh: <svg viewBox={`0 0 ${5 * o} ${6 * o}`} width="100%" fill="currentColor">{px(CHU_THAP)}</svg>,
  },
];

/* Đung đưa nhẹ và chậm: nhấc lên 7px kèm nghiêng 1,5° rồi trở lại, một vòng
   6–9 giây. Mỗi món một nhịp và một điểm xuất phát khác nhau (độ trễ âm) để
   cả đám không nhấp nhô đồng loạt như bảng đèn.
   Ai bật "giảm chuyển động" trong hệ điều hành thì đứng yên hoàn toàn. */
const NHIP = {
  '@keyframes gameDungDua': {
    '0%, 100%': { transform: 'translateY(0) rotate(-1.5deg)' },
    '50%': { transform: 'translateY(-7px) rotate(1.5deg)' },
  },
};

const dungDua = (k: number) => ({
  animation: `gameDungDua ${6 + (k % 4) * 1}s ease-in-out ${-(k * 0.9).toFixed(1)}s infinite`,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

const HIEN: Record<NonNullable<Mon['tuKho']>, object> = {
  sm: { display: { xs: 'none', sm: 'block' } },
  md: { display: { xs: 'none', md: 'block' } },
  lg: { display: { xs: 'none', lg: 'block' } },
};

export const GameDoodles: React.FC = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: 'absolute',
      inset: 0,
      zIndex: 2,          // nằm trên lưới thẻ, giống ảnh mẫu
      pointerEvents: 'none',
      userSelect: 'none',
      overflow: 'hidden', // hình thò ra ngoài không được đẻ ra thanh cuộn ngang
      ...NHIP,
    }}
  >
    {DS.map((m, k) => (
      /* Hai lớp: lớp ngoài lo đung đưa, lớp trong giữ góc nghiêng tĩnh. Gộp
         một lớp thì animation ghi đè `transform` làm mất góc nghiêng. */
      <Box key={m.tep} sx={{ ...dungDua(k), position: 'absolute', top: m.top, bottom: m.bottom, left: m.left, right: m.right, ...HIEN[m.tuKho ?? 'sm'] }}>
        <Box
          component="img"
          src={THU_MUC + m.tep}
          alt=""
          draggable={false}
          sx={{
            display: 'block',
            width: m.rong,
            height: 'auto',
            transform: m.xoay ? `rotate(${m.xoay}deg)` : undefined,
          }}
        />
      </Box>
    ))}
  </Box>
);

/* Hàng hoạ tiết nằm cùng dòng với nhân vật, chiếm nốt chỗ trống bên phải
   bong bóng thoại. Đặt `flex: 1` + `space-around` để tự giãn theo chỗ còn
   lại, khỏi tính toán phần trăm. */
export const GameDoodlesTren: React.FC = () => (
  <Box
    aria-hidden="true"
    sx={{
      flex: 1,
      minWidth: 0,
      display: { xs: 'none', md: 'flex' },
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      pointerEvents: 'none',
      userSelect: 'none',
      ...NHIP,
    }}
  >
    {HANG_TREN.map((m, k) => (
      <Box
        key={m.tep}
        sx={{
          ...dungDua(k),
          mt: `${m.mt}px`,
          flexShrink: 0,
          ...(m.tuKho === 'lg' ? { display: { xs: 'none', lg: 'block' } } : null),
        }}
      >
        <Box
          component="img"
          src={THU_MUC + m.tep}
          alt=""
          draggable={false}
          sx={{ display: 'block', width: m.rong, height: 'auto', transform: m.xoay ? `rotate(${m.xoay}deg)` : undefined }}
        />
      </Box>
    ))}
  </Box>
);

/* Dải trang trí cho khoảng trống bên dưới lưới thẻ. Để riêng chứ không gộp
   vào GameDoodles: gộp thì mấy món này neo cùng đáy với tay cầm / nấm / máy
   cầm tay, thành ra chồng lên lưới thẻ thay vì nằm ở chỗ trống bên dưới. */
export const GameDoodlesDuoi: React.FC = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: 'relative',
      height: { xs: 0, md: 150 },
      pointerEvents: 'none',
      userSelect: 'none',
      overflow: 'hidden',
      ...NHIP,
    }}
  >
    {VE_THEM.map((v, k) => (
      <Box
        key={v.ten}
        sx={{
          ...dungDua(k + 2),   // lệch pha so với hàng hoạ tiết phía trên
          position: 'absolute',
          bottom: v.bottom,
          left: v.left,
          right: v.right,
          width: v.rong,
          color: '#101828',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Box sx={{ transform: v.xoay ? `rotate(${v.xoay}deg)` : undefined }}>{v.hinh}</Box>
      </Box>
    ))}
  </Box>
);
