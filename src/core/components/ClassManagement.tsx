import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import { GraduationCap, Copy, Edit, Trash2, Plus } from 'lucide-react';
import { SchoolClass, User } from '../../features/auth/types';

export interface ClassManagementProps {
  classes: SchoolClass[];
  users: User[];
  canCreate: boolean;
  onCreateClick: () => void;
  onEditClick: (cls: SchoolClass) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassManagement: React.FC<ClassManagementProps> = ({
  classes,
  users,
  canCreate,
  onCreateClick,
  onEditClick,
  onDeleteClass,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState<string | null>(null);

  const getTeacherName = (email: string) => {
    const teacher = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return teacher ? teacher.name : email;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(code);
    setTimeout(() => setCodeCopied(null), 2000);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteClass(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
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
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
          >
            Tạo Lớp Học Mới
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Tên Lớp Học</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Giáo Viên Phụ Trách</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Sĩ Số Học Sinh</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', align: 'right' }}>Hành Động</TableCell>
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
                <TableRow key={cls.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                      {cls.name}
                    </Typography>
                    {cls.inviteCode && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#0f766e', fontWeight: 'bold', bgcolor: 'rgba(15,118,110,0.1)', px: 1, borderRadius: 1 }}>
                          Mã: {cls.inviteCode}
                        </Typography>
                        <Tooltip title={codeCopied === cls.inviteCode ? 'Đã sao chép!' : 'Sao chép mã'}>
                          <IconButton size="small" onClick={() => handleCopyCode(cls.inviteCode)} sx={{ p: 0.2 }}>
                            <Copy size={12} color="#0f766e" />
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
                      sx={{ fontWeight: 600, color: '#475569' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={`${cls.studentIdentifiers.length} học sinh`}
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        color: '#2563eb'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa thông tin">
                      <IconButton size="small" onClick={() => onEditClick(cls)} sx={{ color: '#64748b' }}>
                        <Edit size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa lớp học">
                      <IconButton size="small" onClick={() => setDeleteId(cls.id)} sx={{ color: '#ef4444' }}>
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

      {/* Dialog xác nhận xóa */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa lớp học</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa lớp học này không? 
            Hành động này không thể hoàn tác và học sinh sẽ bị mất liên kết với lớp.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Hủy
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
            Xóa lớp
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassManagement;
