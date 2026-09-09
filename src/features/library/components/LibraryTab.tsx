import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
  IconButton,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Divider,
  Paper,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
} from '@mui/material';
import {
  Library,
  ChevronLeft,
  BookOpen,
  Plus,
  Upload,
  Trash2,
  Edit2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../../core/hooks/useApp';
import { LibraryStorage } from '../libraryStorage';
import { parseWordFile } from '../wordParser';
import { downloadWordTemplate } from '../templateGenerator';
import type {
  Question,
  ParsedQuestion,
  ParseResult,
  QuestionType,
  DifficultyLevel,
  EssayPoint,
  QuestionOption,
} from '../types';

// ─── Màu theo loại câu ───────────────────────────────────────────────────────

const TYPE_COLOR: Record<QuestionType, 'primary' | 'secondary' | 'warning'> = {
  'Trắc nghiệm': 'primary',
  'Đúng/Sai': 'secondary',
  'Tự luận': 'warning',
};

const DIFFICULTY_COLOR: Record<DifficultyLevel, string> = {
  'Thấp': 'var(--luc)',
  'Trung bình': 'var(--vang)',
  'Cao': 'var(--do)',
};

// ─── Helper: render HTML content (giữ sub/sup) ───────────────────────────────

function QuestionContent({ html }: { html: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ lineHeight: 1.7 }}
    />
  );
}

// ─── Helper: hiển thị ảnh inline ─────────────────────────────────────────────

function QuestionImages({ images }: { images: Question['images'] }) {
  if (!images || images.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {images.map((img) => (
        <Box
          key={img.id}
          component="img"
          src={img.base64}
          alt="Ảnh công thức"
          sx={{
            maxWidth: '100%',
            maxHeight: 200,
            objectFit: 'contain',
            borderRadius: 0,
            border: '1px solid var(--vien)',
            p: 0.5,
            bgcolor: 'var(--nen-the)',
          }}
        />
      ))}
    </Box>
  );
}

// ─── View enum ───────────────────────────────────────────────────────────────

type ViewMode = 'chapters' | 'lessons' | 'questions';

// ─── Breadcrumb ──────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  view: ViewMode;
  chapterTitle?: string;
  lessonTitle?: string;
  onGoChapters: () => void;
  onGoLessons: () => void;
}

function Breadcrumb({ view, chapterTitle, lessonTitle, onGoChapters, onGoLessons }: BreadcrumbProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
      <Button
        size="small"
        startIcon={<Library size={14} />}
        onClick={onGoChapters}
        sx={{ textTransform: 'none', fontWeight: view === 'chapters' ? 'bold' : 'normal', color: view === 'chapters' ? 'var(--xanh)' : 'var(--chu-2)' }}
      >
        Thư viện
      </Button>
      {view !== 'chapters' && (
        <>
          <ChevronRight size={14} color="var(--chu-mo)" />
          <Button
            size="small"
            onClick={onGoLessons}
            sx={{ textTransform: 'none', fontWeight: view === 'lessons' ? 'bold' : 'normal', color: view === 'lessons' ? 'var(--xanh)' : 'var(--chu-2)' }}
          >
            {chapterTitle}
          </Button>
        </>
      )}
      {view === 'questions' && (
        <>
          <ChevronRight size={14} color="var(--chu-mo)" />
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'var(--xanh)' }}>{lessonTitle}</Typography>
        </>
      )}
    </Box>
  );
}

// ─── UploadWordDialog ─────────────────────────────────────────────────────────

interface UploadWordDialogProps {
  open: boolean;
  chapterId: string;
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
  onSaved: () => void;
}

function UploadWordDialog({ open, chapterId, lessonId, lessonTitle, onClose, onSaved }: UploadWordDialogProps) {
  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [editableQuestions, setEditableQuestions] = useState<ParsedQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setParseResult(null);
    setEditableQuestions([]);
    setParsing(true);

    try {
      const result = await parseWordFile(file);
      setParseResult(result);
      setEditableQuestions([...result.questions]);
    } catch (err) {
      setParseResult({
        questions: [],
        errors: [{ questionIndex: 0, message: `Lỗi đọc file: ${(err as Error).message}. Vui lòng kiểm tra file không bị hỏng.` }],
        warnings: [],
      });
    } finally {
      setParsing(false);
      // Reset input để có thể upload lại cùng file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, []);

  const handleRemovePreview = (idx: number) => {
    setEditableQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (editableQuestions.length === 0) return;
    setSaving(true);
    LibraryStorage.appendQuestions(chapterId, lessonId, editableQuestions);
    setSaving(false);
    onSaved();
    handleClose();
  };

  const handleClose = () => {
    setParseResult(null);
    setEditableQuestions([]);
    setParsing(false);
    onClose();
  };

  const existingCount = LibraryStorage.getQuestions(chapterId, lessonId).length;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid var(--vien)', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Upload size={20} color="var(--xanh)" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>Upload câu hỏi từ file Word</Typography>
            <Typography variant="caption" color="text.secondary">{lessonTitle}</Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Tải template */}
        <Alert
          severity="info"
          sx={{ mb: 2, borderRadius: 0 }}
          action={
            <Button
              size="small"
              startIcon={<Download size={14} />}
              onClick={() => downloadWordTemplate()}
              sx={{ textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap' }}
            >
              Tải file mẫu
            </Button>
          }
        >
          Chưa có template? Tải file Word mẫu để điền câu hỏi đúng định dạng.
        </Alert>

        {existingCount > 0 && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }}>
            Bài học này đang có <strong>{existingCount} câu hỏi</strong>. File upload mới sẽ được <strong>nối thêm</strong>, không ghi đè.
          </Alert>
        )}

        {/* Khu vực chọn file */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 0,
            borderStyle: 'dashed',
            borderColor: 'var(--chu-mo)',
            bgcolor: 'var(--nen-trang)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'var(--xanh)', bgcolor: 'var(--nen-xanh-nhat2)' },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.doc"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Upload size={32} color="var(--chu-mo)" />
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
            Nhấn để chọn file Word (.docx)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hỗ trợ .docx (khuyến dùng) và .doc
          </Typography>
        </Paper>

        {/* Đang parse */}
        {parsing && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Đang phân tích file...</Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Lỗi parse */}
        {parseResult && parseResult.errors.length > 0 && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 0 }}>
            <AlertTitle>Phát hiện {parseResult.errors.length} lỗi định dạng</AlertTitle>
            <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
              {parseResult.errors.map((e, i) => (
                <li key={i}><Typography variant="body2">{e.message}</Typography></li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Cảnh báo */}
        {parseResult && parseResult.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 0 }}>
            <AlertTitle>Cảnh báo ({parseResult.warnings.length})</AlertTitle>
            <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
              {parseResult.warnings.map((w, i) => (
                <li key={i}><Typography variant="body2">{w.message}</Typography></li>
              ))}
            </Box>
          </Alert>
        )}

        {/* Preview câu hỏi */}
        {editableQuestions.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Xem trước {editableQuestions.length} câu hỏi
              </Typography>
              <Chip
                label={`${editableQuestions.length} câu hợp lệ`}
                color="success"
                size="small"
                icon={<CheckCircle size={14} />}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 400, overflowY: 'auto', pr: 1 }}>
              {editableQuestions.map((q, idx) => (
                <PreviewQuestionCard
                  key={idx}
                  question={q}
                  index={idx}
                  onRemove={() => handleRemovePreview(idx)}
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid var(--vien)', gap: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none' }}>
          Hủy
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={editableQuestions.length === 0 || saving}
          onClick={handleSave}
          startIcon={saving ? undefined : <CheckCircle size={16} />}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          {saving ? 'Đang lưu...' : `Lưu chính thức (${editableQuestions.length} câu)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Preview card (trong dialog upload) ─────────────────────────────────────

function PreviewQuestionCard({ question, index, onRemove }: { question: ParsedQuestion; index: number; onRemove: () => void }) {
  const [open, setOpen] = useState(index < 3); // Mở sẵn 3 câu đầu

  return (
    <Paper variant="outlined" sx={{ borderRadius: 0, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: 'var(--nen-trang)',
          cursor: 'pointer',
        }}
        onClick={() => setOpen(!open)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Câu {index + 1}
          </Typography>
          <Chip label={question.type} size="small" color={TYPE_COLOR[question.type]} />
          <Chip
            label={question.difficulty}
            size="small"
            sx={{ bgcolor: DIFFICULTY_COLOR[question.difficulty], color: 'var(--chu-nguoc)', fontWeight: 'bold' }}
          />
          <Chip label={`${question.points} điểm`} size="small" variant="outlined" />
          {question.images && question.images.length > 0 && (
            <Chip label={`${question.images.length} ảnh`} size="small" icon={<ImageIcon size={12} />} variant="outlined" />
          )}
        </Box>
        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onRemove(); }} title="Bỏ câu này">
          <XCircle size={16} />
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'var(--chu-dam-2)' }}>
            <QuestionContent html={question.content} />
          </Typography>
          <QuestionImages images={question.images || []} />

          {question.options && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {question.options.map(opt => (
                <Typography
                  key={opt.key}
                  variant="caption"
                  sx={{
                    color: opt.key === question.correctAnswer ? 'var(--luc)' : 'var(--chu)',
                    fontWeight: opt.key === question.correctAnswer ? 'bold' : 'normal',
                  }}
                >
                  {opt.key}. <QuestionContent html={opt.text} />
                  {opt.key === question.correctAnswer && ' ✓'}
                </Typography>
              ))}
            </Box>
          )}

          {question.correctAnswer && question.type !== 'Trắc nghiệm' && (
            <Typography variant="caption" sx={{ color: 'var(--luc)', fontWeight: 'bold', display: 'block', mt: 1 }}>
              Đáp án: {question.correctAnswer}
            </Typography>
          )}

          {question.essayPoints && question.essayPoints.length > 0 && (
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, bgcolor: 'var(--nen-trang)', p: 1, borderRadius: 0 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--chu)' }}>Đáp án mẫu:</Typography>
              {question.essayPoints.map((p, i) => (
                <Typography key={i} variant="caption" sx={{ color: 'var(--chu-dam-2)' }}>
                  <strong>{p.label}:</strong> {p.content}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// ─── EditQuestionDialog ───────────────────────────────────────────────────────

interface EditQuestionDialogProps {
  open: boolean;
  question: Question | null;
  chapterId: string;
  lessonId: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditQuestionDialog({ open, question, chapterId, lessonId, onClose, onSaved }: EditQuestionDialogProps) {
  const [content, setContent] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Thấp');
  const [points, setPoints] = useState(1);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [essayPointsText, setEssayPointsText] = useState('');

  React.useEffect(() => {
    if (question) {
      setContent(question.content);
      setDifficulty(question.difficulty);
      setPoints(question.points);
      setCorrectAnswer(question.correctAnswer ?? '');
      setEssayPointsText(
        question.essayPoints?.map(p => `${p.label}: ${p.content}`).join('\n') ?? ''
      );
    }
  }, [question]);

  const handleSave = () => {
    if (!question) return;
    const updates: Partial<Question> = {
      content,
      difficulty,
      points,
    };
    if (question.type === 'Tự luận') {
      const pts: EssayPoint[] = essayPointsText
        .split('\n')
        .filter(l => l.trim())
        .map((l, i) => {
          const m = /^(Ý\s*\d+[^:]*)\s*:\s*(.+)/.exec(l);
          return m ? { label: m[1].trim(), content: m[2].trim() } : { label: `Ý ${i + 1}`, content: l.trim() };
        });
      updates.essayPoints = pts;
    } else {
      updates.correctAnswer = correctAnswer;
    }
    LibraryStorage.updateQuestion(chapterId, lessonId, question.id, updates);
    onSaved();
    onClose();
  };

  if (!question) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Edit2 size={18} color="var(--xanh)" />
          Sửa câu hỏi
          <Chip label={question.type} size="small" color={TYPE_COLOR[question.type]} sx={{ ml: 1 }} />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung câu hỏi"
            value={content}
            onChange={e => setContent(e.target.value)}
            helperText="Có thể dùng <sub>...</sub> / <sup>...</sup> cho subscript/superscript"
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Mức độ</InputLabel>
              <Select value={difficulty} label="Mức độ" onChange={e => setDifficulty(e.target.value as DifficultyLevel)}>
                <MenuItem value="Thấp">Thấp</MenuItem>
                <MenuItem value="Trung bình">Trung bình</MenuItem>
                <MenuItem value="Cao">Cao</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              type="number"
              label="Điểm"
              value={points}
              onChange={e => setPoints(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0.5, step: 0.5 } }}
              sx={{ width: 100 }}
            />
          </Box>

          {question.type === 'Trắc nghiệm' && (
            <FormControl fullWidth size="small">
              <InputLabel>Đáp án đúng</InputLabel>
              <Select value={correctAnswer} label="Đáp án đúng" onChange={e => setCorrectAnswer(e.target.value)}>
                {['A', 'B', 'C', 'D'].map(k => <MenuItem key={k} value={k}>{k}</MenuItem>)}
              </Select>
            </FormControl>
          )}

          {question.type === 'Đúng/Sai' && (
            <FormControl fullWidth size="small">
              <InputLabel>Đáp án đúng</InputLabel>
              <Select value={correctAnswer} label="Đáp án đúng" onChange={e => setCorrectAnswer(e.target.value)}>
                <MenuItem value="Đúng">Đúng</MenuItem>
                <MenuItem value="Sai">Sai</MenuItem>
              </Select>
            </FormControl>
          )}

          {question.type === 'Tự luận' && (
            <TextField
              fullWidth
              multiline
              rows={5}
              label="Đáp án mẫu (mỗi ý một dòng: Ý 1: ...)"
              value={essayPointsText}
              onChange={e => setEssayPointsText(e.target.value)}
              helperText="Mỗi dòng một ý: Ý 1: nội dung / Ý 2: nội dung"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Hủy</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!content.trim()}
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: Question;
  index: number;
  chapterId: string;
  lessonId: string;
  onDeleted: () => void;
  onEdited: () => void;
}

function QuestionCard({ question, index, chapterId, lessonId, onDeleted, onEdited }: QuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa Câu ${index + 1} không?`)) {
      LibraryStorage.deleteQuestion(chapterId, lessonId, question.id);
      onDeleted();
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ borderRadius: 0, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 'none' } }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, bgcolor: 'var(--nen-trang)', cursor: 'pointer' }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'var(--xanh-nen)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Typography variant="caption" sx={{ color: 'var(--chu-nguoc)', fontWeight: 'bold', fontSize: 11 }}>{index + 1}</Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={question.type} size="small" color={TYPE_COLOR[question.type]} />
              <Chip
                label={question.difficulty}
                size="small"
                sx={{ bgcolor: DIFFICULTY_COLOR[question.difficulty], color: 'var(--chu-nguoc)', fontWeight: 600, height: 20 }}
              />
              <Chip label={`${question.points} điểm`} size="small" variant="outlined" />
              {question.images && question.images.length > 0 && (
                <Chip label={`${question.images.length} ảnh`} size="small" icon={<ImageIcon size={11} />} variant="outlined" />
              )}
            </Box>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: 'var(--chu-dam-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: expanded ? 'normal' : 'nowrap', maxWidth: '100%' }}
            >
              <QuestionContent html={question.content || '(không có nội dung text)'} />
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <IconButton size="small" color="primary" title="Sửa câu hỏi" onClick={() => setEditOpen(true)}>
              <Edit2 size={15} />
            </IconButton>
            <IconButton size="small" color="error" title="Xóa câu hỏi" onClick={handleDelete}>
              <Trash2 size={15} />
            </IconButton>
            {expanded ? <ChevronDown size={16} color="var(--chu-mo)" /> : <ChevronRight size={16} color="var(--chu-mo)" />}
          </Box>
        </Box>

        {/* Expanded detail */}
        <Collapse in={expanded}>
          <Box sx={{ px: 2, py: 2, borderTop: '1px solid var(--nen-nhat)' }}>
            {question.images && question.images.length > 0 && <QuestionImages images={question.images} />}

            {question.options && (
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {question.options.map(opt => (
                  <Box
                    key={opt.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      p: 1,
                      borderRadius: 0,
                      bgcolor: opt.key === question.correctAnswer ? 'var(--nen-luc-nhat2)' : 'var(--nen-trang)',
                      border: opt.key === question.correctAnswer ? '1px solid var(--luc)' : '1px solid transparent',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 20, color: opt.key === question.correctAnswer ? 'var(--luc)' : 'var(--chu)' }}>
                      {opt.key}.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--chu-dam-2)', flex: 1 }}>
                      <QuestionContent html={opt.text} />
                    </Typography>
                    {opt.key === question.correctAnswer && <CheckCircle size={16} color="var(--luc)" />}
                  </Box>
                ))}
              </Box>
            )}

            {question.correctAnswer && question.type !== 'Trắc nghiệm' && (
              <Box sx={{ mt: 1.5, p: 1, bgcolor: 'var(--nen-luc-nhat2)', borderRadius: 0, border: '1px solid var(--luc)', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <CheckCircle size={14} color="var(--luc)" />
                <Typography variant="caption" sx={{ color: 'var(--luc)', fontWeight: 'bold' }}>
                  Đáp án đúng: {question.correctAnswer}
                </Typography>
              </Box>
            )}

            {question.essayPoints && question.essayPoints.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'var(--chu)', display: 'block', mb: 0.5 }}>
                  Đáp án mẫu:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pl: 1, borderLeft: '3px solid var(--vien)' }}>
                  {question.essayPoints.map((p, i) => (
                    <Typography key={i} variant="body2" sx={{ color: 'var(--chu-dam-2)' }}>
                      <strong style={{ color: 'var(--xanh)' }}>{p.label}:</strong> {p.content}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>

      <EditQuestionDialog
        open={editOpen}
        question={question}
        chapterId={chapterId}
        lessonId={lessonId}
        onClose={() => setEditOpen(false)}
        onSaved={() => { setEditOpen(false); onEdited(); forceUpdate(n => n + 1); }}
      />
    </>
  );
}

// ─── Main: LibraryTab ─────────────────────────────────────────────────────────

export const LibraryTab: React.FC = () => {
  const { curriculum } = useApp();

  const [view, setView] = useState<ViewMode>('chapters');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [newLessonChapterId, setNewLessonChapterId] = useState('');
  const [, forceRefresh] = useState(0);

  const refresh = () => forceRefresh(n => n + 1);

  // Thông tin chapter/lesson đang chọn
  const selectedChapter = curriculum.find(c => c.id === selectedChapterId);
  const selectedLesson = selectedChapter?.lessons.find(l => l.id === selectedLessonId);

  // Câu hỏi của bài đang mở
  const questions = selectedChapterId && selectedLessonId
    ? LibraryStorage.getQuestions(selectedChapterId, selectedLessonId)
    : [];

  // ── Handlers ────────────────────────────────────────────────────────────────

  const goToLessons = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setView('lessons');
  };

  const goToQuestions = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setView('questions');
  };

  const goToChapters = () => {
    setView('chapters');
    setSelectedChapterId('');
    setSelectedLessonId('');
  };

  const goToLessonsFromBreadcrumb = () => {
    setView('lessons');
    setSelectedLessonId('');
  };

  // ── Render: Danh sách Chương ─────────────────────────────────────────────

  if (view === 'chapters') {
    return (
      <Box id="library-tab-container">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--xanh)', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Library size={24} />
              Thư viện câu hỏi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Quản lý ngân hàng câu hỏi theo từng chương và bài học trong chương trình.
            </Typography>
          </Box>
        </Box>

        {curriculum.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 0 }} icon={<Info size={20} />}>
            <AlertTitle>Chưa có chương học nào</AlertTitle>
            Vui lòng tạo chương học trong tab <strong>"Bài học &amp; Chương trình"</strong> trước. Thư viện sẽ tự động phản ánh cấu trúc đó.
          </Alert>
        ) : (
          <Grid container spacing={2.5}>
            {curriculum.map((chapter, idx) => {
              const totalQ = chapter.lessons.reduce(
                (sum, l) => sum + LibraryStorage.getQuestions(chapter.id, l.id).length,
                0
              );
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={chapter.id}>
                  <Card
                    id={`library-chapter-card-${chapter.id}`}
                    sx={{
                      borderRadius: 0,
                      border: '1px solid var(--vien)',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'var(--xanh)',
                        boxShadow: 'none',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => goToLessons(chapter.id)} sx={{ p: 0 }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                          <Box
                            sx={{
                              width: 44, height: 44, borderRadius: 0,
                              bgcolor: `hsl(${(idx * 43) % 360}, 70%, 92%)`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                          >
                            <Typography sx={{ fontWeight: 'bold', color: `hsl(${(idx * 43) % 360}, 60%, 35%)`, fontSize: 16 }}>
                              {idx + 1}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-2)', lineHeight: 1.3 }}>
                              {chapter.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {chapter.lessons.length} bài học
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 1.5 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={`${chapter.lessons.length} bài`} size="small" icon={<BookOpen size={11} />} variant="outlined" />
                            <Chip
                              label={`${totalQ} câu hỏi`}
                              size="small"
                              color={totalQ > 0 ? 'primary' : 'default'}
                              variant={totalQ > 0 ? 'filled' : 'outlined'}
                            />
                          </Box>
                          <ChevronRight size={18} color="var(--chu-mo)" />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    );
  }

  // ── Render: Danh sách Bài học trong chương ───────────────────────────────

  if (view === 'lessons' && selectedChapter) {
    return (
      <Box id="library-lessons-container">
        <Breadcrumb
          view="lessons"
          chapterTitle={selectedChapter.title}
          onGoChapters={goToChapters}
          onGoLessons={goToLessonsFromBreadcrumb}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-2)' }}>
              {selectedChapter.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chọn bài học để quản lý câu hỏi. Bài học được đồng bộ từ tab "Bài học &amp; Chương trình".
            </Typography>
          </Box>
        </Box>

        {selectedChapter.lessons.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 0 }} icon={<Info size={20} />}>
            Chương này chưa có bài học. Thêm bài học trong tab <strong>"Bài học &amp; Chương trình"</strong>.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {selectedChapter.lessons.map((lesson) => {
              const qCount = LibraryStorage.getQuestions(selectedChapter.id, lesson.id).length;
              const isLow = qCount > 0 && qCount < LibraryStorage.MIN_QUESTIONS_WARNING;

              return (
                <Paper
                  key={lesson.id}
                  id={`library-lesson-${lesson.id}`}
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    transition: 'all 0.15s',
                    cursor: 'pointer',
                    '&:hover': { borderColor: 'var(--xanh)', boxShadow: 'none' },
                  }}
                  onClick={() => goToQuestions(lesson.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
                    <Box
                      sx={{
                        width: 38, height: 38, borderRadius: '50%',
                        bgcolor: 'var(--nen-xanh-nhat2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <FileText size={18} color="var(--xanh)" />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-2)' }}>
                        {lesson.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={qCount === 0 ? 'Chưa có câu hỏi' : `${qCount} câu hỏi`}
                          size="small"
                          color={qCount === 0 ? 'default' : 'primary'}
                          variant={qCount === 0 ? 'outlined' : 'filled'}
                        />
                        {isLow && (
                          <Tooltip title={`Khuyến cáo bổ sung thêm câu hỏi (tối thiểu ${LibraryStorage.MIN_QUESTIONS_WARNING} câu)`}>
                            <Chip
                              label="Cần bổ sung"
                              size="small"
                              color="warning"
                              icon={<AlertTriangle size={11} />}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <ChevronRight size={18} color="var(--chu-mo)" />
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    );
  }

  // ── Render: Danh sách câu hỏi của bài ───────────────────────────────────

  if (view === 'questions' && selectedChapter && selectedLesson) {
    const isLow = questions.length > 0 && questions.length < LibraryStorage.MIN_QUESTIONS_WARNING;
    const typeStats = {
      'Trắc nghiệm': questions.filter(q => q.type === 'Trắc nghiệm').length,
      'Đúng/Sai': questions.filter(q => q.type === 'Đúng/Sai').length,
      'Tự luận': questions.filter(q => q.type === 'Tự luận').length,
    };

    return (
      <Box id="library-questions-container">
        <Breadcrumb
          view="questions"
          chapterTitle={selectedChapter.title}
          lessonTitle={selectedLesson.title}
          onGoChapters={goToChapters}
          onGoLessons={goToLessonsFromBreadcrumb}
        />

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--chu-dam-2)' }}>
              {selectedLesson.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip label={`${questions.length} câu tổng cộng`} size="small" color="primary" />
              {typeStats['Trắc nghiệm'] > 0 && <Chip label={`${typeStats['Trắc nghiệm']} TN`} size="small" color="primary" variant="outlined" />}
              {typeStats['Đúng/Sai'] > 0 && <Chip label={`${typeStats['Đúng/Sai']} ĐS`} size="small" color="secondary" variant="outlined" />}
              {typeStats['Tự luận'] > 0 && <Chip label={`${typeStats['Tự luận']} TL`} size="small" color="warning" variant="outlined" />}
            </Box>
          </Box>
          <Button
            id="library-upload-btn"
            variant="contained"
            color="primary"
            startIcon={<Upload size={16} />}
            onClick={() => setUploadOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 0 }}
          >
            Upload file Word
          </Button>
        </Box>

        {/* Cảnh báo ít câu */}
        {isLow && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 0 }} icon={<AlertTriangle size={18} />}>
            Bài học này chỉ có <strong>{questions.length} câu hỏi</strong> (khuyến cáo ít nhất {LibraryStorage.MIN_QUESTIONS_WARNING} câu).
            Học sinh có thể gặp câu hỏi trùng lặp khi kiểm tra nhiều lần. Hãy upload thêm.
          </Alert>
        )}

        {/* Danh sách câu hỏi */}
        {questions.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{ p: 5, textAlign: 'center', borderRadius: 0, borderStyle: 'dashed', borderColor: 'var(--vien)' }}
          >
            <Upload size={40} color="var(--chu-mo)" />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold', color: 'var(--chu-2)' }}>
              Chưa có câu hỏi nào
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Bấm "Upload file Word" để thêm câu hỏi cho bài này.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Upload size={16} />}
              onClick={() => setUploadOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 'bold' }}
            >
              Upload file Word ngay
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {questions.map((q, idx) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={idx}
                chapterId={selectedChapterId}
                lessonId={selectedLessonId}
                onDeleted={refresh}
                onEdited={refresh}
              />
            ))}
          </Box>
        )}

        {/* Upload Dialog */}
        <UploadWordDialog
          open={uploadOpen}
          chapterId={selectedChapterId}
          lessonId={selectedLessonId}
          lessonTitle={selectedLesson.title}
          onClose={() => setUploadOpen(false)}
          onSaved={refresh}
        />
      </Box>
    );
  }

  return null;
};

export default LibraryTab;
