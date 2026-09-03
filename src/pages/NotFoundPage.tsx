import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0A0C10', p: 3 }}>
      <Paper sx={{ p: 5, textAlign: 'center', maxWidth: 450, borderRadius: 4, boxShadow: 'none', backgroundColor: '#11141D', border: '1px solid var(--chu-dam-2)' }}>
        <Box sx={{ color: 'var(--luc)', mb: 2, display: 'flex', justifyContent: 'center' }}>
          <HelpCircle size={64} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          404 - Không tìm thấy trang
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị thay đổi trong hệ thống Gia sư Hóa học 11 AI.
        </Typography>
        <Button
          id="back-home-404-btn"
          variant="contained"
          color="primary"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
        >
          Quay lại Trang chủ
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
