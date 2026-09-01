import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, Alert, Grid
} from '@mui/material';
import { Copy, Eye, EyeOff, Trash2, Shield, ShieldAlert, ShieldCheck, KeyRound } from 'lucide-react';
import { User as UserType } from '../../features/auth/types';
import { useApp } from '../hooks/useApp';

// ─── CredentialDialog (shared inline) ─────────────────────────────────────────

interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  credentials: { identifier: string; password: string; name: string } | null;
}

const CredentialDialog: React.FC<CredentialDialogProps> = ({ open, onClose, credentials }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setShowPassword(false);
  }, [open]);

  const copyAll = () => {
    if (!credentials) return;
    const text = `Thông tin đăng nhập:\nHọ tên: ${credentials.name}\nTài khoản: ${credentials.identifier}\nMật khẩu: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#0f766e', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShieldCheck size={24} />
        Mật khẩu đã được cấp lại!
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Sao chép và cấp thông tin này cho người dùng ngay bây giờ. Mật khẩu sẽ không hiển thị lại ở bất kỳ đâu trong hệ thống!
        </Alert>

        {credentials && (
          <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, bgcolor: '#f8fafc' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>HỌ TÊN</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{credentials.name}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>TÀI KHOẢN ĐĂNG NHẬP</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#0f766e' }}>
                  {credentials.identifier}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>MẬT KHẨU MỚI</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#ea580c', letterSpacing: showPassword ? 0 : 4 }}>
                    {showPassword ? credentials.password : '••••••••••'}
                  </Typography>
                  <IconButton size="small" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<Copy size={16} />}
          onClick={copyAll}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {copied ? '✓ Đã sao chép!' : 'Sao chép tất cả'}
        </Button>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};


interface Props {
  users: UserType[];
}

export const PasswordManagement: React.FC<Props> = ({ users }) => {
  const { forgotPassword } = useApp();
  
  const [resetRequests, setResetRequests] = useState<UserType[]>([]);
  const [credentialDialog, setCredentialDialog] = useState<{ identifier: string; password: string; name: string } | null>(null);

  useEffect(() => {
    const students = users.filter(u => u.role === 'student');
    if (students.length > 0 && resetRequests.length === 0) {
      setResetRequests(students.slice(0, Math.min(2, students.length)));
    }
  }, [users]);

  const handleResetPassword = async (user: UserType) => {
    const identifier = user.email || user.username!;
    const res = await forgotPassword(identifier);
    if (res.success && res.newPassword) {
      setCredentialDialog({
        identifier: identifier,
        password: res.newPassword,
        name: user.name,
      });
      setResetRequests(prev => prev.filter(req => req.id !== user.id));
    } else {
      alert("Lỗi khi cấp lại mật khẩu: " + res.message);
    }
  };

  const removeRequest = (userId: string) => {
    setResetRequests(prev => prev.filter(req => req.id !== userId));
  };

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'admin': return <Chip size="small" label="Quản trị Website" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }} />;
      case 'school_admin': return <Chip size="small" label="Quản trị Trường học" sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }} />;
      case 'teacher': return <Chip size="small" label="Giáo viên" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 'bold' }} />;
      case 'student': return <Chip size="small" label="Học sinh" sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 'bold' }} />;
      default: return <Chip size="small" label={role} />;
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Phân cấp mật khẩu 3 hộp ngang */}
        <Grid container spacing={3}>
          {/* Hộp 1 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={20} color="#3b82f6" /> Mật khẩu Cấp 1
                </Typography>
                <Chip label="Bảo mật mặc định" size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Dành cho học sinh thường. Quy tắc: tối thiểu 8 ký tự, gồm chữ, số và ký tự đặc biệt.
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Tính năng đang được hoàn thiện
              </Alert>
            </Paper>
          </Grid>
          
          {/* Hộp 2 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShieldCheck size={20} color="#8b5cf6" /> Mật khẩu Cấp 2
                </Typography>
                <Chip label="Độ nâng cao" size="small" sx={{ bgcolor: '#ede9fe', color: '#6d28d9', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Dành cho học sinh đạt trên 8 điểm ở bài kiểm tra do AI chấm, được mở khoá nội dung nâng cao.
              </Typography>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Tính năng đang được hoàn thiện
              </Alert>
            </Paper>
          </Grid>
          
          {/* Hộp 3 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #fed7aa', bgcolor: '#fff7ed', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, color: '#9a3412' }}>
                  <ShieldAlert size={20} color="#ea580c" /> Khôi phục mật khẩu
                </Typography>
                <Chip label="Khẩn cấp" size="small" sx={{ bgcolor: '#ffedd5', color: '#c2410c', fontWeight: 'bold' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                Xử lý yêu cầu khôi phục mật khẩu từ học sinh.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                  Đang có {resetRequests.length} yêu cầu
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ─── DANH SÁCH YÊU CẦU KHÔI PHỤC (Box 3 Expand) ──────────────────── */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyRound size={20} color="#ea580c" />
          Danh sách yêu cầu cấp lại mật khẩu
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Họ Tên & Tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vai Trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Ngày Yêu Cầu</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Thao Tác</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', align: 'right' }}>Bỏ Qua</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resetRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Không có yêu cầu khôi phục mật khẩu nào.
                  </TableCell>
                </TableRow>
              ) : (
                resetRequests.map(req => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{req.name}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#0f766e' }}>{req.username || req.email}</Typography>
                    </TableCell>
                    <TableCell>{getRoleChip(req.role)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">Hôm nay</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<KeyRound size={14} />}
                        onClick={() => handleResetPassword(req)}
                        sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#ea580c', color: '#ea580c', fontWeight: 'bold' }}
                      >
                        Cấp lại mật khẩu
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Bỏ qua yêu cầu này">
                        <IconButton size="small" onClick={() => removeRequest(req.id)} sx={{ color: '#ef4444' }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <CredentialDialog
        open={Boolean(credentialDialog)}
        onClose={() => setCredentialDialog(null)}
        credentials={credentialDialog}
      />
    </Box>
  );
};

export default PasswordManagement;
