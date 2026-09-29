import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  Alert,
  Collapse,
} from '@mui/material';
import {
  BookOpen,
  Target,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FlaskConical,
  Calculator,
  HelpCircle,
  CheckCircle2,
  BookMarked,
  Beaker,
  MessageSquare,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Lesson } from '../types';

interface TextbookViewerProps {
  lesson: Lesson;
  onOpenChat: () => void;
}

/* Mot bo vai duy nhat cho moi chuong. Ten truong noi VIEC no lam, khong noi
   mau no mang — nho vay dat sai vai se lo ra ngay khi doc ma. */
const VAI = {
  nenDam: 'var(--nen-dam)',   // dai dau bai, o so thu tu, nut chinh
  chu: 'var(--chu-dam)',      // tieu de muc
  truong: 'var(--nen-nhat)',  // nen mot truong noi dung
  ke: 'var(--vien)',          // duong ke
};

export const TextbookViewer: React.FC<TextbookViewerProps> = ({ lesson, onOpenChat }) => {
  const tb = lesson.textbook;

  // openSections: object { sectionId: boolean }
  // Reset mỗi khi bài học thay đổi → mặc định mở tất cả
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Khi lesson thay đổi → reset và mở tất cả mục
  useEffect(() => {
    if (!tb) return;
    const initial: Record<string, boolean> = {};
    tb.sections.forEach((s) => { initial[s.id] = true; });
    setOpenSections(initial);
    setRevealedAnswers({});
  }, [lesson.id]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAnswer = (qId: string) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (!tb) {
    return (
      <Alert severity="info" sx={{ borderRadius: 0 }}>
        Nội dung SGK cho bài này đang được cập nhật. Vui lòng sử dụng Gia sư AI để học bài.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ===== HEADER BÀI HỌC ===== */}
      <Paper sx={{ borderRadius: 0, overflow: 'hidden', border: `2px solid ${VAI.nenDam}`, boxShadow: 'none' }}>
        <Box sx={{ backgroundColor: VAI.nenDam, p: 3, color: 'var(--chu-nguoc)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <BookOpen size={22} />
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, opacity: 0.85, textTransform: 'uppercase' }}>
              Sách Giáo Khoa Hóa Học 11 · KNTT 2025
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1 }}>
            {lesson.title}
          </Typography>
          <Chip
            label={`📄 ${tb.pageRange}`}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'var(--chu-nguoc)', fontWeight: 600, fontSize: '0.8rem' }}
          />
        </Box>

        {/* Mục tiêu bài học */}
        <Box sx={{ p: 3, bgcolor: VAI.truong }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Target size={18} color={VAI.chu} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: VAI.chu, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mục tiêu bài học
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {tb.objectives.map((obj, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle2 size={16} color="var(--luc)" style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'var(--chu-dam-2)', lineHeight: 1.6 }}>{obj}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* ===== NỘI DUNG BÀI HỌC ===== */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BookMarked size={20} color={VAI.chu} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: VAI.chu }}>
            Nội dung bài học
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tb.sections.map((section, sIdx) => {
            const isOpen = !!openSections[section.id];
            return (
              <Paper
                key={section.id}
                sx={{
                  borderRadius: 0,
                  border: `1px solid ${isOpen ? VAI.chu : 'var(--vien-2)'}`,
                  boxShadow: 'none',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
              >
                {/* Header mục - bấm để mở/đóng */}
                <Box
                  onClick={() => toggleSection(section.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1.8,
                    bgcolor: isOpen ? VAI.truong : 'var(--nen-rat-nhat)',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: VAI.truong },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: 0,
                        bgcolor: isOpen ? VAI.nenDam : 'var(--nen-tat)',
                        color: 'var(--chu-nguoc)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700,
                        flexShrink: 0, transition: 'background-color 0.2s',
                      }}
                    >
                      {sIdx + 1}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: VAI.chu }}>
                      {section.sectionTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ color: isOpen ? VAI.chu : 'var(--chu-mo)', display: 'flex', alignItems: 'center' }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Box>
                </Box>

                {/* Nội dung mục - ẩn/hiện */}
                <Collapse in={isOpen} timeout={300}>
                  {/* .mo-muc-bai: cac khoi ben trong trai ra so le mot nhip.
                      Nhip duy nhat cua ca he thong — xem chu thich o index.css. */}
                  <Box className="mo-muc-bai" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Lý thuyết chính */}
                    <Box sx={{ p: 2.5, bgcolor: 'var(--nen-rat-nhat)', borderRadius: 0, border: '1px solid var(--vien)' }}>
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 2, color: 'var(--chu-dam-2)', whiteSpace: 'pre-line', fontFamily: '"Georgia", serif', fontSize: '0.95rem' }}
                      >
                        {section.content}
                      </Typography>
                    </Box>

                    {/* Ghi nhớ trọng tâm */}
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <Box sx={{ p: 2, borderRadius: 0, bgcolor: 'var(--nen-vang-nhat)', border: '1px solid var(--vang-nen)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Lightbulb size={17} color="var(--vang-dam)" />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: VAI.chu, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Ghi nhớ trọng tâm
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {section.keyPoints.map((kp, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Box sx={{ width: 6, height: 6, bgcolor: VAI.chu, mt: 1, flexShrink: 0, transform: 'rotate(45deg)' }} />
                              <Typography variant="body2" sx={{ color: 'var(--chu-dam-2)', fontWeight: 500, lineHeight: 1.7 }}>{kp}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Công thức */}
                    {section.formulae && section.formulae.length > 0 && (
                      <Box sx={{ p: 2, borderRadius: 0, bgcolor: 'var(--nen-dam)', border: '1px solid var(--vien-dam)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Calculator size={16} color="var(--chu-tren-nen-dam)" />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--chu-tren-nen-dam)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Công thức cần nhớ
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {section.formulae.map((f, i) => (
                            <Typography
                              key={i} variant="body2"
                              sx={{ color: 'var(--chu-ma)', fontFamily: '"Courier New", monospace', fontSize: '0.9rem', p: 1, bgcolor: 'var(--nen-ma)', borderRadius: 0, border: `1px solid ${VAI.ke}`, lineHeight: 1.6 }}
                            >
                              {f}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Ví dụ minh họa */}
                    {section.examples && section.examples.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {section.examples.map((ex, i) => (
                          <Box key={i} sx={{ borderRadius: 0, border: '1px solid var(--vien)', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: 'var(--nen-trang)', borderBottom: '1px solid var(--vien-2)' }}>
                              <FlaskConical size={15} color="var(--chu-2)" />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--chu)', textTransform: 'uppercase' }}>
                                {ex.title}
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ p: 1.5, bgcolor: 'var(--nen-xanh-nhat2)', borderRadius: 0, mb: 1.5, border: '1px solid var(--vien-xanh)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--chu-dam)', display: 'block', mb: 0.5 }}>ĐỀ BÀI</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--xanh-chu)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{ex.problem}</Typography>
                              </Box>
                              <Box sx={{ p: 1.5, bgcolor: 'var(--nen-luc-nhat2)', borderRadius: 0, border: '1px solid var(--nen-luc-nhat)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--luc-dam)', display: 'block', mb: 0.5 }}>LỜI GIẢI</Typography>
                                <Typography variant="body2" sx={{ color: 'var(--luc-dam2)', whiteSpace: 'pre-line', lineHeight: 1.8, fontFamily: '"Georgia", serif' }}>{ex.solution}</Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* ===== CÂU HỎI LUYỆN TẬP ===== */}
      {tb.practiceQuestions && tb.practiceQuestions.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Beaker size={20} color={VAI.chu} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: VAI.chu }}>Câu hỏi luyện tập</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tb.practiceQuestions.map((q, qIdx) => (
              <Paper key={q.id} sx={{ borderRadius: 0, border: '1px solid var(--vien-2)', overflow: 'hidden', boxShadow: 'none' }}>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, bgcolor: VAI.nenDam, color: 'var(--chu-nguoc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, mt: 0.2 }}>
                      {qIdx + 1}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'var(--chu-dam-2)', lineHeight: 1.7 }}>{q.question}</Typography>
                  </Box>
                  {q.hint && (
                    <Box sx={{ mt: 1.5, ml: 4.5, p: 1.5, bgcolor: 'var(--nen-vang-nhat)', borderRadius: 0, border: '1px solid var(--vang-nen)', display: 'flex', gap: 1 }}>
                      <HelpCircle size={16} color="var(--vang-dam)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <Typography variant="caption" sx={{ color: 'var(--vang-dam)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                        <strong>Gợi ý:</strong> {q.hint}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: 'var(--nen-rat-nhat)', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {q.answer && (
                    <Button
                      size="small"
                      variant={revealedAnswers[q.id] ? 'contained' : 'outlined'}
                      startIcon={revealedAnswers[q.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      onClick={() => toggleAnswer(q.id)}
                      sx={{
                        textTransform: 'none', fontWeight: 600, borderRadius: 0, fontSize: '0.8rem',
                        ...(revealedAnswers[q.id]
                          ? { bgcolor: VAI.nenDam, color: 'var(--chu-nguoc)', '&:hover': { bgcolor: VAI.nenDam } }
                          : { borderColor: VAI.chu, color: VAI.chu, '&:hover': { bgcolor: VAI.truong } }),
                      }}
                    >
                      {revealedAnswers[q.id] ? 'Ẩn đáp án' : 'Xem đáp án'}
                    </Button>
                  )}
                  <Button
                    size="small" variant="outlined"
                    startIcon={<MessageSquare size={14} />}
                    onClick={onOpenChat}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 0, fontSize: '0.8rem', borderColor: 'var(--tin-hieu)', color: 'var(--tin-hieu)', '&:hover': { bgcolor: 'var(--nen-tin-hieu-nhat)' } }}
                  >
                    Hỏi Chemai
                  </Button>
                </Box>
                {revealedAnswers[q.id] && q.answer && (
                  <Box sx={{ mx: 2, mb: 2, p: 2, bgcolor: 'var(--nen-luc-nhat2)', borderRadius: 0, border: '1px solid var(--luc-nen)' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--luc-dam)', display: 'block', mb: 0.5 }}>ĐÁP ÁN</Typography>
                    <Typography variant="body2" sx={{ color: 'var(--luc-dam2)', whiteSpace: 'pre-line', lineHeight: 1.9, fontFamily: '"Georgia", serif' }}>
                      {q.answer}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* ===== NÚT CHUYỂN SANG CHAT ===== */}
      <Paper
        sx={{
          p: 3, borderRadius: 0,
          backgroundColor: VAI.truong,
          border: `2px solid ${VAI.nenDam}`,
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', gap: 2, justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: VAI.chu }}>Còn thắc mắc về bài học này?</Typography>
          <Typography variant="body2" sx={{ color: 'var(--chu-2)', mt: 0.5 }}>Chemai sẵn sàng giải đáp mọi câu hỏi của bạn ngay lập tức!</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MessageSquare size={18} />}
          onClick={onOpenChat}
          sx={{
            backgroundColor: 'var(--tin-hieu-nen)',
            color: 'var(--chu-nguoc)', textTransform: 'none', fontWeight: 700, borderRadius: 0, px: 3, py: 1.2,
            boxShadow: 'none', whiteSpace: 'nowrap', flexShrink: 0,
            '&:hover': { backgroundColor: VAI.nenDam },
          }}
        >
          Hỏi Chemai ngay
        </Button>
      </Paper>
    </Box>
  );
};
