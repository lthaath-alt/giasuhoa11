import React, { useEffect, useRef, useState } from 'react';
import { useCheDoMau } from '../../../core/hooks/useCheDoMau';
import { useApp } from '../../../core/hooks/useApp';
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

// theme=light|dark -> ép trang slide đi theo chế độ của app.
//   Không truyền thì trang đó tự theo giao diện hệ thống, nên máy để nền tối mà
//   app đang sáng (hoặc ngược lại) sẽ ra một mảng lệch tông giữa trang.
//   Trang slide có nút đổi nền riêng và tự nhớ trong localStorage, nhưng tham số
//   URL được ưu tiên — coi nút trên thanh đầu trang là nơi quyết định duy nhất.
// embed=1      -> ẩn nút Toàn màn hình bên trong, tránh trùng với nút ở đây
const diaChiSlide = (toi: boolean) =>
  `/hoa11/index.html?theme=${toi ? 'dark' : 'light'}&embed=1`;

export const SlidesSection: React.FC = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { laToi } = useCheDoMau();
  const { curriculum, isLessonCompleted, updateLessonProgress } = useApp();
  /* Địa chỉ chốt một lần lúc dựng, KHÔNG dựng lại theo `laToi`.
     Để nó đổi theo thì mỗi lần bấm đổi nền là iframe nạp lại, ai đang xem dở
     một bài sẽ bị đá về đầu danh sách. Đổi nền giữa chừng nhắn tin sang. */
  const [diaChi] = useState(() => diaChiSlide(laToi));

  useEffect(() => {
    const w = frameRef.current?.contentWindow;
    if (!w) return;
    const gui = () => w.postMessage(
      { loai: 'hoa11:che-do-mau', toi: laToi },
      window.location.origin,
    );
    gui();
    const hen = window.setTimeout(gui, 400);
    return () => window.clearTimeout(hen);
  }, [laToi]);

  /* Trang slide báo "đã xem đủ mọi slide của bài X" -> tính bài X là đã học.
     Đây là đường thứ hai, bên cạnh làm đạt đề kiểm tra (QuizPage). Trước đây
     đọc bài giảng không được ghi gì, nên ô Bài giảng mãi "đã học 0/25".
     Chỉ nhận mã có thật trong `curriculum`, và bỏ qua bài đã tính rồi để
     khỏi ghi Firestore mỗi lần em lật lại slide cuối. Khách thì
     `updateLessonProgress` tự bỏ qua. */
  useEffect(() => {
    const nghe = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== frameRef.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.loai !== 'hoa11:doc-xong-bai' || typeof d.bai !== 'string') return;
      if (!curriculum.some((c) => c.lessons.some((l) => l.id === d.bai))) return;
      if (isLessonCompleted(d.bai)) return;
      updateLessonProgress(d.bai, { basicCompleted: true });
    };
    window.addEventListener('message', nghe);
    return () => window.removeEventListener('message', nghe);
  }, [curriculum, isLessonCompleted, updateLessonProgress]);

  const handleFullscreen = () => {
    /* PHẢI có catch. Trình duyệt từ chối toàn màn hình trong khá nhiều trường
       hợp — chính sách máy trường, iOS Safari, hay trang nhúng trong khung không
       được cấp quyền — và khi đó promise bị từ chối mà không ai bắt, hiện lên
       console thành lỗi đỏ. Đo được ở bản trước: "Permissions check failed".
       Từ chối thì thôi, người dùng vẫn xem slide bình thường. */
    frameRef.current?.requestFullscreen?.().catch(() => {});
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
        bgcolor: 'var(--nen-xam)',
        borderRadius: 0,
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
              color: 'var(--xanh-dam)',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              lineHeight: 1.2,
            }}
          >
            <Presentation size={30} /> Bài Giảng Hóa 11
          </Typography>
          <Typography sx={{ fontSize: '15px', color: 'var(--chu-2)', mt: '6px' }}>
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
            borderRadius: 0,
            background: 'var(--nen-dam)',
            color: 'var(--chu-nguoc)',
            '&:hover': {
              backgroundColor: 'var(--nen-dam)',
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
          title="Bài giảng Hóa 11"
          onLoad={handleLoad}
          allow="fullscreen"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </Paper>
    </Box>
  );
};
