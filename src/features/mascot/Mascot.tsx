import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';

/* Nhân vật dẫn đường của trang. Hai kiểu dùng:
   - MascotToanThan: đứng ở lề trái trang Giới thiệu, bong bóng thoại phía trên.
   - MascotDauVai:   chỉ ló đầu + vai, xếp trong dòng nội dung ở tab Bài giảng
                     và Trò chơi, bong bóng thoại nằm bên phải.

   Ảnh đặt trong public/mascot nên đường dẫn tuyệt đối từ gốc site. */

const ANH_TOAN_THAN = '/mascot/mascot-toanthan.png';
const ANH_DAU_VAI = '/mascot/mascot-dauvai.png';

export type TabMascot = 'gioithieu' | 'baigiang' | 'trochoi' | 'luyentap';

/* Mỗi lần vào trang bốc ngẫu nhiên một câu cho đỡ nhàm. */
const LOI_THOAI: Record<TabMascot, string[]> = {
  /* Giọng "bạn cùng bàn": ngang hàng với học sinh, không lên giọng dạy dỗ —
     đúng vai người dẫn dắt mà trang này tự đặt ra. Xưng "mình", tránh dấu
     chấm than dồn dập cho đỡ hô hào.
     Câu ở tab Giới thiệu dài ngắn tuỳ ý: bong bóng của nhân vật đứng tự ngắt
     dòng trong bề ngang cột (xem `xuongDong` ở BongBong). */
  gioithieu: [
    'Ê, học chung không?',
    'Không hiểu cứ hỏi nhé.',
    'Bắt đầu từ đâu cũng được.',
    'Hoá không khó, chỉ hơi nhiều, quan trọng bạn có tự giác học tập không. Vào học cùng mình nhé! <3',
  ],
  baigiang: [
    'Đang mắc bài nào thế?',
    'Chọn bài đi, mình chờ.',
    'Bài nào cũng được, miễn là mở ra.',
  ],
  trochoi: [
    'Chơi tí cho đỡ nản.',
    'Ván này dễ mà.',
    'Chơi trước học sau cũng được.',
  ],
  luyentap: [
    'Sai cũng không sao, còn lượt mà.',
    'Làm chậm thôi, đọc kỹ đề đã.',
    'Qua được phần này là ngon rồi.',
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

/* Bong bóng thoại.
   `huong`     — đuôi nhọn chỉ xuống dưới (nhân vật đứng) hay sang trái (ló đầu).
   `xuongDong` — cho câu tự ngắt dòng thay vì ép nằm một dòng. Bật cho nhân vật
                 đứng vì câu ở tab Giới thiệu có thể dài cả trăm ký tự, để một
                 dòng thì bong bóng kéo dài ra khỏi mép màn hình. */
const BongBong: React.FC<{ loi: string; huong: 'duoi' | 'trai'; xuongDong?: boolean }> = ({
  loi,
  huong,
  xuongDong = false,
}) => (
  <Box
    sx={{
      position: 'relative',
      bgcolor: 'var(--nen-the)',
      border: '2px solid var(--chu-dam)',
      borderRadius: 0,
      px: 2,
      py: 1.15,
      /* Chặn bề ngang để câu dài tự ngắt dòng thay vì kéo bong bóng ra khỏi
         màn hình. Câu ngắn vẫn nằm gọn một dòng vì hộp co theo nội dung.
         Kiểu đứng: gói trong bề ngang cột nhân vật.
         Kiểu ló đầu: 170px trên điện thoại, 360px từ 600px trở lên. */
      maxWidth: xuongDong ? '100%' : { xs: 170, sm: 360 },
      // Đuôi nhọn: một ô vuông xoay 45° nhô ra, che nét viền phía trong đi.
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 12,
        height: 12,
        bgcolor: 'var(--nen-the)',
        borderRight: '2px solid var(--chu-dam)',
        borderBottom: '2px solid var(--chu-dam)',
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
        color: 'var(--chu-dam)',
        whiteSpace: 'normal',
      }}
    >
      {loi}
    </Typography>
  </Box>
);

/* Bề ngang ảnh toàn thân, ăn theo chỗ trống thực tế của lề trái.
   Lề trái rộng = (bề ngang màn hình − 900px khối chữ) / 2 − 16px khe hở:
     1440px -> 254px chỗ trống, dùng 245
     1536px -> 302px            dùng 300
     1800px -> 434px            dùng 375
   Ảnh có kèm hoạ tiết vẽ tay nên nhân vật chỉ chiếm 70,8% bề ngang ảnh —
   phải để ảnh to hơn hẳn thì nhân vật mới bằng cỡ cũ. */
const KHUNG_TOAN_THAN = {
  width: { xs: 245, xl: 300 },
  '@media (min-width:1800px)': { width: 375 },
};

/* ---------- Kiểu 1: đứng toàn thân ở lề trái ---------- */
export const MascotToanThan: React.FC<{ tab?: TabMascot }> = ({ tab = 'gioithieu' }) => {
  const loi = useMemo(() => dungLoiThoai(tab), [tab]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...KHUNG_TOAN_THAN }}>
      <Box sx={{ mb: 1.5 }}>
        <BongBong loi={loi} huong="duoi" xuongDong />
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
          ...KHUNG_TOAN_THAN,
          aspectRatio: '620 / 924',
          height: 'auto',
          display: 'block',
          ...NHIP_THO,
        }}
      />
    </Box>
  );
};

/* ---------- Kiểu 2: ló đầu + vai, xếp trong dòng nội dung ---------- */
/* `anBongBong`: chỉ lấy hình, bỏ lời thoại. Dùng cho ô hẹp — trong trường
   "Gia sư AI" ở khung hình đầu thì một bong bóng nữa sẽ chọi nhau với dòng
   trạng thái và nút bấm. */
export const MascotDauVai: React.FC<{ tab: TabMascot; rong?: number; anBongBong?: boolean }> = ({ tab, rong = 96, anBongBong = false }) => {
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
      {!anBongBong && <BongBong loi={loi} huong="trai" />}
    </Box>
  );
};
