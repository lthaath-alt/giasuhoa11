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
  /** Chỉ hiển thị với vai trò admin */
  canCreateSchoolAdmin?: boolean;
  onCreateTeacherClick?: () => void;
  onCreateStudentClick?: () => void;
  onCreateClassClick?: () => void;
  onCreateSchoolAdminClick?: (schoolId: string) => void;
}

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
  const { deleteUser, updateUserInfo, currentUser,
          dongQuanTri, laChuDuAnHienTai, laDongQuanTriHienTai, themDongQuanTri, boDongQuanTri,
          duyetDonGiaoVien, tuChoiDonGiaoVien,
          /* CHỈ khung "Đơn xin làm giáo viên" dùng hai biến này — xem chú
             thích ngay tại khung đó vì sao. Bảng tài khoản và khung "Đồng
             quản trị" giữ nguyên `users`/`schools` lấy từ props (props ở đó
             cố ý là tập đã lọc theo trang: `myStudents`, `schoolUsers`...). */
          users: tatCaNguoiDung, schools: tatCaTruong } = useApp();
  const [emailMoi, setEmailMoi] = useState('');
  const [baoDongQuanTri, setBaoDongQuanTri] = useState<{ loi: boolean; chu: string } | null>(null);
  const [truongChon, setTruongChon] = useState<Record<string, string>>({});

  /* Dùng `tatCaNguoiDung` (từ context), KHÔNG dùng `users` (prop): props ở
     TeacherPage/SchoolAdminPage là tập đã lọc theo lớp/trường của người xem
     (`myStudents`, `schoolUsers`), mà người vừa đăng ký xin làm giáo viên thì
     CHƯA có lớp, chưa có trường — không lọt vào tập đã lọc đó, nên đồng quản
     trị đứng ở /teacher hay /school-admin sẽ không thấy đơn nào cả. Context
     nạp `users` cho MỌI vai khác 'student' (AppContext.tsx, useEffect nghe
     onAuthStateChanged) nên luôn có đủ dữ liệu ở đây.

     ĐỦ HAI điều mới là đơn. Giá trị `pendingRole` lạ, hoặc người đã là giáo
     viên rồi (đã được duyệt nhưng `pendingRole` chưa kịp xoá xong), đều
     không được lọt vào danh sách này — bài học từ mã lớp gõ sai: thiếu vế
     hai thì người đã duyệt vẫn còn hiện trong danh sách chờ. */
  const donGiaoVien = tatCaNguoiDung.filter(u => u.pendingRole === 'teacher' && u.role === 'student');

  // Khối 2: Trạng thái xóa và sửa người dùng
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; username: string; classId: string }>({
    name: '', email: '', username: '', classId: ''
  });


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
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'school_admin') {
      if (targetUser.role === 'admin' || targetUser.role === 'school_admin') return false;
      if (targetUser.schoolId !== currentUser.schoolId) return false;
      return true;
    }
    return false;
  };

  const getRoleChip = (role: string) => {
    switch (role) {
      case 'admin': return <Chip size="small" label="Quản trị Website" sx={{ bgcolor: 'var(--nen-vang-nhat)', color: 'var(--vang-dam)', fontWeight: 'bold' }} />;
      case 'school_admin': return <Chip size="small" label="Quản trị Trường học" sx={{ bgcolor: 'var(--nen-tim-nhat)', color: 'var(--tim)', fontWeight: 'bold' }} />;
      case 'teacher': return <Chip size="small" label="Giáo viên" sx={{ bgcolor: 'var(--nen-luc-nhat)', color: 'var(--luc-tham)', fontWeight: 'bold' }} />;
      case 'student': return <Chip size="small" label="Học sinh" sx={{ bgcolor: 'var(--nen-xanh-nhat)', color: 'var(--xanh-troi)', fontWeight: 'bold' }} />;
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
      {/* ─── DANH SÁCH NGƯỜI DÙNG ──────────────────────────────────── */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users size={20} color="var(--luc-tham)" />
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
                  textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none',
                  bgcolor: 'var(--tim-nen)', '&:hover': { bgcolor: 'var(--nen-dam)' }
                }}
              >
                Thêm Admin Trường
              </Button>
            )}
            {canCreateClass && (
              <Button variant="outlined" color="primary" startIcon={<GraduationCap size={16} />} onClick={onCreateClassClick} sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}>
                Tạo Lớp Mới
              </Button>
            )}
            {canCreateTeacher && (
              <Button variant="outlined" color="secondary" startIcon={<UserPlus size={16} />} onClick={onCreateTeacherClick} sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}>
                Thêm tài khoản Giáo viên
              </Button>
            )}
            {canCreateStudent && (
              <Button variant="contained" color="primary" startIcon={<UserPlus size={16} />} onClick={onCreateStudentClick} sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}>
                Thêm tài khoản Học sinh
              </Button>
            )}
          </Box>
        </Box>

        {/* Báo dùng CHUNG cho cả khung "Đồng quản trị" lẫn khung "Đơn xin làm
            giáo viên": hai nút Duyệt/Từ chối ở khung dưới nằm trong điều kiện
            hiển thị KHÁC (laChuDuAnHienTai || laDongQuanTriHienTai) với khung
            "Đồng quản trị" (chỉ laChuDuAnHienTai) — đặt Alert ở TRONG một
            trong hai khung thì một đồng quản trị không phải chủ dự án bấm
            Duyệt/Từ chối sẽ không thấy phản hồi nào, kể cả khi thất bại. Đặt
            ở đây, ngoài cả hai, để ai thấy khung nào cũng nhận được báo. */}
        {baoDongQuanTri && (
          <Alert severity={baoDongQuanTri.loi ? 'error' : 'success'} sx={{ mb: 2, borderRadius: 0, py: 0.5 }}>
            <Typography variant="caption">{baoDongQuanTri.chu}</Typography>
          </Alert>
        )}

        {/* Đồng quản trị — CHỈ chủ dự án thấy. Đây chỉ là lớp vẽ: hàng rào thật
            là `allow write: if laChuDuAn()` trong firestore.rules. */}
        {laChuDuAnHienTai && (
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 0, borderColor: 'var(--vien)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', mb: 0.5 }}>
              Đồng quản trị
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.6 }}>
              Những người này duyệt được đơn xin làm giáo viên và đặt được vai giáo viên
              hoặc quản trị trường. Họ <strong>không</strong> phong được vai quản trị hệ
              thống, <strong>không</strong> xoá được tài khoản, và <strong>không</strong> thêm
              được đồng quản trị khác. Chỉ mình bạn sửa được danh sách này.
            </Typography>

            {dongQuanTri.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                Chưa chỉ định ai.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {dongQuanTri.map(e => (
                  <Chip
                    key={e}
                    label={e}
                    onDelete={async () => setBaoDongQuanTri(
                      await boDongQuanTri(e).then(r => ({ loi: !r.success, chu: r.message }))
                    )}
                    sx={{ borderRadius: 0, bgcolor: 'var(--nen-tim-nhat)', color: 'var(--tim)', fontWeight: 'bold' }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                select
                size="small"
                label="Chọn tài khoản để thêm"
                value={emailMoi}
                onChange={e => setEmailMoi(e.target.value)}
                sx={{ minWidth: 280, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
              >
                {users
                  .filter(u => u.email && u.email.toLowerCase() !== currentUser?.email?.toLowerCase())
                  .filter(u => !dongQuanTri.includes(u.email.toLowerCase()))
                  /* Bỏ học sinh khỏi ô chọn: AccountManagement chỉ được dựng ở
                     /admin, /school-admin, /teacher — cả ba trang đều bị
                     RouteGuards chặn theo `role`, nên một tài khoản mang vai
                     `student` không vào được trang nào trong ba trang đó.
                     Chỉ định một học sinh làm đồng quản trị là ngõ cụt câm:
                     giao diện báo "Đã thêm … làm đồng quản trị" nhưng người
                     đó đăng nhập vào chẳng thấy khung duyệt nào cả. */
                  .filter(u => u.role !== 'student')
                  .map(u => (
                    <MenuItem key={u.id} value={u.email}>
                      {u.name} — {u.email}
                    </MenuItem>
                  ))}
              </TextField>
              <Button
                variant="outlined"
                disabled={!emailMoi}
                onClick={async () => {
                  const r = await themDongQuanTri(emailMoi);
                  setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                  if (r.success) setEmailMoi('');
                }}
                sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', mt: 0.2 }}
              >
                Thêm
              </Button>
            </Box>
          </Paper>
        )}

        {/* Đơn xin làm giáo viên. CHỈ hiện khi có đơn — không để một khung rỗng
            chiếm chỗ mỗi ngày. Chủ dự án và đồng quản trị thấy; giáo viên thường
            không. Hàng rào thật là luật Firestore (`laChuDuAn()`/`laDongQuanTri()`
            trên `update` đổi role) — khung này chỉ là lớp vẽ và báo sớm. */}
        {(laChuDuAnHienTai || laDongQuanTriHienTai) && donGiaoVien.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 0, borderColor: 'var(--tin-hieu-vien)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--tin-hieu)', mb: 0.5 }}>
              Đơn xin làm giáo viên ({donGiaoVien.length})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2, lineHeight: 1.6 }}>
              Những người này tự đăng ký và xin làm giáo viên. Duyệt thì họ thành giáo
              viên của trường bạn chọn; từ chối thì họ vẫn dùng web như học sinh.
            </Typography>

            {tatCaTruong.length === 0 ? (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'var(--chu-mo)' }}>
                Chưa có trường học nào. Tạo trường trước khi duyệt đơn.
              </Typography>
            ) : (
              donGiaoVien.map(hs => (
                <Box key={hs.id} sx={{
                  display: 'flex', alignItems: 'center', gap: 2, py: 1.5, flexWrap: 'wrap',
                  borderBottom: '1px solid var(--vien-2)',
                }}>
                  <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{hs.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{hs.email}</Typography>
                  </Box>
                  <TextField
                    select size="small" label="Trường"
                    value={truongChon[hs.id] || ''}
                    onChange={e => setTruongChon(p => ({ ...p, [hs.id]: e.target.value }))}
                    sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  >
                    {tatCaTruong.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </TextField>
                  <Button
                    variant="contained" size="small"
                    disabled={!truongChon[hs.id]}
                    onClick={async () => {
                      const r = await duyetDonGiaoVien(hs.id, truongChon[hs.id]);
                      setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                    }}
                    sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}
                  >
                    Duyệt
                  </Button>
                  <Button
                    variant="outlined" size="small"
                    onClick={async () => {
                      const r = await tuChoiDonGiaoVien(hs.id);
                      setBaoDongQuanTri({ loi: !r.success, chu: r.message });
                    }}
                    sx={{ textTransform: 'none', borderRadius: 0 }}
                  >
                    Từ chối
                  </Button>
                </Box>
              ))
            )}
          </Paper>
        )}

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--vien)', borderRadius: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'var(--nen-trang)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Họ Tên</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Tên Đăng Nhập</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Vai Trò</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Lớp Học</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)', align: 'right' }}>Hành Động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'var(--nen-trang)' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--luc-tham)' }}>
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
                          <IconButton size="small" onClick={() => handleEditOpen(user)} sx={{ color: 'var(--chu-2)' }}>
                            <Edit size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa tài khoản">
                          <IconButton size="small" onClick={() => setUserToDelete(user)} sx={{ color: 'var(--do)' }}>
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

      {/* ─── KHỐI 3: DANH SÁCH ADMIN TRƯỜNG HỌC (chỉ hiển thị với admin có schools) ─── */}
      {canCreateSchoolAdmin && schools.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ShieldCheck size={20} color="var(--tim)" />
            Quản trị viên Trường học
          </Typography>

          {schools.map(school => {
            const admins = users.filter(u => u.role === 'school_admin' && u.schoolId === school.id);
            return (
              <Paper key={school.id} elevation={0} sx={{ border: '1px solid var(--nen-tim-nhat)', borderRadius: 0, mb: 2, overflow: 'hidden' }}>
                {/* Header của từng trường */}
                <Box sx={{ px: 3, py: 2, bgcolor: 'var(--nen-tim-nhat2)', borderBottom: '1px solid var(--nen-tim-nhat)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 0.8, bgcolor: 'var(--nen-tim-nhat)', borderRadius: 0, display: 'flex' }}>
                      <ShieldCheck size={16} color="var(--tim)" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--tim-2)' }}>
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
                      textTransform: 'none', borderRadius: 0, fontWeight: 'bold', fontSize: '0.78rem',
                      borderColor: 'var(--tim-2)', color: 'var(--tim)',
                      '&:hover': { bgcolor: 'var(--nen-tim-nhat2)' }
                    }}
                  >
                    Thêm Admin
                  </Button>
                </Box>

                {/* Danh sách admin của trường */}
                {admins.length === 0 ? (
                  <Box sx={{ px: 3, py: 2.5, color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'var(--chu-mo)' }}>
                      ⚠️ Trường này chưa có Admin. Hãy thêm ít nhất một Admin để quản lý trường.
                    </Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'var(--nen-tim-nhat2)' }}>
                        <TableCell sx={{ fontWeight: 'bold', color: 'var(--tim)', fontSize: '0.78rem' }}>Họ Tên</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'var(--tim)', fontSize: '0.78rem' }}>Email Đăng Nhập</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'var(--tim)', fontSize: '0.78rem' }}>Trạng Thái</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: 'var(--tim)', fontSize: '0.78rem', align: 'right' }}>Hành Động</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {admins.map(admin => (
                        <TableRow key={admin.id} sx={{ '&:hover': { bgcolor: 'var(--nen-tim-nhat2)' } }}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{admin.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'var(--tim)', fontSize: '0.82rem' }}>
                              {admin.username || admin.email}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={admin.status === 'active' ? 'Hoạt động' : 'Khóa'}
                              sx={{
                                fontWeight: 'bold', fontSize: '0.7rem',
                                bgcolor: admin.status === 'active' ? 'var(--nen-tim-nhat2)' : 'var(--nen-do-nhat)',
                                color: admin.status === 'active' ? 'var(--tim)' : 'var(--do)',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {canEditOrDelete(admin) && (
                              <Tooltip title="Xóa admin">
                                <IconButton size="small" onClick={() => setUserToDelete(admin)} sx={{ color: 'var(--do)' }}>
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
          <Button onClick={() => setUserToDelete(null)} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Hủy
          </Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
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
          <Button onClick={() => setUserToEdit(null)} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Hủy
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AccountManagement;
