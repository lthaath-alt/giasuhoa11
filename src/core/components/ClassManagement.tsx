import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { GraduationCap, Copy, Edit, Trash2, Plus, Download } from 'lucide-react';
import { SchoolClass, User } from '../../features/auth/types';
import { useApp } from '../../core/hooks/useApp';
import { generateClassPassword } from '../../core/services/storage';
import { FirestoreService } from '../../core/services/firestoreService';

export interface ClassManagementProps {
  classes: SchoolClass[];
  users: User[];
  canCreate: boolean;
  onCreateClick: () => void;
  currentUserRole?: 'admin' | 'school_admin' | 'teacher';
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  users,
  canCreate,
  onCreateClick,
  currentUserRole = 'admin',
}) => {
  const { updateClass, deleteClass } = useApp();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editClass, setEditClass] = useState<SchoolClass | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeacherEmail, setEditTeacherEmail] = useState('');
  const [codeCopied, setCodeCopied] = useState<string | null>(null);
  const [exportClassId, setExportClassId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const getTeacherName = (email: string) => {
    const teacher = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return teacher ? teacher.name : email;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(code);
    setTimeout(() => setCodeCopied(null), 2000);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteClass(deleteId);
      setDeleteId(null);
    }
  };

  const openEdit = (cls: SchoolClass) => {
    setEditClass(cls);
    setEditName(cls.name);
    setEditTeacherEmail(cls.teacherEmail);
  };

  const handleUpdate = async () => {
    if (editClass) {
      await updateClass(editClass.id, editName, editTeacherEmail);
      setEditClass(null);
    }
  };

  const getTeachers = () => {
    return users.filter(u => u.role === 'teacher');
  };

  const handleExportCSV = async (cls: SchoolClass) => {
    setExporting(true);
    const classStudents = users
      .filter(u => cls.studentIdentifiers.some(id =>
        id.toLowerCase() === u.email.toLowerCase() ||
        (u.username && id.toLowerCase() === u.username.toLowerCase())
      ))
      .sort((a, b) => (a.studentNumber ?? 999) - (b.studentNumber ?? 999));

    // Sinh mật khẩu mới cho từng học sinh và cập nhật Firestore
    const rows: string[] = ['Số báo danh,Họ tên,Tên đăng nhập,Mật khẩu mới'];

    for (const student of classStudents) {
      const sbd = student.studentNumber ?? 0;
      const newPassword = generateClassPassword(cls.name, sbd);
      // Cập nhập mật khẩu lên Firestore
      await FirestoreService.updateUserById(student.id, { password: newPassword });
      const loginId = student.username || student.email;
      rows.push(`${sbd},"${student.name}","${loginId}","${newPassword}"`);
    }

    const csvContent = '\uFEFF' + rows.join('\n'); // BOM cho Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `danhsach_taikhoan_${cls.name.replace(/\s/g, '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExporting(false);
    setExportClassId(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
            Danh sách Lớp học và Giáo viên phụ trách
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {classes.length} lớp học trong hệ thống
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={onCreateClick}
            sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}
          >
            Tạo Lớp Học Mới
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid var(--vien)', borderRadius: 0 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'var(--nen-trang)' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Tên Lớp Học</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Giáo Viên Phụ Trách</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Sĩ Số Học Sinh</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'var(--chu)', align: 'right' }}>Hành Động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Chưa có lớp học nào được tạo.
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => (
                <TableRow key={cls.id} sx={{ '&:hover': { bgcolor: 'var(--nen-trang)' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
                      {cls.name}
                    </Typography>
                    {cls.inviteCode && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'var(--luc-tham)', fontWeight: 'bold', bgcolor: 'var(--nen-luc-nhat2)', px: 1, borderRadius: 0 }}>
                          Mã: {cls.inviteCode}
                        </Typography>
                        <Tooltip title={codeCopied === cls.inviteCode ? 'Đã sao chép!' : 'Sao chép mã'}>
                          <IconButton size="small" onClick={() => handleCopyCode(cls.inviteCode)} sx={{ p: 0.2 }}>
                            <Copy size={12} color="var(--luc-tham)" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      variant="outlined"
                      size="small"
                      icon={<GraduationCap size={14} />}
                      label={getTeacherName(cls.teacherEmail)}
                      sx={{ fontWeight: 600, color: 'var(--chu)' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={`${cls.studentIdentifiers.length} học sinh`}
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: 'var(--nen-xanh-nhat2)',
                        color: 'var(--xanh-troi)'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa thông tin">
                      <IconButton size="small" onClick={() => openEdit(cls)} sx={{ color: 'var(--chu-2)' }}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xuất danh sách tài khoản lớp (reset mật khẩu)">
                      <IconButton size="small" onClick={() => setExportClassId(cls.id)} sx={{ color: 'var(--luc-tham)' }}>
                        <Download size={16} />
                      </IconButton>
                    </Tooltip>
                    {currentUserRole !== 'teacher' && (
                      <Tooltip title="Xóa lớp học">
                        <IconButton size="small" onClick={() => setDeleteId(cls.id)} sx={{ color: 'var(--do)' }}>
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog xác nhận xóa */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {(() => {
              const cls = classes.find(c => c.id === deleteId);
              if (!cls) return 'Bạn có chắc chắn muốn xóa lớp học này không?';
              return (
                <>
                  Bạn có chắc chắn muốn xóa lớp <strong>{cls.name}</strong> không?<br /><br />
                  <span style={{ color: 'var(--do)', fontWeight: 'bold' }}>Cảnh báo:</span> Lớp này hiện có <strong>{cls.studentIdentifiers.length} học sinh</strong>. 
                  Nếu xóa, tất cả học sinh này sẽ bị gỡ khỏi lớp và trở thành học sinh tự do.
                  Hành động này không thể hoàn tác.
                </>
              );
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Hủy
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
            Xóa lớp
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog sửa lớp */}
      <Dialog open={Boolean(editClass)} onClose={() => setEditClass(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Sửa thông tin lớp học</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              label="Tên lớp học"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="VD: 11A1, 11 Toán..."
            />
            {currentUserRole !== 'teacher' ? (
              <FormControl fullWidth>
                <InputLabel>Giáo viên phụ trách</InputLabel>
                <Select
                  value={editTeacherEmail}
                  label="Giáo viên phụ trách"
                  onChange={(e) => setEditTeacherEmail(e.target.value)}
                >
                  {getTeachers().map(t => (
                    <MenuItem key={t.email} value={t.email}>{t.name} ({t.email})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                label="Giáo viên phụ trách"
                fullWidth
                value={getTeacherName(editTeacherEmail)}
                disabled
                helperText="Giáo viên chỉ có thể sửa tên lớp của mình."
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditClass(null)} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Hủy
          </Button>
          <Button 
            onClick={handleUpdate} 
            color="primary" 
            variant="contained" 
            disabled={!editName.trim() || !editTeacherEmail}
            sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xuất danh sách (reset mật khẩu) */}
      <Dialog open={Boolean(exportClassId)} onClose={() => !exporting && setExportClassId(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
          ⚠️ Xác nhận xuất danh sách tài khoản lớp
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {(() => {
              const cls = classes.find(c => c.id === exportClassId);
              if (!cls) return '';
              const count = users.filter(u => cls.studentIdentifiers.some(id =>
                id.toLowerCase() === u.email.toLowerCase() ||
                (u.username && id.toLowerCase() === u.username.toLowerCase())
              )).length;
              return (
                <>
                  Thao tác này sẽ đặt lại mật khẩu của <strong>{count} học sinh</strong> trong lớp <strong>{cls.name}</strong>.<br /><br />
                  <span style={{ color: 'var(--do)', fontWeight: 'bold' }}>Mật khẩu cũ sẽ không dùng được nữa.</span> Hệ thống sẽ sinh mật khẩu mới theo format:<br />
                  <code style={{ background: 'var(--nen-nhat)', padding: '2px 6px', borderRadius: 0 }}>{cls.name.replace(/\s/g, '')}_SBD_4ký_tự</code><br /><br />
                  Bạn sẽ tải xuống file CSV chứa thông tin đăng nhập mới để phát cho học sinh.
                  Hãy chắc rằng bạn đã in/gửi cho tất cả học sinh ngay sau khi xuất.
                </>
              );
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setExportClassId(null)}
            disabled={exporting}
            sx={{ textTransform: 'none', borderRadius: 0 }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => {
              const cls = classes.find(c => c.id === exportClassId);
              if (cls) handleExportCSV(cls);
            }}
            color="warning"
            variant="contained"
            disabled={exporting}
            startIcon={<Download size={16} />}
            sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}
          >
            {exporting ? 'Đang xuất...' : 'Đặt lại mật khẩu & Xuất CSV'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement;
