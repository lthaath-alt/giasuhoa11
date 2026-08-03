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

const CHAPTER_COLORS: Record<string, { primary: string; light: string; accent: string }> = {
  'bai-1': { primary: '#0369a1', light: '#e0f2fe', accent: '#0ea5e9' },
  'bai-2': { primary: '#0369a1', light: '#e0f2fe', accent: '#0ea5e9' },
  'bai-3': { primary: '#15803d', light: '#dcfce7', accent: '#22c55e' },
  'bai-4': { primary: '#15803d', light: '#dcfce7', accent: '#22c55e' },
  'bai-5': { primary: '#7c3aed', light: '#ede9fe', accent: '#a78bfa' },
  'bai-6': { primary: '#b45309', light: '#fef3c7', accent: '#f59e0b' },
};

const getColors = (lessonId: string) =>
  CHAPTER_COLORS[lessonId] || { primary: '#ea580c', light: '#fff7ed', accent: '#fb923c' };

export const TextbookViewer: React.FC<TextbookViewerProps> = ({ lesson, onOpenChat }) => {
  const tb = lesson.textbook;
  const colors = getColors(lesson.id);

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
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Nội dung SGK cho bài này đang được cập nhật. Vui lòng sử dụng Gia sư AI để học bài.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ===== HEADER BÀI HỌC ===== */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${colors.light}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <Box sx={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`, p: 3, color: '#fff' }}>
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
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: '0.8rem' }}
          />
        </Box>

        {/* Mục tiêu bài học */}
        <Box sx={{ p: 3, bgcolor: colors.light }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Target size={18} color={colors.primary} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Mục tiêu bài học
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {tb.objectives.map((obj, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle2 size={16} color={colors.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6 }}>{obj}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* ===== NỘI DUNG BÀI HỌC ===== */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BookMarked size={20} color={colors.primary} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>
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
                  borderRadius: 3,
                  border: `1px solid ${isOpen ? colors.accent : '#e5e7eb'}`,
                  boxShadow: isOpen ? `0 4px 16px ${colors.accent}30` : '0 2px 8px rgba(0,0,0,0.04)',
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
                    bgcolor: isOpen ? colors.light : '#fafafa',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: isOpen ? colors.light : '#f1f5f9' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 32, height: 32, borderRadius: '8px',
                        bgcolor: isOpen ? colors.primary : '#94a3b8',
                        color: '#fff', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700,
                        flexShrink: 0, transition: 'background-color 0.2s',
                      }}
                    >
                      {sIdx + 1}
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isOpen ? colors.primary : '#374151' }}>
                      {section.sectionTitle}
                    </Typography>
                  </Box>
                  <Box sx={{ color: isOpen ? colors.primary : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </Box>
                </Box>

                {/* Nội dung mục - ẩn/hiện */}
                <Collapse in={isOpen} timeout={300}>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Lý thuyết chính */}
                    <Box sx={{ p: 2.5, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #f3f4f6' }}>
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 2, color: '#1f2937', whiteSpace: 'pre-line', fontFamily: '"Georgia", serif', fontSize: '0.95rem' }}
                      >
                        {section.content}
                      </Typography>
                    </Box>

                    {/* Ghi nhớ trọng tâm */}
                    {section.keyPoints && section.keyPoints.length > 0 && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: colors.light, border: `1.5px solid ${colors.accent}50` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Lightbulb size={17} color={colors.primary} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Ghi nhớ trọng tâm
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                          {section.keyPoints.map((kp, i) => (
                            <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.accent, mt: 1, flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500, lineHeight: 1.7 }}>{kp}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Công thức */}
                    {section.formulae && section.formulae.length > 0 && (
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#0f172a', border: '1px solid #1e293b' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Calculator size={16} color="#94a3b8" />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Công thức cần nhớ
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {section.formulae.map((f, i) => (
                            <Typography
                              key={i} variant="body2"
                              sx={{ color: '#e2e8f0', fontFamily: '"Courier New", monospace', fontSize: '0.9rem', p: 1, bgcolor: '#1e293b', borderRadius: 1, borderLeft: `3px solid ${colors.accent}`, lineHeight: 1.6 }}
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
                          <Box key={i} sx={{ borderRadius: 2, border: '1px solid #d1d5db', overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, bgcolor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                              <FlaskConical size={15} color="#64748b" />
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                {ex.title}
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 1.5, mb: 1.5, border: '1px solid #bfdbfe' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1d4ed8', display: 'block', mb: 0.5 }}>ĐỀ BÀI</Typography>
                                <Typography variant="body2" sx={{ color: '#1e40af', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{ex.problem}</Typography>
                              </Box>
                              <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1.5, border: '1px solid #bbf7d0' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d', display: 'block', mb: 0.5 }}>LỜI GIẢI</Typography>
                                <Typography variant="body2" sx={{ color: '#166534', whiteSpace: 'pre-line', lineHeight: 1.8, fontFamily: '"Georgia", serif' }}>{ex.solution}</Typography>
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
            <Beaker size={20} color={colors.primary} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary }}>Câu hỏi luyện tập</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tb.practiceQuestions.map((q, qIdx) => (
              <Paper key={q.id} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0, mt: 0.2 }}>
                      {qIdx + 1}
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', lineHeight: 1.7 }}>{q.question}</Typography>
                  </Box>
                  {q.hint && (
                    <Box sx={{ mt: 1.5, ml: 4.5, p: 1.5, bgcolor: '#fefce8', borderRadius: 1.5, border: '1px solid #fde68a', display: 'flex', gap: 1 }}>
                      <HelpCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                      <Typography variant="caption" sx={{ color: '#92400e', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                        <strong>Gợi ý:</strong> {q.hint}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Divider />
                <Box sx={{ p: 2, bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  {q.answer && (
                    <Button
                      size="small"
                      variant={revealedAnswers[q.id] ? 'contained' : 'outlined'}
                      startIcon={revealedAnswers[q.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      onClick={() => toggleAnswer(q.id)}
                      sx={{
                        textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.8rem',
                        ...(revealedAnswers[q.id]
                          ? { bgcolor: colors.primary, '&:hover': { bgcolor: colors.accent } }
                          : { borderColor: colors.primary, color: colors.primary, '&:hover': { bgcolor: colors.light } }),
                      }}
                    >
                      {revealedAnswers[q.id] ? 'Ẩn đáp án' : 'Xem đáp án'}
                    </Button>
                  )}
                  <Button
                    size="small" variant="outlined"
                    startIcon={<MessageSquare size={14} />}
                    onClick={onOpenChat}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, fontSize: '0.8rem', borderColor: '#ea580c', color: '#ea580c', '&:hover': { bgcolor: '#fff7ed' } }}
                  >
                    Hỏi Gia sư AI
                  </Button>
                </Box>
                {revealedAnswers[q.id] && q.answer && (
                  <Box sx={{ mx: 2, mb: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #86efac' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d', display: 'block', mb: 0.5 }}>ĐÁP ÁN</Typography>
                    <Typography variant="body2" sx={{ color: '#166534', whiteSpace: 'pre-line', lineHeight: 1.9, fontFamily: '"Georgia", serif' }}>
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
          p: 3, borderRadius: 3,
          background: `linear-gradient(135deg, ${colors.primary}15, ${colors.accent}10)`,
          border: `1px solid ${colors.accent}40`,
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', gap: 2, justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: colors.primary }}>🤖 Còn thắc mắc về bài học này?</Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>Gia sư AI sẵn sàng giải đáp mọi câu hỏi của bạn ngay lập tức!</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MessageSquare size={18} />}
          onClick={onOpenChat}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            color: '#fff', textTransform: 'none', fontWeight: 700, borderRadius: 2.5, px: 3, py: 1.2,
            boxShadow: `0 4px 12px ${colors.primary}40`, whiteSpace: 'nowrap', flexShrink: 0,
            '&:hover': { background: `linear-gradient(135deg, ${colors.accent}, ${colors.primary})` },
          }}
        >
          Hỏi Gia sư AI ngay
        </Button>
      </Paper>
    </Box>
  );
};
