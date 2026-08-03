import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Award,
  BookMarked
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { Chapter, Lesson } from '../../lessons/types';

export const CurriculumTab: React.FC = () => {
  const {
    curriculum,
    addChapter,
    deleteChapter,
    updateChapter,
    addLesson,
    deleteLesson,
    updateLesson
  } = useApp();

  // State quản lý Dialog Chương
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');

  // State quản lý Dialog Bài học
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [targetChapterId, setTargetChapterId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonFormulae, setLessonFormulae] = useState('');
  const [lessonQuestions, setLessonQuestions] = useState<
    { question: string; hint: string; sampleAnswer: string }[]
  >([]);

  // State câu hỏi đang soạn thảo trong form
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');

  // Mở Dialog thêm chương mới
  const handleOpenAddChapter = () => {
    setEditingChapterId(null);
    setChapterTitle('');
    setChapterDialogOpen(true);
  };

  // Mở Dialog sửa chương
  const handleOpenEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setChapterTitle(chapter.title);
    setChapterDialogOpen(true);
  };

  // Lưu thông tin Chương
  const handleSaveChapter = () => {
    if (!chapterTitle.trim()) return;
    if (editingChapterId) {
      updateChapter(editingChapterId, chapterTitle.trim());
    } else {
      addChapter(chapterTitle.trim());
    }
    setChapterDialogOpen(false);
  };

  // Mở Dialog thêm bài học mới
  const handleOpenAddLesson = (chapterId: string) => {
    setTargetChapterId(chapterId);
    setEditingLessonId(null);
    setLessonTitle('');
    setLessonSummary('');
    setLessonFormulae('');
    setLessonQuestions([]);
    setCurrentQuestion('');
    setCurrentHint('');
    setCurrentAnswer('');
    setLessonDialogOpen(true);
  };

  // Mở Dialog sửa bài học
  const handleOpenEditLesson = (chapterId: string, lesson: Lesson) => {
    setTargetChapterId(chapterId);
    setEditingLessonId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonSummary(lesson.summary);
    setLessonFormulae(lesson.formulae.join('\n'));
    setLessonQuestions([...lesson.commonQuestions]);
    setCurrentQuestion('');
    setCurrentHint('');
    setCurrentAnswer('');
    setLessonDialogOpen(true);
  };

  // Thêm câu hỏi gợi ý vào danh sách bài học đang soạn
  const handleAddQuestionToForm = () => {
    if (!currentQuestion.trim() || !currentHint.trim() || !currentAnswer.trim()) return;
    setLessonQuestions([
      ...lessonQuestions,
      {
        question: currentQuestion.trim(),
        hint: currentHint.trim(),
        sampleAnswer: currentAnswer.trim()
      }
    ]);
    setCurrentQuestion('');
    setCurrentHint('');
    setCurrentAnswer('');
  };

  // Xóa câu hỏi khỏi danh sách bài học đang soạn
  const handleRemoveQuestionFromForm = (idx: number) => {
    setLessonQuestions(lessonQuestions.filter((_, i) => i !== idx));
  };

  // Lưu thông tin bài học
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !lessonSummary.trim()) return;

    const formulaeArray = lessonFormulae
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const updatedData = {
      title: lessonTitle.trim(),
      summary: lessonSummary.trim(),
      formulae: formulaeArray,
      commonQuestions: lessonQuestions
    };

    if (editingLessonId) {
      updateLesson(targetChapterId, editingLessonId, updatedData);
    } else {
      addLesson(
        targetChapterId,
        lessonTitle.trim(),
        lessonSummary.trim(),
        formulaeArray,
        lessonQuestions
      );
    }
    setLessonDialogOpen(false);
  };

  return (
    <Box id="curriculum-manager">
      {/* Header khu vực */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0062b8' }}>
            Quản lý Bài học & Chương trình
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thiết kế danh mục các bài học, lý thuyết cốt lõi, công thức tham chiếu và gợi ý hướng dẫn của Gia sư AI.
          </Typography>
        </Box>
        <Button
          id="admin-add-chapter-btn"
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
          onClick={handleOpenAddChapter}
          sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
        >
          Thêm Chương (Danh mục)
        </Button>
      </Box>

      {curriculum.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Chưa có danh mục chương trình học nào được tạo. Vui lòng thêm Chương học mới để bắt đầu thiết kế bài giảng!
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {curriculum.map((chapter) => (
            <Accordion
              key={chapter.id}
              id={`curriculum-accordion-${chapter.id}`}
              sx={{
                borderRadius: '12px !important',
                border: '1px solid #e2e8f0',
                boxShadow: 'none',
                overflow: 'hidden',
                '&:before': { display: 'none' }
              }}
            >
              {/* Header Accordion */}
              <AccordionSummary
                expandIcon={<ChevronDown size={20} />}
                sx={{
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  '& .MuiAccordionSummary-content': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    pr: 2
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <BookOpen size={20} color="#0062b8" />
                  <Typography sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                    {chapter.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1, bgcolor: '#e2e8f0', px: 1, py: 0.3, borderRadius: 1.5 }}>
                    {chapter.lessons.length} bài học
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    color="primary"
                    title="Sửa chương"
                    onClick={() => handleOpenEditChapter(chapter)}
                  >
                    <Edit2 size={15} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    title="Xóa chương"
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc chắn muốn xóa Chương: "${chapter.title}" không? Tất cả bài học bên trong sẽ bị xóa.`)) {
                        deleteChapter(chapter.id);
                      }
                    }}
                  >
                    <Trash2 size={15} />
                  </IconButton>
                </Box>
              </AccordionSummary>

              {/* Chi tiết Accordion: Danh sách bài học */}
              <AccordionDetails sx={{ p: 3, backgroundColor: '#ffffff' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#475569' }}>
                    Danh sách các bài học chi tiết:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Plus size={14} />}
                    onClick={() => handleOpenAddLesson(chapter.id)}
                    sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 1.5 }}
                  >
                    Thêm Bài Học Mới
                  </Button>
                </Box>

                {chapter.lessons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
                    Chưa có bài học nào trong chương này. Nhấn nút "Thêm Bài Học Mới" ở trên để xây dựng bài học.
                  </Typography>
                ) : (
                  <List sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 0 }}>
                    {chapter.lessons.map((les) => (
                      <Paper
                        key={les.id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 2.5, borderColor: '#e2e8f0' }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                              {les.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              title="Sửa bài học"
                              onClick={() => handleOpenEditLesson(chapter.id, les)}
                            >
                              <Edit2 size={14} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              title="Xóa bài học"
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xóa bài học "${les.title}" không?`)) {
                                  deleteLesson(chapter.id, les.id);
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        {/* Lý thuyết tóm tắt */}
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0f766e', display: 'block', mb: 0.5 }}>
                            Lý thuyết cốt lõi (Tóm tắt):
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                            {les.summary}
                          </Typography>
                        </Box>

                        {/* Công thức quan trọng */}
                        {les.formulae.length > 0 && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ea580c', display: 'block', mb: 0.5 }}>
                              Công thức cần nhớ:
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1 }}>
                              {les.formulae.map((form, fIdx) => (
                                <Typography key={fIdx} variant="caption" sx={{ display: 'block', color: '#334155', fontStyle: 'italic' }}>
                                  • {form}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Số lượng câu hỏi gợi ý */}
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0062b8', display: 'inline-block' }}>
                            Câu hỏi gợi ý Gia sư AI hỗ trợ tư duy:{' '}
                          </Typography>
                          <Typography variant="caption" color="text.primary" sx={{ fontWeight: 'bold', ml: 0.5 }}>
                            {les.commonQuestions.length} câu hỏi
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* ================= DIALOG CHƯƠNG ================= */}
      <Dialog open={chapterDialogOpen} onClose={() => setChapterDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingChapterId ? 'Sửa thông tin Chương' : 'Thêm Chương học mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Tên Chương học"
              variant="outlined"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="Ví dụ: Chương 7: Hóa học hữu cơ đặc biệt"
              helperText="Tên chương dùng để gom nhóm các bài học trong danh mục."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChapterDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveChapter}
            variant="contained"
            color="primary"
            disabled={!chapterTitle.trim()}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Lưu lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= DIALOG BÀI HỌC ================= */}
      <Dialog open={lessonDialogOpen} onClose={() => setLessonDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingLessonId ? 'Sửa thông tin Bài học' : 'Thêm bài học mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* Cột trái: Thông tin chính */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Tên bài học"
                placeholder="Ví dụ: Bài 7: Tổng hợp Alkane trong phòng thí nghiệm"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                variant="outlined"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Tóm tắt lý thuyết cốt lõi"
                placeholder="Nội dung chính yếu học sinh cần nắm được của bài học này..."
                value={lessonSummary}
                onChange={(e) => setLessonSummary(e.target.value)}
                variant="outlined"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Công thức quan trọng (Mỗi dòng một công thức)"
                placeholder="Ví dụ: Công thức tính hiệu suất: H% = (Lượng thực tế / Lượng lý thuyết) * 100"
                value={lessonFormulae}
                onChange={(e) => setLessonFormulae(e.target.value)}
                variant="outlined"
              />
            </Box>

            {/* Cột phải: Câu hỏi gợi ý và giải đáp */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#334155' }}>
                Danh sách Câu hỏi hướng dẫn gợi mở (Gia sư AI):
              </Typography>

              {lessonQuestions.length === 0 ? (
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1', mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                    Chưa có câu hỏi định hướng nào. Soạn thảo form phía dưới để thêm câu hỏi giúp Gia sư định hình phong cách phản hồi.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  {lessonQuestions.map((q, qIdx) => (
                    <Paper key={qIdx} variant="outlined" sx={{ p: 1.5, position: 'relative', borderRadius: 2 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveQuestionFromForm(qIdx)}
                        sx={{ position: 'absolute', top: 4, right: 4 }}
                      >
                        <Trash2 size={12} />
                      </IconButton>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0062b8', display: 'block', pr: 2 }}>
                        CH: {q.question}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontStyle: 'italic', mt: 0.5 }}>
                        Gợi ý: {q.hint}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Form thêm câu hỏi nhanh */}
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#475569', display: 'block', mb: 1 }}>
                  Soạn câu hỏi dẫn dắt mẫu cho bài này:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Câu hỏi của học sinh"
                    placeholder="Ví dụ: Em chưa biết lập công thức hữu cơ?"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    label="Gợi ý tư duy của Gia sư AI"
                    placeholder="Ví dụ: Chỉ cho học sinh cách tính %C, %H..."
                    value={currentHint}
                    onChange={(e) => setCurrentHint(e.target.value)}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    multiline
                    rows={2}
                    label="Lời giải mẫu tham khảo"
                    placeholder="Lời giải chi tiết của giáo viên..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<Plus size={12} />}
                    onClick={handleAddQuestionToForm}
                    disabled={!currentQuestion.trim() || !currentHint.trim() || !currentAnswer.trim()}
                    sx={{ textTransform: 'none', mt: 0.5, borderRadius: 1.5 }}
                  >
                    Thêm vào danh sách câu hỏi
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setLessonDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveLesson}
            variant="contained"
            color="primary"
            disabled={!lessonTitle.trim() || !lessonSummary.trim()}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
          >
            Lưu bài học
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
