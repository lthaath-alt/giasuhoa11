import React, { useState } from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from '@mui/material';
import { BookOpen, ChevronLeft, Trash2, Lock } from 'lucide-react';
import { Lesson } from '../types';
import { User, LearningProgress } from '../../auth/types';
import { useApp } from '../../../core/hooks/useApp';
import { xetKhoaBai, DIEM_MO_BAI_SAU } from '../khoaBai';

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
  /* Ở điện thoại danh mục xếp TRÊN nội dung bài (lưới một cột) và cao hơn 2.500
     px, nên mở sẵn là em phải cuộn qua cả 25 bài mới tới bài vừa chọn. Mặc định
     thu gọn ở bề ngang đó; từ `md` (900 px) trở lên nó là cột bên, mở sẵn. */
  const [isCollapsed, setIsCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 899.95px)').matches,
  );

  // Fallback nếu curriculum chưa được tải hoặc rỗng
  const displayCurriculum = curriculum && curriculum.length > 0 ? curriculum : [];

  // Dàn phẳng danh sách bài học để xét bài liền trước
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
              borderColor: 'var(--tin-hieu)',
              color: 'var(--chu-dam)',
            },
            position: { xs: 'static', md: 'sticky' },
            top: 20,
            transition: 'all 0.2s',
            gap: 1,
          }}
        >
          <BookOpen size={24} />
          {/* Ở điện thoại ô này trải hết bề ngang; một biểu tượng trơ trọi thì
              không ai biết bấm vào để làm gì. */}
          <Typography variant="body2" sx={{ display: { xs: 'inline', md: 'none' }, fontWeight: 'bold' }}>
            Danh mục bài học
          </Typography>
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
        /* `sticky` CHỈ khi là cột bên. Ở lưới một cột (điện thoại) danh mục cao
           2.516 px dính vào mép trên rồi trượt ĐÈ lên nội dung bài nằm ngay dưới
           nó — đo 02/10/2026 ở 375 px: chữ bài học và danh mục chồng lên nhau,
           chỉ còn mấy cái nút lọt ra. */
        position: { xs: 'static', md: 'sticky' },
        top: 20,
        width: { md: 260 },
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
        <Box sx={{ py: 3, textAlign: 'center' }}>
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

                  /* Khoá bài tuần tự (04/10/2026): bài sau chỉ mở khi bài liền
                     trước đã đạt từ 7/10 đề kiểm tra. Luật nằm ở `khoaBai.ts`,
                     dùng chung với QuizPage, ô tìm kiếm và chỗ Chemai phát đề.
                     Chỉ học sinh bị khoá; khách và thầy cô xem tự do. */
                  const xetKhoa = xetKhoaBai(allLessons, les.id, getLessonProgress, currentUser?.role);
                  const isLocked = xetKhoa.khoa;
                  /* Gọi tên BÀI CHẶN ("Bài 8"), không ghi chung chung "bài trước":
                     bài ôn tập không chặn, nên bài chặn của Bài 10 là Bài 8. */
                  const tenBaiChan = xetKhoa.baiTruoc?.title.split(':')[0] ?? 'bài trước';

                  /* Nhãn "Đạt" bám ĐÚNG điều kiện mở bài sau. Trước đây là cặp
                     "CB" / "NC" (cơ bản / nâng cao); phần Nâng cao đã bỏ nên
                     "CB" đứng một mình không còn nghĩa. */
                  const daDat = (getLessonProgress(les.id)?.bestScore ?? 0) >= DIEM_MO_BAI_SAU;

                  return (
                    <Tooltip
                      key={les.id}
                      /* Nói luôn CÁCH mở: đề kiểm tra của một bài chỉ có khi em xin Chemai,
                         không có nút nào trên trang để tự bấm. */
                      title={isLocked ? `Xin Chemai đề kiểm tra ${tenBaiChan} và đạt từ ${DIEM_MO_BAI_SAU} điểm để mở khóa` : ''}
                      placement="right"
                    >
                      <ListItem
                        id={`lesson-item-${les.id}`}
                        aria-disabled={isLocked || undefined}
                        onClick={() => {
                          if (isLocked) return;
                          setSelectedLesson(les);
                          /* Điện thoại: chọn xong thì gập danh mục lại, để bài
                             vừa chọn hiện ngay bên dưới thay vì cách 2.500 px. */
                          if (window.matchMedia('(max-width: 899.95px)').matches) setIsCollapsed(true);
                        }}
                        sx={{
                          borderRadius: 0,
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          opacity: isLocked ? 0.6 : 1,
                        transition: 'all 0.2s',
                        border: '1px solid',
                        /* Vien hong nhat tren nen hong nhat chi duoc 1,14 — bai dang chon gan
                           nhu khong khac bai thuong. Do tin hieu la mau dung cho trang thai
                           DANG CHON, va len 5,32. */
                        borderColor: isSelected ? 'var(--tin-hieu)' : 'transparent',
                        backgroundColor: isSelected ? 'var(--nen-tin-hieu-nhat2)' : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'var(--nen-tin-hieu-nhat2)'
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
                              ) : daDat && (
                                <Chip
                                  label="Đạt"
                                  size="small"
                                  color="success"
                                  variant="filled"
                                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold', minWidth: 'auto', px: 0.5 }}
                                />
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

