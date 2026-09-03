import React from 'react';
import { Box } from '@mui/material';
import { Doodle, TenHinh } from './doodles';

/* Lớp nền trang trí: rải hình vẽ hoá học ra hai bên lề trang.

   Không cần tính toán gì để tránh hình đè lên chữ — khối nội dung (Paper) là
   nền trắng đục và nằm trên lớp này, nên hình nào chui vào giữa sẽ tự bị che,
   chỉ phần thò ra lề mới nhìn thấy. Màn hình càng hẹp thì lề càng ít, hình tự
   khuất dần chứ không cần ẩn bằng tay.

   Vùng lề TRÊN-TRÁI để trống cho nhân vật đứng, nên mọi hình bên trái đều đặt
   từ 58% chiều cao trở xuống. */

interface ViTri {
  ten: TenHinh;
  /** Neo theo đỉnh. Các hình bên trái dùng `bottom` thay thế để tránh nhân vật. */
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rong: number;
  xoay?: number;
  /** true = chỉ hiện khi màn hình đủ rộng (lg trở lên), tránh chen chúc. */
  chiManHinhRong?: boolean;
  /** true = quay chậm liên tục (chỉ dùng cho nguyên tử). */
  quay?: boolean;
}

const VI_TRI: ViTri[] = [
  /* ---- Lề trái ----
     Nhân vật chiếm gần hết lề trái từ trên xuống (ở 1440px cô ấy kéo tới
     y≈660, chỉ chừa lại quãng 240px cuối). Nên chỉ đặt 2 hình, neo theo ĐÁY
     và xếp so le nhau để vừa né chân váy vừa không đè lên nhau. */
  { ten: 'amoniac', bottom: '12%', left: '2%', rong: 132, xoay: -8 },
  { ten: 'ongNghiem', bottom: '3%', left: '16%', rong: 46, xoay: -14 },

  // ---- Lề phải: hai cột so le, cột trong chỉ hiện khi màn hình rộng ----
  { ten: 'benzen', top: '6%', right: '6%', rong: 86, xoay: 10 },
  { ten: 'kinhLup', top: '17%', right: '15%', rong: 72, xoay: -12, chiManHinhRong: true },
  { ten: 'binhTamGiac', top: '29%', right: '5%', rong: 84, xoay: 6 },
  { ten: 'oNguyenTo', top: '43%', right: '15%', rong: 70, xoay: -7, chiManHinhRong: true },
  { ten: 'nguyenTu', top: '55%', right: '5.5%', rong: 96, quay: true },
  { ten: 'etilen', top: '70%', right: '13%', rong: 128, xoay: 5, chiManHinhRong: true },
  { ten: 'cocDong', top: '82%', right: '5%', rong: 76, xoay: -6 },
  { ten: 'muiTen', top: '93%', right: '14%', rong: 96, chiManHinhRong: true },
];

export const ChemDoodles: React.FC = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      overflow: 'hidden',      // hình thò ra ngoài không được đẻ ra thanh cuộn ngang
      pointerEvents: 'none',   // không chặn click vào nội dung phía sau
      userSelect: 'none',
      color: 'var(--chu-dam)',
      /* Hình nằm ngoài lề, không bao giờ đè lên chữ, nên đậm được mà không
         làm rối mắt lúc đọc. */
      opacity: 0.42,
      // Màn hình hẹp thì lề gần như không còn, hình chỉ còn là mảnh vụn ở rìa
      // nên ẩn hẳn cho sạch.
      display: { xs: 'none', md: 'block' },
      '@keyframes mascotQuay': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
    }}
  >
    {VI_TRI.map((v, i) => (
      <Box
        key={`${v.ten}-${i}`}
        sx={{
          position: 'absolute',
          top: v.top,
          bottom: v.bottom,
          left: v.left,
          right: v.right,
          display: v.chiManHinhRong ? { xs: 'none', lg: 'block' } : 'block',
          ...(v.quay && {
            animation: 'mascotQuay 60s linear infinite',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }),
        }}
      >
        <Doodle ten={v.ten} rong={v.rong} xoay={v.xoay} />
      </Box>
    ))}
  </Box>
);
