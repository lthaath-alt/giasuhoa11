import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Chip, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Tabs, Tab, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
  Select, MenuItem, FormControl, InputLabel, RadioGroup, Radio, FormControlLabel, FormLabel, Divider
} from '@mui/material';
import { Database, Plus, Search, Trash2, Edit, ExternalLink, Link2, FileText, FlaskConical } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { BankManager } from '../../features/bank/components/BankManager';
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
  const [qError, setQError] = useState('');
  const [qForm, setQForm] = useState({
    content: '',
    topic: '',
    difficulty: 'Nhận biết',
    type: 'Trắc nghiệm',
    correctAnswer: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    essayAnswer: '',
    theory: '',
  });

  const resetQForm = () => setQForm({
    content: '', topic: '', difficulty: 'Nhận biết', type: 'Trắc nghiệm',
    correctAnswer: '', optionA: '', optionB: '', optionC: '', optionD: '',
    essayAnswer: '', theory: '',
  });

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
    setQError('');
    if (!qForm.content.trim()) { setQError('Vui lòng nhập nội dung câu hỏi.'); return; }
    if (qForm.type === 'Trắc nghiệm') {
      if (!qForm.optionA.trim() || !qForm.optionB.trim() || !qForm.optionC.trim() || !qForm.optionD.trim()) {
        setQError('Vui lòng nhập đủ 4 phương án A, B, C, D.'); return;
      }
      if (!qForm.correctAnswer) { setQError('Vui lòng chọn đáp án đúng.'); return; }
    }

    const options = qForm.type === 'Trắc nghiệm' ? [
      { key: 'A' as const, text: qForm.optionA },
      { key: 'B' as const, text: qForm.optionB },
      { key: 'C' as const, text: qForm.optionC },
      { key: 'D' as const, text: qForm.optionD },
    ] : undefined;

    addLibraryQuestion({
      content: qForm.content.trim(),
      topic: qForm.topic.trim(),
      difficulty: qForm.difficulty as any,
      type: qForm.type as any,
      correctAnswer: qForm.type === 'Trắc nghiệm' ? qForm.correctAnswer : undefined,
      essayPoints: qForm.type === 'Tự luận' && qForm.essayAnswer.trim()
        ? [{ label: 'Hướng dẫn chấm', content: qForm.essayAnswer.trim() }]
        : undefined,
      options,
      points: 10,
      images: [],
      createdBy: currentUser?.email,
      theory: qForm.theory.trim() || undefined,
    } as any);
    resetQForm();
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        <Grid size={{ xs: 12, md: 4 }}>
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
        {/* Ngân hàng câu hỏi hợp nhất — cấu trúc chương × mức × dạng, dùng chung với trò chơi */}
        <BankManager />
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
              <Grid size={{ xs: 12, md: 6 }} key={res.id}>
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
      <Dialog open={isQDialogOpen} onClose={() => { setIsQDialogOpen(false); resetQForm(); setQError(''); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Thêm Câu Hỏi Mới</DialogTitle>
        <DialogContent>
          {qError && <Alert severity="error" sx={{ mb: 2, mt: 1 }}>{qError}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Nội dung câu hỏi" fullWidth multiline rows={3} value={qForm.content} onChange={e => setQForm({...qForm, content: e.target.value})} required />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Chủ đề" fullWidth value={qForm.topic} onChange={e => setQForm({...qForm, topic: e.target.value})} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Cấp độ</InputLabel>
                  <Select value={qForm.difficulty} label="Cấp độ" onChange={e => setQForm({...qForm, difficulty: e.target.value})}>
                    <MenuItem value="Nhận biết">Nhận biết</MenuItem>
                    <MenuItem value="Thông hiểu">Thông hiểu</MenuItem>
                    <MenuItem value="Vận dụng">Vận dụng</MenuItem>
                    <MenuItem value="Vận dụng cao">Vận dụng cao</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl>
              <FormLabel sx={{ fontWeight: 'bold', color: '#0f172a', mb: 1 }}>Loại câu hỏi</FormLabel>
              <RadioGroup row value={qForm.type} onChange={e => setQForm({...qForm, type: e.target.value, correctAnswer: '', optionA: '', optionB: '', optionC: '', optionD: '', essayAnswer: ''})}>
                <FormControlLabel value="Trắc nghiệm" control={<Radio />} label="Trắc nghiệm" />
                <FormControlLabel value="Tự luận" control={<Radio />} label="Tự luận" />
              </RadioGroup>
            </FormControl>

            <Divider />

            {qForm.type === 'Trắc nghiệm' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                  Nhập 4 phương án — chọn đáp án đúng bằng nút radio
                </Typography>
                {(['A','B','C','D'] as const).map(opt => (
                  <Box key={opt} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio
                      checked={qForm.correctAnswer === opt}
                      onChange={() => setQForm({...qForm, correctAnswer: opt})}
                      sx={{ p: 0.5 }}
                    />
                    <Chip
                      label={opt}
                      size="small"
                      sx={{
                        minWidth: 32,
                        fontWeight: 'bold',
                        bgcolor: qForm.correctAnswer === opt ? '#dcfce7' : '#f1f5f9',
                        color: qForm.correctAnswer === opt ? '#16a34a' : '#475569',
                        border: `1px solid ${qForm.correctAnswer === opt ? '#86efac' : '#e2e8f0'}`,
                      }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Đáp án ${opt}...`}
                      value={opt === 'A' ? qForm.optionA : opt === 'B' ? qForm.optionB : opt === 'C' ? qForm.optionC : qForm.optionD}
                      onChange={e => setQForm({...qForm,
                        [opt === 'A' ? 'optionA' : opt === 'B' ? 'optionB' : opt === 'C' ? 'optionC' : 'optionD']: e.target.value
                      })}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: qForm.correctAnswer === opt ? '#f0fdf4' : 'white' } }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <TextField
                label="Đáp án / Hướng dẫn chấm"
                fullWidth
                multiline
                rows={4}
                value={qForm.essayAnswer}
                onChange={e => setQForm({...qForm, essayAnswer: e.target.value})}
                helperText="Nhập hướng dẫn chấm chi tiết cho giáo viên"
              />
            )}

            <Divider />

            <TextField
              label="Lý thuyết & Gợi ý AI (không bắt buộc)"
              fullWidth
              multiline
              rows={2}
              value={qForm.theory}
              onChange={e => setQForm({...qForm, theory: e.target.value})}
              helperText="Tóm tắt lý thuyết liên quan, hiển thị trong cột 'Lý thuyết & Gợi ý AI'"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setIsQDialogOpen(false); resetQForm(); setQError(''); }} sx={{ textTransform: 'none' }}>Hủy</Button>
          <Button onClick={handleQSubmit} variant="contained" sx={{ textTransform: 'none', boxShadow: 'none' }}>Lưu câu hỏi</Button>
        </DialogActions>
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
