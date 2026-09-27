import React, { useMemo, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { CheDoChuanDo, mauPhenolphthalein, pHChuanDo } from './tinhHoaHoc';

/**
 * CHUẨN ĐỘ ACID MẠNH – BASE MẠNH để tính nồng độ mol (Bài 2).
 *
 * Chế độ mặc định làm ĐÚNG như thực hành SGK Hoá 11 KNTT trang 25 (đối chiếu
 * vietjack + hoc24 ngày 27/09/2026): 10 mL HCl 0,1 M đã biết + phenolphthalein
 * trong bình tam giác; NaOH "khoảng 0,1 M" chưa biết nồng độ trong burette 25 mL;
 * dừng khi hồng nhạt bền khoảng 10 giây. Hai chế độ còn lại (chất chưa biết nằm
 * trong bình) là bài luyện thêm.
 * Màu dung dịch tính từ pH thật (tinhHoaHoc.ts), nên học sinh nhận ra điểm cuối
 * đúng như ngoài phòng thí nghiệm: một giọt quanh điểm tương đương đổi hẳn màu.
 */

const V_BINH = 10;       // mL
const C_BIET = 0.1;      // mol/L — dung dịch đã biết nồng độ
const V_BURETTE = 25;    // mL
const GIOT = 0.05;       // mL — một giọt

/* Hồng phenolphthalein là màu vật lý thật của chất chỉ thị — biến riêng trong
   index.css, giữ nguyên ở cả hai chế độ. */
const HONG = 'var(--mau-phenolphthalein)';

type CheDo = 'sgk' | 'acid-an' | 'base-an';
interface MoTa {
  nhan: string;
  hoa: CheDoChuanDo;         // chất nào trong bình: acid hay base
  binh: string; buret: string;
  an: 'binh' | 'buret';      // chất chưa biết nồng độ nằm ở đâu
  cMin: number; cMax: number;
  truoc: string; sau: string;
}
const CHE_DO: Record<CheDo, MoTa> = {
  sgk: {
    nhan: 'Theo SGK: HCl 0,1 M trong bình, NaOH chưa biết trong burette',
    hoa: 'acid-trong-binh', binh: 'HCl', buret: 'NaOH', an: 'buret',
    /* SGK: "dung dịch NaOH nồng độ khoảng 0,1 M" → thể tích tương đương 8–12,5 mL. */
    cMin: 0.08, cMax: 0.125,
    truoc: 'Dung dịch đang không màu (môi trường acid).',
    sau: 'Dừng khi dung dịch xuất hiện màu hồng nhạt bền trong khoảng 10 giây. Làm ít nhất ba lần, lấy trung bình.',
  },
  'acid-an': {
    nhan: 'Luyện thêm: HCl chưa biết trong bình, NaOH 0,1 M',
    hoa: 'acid-trong-binh', binh: 'HCl', buret: 'NaOH', an: 'binh',
    cMin: 0.05, cMax: 0.2,
    truoc: 'Dung dịch đang không màu (môi trường acid).',
    sau: 'Dừng khi dung dịch xuất hiện màu hồng nhạt bền trong khoảng 10 giây.',
  },
  'base-an': {
    nhan: 'Luyện thêm: NaOH chưa biết trong bình, HCl 0,1 M',
    hoa: 'base-trong-binh', binh: 'NaOH', buret: 'HCl', an: 'binh',
    cMin: 0.05, cMax: 0.2,
    truoc: 'Dung dịch đang có màu hồng (môi trường base).',
    sau: 'Dừng khi màu hồng vừa MẤT sau một giọt và không trở lại khi lắc.',
  },
};

const so = (x: number, d = 2) => x.toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
const nongDoMoi = (m: MoTa) => Math.round(1000 * m.cMin + Math.random() * 1000 * (m.cMax - m.cMin)) / 1000;

export const ChuanDo: React.FC<{ toanManHinh: boolean }> = ({ toanManHinh }) => {
  const [cheDo, setCheDo] = useState<CheDo>('sgk');
  const [cAn, setCAn] = useState(() => nongDoMoi(CHE_DO.sgk));
  const [v, setV] = useState(0);
  const [hienPH, setHienPH] = useState(false);
  const [vGhi, setVGhi] = useState<number | null>(null);
  const [traLoi, setTraLoi] = useState('');
  const [cham, setCham] = useState<null | { dung: boolean; c: number }>(null);

  const cd = CHE_DO[cheDo];
  /* Nồng độ trong bình và trong burette: một cái đã biết (0,1 M), một cái ẩn. */
  const cBinh = cd.an === 'binh' ? cAn : C_BIET;
  const cBuret = cd.an === 'buret' ? cAn : C_BIET;
  const pH = pHChuanDo(cd.hoa, cBinh, V_BINH, cBuret, v);
  const hong = mauPhenolphthalein(pH);
  const vTuongDuong = (cBinh * V_BINH) / cBuret;
  const quaXa = v > vTuongDuong + 0.5;
  const canTinh = cd.an === 'binh' ? cd.binh : cd.buret;

  const duongCong = useMemo(() => {
    const diem: string[] = [];
    const buoc = Math.max(GIOT, v / 400);
    for (let x = 0; x <= v + 1e-9; x += buoc) {
      const y = pHChuanDo(cd.hoa, cBinh, V_BINH, cBuret, x);
      diem.push(`${40 + (x / V_BURETTE) * 340},${190 - (Math.max(0, Math.min(14, y)) / 14) * 170}`);
    }
    return diem.join(' ');
  }, [cd.hoa, cBinh, cBuret, v]);

  const nho = (dv: number) => {
    setV(x => Math.min(V_BURETTE, Math.round((x + dv) * 100) / 100));
    setCham(null);
  };
  const lamLai = (moi: boolean, cheDoMoi: CheDo = cheDo) => {
    setCheDo(cheDoMoi);
    if (moi) setCAn(nongDoMoi(CHE_DO[cheDoMoi]));
    setV(0); setVGhi(null); setTraLoi(''); setCham(null);
  };
  const kiemTra = () => {
    const c = parseFloat(traLoi.replace(',', '.'));
    if (!isFinite(c) || c <= 0) return;
    setCham({ dung: Math.abs(c - cAn) / cAn <= 0.02, c });
  };

  /* Hình: burette 25 mL phía trên, bình tam giác phía dưới. */
  const yDinh = 20, yDay = 230;                     // vạch 0 và vạch 25 mL
  const yMat = yDinh + (v / V_BURETTE) * (yDay - yDinh);
  const chuDo = toanManHinh ? '1.1rem' : '0.9rem';

  const nutCss = {
    borderRadius: 0, fontWeight: 700, textTransform: 'none' as const,
    border: '1px solid var(--chu-dam)', color: 'var(--chu-dam)',
    fontSize: toanManHinh ? '1rem' : '0.85rem',
    '&:hover': { bgcolor: 'var(--nen-nhat)' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
        {(Object.keys(CHE_DO) as CheDo[]).map(k => {
          const dangChon = k === cheDo;
          return (
            <Button key={k} aria-pressed={dangChon} onClick={() => lamLai(true, k)}
              sx={{ ...nutCss, bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent', color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
                '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' } }}>
              {CHE_DO[k].nhan}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' }, gap: 2 }}>
        <Box>
          <Box component="svg" viewBox="0 0 300 400" role="img"
            aria-label={`Burette đã nhỏ ${so(v)} mL, dung dịch trong bình ${hong > 0.05 ? 'màu hồng' : 'không màu'}`}
            sx={{ width: '100%', maxHeight: toanManHinh ? '66vh' : 380, display: 'block', bgcolor: 'var(--nen-rat-nhat)', border: '1px solid var(--vien)' }}>
            {/* Burette */}
            <rect x={138} y={yDinh - 6} width={24} height={yDay - yDinh + 6} fill="var(--nen-the)" stroke="var(--chu-dam)" strokeWidth={2} />
            <rect x={140} y={yMat} width={20} height={yDay - yMat} fill="var(--nen-xanh-nhat)" />
            <line x1={140} y1={yMat} x2={160} y2={yMat} stroke="var(--xanh)" strokeWidth={2} />
            {Array.from({ length: 26 }, (_, i) => {
              const y = yDinh + (i / V_BURETTE) * (yDay - yDinh);
              const lon = i % 5 === 0;
              return (
                <g key={i}>
                  <line x1={162} y1={y} x2={lon ? 172 : 167} y2={y} stroke="var(--chu-dam)" strokeWidth={1} />
                  {lon && <text x={176} y={y + 4} fontSize={10} fill="var(--chu)">{i}</text>}
                </g>
              );
            })}
            <text x={118} y={yDinh + 4} textAnchor="end" fontSize={11} fill="var(--chu)">{cd.buret}</text>
            <text x={118} y={yDinh + 18} textAnchor="end" fontSize={11} fill="var(--chu)">{cd.an === 'buret' ? 'chưa biết C' : '0,100 M'}</text>
            {/* Khoá burette + đầu nhỏ giọt */}
            <polygon points={`140,${yDay} 160,${yDay} 153,${yDay + 16} 147,${yDay + 16}`} fill="var(--nen-the)" stroke="var(--chu-dam)" strokeWidth={2} />
            <rect x={132} y={yDay + 6} width={36} height={6} fill="var(--chu-dam)" />
            <line x1={150} y1={yDay + 16} x2={150} y2={yDay + 30} stroke="var(--chu-dam)" strokeWidth={2} />

            {/* Bình tam giác */}
            <path d="M136 282 L136 300 L92 382 L208 382 L164 300 L164 282" fill="none" stroke="var(--chu-dam)" strokeWidth={2.5} />
            <path d="M109 350 L191 350 L208 382 L92 382 Z" fill="var(--nen-xanh-nhat)" fillOpacity={0.6} />
            <path d="M109 350 L191 350 L208 382 L92 382 Z" fill={HONG} fillOpacity={hong * 0.75} />
            <text x={150} y={397} textAnchor="middle" fontSize={11} fill="var(--chu)">
              {so(V_BINH)} mL {cd.binh} {cd.an === 'binh' ? '(chưa biết C)' : '0,100 M'} + phenolphthalein
            </text>
          </Box>
        </Box>

        <Box>
          <Box sx={{ border: '1px solid var(--chu-dam)', p: 1.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)' }}>
              Thể tích đã nhỏ từ burette
            </Typography>
            <Typography sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 800, fontSize: toanManHinh ? '2.4rem' : '1.8rem', color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums' }}>
              {so(v)} mL
            </Typography>
            {hienPH && (
              <Typography sx={{ fontWeight: 700, color: 'var(--chu)', fontVariantNumeric: 'tabular-nums', fontSize: chuDo }}>
                Máy đo: pH = {so(pH)}
              </Typography>
            )}
            <Typography sx={{ color: 'var(--chu-dam)', fontSize: chuDo, mt: 0.5 }}>
              {v === 0 ? cd.truoc : cd.sau}
            </Typography>
            {quaXa && (
              <Typography sx={{ color: 'var(--tin-hieu)', fontWeight: 700, fontSize: chuDo, mt: 0.5 }}>
                Đã nhỏ quá điểm cuối khá xa — thể tích đọc được sẽ lệch. Bấm "Làm lại lượt này".
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
            <Button sx={nutCss} onClick={() => nho(1)} disabled={v >= V_BURETTE}>+1 mL</Button>
            <Button sx={nutCss} onClick={() => nho(0.1)} disabled={v >= V_BURETTE}>+0,1 mL</Button>
            <Button sx={nutCss} onClick={() => nho(GIOT)} disabled={v >= V_BURETTE}>+1 giọt (0,05 mL)</Button>
            <Button sx={nutCss} onClick={() => lamLai(false)}>Làm lại lượt này</Button>
            <Button sx={nutCss} onClick={() => lamLai(true)}>Lượt mới</Button>
            <Button sx={nutCss} onClick={() => setHienPH(x => !x)} aria-pressed={hienPH}>
              {hienPH ? 'Ẩn máy đo pH' : 'Hiện máy đo pH'}
            </Button>
          </Box>

          <Box sx={{ border: '1px solid var(--chu-dam)', p: 1.5, mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mb: 1 }}>
              Tính nồng độ {canTinh}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button sx={nutCss} onClick={() => setVGhi(v)} disabled={v === 0}>Ghi thể tích điểm cuối</Button>
              {vGhi !== null && (
                <Typography sx={{ fontWeight: 700, color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums', fontSize: chuDo }}>
                  V({cd.buret}) = {so(vGhi)} mL
                </Typography>
              )}
            </Box>
            {vGhi !== null && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  label={`C(${canTinh}), mol/L`}
                  value={traLoi}
                  onChange={e => { setTraLoi(e.target.value); setCham(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') kiemTra(); }}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                  sx={{ width: 170, '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
                <Button onClick={kiemTra}
                  sx={{ borderRadius: 0, fontWeight: 700, bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)', '&:hover': { bgcolor: 'var(--nen-dam)' } }}>
                  Kiểm tra
                </Button>
              </Box>
            )}
            {cham && vGhi !== null && (
              <Box sx={{ mt: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: cham.dung ? 'var(--luc-tham)' : 'var(--tin-hieu)', fontSize: chuDo }}>
                  {cham.dung ? 'Đúng!' : 'Chưa đúng — xem lại phép tính.'} Nồng độ thật: {so(cAn, 3)} M.
                </Typography>
                <Typography component="div" sx={{ color: 'var(--chu-dam)', fontSize: chuDo, lineHeight: 1.7, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
                  <div>HCl + NaOH → NaCl + H₂O (tỉ lệ mol 1 : 1)</div>
                  {cd.an === 'buret' ? (
                    <>
                      <div>n({cd.binh}) = {so(C_BIET, 3)} × {so(V_BINH / 1000, 3)} = {so((C_BIET * V_BINH) / 1000, 6)} mol</div>
                      <div>n({cd.buret}) = n({cd.binh}) = {so((C_BIET * V_BINH) / 1000, 6)} mol</div>
                      <div>C({cd.buret}) = {so((C_BIET * V_BINH) / 1000, 6)} : {so(vGhi / 1000, 5)} = {so((C_BIET * V_BINH) / vGhi, 4)} M</div>
                    </>
                  ) : (
                    <>
                      <div>n({cd.buret}) = {so(C_BIET, 3)} × {so(vGhi / 1000, 5)} = {so((C_BIET * vGhi) / 1000, 6)} mol</div>
                      <div>n({cd.binh}) = n({cd.buret}) = {so((C_BIET * vGhi) / 1000, 6)} mol</div>
                      <div>C({cd.binh}) = {so((C_BIET * vGhi) / 1000, 6)} : {so(V_BINH / 1000, 3)} = {so((C_BIET * vGhi) / V_BINH, 4)} M</div>
                    </>
                  )}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mb: 0.5 }}>
            Đường chuẩn độ (pH theo thể tích đã nhỏ)
          </Typography>
          <Box component="svg" viewBox="0 0 400 220" role="img" aria-label="Đồ thị pH theo thể tích dung dịch chuẩn đã nhỏ"
            sx={{ width: '100%', maxHeight: toanManHinh ? '26vh' : 200, display: 'block', border: '1px solid var(--vien)', bgcolor: 'var(--nen-the)' }}>
            <line x1={40} y1={20} x2={40} y2={190} stroke="var(--chu-dam)" />
            <line x1={40} y1={190} x2={380} y2={190} stroke="var(--chu-dam)" />
            {[0, 7, 14].map(p => (
              <g key={p}>
                <line x1={36} y1={190 - (p / 14) * 170} x2={380} y2={190 - (p / 14) * 170} stroke="var(--vien)" strokeDasharray={p === 7 ? '4 3' : undefined} />
                <text x={32} y={194 - (p / 14) * 170} textAnchor="end" fontSize={10} fill="var(--chu)">{p}</text>
              </g>
            ))}
            {[0, 5, 10, 15, 20, 25].map(x => (
              <text key={x} x={40 + (x / V_BURETTE) * 340} y={204} textAnchor="middle" fontSize={10} fill="var(--chu)">{x}</text>
            ))}
            <text x={380} y={216} textAnchor="end" fontSize={10} fill="var(--chu)">V (mL)</text>
            <text x={8} y={16} fontSize={10} fill="var(--chu)">pH</text>
            {v > 0 && <polyline points={duongCong} fill="none" stroke="var(--xanh)" strokeWidth={2} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
