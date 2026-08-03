import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Divider } from '@mui/material';
import { BookOpen, Sparkles, UserCheck, Play } from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import LoginForm from '../features/auth/components/LoginForm';
import RegisterForm from '../features/auth/components/RegisterForm';
import ForgotPasswordForm from '../features/auth/components/ForgotPasswordForm';
import GoogleSetPasswordForm from '../features/auth/components/GoogleSetPasswordForm';
import { GoogleUserInfo } from '../core/services/googleAuth';

// ─── Trạng thái màn hình ──────────────────────────────────────────────────────

type LoginView =
  | 'login'               // Form đăng nhập chính
  | 'register'            // Hướng dẫn đăng ký
  | 'forgot-password'     // Quên mật khẩu
  | 'google-set-password'; // Lần đầu đăng nhập Google → đặt mật khẩu

// ─── Left Panel: Banner thương hiệu (nền xanh lá tràn viền, kiểu tham khảo) ──

const BrandPanel: React.FC = () => (
  <Box
    id="login-brand-panel"
    sx={{
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      minHeight: '100vh',
      px: { md: 5, lg: 7 },
      py: 6,
      backgroundColor: '#0f766e', // Teal đậm — màu thương hiệu đã có sẵn trong theme
      backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.06), transparent 45%)',
      color: '#ffffff',
    }}
  >
    {/* Logo trên cùng */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box sx={{
        bgcolor: 'rgba(255,255,255,0.12)', width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.25)'
      }}>
        <BookOpen size={22} color="#ffffff" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '-0.3px' }}>
        Gia sư Hóa học 11 AI
      </Typography>
    </Box>

    {/* Nội dung chính giữa */}
    <Box sx={{ my: { md: 4 } }}>
      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1 }}>
        Nâng tầm tư duy
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 3, color: '#fdba74' }}>
        tự học Hóa học lớp 11
      </Typography>

      <Typography variant="body1" sx={{ mb: 5, lineHeight: 1.8, fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: 480 }}>
        Hệ thống hướng dẫn thông minh đồng hành khơi gợi phương pháp, định hướng
        tư duy — thay vì đưa đáp án ăn sẵn — giúp học sinh tự giải quyết mọi bài tập phức tạp.
      </Typography>

      {/* Lưới 4 tính năng, 2x2 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        {[
          { icon: <BookOpen size={20} />, title: 'Bám sát SGK', desc: 'Tóm tắt lý thuyết & công thức từng Chương/Bài.' },
          { icon: <Sparkles size={20} />, title: 'Gia sư AI đồng hành', desc: 'Đàm thoại 1:1, gợi mở tư duy, sửa sai từng bước.' },
          { icon: <UserCheck size={20} />, title: 'Giám sát tiến trình', desc: 'Lưu lịch sử, đánh dấu hoàn thành, theo dõi rõ ràng.' },
          { icon: <Play size={20} />, title: 'Dùng thử miễn phí', desc: 'Trải nghiệm ngay với vai trò khách vãng lai.' },
        ].map(({ icon, title, desc }) => (
          <Box
            key={title}
            sx={{
              p: 2, borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.18)',
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <Box sx={{ color: '#fdba74', mb: 1 }}>{icon}</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{title}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, display: 'block' }}>
              {desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Footer */}
    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
      © 2026 Gia sư Hóa học 11 AI. All rights reserved.
    </Typography>
  </Box>
);

// ─── LoginPage ────────────────────────────────────────────────────────────────

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<LoginView>('login');
  const [pendingGoogleInfo, setPendingGoogleInfo] = useState<GoogleUserInfo | null>(null);

  const handleSuccess = () => navigate('/dashboard');

  const handleContinueAsGuest = () => navigate('/dashboard');

  // Google mới → chuyển sang đặt mật khẩu
  const handleGoogleNewUser = (googleInfo: GoogleUserInfo) => {
    setPendingGoogleInfo(googleInfo);
    setView('google-set-password');
  };

  // Sau khi hoàn tất đặt mật khẩu Google
  const handleGoogleRegisterSuccess = () => {
    setPendingGoogleInfo(null);
    navigate('/dashboard');
  };

  // ── Render form nội dung theo view ────────────────────────────────────────

  const renderFormContent = () => {
    switch (view) {
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBackToLogin={() => setView('login')}
          />
        );

      case 'google-set-password':
        return pendingGoogleInfo ? (
          <GoogleSetPasswordForm
            googleInfo={pendingGoogleInfo}
            onSuccess={handleGoogleRegisterSuccess}
            onCancel={() => { setPendingGoogleInfo(null); setView('login'); }}
          />
        ) : null;

      case 'register':
        return (
          <RegisterForm
            onToggleForm={() => setView('login')}
          />
        );

      case 'login':
      default:
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onToggleForm={() => setView('register')}
            onForgotPassword={() => setView('forgot-password')}
          />
        );
    }
  };

  // Chỉ hiện nút "Dùng thử Khách" ở màn hình đăng nhập chính
  const showGuestButton = view === 'login';

  return (
    <Box
      id="login-page-bg"
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      {/* CỘT TRÁI: Banner thương hiệu (tràn hết viền, nền xanh lá đậm) */}
      <BrandPanel />

      {/* CỘT PHẢI: Form đăng nhập (nền trắng) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          px: 2,
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Paper
            id="auth-form-paper"
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            {/* Logo mobile (chỉ hiện khi màn hình nhỏ, vì cột trái đã ẩn) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
              <BookOpen size={24} color="#0f766e" />
              <Typography variant="h5" color="#0f766e" sx={{ fontWeight: 'bold' }}>
                Gia sư Hóa học 11 AI
              </Typography>
            </Box>

            {/* Tiêu đề form */}
            {view === 'login' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                  Đăng nhập tài khoản
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Chào mừng bạn quay lại với Gia sư Hóa học 11 AI.
                </Typography>
              </Box>
            )}

            {/* Form content — giữ nguyên logic cũ, không đổi */}
            {renderFormContent()}

            {/* Nút dùng thử Khách vãng lai */}
            {showGuestButton && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                    HOẶC
                  </Typography>
                </Divider>

                <Button
                  id="continue-as-guest-btn"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<Play size={16} />}
                  onClick={handleContinueAsGuest}
                  sx={{
                    py: 1.2,
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: '#ea580c',
                    color: '#ea580c',
                    '&:hover': {
                      backgroundColor: 'rgba(234, 88, 12, 0.08)',
                      borderColor: '#ea580c',
                    },
                  }}
                >
                  Dùng thử với vai trò Khách vãng lai
                </Button>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  sx={{ display: 'block', mt: 1, px: 2 }}
                >
                  *Bản dùng thử miễn phí giới hạn tối đa 25 câu hỏi với Gia sư AI.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;