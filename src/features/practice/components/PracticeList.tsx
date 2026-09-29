import React from 'react';
import {
  Box, Paper, Typography, Button, Chip, Stack, Tooltip, LinearProgress,
  Divider,
} from '@mui/material';
import { Lock, CheckCircle, Clock, PlayCircle, BookOpen, Gamepad2 } from 'lucide-react';
import { Chapter, Lesson } from '../../lessons/types';
import {
  PhanLuyenTap, THU_TU_PHAN, TEN_PHAN_NGAN, TienDoLuyenTap, TrangThaiPhan,
  SO_CAU_MOI_LUOT, NGUONG_DAT,
} from '../types';
import {
  trangThaiPhan, baiDaXong,
} from '../practiceService';

interface Props {
  curriculum: Chapter[];
  tienDo: TienDoLuyenTap;
  onChon: (bai: Lesson, phan: PhanLuyenTap) => void;
  /** Mở trò chơi ôn đúng bài này. Không truyền thì không hiện nút. */
  onChoiOn?: (bai: Lesson, chiSoBai: number) => void;
}

const MAU: Record<TrangThaiPhan, 'inherit' | 'success' | 'warning' | 'error' | 'primary'> = {
  'da-dat': 'success',
  'san-sang': 'primary',
  'dang-khoa': 'warning',
  'can-on-lai': 'warning',
  'chua-mo': 'inherit',
  'thieu-cau': 'inherit',
};

const GIAI_THICH: Record<TrangThaiPhan, string> = {
  'da-dat': 'Em đã qua phần này',
  'san-sang': 'Bấm để làm',
  'dang-khoa': 'Đang khóa — em đã dùng hết lượt, bấm để xem thời gian còn lại',
  'can-on-lai': 'Cần ôn lại bài rồi mới làm tiếp được',
  'chua-mo': 'Phải qua phần trước đã',
  'thieu-cau': 'Ngân hàng chưa đủ câu cho phần này',
};

/* Danh sách này CỐ Ý không biết ngân hàng có bao nhiêu câu.
   Biết được thì phải tải cả 1.554 câu ngay lúc mở tab = 1.554 lượt đọc
   Firestore cho mỗi em mỗi phiên, mà bậc miễn phí chỉ có 50.000 lượt/ngày —
   một lớp 40 em mở cùng một tiết là vỡ hạn mức.
   Nên mọi trạng thái ở đây tính bằng TIẾN ĐỘ trong localStorage. Riêng
   "thiếu câu" thì chỉ xác định được sau khi hỏi Firestore, nên nó được để
   dành tới lúc em bấm vào một phần — xem `chonPhan` trong PracticeSection. */
export const PracticeList: React.FC<Props> = ({ curriculum, tienDo, onChon, onChoiOn }) => {
  /* Thứ tự bài trong cả chương trình (0-24) — "Rắn và Thang" có 25 màn ứng
     đúng 25 bài nên màn của bài này chính là thứ tự đó cộng một. */
  const thuTuBai = new Map(curriculum.flatMap(c => c.lessons).map((l, i) => [l.id, i]));
  const tatCaBai = curriculum.flatMap(c => c.lessons);
  const soXong = tatCaBai.filter(b => baiDaXong(tienDo[b.id])).length;

  return (
    <Box>
      <Paper sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Luyện tập theo bài
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Mỗi bài có 3 phần, làm lần lượt: {SO_CAU_MOI_LUOT.mc} câu nhiều lựa chọn →{' '}
          {SO_CAU_MOI_LUOT.tf} câu đúng sai → {SO_CAU_MOI_LUOT.tn} câu trả lời ngắn.
          Đạt <b>{Math.round(NGUONG_DAT * 100)}%</b> một phần mới mở phần kế tiếp.
          Các bài không khóa nhau, em chọn bài nào cũng được.
        </Typography>
        <LinearProgress
          variant="determinate"
          value={tatCaBai.length ? (soXong / tatCaBai.length) * 100 : 0}
          sx={{ height: 8, borderRadius: 4, mb: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          Đã hoàn thành <b>{soXong}</b>/{tatCaBai.length} bài
        </Typography>
      </Paper>

      {curriculum.map(chuong => (
        <Box key={chuong.id} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
            {chuong.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            {chuong.lessons.map(bai => {
              const xong = baiDaXong(tienDo[bai.id]);

              return (
                /* Không viền trái màu dày (DESIGN.md cấm): bài xong đã có dấu
                   ✓ màu lục ngay cạnh tên. */
                <Paper key={bai.id} sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1.5}
                    sx={{
                      alignItems: { xs: 'stretch', md: 'center' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {xong
                          ? <CheckCircle size={18} color="var(--luc)" />
                          : <BookOpen size={18} color="var(--chu-mo)" />}
                        <Typography sx={{ fontWeight: 600 }}>{bai.title}</Typography>
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {THU_TU_PHAN.map(phan => {
                        /* Không truyền số câu: danh sách chưa hỏi Firestore nên
                           chưa biết, và `trangThaiPhan` khi đó không bao giờ
                           trả 'thieu-cau'. Xem chú thích ở đầu tệp. */
                        const tt = trangThaiPhan(phan, tienDo[bai.id]);
                        const bamDuoc = tt === 'san-sang' || tt === 'dang-khoa'
                          || tt === 'can-on-lai' || tt === 'da-dat';

                        return (
                          <Tooltip key={phan} title={GIAI_THICH[tt]}>
                            <span>
                              <Button
                                size="small"
                                variant={tt === 'san-sang' ? 'contained' : 'outlined'}
                                color={MAU[tt]}
                                disabled={!bamDuoc}
                                onClick={() => onChon(bai, phan)}
                                startIcon={
                                  tt === 'da-dat' ? <CheckCircle size={14} />
                                    : tt === 'san-sang' ? <PlayCircle size={14} />
                                      : tt === 'dang-khoa' || tt === 'can-on-lai' ? <Clock size={14} />
                                        : <Lock size={14} />
                                }
                                sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                              >
                                {TEN_PHAN_NGAN[phan]}
                              </Button>
                            </span>
                          </Tooltip>
                        );
                      })}

                      {/* Ôn bằng trò chơi: cùng câu hỏi của bài này, chỉ khác
                          cách hỏi. Đặt cạnh ba phần luyện tập để em thấy nó là
                          một lối ôn nữa, không phải mục giải trí ở tab khác. */}
                      {onChoiOn && (
                        <Tooltip title={`Ôn bài này bằng trò chơi — màn ${(thuTuBai.get(bai.id) ?? 0) + 1}`}>
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => onChoiOn(bai, thuTuBai.get(bai.id) ?? 0)}
                            startIcon={<Gamepad2 size={14} />}
                            sx={{
                              textTransform: 'none',
                              whiteSpace: 'nowrap',
                              /* Phải TÔ NỀN, đừng để viền suông. Hai nút phần sau
                                 khi chưa mở cũng là "viền mảnh, nền trắng", nên nút
                                 này để mặc định trông y như một nút đang bị khoá —
                                 đo 20/09/2026: viền của nó là lục mờ 50%, còn nút bị
                                 khoá là xám mờ 12%, mắt không phân biệt được ở cỡ
                                 nhỏ. Nền lục nhạt + viền đặc thì nhìn phát biết là
                                 bấm được.
                                 KHÔNG dùng đỏ tín hiệu: đỏ chỉ dành cho hành động
                                 chính, mà hành động chính của hàng này là nút phần
                                 luyện tập kế tiếp. */
                              color: 'var(--luc-tham)',
                              borderColor: 'var(--luc-tham)',
                              backgroundColor: 'var(--nen-luc-nhat)',
                              '&:hover': {
                                borderColor: 'var(--luc-tham)',
                                backgroundColor: 'var(--luc-tham-nen)',
                                color: 'var(--chu-nguoc)',
                              },
                            }}
                          >
                            Chơi để ôn
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  {/* Điểm cao nhất từng phần, chỉ hiện khi em đã làm */}
                  {THU_TU_PHAN.some(p => (tienDo[bai.id]?.[p]?.soLuotDaLam || 0) > 0
                                          || tienDo[bai.id]?.[p]?.dat) && (
                    <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                      {THU_TU_PHAN.map(p => {
                        const td = tienDo[bai.id]?.[p];
                        if (!td || (!td.dat && !td.soLuotDaLam)) return null;
                        return (
                          <Chip
                            key={p}
                            size="small"
                            variant="outlined"
                            color={td.dat ? 'success' : 'default'}
                            label={`${TEN_PHAN_NGAN[p]}: ${Math.round((td.tiLeCaoNhat || 0) * 100)}%`}
                          />
                        );
                      })}
                    </Stack>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Box>
  );
};
