import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Divider, Alert, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { User, Copy, Eye, EyeOff, Trash2, Shield, ShieldCheck, UserPlus, Users, GraduationCap, Edit, KeyRound } from 'lucide-react';
import { User as UserType, SchoolClass, School } from '../../features/auth/types';
import { useApp } from '../hooks/useApp';

export interface AccountManagementProps {
  users: UserType[];
  classes: SchoolClass[];
  /** Danh sách trường học (dùng để hiển thị Admin của từng trường) */
  schools?: School[];
  canCreateTeacher?: boolean;
  canCreateStudent?: boolean;
  canCreateClass?: boolean;
  /** Chỉ hiển thị với super_admin */
  canCreateSchoolAdmin?: boolean;
  onCreateTeacherClick?: () => void;
  onCreateStudentClick?: () => void;
  onCreateClassClick?: () => void;
  onCreateSchoolAdminClick?: (schoolId: string) => void;
}

// ─── CredentialDialog (shared inline) ─────────────────────────────────────────

interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  credentials: { identifier: string; password: string; name: string } | null;
}

const CredentialDialog: React.FC<CredentialDialogProps> = ({ open, onClose, credentials }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Đóng dialog thì reset trạng thái show
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
      <DialogTitle sx={{ bgcolor: '#0f766e', color: '#fff', fontWeight: 'bold' }}>
        ✅ Mật khẩu đã được cấp lại!
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

// ─── Component Chính ─────────────────────────────────────────────────────────

export const AccountManagement: React.FC<AccountManagementProps> = ({
  users,
  classes,
  schools = [],
  canCreateTeacher,
  canCreateStudent,
  canCreateClass,
  canCreateSchoolAdmin,
  onCreateTeacherClick,
  onCreateStudentClick,
  onCreateClassClick,
  onCreateSchoolAdminClick,
}) => {
  const { forgotPassword, deleteUser, updateUserInfo, currentUser } = useApp();

  // Khối 1: Danh sách yêu cầu khôi phục mật khẩu (mock state để hiển thị UI)
  const [resetRequests, setResetRequests] = useState<UserType[]>([]);
  // Trạng thái dialog cấp lại mật khẩu
  const [credentialDialog, setCredentialDialog] = useState<{ identifier: string; password: string; name: string } | null>(null);

  // Khối 2: Trạng thái xóa và sửa người dùng
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; username: string; classId: string }>({
    name: '', email: '', username: '', classId: ''
  });

  // Mock lấy 1-2 học sinh để làm mẫu "Yêu cầu khôi phục mật khẩu" nếu là Admin
  useEffect(() => {
    const students = users.filter(u => u.role === 'student');
    if (students.length > 0 && resetRequests.length === 0) {
      setResetRequests(students.slice(0, Math.min(2, students.length)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]); // Chỉ chạy khi users thay đổi

  const handleResetPassword = async (user: UserType) => {
    const identifier = user.email || user.username!;
    const res = await forgotPassword(identifier);
    if (res.success && res.newPassword) {
      setCredentialDialog({
        identifier: identifier,
        password: res.newPassword,
        name: user.name,
      });
      // Xóa khỏi danh sách yêu cầu
      setResetRequests(prev => prev.filter(req => req.id !== user.id));
    } else {
      alert("Lỗi khi cấp lại mật khẩu: " + res.message);
    }
  };

  const removeRequest = (userId: string) => {
    setResetRequests(prev => prev.filter(req => req.id !== userId));
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const handleEditOpen = (user: UserType) => {
    setUserToEdit(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      classId: user.classId || '',
    });
  };

  const handleEditSubmit = () => {
    if (userToEdit) {
      updateUserInfo(userToEdit.id, {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
        classId: editForm.classId || undefined,
      });
      setUserToEdit(null);
    }
  };

  const canEditOrDelete = (targetUser: UserType) => {
    if (!currentUser) return false;
    if (currentUser.id === targetUser.id) return false; // Không tự xoá/sửa mình
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'school_admin') {
      if (targetUser.role === 'super_admin' || targetUser.role === 'school_admin') return false;
      if (targetUser.schoolId !== currentUser.schoolId) return false;
      return true;
    }
    return false;
  };

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'super_admin': return <Chip size="small" label="Quản trị Website" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }} />;
      case 'school_admin': return <Chip size="small" label="Quản trị Trường học" sx={{ bgcolor: '#e0e7ff', color: '#4f46e5', fontWeight: 'bold' }} />;
      case 'teacher': return <Chip size="small" label="Giáo viên" sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 'bold' }} />;
      case 'student': return <Chip size="small" label="Học sinh" sx={{ bgcolor: '#dbeafe', color: '#2563eb', fontWeight: 'bold' }} />;
      case 'free_user': return <Chip size="small" label="Học sinh tự do" sx={{ bgcolor: '#f3f4f6', color: '#4b5563', fontWeight: 'bold' }} />;
      default: return <Chip size="small" label={role} />;
    }
  };

  const getClassName = (classId?: string) => {
    if (!classId) return '---';
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : '---';
  };

  return (
    <Box>
      {/* ─── KHỐI 1: KHÔI PHỤC MẬT KHẨU ─────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Shield size={20} color="#ea580c" />
          Khôi phục mật khẩu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Danh sách yêu cầu quên mật khẩu, tiến hành cấp lại mật khẩu mới cho người dùng.
        </Typography>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fff7ed' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#9a3412' }}>Họ Tên & Tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#9a3412' }}>Vai Trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#9a3412' }}>Ngày Yêu Cầu</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#9a3412' }}>Mật Khẩu Mới</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#9a3412', align: 'right' }}>Xóa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resetRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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

      {/* ─── KHỐI 2: DANH SÁCH NGƯỜI DÙNG ──────────────────────────────────── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={20} color="#0f766e" />
              Danh sách người dùng hệ thống ({users.length} tài khoản)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {canCreateSchoolAdmin && (
              <Button
                variant="contained"
                startIcon={<ShieldCheck size={16} />}
                onClick={() => onCreateSchoolAdminClick?.(schools[0]?.id || '')}
                sx={{
                  textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none',
                  bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' }
                }}
              >
                Thêm Admin Trường
              </Button>
            )}
            {canCreateClass && (
              <Button variant="outlined" color="primary" startIcon={<GraduationCap size={16} />} onClick={onCreateClassClick} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
                Tạo Lớp Mới
              </Button>
            )}
            {canCreateTeacher && (
              <Button variant="outlined" color="secondary" startIcon={<UserPlus size={16} />} onClick={onCreateTeacherClick} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}>
                Thêm tài khoản Giáo viên
              </Button>
            )}
            {canCreateStudent && (
              <Button variant="contained" color="primary" startIcon={<UserPlus size={16} />} onClick={onCreateStudentClick} sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}>
                Thêm tài khoản Học sinh
              </Button>
            )}
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Họ Tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Tên Đăng Nhập</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vai Trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Lớp Học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', align: 'right' }}>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#0f766e' }}>
                      {user.username || user.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {getClassName(user.classId)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {canEditOrDelete(user) && (
                      <>
                        <Tooltip title="Sửa thông tin">
                          <IconButton size="small" onClick={() => handleEditOpen(user)} sx={{ color: '#64748b' }}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa tài khoản">
                          <IconButton size="small" onClick={() => setUserToDelete(user)} sx={{ color: '#ef4444' }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* ─── KHỐI 3: DANH SÁCH ADMIN TRƯỜNG HỌC (chỉ hiển thị với super_admin có schools) ─── */}
      {canCreateSchoolAdmin && schools.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ShieldCheck size={20} color="#4f46e5" />
            Quản trị viên Trường học
          </Typography>

          {schools.map(school => {
            const admins = users.filter(u => u.role === 'school_admin' && u.schoolId === school.id);
            return (
              <Paper key={school.id} elevation={0} sx={{ border: '1px solid #e0e7ff', borderRadius: 3, mb: 2, overflow: 'hidden' }}>
                {/* Header của từng trường */}
                <Box sx={{ px: 3, py: 2, bgcolor: '#f5f3ff', borderBottom: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: '#e0e7ff', borderRadius: 1.5, display: 'flex' }}>
                      <ShieldCheck size={16} color="#4f46e5" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1e1b4b' }}>
                        {school.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admins.length > 0 ? `${admins.length} admin` : 'Chưa có admin'}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<UserPlus size={14} />}
                    onClick={() => onCreateSchoolAdminClick?.(school.id)}
                    sx={{
                      textTransform: 'none', borderRadius: 2, fontWeight: 'bold', fontSize: '0.78rem',
                      borderColor: '#6366f1', color: '#4f46e5',
                      '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' }
                    }}
                  >
                    Thêm Admin
                  </Button>
                </Box>

                {/* Danh sách admin của trường */}
                {admins.length === 0 ? (
                  <Box sx={{ px: 3, py: 2.5, color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8' }}>
                      ⚠️ Trường này chưa có Admin. Hãy thêm ít nhất một Admin để quản lý trường.
                    </Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8f7ff' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '0.78rem' }}>Họ Tên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '0.78rem' }}>Email Đăng Nhập</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '0.78rem' }}>Trạng Thái</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4f46e5', fontSize: '0.78rem', align: 'right' }}>Hành Động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {admins.map(admin => (
                        <TableRow key={admin.id} sx={{ '&:hover': { bgcolor: '#f5f3ff' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{admin.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#4f46e5', fontSize: '0.82rem' }}>
                              {admin.username || admin.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={admin.status === 'active' ? 'Hoạt động' : 'Khóa'}
                              sx={{
                                fontWeight: 'bold', fontSize: '0.7rem',
                                bgcolor: admin.status === 'active' ? 'rgba(79,70,229,0.1)' : 'rgba(239,68,68,0.1)',
                                color: admin.status === 'active' ? '#4f46e5' : '#dc2626',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {canEditOrDelete(admin) && (
                              <Tooltip title="Xóa admin">
                                <IconButton size="small" onClick={() => setUserToDelete(admin)} sx={{ color: '#ef4444' }}>
                                  <Trash2 size={15} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* ─── Dialogs ──────────────────────────────────────────────────────── */}
      
      {/* Dialog hiển thị mật khẩu mới (chỉ 1 lần) */}
      <CredentialDialog
        open={Boolean(credentialDialog)}
        onClose={() => setCredentialDialog(null)}
        credentials={credentialDialog}
      />

      {/* Dialog xác nhận xóa người dùng */}
      <Dialog open={Boolean(userToDelete)} onClose={() => setUserToDelete(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa tài khoản</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài khoản <strong>{userToDelete?.name}</strong>? 
            Hành động này sẽ xóa vĩnh viễn dữ liệu của người dùng này khỏi hệ thống.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUserToDelete(null)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Hủy
          </Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
            Xóa tài khoản
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Sửa người dùng */}
      <Dialog open={Boolean(userToEdit)} onClose={() => setUserToEdit(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Sửa thông tin tài khoản</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Họ và tên"
              fullWidth
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <TextField
              label="Tên đăng nhập"
              fullWidth
              value={editForm.username}
              onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              helperText="Học sinh thường dùng Tên đăng nhập"
            />
            {userToEdit?.role === 'student' && (
              <FormControl fullWidth>
                <InputLabel>Lớp học</InputLabel>
                <Select
                  value={editForm.classId}
                  label="Lớp học"
                  onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                >
                  <MenuItem value=""><em>(Không có lớp)</em></MenuItem>
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextField
              label="Vai trò"
              fullWidth
              value={userToEdit?.role || ''}
              disabled
              helperText="Không thể thay đổi vai trò của tài khoản sau khi tạo."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUserToEdit(null)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Hủy
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AccountManagement;
