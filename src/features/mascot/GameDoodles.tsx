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

const DS: Mon[] = [
  // ---- hàng trên: khoảng trống bên phải bong bóng thoại của nhân vật ----
  { tep: 'lets-play.png', ten: "Chữ Let's Play kiểu pixel", rong: 128, top: 4, left: '31%', tuKho: 'md' },
  { tep: 'ngoi-sao.png', ten: 'Ngôi sao trò chơi', rong: 100, top: 0, left: '47%', xoay: -6, tuKho: 'md' },
  { tep: 'can-dieu-khien.png', ten: 'Cần điều khiển', rong: 84, top: 28, left: '63%', tuKho: 'lg' },
  { tep: 'chuot.png', ten: 'Chuột máy tính', rong: 90, top: 2, right: '3%', xoay: 8, tuKho: 'md' },

  // ---- giữa: đè lên mép trên lưới thẻ ----
  /* Mario nằm ngang tầm dòng tiêu đề "Học Hóa 11 Qua Trò Chơi". Chữ tiêu đề
     rộng cố định 373px (đo được: x 48→421) còn 27% thì co theo màn hình, nên
     ở khổ 1024 anh ta tụt vào đúng chữ. Chặn sàn 440px để luôn đứng bên phải,
     chừa thêm chút khoảng hở. */
  { tep: 'mario.png', ten: 'Nhân vật pixel đang chạy', rong: 112, top: 148, left: 'max(440px, 27%)', tuKho: 'md' },
  { tep: 'gamer.png', ten: 'Chữ Gamer kiểu pixel', rong: 118, top: 116, left: '51%', xoay: -4, tuKho: 'lg' },

  // ---- hàng dưới ----
  { tep: 'tay-cam.png', ten: 'Tay cầm chơi game', rong: 106, bottom: 8, left: '-1%', xoay: -8, tuKho: 'sm' },
  { tep: 'nam.png', ten: 'Nấm 1-up', rong: 84, bottom: -6, left: '57%', tuKho: 'md' },
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
    }}
  >
    {DS.map((m) => (
      <Box
        key={m.tep}
        component="img"
        src={THU_MUC + m.tep}
        alt=""
        draggable={false}
        sx={{
          position: 'absolute',
          top: m.top,
          bottom: m.bottom,
          left: m.left,
          right: m.right,
          width: m.rong,
          height: 'auto',
          transform: m.xoay ? `rotate(${m.xoay}deg)` : undefined,
          ...HIEN[m.tuKho ?? 'sm'],
        }}
      />
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
    }}
  >
    {VE_THEM.map((v) => (
      <Box
        key={v.ten}
        sx={{
          position: 'absolute',
          bottom: v.bottom,
          left: v.left,
          right: v.right,
          width: v.rong,
          color: '#101828',
          transform: v.xoay ? `rotate(${v.xoay}deg)` : undefined,
          display: { xs: 'none', md: 'block' },
        }}
      >
        {v.hinh}
      </Box>
    ))}
  </Box>
);
