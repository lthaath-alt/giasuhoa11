import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Divider
} from '@mui/material';
import { Mail, KeyRound, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { forgotPassword } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<{ newPassword: string; email: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Vui lòng nhập email hoặc username tài khoản của bạn.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await forgotPassword(identifier.trim());
    setLoading(false);

    if (res.success && res.newPassword) {
      setResult({ newPassword: res.newPassword, email: res.email || identifier });
    } else {
      setError(res.message);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Màn hình kết quả ───────────────────────────────────────────────────────

  if (result) {
    return (
      <Box id="forgot-password-result" sx={{ textAlign: 'center' }}>
        <Box sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: 64, height: 64, borderRadius: '50%',
          bgcolor: 'rgba(15, 118, 110, 0.08)', border: '2px solid rgba(15, 118, 110, 0.2)',
          mx: 'auto', mb: 2
        }}>
          <KeyRound size={28} color="#0f766e" />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 0.5 }}>
          Mật khẩu mới đã được tạo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sao chép mật khẩu dưới đây và dùng để đăng nhập ngay bây giờ.
        </Typography>

        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 2, textAlign: 'left' }}>
          Lưu lại mật khẩu này ngay! Nếu mất, bạn cần thực hiện lại bước "Quên mật khẩu".
        </Alert>

        {/* Hiển thị mật khẩu mới */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          p: 2.5, bgcolor: '#f8fafc', borderRadius: 3,
          border: '1.5px solid rgba(15, 118, 110, 0.25)', mb: 2
        }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block' }}>
              MẬT KHẨU MỚI
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'monospace', fontWeight: 'bold', color: '#0f766e',
                letterSpacing: showPassword ? 2 : 6,
                mt: 0.5
              }}
            >
              {showPassword ? result.newPassword : '••••••••••'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small" variant="outlined"
              onClick={() => setShowPassword(v => !v)}
              sx={{ minWidth: 'auto', p: 0.8, borderRadius: 2 }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Button
              id="copy-new-password-btn"
              size="small" variant="contained" color="secondary"
              startIcon={<Copy size={14} />}
              onClick={handleCopy}
              sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none', fontSize: '0.75rem' }}
            >
              {copied ? '✓ Đã sao chép' : 'Sao chép'}
            </Button>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          Tài khoản: <strong>{result.email}</strong>
        </Typography>

        <Button
          id="back-to-login-after-reset-btn"
          variant="contained" color="primary" fullWidth size="large"
          onClick={onBackToLogin}
          sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
        >
          Đăng nhập với mật khẩu mới
        </Button>
      </Box>
    );
  }

  // ── Form nhập email ────────────────────────────────────────────────────────

  return (
    <Box id="forgot-password-form">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ p: 1, bgcolor: 'rgba(234, 88, 12, 0.08)', borderRadius: 2 }}>
          <RefreshCw size={20} color="#ea580c" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', lineHeight: 1.2 }}>
            Quên mật khẩu?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Nhập email hoặc username, hệ thống sẽ tạo mật khẩu mới.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert id="forgot-password-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            id="forgot-password-identifier-field"
            label="Email hoặc Username"
            fullWidth
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            disabled={loading}
            placeholder="Nhập email đăng ký hoặc username"
            slotProps={{ input: {
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <Mail size={18} />
                </Box>
              )
            } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Button
            id="forgot-password-submit-btn"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? undefined : <KeyRound size={18} />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
          >
            {loading ? 'Đang tạo mật khẩu mới...' : 'Lấy mật khẩu mới'}
          </Button>

          <Divider />

          <Button
            id="back-to-login-from-forgot-btn"
            variant="text" color="inherit"
            onClick={onBackToLogin}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            ← Quay lại đăng nhập
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ForgotPasswordForm;
