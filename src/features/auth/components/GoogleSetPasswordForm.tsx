import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, LinearProgress,
  InputAdornment, IconButton
} from '@mui/material';
import { KeyRound, Eye, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { GoogleUserInfo } from '../../../core/services/googleAuth';

interface GoogleSetPasswordFormProps {
  googleInfo: GoogleUserInfo;
  onSuccess: () => void;
  onCancel: () => void;
}

/** Kiểm tra độ mạnh mật khẩu: ≥8 ký tự, có chữ và số */
function checkPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (pw.length === 0) return { score: 0, label: '', color: '#e2e8f0' };
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasDigit  = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const longEnough = pw.length >= 8;
  const veryLong   = pw.length >= 12;

  const score = [hasLetter, hasDigit, longEnough, hasSpecial, veryLong]
    .filter(Boolean).length;

  if (score <= 2) return { score: 20, label: 'Yếu',     color: '#ef4444' };
  if (score === 3) return { score: 55, label: 'Trung bình', color: '#f59e0b' };
  if (score === 4) return { score: 80, label: 'Tốt',     color: '#0f766e' };
  return               { score: 100, label: 'Rất mạnh', color: '#059669' };
}

export const GoogleSetPasswordForm: React.FC<GoogleSetPasswordFormProps> = ({
  googleInfo,
  onSuccess,
  onCancel,
}) => {
  const { completeGoogleRegistration } = useApp();
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showCf, setShowCf]           = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  const strength = checkPasswordStrength(password);
  const passwordsMatch = password && confirm && password === confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Mật khẩu phải chứa cả chữ cái và chữ số.');
      return;
    }
    if (password !== confirm) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    const res = await completeGoogleRegistration(googleInfo, password);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message);
    }
  };

  return (
    <Box id="google-set-password-form">
      {/* Thông tin Google đã xác thực */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 2,
        bgcolor: 'rgba(15, 118, 110, 0.06)', borderRadius: 2,
        border: '1px solid rgba(15, 118, 110, 0.15)', mb: 3
      }}>
        {googleInfo.picture ? (
          <img src={googleInfo.picture} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>{googleInfo.name.charAt(0)}</Typography>
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
            {googleInfo.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">{googleInfo.email}</Typography>
        </Box>
        <ShieldCheck size={18} color="#0f766e" style={{ marginLeft: 'auto' }} />
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 0.5 }}>
        Thiết lập mật khẩu
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Đặt mật khẩu riêng để đăng nhập bằng email + mật khẩu lần sau.
        Mật khẩu phải có <strong>ít nhất 8 ký tự</strong>, gồm <strong>chữ cái và chữ số</strong>.
      </Typography>

      {error && (
        <Alert id="set-password-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          <Box>
            <TextField
              id="set-password-field"
              label="Mật khẩu mới"
              type={showPw ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{ input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(v => !v)} edge="end">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                )
              } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            {/* Thanh độ mạnh */}
            {password && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 6, borderRadius: 3,
                    bgcolor: '#e2e8f0',
                    '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 3 }
                  }}
                />
                <Typography variant="caption" sx={{ color: strength.color, fontWeight: 'bold', mt: 0.5, display: 'block' }}>
                  Độ mạnh: {strength.label}
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            id="set-password-confirm-field"
            label="Xác nhận mật khẩu"
            type={showCf ? 'text' : 'password'}
            fullWidth
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            disabled={loading}
            error={Boolean(confirm && !passwordsMatch)}
            helperText={confirm && !passwordsMatch ? 'Mật khẩu không khớp' : ''}
            slotProps={{ input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowCf(v => !v)} edge="end">
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              )
            } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          <Button
            id="set-password-submit-btn"
            type="submit"
            variant="contained"
            color="secondary"
            size="large"
            disabled={loading || !passwordsMatch}
            startIcon={loading ? undefined : <CheckCircle2 size={18} />}
            sx={{ py: 1.5, borderRadius: 3, fontWeight: 'bold', textTransform: 'none', boxShadow: 'none' }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={onCancel}
            disabled={loading}
            sx={{ textTransform: 'none', color: 'text.secondary' }}
          >
            ← Quay lại
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default GoogleSetPasswordForm;
