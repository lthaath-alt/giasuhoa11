import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography,
  Alert, Paper, Divider, IconButton, Button, TextField, Chip
} from '@mui/material';
import { Eye, EyeOff, Copy, UserPlus, Plus, GraduationCap, Building2, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../../core/hooks/useApp';
import { CreateTeacherData, CreateSchoolAdminData } from '../../../../core/contexts/AppContext';

export interface CredentialInfo { identifier: string; password: string; name: string; }

export const CredentialDialog: React.FC<{ open: boolean; onClose: () => void; credentials: CredentialInfo | null }> = ({ open, onClose, credentials }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    if (!credentials) return;
    const text = `Họ tên: ${credentials.name}\nTài khoản: ${credentials.identifier}\nMật khẩu: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#ea580c', color: '#fff', fontWeight: 'bold' }}>
        ✅ Tài khoản Giáo viên đã được tạo!
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Cấp thông tin này cho giáo viên ngay. Mật khẩu sẽ không hiển thị lại!
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
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>EMAIL ĐĂNG NHẬP</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#ea580c' }}>{credentials.identifier}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>MẬT KHẨU</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#0f766e', letterSpacing: showPassword ? 0 : 4 }}>
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
        <Button variant="outlined" startIcon={<Copy size={16} />} onClick={copyAll} sx={{ borderRadius: 2, textTransform: 'none' }}>
          {copied ? '✓ Đã sao chép!' : 'Sao chép'}
        </Button>
        <Button variant="contained" color="primary" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export const CreateTeacherDialog: React.FC<{ open: boolean; onClose: () => void; schoolId: string; onCreated: (c: CredentialInfo) => void }> = ({ open, onClose, schoolId, onCreated }) => {
  const { createTeacher } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) { setError('Vui lòng nhập đầy đủ họ tên và email.'); return; }
    setLoading(true);
    const data: CreateTeacherData = { name: name.trim(), email: email.trim(), schoolId, ...(password.trim() ? { password: password.trim() } : {}) };
    const res = await createTeacher(data);
    setLoading(false);
    if (res.success && res.credentials) {
      setName(''); setEmail(''); setPassword(''); setError(null);
      onCreated(res.credentials); onClose();
    } else setError(res.message);
  };

  const handleClose = () => { setName(''); setEmail(''); setPassword(''); setError(null); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserPlus size={20} color="#ea580c" /> Tạo tài khoản Giáo viên
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Họ và tên *" fullWidth value={name} onChange={e => setName(e.target.value)} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Email *" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Mật khẩu (để trống để tạo tự động)" type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} disabled={loading} helperText="Để trống sẽ tạo mật khẩu ngẫu nhiên." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={handleCreate} disabled={loading} startIcon={<UserPlus size={16} />} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
          {loading ? 'Đang tạo...' : 'Tạo giáo viên'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CreateClassDialog: React.FC<{ open: boolean; onClose: () => void; schoolId: string }> = ({ open, onClose, schoolId }) => {
  const { createClass, users } = useApp();
  const [className, setClassName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const teachers = users.filter(u => u.role === 'teacher' && (u.schoolId === schoolId || !u.schoolId));

  const handleCreate = async () => {
    if (!className.trim() || !teacherEmail.trim()) { setError('Vui lòng nhập tên lớp và chọn giáo viên.'); return; }
    setLoading(true);
    const res = await createClass(schoolId, className.trim(), teacherEmail.trim());
    setLoading(false);
    if (res.success) { setClassName(''); setTeacherEmail(''); setError(null); onClose(); }
    else setError(res.message);
  };

  const handleClose = () => { setClassName(''); setTeacherEmail(''); setError(null); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><GraduationCap size={20} color="#ea580c" /> Tạo lớp học mới</Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Tên lớp *" fullWidth value={className} onChange={e => setClassName(e.target.value)} disabled={loading} placeholder="VD: 11A1, 11 Toán" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          {teachers.length > 0 ? (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 'bold' }}>CHỌN GIÁO VIÊN CHỦ NHIỆM</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {teachers.map(t => (
                  <Chip key={t.email} label={t.name} onClick={() => setTeacherEmail(t.email)}
                    color={teacherEmail === t.email ? 'primary' : 'default'} sx={{ cursor: 'pointer', fontWeight: 600 }} />
                ))}
              </Box>
              {teacherEmail && <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>✓ {teacherEmail}</Typography>}
            </Box>
          ) : (
            <TextField label="Email Giáo viên chủ nhiệm *" type="email" fullWidth value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)} disabled={loading} helperText="Chưa có giáo viên, nhập email trực tiếp." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={handleCreate} disabled={loading} startIcon={<Plus size={16} />} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
          {loading ? 'Đang tạo...' : 'Tạo lớp'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Create School Dialog ─────────────────────────────────────────────────────

export const CreateSchoolDialog: React.FC<{ open: boolean; onClose: () => void; adminEmail: string }> = ({ open, onClose, adminEmail }) => {
  const { createSchool } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setError('Tên trường không được để trống.'); return; }
    setLoading(true);
    const res = await createSchool(name.trim(), adminEmail);
    setLoading(false);
    if (res.success) { setName(''); setError(null); onClose(); }
    else setError(res.message);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Building2 size={20} color="#ea580c" />  Thêm trường học mới
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <TextField
          autoFocus label="Tên trường học *" fullWidth value={name}
          onChange={e => setName(e.target.value)} disabled={loading}
          sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          placeholder="VD: THPT Nguyễn Du"
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={handleCreate} disabled={loading}
          startIcon={<Plus size={16} />} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
          {loading ? 'Đang tạo...' : 'Tạo trường'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CreateSchoolAdminDialog: React.FC<{ open: boolean; onClose: () => void; schoolId: string; onCreated: (c: CredentialInfo) => void }> = ({ open, onClose, schoolId, onCreated }) => {
  const { createSchoolAdmin } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) { setError('Vui lòng nhập đầy đủ họ tên và email.'); return; }
    setLoading(true);
    const data: CreateSchoolAdminData = { name: name.trim(), email: email.trim(), schoolId, ...(password.trim() ? { password: password.trim() } : {}) };
    const res = await createSchoolAdmin(data);
    setLoading(false);
    if (res.success && res.credentials) {
      setName(''); setEmail(''); setPassword(''); setError(null);
      onCreated(res.credentials); onClose();
    } else setError(res.message);
  };

  const handleClose = () => { setName(''); setEmail(''); setPassword(''); setError(null); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={20} color="#ea580c" /> Tạo tài khoản Admin Trường
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Họ và tên *" fullWidth value={name} onChange={e => setName(e.target.value)} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Email *" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} disabled={loading} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <TextField label="Mật khẩu (để trống để tạo tự động)" type="password" fullWidth value={password} onChange={e => setPassword(e.target.value)} disabled={loading} helperText="Để trống sẽ tạo mật khẩu ngẫu nhiên." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none', borderRadius: 2 }}>Hủy</Button>
        <Button variant="contained" color="primary" onClick={handleCreate} disabled={loading} startIcon={<ShieldCheck size={16} />} sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
          {loading ? 'Đang tạo...' : 'Tạo Admin'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
