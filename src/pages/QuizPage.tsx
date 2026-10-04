import { locHtml } from '../core/services/locHtml';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Paper, Button, Radio, RadioGroup,
  FormControlLabel, FormControl, TextField, Divider, Alert, AlertTitle,
  Grid, Chip, Card, CardContent, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Link, Tooltip
} from '@mui/material';
import {
  Award, HelpCircle, CheckCircle, XCircle, AlertTriangle, Clock,
  ArrowLeft, BookOpen, Send, GraduationCap, Eye, ChevronRight, Lock, RotateCcw
} from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { xetKhoaBai, baiLamDuocNgay, DIEM_MO_BAI_SAU } from '../features/lessons/khoaBai';
import { QuizStorage } from '../features/quiz/quizStorage';
import { QuizService } from '../features/quiz/quizService';
import { docBaiNop } from '../features/quiz/baiNopService';
import { dapSoCua, giaiMaDungSai, maHoaDungSai } from '../features/quiz/chamDiem';
import type { Quiz, QuizQuestionResult } from '../features/quiz/types';
import type { Question } from '../features/library/types';

/** Câu Đúng/Sai nhiều ý (chấm từng ý) hay câu một mệnh đề kiểu cũ */
const laDungSaiNhieuY = (q: Question) =>
  q.type === 'Đúng/Sai' && Array.isArray(q.yDungSai) && q.yDungSai.length > 1;

/** Tên dạng câu hiện cho học sinh. Mô hình cũ gọi câu trả lời ngắn là "Tự luận". */
const tenDangCau = (q: Question) => (dapSoCua(q) ? 'Trả lời ngắn' : q.type);

const chuY = (i: number) => String.fromCharCode(97 + i);

/** Nội dung phương án ứng với chữ cái của một câu TRẮC NGHIỆM; dạng câu khác trả `null`.
 *  Trang kết quả hiện đề dẫn nhưng KHÔNG hiện bốn phương án, nên trước đây em
 *  chỉ đọc được "B" và "C" mà không biết mình đã chọn gì, đáp án đúng nói gì. */
const noiDungPhuongAn = (q: Question, chu: string | undefined): string | null => {
  if (q.type !== 'Trắc nghiệm' || !chu) return null;
  const khoa = chu.trim().toUpperCase();
  return q.options?.find(o => o.key === khoa)?.text ?? null;
};

// Helper render Hóa học (giữ sub/sup)
// Nội dung tới từ `bank_questions`, collection ai cũng ghi được — PHẢI lọc.
// Xem src/core/services/locHtml.ts.
function ChemicalText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: locHtml(html) }} />;
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

  // 1. Tải thông tin bài kiểm tra
  useEffect(() => {
    if (!quizId) return;
    const q = QuizStorage.getQuizById(quizId);
    if (q) {
      setQuiz(q);
      setAnswers(q.answers || {});
    }
    /* Bài đã nộp: bản trên Firestore mang điểm giáo viên chấm lại, và mở được
       cả khi máy này không có bài (học sinh đổi máy). Bài đang làm dở thì chỉ
       có trong máy, không cần hỏi mạng. */
    if (q && q.status !== 'submitted') return;
    let huy = false;
    void docBaiNop(quizId).then(ban => {
      if (huy || !ban) return;
      setQuiz(ban);
      setAnswers(ban.answers || {});
      if (q) QuizStorage.updateQuiz(quizId, ban);
    });
    return () => { huy = true; };
  }, [quizId]);

  /* Đáp án mới nhất, đọc được từ trong bộ đếm giờ. Bộ đếm sống suốt lúc làm bài
     nên biến `answers` nó khép lại là bản của lúc MỞ trang — tự nộp bằng bản đó
     là nộp một bài trống. */
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const daTuNop = useRef(false);

  // 2. Tính thời gian còn lại của link
  useEffect(() => {
    if (!quiz || quiz.status === 'submitted') return;

    /* Đề GIÁO VIÊN GIAO hết giờ thì TỰ NỘP phần em đã làm (02/10/2026). Trước đó
       hết giờ là cả trang đổi sang "đã quá hạn 24 giờ, hỏi Gia sư AI": bài không
       được nộp, đáp án đã chọn mất, cô thấy em "chưa nộp", và em không có đường
       nào làm lại. Đo bằng một đề 1 phút: 4 đáp án đã chọn, hết giờ còn 0.
       Chỉ chủ bài mới tự nộp; đề tự ôn giữ nguyên lối cũ (hết 24 giờ thì xin đề mới). */
    const laChuBai = !!currentUser
      && currentUser.email.toLowerCase() === quiz.userEmail.toLowerCase();
    const tuNop = () => {
      if (daTuNop.current) return;
      daTuNop.current = true;
      nopBai(answersRef.current);
    };

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expires = new Date(quiz.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeftStr('Đã hết hạn');
        clearInterval(timer);
        if (quiz.deGiaoId && laChuBai) tuNop();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, currentUser?.email]);

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

  /* Khoá bài tuần tự (04/10/2026, chủ dự án chốt): đề của bài N chỉ làm được khi
     em đã đạt từ 7/10 đề kiểm tra của bài N−1 — luật nằm ở
     `features/lessons/khoaBai.ts`, dùng chung với danh mục bài, ô tìm kiếm và
     chỗ Chemai phát đề.
     Bản khoá trước đòi thêm cờ phần "Nâng cao" không nơi nào đặt được, nên em
     đạt 70% ngay lần đầu vẫn bị chặn bài sau (đo 02/10/2026).
     Chỉ chặn đề ĐANG LÀM: bài đã nộp thì em vẫn mở lại xem điểm và lời giải.
     Đề cả chương và đề giáo viên giao mang mã không phải bài nào nên không bị
     chặn — xem điều 3 mục "Đề giáo viên GIAO" trong docs/claude-reference/data.md. */
  const dsBai = curriculum.flatMap(c => c.lessons);
  const xetKhoa = xetKhoaBai(dsBai, quiz.lessonId, getLessonProgress, currentUser.role);
  if (xetKhoa.khoa && quiz.status !== 'submitted') {
    /* Bài chặn có thể cũng đang khoá; khi đó nói luôn bài em làm được ngay. */
    const baiNgay = baiLamDuocNgay(dsBai, quiz.lessonId, getLessonProgress, currentUser.role);
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <Lock size={48} color="var(--chu-mo)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Bài học đang bị khóa
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Em cần đạt từ {DIEM_MO_BAI_SAU}/10 điểm ở đề kiểm tra của{' '}
            <strong>{xetKhoa.baiTruoc?.title}</strong> thì đề này mới mở.
            {baiNgay && baiNgay.id !== xetKhoa.baiTruoc?.id
              ? <> Bài đó cũng chưa mở; bài em làm được ngay là <strong>{baiNgay.title}</strong>. Em xin Chemai đề của bài đó để làm trước nhé.</>
              : <> Em xin Chemai đề của bài đó để làm trước nhé.</>}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ textTransform: 'none', borderRadius: 0 }}>
            Quay lại trang học tập
          </Button>
        </Paper>
      </Container>
    );
  }

  // Kiểm tra bài thi hết hạn mà chưa nộp
  const daQuaGio =quiz.status === 'pending' && new Date().getTime() > new Date(quiz.expiresAt).getTime();

  /* Đề giáo viên giao hết giờ: bộ đếm ở trên đang tự nộp (chậm nhất một giây
     nữa). Hiện màn chờ thay cho các ô chọn, để em không bấm thêm vào một bài
     sắp được chốt. */
  if (daQuaGio && quiz.deGiaoId) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
          <Clock size={48} color="var(--chu-mo)" style={{ margin: '0 auto 16px' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Đã hết giờ làm bài
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {errorMsg || 'Hệ thống đang nộp phần em đã làm…'}
          </Typography>
          {!errorMsg && <CircularProgress size={28} />}
        </Paper>
      </Container>
    );
  }

  const isExpired = daQuaGio;
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
    const moi = { ...answersRef.current, [qId]: val };
    answersRef.current = moi;
    setAnswers(moi);
    /* Lưu tạm xuống máy sau MỖI lần chọn (02/10/2026). Trước đó đáp án chỉ nằm
       trong state: tải lại trang giữa chừng là mất sạch trong khi đồng hồ vẫn
       chạy — đo được 3 câu đã chọn còn 0. `Quiz.answers` vốn sinh ra để chứa
       đúng thứ này, và trang đã đọc nó lại lúc mở. */
    if (quiz.status === 'pending') QuizStorage.updateQuiz(quiz.id, { answers: moi });
  };

  /** Câu còn bỏ trống. Câu Đúng/Sai nhiều ý thiếu một ý cũng tính là chưa xong. */
  const chuaLam = (q: Question) => {
    const tl = (answers[q.id] || '').trim();
    if (laDungSaiNhieuY(q)) return tl.length < q.yDungSai!.length || tl.includes('-');
    return !tl;
  };

  const handleOpenConfirm = () => {
    const unansCount = quiz.questions.filter(chuaLam).length;
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
    setTimeout(() => nopBai(answers), 1200);
  };

  /* Chấm và nộp. Khai bằng `function` (được đưa lên đầu hàm) vì bộ đếm giờ ở
     trên gọi nó khi hết giờ, kể cả ở lượt vẽ đã `return` sớm trước dòng này. */
  function nopBai(dapAn: Record<string, string>) {
    if (!quiz) return;
    {
      const updated = QuizService.submitQuiz(quiz.id, dapAn);
      if (updated) {
        setQuiz(updated);

        /* Đề GIÁO VIÊN GIAO dừng ở đây (22/09/2026). Hai việc bên dưới đều sai
           với nó:
           - Mời "làm lại một đề khác": đề của cô chỉ nộp một lần, và mã bài suy
             ra từ email nên lượt thứ hai sẽ GHI ĐÈ điểm cô đang chấm.
           - Ghi tiến độ bài học: `lessonId` của nó là `de-giao:<id>`, không phải
             bài nào trong chương trình, nên đó chỉ là rác trong hồ sơ tiến độ.
           Xem `features/quiz/taoDeGiao.ts`. */
        if (updated.deGiaoId) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setSubmitting(false);
          return;
        }

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

        /* Đạt 7/10 thì tính bài học là HOÀN THÀNH (18/09/2026). Trước đây chỉ
           nút "Đánh dấu Xong" ở mục Các khóa học mới đặt được, mà mục đó bị
           ẩn khỏi menu — nên "Bài học đã hoàn thành" luôn 0 với mọi em.
           Đề cả chương mang `lessonId` = mã CHƯƠNG, không phải bài: bỏ qua,
           kẻo đếm một chương thành một bài.
           Hai hộp thoại "Nâng cao" từng bật ở đây đã gỡ ngày 04/10/2026 (chủ dự
           án chốt bỏ phần Nâng cao): hộp "chưa đạt" không đóng được nên em không
           xem được bài vừa chấm, hộp "đạt" mời vào một phần không tồn tại. Việc
           mở bài sau nay đọc thẳng `bestScore` ghi ngay bên trên. */
        if (percent >= 70 && curriculum.some(c => c.lessons.some(l => l.id === updated.lessonId))) {
          updates.basicCompleted = true;
        }

        updateLessonProgress(updated.lessonId, updates);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Nộp bài thất bại. Vui lòng thử lại.');
      }
      setSubmitting(false);
    }
  }

  /* Làm lại bằng một đề KHÁC của cùng bài (không lặp câu của đề vừa nộp). Gọi từ
     nút trên trang kết quả khi chưa đạt 70%. */
  const handleRetry = async () => {
    if (!quiz) return;
    setErrorMsg(null);
    const retryQuiz = await QuizService.createRetryQuiz(
      quiz.chapterId,
      quiz.lessonId,
      currentUser!.email,
      quiz.questions.map(q => q.id),
      libraryQuestions,
    );
    if (!retryQuiz) {
      setErrorMsg('Không đủ câu hỏi mới trong ngân hàng để tạo đề làm lại. Vui lòng quay lại màn hình học tập và liên hệ giáo viên.');
      return;
    }
    setQuiz(retryQuiz);
    setAnswers({});
    navigate(`/quiz/${retryQuiz.id}`, { replace: true });
  };

  // ── RENDER 1: GIAO DIỆN KẾT QUẢ (SAU KHI NỘP BÀI) ──────────────────────────

  if (quiz.status === 'submitted' && quiz.results) {
    const percent = Math.round((quiz.score / quiz.maxScore) * 100);
    const correctCount = Object.values(quiz.results).filter(r => r.correct).length;

    /* Đề tự ôn của MỘT BÀI (không phải đề cả chương, không phải đề giáo viên
       giao): mới có "làm lại đề khác" và mới liên quan tới việc mở bài sau. */
    const viTriBai = quiz.deGiaoId ? -1 : dsBai.findIndex(b => b.id === quiz.lessonId);
    const laChuBai = currentUser.email.toLowerCase() === quiz.userEmail.toLowerCase();
    const duocLamLai = viTriBai >= 0 && percent < 70 && laChuBai;
    /* Bài kế tiếp và nó đã mở chưa — đọc tiến độ THẬT, không suy từ điểm của
       riêng đề này: em có thể đã đạt bài này ở một lần làm khác. */
    const baiKeTiep = viTriBai >= 0 && currentUser.role === 'student' ? dsBai[viTriBai + 1] : undefined;
    const xetBaiKeTiep = baiKeTiep
      ? xetKhoaBai(dsBai, baiKeTiep.id, getLessonProgress, currentUser.role)
      : null;
    /* Chỉ nói về bài kế tiếp khi CHÍNH BÀI NÀY là bài chặn của nó. Bài ôn tập
       không chặn bài nào (xem khoaBai.ts): làm đề ôn tập dưới 70% thì bài sau
       vẫn mở hay khoá là do một bài khác, nói "cần đạt bài này" là nói sai. */
    const baiNayChanBaiKe = !!xetBaiKeTiep && xetBaiKeTiep.baiTruoc?.id === quiz.lessonId;
    const baiKeTiepConKhoa = baiNayChanBaiKe && xetBaiKeTiep!.khoa;

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
              <Award size={36} color="var(--luc-tham)" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'black', color: 'var(--luc-tham)', mb: 1 }}>
              KẾT QUẢ BÀI KIỂM TRA
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Học sinh: <strong>{currentUser.name}</strong> ({currentUser.email})
            </Typography>

            {quiz.deGiaoId && (
              <Alert severity="info" sx={{ borderRadius: 0, textAlign: 'left', mb: 2 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Bài đã gửi cho giáo viên</AlertTitle>
                Đề "{quiz.tenDe}" — giáo viên xem được điểm và từng câu trả lời của em.
                Điểm tự luận (nếu có) là điểm AI chấm sơ bộ, giáo viên sẽ chấm lại.
              </Alert>
            )}

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
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--luc-tham)' }}>
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

            {/* Hai lời nhận xét dưới đây viết cho đề tự ôn sau buổi trao đổi với
                gia sư ("kiến thức Socratic vừa trao đổi"). Đề giáo viên giao đã
                có khung "Bài đã gửi cho giáo viên" ở trên, không nhắc gia sư AI. */}
            {quiz.deGiaoId ? null : percent >= 70 ? (
              <Alert severity="success" sx={{ borderRadius: 0, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Chúc mừng! Bạn đã hoàn thành tốt bài học</AlertTitle>
                Điểm số đạt trên 70% chứng tỏ bạn đã nắm vững kiến thức Socratic vừa trao đổi với Gia sư AI.
                {baiKeTiep && baiNayChanBaiKe && !baiKeTiepConKhoa && (
                  <> Bài tiếp theo — <strong>{baiKeTiep.title}</strong> — đã mở.</>
                )}
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 0, textAlign: 'left', mt: 3 }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Cần tiếp tục ôn luyện thêm</AlertTitle>
                Điểm số của bạn dưới 70%. Bạn nên xem kỹ lại phần giải thích chi tiết từng câu sai bên dưới và trao đổi thêm với Gia sư AI.
                {baiKeTiep && baiNayChanBaiKe && baiKeTiepConKhoa && (
                  <> Cần đạt từ 70% đề của bài này thì <strong>{baiKeTiep.title}</strong> mới mở.</>
                )}
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
                /* Không kẻ viền trái dày xanh/đỏ (ui.md cấm kiểu viền đó): đúng
                   hay sai đã có chip "Câu N", dòng "Điểm đạt" và biểu tượng ở
                   ô câu trả lời nói rồi. */
                <Paper key={q.id} variant="outlined" sx={{ p: 3, borderRadius: 0 }}>
                  {/* Câu header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Câu ${idx + 1}`} color={isCorrect ? 'success' : 'error'} size="small" sx={{ fontWeight: 'bold' }} />
                      <Chip label={tenDangCau(q)} size="small" variant="outlined" />
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

                  {/* Câu Đúng/Sai nhiều ý: từng ý kèm lựa chọn của em và đáp án.
                      Thiếu khối này thì em chỉ thấy "a) Đúng · b) Sai" mà không
                      biết a, b là ý nào. */}
                  {laDungSaiNhieuY(q) && (
                    <Box sx={{ mb: 2, border: '1px solid var(--vien)' }}>
                      {giaiMaDungSai(quiz.answers?.[q.id] || '', q.yDungSai!.length).map((chon, i) => {
                        const y = q.yDungSai![i];
                        const dungY = chon === y.v;
                        return (
                          <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap', p: 1.5, borderTop: i ? '1px solid var(--vien)' : 'none' }}>
                            <Box sx={{ color: dungY ? 'var(--luc-tham)' : 'var(--do-dam)', display: 'flex', mt: 0.3 }}>
                              {dungY ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            </Box>
                            <Typography variant="body2" sx={{ flex: 1, minWidth: 200, color: 'var(--chu-dam-2)' }}>
                              <strong>{chuY(i)})</strong> <ChemicalText html={y.s} />
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--chu-2)', whiteSpace: 'nowrap' }}>
                              Em chọn: <strong>{chon === null ? 'bỏ trống' : chon ? 'Đúng' : 'Sai'}</strong>
                              {' · '}Đáp án: <strong>{y.v ? 'Đúng' : 'Sai'}</strong>
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  )}

                  {/* Hiển thị câu trả lời */}
                  <Box sx={{ p: 2, bgcolor: 'var(--nen-trang)', borderRadius: 0, mb: 2, display: laDungSaiNhieuY(q) ? 'none' : 'block' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                      CÂU TRẢ LỜI CỦA BẠN:
                    </Typography>
                    <Typography variant="body2" sx={{
                      fontWeight: 600,
                      color: isCorrect ? 'var(--luc-tham)' : 'var(--do-dam)',
                      /* Căn theo dòng ĐẦU: nội dung phương án có thể dài vài dòng */
                      display: 'flex', alignItems: 'flex-start', gap: 0.5
                    }}>
                      {isCorrect
                        ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        : <XCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
                      <span>
                        {res?.studentAnswer || '(Không có câu trả lời)'}
                        {noiDungPhuongAn(q, res?.studentAnswer) && (
                          <>. <ChemicalText html={noiDungPhuongAn(q, res?.studentAnswer)!} /></>
                        )}
                      </span>
                    </Typography>
                  </Box>

                  {/* Nhận xét từ AI */}
                  {res?.feedback && (
                    <Box sx={{ p: 2, bgcolor: 'var(--nen-luc-nhat2)', borderRadius: 0, mb: 2, border: '1px solid var(--luc-tham-nen)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold', color: 'var(--luc-tham)' }}>
                        {/* Câu chấm bằng so đáp án thì không có AI nào nhận xét cả. */}
                        {q.type === 'Tự luận' && !dapSoCua(q) ? 'NHẬN XÉT CỦA GIA SƯ AI:' : 'KẾT QUẢ CHẤM:'}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'var(--chu-dam-3)' }}>
                        {res.feedback}
                      </Typography>
                      {q.type === 'Tự luận' && !dapSoCua(q) && (
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

                  {/* Đáp án đúng mẫu (câu Đúng/Sai nhiều ý đã ghi đáp án ở từng ý) */}
                  {!isCorrect && !laDungSaiNhieuY(q) && (
                    <Box sx={{ p: 2, bgcolor: 'var(--nen-nhat)', borderRadius: 0 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                        ĐÁP ÁN MẪU CHUẨN:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--chu)', whiteSpace: 'pre-line' }}>
                        {q.type === 'Tự luận'
                          ? q.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n')
                          : q.correctAnswer
                        }
                        {noiDungPhuongAn(q, q.correctAnswer) && (
                          <>. <ChemicalText html={noiDungPhuongAn(q, q.correctAnswer)!} /></>
                        )}
                      </Typography>
                    </Box>
                  )}

                  {/* Lời giải — hiện cho CẢ câu đúng lẫn câu sai (22/09/2026).
                      Em làm đúng do đoán mò thì vẫn cần biết vì sao đúng, và
                      chỗ này trước nay bỏ trống dù ngân hàng có sẵn lời giải
                      cho cả 1.554 câu — xem `giaiThich` trong library/types.ts. */}
                  {q.giaiThich && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--nen-nhat)', borderRadius: 0, border: '1px solid var(--vien)' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 'bold' }}>
                        LỜI GIẢI:
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'var(--chu)', lineHeight: 1.7 }}>
                        <ChemicalText html={q.giaiThich} />
                      </Typography>
                    </Box>
                  )}
                </Paper>
              );
            })}
          </Box>

          {/* Chưa đạt 70% đề của một bài: cho làm lại bằng đề khác NGAY TẠI ĐÂY.
              Trước 04/10/2026 lời mời này nằm trong một hộp thoại không đóng
              được, che luôn bài vừa chấm. Lỗi tạo đề hiện ngay trên hàng nút. */}
          {errorMsg && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 0 }}>{errorMsg}</Alert>
          )}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {duocLamLai && (
              <Button
                id="quiz-retry-btn"
                variant="contained"
                startIcon={<RotateCcw size={16} />}
                onClick={handleRetry}
                sx={{ textTransform: 'none', px: 4, py: 1.2, borderRadius: 0, boxShadow: 'none' }}
              >
                Làm lại đề khác
              </Button>
            )}
            <Button
              variant={duocLamLai ? 'outlined' : 'contained'}
              startIcon={<ArrowLeft size={16} />}
              onClick={() => navigate('/dashboard')}
              sx={{ textTransform: 'none', px: 4, py: 1.2, borderRadius: 0 }}
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
                {quiz.deGiaoId
                  ? 'Hết giờ, hệ thống tự nộp phần em đã làm.'
                  : 'Link bài thi hết hạn sau 24h kể từ khi tạo.'}
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
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'var(--luc-tham)', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraduationCap size={24} />
            {/* Đề giáo viên giao mang tên cô đặt; tiêu đề cũ chỉ đúng với đề tự ôn. */}
            {quiz.deGiaoId ? (quiz.tenDe || 'Bài kiểm tra giáo viên giao') : 'BÀI KIỂM TRA TỰ HỌC PHẢN XẠ HÓA 11'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {quiz.deGiaoId
              ? 'Đề do giáo viên giao, mỗi em nộp một lần. Đáp án em chọn được lưu tạm trên máy này.'
              : 'Bài kiểm tra bám sát nội dung thảo luận Socratic vừa qua. Hãy suy nghĩ kỹ và trả lời đầy đủ.'}
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
                  <Chip label={tenDangCau(q)} size="small" variant="outlined" />
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
                                  borderColor: isSelected ? 'var(--tin-hieu)' : 'var(--vien)',
                                  bgcolor: isSelected ? 'var(--nen-tin-hieu-nhat2)' : 'var(--nen-the)',
                                  '&:hover': { borderColor: 'var(--tin-hieu)', bgcolor: 'var(--nen-tin-hieu-nhat2)' }
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

                {/* Đúng/Sai NHIỀU Ý: mỗi ý một cặp nút, chấm từng ý (02/10/2026).
                    Đáp án lưu thành một chuỗi mã ("DS-D") — xem chamDiem.ts. */}
                {laDungSaiNhieuY(q) && (() => {
                  const dap = giaiMaDungSai(value, q.yDungSai!.length);
                  const chon = (i: number, v: boolean) => {
                    const moi = [...dap];
                    moi[i] = v;
                    handleAnswerChange(q.id, maHoaDungSai(moi));
                  };
                  return (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Chọn Đúng hoặc Sai cho từng ý. Đúng hết được trọn điểm; sai 1 ý còn 0,5; sai 2 ý 0,25; sai 3 ý 0,1.
                      </Typography>
                      <Box sx={{ border: '1px solid var(--vien)' }}>
                        {q.yDungSai!.map((y, i) => (
                          <Box
                            key={i}
                            sx={{
                              display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
                              p: 1.5, borderTop: i ? '1px solid var(--vien)' : 'none',
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1, minWidth: 200, color: 'var(--chu-dam-2)' }}>
                              <strong>{chuY(i)})</strong> <ChemicalText html={y.s} />
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {[true, false].map(v => (
                                <Button
                                  key={String(v)}
                                  size="small"
                                  variant={dap[i] === v ? 'contained' : 'outlined'}
                                  color={v ? 'primary' : 'secondary'}
                                  aria-pressed={dap[i] === v}
                                  aria-label={`Ý ${chuY(i)}: ${v ? 'Đúng' : 'Sai'}`}
                                  onClick={() => chon(i, v)}
                                  sx={{ minWidth: 72, borderRadius: 0, fontWeight: 'bold', boxShadow: 'none' }}
                                >
                                  {v ? 'Đúng' : 'Sai'}
                                </Button>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  );
                })()}

                {q.type === 'Đúng/Sai' && !laDungSaiNhieuY(q) && (
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

                {/* Trả lời ngắn: một ô nhập đáp số, chấm bằng so số. Ô nhiều dòng
                    bên dưới chỉ còn dành cho câu tự luận thật. */}
                {q.type === 'Tự luận' && dapSoCua(q) && (
                  <TextField
                    size="small"
                    placeholder="Đáp số"
                    value={value}
                    onChange={e => handleAnswerChange(q.id, e.target.value)}
                    helperText={`Chỉ gõ con số${dapSoCua(q)!.unit ? ` (đơn vị: ${dapSoCua(q)!.unit})` : ''}. Dấu phẩy hay dấu chấm thập phân đều được.`}
                    slotProps={{ htmlInput: { 'aria-label': `Đáp số câu ${idx + 1}`, inputMode: 'decimal' } }}
                    sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                )}

                {q.type === 'Tự luận' && !dapSoCua(q) && (
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
