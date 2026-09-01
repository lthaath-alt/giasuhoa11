import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import { BookOpen, FileText, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';

export const LibraryManagement: React.FC = () => {
  const { exams, addExam, deleteExam, currentUser } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', topic: '', driveLink: '' });
  const [error, setError] = useState('');
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  const canEditOrDelete = (createdBy?: string) => {
    if (currentUser?.role === 'admin') return true;
    if (currentUser?.email === createdBy) return true;
    return false;
  };

  const handleOpenDialog = () => {
    setForm({ title: '', description: '', topic: '', driveLink: '' });
    setError('');
    setIsDialogOpen(true);
  };

  const validateDriveLink = (link: string) => {
    const valid = link.includes('drive.google.com/') || link.includes('docs.google.com/');
    return valid;
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.topic.trim()) {
      setError('Vui lòng nhập đủ Tiêu đề và Chủ đề.');
      return;
    }
    if (form.driveLink && !validateDriveLink(form.driveLink)) {
      setError('Vui lòng nhập đường dẫn Google Drive hợp lệ (chứa drive.google.com hoặc docs.google.com).');
      return;
    }

    addExam({
      title: form.title.trim(),
      description: form.description.trim(),
      topic: form.topic.trim(),
      driveLink: form.driveLink.trim(),
      type: currentUser?.role === 'admin' ? 'Kho chung' : 'Do GV tự tải',
      createdBy: currentUser?.email,
      questionCount: 0 // Mock value since we are using drive links
    });
    setIsDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookOpen size={22} color="#0f766e" />
          Thư viện đề thi & kho câu hỏi hệ thống
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={handleOpenDialog}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
        >
          Tạo Đề Thi Chung (Kho Web)
        </Button>
      </Box>

      {exams.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '2px dashed #e2e8f0', borderRadius: 3, bgcolor: '#f8fafc' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <FileText size={48} color="#94a3b8" />
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            Kho bài tập đang trống
          </Typography>
          <Typography color="text.secondary">
            Chưa có đề thi nào. Nhấn 'Tạo Đề Thi Chung' để bắt đầu.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {exams.map(exam => (
            <Grid size={{ xs: 12, md: 6 }} key={exam.id}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, height: '100%', position: 'relative' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Chip size="small" label={exam.topic} sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 'bold' }} />
                  <Chip
                    size="small"
                    label={exam.type}
                    sx={{
                      bgcolor: exam.type === 'Kho chung' ? '#e0e7ff' : '#dcfce7',
                      color: exam.type === 'Kho chung' ? '#4f46e5' : '#16a34a',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {exam.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {exam.description || 'Chưa có mô tả.'}
                </Typography>
                
                {exam.driveLink ? (
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f766e', mb: 3 }}>
                    <ExternalLink size={16} /> Tệp đính kèm (Google Drive)
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Số lượng câu hỏi: {exam.questionCount || 0} câu
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    href={exam.driveLink || '#'}
                    target="_blank"
                    disabled={!exam.driveLink}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Xem chi tiết
                  </Button>
                  
                  {canEditOrDelete(exam.createdBy) && (
                    <Tooltip title="Xóa đề thi">
                      <IconButton size="small" color="error" onClick={() => setExamToDelete(exam.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Thêm Đề thi */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tạo Đề Thi Chung</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Tiêu đề đề thi"
              fullWidth
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <TextField
              label="Chủ đề (VD: Hóa 11, Chương 1...)"
              fullWidth
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              required
            />
            <TextField
              label="Mô tả ngắn"
              fullWidth
              multiline
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <TextField
              label="Đường dẫn Google Drive (Tài liệu đính kèm)"
              fullWidth
              value={form.driveLink}
              onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
              helperText="Vui lòng dán link Google Drive (Docs/PDF) đã mở quyền truy cập."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none', borderRadius: 2, boxShadow: 'none' }}>
            Tạo đề thi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xác nhận xóa */}
      <Dialog open={Boolean(examToDelete)} onClose={() => setExamToDelete(null)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setExamToDelete(null)} sx={{ textTransform: 'none' }}>Hủy</Button>
          <Button
            onClick={() => {
              if (examToDelete) deleteExam(examToDelete);
              setExamToDelete(null);
            }}
            variant="contained"
            color="error"
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default LibraryManagement;
