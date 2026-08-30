import React, { useRef } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Presentation, Maximize2 } from 'lucide-react';

/**
 * KHU VỰC BÀI GIẢNG SLIDE HÓA 11
 *
 * Nội dung là một trang tĩnh nằm ở public/hoa11/ (25 bài · 257 slide, ảnh WebP).
 * Để ngoài React vì đây là kho ảnh 32MB — nhúng thẳng vào bundle sẽ làm
 * app nặng lên vô ích. Trang đó tự lazy-load, mở 1 bài chỉ tốn ~250KB.
 *
 * Dùng chung cách làm với GameHubSection: iframe trỏ vào file HTML tĩnh.
 */

// theme=light  -> khớp nền sáng của app (trang đó mặc định theo giao diện hệ thống)
// embed=1      -> ẩn nút Toàn màn hình bên trong, tránh trùng với nút ở đây
const SLIDES_URL = '/hoa11/index.html?theme=light&embed=1';

export const SlidesSection: React.FC = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  const handleFullscreen = () => {
    frameRef.current?.requestFullscreen?.();
  };

  // Cho phép bấm phím mũi tên chuyển slide ngay, không phải click vào khung trước
  const handleLoad = () => {
    try {
      frameRef.current?.contentWindow?.focus();
    } catch {
      /* khác origin thì bỏ qua — ở đây luôn cùng origin */
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#f7f9fc',
        borderRadius: 3,
        p: 3,
      }}
    >
      {/* Header khu vực */}
      <Box
        sx={{
          mb: '20px',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '28px',
              color: '#1e50a2',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              lineHeight: 1.2,
            }}
          >
            <Presentation size={30} /> Bài Giảng Hóa 11
          </Typography>
          <Typography sx={{ fontSize: '15px', color: '#5a6472', mt: '6px' }}>
            25 bài · 257 slide. Bấm vào một bài để xem, dùng phím mũi tên để lật slide.
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleFullscreen}
          startIcon={<Maximize2 size={18} />}
          sx={{
            flexShrink: 0,
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 5,
            background: 'linear-gradient(90deg, #1e50a2 0%, #007bf2 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(90deg, #16407e 0%, #0056a3 100%)',
            },
          }}
        >
          Toàn màn hình
        </Button>
      </Box>

      {/* Khung chứa trang bài giảng tĩnh */}
      <Paper
        sx={{
          overflow: 'hidden',
          borderRadius: '16px',
          border: '2px solid #1e50a2',
          boxShadow: '0 4px 16px rgba(30, 80, 162, 0.12)',
          height: { xs: 'calc(100vh - 290px)', md: 'calc(100vh - 250px)' },
          minHeight: '400px',
        }}
      >
        <iframe
          ref={frameRef}
          src={SLIDES_URL}
          title="Bài giảng Hóa 11"
          onLoad={handleLoad}
          allow="fullscreen"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </Paper>
    </Box>
  );
};
