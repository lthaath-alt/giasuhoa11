import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Alert, Paper, MenuItem,
  CircularProgress, Collapse, IconButton,
} from '@mui/material';
import { School, CheckCircle, Clock, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';

interface JoinClassFormProps {
  /** Gọi khi đã gửi đơn xong (cha cần refresh hoặc dismiss banner) */
  onJoined?: (className: string) => void;
  /** Gọi khi người dùng bấm đóng banner */
  onDismiss?: () => void;
}

/**
 * JoinClassForm — Banner nhỏ hiển thị trong DashboardPage.
 * Chỉ xuất hiện khi currentUser là học sinh chưa có classId.
 * Cho phép CHỌN lớp từ danh sách rồi gửi đơn xin vào lớp (chờ giáo viên duyệt).
 * Đổi từ "gõ mã 6 ký tự" sang "chọn lớp" ngày 12/09/2026: mã sinh tự động
 * (X22P43, SDSAPT…) không ai đoán được, nên học sinh phải được đọc cho mới vào
 * được lớp. Bên dưới KHÔNG đổi — vẫn gửi `inviteCode` của lớp đã chọn, vì luật
 * Firestore chỉ cho học sinh ghi `pendingClassCode`, không cho ghi `classId`.
 * Nếu `currentUser.pendingClassCode` đã có sẵn (kể cả sau khi tải lại
 * trang), hiện banner "đang chờ duyệt" thay vì ô nhập — tránh học sinh
 * tưởng nhầm là chưa gửi gì.
 * Lịch sử học tập được GIỮ NGUYÊN.
 */
export const JoinClassForm: React.FC<JoinClassFormProps> = ({ onJoined, onDismiss }) => {
  const { currentUser, joinClassByCode, classes } = useApp();

  const [lopId, setLopId]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const maDaGui = currentUser?.pendingClassCode;
  /* CHỈ coi là "đang chờ duyệt" khi mã trùng một lớp THẬT. Màn đăng ký cố ý
     không tra mã (lúc đó chưa đăng nhập nên `classes` rỗng), nên một em gõ sai
     6 ký tự sẽ mang mã không trùng lớp nào. Mã đó không hiện ra ở màn nào của
     giáo viên, tức KHÔNG AI từ chối được để xoá nó. Nếu ta vẫn ẩn ô nhập theo
     nó thì em bị khoá khỏi mọi lớp và chỉ Firebase Console cứu được. Mã sai
     thì coi như chưa gửi gì — ô nhập vẫn hiện, em tự nhập lại. */
  const pendingCode = maDaGui && classes.some(
    c => c.inviteCode?.toUpperCase() === maDaGui.toUpperCase()
  ) ? maDaGui : undefined;

  /* Sắp theo tên để danh sách đọc được: 11A1, 11A2… rồi 11B1, 11H.
     `localeCompare` với 'vi' để tên có dấu không nhảy lung tung. */
  const dsLop = [...classes].sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const handleJoin = async () => {
    const lop = classes.find(c => c.id === lopId);
    if (!lop) { setError('Vui lòng chọn lớp của bạn.'); return; }
    /* Mã mời vẫn là cơ chế gửi đơn — luật Firestore chỉ cho học sinh ghi
       `pendingClassCode`, không cho ghi `classId`. Lớp thiếu mã là dữ liệu
       lệch, phải nói rõ chứ đừng gửi đơn rỗng. */
    if (!lop.inviteCode) {
      setError(`Lớp "${lop.name}" chưa có mã mời. Nhờ giáo viên tạo lại lớp.`);
      return;
    }
    setError(null);
    setLoading(true);
    const res = await joinClassByCode(lop.inviteCode);
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

      {/* Đơn đang chờ giáo viên duyệt — kể cả sau khi tải lại trang, suy ra
          thẳng từ currentUser.pendingClassCode, không phải state phiên này. */}
      <Collapse in={!success && Boolean(pendingCode)}>
        {pendingCode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              p: 1, bgcolor: 'var(--vang-nen)',
              borderRadius: 0, display: 'flex', flexShrink: 0,
            }}>
              <Clock size={18} color="var(--chu-tren-vang)" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
                Đơn xin vào lớp đang chờ duyệt
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bạn đã gửi mã <strong>{pendingCode}</strong> tới giáo viên. Khi được
                duyệt, bạn sẽ chính thức vào lớp và giáo viên sẽ thấy tiến độ học tập
                của bạn.
              </Typography>
            </Box>
          </Box>
        )}
      </Collapse>

      {/* Ô chọn lớp — chỉ hiện khi chưa gửi đơn nào (kể cả đơn cũ từ trước F5) */}
      <Collapse in={!success && !pendingCode}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', pr: 3 }}>
          <Box sx={{
            p: 1, bgcolor: 'var(--nen-luc-nhat2)',
            borderRadius: 0, display: 'flex', flexShrink: 0, mt: 0.5,
          }}>
            <School size={18} color="var(--luc-tham)" />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Bạn học lớp nào?
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
              Chọn lớp của bạn rồi gửi đơn. Giáo viên duyệt xong thì thầy cô mới
              theo dõi được tiến độ học. Lịch sử học hiện tại sẽ được giữ nguyên.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 1.5, borderRadius: 0, py: 0.5 }}>
                <Typography variant="caption">{error}</Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                id="join-class-select"
                select
                size="small"
                label="Chọn lớp"
                value={lopId}
                onChange={e => setLopId(e.target.value)}
                disabled={loading || dsLop.length === 0}
                helperText={dsLop.length === 0 ? 'Đang tải danh sách lớp…' : ' '}
                sx={{
                  minWidth: 240,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '&.Mui-focused fieldset': { borderColor: 'var(--luc-tham)' },
                  },
                }}
              >
                {dsLop.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
              <Button
                id="join-class-submit-btn"
                variant="contained"
                size="small"
                onClick={handleJoin}
                disabled={loading || !lopId}
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
