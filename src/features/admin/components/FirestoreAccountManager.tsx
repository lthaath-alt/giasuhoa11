import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { UserPlus, Key, RefreshCw, ShieldCheck, User, ShieldAlert } from 'lucide-react';
import {
  createAccountWithFirestore,
  resetPasswordWithFirestore,
  updateUserRole,
  getFirestoreUsers,
  FirestoreUser,
} from '../../../core/services/firestoreAuth';

// ── Cấu hình hiển thị cho từng role ───────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
  admin:        { label: 'Quản trị hệ thống', color: 'error' },
  school_admin: { label: 'Admin Trường',  color: 'warning' },
  teacher:      { label: 'Giáo viên',     color: 'secondary' },
  student:      { label: 'Học sinh',      color: 'default' },
  // Tên cũ trước đợt gộp 01/09/2026. Giữ lại để bản ghi nào chưa kịp đổi vẫn
  // hiện ra nhãn dễ hiểu thay vì chuỗi thô.
  super_admin:  { label: 'Quản trị hệ thống (tên cũ)', color: 'error' },
  system_admin: { label: 'Quản trị hệ thống (tên cũ)', color: 'error' },
  free_user:    { label: 'Học sinh (tên cũ)', color: 'default' },
};

const ROLE_OPTIONS = [
  { value: 'student',      label: '🎒 Học sinh (student)' },
  { value: 'teacher',      label: '👨‍🏫 Giáo viên (teacher)' },
  { value: 'school_admin', label: '🏫 Admin Trường (school_admin)' },
  { value: 'admin',        label: '👑 Quản trị hệ thống (admin)' },
];

/**
 * Component Quản lý Tài khoản Firestore dành cho Giáo viên / Admin:
 * 1. Cho phép Tạo tài khoản mới (Username, Password, Full Name, Role) trực tiếp trên Firestore.
 * 2. Cho phép Reset/Cập nhật mật khẩu mới cho tài khoản đã chọn trực tiếp qua updateDoc.
 * 3. Hiển thị danh sách các tài khoản trong collection "users".
 * 4. [MỚI] Cấp / Thay đổi quyền (role) cho tài khoản bất kỳ qua Dialog xác nhận.
 */
export const FirestoreAccountManager: React.FC = () => {
  // State danh sách user từ Firestore
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(false);

  // State cho Form Tạo Tài Khoản
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole]         = useState('student');
  const [createMsg, setCreateMsg]     = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [creating, setCreating]       = useState(false);

  // State cho Dialog Reset Mật khẩu
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetMsg, setResetMsg]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [resetting, setResetting]       = useState(false);

  // ── [MỚI] State cho Dialog Đổi Quyền ────────────────────────────────────────
  const [roleTargetUser, setRoleTargetUser] = useState<FirestoreUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState('');
  const [roleMsg, setRoleMsg]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [confirmStep, setConfirmStep]   = useState(false); // bước xác nhận 2 lần

  // Lấy danh sách user khi mount
  const fetchUsers = async () => {
    setLoading(true);
    const data = await getFirestoreUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Xử lý Yêu cầu 3: Tạo Tài khoản mới trên Firestore ────────────────────
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);

    if (!newUsername.trim() || !newPassword || !newFullName.trim()) {
      setCreateMsg({ type: 'error', text: 'Vui lòng điền đầy đủ Username, Mật khẩu và Họ tên!' });
      return;
    }

    setCreating(true);
    const result = await createAccountWithFirestore({
      username: newUsername.trim(),
      password: newPassword,
      fullName: newFullName.trim(),
      role: newRole,
    });
    setCreating(false);

    if (result.success) {
      setCreateMsg({ type: 'success', text: result.message });
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('student');
      fetchUsers();
    } else {
      setCreateMsg({ type: 'error', text: result.message });
    }
  };

  // ── Xử lý Yêu cầu 4: Reset Mật khẩu bằng updateDoc ───────────────────────
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setResetMsg(null);

    if (!resetPasswordVal.trim()) {
      setResetMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu mới!' });
      return;
    }

    setResetting(true);
    const result = await resetPasswordWithFirestore(selectedUser.uid, resetPasswordVal.trim());
    setResetting(false);

    if (result.success) {
      setResetMsg({ type: 'success', text: `Đã đổi mật khẩu cho ${selectedUser.username} thành công!` });
      setTimeout(() => {
        setSelectedUser(null);
        setResetPasswordVal('');
        setResetMsg(null);
        fetchUsers();
      }, 1500);
    } else {
      setResetMsg({ type: 'error', text: result.message });
    }
  };

  // ── [MỚI] Mở dialog đổi quyền ───────────────────────────────────────────────
  const handleOpenRoleDialog = (user: FirestoreUser) => {
    setRoleTargetUser(user);
    setSelectedNewRole(user.role);
    setRoleMsg(null);
    setConfirmStep(false);
  };

  // ── [MỚI] Thực hiện cập nhật role ───────────────────────────────────────────
  const handleUpdateRole = async () => {
    if (!roleTargetUser) return;
    if (selectedNewRole === roleTargetUser.role) {
      setRoleMsg({ type: 'error', text: 'Quyền mới phải khác quyền hiện tại!' });
      return;
    }
    if (!confirmStep) {
      // Bước 1: yêu cầu xác nhận thêm 1 lần nữa nếu cấp quyền cao
      if (selectedNewRole === 'admin' || selectedNewRole === 'school_admin') {
        setConfirmStep(true);
        setRoleMsg({
          type: 'error',
          text: `⚠️ Bạn sắp cấp quyền "${ROLE_CONFIG[selectedNewRole]?.label}" cho "${roleTargetUser.username}". Nhấn "XÁC NHẬN CẤP QUYỀN" lần nữa để tiếp tục.`,
        });
        return;
      }
    }

    setUpdatingRole(true);
    setRoleMsg(null);
    const result = await updateUserRole(roleTargetUser.uid, selectedNewRole);
    setUpdatingRole(false);

    if (result.success) {
      setRoleMsg({ type: 'success', text: result.message });
      setTimeout(() => {
        setRoleTargetUser(null);
        setRoleMsg(null);
        setConfirmStep(false);
        fetchUsers();
      }, 1800);
    } else {
      setRoleMsg({ type: 'error', text: result.message });
      setConfirmStep(false);
    }
  };

  // Helper: lấy màu chip role
  const getRoleChip = (role: string) => {
    const cfg = ROLE_CONFIG[role] ?? { label: role, color: 'default' as const };
    return (
      <Chip
        label={cfg.label}
        size="small"
        color={cfg.color}
        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <Box id="firestore-account-manager-container" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tiêu đề phần quản lý */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 0, border: '1px solid var(--vien)', bgcolor: 'var(--nen-trang)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldCheck color="var(--luc-tham)" size={24} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
            Quản lý Tài khoản Firestore (Trực tiếp từ Client)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tạo tài khoản, Reset mật khẩu và Cấp / Thay đổi quyền trực tiếp qua Firestore Client SDK.
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>
        {/* CỘT TRÁI: FORM TẠO TÀI KHOẢN MỚI */}
        <Box>
          <Card sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserPlus size={18} color="var(--chu-dam)" /> Tạo Tài khoản mới (Firestore)
              </Typography>

              {createMsg && (
                <Alert severity={createMsg.type} sx={{ mb: 2, borderRadius: 0 }}>
                  {createMsg.text}
                </Alert>
              )}

              <form onSubmit={handleCreateAccount}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Tên đăng nhập (Username)"
                    size="small"
                    fullWidth
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ví dụ: hs_nguyena_11a"
                    required
                  />

                  <TextField
                    label="Mật khẩu"
                    type="password"
                    size="small"
                    fullWidth
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    required
                  />

                  <TextField
                    label="Họ và tên"
                    size="small"
                    fullWidth
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="ví dụ: Nguyễn Văn A"
                    required
                  />

                  <FormControl size="small" fullWidth>
                    <InputLabel>Vai trò (Role)</InputLabel>
                    <Select
                      value={newRole}
                      label="Vai trò (Role)"
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <MenuItem value="student">Học sinh (student)</MenuItem>
                      <MenuItem value="teacher">Giáo viên (teacher)</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={creating}
                    startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <UserPlus size={16} />}
                    sx={{ mt: 1, py: 1.2, borderRadius: 0, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    {creating ? 'Đang tạo...' : 'Tạo tài khoản ngay'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* CỘT PHẢI: DANH SÁCH TÀI KHOẢN FIRESTORE */}
        <Box>
          <Card sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={18} color="var(--luc-tham)" /> Danh sách Collection "users"
                </Typography>
                <Button
                  size="small"
                  startIcon={<RefreshCw size={14} />}
                  onClick={fetchUsers}
                  disabled={loading}
                  sx={{ textTransform: 'none' }}
                >
                  Làm mới
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : users.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 0 }}>
                  Chưa có tài khoản nào trong collection "users" trên Firestore (hoặc chưa kết nối Config).
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--nen-nhat)', borderRadius: 0 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'var(--nen-trang)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Quyền</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.uid} hover>
                          <TableCell sx={{ fontWeight: 600, color: 'var(--chu-dam)' }}>{u.username}</TableCell>
                          <TableCell>{u.fullName}</TableCell>
                          <TableCell>{getRoleChip(u.role)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                              {/* Nút Reset mật khẩu */}
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                startIcon={<Key size={13} />}
                                onClick={() => {
                                  setSelectedUser(u);
                                  setResetPasswordVal('');
                                  setResetMsg(null);
                                }}
                                sx={{ textTransform: 'none', borderRadius: 0, fontSize: '0.72rem', px: 1 }}
                              >
                                Reset MK
                              </Button>

                              {/* [MỚI] Nút Đổi quyền */}
                              <Button
                                size="small"
                                variant="outlined"
                                color="info"
                                startIcon={<ShieldAlert size={13} />}
                                onClick={() => handleOpenRoleDialog(u)}
                                sx={{ textTransform: 'none', borderRadius: 0, fontSize: '0.72rem', px: 1 }}
                              >
                                Đổi quyền
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* DIALOG RESET MẬT KHẨU */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Reset Mật khẩu Firestore
        </DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Đang đổi mật khẩu cho username: <strong>{selectedUser.username}</strong> ({selectedUser.fullName})
              </Typography>

              {resetMsg && (
                <Alert severity={resetMsg.type} sx={{ borderRadius: 0 }}>
                  {resetMsg.text}
                </Alert>
              )}

              <TextField
                label="Mật khẩu mới"
                type="password"
                fullWidth
                size="small"
                value={resetPasswordVal}
                onChange={(e) => setResetPasswordVal(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                autoFocus
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedUser(null)} disabled={resetting} sx={{ textTransform: 'none' }}>
            Hủy
          </Button>
          <Button
            onClick={handleResetPassword}
            variant="contained"
            color="warning"
            disabled={resetting}
            startIcon={resetting ? <CircularProgress size={16} color="inherit" /> : <Key size={16} />}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 0 }}
          >
            {resetting ? 'Đang lưu...' : 'Cập nhật Mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* [MỚI] DIALOG CẤP / THAY ĐỔI QUYỀN */}
      <Dialog
        open={Boolean(roleTargetUser)}
        onClose={() => { setRoleTargetUser(null); setConfirmStep(false); setRoleMsg(null); }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldAlert size={20} color="var(--xanh)" />
          Cấp / Thay đổi Quyền Tài khoản
        </DialogTitle>

        <DialogContent dividers>
          {roleTargetUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Thông tin tài khoản đang được chọn */}
              <Paper elevation={0} sx={{ p: 2, borderRadius: 0, bgcolor: 'var(--nen-xanh-nhat2)', border: '1px solid var(--vien-xanh)' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Tài khoản được chọn</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
                  {roleTargetUser.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">@{roleTargetUser.username}</Typography>
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">Quyền hiện tại:</Typography>
                  {getRoleChip(roleTargetUser.role)}
                </Box>
              </Paper>

              <Divider />

              {/* Dropdown chọn role mới */}
              <FormControl size="small" fullWidth>
                <InputLabel>Quyền mới</InputLabel>
                <Select
                  value={selectedNewRole}
                  label="Quyền mới"
                  onChange={(e) => {
                    setSelectedNewRole(e.target.value);
                    setRoleMsg(null);
                    setConfirmStep(false);
                  }}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === roleTargetUser.role}
                    >
                      {opt.label}
                      {opt.value === roleTargetUser.role && (
                        <Chip label="Hiện tại" size="small" sx={{ ml: 1, fontSize: '0.65rem', height: 18 }} />
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Thông báo xác nhận / lỗi */}
              {roleMsg && (
                <Alert severity={roleMsg.type} sx={{ borderRadius: 0, fontSize: '0.82rem' }}>
                  {roleMsg.text}
                </Alert>
              )}

              {/* Cảnh báo khi cấp quyền cao */}
              {(selectedNewRole === 'admin' || selectedNewRole === 'school_admin') && !roleMsg && (
                <Alert severity="warning" sx={{ borderRadius: 0, fontSize: '0.82rem' }}>
                  ⚠️ Quyền <strong>{ROLE_CONFIG[selectedNewRole]?.label}</strong> có thể quản lý người dùng và dữ liệu hệ thống. Hãy chắc chắn trước khi cấp.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => { setRoleTargetUser(null); setConfirmStep(false); setRoleMsg(null); }}
            disabled={updatingRole}
            sx={{ textTransform: 'none' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            color={confirmStep ? 'error' : 'info'}
            disabled={updatingRole || selectedNewRole === roleTargetUser?.role}
            startIcon={updatingRole ? <CircularProgress size={16} color="inherit" /> : <ShieldAlert size={16} />}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 0 }}
          >
            {updatingRole
              ? 'Đang cập nhật...'
              : confirmStep
              ? 'XÁC NHẬN CẤP QUYỀN'
              : 'Cập nhật quyền'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
