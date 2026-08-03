import React, { useState } from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from '@mui/material';
import { BookOpen, ChevronLeft, Trash2 } from 'lucide-react';
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
  const { curriculum, deleteChapter, deleteLesson } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fallback nếu curriculum chưa được tải hoặc rỗng
  const displayCurriculum = curriculum && curriculum.length > 0 ? curriculum : [];

  if (isCollapsed) {
    return (
      <Tooltip title="Mở danh mục bài học" placement="right">
        <Paper
          id="sidebar-lessons-collapsed"
          onClick={() => setIsCollapsed(false)}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            '&:hover': {
              backgroundColor: '#f8fafc',
              borderColor: '#ea580c',
              color: '#ea580c',
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
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, pb: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ea580c', fontWeight: 'bold' }}
        >
          <BookOpen size={18} /> Danh mục bài học
        </Typography>
        <IconButton
          id="collapse-sidebar-btn"
          size="small"
          onClick={() => setIsCollapsed(true)}
          sx={{ color: '#64748b', '&:hover': { color: '#ea580c' } }}
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
                {(currentUser?.role === 'super_admin' || currentUser?.role === 'school_admin') && (
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
                    sx={{ p: 0.5, color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}
                  >
                    <Trash2 size={13} />
                  </IconButton>
                )}
              </Box>

              <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {chapter.lessons.map((les) => {
                  const isSelected = selectedLesson?.id === les.id;
                  const isDone = currentUser
                    ? getUserProgress(currentUser.email)?.completedLessons.includes(les.id)
                    : false;

                  return (
                    <ListItem
                      key={les.id}
                      id={`lesson-item-${les.id}`}
                      onClick={() => setSelectedLesson(les)}
                      sx={{
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: isSelected ? 'rgba(234, 88, 12, 0.25)' : 'transparent',
                        backgroundColor: isSelected ? 'rgba(234, 88, 12, 0.08)' : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'rgba(234, 88, 12, 0.12)'
                            : 'rgba(15, 118, 110, 0.04)',
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
                              {isDone && (
                                <Chip
                                  label="Xong"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', minWidth: 'auto', px: 0.5 }}
                                />
                              )}
                              {(currentUser?.role === 'super_admin' || currentUser?.role === 'school_admin') && (
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
                                  sx={{ p: 0.2, color: '#ef4444', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.08)' } }}
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

