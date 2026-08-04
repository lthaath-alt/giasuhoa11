import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Tabs, Tab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Database, Plus, Search, Trash2, Edit, ExternalLink, Link2, FileText, FlaskConical } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { Question, Equation, MatrixResource } from '../../features/library/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const DatabankManagement: React.FC = () => {
  const { 
    libraryQuestions, addLibraryQuestion, deleteLibraryQuestion,
    equations, addEquation, deleteEquation,
    matrixResources, addMatrixResource, deleteMatrixResource,
    currentUser 
  } = useApp();

  const [tabValue, setTabValue] = useState(0);

  const canEditOrDelete = (createdBy?: string) => {
    if (currentUser?.role === 'super_admin') return true;
    if (currentUser?.email === createdBy) return true;
    return false;
  };

  // ─── TAB 1: NGÂN HÀNG CÂU HỎI ───────────────────────────────────────────────
  const [qSearch, setQSearch] = useState('');
  const [qLevel, setQLevel] = useState('all');
  const [isQDialogOpen, setIsQDialogOpen] = useState(false);
  const [qForm, setQForm] = useState({ content: '', topic: '', difficulty: 'Nhận biết', type: 'Trắc nghiệm', correctAnswer: 'A' });

  const filteredQuestions = libraryQuestions.filter(q => {
    const matchSearch = q.content.toLowerCase().includes(qSearch.toLowerCase()) || (q.topic && q.topic.toLowerCase().includes(qSearch.toLowerCase()));
    const matchLevel = qLevel === 'all' || q.difficulty === qLevel;
    return matchSearch && matchLevel;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Nhận biết': return { bg: '#dbeafe', color: '#2563eb' };
      case 'Thông hiểu': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Vận dụng': return { bg: '#fef3c7', color: '#d97706' };
      case 'Vận dụng cao': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const handleQSubmit = () => {
    addLibraryQuestion({
      content: qForm.content,
      topic: qForm.topic,
      difficulty: qForm.difficulty as any,
      type: qForm.type as any,
      correctAnswer: qForm.correctAnswer,
      points: 10,
      images: [],
      createdBy: currentUser?.email
    });
    setIsQDialogOpen(false);
  };

  // ─── TAB 2: KHO PHƯƠNG TRÌNH ────────────────────────────────────────────────
  const [isEqDialogOpen, setIsEqDialogOpen] = useState(false);
  const [eqForm, setEqForm] = useState({ equation: '', condition: '', type: '', notes: '' });

  const handleEqSubmit = () => {
    addEquation({
      ...eqForm,
      createdBy: currentUser?.email
    });
    setIsEqDialogOpen(false);
  };

  // ─── TAB 3: MA TRẬN ─────────────────────────────────────────────────────────
  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState(false);
  const [matrixForm, setMatrixForm] = useState({ title: '', description: '', driveLink: '', questionCount: 0 });
  const [matrixError, setMatrixError] = useState('');

  const handleMatrixSubmit = () => {
    const valid = matrixForm.driveLink.includes('drive.google.com/') || matrixForm.driveLink.includes('docs.google.com/');
    if (!valid) {
      setMatrixError('Vui lòng nhập link Google Drive hợp lệ.');
      return;
    }
    addMatrixResource({
      ...matrixForm,
      createdBy: currentUser?.email
    });
    setIsMatrixDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Database size={22} color="#0f766e" />
          Ngân hàng dữ liệu Hóa học thông minh
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={() => {
            if (tabValue === 0) setIsQDialogOpen(true);
            else if (tabValue === 1) setIsEqDialogOpen(true);
            else setIsMatrixDialogOpen(true);
          }}
          sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', boxShadow: 'none' }}
        >
          {tabValue === 0 ? 'Thêm Câu Hỏi' : tabValue === 1 ? 'Thêm Phương Trình' : 'Thêm Ma Trận'}
        </Button>
      </Box>

      {/* 3 Stat Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#e0e7ff', borderRadius: 2 }}>
              <FileText size={24} color="#4f46e5" />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 'bold', lineHeight: 1 }}>TỔNG SỐ CÂU HỎI</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{libraryQuestions.length} câu trong kho</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#dcfce7', borderRadius: 2 }}>
              <FlaskConical size={24} color="#16a34a" />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 'bold', lineHeight: 1 }}>NGÂN HÀNG PHƯƠNG TRÌNH</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{equations.length} phương trình</Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: '#fef3c7', borderRadius: 2 }}>
              <Database size={24} color="#d97706" />
            </Box>
            <Box>
              <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 'bold', lineHeight: 1 }}>TÀI NGUYÊN MA TRẬN .DOCX</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e293b' }}>{matrixResources.length} tệp tin mẫu</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '1rem' } }}>
          <Tab label="Ngân hàng Câu Hỏi" />
          <Tab label="Kho Phương Trình & Phản Ứng" />
          <Tab label="Tài Nguyên Ma Trận Đề (.docx)" />
        </Tabs>
      </Box>

      {/* TAB 1 */}
      <CustomTabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm nội dung câu hỏi hoặc từ khóa chủ đề..."
            value={qSearch}
            onChange={e => setQSearch(e.target.value)}
            sx={{ flex: 1 }}
            InputProps={{ startAdornment: <Search size={18} color="#94a3b8" style={{ marginRight: 8 }} /> }}
          />
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>Bộ lọc Cấp độ</InputLabel>
            <Select value={qLevel} label="Bộ lọc Cấp độ" onChange={e => setQLevel(e.target.value)}>
              <MenuItem value="all">Tất cả cấp độ</MenuItem>
              <MenuItem value="Nhận biết">Nhận biết</MenuItem>
              <MenuItem value="Thông hiểu">Thông hiểu</MenuItem>
              <MenuItem value="Vận dụng">Vận dụng</MenuItem>
              <MenuItem value="Vận dụng cao">Vận dụng cao</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Chủ đề</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '12%' }}>Cấp độ</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Nội dung câu hỏi & Các lựa chọn</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '23%' }}>Lý thuyết & Gợi ý AI</TableCell>
                <TableCell sx={{ fontWeight: 'bold', width: '10%', align: 'right' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQuestions.map(q => {
                const colors = getLevelColor(q.difficulty);
                return (
                  <TableRow key={q.id}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#475569' }}>{q.topic || 'Chung'}</Typography></TableCell>
                    <TableCell>
                      <Chip size="small" label={q.difficulty} sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ mb: 1 }}>{q.content}</Typography>
                      {/* Lựa chọn mô phỏng */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <Box key={opt} sx={{
                            px: 1, py: 0.5, borderRadius: 1, fontSize: '0.8rem',
                            bgcolor: q.correctAnswer === opt ? '#dcfce7' : '#f1f5f9',
                            color: q.correctAnswer === opt ? '#16a34a' : '#64748b',
                            fontWeight: q.correctAnswer === opt ? 'bold' : 'normal',
                            border: `1px solid ${q.correctAnswer === opt ? '#bbf7d0' : 'transparent'}`
                          }}>
                            {opt}. Lựa chọn {opt}
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Đang cập nhật AI gợi ý...</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {canEditOrDelete(q.createdBy) && (
                        <Tooltip title="Xóa">
                          <IconButton size="small" color="error" onClick={() => deleteLibraryQuestion(q.id)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredQuestions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>Không tìm thấy câu hỏi nào.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CustomTabPanel>

      {/* TAB 2 */}
      <CustomTabPanel value={tabValue} index={1}>
        {equations.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
            <FlaskConical size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
            <Typography color="text.secondary">Chưa có phương trình nào trong kho. Nhấn 'Thêm Phương Trình' để tạo.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Phương trình hóa học</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Điều kiện phản ứng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại phản ứng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ghi chú</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equations.map(eq => (
                  <TableRow key={eq.id}>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0f766e', fontFamily: 'monospace' }}>{eq.equation}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{eq.condition}</Typography></TableCell>
                    <TableCell><Chip size="small" label={eq.type || 'Chung'} sx={{ bgcolor: '#f1f5f9' }} /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{eq.notes}</Typography></TableCell>
                    <TableCell align="right">
                      {canEditOrDelete(eq.createdBy) && (
                        <IconButton size="small" color="error" onClick={() => deleteEquation(eq.id)}><Trash2 size={16} /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CustomTabPanel>

      {/* TAB 3 */}
      <CustomTabPanel value={tabValue} index={2}>
        {matrixResources.length === 0 ? (
           <Box sx={{ textAlign: 'center', p: 4, bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
             <FileText size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
             <Typography color="text.secondary">Chưa có tài nguyên ma trận mẫu nào. Nhấn 'Thêm Ma Trận' để tạo.</Typography>
           </Box>
        ) : (
          <Grid container spacing={3}>
            {matrixResources.map(res => (
              <Grid item xs={12} md={6} key={res.id}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>{res.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{res.description}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>Số câu: <strong>{res.questionCount}</strong> câu</Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button variant="outlined" size="small" startIcon={<ExternalLink size={16} />} href={res.driveLink} target="_blank" sx={{ textTransform: 'none' }}>
                      Xem thử & Tải về
                    </Button>
                    {canEditOrDelete(res.createdBy) && (
                      <IconButton size="small" color="error" onClick={() => deleteMatrixResource(res.id)}><Trash2 size={16} /></IconButton>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </CustomTabPanel>

      {/* DIALOGS */}
      {/* Dialog Thêm Câu hỏi */}
      <Dialog open={isQDialogOpen} onClose={() => setIsQDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Câu Hỏi Mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nội dung câu hỏi" fullWidth multiline rows={3} value={qForm.content} onChange={e => setQForm({...qForm, content: e.target.value})} />
            <TextField label="Chủ đề" fullWidth value={qForm.topic} onChange={e => setQForm({...qForm, topic: e.target.value})} />
            <FormControl fullWidth>
              <InputLabel>Cấp độ</InputLabel>
              <Select value={qForm.difficulty} label="Cấp độ" onChange={e => setQForm({...qForm, difficulty: e.target.value})}>
                <MenuItem value="Nhận biết">Nhận biết</MenuItem>
                <MenuItem value="Thông hiểu">Thông hiểu</MenuItem>
                <MenuItem value="Vận dụng">Vận dụng</MenuItem>
                <MenuItem value="Vận dụng cao">Vận dụng cao</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setIsQDialogOpen(false)}>Hủy</Button><Button onClick={handleQSubmit} variant="contained">Lưu</Button></DialogActions>
      </Dialog>

      {/* Dialog Thêm Phương trình */}
      <Dialog open={isEqDialogOpen} onClose={() => setIsEqDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Phương Trình</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Phương trình (VD: 2H2 + O2 -> 2H2O)" fullWidth value={eqForm.equation} onChange={e => setEqForm({...eqForm, equation: e.target.value})} />
            <TextField label="Điều kiện" fullWidth value={eqForm.condition} onChange={e => setEqForm({...eqForm, condition: e.target.value})} />
            <TextField label="Loại phản ứng" fullWidth value={eqForm.type} onChange={e => setEqForm({...eqForm, type: e.target.value})} />
            <TextField label="Ghi chú" fullWidth value={eqForm.notes} onChange={e => setEqForm({...eqForm, notes: e.target.value})} />
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setIsEqDialogOpen(false)}>Hủy</Button><Button onClick={handleEqSubmit} variant="contained">Lưu</Button></DialogActions>
      </Dialog>

      {/* Dialog Thêm Ma trận */}
      <Dialog open={isMatrixDialogOpen} onClose={() => setIsMatrixDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Thêm Tài Nguyên Ma Trận</DialogTitle>
        <DialogContent>
          {matrixError && <Alert severity="error" sx={{ mb: 2 }}>{matrixError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Tiêu đề" fullWidth value={matrixForm.title} onChange={e => setMatrixForm({...matrixForm, title: e.target.value})} />
            <TextField label="Mô tả" fullWidth multiline rows={2} value={matrixForm.description} onChange={e => setMatrixForm({...matrixForm, description: e.target.value})} />
            <TextField label="Số lượng câu hỏi" type="number" fullWidth value={matrixForm.questionCount} onChange={e => setMatrixForm({...matrixForm, questionCount: Number(e.target.value)})} />
            <TextField label="Google Drive Link" fullWidth value={matrixForm.driveLink} onChange={e => setMatrixForm({...matrixForm, driveLink: e.target.value})} helperText="Dán link Google Docs chia sẻ ở đây" />
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setIsMatrixDialogOpen(false)}>Hủy</Button><Button onClick={handleMatrixSubmit} variant="contained">Lưu</Button></DialogActions>
      </Dialog>

    </Box>
  );
};

export default DatabankManagement;
