import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Alert, AlertTitle, Divider, Chip, Stack,
  List, ListItem, ListItemIcon, ListItemText, Checkbox, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, LinearProgress,
} from '@mui/material';
import {
  ArrowLeft, Clock, BookOpen, Lightbulb, ChevronDown, CheckCircle, Sigma,
} from 'lucide-react';
import { Lesson } from '../../lessons/types';
import { BankQuestion } from '../../bank/types';
import { PhanLuyenTap, TEN_PHAN, PHUT_KHOA, SO_LUOT_MOI_CHU_KY } from '../types';
import { NoiDungHoaHoc } from './NoiDungHoaHoc';

interface Props {
  bai: Lesson;
  phan: PhanLuyenTap;
  /** Mốc hết khóa (ms). Hết mốc này nút ôn xong mới bấm được. */
  khoaDenLuc: number | null | undefined;
  /** Những câu em làm sai gần đây, kèm lời giải — phần ôn sát sườn nhất */
  cauLamSai: BankQuestion[];
  onOnXong: () => void;
  onThoat: () => void;
  dangLuu?: boolean;
}

function dinhDangConLai(ms: number): string {
  const giay = Math.max(0, Math.ceil(ms / 1000));
  const phut = Math.floor(giay / 60);
  return `${phut}:${String(giay % 60).padStart(2, '0')}`;
}

/**
 * Màn chặn sau khi học sinh dùng hết lượt mà chưa đạt.
 *
 * Hai điều kiện phải thỏa CẢ HAI mới được cấp lượt mới: hết 10 phút khóa VÀ tự
 * xác nhận đã ôn. Chỉ chờ hết giờ thì em ngồi không rồi vào đoán tiếp; chỉ bắt
 * tích ô thì em tích ngay lập tức. Ghép lại thì khoảng thời gian chờ có việc
 * để làm, và việc đó là đọc đúng bài em vừa trượt.
 */
export const ReviewGate: React.FC<Props> = ({
  bai, phan, khoaDenLuc, cauLamSai, onOnXong, onThoat, dangLuu,
}) => {
  const [conLai, setConLai] = useState<number>(() =>
    khoaDenLuc ? khoaDenLuc - Date.now() : 0);
  const [daDoc, setDaDoc] = useState(false);

  useEffect(() => {
    if (!khoaDenLuc) { setConLai(0); return; }
    const dong = () => setConLai(khoaDenLuc - Date.now());
    dong();
    const id = setInterval(dong, 1000);
    return () => clearInterval(id);
  }, [khoaDenLuc]);

  const conKhoa = conLai > 0;
  const tongKhoa = PHUT_KHOA * 60 * 1000;

  return (
    <Box>
      <Button startIcon={<ArrowLeft size={16} />} onClick={onThoat} sx={{ mb: 2 }}>
        Quay lại danh sách bài
      </Button>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <AlertTitle>Đã dùng hết {SO_LUOT_MOI_CHU_KY} lượt của phần này</AlertTitle>
        Phần <b>{TEN_PHAN[phan]}</b> của <b>{bai.title}</b> tạm khóa {PHUT_KHOA} phút.
        Em dành thời gian này đọc lại lý thuyết và cách làm bên dưới — hết giờ,
        xác nhận đã ôn là được làm lại {SO_LUOT_MOI_CHU_KY} lượt mới với đề khác.
      </Alert>

      <Paper sx={{ p: 2.5, mb: 3, textAlign: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', alignItems: 'center', mb: 1 }}>
          <Clock size={20} color={conKhoa ? 'var(--vang)' : 'var(--luc)'} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
            {conKhoa ? dinhDangConLai(conLai) : 'Đã hết thời gian khóa'}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={conKhoa ? ((tongKhoa - conLai) / tongKhoa) * 100 : 100}
          color={conKhoa ? 'warning' : 'success'}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Paper>

      {/* ── Lý thuyết cốt lõi ── */}
      <Paper sx={{ p: 2.5, mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
          <BookOpen size={20} color="var(--xanh)" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Lý thuyết cốt lõi</Typography>
        </Stack>
        {bai.summary ? (
          <Typography component="div" sx={{ whiteSpace: 'pre-line' }}>
            <NoiDungHoaHoc noiDung={bai.summary} as="div" />
          </Typography>
        ) : (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Bài này chưa có phần tóm tắt lý thuyết. Em mở mục Bài giảng để đọc
            nội dung sách giáo khoa.
          </Typography>
        )}
      </Paper>

      {/* ── Công thức ── */}
      {bai.formulae && bai.formulae.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Sigma size={20} color="var(--tim)" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Công thức cần nhớ</Typography>
          </Stack>
          <List dense>
            {bai.formulae.map((ct, i) => (
              <ListItem key={i} disableGutters>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <CheckCircle size={16} color="var(--luc)" />
                </ListItemIcon>
                <ListItemText
                  primary={<NoiDungHoaHoc noiDung={ct} />}
                  slotProps={{ primary: { component: 'div' } }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* ── Cách làm: câu hỏi thường gặp + gợi ý tư duy ── */}
      {bai.commonQuestions && bai.commonQuestions.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <Lightbulb size={20} color="var(--vang)" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Cách làm dạng bài này</Typography>
          </Stack>
          {bai.commonQuestions.map((ch, i) => (
            <Accordion key={i} disableGutters>
              <AccordionSummary expandIcon={<ChevronDown size={18} />}>
                <Typography sx={{ fontWeight: 600 }} component="div">
                  <NoiDungHoaHoc noiDung={ch.question} />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {ch.hint && (
                  <Alert severity="info" sx={{ mb: 1.5 }}>
                    <AlertTitle sx={{ fontSize: 14 }}>Hướng tư duy</AlertTitle>
                    <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                      <NoiDungHoaHoc noiDung={ch.hint} as="div" />
                    </Typography>
                  </Alert>
                )}
                <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  <NoiDungHoaHoc noiDung={ch.sampleAnswer} as="div" />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}

      {/* ── Chính những câu em làm sai ── */}
      {cauLamSai.length > 0 && (
        <Paper sx={{ p: 2.5, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Những câu em còn sai
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Đây là chỗ nên xem kỹ nhất — đề lần sau sẽ ưu tiên hỏi lại đúng
            những câu này.
          </Typography>
          {cauLamSai.map((cau, i) => (
            <Box key={cau.id} sx={{ mb: 2 }}>
              {i > 0 && <Divider sx={{ mb: 2 }} />}
              <Typography component="div" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                <NoiDungHoaHoc noiDung={cau.q} as="div" />
              </Typography>
              <Chip
                size="small"
                color="success"
                variant="outlined"
                sx={{ mb: 1 }}
                label={
                  cau.t === 'mc'
                    ? `Đáp án: ${['A', 'B', 'C', 'D'][cau.a ?? 0]}`
                    : cau.t === 'tn'
                      ? `Đáp án: ${cau.ansText ?? cau.num ?? ''}${cau.unit ? ' ' + cau.unit : ''}`
                      : `Đáp án: ${(cau.st || []).map(y => y.v ? 'Đ' : 'S').join(' ')}`
                }
              />
              {cau.e && (
                <Alert icon={<Lightbulb size={18} />} severity="info">
                  <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    <NoiDungHoaHoc noiDung={cau.e} as="div" />
                  </Typography>
                </Alert>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {/* ── Xác nhận ── */}
      <Paper sx={{ p: 2.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={daDoc}
              onChange={e => setDaDoc(e.target.checked)}
            />
          }
          label="Em đã đọc lại lý thuyết và cách làm ở trên"
        />
        <Box sx={{ mt: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            disabled={conKhoa || !daDoc || dangLuu}
            onClick={onOnXong}
          >
            {conKhoa
              ? `Chờ thêm ${dinhDangConLai(conLai)}`
              : `Ôn xong — cho em làm lại ${SO_LUOT_MOI_CHU_KY} lượt`}
          </Button>
        </Box>
        {conKhoa && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Em có thể rời trang, thời gian vẫn chạy. Quay lại khi hết giờ là làm
            tiếp được.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};
