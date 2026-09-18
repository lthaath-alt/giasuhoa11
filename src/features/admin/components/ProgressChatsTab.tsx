import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  List,
  ListItem,
  Avatar,
  ListItemText,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Users, MessageSquare } from 'lucide-react';
import { User, ChatMessage, LearningProgress } from '../../auth/types';
import { CHEMISTRY_11_CURRICULUM } from '../../lessons/constants';
import { MathMarkdownRenderer } from '../../../core/components/MathMarkdownRenderer';

interface ProgressChatsTabProps {
  students: User[];
  chats: ChatMessage[];
  getUserProgress: (email: string) => LearningProgress | null;
  /** Báo cho bên ngoài biết em nào vừa được chọn, để nạp chat của em đó. */
  onSelectStudent?: (email: string) => void;
}

export const ProgressChatsTab: React.FC<ProgressChatsTabProps> = ({
  students,
  chats,
  getUserProgress,
  onSelectStudent,
}) => {
  const [selectedStudentEmail, setSelectedStudentEmail] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const allLessons = CHEMISTRY_11_CURRICULUM.flatMap((c) => c.lessons);

  const handleSelectStudent = (email: string) => {
    setSelectedStudentEmail(email);
    onSelectStudent?.(email);
    if (!selectedLessonId && allLessons.length > 0) {
      setSelectedLessonId(allLessons[0].id);
    }
  };

  /* Số tin của em đang chọn ở từng bài, để ô chọn bài chỉ ra bài nào có hội
     thoại. Chat nạp xong mà bài đang chọn trống thì nhảy sang bài đầu có tin. */
  const soTinTheoBai = new Map<string, number>();
  chats.filter((c) => c.userEmail === selectedStudentEmail)
    .forEach((c) => soTinTheoBai.set(c.lessonId, (soTinTheoBai.get(c.lessonId) || 0) + 1));
  const baiDauCoTin = allLessons.find((l) => soTinTheoBai.has(l.id))?.id;
  useEffect(() => {
    if (baiDauCoTin && !soTinTheoBai.has(selectedLessonId)) setSelectedLessonId(baiDauCoTin);
  }, [selectedStudentEmail, baiDauCoTin]);

  const selectedStudent = students.find((s) => s.email === selectedStudentEmail);
  const selectedStudentProgress = selectedStudent ? getUserProgress(selectedStudent.email) : null;
  // Chỉ đếm bài có thật — khung chat chung ghi cả mã 'student-free-chat'
  const completedCount = selectedStudentProgress
    ? selectedStudentProgress.completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length
    : 0;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const studentChatsOnLesson = chats.filter(
    (c) => c.userEmail === selectedStudentEmail && c.lessonId === selectedLessonId
  );

  return (
    <Box
      id="admin-tab-chats"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
        gap: 3,
      }}
    >
      {/* CỘT TRÁI: CHỌN HỌC SINH */}
      <Box>
        <Card sx={{ borderRadius: 0, height: '100%', boxShadow: 'none', border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
              <Users size={18} /> Danh sách học sinh
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {students.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                Chưa có học sinh nào.
              </Typography>
            ) : (
              <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {students.map((stud) => {
                  const studProg = getUserProgress(stud.email);
                  const completed = studProg ? studProg.completedLessons.filter((id) => allLessons.some((l) => l.id === id)).length : 0;
                  const active = selectedStudentEmail === stud.email;

                  return (
                    <ListItem
                      key={stud.email}
                      onClick={() => handleSelectStudent(stud.email)}
                      sx={{
                        borderRadius: 0,
                        border: '1px solid',
                        borderColor: active ? 'var(--tin-hieu)' : 'var(--vien)',
                        backgroundColor: active ? 'var(--nen-tin-hieu-nhat2)' : 'var(--nen-the)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: 'var(--tin-hieu)',
                          backgroundColor: 'var(--nen-tin-hieu-nhat2)',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: active ? 'var(--tin-hieu-nen)' : 'var(--nen-tin-hieu-nhat2)',
                          color: active ? 'var(--chu-nguoc)' : 'var(--tin-hieu)',
                          mr: 2,
                          width: 32,
                          height: 32,
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {stud.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: active ? 'bold' : 'normal', fontSize: '0.9rem' }}>
                            {stud.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ fontSize: '0.75rem', display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            {stud.email} • Đã học: <strong>{completed}/{allLessons.length} bài</strong>
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* CỘT PHẢI: CHI TIẾT TIẾN ĐỘ & NHẬT KÝ CHAT */}
      <Box>
        {!selectedStudentEmail ? (
          <Paper
            sx={{
              p: 5,
              textAlign: 'center',
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 1,
              border: '1px dashed var(--vien)',
              backgroundColor: 'var(--nen-the)',
              boxShadow: 'none',
            }}
          >
            <MessageSquare size={48} color="var(--chu-2)" />
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Chưa chọn học sinh
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng chọn một học sinh ở danh sách bên trái để theo dõi tiến trình tự học và xem nhật ký trao đổi với Gia sư AI.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* 1. Phần Trực quan hóa Tiến độ */}
            <Card sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Tiến độ tự học: {selectedStudent?.name}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tỷ lệ hoàn thành bài học sách giáo khoa:
                    </Typography>
                    <Typography variant="body2" color="var(--luc-tham)" sx={{ fontWeight: 'bold' }}>
                      {progressPercent}% ({completedCount}/{allLessons.length} bài học)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    color="primary"
                    sx={{ height: 8, borderRadius: 0, backgroundColor: 'var(--vien)' }}
                  />
                </Box>

                {/* Danh sách các bài đã xong và chưa xong */}
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Chi tiết bài học:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allLessons.map((les) => {
                    const isDone = selectedStudentProgress?.completedLessons.includes(les.id);
                    return (
                      <Chip
                        key={les.id}
                        label={les.title.split(':')[0] || les.title}
                        color={isDone ? 'success' : 'default'}
                        variant={isDone ? 'filled' : 'outlined'}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    );
                  })}
                </Box>
              </CardContent>
            </Card>

            {/* 2. Phần Lịch sử cuộc trò chuyện */}
            <Card sx={{ borderRadius: 0, boxShadow: 'none', border: '1px solid var(--vien)', backgroundColor: 'var(--nen-the)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 2.5,
                  }}
                >
                  <Typography variant="h6" sx={{ mr: 'auto', fontWeight: 'bold' }}>
                    Nhật ký thảo luận Gia sư AI
                  </Typography>

                  {/* Chọn Bài học để lọc chat */}
                  <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel id="lesson-select-label">Bài học</InputLabel>
                    <Select
                      labelId="lesson-select-label"
                      id="lesson-select"
                      value={selectedLessonId}
                      label="Bài học"
                      onChange={(e) => setSelectedLessonId(e.target.value as string)}
                    >
                      {allLessons.map((l) => (
                        <MenuItem key={l.id} value={l.id}>
                          {l.title}{soTinTheoBai.has(l.id) ? ` (${soTinTheoBai.get(l.id)} tin)` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Danh sách tin nhắn */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: 350,
                    overflowY: 'auto',
                    p: 1.5,
                    backgroundColor: 'var(--nen-trang)',
                    borderRadius: 0,
                  }}
                >
                  {studentChatsOnLesson.length === 0 ? (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Học sinh chưa có hội thoại nào với Gia sư AI ở bài học này.
                      </Typography>
                    </Box>
                  ) : (
                    studentChatsOnLesson.map((msg) => {
                      const isAi = msg.sender === 'ai';
                      return (
                        <Box
                          key={msg.id}
                          sx={{ alignSelf: isAi ? 'flex-start' : 'flex-end', maxWidth: '85%', textAlign: 'left' }}
                        >
                          <Paper
                            sx={{
                              p: 1.5,
                              bgcolor: isAi ? 'var(--nen-the)' : 'var(--nen-luc-nhat2)',
                              color: 'text.primary',
                              borderRadius: 0,
                              border: isAi ? '1px solid var(--vien)' : '1px solid var(--nen-luc-nhat2)',
                              boxShadow: 'none',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ display: 'block', mb: 0.5, fontWeight: 'bold', color: isAi ? 'var(--luc-tham)' : 'var(--tin-hieu)' }}
                            >
                              {isAi ? 'Gia sư AI' : selectedStudent?.name}
                            </Typography>
                            <Typography component="div" variant="body2" sx={{ fontSize: '0.85rem' }}>
                              <MathMarkdownRenderer text={msg.content} />
                            </Typography>
                          </Paper>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5, textAlign: isAi ? 'left' : 'right', px: 1 }}
                          >
                            {new Date(msg.timestamp).toLocaleString()}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};
