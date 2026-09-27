import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * Khung bọc một mô phỏng, có nút "Toàn màn hình" — để chiếu lên máy chiếu
 * trong lớp là cảnh dùng thật (xem .impeccable/surfaces/app.md).
 *
 * Hai tầng, đo ngày 27/09/2026:
 *  1. Bấm nút là khung PHỦ KÍN CỬA SỔ ngay bằng CSS (position: fixed). Tầng này
 *     chạy ở mọi nơi — kể cả iPhone Safari (không cho phần tử thường vào toàn
 *     màn hình) và khung trình duyệt nhúng, nơi requestFullscreen được gọi mà
 *     KHÔNG BAO GIỜ trả lời: không thành công, cũng không báo lỗi.
 *  2. Đồng thời xin toàn màn hình thật. Cùng lối GameHubSection: CHỈ gọi ngay
 *     trong cú bấm (đẩy vào useEffect là trình duyệt từ chối im lặng), bọc catch.
 * Thoát: nút, phím Esc, hoặc thoát toàn màn hình thật bằng cách của trình duyệt.
 */
interface Props {
  tieuDe: string;
  nhan?: string;   // dòng nhãn nhỏ bên phải tiêu đề, ví dụ "Bài 2"
  children: (toanManHinh: boolean) => React.ReactNode;
}

export const KhungToanManHinh: React.FC<Props> = ({ tieuDe, nhan, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [toan, setToan] = useState(false);
  /* Đã thật sự vào toàn màn hình của trình duyệt chưa — để khi người dùng thoát
     bằng cách của trình duyệt thì khung cũng thôi phủ kín. */
  const daVaoThat = useRef(false);

  useEffect(() => {
    const doi = () => {
      if (document.fullscreenElement === ref.current) daVaoThat.current = true;
      else if (daVaoThat.current) { daVaoThat.current = false; setToan(false); }
    };
    document.addEventListener('fullscreenchange', doi);
    return () => {
      document.removeEventListener('fullscreenchange', doi);
      /* Rời khung mà vẫn đang toàn màn hình do CHÍNH khung này bật thì thoát;
         người dùng tự bấm F11 thì không đụng tới. */
      if (ref.current && document.fullscreenElement === ref.current) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!toan) return;
    const phim = (e: KeyboardEvent) => { if (e.key === 'Escape') setToan(false); };
    const cuonCu = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', phim);
    return () => {
      document.removeEventListener('keydown', phim);
      document.body.style.overflow = cuonCu;
    };
  }, [toan]);

  const bam = () => {
    if (toan) {
      setToan(false);
      if (document.fullscreenElement === ref.current) document.exitFullscreen?.().catch(() => {});
    } else {
      setToan(true);
      ref.current?.requestFullscreen?.().catch(() => {});
    }
  };

  return (
    <Box
      ref={ref}
      data-toan-man-hinh={toan ? '1' : undefined}
      sx={{
        bgcolor: 'var(--nen-the)',
        border: '2px solid var(--chu-dam)',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        ...(toan && { position: 'fixed', inset: 0, zIndex: 1300, border: 'none', overflow: 'auto' }),
        '&:fullscreen': { border: 'none', overflow: 'auto' },
      }}
    >
      <Box
        sx={{
          bgcolor: 'var(--nen-dam)',
          color: 'var(--chu-nguoc)',
          borderBottom: '2px solid var(--chu-dam)',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          ...(toan && { position: 'sticky', top: 0, zIndex: 1 }),
        }}
      >
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--f-hien-thi)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontSize: toan ? 'clamp(1rem, 2.2vh, 1.5rem)' : '0.95rem',
            flexGrow: 1,
          }}
        >
          {tieuDe}
        </Typography>
        {nhan && (
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--chu-tren-nen-dam)' }}>
            {nhan}
          </Typography>
        )}
        <Button
          onClick={bam}
          startIcon={toan ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          sx={{
            borderRadius: 0,
            fontSize: '0.75rem',
            px: 1.5,
            color: 'var(--chu-nguoc)',
            border: '1px solid var(--chu-tren-nen-dam)',
            '&:hover': { borderColor: 'var(--chu-nguoc)' },
          }}
        >
          {toan ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'}
        </Button>
      </Box>
      <Box sx={{ p: { xs: 1.5, md: toan ? 3 : 2 }, flexGrow: 1 }}>{children(toan)}</Box>
    </Box>
  );
};
