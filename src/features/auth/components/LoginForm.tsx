import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress, IconButton, InputAdornment
} from '@mui/material';
import { LogIn, GraduationCap, School, Eye, EyeOff, Lock } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface LoginFormProps {
  onSuccess: () => void;
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

export type SelectedRoleOption = 'student' | 'teacher';

// ─── LoginForm ────────────────────────────────────────────────────────────────

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onToggleForm,
  onForgotPassword,
}) => {
  const { login, logout } = useApp();

  const [selectedRole, setSelectedRole] = useState<SelectedRoleOption>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── Đăng nhập email/username + mật khẩu ─────────────────────────────────
  // (KHÔNG đổi gì ở phần logic dưới đây so với bản gốc)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập Email/Username và Mật khẩu!');
      return;
    }
    setLoading(true);
    setError(null);

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success && res.user) {
      const userRole = res.user.role;
      // Kiểm tra khớp vai trò đã chọn
      if (selectedRole === 'teacher' && userRole !== 'teacher' && userRole !== 'super_admin' && userRole !== 'school_admin') {
        logout();
        setError('Tài khoản này thuộc vai trò Học sinh. Vui lòng chọn lại vai trò "Học sinh" để đăng nhập.');
        return;
      }
      if (selectedRole === 'student' && (userRole === 'teacher' || userRole === 'super_admin' || userRole === 'school_admin')) {
        logout();
        setError('Tài khoản này thuộc vai trò Giáo viên / Quản trị. Vui lòng chọn lại vai trò "Giáo viên" để đăng nhập.');
        return;
      }
      onSuccess();
    } else {
      setError(res.message);
    }
  };

  const isStudent = selectedRole === 'student';
  const accentColor = isStudent ? '#ea580c' : '#0f766e';

  return (
    <Box id="login-form-container">
      <Typography variant="h5" align="center" sx={{ mb: 0.5, color: 'text.primary', fontWeight: 'bold' }}>
        Chào mừng trở lại!
      </Typography>
      <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2.5 }}>
        Chọn vai trò đăng nhập để học tập cùng Gia sư AI
      </Typography>

      {/* ─── CHỌN VAI TRÒ — dạng thanh pill 2 nút (giống ảnh tham khảo) ────────── */}
      <Box id="role-selection-box" sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            borderRadius: 999,
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
          }}
        >
          {/* Pill: Học sinh */}
          <Button
            id="role-option-student"
            fullWidth
            onClick={() => { setSelectedRole('student'); setError(null); }}
            startIcon={<GraduationCap size={18} />}
            sx={{
              borderRadius: 999,
              py: 1,
              textTransform: 'none',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              color: isStudent ? '#ffffff' : '#64748b',
              backgroundColor: isStudent ? '#ea580c' : 'transparent',
              boxShadow: isStudent ? '0 2px 8px rgba(234, 88, 12, 0.25)' : 'none',
              '&:hover': {
                backgroundColor: isStudent ? '#c2410c' : 'rgba(0,0,0,0.03)',
              },
            }}
          >
            Học sinh
          </Button>

          {/* Pill: Giáo viên / Admin */}
          <Button
            id="role-option-teacher"
            fullWidth
            onClick={() => { setSelectedRole('teacher'); setError(null); }}
            startIcon={<School size={18} />}
            sx={{
              borderRadius: 999,
              py: 1,
              textTransform: 'none',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              color: !isStudent ? '#ffffff' : '#64748b',
              backgroundColor: !isStudent ? '#0f766e' : 'transparent',
              boxShadow: !isStudent ? '0 2px 8px rgba(15, 118, 110, 0.25)' : 'none',
              '&:hover': {
                backgroundColor: !isStudent ? '#0d5e56' : 'rgba(0,0,0,0.03)',
              },
            }}
          >
            Giáo viên / Admin
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert id="login-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            id="login-email-field"
            label={isStudent ? "Email hoặc Username Học sinh" : "Email hoặc Username Giáo viên / Admin"}
            variant="outlined"
            fullWidth
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            disabled={loading}
            placeholder={isStudent ? "Ví dụ: student@gmail.com hoặc hs_nguyen" : "Ví dụ: teacher@school.edu.vn hoặc admin"}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Box>
            <TextField
              id="login-password-field"
              label="Mật khẩu"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(v => !v)}
                        edge="end"
                        size="small"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {/* Link Quên mật khẩu */}
            <Box sx={{ textAlign: 'right', mt: 0.5 }}>
              <Button
                id="forgot-password-link"
                variant="text"
                size="small"
                onClick={onForgotPassword}
                sx={{
                  textTransform: 'none',
                  color: accentColor,
                  fontWeight: 600,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' }
                }}
              >
                Quên mật khẩu?
              </Button>
            </Box>
          </Box>

          <Button
            id="login-submit-btn"
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LogIn size={18} />}
            sx={{
              py: 1.4,
              borderRadius: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              backgroundColor: accentColor,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: isStudent ? '#c2410c' : '#0d5e56',
                boxShadow: isStudent ? '0 4px 12px rgba(234, 88, 12, 0.2)' : '0 4px 12px rgba(15, 118, 110, 0.2)'
              }
            }}
          >
            {loading ? 'Đang xác thực...' : `Đăng nhập (${isStudent ? 'Học sinh' : 'Giáo viên / Admin'})`}
          </Button>
        </Box>
      </form>

      {/* Dòng nhỏ: tài khoản do trường cấp */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, mt: 2 }}>
        <Lock size={12} color="#94a3b8" />
        <Typography variant="caption" color="text.secondary">
          Tài khoản học sinh/giáo viên thường được cấp bởi nhà trường.
        </Typography>
      </Box>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có tài khoản?{' '}
          <Button
            id="switch-to-register-btn"
            variant="text"
            onClick={onToggleForm}
            sx={{ fontWeight: 'bold', p: 0, minWidth: 'auto', textTransform: 'none', color: accentColor }}
          >
            Đăng ký ngay
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginForm;