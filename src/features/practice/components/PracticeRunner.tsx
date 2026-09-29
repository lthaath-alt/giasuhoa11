import React, { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Radio, RadioGroup, FormControlLabel,
  FormControl, TextField, Divider, Alert, AlertTitle, Chip, Stack,
  LinearProgress, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { ArrowLeft, CheckCircle, XCircle, Send, Lightbulb } from 'lucide-react';
import { BankQuestion } from '../../bank/types';
import {
  PhanLuyenTap, TEN_PHAN, NGUONG_DAT, TienDoPhan, KetQuaLuot, DIEM_DUNG_SAI,
} from '../types';
import { chamLuot, TraLoi, capNhatSauLuot, soLuotConLai } from '../practiceService';
import { NoiDungHoaHoc } from './NoiDungHoaHoc';

interface Props {
  tenBai: string;
  phan: PhanLuyenTap;
  cauHoi: BankQuestion[];
  tienDo: TienDoPhan;
  /** Gọi khi học sinh nộp bài — cha lo ghi Firestore */
  onNop: (tienDoMoi: TienDoPhan, ketQua: KetQuaLuot) => void;
  /** Làm lại lượt mới (cha rút bộ câu khác) */
  onLamLai: () => void;
  onThoat: () => void;
  dangLuu?: boolean;
  loiLuu?: string | null;
}

const KY_TU = ['A', 'B', 'C', 'D'];

export const PracticeRunner: React.FC<Props> = ({
  tenBai, phan, cauHoi, tienDo, onNop, onLamLai, onThoat, dangLuu, loiLuu,
}) => {
  const [traLoi, setTraLoi] = useState<Record<string, TraLoi>>({});
  const [ketQua, setKetQua] = useState<KetQuaLuot | null>(null);
  /* Tiến độ ĐÃ tính cả lượt vừa nộp. Đếm lượt còn lại theo nó, không theo prop
     `tienDo`: cha cập nhật prop ngay khi nộp (ghi lạc quan), nên lấy prop trừ
     thêm 1 là trừ hai lần — lượt thứ 3 sai đã báo "hết lượt" dù còn lượt 4. */
  const [tienDoSau, setTienDoSau] = useState<TienDoPhan | null>(null);

  const daNop = ketQua !== null;

  /* Đếm câu đã trả lời để hiện thanh tiến độ. Câu đúng/sai chỉ tính là xong
     khi học sinh đã chọn ĐỦ 4 ý — trả lời nửa vời mà thanh báo xong thì em
     tưởng đã làm hết rồi nộp, mất điểm oan. */
  const soDaLam = useMemo(() => cauHoi.filter(c => {
    const t = traLoi[c.id];
    if (phan === 'tf') {
      const y = c.st || [];
      return Array.isArray(t) && y.every((_, i) => t[i] === true || t[i] === false);
    }
    if (phan === 'tn') return typeof t === 'string' && t.trim() !== '';
    return typeof t === 'number';
  }).length, [traLoi, cauHoi, phan]);

  const nop = () => {
    const kq = chamLuot(cauHoi, traLoi);
    const sau = capNhatSauLuot(tienDo, cauHoi, kq);
    setKetQua(kq);
    setTienDoSau(sau);
    onNop(sau, kq);
  };

  const ketQuaCau = (cauId: string) =>
    ketQua?.chiTiet.find(r => r.cauId === cauId);

  const conLaiSauLuotNay = tienDoSau ? soLuotConLai(tienDoSau) : soLuotConLai(tienDo) - 1;

  return (
    <Box>
      <Button startIcon={<ArrowLeft size={16} />} onClick={onThoat} sx={{ mb: 2 }}>
        Quay lại danh sách bài
      </Button>

      <Paper sx={{ p: 2.5, mb: 3, borderLeft: '4px solid var(--xanh)' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{tenBai}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {TEN_PHAN[phan]} — {cauHoi.length} câu · cần đạt {Math.round(NGUONG_DAT * 100)}%
        </Typography>

        {!daNop && (
          <>
            <LinearProgress
              variant="determinate"
              value={(soDaLam / cauHoi.length) * 100}
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              Đã làm {soDaLam}/{cauHoi.length} câu
              {' · '}còn {soLuotConLai(tienDo)} lượt trong chu kỳ này
            </Typography>
          </>
        )}
      </Paper>

      {phan === 'tf' && !daNop && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Mỗi câu có 4 ý, chấm theo thang của Bộ GD&amp;ĐT: đúng 1 ý được 0,1 điểm ·
          2 ý được 0,25 · 3 ý được 0,5 · đúng cả 4 ý mới được trọn 1 điểm.
          Ý bỏ trống tính là sai.
        </Alert>
      )}

      {cauHoi.map((cau, idx) => {
        const kq = ketQuaCau(cau.id);
        return (
          <Paper
            key={cau.id}
            sx={{
              p: 2.5, mb: 2,
              borderLeft: kq
                ? `4px solid ${kq.dung ? 'var(--luc)' : 'var(--do)'}`
                : '4px solid transparent',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
              <Chip label={`Câu ${idx + 1}`} size="small" color="primary" />
              {kq && (
                <Chip
                  size="small"
                  color={kq.dung ? 'success' : 'error'}
                  icon={kq.dung ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  label={
                    phan === 'tf'
                      ? `${kq.soYDung}/4 ý đúng — ${kq.diem.toFixed(2)} điểm`
                      : kq.dung ? 'Đúng' : 'Sai'
                  }
                />
              )}
            </Stack>

            <Typography component="div" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              <NoiDungHoaHoc noiDung={cau.q} as="div" />
            </Typography>

            {cau.img && (
              <Box
                component="img"
                src={cau.img}
                alt=""
                sx={{ maxWidth: '100%', mb: 2, borderRadius: 1 }}
              />
            )}

            {/* ── Nhiều lựa chọn ── */}
            {phan === 'mc' && (
              <FormControl disabled={daNop}>
                <RadioGroup
                  value={typeof traLoi[cau.id] === 'number' ? traLoi[cau.id] : ''}
                  onChange={e =>
                    setTraLoi(p => ({ ...p, [cau.id]: Number(e.target.value) }))
                  }
                >
                  {(cau.o || []).map((pa, i) => (
                    <FormControlLabel
                      key={i}
                      value={i}
                      control={<Radio size="small" />}
                      sx={{
                        ...(daNop && i === cau.a
                          ? { bgcolor: 'rgba(76,175,80,0.12)', borderRadius: 1 }
                          : {}),
                      }}
                      label={
                        <span>
                          <b>{KY_TU[i]}.</b> <NoiDungHoaHoc noiDung={pa} />
                          {daNop && i === cau.a && ' ✓'}
                        </span>
                      }
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            {/* ── Đúng/Sai: 4 ý, chấm từng ý ── */}
            {phan === 'tf' && (
              <Stack spacing={1}>
                {(cau.st || []).map((y, i) => {
                  const dap = traLoi[cau.id];
                  const chon = Array.isArray(dap) ? dap[i] : null;
                  const sai = daNop && chon !== y.v;
                  return (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex', gap: 1.5, alignItems: 'center',
                        flexWrap: 'wrap',
                        p: 1, borderRadius: 1,
                        bgcolor: daNop
                          ? sai ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)'
                          : 'transparent',
                      }}
                    >
                      <Typography sx={{ flex: 1, minWidth: 200 }} component="div">
                        <b>{String.fromCharCode(97 + i)})</b>{' '}
                        <NoiDungHoaHoc noiDung={y.s} />
                      </Typography>
                      <ToggleButtonGroup
                        size="small"
                        exclusive
                        disabled={daNop}
                        value={chon === null || chon === undefined ? null : chon}
                        onChange={(_, giaTri) => {
                          if (giaTri === null) return;   // không cho bỏ chọn
                          setTraLoi(p => {
                            const cu = Array.isArray(p[cau.id])
                              ? [...(p[cau.id] as (boolean | null)[])]
                              : new Array((cau.st || []).length).fill(null);
                            cu[i] = giaTri;
                            return { ...p, [cau.id]: cu };
                          });
                        }}
                      >
                        <ToggleButton value={true} color="success">Đúng</ToggleButton>
                        <ToggleButton value={false} color="error">Sai</ToggleButton>
                      </ToggleButtonGroup>
                      {daNop && (
                        <Chip
                          size="small"
                          variant="outlined"
                          color={sai ? 'error' : 'success'}
                          label={`Đáp án: ${y.v ? 'Đúng' : 'Sai'}`}
                        />
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}

            {/* ── Trả lời ngắn ── */}
            {phan === 'tn' && (
              <Box>
                <TextField
                  size="small"
                  disabled={daNop}
                  label="Đáp án"
                  placeholder="Ví dụ: 2,479"
                  value={typeof traLoi[cau.id] === 'string' ? traLoi[cau.id] as string : ''}
                  onChange={e => setTraLoi(p => ({ ...p, [cau.id]: e.target.value }))}
                  slotProps={cau.unit
                    ? { input: { endAdornment: <span>{cau.unit}</span> } }
                    : undefined}
                  sx={{ maxWidth: 260 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Gõ dấu phẩy hay dấu chấm thập phân đều được
                  {typeof cau.tol === 'number' && cau.tol > 0
                    ? ` · chấp nhận sai số ±${String(cau.tol).replace('.', ',')}`
                    : ''}
                </Typography>
                {daNop && (
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    color={kq?.dung ? 'success' : 'error'}
                    label={`Đáp án đúng: ${cau.ansText ?? cau.num ?? ''}${cau.unit ? ' ' + cau.unit : ''}`}
                  />
                )}
              </Box>
            )}

            {/* ── Lời giải, chỉ hiện sau khi nộp ── */}
            {daNop && cau.e && (
              <Alert
                icon={<Lightbulb size={18} />}
                severity="info"
                sx={{ mt: 2 }}
              >
                <AlertTitle sx={{ fontSize: 14 }}>Giải thích</AlertTitle>
                <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  <NoiDungHoaHoc noiDung={cau.e} as="div" />
                </Typography>
              </Alert>
            )}
          </Paper>
        );
      })}

      <Divider sx={{ my: 3 }} />

      {loiLuu && <Alert severity="error" sx={{ mb: 2 }}>{loiLuu}</Alert>}

      {!daNop ? (
        <Button
          variant="contained"
          size="large"
          startIcon={<Send size={18} />}
          onClick={nop}
          disabled={soDaLam === 0}
        >
          Nộp bài ({soDaLam}/{cauHoi.length} câu đã làm)
        </Button>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Alert severity={ketQua.dat ? 'success' : 'warning'} sx={{ mb: 2 }}>
            <AlertTitle>
              {ketQua.dat ? 'Đạt — em đã qua phần này' : 'Chưa đạt'}
            </AlertTitle>
            Được <b>{ketQua.diem.toFixed(2)}</b>/{ketQua.toiDa} điểm ={' '}
            <b>{Math.round(ketQua.tiLe * 100)}%</b>
            {' '}(cần {Math.round(NGUONG_DAT * 100)}%).
            {!ketQua.dat && conLaiSauLuotNay > 0 && (
              <> Em còn <b>{conLaiSauLuotNay}</b> lượt làm lại, đề sẽ ra câu khác.</>
            )}
            {!ketQua.dat && conLaiSauLuotNay <= 0 && (
              <> Em đã dùng hết lượt. Phần này tạm khóa, em cần ôn lại bài rồi
                 mới làm tiếp được.</>
            )}
          </Alert>

          <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {!ketQua.dat && conLaiSauLuotNay > 0 && (
              <Button variant="contained" onClick={onLamLai} disabled={dangLuu}>
                Làm lại với đề khác
              </Button>
            )}
            <Button variant={ketQua.dat ? 'contained' : 'outlined'} onClick={onThoat}>
              {ketQua.dat ? 'Về danh sách để học phần tiếp theo' : 'Quay lại danh sách bài'}
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

/** Điểm tối đa của thang đúng/sai — dùng cho phần chú thích ở nơi khác */
export const DIEM_TOI_DA_DUNG_SAI = DIEM_DUNG_SAI[DIEM_DUNG_SAI.length - 1];
