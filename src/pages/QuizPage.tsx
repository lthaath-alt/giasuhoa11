import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, TextField, Divider, Alert, AlertTitle,
  Grid, Chip, Card, CardContent, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Link, Tooltip,
} from '@mui/material';
import {
  Award, HelpCircle, CheckCircle, XCircle, AlertTriangle, Clock,
  ArrowLeft, BookOpen, Send, GraduationCap, Eye, ChevronRight
} from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { QuizStorage } from '../features/quiz/quizStorage';
import { QuizService } from '../features/quiz/quizService';
import type { Quiz, QuizQuestionResult } from '../features/quiz/types';

// Helper render Hóa học (giữ sub/sup)
function ChemicalText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Tải thông tin bài kiểm tra
  useEffect(() => {
    if (!quizId) return;
    const q = QuizStorage.getQuizById(quizId);
    if (q) {
      setQuiz(q);
      setAnswers(q.answers || {});
    }
  }, [quizId]);

  // 2. Tính thời gian còn lại của link
  useEffect(() => {
    if (!quiz || quiz.status === 'submitted') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(quiz.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeftStr('Đã hết hạn');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  if (!quiz) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 4 }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Không tìm thấy bài kiểm tra
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Đường dẫn bài kiểm tra không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Quay lại trang học tập
          </Button>
        </Paper>
      </Container>
    );
  }

  // 3. Bảo mật: Yêu cầu đăng nhập tài khoản sở hữu
  if (!currentUser) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 4 }}>
          <GraduationCap size={48} color="#ea580c" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Yêu cầu Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng đăng nhập đúng tài khoản học sinh đã tạo bài kiểm tra này để làm bài.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login', { state: { from: `/quiz/${quizId}` } })}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Đăng nhập ngay
          </Button>
        </Paper>
      </Container>
    );
  }

  // Bảo mật: Không cho tài khoản khác làm bài
  if (currentUser.email.toLowerCase() !== quiz.userEmail.toLowerCase() && currentUser.role !== 'super_admin' && currentUser.role !== 'school_admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 4 }}>
          <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: '#ef4444' }}>
            Quyền truy cập bị từ chối
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bài kiểm tra này được thiết lập riêng cho một học sinh khác. Bạn không thể làm đề thi của người khác!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Vào bài học của bạn
          </Button>
        </Paper>
      </Container>
    );
  }

  // Kiểm tra bài thi hết hạn mà chưa nộp
  const isExpired = quiz.status === 'pending' && new Date().getTime() > new Date(quiz.expiresAt).getTime();
  if (isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 4 }}>
          <Clock size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bài kiểm tra đã hết hạn
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Link bài kiểm tra này đã quá hạn 24 giờ. Vui lòng thảo luận lại với Gia sư AI để nhận bài kiểm tra mới.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Quay lại Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  // ── XỬ LÝ LÀM BÀI / THAY ĐỔI ĐÁP ÁN ──────────────────────────────────────

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleOpenConfirm = () => {
    const unansCount = quiz.questions.filter(q => !answers[q.id]?.trim()).length;
    if (unansCount > 0) {
      if (!window.confirm(`Bạn còn ${unansCount} câu hỏi chưa làm. Bạn vẫn muốn nộp bài?`)) {
        return;
      }
    }
    setSubmitConfirmOpen(true);
  };

  const handleSubmit = () => {
    setSubmitConfirmOpen(false);
    setSubmitting(true);
    setTimeout(() => {
      const updated = QuizService.submitQuiz(quiz.id, answers);
      if (updated) {
        setQuiz(updated);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Nộp bài thất bại. Vui lòng thử lại.');
      }
      setSubmitting(false);
    }, 1200);
  };

  // ── RENDER 1: GIAO DIỆN KẾT QUẢ (SAU KHI NỘP BÀI) ──────────────────────────

  if (quiz.status === 'submitted' && quiz.results) {
    const percent = Math.round((quiz.score / quiz.maxScore) * 100);
    const correctCount = Object.values(quiz.results).filter(r => r.correct).length;

    return (
      <Box id="quiz-result-view" sx={{ minHeight: '100vh', py: 6, bgcolor: '#f8fafc' }}>
        <Container maxWidth="md">
          {/* Header Kết quả */}
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              textAlign: 'center',
              border: '1px solid rgba(15,118,110,0.2)',
              background: 'linear-gradient(135deg, rgba(15,118,110,0.06) 0%, rgba(15,118,110,0.01) 100%)',
            }}
          >
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              bgcolor: 'rgba(15,118,110,0.12)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <Award size={36} color="#0f766e" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'black', color: '#0f766e', mb: 1 }}>
              KẾT QUẢ BÀI KIỂM TRA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Học sinh: <strong>{currentUser.name}</strong> ({currentUser.email})
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#ea580c' }}>
                    {quiz.score}/{quiz.maxScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Điểm số đạt được</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f766e' }}>
                    {percent}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Tỉ lệ chính xác</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#475569' }}>
                    {correctCount}/{quiz.questions.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Số câu trả lời đúng</Typography>
                </Paper>
              </Grid>
            </Grid>

            {percent >= 70 ? (
              <Alert severity="success" sx={{ borderRadius: 3, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Chúc mừng! Bạn đã hoàn thành tốt bài học</AlertTitle>
                Điểm số đạt trên 70% chứng tỏ bạn đã nắm vững kiến thức Socratic vừa trao đổi với Gia sư AI.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 3, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Cần tiếp tục ôn luyện thêm</AlertTitle>
                Điểm số của bạn dưới 70%. Bạn nên xem kỹ lại phần giải thích chi tiết từng câu sai bên dưới và trao đổi thêm với Gia sư AI.
              </Alert>
            )}
          </Paper>

          {/* Chi tiết từng câu hỏi */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1e293b' }}>
            Chi tiết bài làm
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {quiz.questions.map((q, idx) => {
              const res = quiz.results![q.id];
              const isCorrect = res?.correct;
              const weightColor = q.difficulty === 'Thấp' ? '#10b981' : q.difficulty === 'Trung bình' ? '#f59e0b' : '#ef4444';

              return (
                <Paper key={q.id} variant="outlined" sx={{ p: 3, borderRadius: 3.5, borderLeft: `5px solid ${isCorrect ? '#10b981' : '#ef4444'}` }}>
                  {/* Câu header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Câu ${idx + 1}`} color={isCorrect ? 'success' : 'error'} size="small" sx={{ fontWeight: 'bold' }} />
                      <Chip label={q.type} size="small" variant="outlined" />
                      <Chip label={q.difficulty} size="small" sx={{ bgcolor: weightColor, color: '#fff', fontSize: '0.7rem', height: 20 }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: isCorrect ? '#10b981' : '#ef4444' }}>
                      Điểm đạt: {res?.score}/{q.points}đ
                    </Typography>
                  </Box>

                  {/* Nội dung đề */}
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
                    <ChemicalText html={q.content} />
                  </Typography>

                  {/* Hiển thị câu trả lời */}
                  <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                      CÂU TRẢ LỜI CỦA BẠN:
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      color: isCorrect ? '#0f766e' : '#b91c1c',
                      display: 'flex', alignItems: 'center', gap: 0.5
                    }}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {res?.studentAnswer || '(Không có câu trả lời)'}
                    </Typography>
                  </Box>

                  {/* Nhận xét từ AI */}
                  {res?.feedback && (
                    <Box sx={{ p: 2, bgcolor: 'rgba(15,118,110,0.04)', borderRadius: 2.5, mb: 2, borderLeft: '3px solid #0f766e' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold', color: '#0f766e' }}>
                        🤖 NHẬN XÉT CỦA GIA SƯ AI:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#334155' }}>
                        {res.feedback}
                      </Typography>
                      {q.type === 'Tự luận' && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`Độ tin cậy: ${res.confidence}`} size="small" variant="outlined" color={res.confidence === 'high' ? 'success' : res.confidence === 'medium' ? 'warning' : 'default'} />
                          {res.confidence !== 'high' && (
                            <Tooltip title="Câu tự luận diễn đạt phức tạp, điểm AI chấm là sơ bộ và có thể được giáo viên chấm lại.">
                              <HelpCircle size={14} color="#94a3b8" />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Đáp án đúng mẫu */}
                  {!isCorrect && (
                    <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 2.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                        ĐÁP ÁN MẪU CHUẨN:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#475569', whiteSpace: 'pre-line' }}>
                        {q.type === 'Tự luận'
                          ? q.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n')
                          : q.correctAnswer
                        }
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {/* Nút quay lại */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', px: 4, py: 1.2, borderRadius: 3 }}
            >
              Quay lại trang học tập
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  // ── RENDER 2: GIAO DIỆN LÀM BÀI KIỂM TRA (PENDING) ─────────────────────────

  return (
    <Box id="quiz-taking-view" sx={{ minHeight: '100vh', py: 6, bgcolor: '#f8fafc' }}>
      <Container maxWidth="md">
        {/* Banner đếm ngược thời gian */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 3.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid rgba(234,88,12,0.3)',
            background: 'linear-gradient(135deg, rgba(234,88,12,0.04) 0%, rgba(234,88,12,0.01) 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: 'rgba(234,88,12,0.1)', borderRadius: 2, display: 'flex' }}>
              <Clock size={20} color="#ea580c" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ea580c' }}>
                Thời gian nộp bài còn lại
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Link bài thi hết hạn sau 24h kể từ khi tạo.
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 'black',
              color: '#ea580c',
            }}
          >
            {timeLeftStr || '--:--:--'}
          </Typography>
        </Paper>

        {/* Tiêu đề đề bài */}
        <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f766e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraduationCap size={24} />
            BÀI KIỂM TRA TỰ HỌC PHẢN XẠ HÓA 11
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Bài kiểm tra bám sát nội dung thảo luận Socratic vừa qua. Hãy suy nghĩ kỹ và trả lời đầy đủ.
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label={`${quiz.questions.length} câu hỏi`} color="primary" size="small" />
            <Chip label={`Tổng điểm: ${quiz.maxScore}đ`} color="secondary" size="small" />
            <Chip label="Đề thi xáo ngẫu nhiên" variant="outlined" size="small" />
          </Box>
        </Paper>

        {/* Danh sách câu hỏi */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, mb: 4 }}>
          {quiz.questions.map((q, idx) => {
            const weightColor = q.difficulty === 'Thấp' ? '#10b981' : q.difficulty === 'Trung bình' ? '#f59e0b' : '#ef4444';
            const value = answers[q.id] || '';

            return (
              <Paper key={q.id} variant="outlined" sx={{ p: 3, borderRadius: 3.5, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } }}>
                {/* Câu header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Chip label={`Câu ${idx + 1}`} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                  <Chip label={q.type} size="small" variant="outlined" />
                  <Chip label={q.difficulty} size="small" sx={{ bgcolor: weightColor, color: '#fff', fontSize: '0.7rem', height: 20 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                    {q.points} điểm
                  </Typography>
                </Box>

                {/* Nội dung câu hỏi */}
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b', mb: 3, lineHeight: 1.7 }}>
                  <ChemicalText html={q.content} />
                </Typography>

                {/* Form trả lời */}
                {q.type === 'Trắc nghiệm' && q.options && (
                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup
                      value={value}
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                    >
                      <Grid container spacing={2}>
                        {q.options.map(opt => {
                          const isSelected = value === opt.key;
                          return (
                            <Grid size={{ xs: 12, sm: 6 }} key={opt.key}>
                              <Card
                                variant="outlined"
                                onClick={() => handleAnswerChange(q.id, opt.key)}
                                sx={{
                                  borderRadius: 2.5,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  borderColor: isSelected ? '#ea580c' : '#e2e8f0',
                                  bgcolor: isSelected ? 'rgba(234,88,12,0.04)' : '#fff',
                                  '&:hover': { borderColor: '#ea580c', bgcolor: 'rgba(234,88,12,0.02)' }
                                }}
                              >
                                <CardContent sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', gap: 1, '&:last-child': { pb: 1.5 } }}>
                                  <Radio
                                    checked={isSelected}
                                    value={opt.key}
                                    color="primary"
                                    sx={{ p: 0.5 }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', minWidth: 20 }}>
                                    {opt.key}.
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                    <ChemicalText html={opt.text} />
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                )}

                {q.type === 'Đúng/Sai' && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {['Đúng', 'Sai'].map(opt => {
                      const isSelected = value === opt;
                      return (
                        <Button
                          key={opt}
                          variant={isSelected ? 'contained' : 'outlined'}
                          color={opt === 'Đúng' ? 'primary' : 'secondary'}
                          onClick={() => handleAnswerChange(q.id, opt)}
                          sx={{
                            flex: 1,
                            minWidth: 120,
                            py: 1.5,
                            borderRadius: 2.5,
                            fontWeight: 'bold',
                            boxShadow: 'none',
                          }}
                        >
                          {opt}
                        </Button>
                      );
                    })}
                  </Box>
                )}

                {q.type === 'Tự luận' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Nhập câu trả lời tự luận ngắn của bạn (gồm cả công thức/phương trình hóa học nếu có)..."
                    value={value}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 3 }
                    }}
                  />
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Lỗi nộp bài */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {errorMsg}
          </Alert>
        )}

        {/* Footer Nộp bài */}
        <Box sx={{ textAlign: 'center', pb: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleOpenConfirm}
            startIcon={<Send size={18} />}
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(234,88,12,0.2)',
              '&:hover': { boxShadow: '0 6px 20px rgba(234,88,12,0.3)' }
            }}
          >
            Nộp bài kiểm tra
          </Button>
        </Box>
      </Container>

      {/* Dialog xác nhận nộp bài */}
      <Dialog open={submitConfirmOpen} onClose={() => setSubmitConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Xác nhận nộp bài?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn nộp bài kiểm tra này? Kết quả sẽ được chấm điểm tự động ngay lập tức và lưu vào học bạ học tập.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setSubmitConfirmOpen(false)} sx={{ textTransform: 'none', borderRadius: 2 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold' }}
          >
            {submitting ? 'Đang chấm điểm...' : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizPage;
