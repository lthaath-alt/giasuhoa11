import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { CHEMISTRY_11_CURRICULUM } from '../constants';
import { MoPhong, TEN_NOI_LAM, THI_NGHIEM, ThiNghiem } from '../thiNghiemTheoBai';

/**
 * THÍ NGHIỆM GỢI Ý THEO BÀI — danh sách trong tab Thí nghiệm.
 * Dữ liệu ở `thiNghiemTheoBai.ts`; mục chưa được giáo viên duyệt mang nhãn vàng
 * (vàng cảnh báo = trạng thái đang dở, theo docs/claude-reference/ui.md).
 */

const nhanCss = {
  fontSize: '0.68rem',
  fontWeight: 800,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  px: 0.75,
  py: 0.2,
  border: '1px solid var(--chu-dam)',
  color: 'var(--chu-dam)',
};

function Muc({ tieuDe, children }: { tieuDe: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mt: 1.25 }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--chu)' }}>
        {tieuDe}
      </Typography>
      <Box sx={{ color: 'var(--chu-dam)', fontSize: '0.92rem', lineHeight: 1.6 }}>{children}</Box>
    </Box>
  );
}

function TheThiNghiem({ tn, onMoMoPhong }: { tn: ThiNghiem; onMoMoPhong: (m: MoPhong) => void }) {
  const [mo, setMo] = useState(false);
  const nguyHiem = tn.noiLam === 'giao-vien-bieu-dien';
  return (
    <Box sx={{ border: '1px solid var(--chu-dam)', bgcolor: 'var(--nen-the)' }}>
      <Box
        component="button"
        onClick={() => setMo(x => !x)}
        aria-expanded={mo}
        sx={{
          all: 'unset', boxSizing: 'border-box', cursor: 'pointer', width: '100%',
          display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', px: 1.5, py: 1.1,
          '&:hover': { bgcolor: 'var(--nen-nhat)' },
          '&:focus-visible': { outline: '2px solid var(--tin-hieu)', outlineOffset: -2 },
        }}
      >
        <Typography component="span" sx={{ fontWeight: 800, color: 'var(--chu-dam)', flexGrow: 1, minWidth: 200 }}>
          {tn.ten}
        </Typography>
        <Box component="span" sx={{ ...nhanCss, borderStyle: tn.sgkTrang ? 'solid' : 'dashed', color: tn.sgkTrang ? 'var(--chu-dam)' : 'var(--chu)' }}>
          {tn.sgkTrang ? `SGK tr. ${tn.sgkTrang}` : 'Gợi ý thêm'}
        </Box>
        {/* Đỏ tín hiệu chỉ cho hành động chính / lỗi / đang chọn (ui.md) — mức
            nguy hiểm thể hiện bằng nền mực đậm, không bằng màu đỏ. */}
        <Box component="span" sx={{ ...nhanCss, ...(nguyHiem ? { bgcolor: 'var(--nen-dam)', color: 'var(--chu-nguoc)' } : {}) }}>
          {TEN_NOI_LAM[tn.noiLam]}
        </Box>
        {!tn.daDuyet && (
          <Box component="span" sx={{ ...nhanCss, border: 'none', bgcolor: 'var(--vang-nen)', color: 'var(--chu-tren-vang)' }}>
            Chờ giáo viên duyệt
          </Box>
        )}
        <Typography component="span" sx={{ fontWeight: 800, color: 'var(--chu-dam)', width: 16, textAlign: 'center' }} aria-hidden>
          {mo ? '−' : '+'}
        </Typography>
      </Box>

      {mo && (
        <Box sx={{ px: 1.5, pb: 1.5, borderTop: '1px solid var(--vien)' }}>
          <Muc tieuDe="Mục đích">{tn.mucDich}</Muc>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { sm: 2 } }}>
            <Muc tieuDe="Hoá chất">{tn.hoaChat.join('; ')}</Muc>
            <Muc tieuDe="Dụng cụ">{tn.dungCu.join('; ')}</Muc>
          </Box>
          <Muc tieuDe={tn.noiLam === 'sgk-mo-ta' ? 'SGK mô tả' : nguyHiem ? 'Cách giáo viên tiến hành' : 'Cách làm'}>
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {tn.cachLam.map(b => <li key={b}>{b}</li>)}
            </Box>
          </Muc>
          <Muc tieuDe="Hiện tượng">{tn.hienTuong}</Muc>
          <Muc tieuDe="Giải thích">{tn.giaiThich}</Muc>
          <Box sx={{ mt: 1.25, border: '2px solid var(--chu-dam)', p: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--chu-dam)' }}>
              ◆ An toàn
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'var(--chu-dam)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {tn.anToan.map(a => <li key={a}>{a}</li>)}
            </Box>
          </Box>
          {tn.moPhong && (
            <Button
              onClick={() => onMoMoPhong(tn.moPhong!)}
              sx={{ mt: 1.25, borderRadius: 0, fontWeight: 700, bgcolor: 'var(--tin-hieu-nen)', color: 'var(--chu-nguoc)', '&:hover': { bgcolor: 'var(--nen-dam)' } }}
            >
              Mở mô phỏng
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export const ThiNghiemTheoBai: React.FC<{ onMoMoPhong: (m: MoPhong) => void }> = ({ onMoMoPhong }) => {
  const [chuong, setChuong] = useState<string>('tat-ca');
  const dsChuong = CHEMISTRY_11_CURRICULUM.filter(c => chuong === 'tat-ca' || c.id === chuong);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
        {[{ id: 'tat-ca', nhan: 'Tất cả' }, ...CHEMISTRY_11_CURRICULUM.map((c, i) => ({ id: c.id, nhan: `Chương ${i + 1}` }))].map(c => {
          const dangChon = c.id === chuong;
          return (
            <Button
              key={c.id}
              onClick={() => setChuong(c.id)}
              aria-pressed={dangChon}
              sx={{
                borderRadius: 0, fontWeight: 700, fontSize: '0.82rem', textTransform: 'none',
                border: '1px solid var(--chu-dam)',
                bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent',
                color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
                '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' },
              }}
            >
              {c.nhan}
            </Button>
          );
        })}
      </Box>

      <Typography sx={{ fontSize: '0.85rem', color: 'var(--chu)', mb: 2 }}>
        Thí nghiệm theo từng bài. "SGK tr. N" là thí nghiệm có trong sách (đối chiếu qua các trang giải SGK);
        "Gợi ý thêm" là thí nghiệm ngoài sách. Mục ghi "Giáo viên biểu diễn" dùng chất độc hoặc ăn mòn —
        học sinh chỉ quan sát, không tự làm.
      </Typography>

      {dsChuong.map(c => (
        <Box key={c.id} sx={{ mb: 3 }}>
          <Typography component="h3" sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--chu-dam)', borderBottom: '2px solid var(--chu-dam)', pb: 0.5, mb: 1.5 }}>
            {c.title}
          </Typography>
          {c.lessons.map(bai => {
            const ds = THI_NGHIEM.filter(t => t.lessonId === bai.id);
            if (!ds.length) return null;
            return (
              <Box key={bai.id} sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, color: 'var(--chu-dam)', mb: 0.75 }}>{bai.title}</Typography>
                <Box sx={{ display: 'grid', gap: 0.75 }}>
                  {ds.map(tn => <TheThiNghiem key={tn.id} tn={tn} onMoMoPhong={onMoMoPhong} />)}
                </Box>
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};
