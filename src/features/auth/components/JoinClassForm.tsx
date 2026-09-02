import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Paper, InputAdornment,
  CircularProgress, Collapse, IconButton,
} from '@mui/material';
import { School, CheckCircle, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface JoinClassFormProps {
  /** Gọi khi đã join thành công (cha cần refresh hoặc dismiss banner) */
  onJoined?: (className: string) => void;
  /** Gọi khi người dùng bấm đóng banner */
  onDismiss?: () => void;
}

/**
 * JoinClassForm — Banner nhỏ hiển thị trong DashboardPage.
 * Chỉ xuất hiện khi currentUser là học sinh chưa có classId.
 * Cho phép nhập mã lớp để chuyển sang học sinh được quản lý.
 * Lịch sử học tập được GIỮ NGUYÊN.
 */
export const JoinClassForm: React.FC<JoinClassFormProps> = ({ onJoined, onDismiss }) => {
  const { joinClassByCode } = useApp();

  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleJoin = async () => {
    if (!code.trim()) { setError('Vui lòng nhập mã lớp.'); return; }
    setError(null);
    setLoading(true);
    const res = await joinClassByCode(code.trim());
    setLoading(false);

    if (res.success && res.className) {
      setSuccess(res.className);
      setTimeout(() => {
        onJoined?.(res.className!);
      }, 2000);
    } else {
      setError(res.message);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Paper
      id="join-class-banner"
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        borderColor: 'rgba(15,118,110,0.3)',
        background: 'linear-gradient(135deg, rgba(15,118,110,0.04) 0%, rgba(15,118,110,0.01) 100%)',
        position: 'relative',
      }}
    >
      {/* Nút đóng */}
      <IconButton
        id="join-class-dismiss-btn"
        size="small"
        onClick={handleDismiss}
        sx={{ position: 'absolute', top: 8, right: 8, color: 'var(--chu-mo)' }}
        title="Bỏ qua"
      >
        <X size={16} />
      </IconButton>

      {/* Thành công */}
      <Collapse in={Boolean(success)}>
        {success && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle size={20} color="var(--luc)" />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--luc)' }}>
                Tham gia lớp thành công!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bạn đã được thêm vào lớp <strong>{success}</strong>. Giáo viên của bạn sẽ thấy tiến độ học tập.
              </Typography>
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Form nhập mã */}
      <Collapse in={!success}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', pr: 3 }}>
          <Box sx={{
            p: 1, bgcolor: 'rgba(15,118,110,0.1)',
            borderRadius: 2, display: 'flex', flexShrink: 0, mt: 0.5,
          }}>
            <School size={18} color="var(--teal)" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Bạn có mã lớp do giáo viên cấp?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
              Nhập mã lớp để được giáo viên theo dõi tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.5 }}>
                <Typography variant="caption">{error}</Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                id="join-class-code-input"
                size="small"
                placeholder="Mã lớp (VD: ABC123)"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <School size={14} color="var(--teal)" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  width: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    '&.Mui-focused fieldset': { borderColor: 'var(--teal)' },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    color: 'var(--teal)',
                  },
                }}
              />
              <Button
                id="join-class-submit-btn"
                variant="contained"
                size="small"
                onClick={handleJoin}
                disabled={loading || code.length < 4}
                startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <ArrowRight size={14} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  borderRadius: 2.5,
                  bgcolor: 'var(--teal-nen)',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#0d9488', boxShadow: '0 2px 8px rgba(15,118,110,0.25)' },
                  '&:disabled': { bgcolor: 'var(--chu-mo)' },
                }}
              >
                {loading ? 'Đang xử lý...' : 'Tham gia lớp'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default JoinClassForm;
