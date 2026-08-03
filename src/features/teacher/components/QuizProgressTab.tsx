import React, { useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Divider, List, ListItem,
  Avatar, ListItemText, Paper, FormControl, InputLabel, Select,
  MenuItem, Chip, Button, TextField, Collapse, Alert, Grid,
  Accordion, AccordionSummary, AccordionDetails, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tooltip, IconButton,
} from '@mui/material';
import {
  Users, MessageSquare, Award, Clock, AlertTriangle, CheckCircle,
  XCircle, ArrowRight, Download, Filter, ChevronDown, Check, Edit2, Info
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { QuizStorage } from '../../quiz/quizStorage';
import { CHEMISTRY_11_CURRICULUM } from '../../lessons/constants';
import type { User } from '../../auth/types';
import type { Quiz, QuizQuestionResult } from '../../quiz/types';

// Helper render Hóa học (giữ sub/sup)
function ChemicalText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface QuizProgressTabProps {
  students: User[];
  isAdmin?: boolean;
}

export const QuizProgressTab: React.FC<QuizProgressTabProps> = ({ students, isAdmin = false }) => {
  const { classes, updateQuizEssayScore, getUserProgress } = useApp();

  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingScore, setEditingScore] = useState<Record<string, number>>({}); // key: quizId_questionId, value: score
  const [gradingError, setGradingError] = useState<string | null>(null);
  const [gradingSuccess, setGradingSuccess] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const refresh = () => forceUpdate(n => n + 1);

  // 1. Lọc lớp học đối với Admin
  const filteredStudentsByClass = students.filter(s => {
    if (isAdmin && selectedClassId !== 'all') {
      return s.classId === selectedClassId || s.joinedClassId === selectedClassId;
    }
    return true;
  });

  // 2. Tìm kiếm học sinh
  const filteredStudents = filteredStudentsByClass.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = students.find(s => s.email === selectedStudentEmail);

  // 3. Lấy toàn bộ bài thi của học sinh đang chọn
  const quizzes = selectedStudent
    ? QuizStorage.getQuizzes().filter(
        q => q.userEmail.toLowerCase() === selectedStudent.email.toLowerCase() && q.status === 'submitted'
      ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Thống kê điểm trung bình
  const avgScore = quizzes.length > 0
    ? Math.round((quizzes.reduce((sum, q) => sum + (q.score / q.maxScore) * 10, 0) / quizzes.length) * 10) / 10
    : 0;

  // Lấy tất cả các câu tự luận cần xem lại (Flagged) của học sinh đang chọn
  const reviewQuestions: Array<{ quiz: Quiz; questionId: string; result: QuizQuestionResult; qIndex: number }> = [];
  quizzes.forEach(quiz => {
    if (quiz.results) {
      quiz.questions.forEach((q, idx) => {
        if (q.type === 'Tự luận') {
          const res = quiz.results![q.id];
          // Câu cần xem lại: độ tin cậy low hoặc medium
          if (res && res.confidence !== 'high') {
            reviewQuestions.push({
              quiz,
              questionId: q.id,
              result: res,
              qIndex: idx
            });
          }
        }
      });
    }
  });

  // ── XỬ LÝ LƯU ĐIỂM SỬA THỦ CÔNG ───────────────────────────────────────────

  const handleScoreChange = (quizId: string, qId: string, maxScore: number, val: string) => {
    const key = `${quizId}_${qId}`;
    let score = parseFloat(val);
    if (isNaN(score)) score = 0;
    if (score < 0) score = 0;
    if (score > maxScore) score = maxScore;
    setEditingScore(prev => ({ ...prev, [key]: score }));
  };

  const handleSaveScore = async (quizId: string, qId: string, maxScore: number) => {
    const key = `${quizId}_${qId}`;
    const score = editingScore[key] !== undefined ? editingScore[key] : maxScore;

    setGradingError(null);
    setGradingSuccess(null);

    const res = await updateQuizEssayScore(quizId, qId, score);
    if (res.success) {
      setGradingSuccess('Cập nhật điểm thi thành công!');
      setTimeout(() => setGradingSuccess(null), 3000);
      refresh();
    } else {
      setGradingError(res.message);
    }
  };

  // ── XUẤT BÁO CÁO KẾT QUẢ RA FILE CSV ────────────────────────────────────────

  const exportCSV = () => {
    if (!selectedStudent || quizzes.length === 0) return;

    // Header tiếng Việt (thêm BOM \ufeff để Excel mở ra hiển thị đúng bảng mã Unicode)
    let csvContent = '\ufeff';
    csvContent += 'Học sinh,Email,Ngày làm,Chương học,Bài học,Điểm số đạt được,Điểm tối đa,Tỷ lệ (%)\n';

    quizzes.forEach(q => {
      // Tìm tên chương/bài từ constant
      const chapter = CHEMISTRY_11_CURRICULUM.find(c => c.id === q.chapterId);
      const lesson = chapter?.lessons.find(l => l.id === q.lessonId);

      const chapterName = chapter ? chapter.title.replace(/,/g, '-') : q.chapterId;
      const lessonName = lesson ? lesson.title.replace(/,/g, '-') : q.lessonId;
      const dateStr = new Date(q.createdAt).toLocaleDateString('vi-VN');
      const ratio = Math.round((q.score / q.maxScore) * 100);

      csvContent += `"${selectedStudent.name}","${selectedStudent.email}","${dateStr}","${chapterName}","${lessonName}",${q.score},${q.maxScore},${ratio}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Ket_qua_hoc_tap_${selectedStudent.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      id="quiz-progress-tracking"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '3.5fr 8.5fr' },
        gap: 3,
      }}
    >
      {/* ── CỘT TRÁI: DANH SÁCH HỌC SINH ── */}
      <Box>
        <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'black', display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Users size={18} /> Học sinh trong lớp
            </Typography>

            {/* Bộ lọc lớp dành cho Admin */}
            {isAdmin && (
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="class-filter-label">Chọn lớp học</InputLabel>
                <Select
                  labelId="class-filter-label"
                  value={selectedClassId}
                  label="Chọn lớp học"
                  onChange={e => setSelectedClassId(e.target.value)}
                >
                  <MenuItem value="all">Tất cả học sinh</MenuItem>
                  {classes.map(cls => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Tìm kiếm học sinh */}
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm tên hoặc email học sinh..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Divider sx={{ mb: 1.5 }} />

            {filteredStudents.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                Không tìm thấy học sinh nào phù hợp.
              </Typography>
            ) : (
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 450, overflowY: 'auto' }}>
                {filteredStudents.map(stud => {
                  const active = selectedStudentEmail === stud.email;
                  // Đếm số câu cần review của học sinh này
                  const studQuizzes = QuizStorage.getQuizzes().filter(
                    q => q.userEmail.toLowerCase() === stud.email.toLowerCase() && q.status === 'submitted'
                  );
                  let flagCount = 0;
                  studQuizzes.forEach(qz => {
                    if (qz.results) {
                      Object.values(qz.results).forEach((r: any) => {
                        if (r.confidence && r.confidence !== 'high') flagCount++;
                      });
                    }
                  });

                  return (
                    <ListItem
                      key={stud.email}
                      onClick={() => { setSelectedStudentEmail(stud.email); setEditingScore({}); }}
                      sx={{
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: active ? '#0f766e' : '#e2e8f0',
                        bgcolor: active ? 'rgba(15,118,110,0.05)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': {
                          borderColor: '#0f766e',
                          bgcolor: 'rgba(15,118,110,0.02)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: active ? '#0f766e' : 'rgba(15,118,110,0.08)',
                          color: active ? '#fff' : '#0f766e',
                          width: 32, height: 32, fontSize: '0.8rem', mr: 1.5,
                        }}
                      >
                        {stud.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: active ? 'bold' : 'normal', fontSize: '0.88rem' }}>
                            {stud.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                            {stud.email.slice(0, 18)}...
                          </Typography>
                        }
                      />
                      {flagCount > 0 && (
                        <Tooltip title={`${flagCount} câu tự luận cần chấm lại`}>
                          <Chip label={flagCount} size="small" color="warning" icon={<AlertTriangle size={10} />} sx={{ height: 18, fontSize: '0.65rem' }} />
                        </Tooltip>
                      )}
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── CỘT PHẢI: CHI TIẾT KẾT QUẢ & TIẾN ĐỘ ── */}
      <Box>
        {!selectedStudent ? (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 1.5,
              borderStyle: 'dashed',
            }}
          >
            <Award size={48} color="#94a3b8" />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#64748b' }}>
              Chưa chọn học sinh
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
              Vui lòng chọn một học sinh ở danh sách bên trái để theo dõi chi tiết điểm kiểm tra, chấm lại các câu tự luận và xuất báo cáo học tập.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            {/* THẺ THỐNG KÊ TỔNG QUAN */}
            <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'black', color: '#1e293b' }}>
                    Tiến độ & Kết quả học tập: {selectedStudent.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download size={14} />}
                    onClick={exportCSV}
                    disabled={quizzes.length === 0}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Xuất kết quả (CSV)
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f766e' }}>
                        {quizzes.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Bài kiểm tra đã làm
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c' }}>
                        {avgScore > 0 ? `${avgScore}/10` : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Điểm trung bình (Hệ 10)
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#475569' }}>
                        {reviewQuestions.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Câu tự luận cần chấm lại
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Biểu đồ điểm số đơn giản dạng các cột */}
                {quizzes.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1.5 }}>
                      BIỂU ĐỒ ĐIỂM SỐ CÁC BÀI KIỂM TRA GẦN ĐÂY:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #f1f5f9' }}>
                      {quizzes.slice(0, 8).reverse().map((q, i) => {
                        const scoreRatio = (q.score / q.maxScore) * 100;
                        const height = `${Math.max(10, scoreRatio)}%`;
                        const dateText = new Date(q.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                        return (
                          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <Tooltip title={`Điểm: ${q.score}/${q.maxScore}đ (${scoreRatio}%)`}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height,
                                  bgcolor: scoreRatio >= 70 ? '#0f766e' : '#ea580c',
                                  borderRadius: '4px 4px 0 0',
                                  transition: 'height 0.3s ease',
                                }}
                              />
                            </Tooltip>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.5, color: 'text.secondary' }}>
                              {dateText}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* THÈ 2: DANH SÁCH CÁC CÂU HỎI TỰ LUẬN CẦN CHẤM LẠI (🚩 FLAGGED) */}
            {reviewQuestions.length > 0 && (
              <Card sx={{ borderRadius: 3.5, border: '1px solid rgba(234, 88, 12, 0.3)', bgcolor: 'rgba(234, 88, 12, 0.01)', boxShadow: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" color="#ea580c" sx={{ fontWeight: 'black', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AlertTriangle size={20} />
                    🚩 Danh sách câu cần xem lại ({reviewQuestions.length})
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5 }}>
                    Đây là các câu tự luận AI chấm điểm với độ tin cậy thấp (học sinh viết khác đáp án mẫu). Giáo viên nên duyệt lại điểm số.
                  </Typography>

                  {gradingSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{gradingSuccess}</Alert>}
                  {gradingError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{gradingError}</Alert>}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {reviewQuestions.map(({ quiz: qz, questionId, result, qIndex }) => {
                      const questionObj = qz.questions.find(q => q.id === questionId)!;
                      const scoreKey = `${qz.id}_${questionId}`;
                      const currentVal = editingScore[scoreKey] !== undefined ? editingScore[scoreKey] : result.score;

                      return (
                        <Paper key={scoreKey} variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, borderColor: 'rgba(234, 88, 12, 0.2)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Chip label={`Bài thi ngày ${new Date(qz.createdAt).toLocaleDateString('vi-VN')}`} size="small" variant="outlined" />
                            <Chip label={`Câu ${qIndex + 1} • Tự luận`} size="small" color="warning" />
                            <Chip label={`Độ tin cậy: ${result.confidence}`} size="small" variant="outlined" color="warning" />
                          </Box>

                          {/* Đề câu hỏi */}
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1.5 }}>
                            <ChemicalText html={questionObj.content} />
                          </Typography>

                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            {/* Câu trả lời của học sinh */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                  HỌC SINH TRẢ LỜI:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#1e293b', whiteSpace: 'pre-line' }}>
                                  {result.studentAnswer}
                                </Typography>
                              </Box>
                            </Grid>
                            {/* Đáp án chuẩn */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Box sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, height: '100%' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                                  ĐÁP ÁN MẪU TỪ THƯ VIỆN:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', whiteSpace: 'pre-line' }}>
                                  {questionObj.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n')}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Nhận xét AI */}
                          <Box sx={{ p: 1.5, bgcolor: 'rgba(234, 88, 12, 0.03)', borderRadius: 2, mb: 2 }}>
                            <Typography variant="caption" color="#ea580c" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                              🤖 AI NHẬN XÉT:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                              {result.feedback}
                            </Typography>
                          </Box>

                          {/* Thay đổi điểm số */}
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                              AI chấm sơ bộ: <span style={{ color: '#ea580c' }}>{result.score}đ</span> / {result.maxScore}đ.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 'auto' }}>
                              <TextField
                                size="small"
                                type="number"
                                label="Chấm lại điểm"
                                value={currentVal}
                                onChange={e => handleScoreChange(qz.id, questionId, result.maxScore, e.target.value)}
                                slotProps={{ htmlInput: { min: 0, max: result.maxScore, step: 0.25 } }}
                                sx={{ width: 120 }}
                              />
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<Check size={14} />}
                                onClick={() => handleSaveScore(qz.id, questionId, result.maxScore)}
                                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', bgcolor: '#ea580c' }}
                              >
                                Xác nhận điểm
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* THẺ 3: LỊCH SỬ TẤT CẢ BÀI KIỂM TRA ĐÃ LÀM */}
            <Card sx={{ borderRadius: 3.5, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'black', mb: 2.5, color: '#1e293b' }}>
                  Lịch sử làm bài kiểm tra ({quizzes.length})
                </Typography>

                {quizzes.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Học sinh chưa hoàn thành bài kiểm tra nào.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {quizzes.map((qz, idx) => {
                      const ratio = Math.round((qz.score / qz.maxScore) * 100);
                      const isHigh = ratio >= 70;

                      return (
                        <Accordion key={qz.id} variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
                          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2, flexWrap: 'wrap' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                                Bài kiểm tra #{quizzes.length - idx}
                              </Typography>
                              <Chip
                                label={`${qz.score}/${qz.maxScore}đ (${ratio}%)`}
                                color={isHigh ? 'success' : 'warning'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                Lịch làm: {new Date(qz.createdAt).toLocaleString('vi-VN')}
                              </Typography>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc', p: 3 }}>
                            {/* Chi tiết từng câu hỏi trong bài thi */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {qz.questions.map((q, qidx) => {
                                const res = qz.results?.[q.id];
                                const isCorrect = res?.correct;
                                return (
                                  <Paper key={q.id} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fff' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip label={`Câu ${qidx + 1}`} size="small" variant="outlined" />
                                        <Chip label={q.type} size="small" />
                                      </Box>
                                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: isCorrect ? '#10b981' : '#ef4444' }}>
                                        Điểm: {res?.score}/{q.points}đ
                                      </Typography>
                                    </Box>

                                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                                      <ChemicalText html={q.content} />
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                      Học sinh làm: <strong>{res?.studentAnswer || '(Trống)'}</strong>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      Đáp án đúng: <strong>
                                        {q.type === 'Tự luận'
                                          ? q.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n')
                                          : q.correctAnswer
                                        }
                                      </strong>
                                    </Typography>
                                  </Paper>
                                );
                              })}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default QuizProgressTab;
