import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Alert, Chip,
  CircularProgress, Divider, Tooltip, IconButton,
} from '@mui/material';
import { Plus, Copy, School, CheckCircle, Users } from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import type { SchoolClass } from '../../../features/auth/types';

interface TeacherClassManagerProps {
  /** Gọi sau khi tạo lớp thành công (cha reload) */
  onClassCreated?: (schoolClass: SchoolClass) => void;
}

/**
 * TeacherClassManager
 * Hiển thị khi giáo viên chưa có lớp nào.
 * Cho phép GV tự tạo lớp (không qua Admin) và xem mã mời.
 */
export const TeacherClassManager: React.FC<TeacherClassManagerProps> = ({ onClassCreated }) => {
  const { createClassSelf } = useApp();

  const [className, setClassName] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [created, setCreated]     = useState<SchoolClass | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCreate = async () => {
    if (!className.trim()) { setError('Vui lòng nhập tên lớp.'); return; }
    setError(null);
    setLoading(true);
    const res = await createClassSelf(className.trim());
    setLoading(false);

    if (res.success && res.schoolClass) {
      setCreated(res.schoolClass);
      onClassCreated?.(res.schoolClass);
    } else {
      setError(res.message);
    }
  };

  const copyCode = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ── Màn hình sau khi tạo lớp thành công ───────────────────────────────────

  if (created) {
    return (
      <Paper
        id="teacher-class-created-panel"
        variant="outlined"
        sx={{ p: 3, borderRadius: 3, borderColor: 'rgba(15,118,110,0.3)', bgcolor: 'rgba(15,118,110,0.02)' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <CheckCircle size={22} color="var(--teal)" />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--teal)' }}>
            Lớp "{created.name}" đã được tạo!
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
          Chia sẻ <strong>mã lớp</strong> dưới đây cho học sinh. Học sinh nhập mã khi đăng ký hoặc
          trong trang học tập để được thêm vào lớp.
        </Typography>

        {/* Mã mời nổi bật */}
        <Box
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            p: 2, px: 3, borderRadius: 3,
            border: '2px dashed var(--teal)',
            bgcolor: 'rgba(15,118,110,0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s',
            '&:hover': { bgcolor: 'rgba(15,118,110,0.10)', transform: 'scale(1.02)' },
          }}
          onClick={copyCode}
          title="Nhấn để sao chép"
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 900,
              letterSpacing: '0.3em',
              color: 'var(--teal)',
              userSelect: 'all',
            }}
          >
            {created.inviteCode}
          </Typography>
          <Tooltip title={codeCopied ? '✓ Đã sao chép!' : 'Sao chép mã lớp'}>
            <IconButton size="small" color={codeCopied ? 'success' : 'default'}>
              <Copy size={18} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`0 học sinh`} size="small" icon={<Users size={12} />} variant="outlined" />
          <Chip label="Đang hoạt động" size="small" color="success" />
        </Box>
      </Paper>
    );
  }

  // ── Form tạo lớp mới ────────────────────────────────────────────────────────

  return (
    <Paper
      id="teacher-create-class-panel"
      variant="outlined"
      sx={{ p: 3, borderRadius: 3 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <Box sx={{ p: 1, bgcolor: 'rgba(15,118,110,0.08)', borderRadius: 2, display: 'flex' }}>
          <School size={20} color="var(--teal)" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', lineHeight: 1.2 }}>
            Tạo lớp của riêng bạn
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Không cần chờ Admin — tạo ngay và nhận mã mời cho học sinh
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <TextField
          id="teacher-class-name-input"
          label="Tên lớp"
          size="small"
          value={className}
          onChange={e => setClassName(e.target.value)}
          disabled={loading}
          placeholder="VD: 11A1 – HK1/2026"
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          sx={{
            flex: 1,
            minWidth: 200,
            '& .MuiOutlinedInput-root': { borderRadius: 2.5 },
          }}
        />
        <Button
          id="teacher-create-class-btn"
          variant="contained"
          size="small"
          onClick={handleCreate}
          disabled={loading || !className.trim()}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Plus size={14} />}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: 2.5,
            bgcolor: 'var(--teal-nen)',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#0d9488', boxShadow: '0 2px 8px rgba(15,118,110,0.25)' },
            '&:disabled': { bgcolor: 'var(--chu-mo)' },
          }}
        >
          {loading ? 'Đang tạo...' : 'Tạo lớp'}
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, lineHeight: 1.6 }}>
        💡 Sau khi tạo, hệ thống sẽ sinh <strong>mã lớp 6 ký tự</strong> tự động.
        Chia sẻ mã này để học sinh tự tham gia.
      </Typography>
    </Paper>
  );
};

export default TeacherClassManager;
