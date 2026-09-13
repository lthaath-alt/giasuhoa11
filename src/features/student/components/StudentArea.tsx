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
  BookOpen,
  Sparkles,
  Award,
  Clock,
  Calendar,
  CheckCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { TutorChat } from '../../tutor/components/TutorChat';
/* Ô chọn lớp. Import chéo sang feature `auth` — cùng lối với dòng
   `TutorChat` ngay trên. Xem chú thích ở khối "chưa tham gia lớp" bên dưới để
   biết vì sao lối vào phải nằm ở đây chứ không ở `DashboardPage`. */
import { JoinClassForm } from '../../auth/components/JoinClassForm';
import { QuizStorage } from '../../quiz/quizStorage';

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
  const { currentUser, exams, classes, libraryQuestions, getUserProgress, curriculum } = useApp();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!currentUser) return null;

  // Lấy lớp học hiện tại của học sinh
  const myClass = currentUser.classId ? classes.find(c => c.id === currentUser.classId) : undefined;
  
  // Tab 1: Bài tập GV giao
  // Lọc exam do GVCN tải lên
  const teacherEmail = myClass?.teacherEmail;
  const assignedExams = teacherEmail ? exams.filter(e => e.createdBy === teacherEmail) : [];

  // Fake history submissions
  const getSubmissions = (examId: string) => {
    // Để demo, giả sử quizId = examId
    return QuizStorage.getUserQuizHistory(currentUser.email, examId);
  };

  // Tab 2: Luyện tập tự do
  const topics = Array.from(new Set(libraryQuestions.map(q => q.topic).filter(Boolean) as string[]));

  // Tab 4: Học bạ thông minh
  const progress = getUserProgress(currentUser.email);
  const allLessonsCount = curriculum.flatMap(c => c.lessons).length;
  const completedCount = progress?.completedLessons.length || 0;
  const progressPercent = allLessonsCount > 0 ? Math.round((completedCount / allLessonsCount) * 100) : 0;

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
            <Tab icon={<BookOpen size={18} />} iconPosition="start" label="Luyện tập tự do" />
            <Tab icon={<Sparkles size={18} />} iconPosition="start" label="Gia sư Hóa học AI" />
            <Tab icon={<Award size={18} />} iconPosition="start" label="Học bạ thông minh" />
          </Tabs>
        </Box>

        <Box sx={{ px: { xs: 2, md: 4 } }}>
          {/* TAB 1: Bài tập GV giao */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              Bài tập bắt buộc được giao từ Thầy/Cô
            </Typography>

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
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--nen-trang)', borderRadius: 0, border: '1px dashed var(--vien)' }}>
                <Typography variant="body1" color="text.secondary">
                  Hiện chưa có bài tập nào được giao.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {assignedExams.map((exam, idx) => {
                  // Fake data
                  const isOverdue = idx % 2 !== 0; // Giả lập đan xen quá hạn
                  const maxAttempts = 3;
                  const submissions = getSubmissions(exam.id).length;
                  const submitted = submissions > 0;
                  
                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={exam.id}>
                      <Card sx={{ borderRadius: 0, border: '1px solid var(--vien)', boxShadow: 'none', '&:hover': { boxShadow: 'none', borderColor: 'var(--vien)' } }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Chip size="small" label={exam.topic || 'Hóa học 11'} sx={{ bgcolor: 'var(--nen-xanh-nhat2)', color: 'var(--xanh)', fontWeight: 'bold', fontSize: '0.7rem' }} />
                            <Chip 
                              size="small" 
                              label={submitted ? 'Đã nộp' : (isOverdue ? 'Quá hạn nộp' : 'Chưa nộp')} 
                              sx={{ 
                                fontWeight: 'bold', fontSize: '0.7rem',
                                bgcolor: submitted ? 'var(--nen-luc-nhat)' : (isOverdue ? 'var(--nen-do-nhat)' : 'var(--nen-nhat)'),
                                color: submitted ? 'var(--luc-dam2)' : (isOverdue ? 'var(--do-dam)' : 'var(--chu)')
                              }} 
                            />
                          </Box>
                          
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, minHeight: 48 }}>
                            {exam.title}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Calendar size={14} color="var(--chu-2)" />
                              <Typography variant="caption" color="text.secondary">
                                Ngày giao: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Clock size={14} color={isOverdue ? "var(--do)" : "var(--chu-2)"} />
                              <Typography variant="caption" sx={{ color: isOverdue ? 'var(--do)' : 'text.secondary', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                Hạn nộp: {new Date(new Date(exam.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN')}
                              </Typography>
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 2 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                Lượt làm bài tối đa: {maxAttempts} lần
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                Đã nộp: {submissions} lần
                              </Typography>
                            </Box>
                            
                            <Button 
                              variant={submitted ? "outlined" : "contained"} 
                              color="primary" 
                              size="small"
                              disabled={isOverdue || submissions >= maxAttempts}
                              endIcon={isOverdue || submissions >= maxAttempts ? <Lock size={14} /> : <ArrowRight size={14} />}
                              sx={{ textTransform: 'none', borderRadius: 0, fontWeight: 'bold' }}
                            >
                              {submitted ? 'Làm lại' : 'Vào làm bài'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>

          {/* TAB 2: Luyện tập tự do */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Ngân hàng câu hỏi theo chủ đề
              </Typography>
              <Chip icon={<Award size={14} />} label="Không giới hạn" color="warning" size="small" sx={{ fontWeight: 'bold' }} />
            </Box>

            {topics.length === 0 ? (
              <Typography color="text.secondary">Chưa có câu hỏi nào trong ngân hàng.</Typography>
            ) : (
              <Grid container spacing={2}>
                {topics.map((topic, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                    <Card sx={{ borderRadius: 0, border: '1px solid var(--vien)', cursor: 'pointer', '&:hover': { borderColor: 'var(--xanh)', bgcolor: 'var(--nen-xanh-nhat2)' } }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam)' }}>{topic}</Typography>
                        <ArrowRight size={16} color="var(--chu-mo)" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* TAB 3: Gia sư Hóa học AI */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: '70vh', borderRadius: 0, overflow: 'hidden', border: '1px solid var(--vien)' }}>
              <TutorChat 
                lesson={{
                  id: 'student-free-chat',
                  title: 'Gia sư Hóa học AI',
                  summary: 'Trợ lý học tập riêng cho từng em',
                  formulae: [],
                  commonQuestions: []
                }} 
              />
            </Box>
          </TabPanel>

          {/* TAB 4: Học bạ thông minh */}
          <TabPanel value={tabValue} index={3}>
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
                  <List disablePadding>
                    {/* Fake data for demo */}
                    <ListItem divider sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'var(--nen-luc-nhat)', color: 'var(--luc-dam2)', width: 40, height: 40 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>9.5</Typography>
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Đề kiểm tra 15 phút - Chương 1</Typography>}
                        secondary="Nộp lúc: Hôm nay, 08:30"
                      />
                      <Chip size="small" label="Giỏi" color="success" />
                    </ListItem>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: 'var(--nen-vang-nhat)', color: 'var(--vang-dam)', width: 40, height: 40 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>7.0</Typography>
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText 
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Bài tập về nhà - Cân bằng hóa học</Typography>}
                        secondary="Nộp lúc: Hôm qua, 19:45"
                      />
                      <Chip size="small" label="Khá" color="warning" />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
