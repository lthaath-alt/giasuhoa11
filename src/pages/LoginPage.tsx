import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, Divider, CircularProgress, Alert } from '@mui/material';
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
      /* MỰC, không phải lục. Chỗ này từng là mảng teal đậm — di sản của bảng
         màu cam–teal mà chủ dự án đã hai lần xác nhận từ bỏ, và OWN-WORLD không
         cấp một mặt nền lục nào. Đây là màn đầu tiên người quay lại nhìn thấy;
         để nó ngoài thế giới thì thế giới bắt đầu từ màn thứ hai. */
      backgroundColor: 'var(--nen-dam)',
      backgroundImage: 'none',
      color: 'var(--chu-nguoc)',
    }}
  >
    {/* Logo trên cùng */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Cùng con dấu với thanh nhận diện: ô giấy vuông mang biểu tượng mực. */}
      <Box sx={{
        bgcolor: 'var(--nen-the)', width: 44, height: 44, borderRadius: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <BookOpen size={22} color="var(--chu-dam)" />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '-0.3px' }}>
        Gia sư Hóa 11
      </Typography>
    </Box>

    {/* Nội dung chính giữa */}
    <Box sx={{ my: { md: 4 } }}>
      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 1 }}>
        Nâng tầm tư duy
      </Typography>
      {/* Do tin hieu tren nen luc dam chi con 2,16 — do la hai mau cung do sam,
          dat canh nhau thi khong con thu bac nao. Vang canh bao tren luc la cap
          doi cua chinh he nhan GHS, va do duoc 4,98. */}
      <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 3, color: 'var(--vang-nen)' }}>
        tự học Hóa học lớp 11
      </Typography>

      <Typography variant="body1" sx={{ mb: 5, lineHeight: 1.8, fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', maxWidth: 480 }}>
        Hệ thống hướng dẫn thông minh đồng hành khơi gợi phương pháp, định hướng
        tư duy — thay vì đưa đáp án ăn sẵn — giúp học sinh tự giải quyết mọi bài tập phức tạp.
      </Typography>

      {/* Lưới 4 tính năng, 2x2 */}
      {/* Bảng khai: bốn ô LIỀN CẠNH chia bằng một nét dùng chung, không phải
          bốn thẻ rời có khe. Đây là thiết bị mà OWN-WORLD gọi tên — "trường có
          kẻ ô như bảng khai nhãn" — và là chỗ trước đây build mới chỉ làm cho
          các hộp vuông góc chứ chưa thật sự kẻ ô. Lưới thu gọn viền: mỗi ô chỉ
          vẽ cạnh phải và cạnh dưới, khung ngoài đóng lại hai cạnh còn lại. */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        border: '1px solid var(--chu-tren-nen-dam)',
        borderRight: 0,
        borderBottom: 0,
      }}>
        {[
          { icon: <BookOpen size={20} />, title: 'Bám sát SGK', desc: 'Tóm tắt lý thuyết & công thức từng Chương/Bài.' },
          { icon: <Sparkles size={20} />, title: 'Gia sư AI đồng hành', desc: 'Đàm thoại 1:1, gợi mở tư duy, sửa sai từng bước.' },
          { icon: <UserCheck size={20} />, title: 'Giám sát tiến trình', desc: 'Lưu lịch sử, đánh dấu hoàn thành, theo dõi rõ ràng.' },
          { icon: <Play size={20} />, title: 'Dùng thử miễn phí', desc: 'Trải nghiệm ngay với vai trò khách vãng lai.' },
        ].map(({ icon, title, desc }) => (
          <Box
            key={title}
            sx={{
              p: 2, borderRadius: 0,
              borderRight: '1px solid var(--chu-tren-nen-dam)',
              borderBottom: '1px solid var(--chu-tren-nen-dam)',
            }}
          >
            <Box sx={{ color: 'var(--vang-nen)', mb: 1 }}>{icon}</Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>{title}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, display: 'block' }}>
              {desc}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Footer */}
    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
      © 2026 Gia sư Hóa 11. Bản quyền thuộc về nhóm tác giả.
    </Typography>
  </Box>
);

// ─── LoginPage ────────────────────────────────────────────────────────────────

/** Trang chủ theo vai. Phải khớp với các thẻ canh trong `RouteGuards.tsx`. */
const duongTheoVai = (role?: string) => {
  if (role === 'admin') return '/admin';
  if (role === 'school_admin') return '/school-admin';
  if (role === 'teacher') return '/teacher';
  return '/dashboard';
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const [view, setView] = useState<LoginView>('login');
  const [pendingGoogleInfo, setPendingGoogleInfo] = useState<GoogleUserInfo | null>(null);

  /* Cờ "người dùng đã bấm vào". Vì sao phải chờ bằng useEffect chứ không điều
     hướng ngay trong handleSuccess: `login()` gọi
     signInWithEmailAndPassword, còn hồ sơ (có `role`) về SAU qua
     onAuthStateChanged. Lúc handleSuccess chạy, `currentUser` vẫn còn null —
     điều hướng ngay là đổ MỌI vai vào /dashboard, đúng lỗi bản cũ mắc phải. */
  const [dangVao, setDangVao] = useState(false);

  useEffect(() => {
    if (dangVao && currentUser) {
      navigate(duongTheoVai(currentUser.role), { replace: true });
    }
  }, [dangVao, currentUser, navigate]);

  /* Chờ hồ sơ có giới hạn. Nếu `currentUser` không về trong 6 giây thì gần như
     chắc là dữ liệu lệch — có phiên Auth mà không có tài liệu `users/{uid}`, và
     `AppContext` đã gọi signOut. Đứng im vô tận là tệ, mà lặng lẽ quay về form
     trống không một dòng giải thích cũng tệ. Nói thẳng ra. */
  const [loiVao, setLoiVao] = useState<string | null>(null);

  useEffect(() => {
    if (!dangVao || currentUser) return;
    const hen = setTimeout(() => {
      setLoiVao('Không tải được hồ sơ của bạn. Vui lòng đăng nhập lại.');
      setDangVao(false);
    }, 6000);
    return () => clearTimeout(hen);
  }, [dangVao, currentUser]);

  const handleSuccess = () => { setLoiVao(null); setDangVao(true); };

  const handleContinueAsGuest = () => navigate('/dashboard');

  // Google mới → chuyển sang đặt mật khẩu
  const handleGoogleNewUser = (googleInfo: GoogleUserInfo) => {
    setPendingGoogleInfo(googleInfo);
    setView('google-set-password');
  };

  // Sau khi hoàn tất đặt mật khẩu Google
  const handleGoogleRegisterSuccess = () => {
    setPendingGoogleInfo(null);
    setDangVao(true);
  };

  // ── Render form nội dung theo view ────────────────────────────────────────

  const renderFormContent = () => {
    /* Đã bấm vào nhưng chưa điều hướng xong: PHẢI có nhánh riêng, đừng rơi
       xuống switch(view). `setDangVao(true)` làm React vẽ xong khung hình mới
       RỒI MỚI chạy useEffect, nên ở khung đó điều kiện panel bên dưới thành sai
       và màn hình lật về form đăng nhập trống một nhịp. Đó là cơ chế của React,
       không phải chuyện mạng nhanh chậm. */
    if (dangVao) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <CircularProgress size={28} sx={{ color: 'var(--chu-dam)' }} />
          <Typography variant="body2" color="text.secondary">
            Đang vào…
          </Typography>
        </Box>
      );
    }

    /* Phiên còn sống: KHÔNG tự nhảy vào trong, hiện nút để người dùng tự bấm.
       Đây là nửa "luôn lưu phiên" của yêu cầu — không phải nhập lại mật khẩu. */
    if (currentUser && !dangVao) {
      return (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
            Chào mừng trở lại
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bạn đang đăng nhập bằng <strong>{currentUser.email}</strong>.
          </Typography>
          <Button
            id="continue-session-btn"
            variant="contained"
            size="large"
            fullWidth
            onClick={() => setDangVao(true)}
            startIcon={<UserCheck size={18} />}
            sx={{
              py: 1.5, borderRadius: 0, fontWeight: 'bold',
              textTransform: 'none', boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Tiếp tục với {currentUser.name || currentUser.email}
          </Button>
          <Button
            id="switch-account-btn"
            variant="text"
            size="small"
            fullWidth
            onClick={() => { void logout(); }}
            sx={{ mt: 1.5, borderRadius: 0, textTransform: 'none', color: 'var(--chu-2)' }}
          >
            Đăng nhập bằng tài khoản khác
          </Button>
        </Box>
      );
    }

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

  // Chỉ hiện nút "Dùng thử Khách" ở màn hình đăng nhập chính — không phải khi
  // đang bày panel "Chào mừng trở lại" (currentUser) và không phải khi đang
  // trong lúc chờ điều hướng (dangVao), kẻo bấm "Dùng thử" khi đã đăng nhập rồi.
  const showGuestButton = view === 'login' && !dangVao && !currentUser;

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
          backgroundColor: 'var(--nen-trang)',
          px: 2,
          py: 6,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Paper
            id="auth-form-paper"
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 0,
              border: '1px solid var(--vien)',
              backgroundColor: 'var(--nen-the)',
            }}
          >
            {/* Logo mobile (chỉ hiện khi màn hình nhỏ, vì cột trái đã ẩn) */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
              <BookOpen size={24} color="var(--chu-dam)" />
              <Typography variant="h5" color="var(--chu-dam)" sx={{ fontWeight: 'bold' }}>
                Gia sư Hóa 11
              </Typography>
            </Box>

            {/* Tiêu đề form — cũng phải ẩn khi dangVao (đang vào), cùng loại lỗi
                với panel "Chào mừng trở lại": rơi xuống switch(view) không có
                nghĩa là đang thật sự ở form đăng nhập trống. */}
            {view === 'login' && !dangVao && !currentUser && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
                  Đăng nhập tài khoản
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Chào mừng bạn quay lại với Gia sư Hóa 11.
                </Typography>
              </Box>
            )}

            {/* Chờ hồ sơ quá hạn (Sửa 2): báo lỗi thay vì im lặng quay về form trống. */}
            {loiVao && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
                {loiVao}
              </Alert>
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
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    borderColor: 'var(--tin-hieu)',
                    color: 'var(--tin-hieu)',
                    '&:hover': {
                      backgroundColor: 'var(--nen-tin-hieu-nhat2)',
                      borderColor: 'var(--tin-hieu)',
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