import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  ClipboardCheck,
  Sparkles,
  Award,
  Calendar,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
/* Link `driveLink` do người dùng gõ vào — chỉ mở khi là https tới Google. */
import { linkGoogleHopLe } from '../../../core/services/linkGoogle';
import { TutorChat } from '../../tutor/components/TutorChat';
/* Ô chọn lớp. Import chéo sang feature `auth` — cùng lối với dòng
   `TutorChat` ngay trên. Xem chú thích ở khối "chưa tham gia lớp" bên dưới để
   biết vì sao lối vào phải nằm ở đây chứ không ở `DashboardPage`. */
import { JoinClassForm } from '../../auth/components/JoinClassForm';
import { QuizStorage } from '../../quiz/quizStorage';
import { DeCoGiaoList } from './DeCoGiaoList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const StudentArea: React.FC = () => {
  const { currentUser, exams, classes, getUserProgress, curriculum } = useApp();
  const [tabValue, setTabValue] = useState(0);
  /** Số đề giáo viên giao cho lớp, do `DeCoGiaoList` báo lên sau khi tải xong */
  const [soDeGiao, setSoDeGiao] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentUser) return null;

  // Lấy lớp học hiện tại của học sinh
  const myClass = currentUser.classId ? classes.find(c => c.id === currentUser.classId) : undefined;
  
  /* Tab 1: `exams` là KHO TÀI LIỆU đời trước (link Google Drive thầy cô đăng),
     không phải đề làm trên web. Đề giáo viên giao thật do `DeCoGiaoList` lo. */
  const teacherEmail = myClass?.teacherEmail;
  const assignedExams = teacherEmail ? exams.filter(e => e.createdBy === teacherEmail) : [];

  /* Tab "Luyện tập tự do" đã gỡ ngày 04/10/2026. Nó đọc kho bài tập đời cũ
     (`libraryQuestions`, đang rỗng) nên chỉ hiện "Chưa có câu hỏi nào trong
     ngân hàng" ngay trên một ngân hàng 1.780 câu, và các thẻ chủ đề của nó
     không gắn lệnh bấm nào. Luyện tập thật là mục "Luyện tập" trên thanh menu. */

  // Tab 3: Học bạ thông minh
  const progress = getUserProgress(currentUser.email);
  const allLessonsCount = curriculum.flatMap(c => c.lessons).length;
  /* Chỉ đếm bài CÓ THẬT: nút "Đánh dấu Xong" của khung chat chung ghi cả mã
     'student-free-chat' vào completedLessons. */
  const maBaiThat = new Set(curriculum.flatMap(c => c.lessons).map(l => l.id));
  const completedCount = (progress?.completedLessons || []).filter(id => maBaiThat.has(id)).length;
  const progressPercent = allLessonsCount > 0 ? Math.round((completedCount / allLessonsCount) * 100) : 0;

  /* Lịch sử làm bài THẬT (18/09/2026). Trước đây là hai dòng điểm gõ cứng
     (9.5 và 7.0) mà học sinh nào cũng thấy, kể cả em chưa làm bài nào —
     không được để lọt vào ảnh minh chứng của báo cáo NCKH. Đọc QuizStorage
     của chính máy em: `list` trên `bai_nop` chỉ giáo viên được phép. */
  const tenBai = new Map<string, string>([
    ...curriculum.map(c => [c.id, `Kiểm tra tổng hợp: ${c.title}`] as [string, string]),   // đề cả chương mang mã chương
    ...curriculum.flatMap(c => c.lessons).map(l => [l.id, l.title] as [string, string]),
  ]);
  const baiDaNop = QuizStorage.getQuizzes()
    .filter(q => q.status === 'submitted' && (q.userEmail || '').toLowerCase() === currentUser.email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const diem10 = (q: { score: number; maxScore: number }) =>
    q.maxScore > 0 ? Math.round((q.score / q.maxScore) * 100) / 10 : 0;
  const xepLoai = (d: number) =>
    d >= 8 ? { nhan: 'Giỏi', mau: 'success' as const }
    : d >= 6.5 ? { nhan: 'Khá', mau: 'warning' as const }
    : d >= 5 ? { nhan: 'Trung bình', mau: 'default' as const }
    : { nhan: 'Chưa đạt', mau: 'error' as const };

  return (
    <Box>
      <Paper sx={{ mb: 4, px: 3, py: 2, borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'var(--nen-dam)', color: 'var(--chu-nguoc)' }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.2)' }}>
          {currentUser.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Xin chào, {currentUser.name}!</Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {myClass ? `Lớp: ${myClass.name}` : 'Học sinh tự do (Chưa vào lớp)'}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', borderRadius: 0, overflow: 'hidden', border: '1px solid var(--vien)', boxShadow: 'none' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'var(--nen-trang)' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold', fontSize: '0.9rem', minHeight: 60 },
              '& .Mui-selected': { color: 'var(--xanh)' },
              '& .MuiTabs-indicator': { backgroundColor: 'var(--vang-nen)', height: 3 }
            }}
          >
            <Tab icon={<ClipboardCheck size={18} />} iconPosition="start" label="Bài tập GV giao" />
            <Tab icon={<Sparkles size={18} />} iconPosition="start" label="Chemai" />
            <Tab icon={<Award size={18} />} iconPosition="start" label="Học bạ thông minh" />
          </Tabs>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 } }}>
          {/* TAB 1: Bài tập GV giao */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              Bài tập bắt buộc được giao từ Thầy/Cô
            </Typography>

            {/* Đề kiểm tra THẬT do giáo viên giao (22/09/2026). Khối `exams`
                bên dưới là kho tài liệu Drive đời trước, không phải đề chấm
                điểm được — hai thứ khác nhau nên để cạnh nhau, không gộp. */}
            {myClass && <DeCoGiaoList classId={myClass.id} email={currentUser.email} onSoDe={setSoDeGiao} />}

            {!myClass ? (
              /* Chưa vào lớp: đặt THẲNG ô chọn lớp vào đây.
               *
               * Trước 12/09/2026 chỗ này chỉ có một dòng chữ bảo học sinh "hãy
               * vào mục Các khóa học và nhập Mã mời". Hai điều làm dòng đó vô
               * nghĩa, và cả hai đều đo được:
               *
               *   1. Mục "Các khóa học" ĐÃ BỊ ẨN khỏi thanh menu từ commit
               *      9fe13b7, bằng cờ `HIEN_MUC_KHOA_HOC = false` ở đầu
               *      `DashboardHeader.tsx`. Dòng chữ chỉ tới một nơi không còn
               *      tồn tại.
               *   2. `JoinClassForm` trong `DashboardPage` chỉ dựng khi
               *      `activeTab === 'hocmai'`, mà nút duy nhất đặt tab đó nằm
               *      TRONG khối bị cờ ẩn. Đường còn lại duy nhất là gõ tìm một
               *      bài giảng rồi chọn từ gợi ý — lúc đó bài giảng mở ra luôn,
               *      không ai tìm khung nhập mã theo cách đó.
               *
               * Nên cả tính năng "xin vào lớp" không có lối vào nào. Đây là chỗ
               * học sinh THẬT SỰ đi tìm lớp, nên lối vào thuộc về đây.
               *
               * Dòng chữ giữ lại ở trên khung, để nếu học sinh bấm X đóng khung
               * thì vẫn còn lời giải thích vì sao chưa có bài tập nào. */
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bạn chưa tham gia lớp học nào, nên chưa có bài tập nào được giao.
                </Typography>
                <JoinClassForm />
              </Box>
            ) : assignedExams.length === 0 ? (
              /* Lớp đang có đề cô giao thì dòng "chưa có bài tập" là nói sai:
                 trước đây nó hiện ngay DƯỚI danh sách đề vừa giao. */
              soDeGiao > 0 ? null :
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--nen-trang)', borderRadius: 0, border: '1px dashed var(--vien)' }}>
                <Typography variant="body1" color="text.secondary">
                  Hiện chưa có bài tập nào được giao.
                </Typography>
              </Paper>
            ) : (
              /* Tài liệu thầy cô chia sẻ. Trước 04/10/2026 khối này vẽ chúng như
                 đề kiểm tra bằng số liệu BỊA: "Quá hạn nộp" xen kẽ theo số thứ tự
                 thẻ, "Hạn nộp" = ngày đăng + 7, "Lượt làm bài tối đa: 3 lần", và
                 một nút "Vào làm bài" không gắn lệnh nào. Nay chỉ hiện điều có
                 thật: chủ đề, tên, mô tả, ngày đăng và đường dẫn đã kiểm. */
              <Box sx={{ mt: soDeGiao > 0 ? 4 : 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Tài liệu thầy cô chia sẻ
                </Typography>
                <Grid container spacing={3}>
                  {assignedExams.map((exam) => {
                    const link = linkGoogleHopLe(exam.driveLink);
                    return (
                      <Grid size={{ xs: 12, md: 6 }} key={exam.id}>
                        <Card sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none', height: '100%' }}>
                          <CardContent>
                            <Chip size="small" label={exam.topic || 'Hóa học 11'} sx={{ mb: 2, bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)', fontWeight: 'bold', fontSize: '0.7rem' }} />

                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                              {exam.title}
                            </Typography>
                            {exam.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {exam.description}
                              </Typography>
                            )}

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                              <Calendar size={14} color="var(--chu-2)" />
                              <Typography variant="caption" color="text.secondary">
                                Ngày đăng: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {link ? (
                              <Button
                                variant="outlined"
                                size="small"
                                endIcon={<ExternalLink size={14} />}
                                onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                                sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
                              >
                                Mở tài liệu
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Tài liệu này chưa có đường dẫn.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}
          </TabPanel>

          {/* TAB 2: Chemai */}
          <TabPanel value={tabValue} index={1}>
            {/* KHÔNG bọc trong khung cao cố định. Khung 70vh + `overflow: hidden`
                cũ thấp hơn chính `TutorChat` (cao calc(100vh − 180px)) ở mọi màn
                hình cao trên 600 px, nên nó cắt mất một dải: đo 02/10/2026 ở
                1280×800 là 60 px, đúng phần tiêu đề khung chat. */}
            <Box>
              <TutorChat
                lesson={{
                  id: 'student-free-chat',
                  title: 'Chemai',
                  summary: 'Trợ lý học tập riêng cho từng em',
                  formulae: [],
                  commonQuestions: []
                }} 
              />
            </Box>
          </TabPanel>

          {/* TAB 3: Học bạ thông minh */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Kết quả học tập cá nhân
            </Typography>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 0, border: '1px solid var(--vien)', bgcolor: 'var(--nen-trang)', textAlign: 'center' }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: 'var(--xanh-nen)', margin: '0 auto', mb: 2, fontSize: '2rem' }}>
                    <Award size={40} />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums' }}>{completedCount}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Bài học đã hoàn thành</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', minWidth: 40 }}>{progressPercent}%</Typography>
                    <LinearProgress variant="determinate" value={progressPercent} sx={{ flexGrow: 1, height: 8, borderRadius: 0, bgcolor: 'var(--vien)', '& .MuiLinearProgress-bar': { bgcolor: 'var(--xanh-nen)' } }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">Tiến độ chương trình Hóa 11</Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle size={18} color="var(--luc)" /> Lịch sử làm bài
                </Typography>
                <Paper sx={{ borderRadius: 0, border: '1px solid var(--vien)', overflow: 'hidden' }}>
                  {baiDaNop.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                      Em chưa nộp bài kiểm tra nào trên máy này.
                    </Typography>
                  ) : (
                  <List disablePadding>
                    {baiDaNop.map((q, i) => {
                      const d = diem10(q);
                      const loai = xepLoai(d);
                      const dat = d >= 6.5;
                      return (
                        <ListItem key={q.id} divider={i < baiDaNop.length - 1} sx={{ py: 2 }}>
                          <ListItemIcon>
                            <Avatar sx={{
                              bgcolor: dat ? 'var(--nen-luc-nhat)' : 'var(--nen-vang-nhat)',
                              color: dat ? 'var(--luc-dam2)' : 'var(--vang-dam)',
                              width: 40, height: 40,
                            }}>
                              <Typography variant="caption" sx={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{d.toFixed(1)}</Typography>
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{q.tenDe || tenBai.get(q.lessonId) || 'Bài kiểm tra'}</Typography>}
                            secondary={`Làm lúc: ${new Date(q.createdAt).toLocaleString('vi-VN')} · ${q.score}/${q.maxScore} điểm`}
                          />
                          <Chip size="small" label={loai.nhan} color={loai.mau} />
                        </ListItem>
                      );
                    })}
                  </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
