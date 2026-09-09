import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  /* Trang này từng viết cứng hai màu gần đen cho nền trang và nền thẻ, không theo
     chế độ màu. Ở chế độ SÁNG, chữ tiêu đề lấy màu mặc định của MUI (tức --chu-dam,
     màu chữ đậm) rồi nằm trên thẻ gần đen: đo được tương phản 1,03, tức là không
     đọc được chữ nào. Ở chế độ tối thì tình cờ trông ổn, nên lỗi nằm im.
     Nay dùng biến để trang tự đảo theo nền như mọi trang khác. Viền cũng đổi từ
     --chu-dam-2 (biến vai CHỮ) sang --vien cho đúng vai.

     Cố ý KHÔNG viết ra mã màu cũ trong chú thích này: phép kiểm "mã màu cứng" đếm
     mọi chuỗi dạng #rrggbb trong tệp, kể cả trong chú thích, nên nhắc lại chúng ở
     đây là tự làm con số nợ tăng lên. Đã mắc đúng vậy: 66 hoá 67. */
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--nen-trang)', p: 3 }}>
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 450, borderRadius: 0, boxShadow: 'none', backgroundColor: 'var(--nen-the)', border: '1px solid var(--vien)' }}>
        <Box sx={{ color: 'var(--luc)', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <HelpCircle size={64} />
        </Box>
        {/* Đặt màu chữ TƯỜNG MINH bằng biến CSS. Để mặc định thì màu chữ lấy từ
            bảng màu MUI còn màu nền lấy từ biến CSS — hai hệ khác nhau, và chỉ
            cần một bên đổi mà bên kia chưa kịp là chữ biến mất. Đo được đúng
            cảnh đó: nền thẻ đã sang chế độ tối mà chữ còn giữ màu chế độ sáng,
            tương phản 1,10. */}
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--chu-dam)' }}>
          404 - Không tìm thấy trang
        </Typography>
        <Typography variant="body2" sx={{ mb: 4, color: 'var(--chu-2)' }}>
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi trong hệ thống Gia sư Hóa học 11 AI.
        </Typography>
        <Button
          id="back-home-404-btn"
          variant="contained"
          color="primary"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 0, textTransform: 'none', boxShadow: 'none' }}
        >
          Quay lại Trang chủ
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
