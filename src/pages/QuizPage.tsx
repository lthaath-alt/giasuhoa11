import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, TextField, Divider, Alert, AlertTitle,
  Grid, Chip, Card, CardContent, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Link, Tooltip, DialogContentText
} from '@mui/material';
import {
  Award, HelpCircle, CheckCircle, XCircle, AlertTriangle, Clock,
  ArrowLeft, BookOpen, Send, GraduationCap, Eye, ChevronRight, Lock
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
  const { currentUser, updateLessonProgress, getLessonProgress, curriculum, libraryQuestions } = useApp();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // States for progression flow
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);

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
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <AlertTriangle size={48} color="var(--do)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Không tìm thấy bài kiểm tra
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Đường dẫn bài kiểm tra không tồn tại hoặc đã bị xóa khỏi hệ thống.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Quay lại trang học tập
          </Button>
        </Paper>
      </Container>
    );
  }

  // 2b. Bảo vệ: Nếu bài học chưa mở khóa thì không cho vào
  const allLessons = curriculum.flatMap(c => c.lessons);
  const lessonIndex = allLessons.findIndex(l => l.id === quiz.lessonId);
  
  let isLocked = false;
  if (currentUser && currentUser.role === 'student' && lessonIndex > 0) {
    const prevLesson = allLessons[lessonIndex - 1];
    const prevProgress = getLessonProgress(prevLesson.id);
    if (!prevProgress || !prevProgress.basicCompleted || (!prevProgress.advancedCompleted && !prevProgress.skippedAdvanced)) {
      isLocked = true;
    }
  }

  if (isLocked) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <Lock size={48} color="var(--chu-mo)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--do)' }}>
            Bài học đang bị khóa
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hoàn thành bài {lessonIndex} (Bài học trước đó) để mở khóa bài kiểm tra này.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 0 }}>
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
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <GraduationCap size={48} color="var(--chu-dam)" style={{ margin: '0 auto 16px' }} />
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
            sx={{ textTransform: 'none', borderRadius: 0 }}
          >
            Đăng nhập ngay
          </Button>
        </Paper>
      </Container>
    );
  }

  // Bảo mật: Không cho tài khoản khác làm bài
  if (currentUser.email.toLowerCase() !== quiz.userEmail.toLowerCase() && currentUser.role !== 'admin' && currentUser.role !== 'school_admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <XCircle size={48} color="var(--do)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, color: 'var(--do)' }}>
            Quyền truy cập bị từ chối
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bài kiểm tra này được thiết lập riêng cho một học sinh khác. Bạn không thể làm đề thi của người khác!
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 0 }}>
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
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <Clock size={48} color="var(--chu-mo)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bài kiểm tra đã hết hạn
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Link bài kiểm tra này đã quá hạn 24 giờ. Vui lòng thảo luận lại với Gia sư AI để nhận bài kiểm tra mới.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 0 }}>
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
      const updated = QuizService.submitQuiz(quiz!.id, answers);
      if (updated) {
        setQuiz(updated);
        
        const percent = Math.round((updated.score / updated.maxScore) * 100);
        const attempt = {
          quizId: updated.id,
          score: percent / 10, // Lưu điểm hệ 10
          timestamp: new Date().toISOString()
        };

        const currentProgress = getLessonProgress(updated.lessonId) || { bestScore: 0, quizAttempts: [] };
        const newBestScore = Math.max(currentProgress.bestScore || 0, attempt.score);
        
        const updates: any = {
          quizAttempts: [...(currentProgress.quizAttempts || []), attempt],
          bestScore: newBestScore,
        };

        if (percent >= 70) {
          updates.advancedUnlocked = true;
          setShowUnlockDialog(true);
        } else {
          setShowRetryDialog(true);
        }

        updateLessonProgress(updated.lessonId, updates);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Nộp bài thất bại. Vui lòng thử lại.');
      }
      setSubmitting(false);
    }, 1200);
  };

  const handleRetry = async () => {
    if (!quiz) return;
    const retryQuiz = await QuizService.createRetryQuiz(
      quiz.chapterId,
      quiz.lessonId,
      currentUser!.email,
      quiz.questions.map(q => q.id),
      libraryQuestions,
    );
    if (!retryQuiz) {
      setErrorMsg('Không đủ câu hỏi mới trong ngân hàng để tạo đề làm lại. Vui lòng quay lại màn hình học tập và liên hệ giáo viên.');
      setShowRetryDialog(false);
      return;
    }
    setShowRetryDialog(false);
    setQuiz(retryQuiz);
    setAnswers({});
    navigate(`/quiz/${retryQuiz.id}`, { replace: true });
  };

  const handleSkip = () => {
    if (!quiz) return;
    updateLessonProgress(quiz.lessonId, { skippedAdvanced: true });
    setShowRetryDialog(false);
    navigate('/dashboard'); // Trở về dashboard để vào bài tiếp theo
  };

  // ── RENDER 1: GIAO DIỆN KẾT QUẢ (SAU KHI NỘP BÀI) ──────────────────────────

  if (quiz.status === 'submitted' && quiz.results) {
    const percent = Math.round((quiz.score / quiz.maxScore) * 100);
    const correctCount = Object.values(quiz.results).filter(r => r.correct).length;

    return (
      <Box id="quiz-result-view" sx={{ minHeight: '100vh', py: 6, bgcolor: 'var(--nen-trang)' }}>
        <Container maxWidth="md">
          {/* Header Kết quả */}
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 0,
              textAlign: 'center',
              border: '1px solid var(--vien-2)',
              backgroundColor: 'var(--nen-luc-nhat2)',
            }}
          >
            <Box sx={{
              width: 72, height: 72, borderRadius: '50%',
              bgcolor: 'var(--nen-luc-nhat2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <Award size={36} color="var(--teal)" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'black', color: 'var(--teal)', mb: 1 }}>
              KẾT QUẢ BÀI KIỂM TRA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Học sinh: <strong>{currentUser.name}</strong> ({currentUser.email})
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2, justifyContent: 'center' }}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--chu-dam)' }}>
                    {quiz.score}/{quiz.maxScore}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Điểm số đạt được</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--teal)' }}>
                    {percent}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Tỉ lệ chính xác</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--chu)' }}>
                    {correctCount}/{quiz.questions.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Số câu trả lời đúng</Typography>
                </Paper>
              </Grid>
            </Grid>

            {percent >= 70 ? (
              <Alert severity="success" sx={{ borderRadius: 0, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Chúc mừng! Bạn đã hoàn thành tốt bài học</AlertTitle>
                Điểm số đạt trên 70% chứng tỏ bạn đã nắm vững kiến thức Socratic vừa trao đổi với Gia sư AI.
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 0, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Cần tiếp tục ôn luyện thêm</AlertTitle>
                Điểm số của bạn dưới 70%. Bạn nên xem kỹ lại phần giải thích chi tiết từng câu sai bên dưới và trao đổi thêm với Gia sư AI.
              </Alert>
            )}
          </Paper>

          {/* Chi tiết từng câu hỏi */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'var(--chu-dam-2)' }}>
            Chi tiết bài làm
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {quiz.questions.map((q, idx) => {
              const res = quiz.results![q.id];
              const isCorrect = res?.correct;
              const weightColor = q.difficulty === 'Thấp' ? 'var(--luc)' : q.difficulty === 'Trung bình' ? 'var(--vang)' : 'var(--do)';

              return (
                <Paper key={q.id} variant="outlined" sx={{ p: 3, borderRadius: 0, borderLeft: `5px solid ${isCorrect ? 'var(--luc)' : 'var(--do)'}` }}>
                  {/* Câu header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Câu ${idx + 1}`} color={isCorrect ? 'success' : 'error'} size="small" sx={{ fontWeight: 'bold' }} />
                      <Chip label={q.type} size="small" variant="outlined" />
                      <Chip label={q.difficulty} size="small" sx={{ bgcolor: weightColor, color: 'var(--chu-nguoc)', fontSize: '0.7rem', height: 20 }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: isCorrect ? 'var(--luc)' : 'var(--do)' }}>
                      Điểm đạt: {res?.score}/{q.points}đ
                    </Typography>
                  </Box>

                  {/* Nội dung đề */}
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--chu-dam-2)', mb: 2 }}>
                    <ChemicalText html={q.content} />
                  </Typography>

                  {/* Hiển thị câu trả lời */}
                  <Box sx={{ p: 2, bgcolor: 'var(--nen-trang)', borderRadius: 0, mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                      CÂU TRẢ LỜI CỦA BẠN:
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      color: isCorrect ? 'var(--teal)' : 'var(--do-dam)',
                      display: 'flex', alignItems: 'center', gap: 0.5
                    }}>
                      {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {res?.studentAnswer || '(Không có câu trả lời)'}
                    </Typography>
                  </Box>

                  {/* Nhận xét từ AI */}
                  {res?.feedback && (
                    <Box sx={{ p: 2, bgcolor: 'var(--nen-luc-nhat2)', borderRadius: 0, mb: 2, border: '1px solid var(--teal-nen)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold', color: 'var(--teal)' }}>
                        🤖 NHẬN XÉT CỦA GIA SƯ AI:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'var(--chu-dam-3)' }}>
                        {res.feedback}
                      </Typography>
                      {q.type === 'Tự luận' && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={`Độ tin cậy: ${res.confidence}`} size="small" variant="outlined" color={res.confidence === 'high' ? 'success' : res.confidence === 'medium' ? 'warning' : 'default'} />
                          {res.confidence !== 'high' && (
                            <Tooltip title="Câu tự luận diễn đạt phức tạp, điểm AI chấm là sơ bộ và có thể được giáo viên chấm lại.">
                              <HelpCircle size={14} color="var(--chu-mo)" />
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Đáp án đúng mẫu */}
                  {!isCorrect && (
                    <Box sx={{ p: 2, bgcolor: 'var(--nen-nhat)', borderRadius: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                        ĐÁP ÁN MẪU CHUẨN:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--chu)', whiteSpace: 'pre-line' }}>
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
              sx={{ textTransform: 'none', px: 4, py: 1.2, borderRadius: 0 }}
            >
              Quay lại trang học tập
            </Button>
          </Box>
        </Container>

        {/* Dialog báo chưa đạt (dưới 7 điểm) */}
        <Dialog open={showRetryDialog} onClose={() => {}} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>
            Chưa đạt yêu cầu phần Cơ bản
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Điểm số của bạn dưới 7 điểm. Phần <strong>Nâng cao</strong> của bài này vẫn bị khóa.
              Bạn muốn làm lại đề kiểm tra khác (cùng chủ đề) để cải thiện điểm số và mở khóa phần Nâng cao, hay bỏ qua để chuyển sang bài học tiếp theo?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
            <Button onClick={handleSkip} color="inherit" sx={{ textTransform: 'none', borderRadius: 0 }}>
              Bỏ qua, học tiếp Bài sau
            </Button>
            <Button onClick={handleRetry} color="primary" variant="contained" sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
              Làm lại bài kiểm tra
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog báo đạt (>= 7 điểm) */}
        <Dialog open={showUnlockDialog} onClose={() => setShowUnlockDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', color: 'var(--luc)' }}>
            🎉 Chúc mừng! Mở khoá thành công
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tuyệt vời! Bạn đã vượt qua bài kiểm tra với điểm số xuất sắc. 
              Phần <strong>Nâng cao</strong> của bài học này đã được mở khóa dành riêng cho bạn!
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
            <Button onClick={() => { setShowUnlockDialog(false); navigate('/dashboard'); }} color="primary" variant="contained" sx={{ textTransform: 'none', borderRadius: 0, boxShadow: 'none' }}>
              Vào phần Nâng cao ngay
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // ── RENDER 2: GIAO DIỆN LÀM BÀI KIỂM TRA (PENDING) ─────────────────────────

  return (
    <Box id="quiz-taking-view" sx={{ minHeight: '100vh', py: 6, bgcolor: 'var(--nen-trang)' }}>
      <Container maxWidth="md">
        {/* Banner đếm ngược thời gian */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 4,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--vang-nen)',
            backgroundColor: 'var(--nen-vang-nhat)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ p: 1, bgcolor: 'var(--vang-nen)', borderRadius: 0, display: 'flex' }}>
              <Clock size={20} color="var(--chu-tren-vang)" />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--vang)' }}>
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
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--chu-dam)',
            }}
          >
            {timeLeftStr || '--:--:--'}
          </Typography>
        </Paper>

        {/* Tiêu đề đề bài */}
        <Paper variant="outlined" sx={{ p: 4, mb: 4, borderRadius: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--teal)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
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
            const weightColor = q.difficulty === 'Thấp' ? 'var(--luc)' : q.difficulty === 'Trung bình' ? 'var(--vang)' : 'var(--do)';
            const value = answers[q.id] || '';

            return (
              <Paper key={q.id} variant="outlined" sx={{ p: 3, borderRadius: 0, transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 'none' } }}>
                {/* Câu header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Chip label={`Câu ${idx + 1}`} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                  <Chip label={q.type} size="small" variant="outlined" />
                  <Chip label={q.difficulty} size="small" sx={{ bgcolor: weightColor, color: 'var(--chu-nguoc)', fontSize: '0.7rem', height: 20 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 'auto' }}>
                    {q.points} điểm
                  </Typography>
                </Box>

                {/* Nội dung câu hỏi */}
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--chu-dam-2)', mb: 3, lineHeight: 1.7 }}>
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
                                  borderRadius: 0,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  borderColor: isSelected ? 'var(--cam)' : 'var(--vien)',
                                  bgcolor: isSelected ? 'var(--nen-cam-nhat2)' : 'var(--nen-the)',
                                  '&:hover': { borderColor: 'var(--cam)', bgcolor: 'var(--nen-cam-nhat2)' }
                                }}
                              >
                                <CardContent sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', gap: 1, '&:last-child': { pb: 1.5 } }}>
                                  <Radio
                                    checked={isSelected}
                                    value={opt.key}
                                    color="primary"
                                    sx={{ p: 0.5 }}
                                  />
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--chu)', minWidth: 20 }}>
                                    {opt.key}.
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'var(--chu-dam-2)' }}>
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
                            borderRadius: 0,
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
                      '& .MuiOutlinedInput-root': { borderRadius: 0 }
                    }}
                  />
                )}
              </Paper>
            );
          })}
        </Box>

        {/* Lỗi nộp bài */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
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
              borderRadius: 0,
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
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
          <Button onClick={() => setSubmitConfirmOpen(false)} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
          >
            {submitting ? 'Đang chấm điểm...' : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizPage;
