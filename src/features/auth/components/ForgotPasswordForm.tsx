import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Divider
} from '@mui/material';
import { Mail, KeyRound, RefreshCw } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const { forgotPassword } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  /* Từ 10/09/2026 màn này KHÔNG còn hiện mật khẩu mới.
     Trước đó `forgotPassword` tự sinh mật khẩu, ghi thẳng vào Firestore rồi
     khoe lên đây kèm nút sao chép. Nay Firebase Auth giữ mật khẩu ở dạng đã
     băm và chỉ gửi thư đặt lại — không ai đọc hay đặt hộ được nữa.
     Nếu không sửa màn này thì nó vẫn chạy nhưng SAI HOÀN TOÀN: điều kiện
     `res.newPassword` không bao giờ đúng, nên câu báo THÀNH CÔNG của hệ thống
     lại hiện ra ở ô màu đỏ dành cho lỗi. */
  const [daGui, setDaGui]           = useState<{ email: string; loiNhan: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Vui lòng nhập email tài khoản của bạn.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await forgotPassword(identifier.trim());
    setLoading(false);

    if (res.success) setDaGui({ email: identifier.trim(), loiNhan: res.message });
    else setError(res.message);
  };

  // ── Màn hình kết quả ───────────────────────────────────────────────────────

  if (daGui) {
    return (
      <Box id="forgot-password-result" sx={{ textAlign: 'center' }}>
        <Box sx={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          width: 64, height: 64, borderRadius: '50%',
          bgcolor: 'var(--nen-luc-nhat2)', border: '2px solid var(--vien-2)',
          mx: 'auto', mb: 2
        }}>
          <Mail size={28} color="var(--luc-tham)" />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
          Đã gửi thư đặt lại mật khẩu
        </Typography>

        {/* Câu này do `resetPasswordWithFirestore` trả về, và nó CỐ Ý giống hệt
            nhau dù email có tài khoản hay không — nói khác đi là biến màn này
            thành công cụ dò xem ai có tài khoản trong hệ thống. */}
        <Typography variant="body2" sx={{ color: 'var(--chu-2)', mb: 3, lineHeight: 1.7 }}>
          {daGui.loiNhan}
        </Typography>

        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 0, textAlign: 'left' }}>
          Mở thư rồi bấm đường dẫn trong đó để tự đặt mật khẩu mới. Đường dẫn chỉ
          dùng được một lần và sẽ hết hạn — không nhận được thì hãy xem hộp thư rác.
        </Alert>

        <Typography variant="caption" sx={{ color: 'var(--chu-2)', display: 'block', mb: 3 }}>
          Gửi tới: <strong>{daGui.email}</strong>
        </Typography>

        <Button
          id="back-to-login-after-reset-btn"
          variant="contained" color="primary" fullWidth size="large"
          onClick={onBackToLogin}
          sx={{ py: 1.5, borderRadius: 0, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
        >
          Quay lại đăng nhập
        </Button>
      </Box>
    );
  }

  // ── Form nhập email ────────────────────────────────────────────────────────

  return (
    <Box id="forgot-password-form">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ p: 1, bgcolor: 'var(--nen-tin-hieu-nhat2)', borderRadius: 0 }}>
          <RefreshCw size={20} color="var(--chu-dam)" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', lineHeight: 1.2 }}>
            Quên mật khẩu?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Nhập email tài khoản, hệ thống gửi thư để bạn tự đặt lại.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert id="forgot-password-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            id="forgot-password-identifier-field"
            label="Email tài khoản"
            fullWidth
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            disabled={loading}
            placeholder="Nhập email đăng ký"
            slotProps={{ input: {
              startAdornment: (
                <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <Mail size={18} />
                </Box>
              )
            } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          <Button
            id="forgot-password-submit-btn"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            startIcon={loading ? undefined : <KeyRound size={18} />}
            sx={{ py: 1.5, borderRadius: 0, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
          >
            {loading ? 'Đang gửi thư...' : 'Gửi thư đặt lại mật khẩu'}
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
