import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Thoi } from '../../../core/components/Thoi';

/**
 * Bốn trường nhãn ở khung hình đầu của trang chủ.
 *
 * Hình thức lấy từ ô khai trên nhãn cảnh báo hoá chất: viền mực đều bốn cạnh,
 * một dải mực ở đầu mang ký hiệu thoi và tên viết hoa, thân là giấy. Không bo
 * góc, không bóng đổ — độ sâu diễn đạt bằng độ đậm của viền.
 *
 * Mỗi trường mang MỘT dòng trạng thái THẬT, đọc từ dữ liệu đang chạy. Không có
 * số nào được bịa: PRODUCT.md cấm dựng con số chưa có bằng chứng, và một cái
 * nhãn ghi sai số thì tệ hơn là không ghi.
 *
 * Chỉ MỘT hành động chính, nền đỏ tín hiệu, nằm ở trường đầu tiên. Ba trường
 * còn lại là khung kẻ — đỏ mà xuất hiện bốn lần thì hết là tín hiệu.
 */

export interface Truong {
  ma: string;
  ten: string;
  trangThai: string;
  /** Không có hàm bấm nghĩa là mục này chưa mở cho vai hiện tại. */
  moKhi?: () => void;
  nhanNut?: string;
  /** Đúng một trường được đặt cờ này. */
  chinh?: boolean;
  /** Lý do mục bị khoá, hiện thay cho nút. */
  khoa?: string;
  /** Nhân vật đứng ở mép phải trường, nếu trường này có. */
  nhanVat?: React.ReactNode;
}

export const ActivityFields: React.FC<{ truongs: Truong[] }> = ({ truongs }) => (
  <Box
    component="nav"
    aria-label="Bốn việc làm được"
    sx={{
      display: 'grid',
      /* Hợp đồng hướng: hai cột trên máy tính, một cột trên điện thoại.
         minmax(0,…) chứ không phải 1fr — 1fr có sàn min-content nên một dòng
         trạng thái dài sẽ đẩy cột tràn ra ngoài. */
      gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
      gap: 2,
      mb: 4,
    }}
  >
    {truongs.map((t) => (
      <Box
        key={t.ma}
        sx={{
          border: '2px solid var(--chu-dam)',
          backgroundColor: 'var(--nen-the)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Dải nhãn */}
        <Box
          sx={{
            backgroundColor: 'var(--nen-dam)',
            color: 'var(--chu-nguoc)',
            /* Xem chu thich cung viec o NotFoundPage: che do toi lam dai nhan
               tan vao than the, nen ranh gioi phai la mot net ke. */
            borderBottom: '2px solid var(--chu-dam)',
            px: 2,
            py: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Thoi>{t.ma}</Thoi>
          <Typography
            variant="overline"
            component="h2"
            sx={{ lineHeight: 1.3, fontSize: '0.82rem' }}
          >
            {t.ten}
          </Typography>
        </Box>

        {/* Thân */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            flexGrow: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'var(--chu-dam-3)',
              fontWeight: 600,
              /* Số đo được thì phải thẳng cột. */
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.trangThai}
          </Typography>

          {/* Nhân vật đứng ở MÉP PHẢI trường, không phải giữa màn — hợp đồng
              hướng chỉ định đúng chỗ này. Đặt trước nút để nút vẫn là thứ neo
              ở mép ngoài cùng, nơi tay người dùng tìm tới. */}
          {t.nhanVat}

          {t.moKhi ? (
            <Button
              onClick={t.moKhi}
              sx={{
                flexShrink: 0,
                borderRadius: 0,
                fontSize: '0.78rem',
                px: 2,
                ...(t.chinh
                  ? {
                      backgroundColor: 'var(--tin-hieu-nen)',
                      color: 'var(--chu-nguoc)',
                      '&:hover': { backgroundColor: 'var(--nen-dam)' },
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: 'var(--chu-dam)',
                      border: '1px solid var(--chu-dam)',
                      '&:hover': {
                        backgroundColor: 'var(--nen-dam)',
                        color: 'var(--chu-nguoc)',
                      },
                    }),
              }}
            >
              {t.nhanNut ?? 'Mở'}
            </Button>
          ) : (
            <Typography
              variant="caption"
              sx={{ color: 'var(--chu-mo)', fontWeight: 600, flexShrink: 0 }}
            >
              {t.khoa}
            </Typography>
          )}
        </Box>
      </Box>
    ))}
  </Box>
);
