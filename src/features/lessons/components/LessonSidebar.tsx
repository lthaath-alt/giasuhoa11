import React, { useState } from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from '@mui/material';
import { BookOpen, ChevronLeft, Trash2, Lock } from 'lucide-react';
import { Lesson } from '../types';
import { User, LearningProgress } from '../../auth/types';
import { useApp } from '../../../core/hooks/useApp';

interface LessonSidebarProps {
  selectedLesson: Lesson | null;
  setSelectedLesson: (lesson: Lesson | null) => void;
  currentUser: User | null;
  getUserProgress: (email: string) => LearningProgress | null;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({
  selectedLesson,
  setSelectedLesson,
  currentUser,
  getUserProgress,
}) => {
  const { curriculum, deleteChapter, deleteLesson, getLessonProgress } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback nếu curriculum chưa được tải hoặc rỗng
  const displayCurriculum = curriculum && curriculum.length > 0 ? curriculum : [];
  
  // Dàn phẳng danh sách bài học để kiểm tra thứ tự
  const allLessons = displayCurriculum.flatMap(c => c.lessons);

  if (isCollapsed) {
    return (
      <Tooltip title="Mở danh mục bài học" placement="right">
        <Paper
          id="sidebar-lessons-collapsed"
          onClick={() => setIsCollapsed(false)}
          sx={{
            p: 1.5,
            borderRadius: 0,
            border: '1px solid var(--vien)',
            backgroundColor: 'var(--nen-the)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'var(--nen-trang)',
              borderColor: 'var(--cam)',
              color: 'var(--chu-dam)',
            },
            position: 'sticky',
            top: 20,
            transition: 'all 0.2s',
          }}
        >
          <BookOpen size={24} />
        </Paper>
      </Tooltip>
    );
  }

  return (
    <Paper
      id="sidebar-lessons"
      sx={{
        p: 2,
        borderRadius: 0,
        border: '1px solid var(--vien)',
        backgroundColor: 'var(--nen-the)',
        position: 'sticky',
        top: 20,
        boxShadow: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--chu-dam)', fontWeight: 'bold' }}
        >
          <BookOpen size={18} /> Danh mục bài học
        </Typography>
        <IconButton
          id="collapse-sidebar-btn"
          size="small"
          onClick={() => setIsCollapsed(true)}
          sx={{ color: 'var(--chu-2)', '&:hover': { color: 'var(--chu-dam)' } }}
          title="Thu gọn danh mục"
        >
          <ChevronLeft size={18} />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {displayCurriculum.length === 0 ? (
        <Box sx={{ py: 3, textStyle: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Chưa có bài học nào trong chương trình.
          </Typography>
        </Box>
      ) : (
        /* Render các chương bài học */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {displayCurriculum.map((chapter) => (
            <Box key={chapter.id} id={`chapter-group-${chapter.id}`}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pr: 0.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    display: 'block',
                    px: 1,
                    fontWeight: 'bold',
                  }}
                >
                  {chapter.title}
                </Typography>
                {(currentUser?.role === 'admin' || currentUser?.role === 'school_admin') && (
                  <IconButton
                    size="small"
                    color="error"
                    title="Xóa chương này"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục chương: "${chapter.title}" không? Tất cả bài học bên trong sẽ bị xóa khỏi hệ thống.`)) {
                        deleteChapter(chapter.id);
                        if (selectedLesson && chapter.lessons.some(l => l.id === selectedLesson.id)) {
                          setSelectedLesson(null);
                        }
                      }
                    }}
                    sx={{ p: 0.5, color: 'var(--do)', '&:hover': { backgroundColor: 'var(--nen-do-nhat)' } }}
                  >
                    <Trash2 size={13} />
                  </IconButton>
                )}
              </Box>

              <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {chapter.lessons.map((les) => {
                  const isSelected = selectedLesson?.id === les.id;
                  const lessonIndex = allLessons.findIndex(l => l.id === les.id);
                  
                  let isLocked = false;
                  if (currentUser && currentUser.role === 'student') {
                    if (lessonIndex > 0) {
                      const prevLesson = allLessons[lessonIndex - 1];
                      const prevProgress = getLessonProgress(prevLesson.id);
                      if (!prevProgress || !prevProgress.basicCompleted || (!prevProgress.advancedCompleted && !prevProgress.skippedAdvanced)) {
                        isLocked = true;
                      }
                    }
                  }

                  const progress = getLessonProgress(les.id);
                  const isBasicDone = progress?.basicCompleted;
                  const isAdvUnlocked = progress?.advancedUnlocked;
                  const isAdvDone = progress?.advancedCompleted;

                  return (
                    <Tooltip key={les.id} title={isLocked ? `Hoàn thành bài trước đó để mở khóa` : ''} placement="right">
                      <ListItem
                        id={`lesson-item-${les.id}`}
                        onClick={() => !isLocked && setSelectedLesson(les)}
                        sx={{
                          borderRadius: 0,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          opacity: isLocked ? 0.6 : 1,
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--cam-vien)' : 'transparent',
                        backgroundColor: isSelected ? 'var(--nen-cam-nhat2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'var(--nen-cam-nhat2)'
                            : 'var(--nen-luc-nhat2)',
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography
                              variant="body2"
                              color={isSelected ? 'primary.main' : 'text.primary'}
                              sx={{ fontSize: '0.85rem', fontWeight: isSelected ? 'bold' : 500 }}
                            >
                              {les.title.includes(':') 
                                ? les.title.substring(les.title.indexOf(':') + 1).trim()
                                : les.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {isLocked ? (
                                <Box sx={{ p: 0.5, bgcolor: 'var(--nen-nhat)', borderRadius: 0, display: 'flex' }}>
                                  <Lock size={14} color="var(--chu-2)" />
                                </Box>
                              ) : (
                                <>
                                  {isBasicDone && (
                                    <Chip
                                      label="CB"
                                      size="small"
                                      color="success"
                                      variant="filled"
                                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', minWidth: 'auto', px: 0.5 }}
                                    />
                                  )}
                                  {isAdvDone && (
                                    <Chip
                                      label="NC"
                                      size="small"
                                      color="secondary"
                                      variant="filled"
                                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', minWidth: 'auto', px: 0.5 }}
                                    />
                                  )}
                                  {isAdvUnlocked && !isAdvDone && (
                                    <Chip
                                      label="NC 🔓"
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                      sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', minWidth: 'auto', px: 0.5 }}
                                    />
                                  )}
                                </>
                              )}
                              {(currentUser?.role === 'admin' || currentUser?.role === 'school_admin') && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  title="Xóa bài học này"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Bạn có chắc chắn muốn xóa bài học: "${les.title}" không?`)) {
                                      deleteLesson(chapter.id, les.id);
                                      if (selectedLesson?.id === les.id) {
                                        setSelectedLesson(null);
                                      }
                                    }
                                  }}
                                  sx={{ p: 0.2, color: 'var(--do)', '&:hover': { backgroundColor: 'var(--nen-do-nhat)' } }}
                                >
                                  <Trash2 size={12} />
                                </IconButton>
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', display: 'block', mt: 0.5 }}>
                            {les.title.includes(':') ? les.title.split(':')[0] : 'Bài học'}
                          </Typography>
                        }
                        />
                    </ListItem>
                    </Tooltip>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

