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
  Grid,
} from '@mui/material';
import { UserPlus, Key, RefreshCw, ShieldCheck, User } from 'lucide-react';
import {
  createAccountWithFirestore,
  resetPasswordWithFirestore,
  getFirestoreUsers,
  FirestoreUser,
} from '../../../core/services/firestoreAuth';

/**
 * Component Quản lý Tài khoản Firestore dành cho Giáo viên / Admin:
 * 1. Cho phép Tạo tài khoản mới (Username, Password plain text, Full Name, Role) trực tiếp trên Firestore.
 * 2. Cho phép Reset/Cập nhật mật khẩu mới cho tài khoản đã chọn trực tiếp qua updateDoc.
 * 3. Hiển thị danh sách các tài khoản trong collection "users".
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
    // Gọi hàm addDoc trực tiếp từ client (firestoreAuth.ts)
    const result = await createAccountWithFirestore({
      username: newUsername.trim(),
      password: newPassword,
      fullName: newFullName.trim(),
      role: newRole,
    });
    setCreating(false);

    if (result.success) {
      setCreateMsg({ type: 'success', text: result.message });
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setNewRole('student');
      // Tải lại danh sách
      fetchUsers();
    } else {
      setCreateMsg({ type: 'error', text: result.message });
    }
  };

  // ── Xử lý Yêu cầu 4: Reset Mật khẩu bằng updateDoc trên Firestore ──────────
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    setResetMsg(null);

    if (!resetPasswordVal.trim()) {
      setResetMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu mới!' });
      return;
    }

    setResetting(true);
    // Gọi hàm updateDoc ghi đè field password trực tiếp từ client
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

  return (
    <Box id="firestore-account-manager-container" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Tiêu đề phần quản lý */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldCheck color="#0f766e" size={24} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
            Quản lý Tài khoản Firestore (Trực tiếp từ Client)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tạo tài khoản và Reset mật khẩu trực tiếp qua Firestore Client SDK (không dùng Firebase Auth/Cloud Function).
        </Typography>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>
        {/* CỘT TRÁI: FORM TẠO TÀI KHOẢN MỚI (Yêu cầu 3) */}
        <Box>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserPlus size={18} color="#ea580c" /> Tạo Tài khoản mới (Firestore)
              </Typography>

              {createMsg && (
                <Alert severity={createMsg.type} sx={{ mb: 2, borderRadius: 2 }}>
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
                    label="Mật khẩu (Plain text)"
                    type="text"
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
                    sx={{ mt: 1, py: 1.2, borderRadius: 2, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    {creating ? 'Đang tạo...' : 'Tạo tài khoản ngay'}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* CỘT PHẢI: DANH SÁCH TÀI KHOẢN FIRESTORE & RESET MẬT KHẨU (Yêu cầu 4) */}
        <Box>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={18} color="#0f766e" /> Danh sách Collection "users"
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
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Chưa có tài khoản nào trong collection "users" trên Firestore (hoặc chưa kết nối Config).
                </Alert>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Họ tên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Password</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.uid} hover>
                          <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{u.username}</TableCell>
                          <TableCell>{u.fullName}</TableCell>
                          <TableCell>
                            <Chip
                              label={u.role}
                              size="small"
                              color={u.role === 'teacher' ? 'secondary' : u.role === 'admin' ? 'error' : 'default'}
                              sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', color: '#64748b', letterSpacing: 2 }}>••••••••</TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              startIcon={<Key size={14} />}
                              onClick={() => {
                                setSelectedUser(u);
                                setResetPasswordVal('');
                                setResetMsg(null);
                              }}
                              sx={{ textTransform: 'none', borderRadius: 1.5, fontSize: '0.75rem' }}
                            >
                              Reset MK
                            </Button>
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

      {/* DIALOG RESET MẬT KHẨU (Yêu cầu 4: updateDoc trực tiếp) */}
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
                <Alert severity={resetMsg.type} sx={{ borderRadius: 2 }}>
                  {resetMsg.text}
                </Alert>
              )}

              <TextField
                label="Mật khẩu mới (Plain text)"
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
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
          >
            {resetting ? 'Đang lưu updateDoc...' : 'Cập nhật Mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
