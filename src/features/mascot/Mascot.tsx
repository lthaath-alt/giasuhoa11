import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

/* Nhân vật dẫn đường của trang. Hai kiểu dùng:
   - MascotToanThan: đứng ở lề trái trang Giới thiệu, bong bóng thoại phía trên.
   - MascotDauVai:   chỉ ló đầu + vai, xếp trong dòng nội dung ở tab Bài giảng
                     và Trò chơi, bong bóng thoại nằm bên phải.

   Ảnh đặt trong public/mascot nên đường dẫn tuyệt đối từ gốc site. */

const ANH_TOAN_THAN = '/mascot/mascot-toanthan.png';
const ANH_DAU_VAI = '/mascot/mascot-dauvai.png';

export type TabMascot = 'gioithieu' | 'baigiang' | 'trochoi';

/* Mỗi lần vào trang bốc ngẫu nhiên một câu cho đỡ nhàm. */
const LOI_THOAI: Record<TabMascot, string[]> = {
  gioithieu: [
    'Cùng học thôi nào!',
    'Hôm nay mình học gì nè?',
    'Mở sách ra thôi!',
    'Hoá 11 không khó đâu!',
  ],
  baigiang: [
    'Bắt tay vào học thôi!',
    'Chọn bài mình thích đi!',
    'Học từng bài một là ổn mà!',
  ],
  trochoi: [
    'Học rồi thì chơi tí cho nhớ lâu!',
    'Chơi mà học, học mà chơi!',
    'Thử sức một ván nào!',
  ],
};

const dungLoiThoai = (tab: TabMascot) => {
  const ds = LOI_THOAI[tab];
  return ds[Math.floor(Math.random() * ds.length)];
};

/* Nhịp thở nhẹ — nhún lên xuống 4,5 giây một vòng. Ai bật "giảm chuyển động"
   trong hệ điều hành thì đứng yên. */
const NHIP_THO = {
  '@keyframes mascotTho': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-7px)' },
  },
  animation: 'mascotTho 4.5s ease-in-out infinite',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
} as const;

/* Bong bóng thoại. `huong` quyết định đuôi nhọn chỉ xuống dưới hay sang trái. */
const BongBong: React.FC<{ loi: string; huong: 'duoi' | 'trai' }> = ({ loi, huong }) => (
  <Box
    sx={{
      position: 'relative',
      bgcolor: '#ffffff',
      border: '2px solid #0062b8',
      borderRadius: 3,
      px: 2,
      py: 1.15,
      boxShadow: '0 4px 14px rgba(0,98,184,0.13)',
      /* Điện thoại hẹp không đủ chỗ cho câu dài nằm một dòng (ví dụ câu ở tab
         Trò chơi), nên chặn bề ngang và cho xuống dòng. Từ 600px trở lên mới
         giữ một dòng cho gọn. */
      maxWidth: { xs: 170, sm: 'none' },
      // Đuôi nhọn: một ô vuông xoay 45° nhô ra, che nét viền phía trong đi.
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 12,
        height: 12,
        bgcolor: '#ffffff',
        borderRight: '2px solid #0062b8',
        borderBottom: '2px solid #0062b8',
        ...(huong === 'duoi'
          ? { bottom: -8, left: '50%', ml: '-6px', transform: 'rotate(45deg)' }
          : { left: -8, top: '50%', mt: '-6px', transform: 'rotate(135deg)' }),
      },
    }}
  >
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: { xs: 13, md: 14.5 },
        lineHeight: 1.35,
        color: '#0f172a',
        whiteSpace: { xs: 'normal', sm: 'nowrap' },
      }}
    >
      {loi}
    </Typography>
  </Box>
);

/* ---------- Kiểu 1: đứng toàn thân ở lề trái ---------- */
export const MascotToanThan: React.FC<{ tab?: TabMascot; rong?: number }> = ({
  tab = 'gioithieu',
  rong = 230,
}) => {
  const loi = useMemo(() => dungLoiThoai(tab), [tab]);
  /* Từ 1536px trở lên lề rộng ra gần 300px, để nguyên 215px thì nhân vật lọt
     thỏm và chữ trên quyển sách bé tí. Phóng thêm 20% cho tương xứng. */
  const beRong = { xs: rong, xl: Math.round(rong * 1.2) };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: beRong }}>
      <Box sx={{ mb: 1.5 }}>
        <BongBong loi={loi} huong="duoi" />
      </Box>
      <Box
        component="img"
        src={ANH_TOAN_THAN}
        alt="Bạn học đồng hành của Gia Sư Hoá Học 11"
        draggable={false}
        /* Không dùng loading="lazy": nhân vật nằm ngay đầu trang, để lazy thì
           chỗ đứng bị trống một nhịp rồi ảnh mới nhảy vào. aspectRatio giữ sẵn
           đúng khoảng cho ảnh nên trang không bị xô lệch lúc tải. */
        sx={{
          width: beRong,
          aspectRatio: '460 / 969',
          height: 'auto',
          display: 'block',
          ...NHIP_THO,
        }}
      />
    </Box>
  );
};

/* ---------- Kiểu 2: ló đầu + vai, xếp trong dòng nội dung ---------- */
export const MascotDauVai: React.FC<{ tab: TabMascot; rong?: number }> = ({ tab, rong = 96 }) => {
  const loi = useMemo(() => dungLoiThoai(tab), [tab]);
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        // Ảnh cắt ngang ngực nên để sát đáy khối, trông như đang nhô lên.
        alignSelf: 'flex-end',
      }}
    >
      <Box
        component="img"
        src={ANH_DAU_VAI}
        alt="Bạn học đồng hành của Gia Sư Hoá Học 11"
        draggable={false}
        sx={{
          // Thu nhỏ trên điện thoại để còn chỗ cho bong bóng thoại bên cạnh.
          width: { xs: Math.round(rong * 0.8), sm: rong },
          aspectRatio: '240 / 307',
          height: 'auto',
          display: 'block',
          flexShrink: 0,
          ...NHIP_THO,
        }}
      />
      <BongBong loi={loi} huong="trai" />
    </Box>
  );
};
