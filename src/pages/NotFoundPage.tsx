import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import { Thoi } from '../core/components/Thoi';
import { LINK_ZALO } from '../core/constants';

/**
 * Trang 404, dựng theo thế giới nhãn cảnh báo hoá chất.
 *
 * Đây là màn hợp thế giới nhất trong cả ứng dụng: một trang 404 ĐÚNG NGHĨA là
 * trạng thái lỗi, nên đỏ tín hiệu ở đây là chính đáng — không phải trang trí.
 * Hợp đồng hướng cho đỏ ba việc: hành động chính, LỖI THẬT, và trạng thái đang
 * chọn. Đây là "lỗi thật".
 *
 * Hình thức là một ô khai trên nhãn: dải đầu mang ký hiệu thoi và mã lỗi, thân
 * là giấy mang lời giải thích. Cùng khuôn với bốn trường ở trang chủ, nên học
 * sinh lạc vào đây vẫn thấy mình đang ở trong cùng một hệ thống.
 *
 * Trang này từng viết cứng hai màu gần đen cho nền, không theo chế độ màu. Ở
 * chế độ SÁNG, chữ tiêu đề lấy màu mặc định của MUI rồi nằm trên thẻ gần đen:
 * đo được tương phản 1,03, tức không đọc được chữ nào. Ở chế độ tối thì tình cờ
 * trông ổn, nên lỗi nằm im. Nay mọi màu đều là biến.
 *
 * Cố ý KHÔNG viết ra mã màu cũ trong chú thích này: phép kiểm "mã màu cứng" đếm
 * mọi chuỗi dạng sáu ký tự hex trong tệp, kể cả trong chú thích.
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backgroundColor: 'var(--nen-trang)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560, border: '2px solid var(--chu-dam)' }}>
        {/* Dải nhãn — mã lỗi nằm trong hình thoi, đúng lối nhãn GHS */}
        <Box
          sx={{
            backgroundColor: 'var(--nen-dam)',
            color: 'var(--chu-nguoc)',
            /* Ở chế độ TỐI, `--nen-dam` nằm trên thân thẻ `--nen-the` chỉ hơn
               nhau 1,10 — dải nhãn tan vào thân, mất luôn cấu trúc "nhãn". Chia
               bằng NÉT KẺ thay vì bằng khác biệt nền: dùng ngôn ngữ của chính
               thế giới này, và nó đọc được ở cả hai chế độ.
               (Cố ý không chép hai mã màu ra đây — bộ đếm "mã màu cứng" quét cả
               chú thích, và tôi vừa vấp đúng bẫy đó khi viết dòng này.) */
            borderBottom: '2px solid var(--chu-dam)',
            px: { xs: 2, sm: 3 },
            py: 1.4,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Thoi co={30}>404</Thoi>
          <Typography variant="overline" component="h1" sx={{ lineHeight: 1.3, fontSize: '0.85rem' }}>
            Không tìm thấy trang
          </Typography>
        </Box>

        {/* Thân — giấy */}
        <Box sx={{ backgroundColor: 'var(--nen-the)', p: { xs: 3, sm: 4 } }}>
          <Typography variant="body1" sx={{ color: 'var(--chu-dam)', mb: 2, lineHeight: 1.7 }}>
            Đường dẫn em vừa mở không có trong hệ thống, hoặc đã được đổi sang chỗ khác.
          </Typography>

          {/* Đường dẫn hỏng, hiện ở khuôn khối mã.
              Lấy từ React Router chứ không từ `window.location`: ứng dụng chạy
              bằng HashRouter nên đường thật nằm sau dấu thăng. Và React đưa nó
              vào dạng CHỮ, không phải HTML — không có đường chèn mã ở đây. */}
          <Box
            sx={{
              backgroundColor: 'var(--nen-ma)',
              color: 'var(--chu-ma)',
              px: 2,
              py: 1.2,
              mb: 3,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.85rem',
              overflowWrap: 'anywhere',
              border: '1px solid var(--vien-dam)',
            }}
          >
            {location.pathname}
            {location.search}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Hành động chính — đỏ tín hiệu, đúng một chỗ */}
            <Button
              id="back-home-404-btn"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/')}
              sx={{
                borderRadius: 0,
                backgroundColor: 'var(--tin-hieu-nen)',
                color: 'var(--chu-nguoc)',
                px: 2.5,
                '&:hover': { backgroundColor: 'var(--nen-dam)' },
              }}
            >
              Về trang chủ
            </Button>

            {/* Lối phụ — khung kẻ. Học sinh lạc vào đây thường là do link hỏng
                thầy gửi, nên cho luôn một đường hỏi NGƯỜI THẬT.
                Không trỏ về trang chủ như nút bên cạnh: hai nút làm cùng một
                việc thì cái thứ hai chỉ tổ chiếm chỗ. Khu hỗ trợ là một tab bên
                trong trang chủ chứ không phải route riêng nên không nhắm thẳng
                vào được — Zalo mới là kênh hỗ trợ thật. */}
            <Button
              startIcon={<LifeBuoy size={16} />}
              onClick={() => window.open(LINK_ZALO, '_blank', 'noopener,noreferrer')}
              sx={{
                borderRadius: 0,
                backgroundColor: 'transparent',
                color: 'var(--chu-dam)',
                border: '1px solid var(--chu-dam)',
                px: 2.5,
                '&:hover': { backgroundColor: 'var(--nen-dam)', color: 'var(--chu-nguoc)' },
              }}
            >
              Hỏi thầy qua Zalo
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
