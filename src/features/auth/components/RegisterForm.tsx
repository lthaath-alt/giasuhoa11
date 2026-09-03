import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Divider
} from '@mui/material';
import { ArrowLeft, GraduationCap, UserPlus } from 'lucide-react';
import { StudentRegisterForm } from './StudentRegisterForm';

interface RegisterFormProps {
  onToggleForm: () => void;
  onSuccess?: () => void; // kept for API compat
}

/**
  * RegisterForm – Phiên bản mở rộng (Bước 2)
  *
  * Hệ thống hỗ trợ 2 luồng đăng ký:
  * 1. Học sinh tự đăng ký email – có thể kèm mã lớp.
  * 2. Tài khoản trường học – do Admin/GV cấp.
  */
export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleForm }) => {
  const [showStudentForm, setShowStudentForm] = useState(false);

  if (showStudentForm) {
    return (
      <StudentRegisterForm
        onBackToLogin={() => setShowStudentForm(false)}
      />
    );
  }

  return (
    <Box id="register-info-container">
      <Typography variant="h5" align="center" sx={{ mb: 0.5, fontWeight: 'bold', color: 'var(--chu-dam)' }}>
        Tạo tài khoản
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
        Chọn cách phù hợp với bạn để bắt đầu học tập
      </Typography>

      {/* Luồng 2 MỚI: Học sinh tự đăng ký bằng email */}
      <Paper
        id="register-option-student-self"
        variant="outlined"
        sx={{
          p: 2.5, borderRadius: 3, mb: 2,
          borderColor: 'rgba(234, 88, 12, 0.3)',
          backgroundColor: 'rgba(234, 88, 12, 0.02)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(234, 88, 12, 0.06)',
            borderColor: 'rgba(234, 88, 12, 0.5)',
            transform: 'translateY(-1px)',
          }
        }}
        /* Thẻ này bấm được nên PHẢI dùng được bằng bàn phím.
           Trước đây nó chỉ là một <div> có onClick: chuột bấm được, còn ai đi
           bằng phím Tab thì không bao giờ tới được nó, và trình đọc màn hình
           cũng không đọc ra đây là chỗ bấm. Thêm role/tabIndex và bắt phím
           Enter, Space là xong — không đổi gì về hình thức. */
        role="button"
        tabIndex={0}
        onClick={() => setShowStudentForm(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowStudentForm(true); }
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(234, 88, 12, 0.1)', borderRadius: 2, display: 'flex' }}>
            <UserPlus size={22} color="var(--cam)" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Học sinh đăng ký bằng Email ✨
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
              Điền email + mật khẩu để tạo tài khoản. Có <strong>mã lớp</strong> do giáo viên cấp?
              Nhập vào để được giáo viên theo dõi tiến độ học.
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Luồng 3: Trường học */}
      <Paper
        id="register-option-school"
        variant="outlined"
        sx={{
          p: 2.5, borderRadius: 3, mb: 3,
          borderColor: 'rgba(15, 118, 110, 0.3)',
          backgroundColor: 'rgba(15, 118, 110, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ p: 1, bgcolor: 'rgba(15, 118, 110, 0.08)', borderRadius: 2, display: 'flex' }}>
            <GraduationCap size={22} color="var(--teal)" />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Tài khoản do nhà trường cấp
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6, display: 'block' }}>
              Tài khoản do <strong>Giáo viên chủ nhiệm</strong> hoặc <strong>Admin nhà trường</strong> tạo và cấp cho bạn.
              Liên hệ giáo viên của mình để nhận thông tin đăng nhập.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ mb: 2.5 }} />

      <Button
        id="back-to-login-from-register-btn"
        variant="outlined"
        fullWidth
        size="large"
        startIcon={<ArrowLeft size={16} />}
        onClick={onToggleForm}
        sx={{
          py: 1.3, borderRadius: 3, fontWeight: 'bold', textTransform: 'none',
          borderColor: 'var(--cam)', color: 'var(--cam)',
          '&:hover': { backgroundColor: 'rgba(234, 88, 12, 0.06)', borderColor: 'var(--cam)' }
        }}
      >
        Quay lại Đăng nhập
      </Button>
    </Box>
  );
};

export default RegisterForm;

