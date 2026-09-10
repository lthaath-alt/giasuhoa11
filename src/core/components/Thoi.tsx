import React from 'react';
import { Box } from '@mui/material';

/**
 * Ký hiệu hình thoi, nét đều — bộ ký hiệu của thế giới nhãn cảnh báo hoá chất.
 *
 * Trên nhãn GHS thật, mọi cảnh báo đều nằm trong một hình thoi viền đậm. Đây là
 * ký hiệu DUY NHẤT của hệ thị giác này; xem `DESIGN.md`.
 *
 * Màu lấy từ `currentColor`, nên nó tự ăn theo màu chữ của chỗ đặt nó — dải nhãn
 * mực thì thoi trắng, nền giấy thì thoi mực. Không cần truyền màu vào.
 *
 * Ở đây (`core/components/`) chứ không nằm cạnh một màn cụ thể, vì đang dùng ở
 * cả bốn trường nhãn trang chủ lẫn trang 404.
 */
export const Thoi: React.FC<{ children?: React.ReactNode; co?: number }> = ({
  children,
  co = 22,
}) => (
  <Box
    component="span"
    aria-hidden
    sx={{
      width: co,
      height: co,
      flexShrink: 0,
      border: '2px solid currentColor',
      transform: 'rotate(45deg)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: co * 0.28,
      fontWeight: 800,
      lineHeight: 1,
      /* Xoay ngược phần ruột lại để chữ bên trong vẫn đứng thẳng. */
      '& > *': { transform: 'rotate(-45deg)' },
    }}
  >
    <span>{children}</span>
  </Box>
);
