import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, CircularProgress,
  InputAdornment, IconButton,
} from '@mui/material';
import {
  UserPlus, Eye, EyeOff, Key, Mail, User, ArrowLeft, CheckCircle,
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface TeacherRegisterFormProps {
  onBackToLogin: () => void;
  /** Đăng ký xong thì mở màn ĐĂNG NHẬP (không phải quay về màn chọn kiểu tài khoản) */
  onDangKyXong: () => void;
}

/**
 * TeacherRegisterForm
 * Người ngoài tự đăng ký, xin làm giáo viên. Luôn ra `role: 'student'` trước —
 * luật Firestore bắt buộc vậy với mọi người tự đăng ký; đơn nằm ở
 * `pendingRole: 'teacher'` chờ chủ dự án/đồng quản trị duyệt (khung "Đơn xin
 * làm giáo viên" trong `AccountManagement.tsx`). Trong lúc chờ, tài khoản
 * dùng web như học sinh bình thường.
 */
export const TeacherRegisterForm: React.FC<TeacherRegisterFormProps> = ({ onBackToLogin, onDangKyXong }) => {
  const { registerTeacherApplicant, logout } = useApp();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState(false);

  /* Kiểm ngay tại chỗ trước khi gọi Firebase.

     Để trống hết rồi bấm Đăng ký mà không kiểm trước thì form sẽ gọi thẳng
     registerTeacherApplicant('', '', '') — màn hình không hiện báo lỗi nào,
     em ngồi bấm mãi mà không hiểu vì sao. Email sai định dạng cũng sẽ lọt
     xuống tận Firebase rồi trả về thông báo tiếng Anh.

     Yêu cầu "ít nhất 8 ký tự, gồm cả chữ và số" đã ghi làm chú thích dưới ô
     mật khẩu (`helperText`) nên phải kiểm đúng ở đây cho khớp lời hứa đó. */
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

  /* Xoá báo lỗi ngay khi em sửa lại ô nhập, để câu "Mật khẩu xác nhận không
     khớp" không nằm lỳ trên màn hình sau khi em đã gõ lại cho khớp — không
     thì em tưởng mình vẫn sai dù đã sửa đúng. */
  const goLai = <T,>(dat: (v: T) => void) => (v: T) => { setError(null); dat(v); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const sai = kiemDuLieu();
    if (sai) { setError(sai); return; }

    setLoading(true);
    const res = await registerTeacherApplicant(
      name.trim(),
      email.trim(),
      password
    );
    setLoading(false);

    if (res.success) {
      setSuccessInfo(true);
      /* Giống luồng học sinh: đẩy ra MÀN ĐĂNG NHẬP, không vào thẳng trang học.
         Tài khoản được tạo trên app CHÍNH nên Firebase đăng nhập luôn; không
         `logout()` thì màn đăng nhập thấy phiên còn sống và hiện "Tiếp tục
         với ...", trong khi người ta chưa gõ mật khẩu lần nào. */
      void logout();
      setTimeout(() => onDangKyXong(), 1500);
    } else {
      setError(res.message);
    }
  };

  // ── Màn hình thành công ────────────────────────────────────────────────────

  if (successInfo) {
    return (
      <Box id="teacher-register-success" sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%',
          bgcolor: 'var(--nen-luc-nhat2)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
        }}>
          <CheckCircle size={36} color="var(--luc)" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--luc)', mb: 1 }}>
          Đăng ký thành công!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Mời thầy cô đăng nhập bằng email và mật khẩu vừa tạo. Trong lúc chờ duyệt,
          tài khoản dùng web như học sinh.
        </Typography>
      </Box>
    );
  }

  // ── Form đăng ký ───────────────────────────────────────────────────────────

  return (
    <Box id="teacher-register-form-container">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <UserPlus size={22} color="var(--chu-dam)" />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
          Đăng ký làm giáo viên
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Tạo tài khoản xong, đơn của bạn sẽ chờ quản trị duyệt. Trong lúc chờ, bạn dùng web như học sinh.
      </Typography>

      {error && (
        <Alert id="teacher-register-error-alert" severity="error" sx={{ mb: 2.5, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Họ tên */}
          <TextField
            id="teacher-register-name"
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          {/* Email */}
          <TextField
            id="teacher-register-email"
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          {/* Mật khẩu */}
          <TextField
            id="teacher-register-password"
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          {/* Xác nhận mật khẩu */}
          <TextField
            id="teacher-register-confirm-password"
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
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
          />

          {/* Submit */}
          <Button
            id="teacher-register-submit-btn"
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <UserPlus size={18} />}
            sx={{
              py: 1.5, borderRadius: 0,
              fontWeight: 'bold', textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </Button>
        </Box>
      </form>

      {/* Quay lại */}
      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Button
          id="teacher-register-back-btn"
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

export default TeacherRegisterForm;
