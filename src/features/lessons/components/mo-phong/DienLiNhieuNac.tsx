import React, { useState } from 'react';
import { Box, Button, Slider, Typography } from '@mui/material';
import { ACID_NHIEU_NAC, AcidNhieuNac, tinhNhieuNac } from './tinhHoaHoc';
import { DienLiNhieuNac3D } from './DienLiNhieuNac3D';

/**
 * ĐIỆN LI NHIỀU NẤC — H₂SO₄, H₂SO₃, H₂CO₃, H₃PO₄.
 *
 * Nồng độ từng tiểu phân tính thật từ các Ka (tinhHoaHoc.ts), không vẽ tay: kéo
 * nồng độ là thấy nấc sau điện li nhiều hơn khi pha loãng. Nội dung vượt SGK
 * KNTT (Ka, tính nấc 2) nên gắn nhãn mở rộng, chờ giáo viên duyệt.
 */

const SO_MU: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

/** 8,44·10⁻³ — dạng khoa học viết theo lối Việt. */
function khoaHoc(x: number, chuSo = 3): string {
  if (x === 0) return '0';
  if (x >= 0.01 && x < 1000) return x.toLocaleString('vi-VN', { maximumSignificantDigits: chuSo });
  const mu = Math.floor(Math.log10(x));
  const dinh = x / 10 ** mu;
  return `${dinh.toLocaleString('vi-VN', { maximumSignificantDigits: chuSo })}·10${String(mu).split('').map(k => SO_MU[k]).join('')}`;
}
const phanTram = (x: number) => (x >= 0.001 ? `${(x * 100).toLocaleString('vi-VN', { maximumSignificantDigits: 3 })} %` : `${khoaHoc(x * 100, 2)} %`);
const CHI_SO = ['₁', '₂', '₃'];

const LOG_MIN = -12;   // thanh đo: 10⁻¹² … 1 mol/L

export const DienLiNhieuNac: React.FC<{ toanManHinh: boolean }> = ({ toanManHinh }) => {
  const [acid, setAcid] = useState<AcidNhieuNac>(ACID_NHIEU_NAC[0]);
  const [logC, setLogC] = useState(-1);   // 0,1 M

  const c = 10 ** logC;
  const kq = tinhNhieuNac(acid, c);
  const chu = toanManHinh ? '1.1rem' : '0.92rem';
  const chon = (a: AcidNhieuNac) => {
    setAcid(a);
    setLogC(Math.max(Math.log10(a.cMin), Math.min(Math.log10(a.cMax), logC)));
  };

  const hang = [
    ...acid.tieuPhan.map((t, i) => ({ nhan: t, gt: kq.nongDo[i], bo: acid.nac1HoanToan && i === 0 })),
    { nhan: 'H⁺', gt: kq.h, bo: false },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5, alignItems: 'center' }}>
        {ACID_NHIEU_NAC.map(a => {
          const dangChon = a.id === acid.id;
          return (
            <Button key={a.id} aria-pressed={dangChon} onClick={() => chon(a)}
              sx={{ borderRadius: 0, fontWeight: 800, textTransform: 'none', fontSize: toanManHinh ? '1.1rem' : '0.9rem',
                border: '1px solid var(--chu-dam)',
                bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent',
                color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
                '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' } }}>
              {a.ct}
            </Button>
          );
        })}
        {acid.moRong && (
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--chu-tren-vang)', bgcolor: 'var(--vang-nen)', px: 1, py: 0.25 }}>
            Mở rộng – nâng cao · chờ giáo viên duyệt
          </Typography>
        )}
      </Box>

      {/* Quá trình điện li diễn ra trước mắt; bảng số liệu bên dưới là cùng
          một phép tính, cho con số chính xác. */}
      <Box sx={{ mb: 2 }}>
        <DienLiNhieuNac3D acid={acid} c={c} toanManHinh={toanManHinh} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.3rem' : '1.05rem' }}>
            {acid.ct} <Box component="span" sx={{ fontWeight: 500, color: 'var(--chu)' }}>— {acid.ten}</Box>
          </Typography>

          <Box sx={{ border: '1px solid var(--chu-dam)', mt: 1 }}>
            {acid.ka.map((ka, i) => {
              const hoanToan = acid.nac1HoanToan && i === 0;
              return (
                <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline', flexWrap: 'wrap', px: 1.5, py: 1, borderTop: i ? '1px solid var(--vien)' : 'none' }}>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--chu)', width: 48 }}>
                    Nấc {i + 1}
                  </Typography>
                  <Typography sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 700, color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.35rem' : '1.05rem', flexGrow: 1 }}>
                    {acid.tieuPhan[i]} {hoanToan ? '→' : '⇌'} H⁺ + {acid.tieuPhan[i + 1]}
                  </Typography>
                  <Typography sx={{ fontSize: chu, color: 'var(--chu)', fontVariantNumeric: 'tabular-nums' }}>
                    {hoanToan ? 'hoàn toàn' : `Ka${CHI_SO[i]} = ${khoaHoc(ka, 2)}`}
                  </Typography>
                  <Typography sx={{ fontSize: chu, fontWeight: 700, color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums', minWidth: 110, textAlign: 'right' }}>
                    α{CHI_SO[i]} = {phanTram(kq.dienLiNac[i])}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)' }}>
              Nồng độ ban đầu C
            </Typography>
            <Typography sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 800, color: 'var(--chu-dam)', fontSize: toanManHinh ? '2rem' : '1.5rem', fontVariantNumeric: 'tabular-nums' }}>
              {khoaHoc(c)} M <Box component="span" sx={{ fontSize: '0.6em', color: 'var(--chu)' }}>· pH = {kq.pH.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Box>
            </Typography>
            <Slider
              value={logC}
              min={Math.log10(acid.cMin)}
              max={Math.log10(acid.cMax)}
              step={0.01}
              onChange={(_, x) => setLogC(x as number)}
              aria-label="Nồng độ ban đầu (thang log)"
              getAriaValueText={x => `${khoaHoc(10 ** x)} mol/L`}
              sx={{ color: 'var(--chu-dam)', '& .MuiSlider-thumb': { borderRadius: 0 } }}
            />
            <Typography sx={{ fontSize: '0.8rem', color: 'var(--chu)' }}>
              Thang logarit: từ {khoaHoc(acid.cMin)} đến {khoaHoc(acid.cMax)} mol/L.
              {acid.id === 'h2co3' && ' CO₂ tan có hạn nên chỉ tới khoảng 0,03 M.'}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mb: 0.5 }}>
            Nồng độ lúc cân bằng (thang log, mol/L)
          </Typography>
          <Box sx={{ border: '1px solid var(--chu-dam)', p: 1.5 }}>
            {hang.map(h => {
              const dai = h.gt > 0 ? Math.max(0, Math.min(1, (Math.log10(h.gt) - LOG_MIN) / -LOG_MIN)) : 0;
              return (
                <Box key={h.nhan} sx={{ display: 'grid', gridTemplateColumns: '84px 1fr 96px', gap: 1, alignItems: 'center', mb: 0.75 }}>
                  <Typography sx={{ fontWeight: 800, color: 'var(--chu-dam)', fontSize: chu }}>{h.nhan}</Typography>
                  <Box sx={{ height: toanManHinh ? 22 : 16, bgcolor: 'var(--nen-nhat)', border: '1px solid var(--vien)' }}>
                    <Box sx={{ height: '100%', width: `${dai * 100}%`, bgcolor: h.nhan === 'H⁺' ? 'var(--tim-nen)' : 'var(--xanh-nen)' }} />
                  </Box>
                  <Typography sx={{ fontSize: chu, color: 'var(--chu-dam)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {h.bo ? '0' : h.gt < 10 ** LOG_MIN ? `< 10⁻¹²` : khoaHoc(h.gt)}
                  </Typography>
                </Box>
              );
            })}
            <Typography sx={{ fontSize: '0.75rem', color: 'var(--chu)', mt: 0.5 }}>
              Thanh dài thêm một nấc chia = nồng độ gấp 10 lần. Bỏ qua hệ số hoạt độ: ở cỡ 1 M số chỉ gần đúng.
            </Typography>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mb: 0.5 }}>
              Giải thích
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'var(--chu-dam)', fontSize: chu, lineHeight: 1.6 }}>
              <li>{acid.ghiChu}</li>
              <li>
                Nấc sau luôn yếu hơn nấc trước: tách H⁺ ra khỏi một ion ÂM khó hơn tách khỏi phân tử trung hoà,
                vì ion âm hút H⁺ mạnh hơn.
              </li>
              <li>
                Vì vậy [H⁺] không bằng {acid.ka.length}C: ở {khoaHoc(c)} M, [H⁺] = {khoaHoc(kq.h)} M
                ({(kq.h / c).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} lần C).
              </li>
              <li>Kéo nồng độ nhỏ lại: độ điện li của mỗi nấc chưa hoàn toàn đều TĂNG — pha loãng làm chất điện li yếu phân li nhiều hơn.</li>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
