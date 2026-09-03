import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton, Collapse,
} from '@mui/material';
import {
  UserPlus, Eye, EyeOff, Key, Mail, User, School, ArrowLeft, CheckCircle,
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { useNavigate } from 'react-router-dom';

interface StudentRegisterFormProps {
  onBackToLogin: () => void;
}

/**
 * StudentRegisterForm
 * Học sinh tự đăng ký tài khoản với mã lớp tuỳ chọn.
 * - Có mã lớp → role=student, gán vào lớp.
 * - Không có mã lớp → role=student, chưa có classId.
 */
export const StudentRegisterForm: React.FC<StudentRegisterFormProps> = ({ onBackToLogin }) => {
  const { registerWithOptionalClass } = useApp();
  const navigate = useNavigate();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ className?: string } | null>(null);

  /* Kiểm ngay tại chỗ trước khi gọi Firebase.

     Bản trước CHỈ so hai ô mật khẩu. Để trống hết rồi bấm Đăng ký thì form gọi
     thẳng registerWithOptionalClass('', '', '') — đo được: màn hình không hiện
     báo lỗi nào, em ngồi bấm mãi mà không hiểu vì sao. Email sai định dạng cũng
     lọt xuống tận Firebase rồi trả về thông báo tiếng Anh.

     Yêu cầu "ít nhất 8 ký tự, gồm cả chữ và số" vốn chỉ được ghi làm chú thích
     dưới ô mật khẩu, chưa bao giờ được kiểm — dán vào đây cho khớp lời hứa. */
  const kiemDuLieu = (): string | null => {
    if (!name.trim()) return 'Em chưa nhập họ và tên.';
    if (!email.trim()) return 'Em chưa nhập email.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      return 'Email chưa đúng định dạng. Ví dụ đúng: ten@gmail.com';
    if (!password) return 'Em chưa nhập mật khẩu.';
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự.';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
      return 'Mật khẩu phải có cả chữ cái và chữ số.';
    if (password !== confirmPw) return 'Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.';
    return null;
  };

  /* Xoá báo lỗi ngay khi em sửa lại ô nhập.

     Bản trước chỉ xoá lúc bấm Đăng ký, nên câu "Mật khẩu xác nhận không khớp"
     vẫn nằm đó cả sau khi em đã gõ lại cho khớp — em tưởng mình vẫn sai. */
  const goLai = <T,>(dat: (v: T) => void) => (v: T) => { setError(null); dat(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sai = kiemDuLieu();
    if (sai) { setError(sai); return; }

    setLoading(true);
    const res = await registerWithOptionalClass(
      name.trim(),
      email.trim(),
      password,
      inviteCode.trim() || undefined
    );
    setLoading(false);

    if (res.success) {
      setSuccessInfo({});
      // Điều hướng sang dashboard sau 1.5 giây
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError(res.message);
    }
  };

  // ── Màn hình thành công ────────────────────────────────────────────────────

  if (successInfo !== null) {
    return (
      <Box id="student-register-success" sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%',
          bgcolor: 'rgba(16,185,129,0.12)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
        }}>
          <CheckCircle size={36} color="var(--luc)" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--luc)', mb: 1 }}>
          Đăng ký thành công!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Đang chuyển hướng vào trang học tập...
        </Typography>
      </Box>
    );
  }

  // ── Form đăng ký ───────────────────────────────────────────────────────────

  return (
    <Box id="student-register-form-container">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <UserPlus size={22} color="var(--cam)" />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
          Đăng ký học sinh
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Có mã lớp do giáo viên cấp? Điền vào bên dưới để được gắn vào lớp học ngay.
      </Typography>

      {error && (
        <Alert id="register-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Họ tên */}
          <TextField
            id="student-register-name"
            label="Họ và tên *"
            variant="outlined"
            fullWidth
            required
            value={name}
            onChange={e => goLai(setName)(e.target.value)}
            disabled={loading}
            placeholder="Nguyễn Văn An"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <User size={16} color="var(--chu-mo)" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Email */}
          <TextField
            id="student-register-email"
            label="Email *"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={e => goLai(setEmail)(e.target.value)}
            disabled={loading}
            placeholder="example@gmail.com"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={16} color="var(--chu-mo)" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Mật khẩu */}
          <TextField
            id="student-register-password"
            label="Mật khẩu *"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
            value={password}
            onChange={e => goLai(setPassword)(e.target.value)}
            disabled={loading}
            helperText="Ít nhất 8 ký tự, gồm cả chữ cái và chữ số"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Key size={16} color="var(--chu-mo)" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Xác nhận mật khẩu */}
          <TextField
            id="student-register-confirm-password"
            label="Xác nhận mật khẩu *"
            type={showConfirmPw ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
            value={confirmPw}
            onChange={e => goLai(setConfirmPw)(e.target.value)}
            disabled={loading}
            error={confirmPw.length > 0 && password !== confirmPw}
            helperText={confirmPw.length > 0 && password !== confirmPw ? 'Mật khẩu không khớp' : ''}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Key size={16} color="var(--chu-mo)" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirmPw(v => !v)} edge="end">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />

          {/* Mã lớp (tùy chọn) */}
          <Box sx={{
            p: 2, borderRadius: 3,
            border: '1px dashed var(--chu-mo)',
            bgcolor: inviteCode ? 'rgba(15,118,110,0.04)' : 'var(--nen-trang)',
            transition: 'all 0.2s',
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
              MÃ LỚP (TUỲ CHỌN)
            </Typography>
            <TextField
              id="student-register-invite-code"
              label="Mã lớp (6 ký tự)"
              variant="outlined"
              fullWidth
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              disabled={loading}
              placeholder="VD: ABC123"
              helperText="Nhận từ giáo viên. Để trống nếu học tự do."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <School size={16} color={inviteCode ? 'var(--teal)' : 'var(--chu-mo)'} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  ...(inviteCode && { borderColor: 'var(--teal)' }),
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  letterSpacing: '0.2em',
                  fontWeight: 'bold',
                  color: inviteCode ? 'var(--teal)' : 'inherit',
                },
              }}
            />
          </Box>

          {/* Submit */}
          <Button
            id="student-register-submit-btn"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}
            sx={{
              py: 1.5, borderRadius: 3,
              fontWeight: 'bold', textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: '0 4px 12px rgba(234, 88, 12, 0.2)' },
            }}
          >
            {loading
              ? 'Đang tạo tài khoản...'
              : inviteCode
                ? 'Đăng ký & tham gia lớp học'
                : 'Đăng ký học tự do'
            }
          </Button>
        </Box>
      </form>

      {/* Quay lại */}
      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Button
          id="student-register-back-btn"
          variant="text"
          size="small"
          startIcon={<ArrowLeft size={14} />}
          onClick={onBackToLogin}
          sx={{ textTransform: 'none', color: 'var(--chu-2)', fontWeight: 600 }}
        >
          Quay lại đăng nhập
        </Button>
      </Box>
    </Box>
  );
};

export default StudentRegisterForm;
