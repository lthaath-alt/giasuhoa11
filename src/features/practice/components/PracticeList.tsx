import React from 'react';
import {
  Box, Paper, Typography, Button, Chip, Stack, Tooltip, LinearProgress,
  Divider,
} from '@mui/material';
import { Lock, CheckCircle, Clock, PlayCircle, BookOpen, AlertCircle } from 'lucide-react';
import { Chapter, Lesson } from '../../lessons/types';
import {
  PhanLuyenTap, THU_TU_PHAN, TEN_PHAN_NGAN, TienDoLuyenTap, TrangThaiPhan,
  SO_CAU_MOI_LUOT, NGUONG_DAT,
} from '../types';
import {
  BangDemCau, demCuaBai, trangThaiPhan, baiDaXong, moTaThieuCau, soLuotKhacNhau,
} from '../practiceService';

interface Props {
  curriculum: Chapter[];
  bangDem: BangDemCau;
  tienDo: TienDoLuyenTap;
  onChon: (bai: Lesson, phan: PhanLuyenTap) => void;
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

export const PracticeList: React.FC<Props> = ({ curriculum, bangDem, tienDo, onChon }) => {
  const tatCaBai = curriculum.flatMap(c => c.lessons);
  const soXong = tatCaBai.filter(b => baiDaXong(tienDo[b.id])).length;
  const soMoDuoc = tatCaBai.filter(b => {
    const dem = demCuaBai(bangDem, b.id);
    return THU_TU_PHAN.some(p => trangThaiPhan(p, tienDo[b.id], dem) !== 'thieu-cau');
  }).length;

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
          Đã hoàn thành <b>{soXong}</b>/{tatCaBai.length} bài · {soMoDuoc} bài đang mở
        </Typography>
      </Paper>

      {soMoDuoc === 0 && (
        <Box sx={{ mb: 3 }}>
          <Paper sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="var(--vang)" />
              <Box>
                <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Ngân hàng câu hỏi chưa đủ để mở bài nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mỗi phần cần tối thiểu {SO_CAU_MOI_LUOT.mc} câu nhiều lựa chọn,{' '}
                  {SO_CAU_MOI_LUOT.tf} câu đúng sai và {SO_CAU_MOI_LUOT.tn} câu trả
                  lời ngắn. Thầy cô bổ sung câu vào mục Ngân hàng dữ liệu là các
                  bài tự mở, không cần chỉnh gì thêm.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      )}

      {curriculum.map(chuong => (
        <Box key={chuong.id} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
            {chuong.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Stack spacing={1.5}>
            {chuong.lessons.map(bai => {
              const dem = demCuaBai(bangDem, bai.id);
              const xong = baiDaXong(tienDo[bai.id]);
              const thieu = moTaThieuCau(dem);

              return (
                <Paper
                  key={bai.id}
                  sx={{
                    p: 2,
                    borderLeft: `4px solid ${xong ? 'var(--luc)' : 'var(--vien)'}`,
                    opacity: thieu && !xong ? 0.75 : 1,
                  }}
                >
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
                      {thieu && (
                        <Typography variant="caption" color="text.secondary">
                          Đang bổ sung câu hỏi — {thieu}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {THU_TU_PHAN.map(phan => {
                        const tt = trangThaiPhan(phan, tienDo[bai.id], dem);
                        const bamDuoc = tt === 'san-sang' || tt === 'dang-khoa'
                          || tt === 'can-on-lai' || tt === 'da-dat';
                        const soLuot = soLuotKhacNhau(dem[phan], phan);

                        return (
                          <Tooltip
                            key={phan}
                            title={
                              <span>
                                {GIAI_THICH[tt]}
                                <br />
                                Kho có {dem[phan]} câu
                                {soLuot > 0 && ` — đủ ${soLuot} lượt khác nhau`}
                              </span>
                            }
                          >
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
