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
        borderRadius: 0,
        borderColor: 'var(--vien-2)',
        backgroundColor: 'var(--nen-luc-nhat2)',
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
                Đã gửi đơn xin vào lớp!
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đơn vào lớp <strong>{success}</strong> đã gửi tới giáo viên. Khi được
                duyệt, giáo viên sẽ thấy tiến độ học tập của bạn.
              </Typography>
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Form nhập mã */}
      <Collapse in={!success}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', pr: 3 }}>
          <Box sx={{
            p: 1, bgcolor: 'var(--nen-luc-nhat2)',
            borderRadius: 0, display: 'flex', flexShrink: 0, mt: 0.5,
          }}>
            <School size={18} color="var(--luc-tham)" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Bạn có mã lớp do giáo viên cấp?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
              Nhập mã lớp để xin vào lớp. Giáo viên duyệt xong thì thầy cô mới theo
              dõi được tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: 0, py: 0.5 }}>
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
                        <School size={14} color="var(--luc-tham)" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  width: 200,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&.Mui-focused fieldset': { borderColor: 'var(--luc-tham)' },
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.95rem',
                    letterSpacing: '0.15em',
                    fontWeight: 700,
                    color: 'var(--luc-tham)',
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
                  borderRadius: 0,
                  bgcolor: 'var(--luc-tham-nen)',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: 'var(--nen-dam)', boxShadow: 'none' },
                  '&:disabled': { bgcolor: 'var(--nen-tat)' },
                }}
              >
                {loading ? 'Đang xử lý...' : 'Gửi đơn'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default JoinClassForm;
