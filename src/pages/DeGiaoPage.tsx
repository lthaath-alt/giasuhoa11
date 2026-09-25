import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, Container, Divider, Paper, Typography,
} from '@mui/material';
import {
  AlertTriangle, ArrowLeft, CalendarClock, CheckCircle, ClipboardList, Clock,
  GraduationCap, Lock, Play, User as UserIcon,
} from 'lucide-react';
import { useApp } from '../core/hooks/useApp';
import { docBaiNop } from '../features/quiz/baiNopService';
import { docDeGiao } from '../features/quiz/deGiaoService';
import { QuizStorage } from '../features/quiz/quizStorage';
import { maBaiLam, taoBaiLam, trangThaiDe } from '../features/quiz/taoDeGiao';
import { xaoPhuongAnWeb } from '../features/bank/xaoDapAn';
import type { DeGiao, Quiz } from '../features/quiz/types';

/*
 * Màn THÔNG BÁO bài kiểm tra — đích của link giáo viên gửi vào nhóm lớp
 * (`#/de/<id>`, 22/09/2026).
 *
 * Trang này CỐ Ý không hiện câu hỏi nào. Nó chỉ trả lời bốn câu: đề gì, của lớp
 * nào, bao lâu, hạn tới khi nào — rồi dựng bài làm và đẩy sang `QuizPage`. Nhờ
 * vậy toàn bộ phần làm bài, đếm giờ, chấm và nộp lên `bai_nop` vẫn là MỘT đường
 * duy nhất đã chạy từ trước, không đẻ thêm đường thứ hai để sai lệch nhau.
 */

const DongTin: React.FC<{ icon: React.ReactNode; nhan: string; gia: string }> = ({ icon, nhan, gia }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
    <Box sx={{ display: 'flex', color: 'var(--chu-mo)' }}>{icon}</Box>
    <Typography variant="body2" sx={{ color: 'var(--chu-2)', minWidth: 130 }}>{nhan}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--chu-dam)' }}>{gia}</Typography>
  </Box>
);

const hai = (n: number) => String(n).padStart(2, '0');
const gioDep = (iso: string) => {
  const d = new Date(iso);
  return `${hai(d.getDate())}/${hai(d.getMonth() + 1)}/${d.getFullYear()} lúc ${hai(d.getHours())}:${hai(d.getMinutes())}`;
};

/** Khung báo lỗi/trạng thái dùng chung, để mọi ngả rẽ trông như nhau. */
const Bao: React.FC<{
  icon: React.ReactNode; tieuDe: string; chu: string; nut?: React.ReactNode;
}> = ({ icon, tieuDe, chu, nut }) => (
  <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
    <Paper variant="outlined" sx={{ p: 5, borderRadius: 0 }}>
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>{tieuDe}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{chu}</Typography>
      {nut}
    </Paper>
  </Container>
);

export const DeGiaoPage: React.FC = () => {
  const { deGiaoId } = useParams<{ deGiaoId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [de, setDe] = useState<DeGiao | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [daNop, setDaNop] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!deGiaoId) return;
    let huy = false;
    setDangTai(true);
    void docDeGiao(deGiaoId)
      .then(d => { if (!huy) setDe(d); })
      .finally(() => { if (!huy) setDangTai(false); });
    return () => { huy = true; };
  }, [deGiaoId]);

  /* Em đã nộp đề này chưa? Hỏi máy này trước (rẻ), rồi hỏi Firestore — em làm ở
     máy khác thì localStorage của máy đang mở hoàn toàn trống. */
  useEffect(() => {
    if (!deGiaoId || !currentUser) return;
    const ma = maBaiLam(deGiaoId, currentUser.email);
    const trongMay = QuizStorage.getQuizById(ma);
    if (trongMay?.status === 'submitted') { setDaNop(trongMay); return; }
    let huy = false;
    void docBaiNop(ma).then(ban => {
      if (!huy && ban?.status === 'submitted') setDaNop(ban);
    });
    return () => { huy = true; };
  }, [deGiaoId, currentUser]);

  if (dangTai) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress color="secondary" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Đang mở đề…</Typography>
      </Container>
    );
  }

  /* Chưa đăng nhập: hỏi trước khi kết luận gì về đề. Luật Firestore không cho
     người lạ đọc `de_giao`, nên `docDeGiao` cũng trả null — báo "không tìm thấy"
     lúc này là nói sai nguyên nhân, và em sẽ đi tìm cô để xin link mới. */
  if (!currentUser) {
    return (
      <Bao
        icon={<GraduationCap size={48} color="var(--chu-dam)" />}
        tieuDe="Đăng nhập để xem bài kiểm tra"
        chu="Bài kiểm tra này do giáo viên giao cho lớp. Đăng nhập bằng tài khoản của em rồi mở lại link."
        nut={
          <Button
            variant="contained" color="primary"
            onClick={() => navigate('/login', { state: { from: `/de/${deGiaoId}` } })}
          >
            Đăng nhập ngay
          </Button>
        }
      />
    );
  }

  if (!de) {
    return (
      <Bao
        icon={<AlertTriangle size={48} color="var(--do)" />}
        tieuDe="Không tìm thấy bài kiểm tra"
        chu="Link này không còn đúng, hoặc giáo viên đã xoá đề. Hỏi lại giáo viên để nhận link mới."
        nut={<Button variant="contained" onClick={() => navigate('/dashboard')}>Về trang học tập</Button>}
      />
    );
  }

  /* Đề của lớp khác. Giáo viên và quản trị vẫn mở được để xem thử. */
  const laHocSinh = currentUser.role === 'student';
  if (laHocSinh && currentUser.classId !== de.classId) {
    return (
      <Bao
        icon={<Lock size={48} color="var(--chu-mo)" />}
        tieuDe="Đề này không dành cho lớp của em"
        chu={`Bài kiểm tra được giao cho lớp ${de.tenLop}. Nếu em học lớp đó, báo giáo viên xếp lại lớp cho em.`}
        nut={<Button variant="contained" onClick={() => navigate('/dashboard')}>Về trang học tập</Button>}
      />
    );
  }

  const trangThai = trangThaiDe(de);

  const batDauLam = () => {
    const ma = maBaiLam(de.id, currentUser.email);
    /* Đang làm dở thì mở lại ĐÚNG bài đó, không dựng đề mới: mã bài suy ra được
       nên `addQuiz` từ chối bản thứ hai, và thứ tự phương án của em giữ nguyên. */
    if (!QuizStorage.getQuizById(ma)) {
      QuizStorage.addQuiz(taoBaiLam(de, currentUser.email, { xao: xaoPhuongAnWeb }));
    }
    navigate(`/quiz/${ma}`);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 6 }, bgcolor: 'var(--nen-nhat)' }}>
      <Container maxWidth="sm">
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2, color: 'var(--chu-2)' }}
        >
          Về trang học tập
        </Button>

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 0, border: '1px solid var(--vien)' }}>
          <Chip
            icon={<ClipboardList size={14} />}
            label="BÀI KIỂM TRA GIÁO VIÊN GIAO"
            size="small"
            sx={{ mb: 2, bgcolor: 'var(--nen-luc-nhat2)', color: 'var(--luc-tham)' }}
          />
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--chu-dam)', mb: 2 }}>
            {de.tieuDe}
          </Typography>

          <Divider sx={{ mb: 1.5 }} />
          <DongTin icon={<GraduationCap size={16} />} nhan="Lớp" gia={de.tenLop} />
          <DongTin icon={<UserIcon size={16} />} nhan="Giáo viên" gia={de.teacherName} />
          <DongTin icon={<ClipboardList size={16} />} nhan="Số câu" gia={`${de.questions.length} câu trắc nghiệm`} />
          <DongTin icon={<Clock size={16} />} nhan="Thời gian làm bài" gia={`${de.soPhut} phút`} />
          <DongTin icon={<CalendarClock size={16} />} nhan="Hạn nộp" gia={gioDep(de.dongLuc)} />
          <Divider sx={{ mt: 1.5, mb: 2 }} />

          {de.loiDan && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 0 }}>{de.loiDan}</Alert>
          )}

          {daNop ? (
            <>
              <Alert severity="success" icon={<CheckCircle size={18} />} sx={{ mb: 2, borderRadius: 0 }}>
                Em đã nộp bài này rồi — được{' '}
                <strong>
                  {daNop.maxScore > 0 ? ((daNop.score / daNop.maxScore) * 10).toFixed(1) : '0'}/10
                </strong>
                . Mỗi đề chỉ nộp một lần.
              </Alert>
              <Button variant="outlined" color="secondary" onClick={() => navigate(`/quiz/${daNop.id}`)}>
                Xem lại bài làm
              </Button>
            </>
          ) : trangThai === 'chua-mo' ? (
            <Alert severity="warning" sx={{ borderRadius: 0 }}>
              Chưa tới giờ làm bài. Đề mở lúc <strong>{gioDep(de.moLuc)}</strong>.
            </Alert>
          ) : trangThai === 'da-dong' ? (
            <Alert severity="error" sx={{ borderRadius: 0 }}>
              Đề đã đóng. Hạn nộp là <strong>{gioDep(de.dongLuc)}</strong> — liên hệ giáo viên nếu em có lý do chính đáng.
            </Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }}>
                Bấm "Bắt đầu làm bài" là đồng hồ chạy. Đóng tab giữa chừng thì giờ vẫn tiếp tục trôi.
              </Alert>
              <Button
                variant="contained" color="secondary" size="large"
                startIcon={<Play size={18} />}
                onClick={batDauLam}
              >
                Bắt đầu làm bài
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default DeGiaoPage;
