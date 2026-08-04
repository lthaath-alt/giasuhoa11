import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Button, Container, Avatar, Chip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  Alert, Snackbar, Tooltip, Divider, Badge,
} from '@mui/material';
import {
  GraduationCap, LogOut, Users, UserPlus, Copy, Eye, EyeOff,
  BookOpen, CheckCircle, Clock, Key,
} from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { CreateStudentData } from '../core/contexts/AppContext';
import { TeacherClassManager } from '../features/teacher/components/TeacherClassManager';
import { ManagementLayout } from '../core/components/ManagementLayout';
import AccountManagement from '../core/components/AccountManagement';
import ClassManagement from '../core/components/ClassManagement';
import LibraryManagement from '../core/components/LibraryManagement';
import DatabankManagement from '../core/components/DatabankManagement';

// ─── Credential Display Dialog ────────────────────────────────────────────────

interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  credentials: { identifier: string; password: string; name: string } | null;
}

const CredentialDialog: React.FC<CredentialDialogProps> = ({ open, onClose, credentials }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    if (!credentials) return;
    const text = `Thông tin đăng nhập:\n` +
      `Họ tên: ${credentials.name}\n` +
      `Tài khoản: ${credentials.identifier}\n` +
      `Mật khẩu: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#0f766e', color: '#fff', fontWeight: 'bold' }}>
        ✅ Tài khoản đã được tạo thành công!
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Sao chép và cấp thông tin này cho học sinh ngay bây giờ. Mật khẩu sẽ không hiển thị lại!
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>MẬT KHẨU</Typography>
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

// ─── Create Student Dialog ────────────────────────────────────────────────────

interface CreateStudentDialogProps {
  open: boolean;
  onClose: () => void;
  classId: string;
  schoolId: string;
  onCreated: (creds: { identifier: string; password: string; name: string }) => void;
}

const CreateStudentDialog: React.FC<CreateStudentDialogProps> = ({
  open, onClose, classId, schoolId, onCreated
}) => {
  const { createStudent } = useApp();
  const [name, setName] = useState('');
  const [useEmail, setUseEmail] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError(null);
    if (!name.trim()) { setError('Vui lòng nhập họ tên học sinh.'); return; }
    if (!identifier.trim()) { setError('Vui lòng nhập email hoặc username.'); return; }

    setLoading(true);
    const data: CreateStudentData = {
      name: name.trim(),
      classId,
      schoolId,
      ...(useEmail ? { email: identifier.trim() } : { username: identifier.trim() }),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    const res = await createStudent(data);
    setLoading(false);

    if (res.success && res.credentials) {
      setName(''); setIdentifier(''); setPassword(''); setError(null);
      onCreated(res.credentials);
      onClose();
    } else {
      setError(res.message);
    }
  };

  const handleClose = () => {
    setName(''); setIdentifier(''); setPassword(''); setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserPlus size={20} color="#0f766e" />
          Thêm học sinh vào lớp
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Họ và tên học sinh *"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />

          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label="Dùng Email"
                size="small"
                color={useEmail ? 'primary' : 'default'}
                onClick={() => setUseEmail(true)}
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="Dùng Username nội bộ"
                size="small"
                color={!useEmail ? 'secondary' : 'default'}
                onClick={() => setUseEmail(false)}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <TextField
              label={useEmail ? 'Email học sinh' : 'Username nội bộ (VD: hs_nguyenan_11a1)'}
              fullWidth
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              disabled={loading}
              type={useEmail ? 'email' : 'text'}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Box>

          <TextField
            label="Mật khẩu (để trống để tạo tự động)"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            type="password"
            helperText="Nếu để trống, hệ thống sẽ tạo mật khẩu ngẫu nhiên mạnh."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>Hủy</Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreate}
          disabled={loading}
          startIcon={<UserPlus size={16} />}
          sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}
        >
          {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── TeacherPage ──────────────────────────────────────────────────────────────

export const TeacherPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, users, logout, getMyClass } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [credentialDialog, setCredentialDialog] = useState<{
    identifier: string; password: string; name: string
  } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const myClass = getMyClass();
  const studentIdentifiers = myClass?.studentIdentifiers || [];

  // Lấy danh sách User object của học sinh trong lớp
  const myStudents = users.filter(u =>
    studentIdentifiers.some(id =>
      id.toLowerCase() === u.email.toLowerCase() ||
      (u.username && id.toLowerCase() === u.username.toLowerCase())
    )
  );

  const copyInviteCode = () => {
    if (!myClass?.inviteCode) return;
    navigator.clipboard.writeText(myClass.inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleStudentCreated = (creds: { identifier: string; password: string; name: string }) => {
    setCredentialDialog(creds);
    setCreateOpen(false);
  };

  return (
    <Box id="teacher-page" sx={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>

      {/* NAVBAR — giữ nguyên */}
      <AppBar id="teacher-app-bar" position="static" color="inherit" elevation={0}
        sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 0 } }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, backgroundColor: 'rgba(15, 118, 110, 0.1)', borderRadius: 2, display: 'flex' }}>
                <GraduationCap size={22} color="#0f766e" />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a', lineHeight: 1.2 }}>
                  {myClass ? `Lớp ${myClass.name}` : 'Không gian Giáo viên'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gia sư Hóa học 11 AI
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(15, 118, 110, 0.1)', color: '#0f766e', width: 36, height: 36, fontWeight: 'bold' }}>
                  {currentUser?.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {currentUser?.name}
                  </Typography>
                  <Chip label="GIÁO VIÊN" size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', bgcolor: '#0f766e', color: '#fff' }} />
                </Box>
              </Box>

              <Button
                id="teacher-view-study-btn"
                variant="outlined"
                size="small"
                startIcon={<BookOpen size={14} />}
                onClick={() => navigate('/dashboard')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', color: '#0f766e', borderColor: '#0f766e', '&:hover': { bgcolor: 'rgba(15,118,110,0.05)' } }}
              >
                Vào học tập
              </Button>

              <Button
                id="teacher-logout-btn"
                variant="contained"
                color="error"
                size="small"
                startIcon={<LogOut size={14} />}
                onClick={handleLogout}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
              >
                Đăng xuất
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MAIN CONTENT — ManagementLayout */}
      <ManagementLayout
        roleName="Giáo viên"
        classCount={myClass ? 1 : 0}
        accountCount={myStudents.length}
        questionCount={0}
        examCount={0}
        accountContent={
          <AccountManagement
            users={myStudents}
            classes={myClass ? [myClass] : []}
            canCreateStudent={Boolean(myClass)}
            onCreateStudentClick={() => setCreateOpen(true)}
          />
        }
        classContent={
          myClass ? (
            <ClassManagement
              classes={[myClass]}
              users={users}
              canCreate={false}
              onCreateClick={() => {}}
              onEditClick={() => {}}
              onDeleteClass={() => {}}
            />
          ) : (
            <Box sx={{ mt: 3 }}>
              <TeacherClassManager onClassCreated={() => {}} />
            </Box>
          )
        }
        libraryContent={<LibraryManagement />}
        databankContent={<DatabankManagement />}
      />

      {/* Dialogs — giữ nguyên */}
      {myClass && (
        <CreateStudentDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          classId={myClass.id}
          schoolId={myClass.schoolId}
          onCreated={handleStudentCreated}
        />
      )}

      <CredentialDialog
        open={Boolean(credentialDialog)}
        onClose={() => setCredentialDialog(null)}
        credentials={credentialDialog}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar}
      />
    </Box>
  );
};

export default TeacherPage;
