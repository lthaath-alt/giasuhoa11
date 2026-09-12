import React, { useRef, useState } from 'react';
import { useCheDoMau } from '../../../core/hooks/useCheDoMau';
import { Box, Paper } from '@mui/material';

/**
 * PHÒNG TRƯNG BÀY VI MÔ
 *
 * Nội dung là một trang tĩnh nằm ở public/thi-nghiem.html: HTML + canvas dựng
 * mô hình phân tử 3D, không phụ thuộc thư viện ngoài. Để ngoài React vì cùng lý
 * do với khu bài giảng — nó tự lo phần vẽ, nhúng vào bundle chỉ làm app nặng thêm.
 *
 * Dùng chung cách làm với SlidesSection: iframe trỏ vào file HTML tĩnh.
 */

/* nen=toi -> ép trang đi theo chế độ của app.
   Trang này CHỈ hiểu đúng một tham số đó: nền sáng thì không truyền gì cả, chứ
   không phải truyền `nen=sang`. Nó cũng không hiểu `theme=` hay `embed=` như
   trang bài giảng, nên đừng chép nguyên chuỗi truy vấn từ SlidesSection sang. */
const diaChiThiNghiem = (toi: boolean) =>
  toi ? '/thi-nghiem.html?nen=toi' : '/thi-nghiem.html';

export const PhongThiNghiem: React.FC = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { laToi } = useCheDoMau();
  /* Địa chỉ chốt một lần lúc dựng, KHÔNG dựng lại theo `laToi` — giống
     SlidesSection. Để nó đổi theo thì mỗi lần bấm đổi nền là iframe nạp lại,
     ai đang xoay dở một phân tử sẽ bị đá về trạng thái đầu. */
  const [diaChi] = useState(() => diaChiThiNghiem(laToi));

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'var(--nen-xam)',
        borderRadius: 0,
        p: 3,
      }}
    >
      {/* Khung chứa trang thí nghiệm tĩnh.
          KHÔNG thêm tiêu đề ở đây: thi-nghiem.html đã có sẵn tiêu đề và câu mô
          tả riêng bên trong, đặt thêm một cặp nữa là hiện hai lần. */}
      <Paper
        sx={{
          overflow: 'hidden',
          borderRadius: 0,
          border: '2px solid var(--xanh-dam)',
          boxShadow: 'none',
          height: { xs: 'calc(100vh - 290px)', md: 'calc(100vh - 250px)' },
          minHeight: '400px',
        }}
      >
        <iframe
          ref={frameRef}
          src={diaChi}
          title="Phòng trưng bày mô hình phân tử 3D"
          allow="fullscreen"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </Paper>
    </Box>
  );
};
