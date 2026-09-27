import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DenDienLi3D } from './DenDienLi3D';

/**
 * THÍ NGHIỆM TÍNH DẪN ĐIỆN — bóng đèn (Bài 2, sự điện li).
 *
 * Cùng nồng độ 0,1 M: chất điện li mạnh → đèn sáng rõ; điện li yếu → sáng mờ;
 * không điện li → không sáng. So sánh chỉ có nghĩa ở CÙNG nồng độ: độ sáng đi
 * theo nồng độ ion trong dung dịch, không theo "tên loại chất".
 *
 * Cố ý không cho hạt chuyển động liên tục: hợp đồng giao diện chỉ cho một nhịp
 * chuyển động (ở chỗ mở bài). Chiều chuyển của ion nói trong khung giải thích
 * (nhãn chữ vẽ trong cốc từng đè lên hạt nên đã bỏ).
 */

type Nhom = 'manh' | 'yeu' | 'khong';

interface Chat {
  id: string;
  ct: string;
  ten: string;
  nhom: Nhom;
  /** Độ sáng bóng đèn 0–1 khi khoá K đóng. */
  sang: number;
  phuongTrinh: string[];
  giaiThich: string;
  ion: [string, string];   // nhãn ion dương, ion âm để vẽ
  /** Nhãn nhóm riêng khi nhãn chung sai nghĩa (nước: điện li RẤT yếu, không phải không điện li). */
  nhanNhom?: string;
}

const CHAT: Chat[] = [
  { id: 'hcl', ct: 'HCl', ten: 'Hydrochloric acid', nhom: 'manh', sang: 1,
    phuongTrinh: ['HCl → H⁺ + Cl⁻'], ion: ['H⁺', 'Cl⁻'],
    giaiThich: 'HCl phân li hoàn toàn: 0,1 mol/L HCl cho 0,1 mol/L H⁺ và 0,1 mol/L Cl⁻. Dung dịch có rất nhiều ion nên dẫn điện tốt.' },
  { id: 'naoh', ct: 'NaOH', ten: 'Sodium hydroxide', nhom: 'manh', sang: 1,
    phuongTrinh: ['NaOH → Na⁺ + OH⁻'], ion: ['Na⁺', 'OH⁻'],
    giaiThich: 'Base mạnh, phân li hoàn toàn thành Na⁺ và OH⁻.' },
  { id: 'nacl', ct: 'NaCl', ten: 'Sodium chloride (muối ăn)', nhom: 'manh', sang: 1,
    phuongTrinh: ['NaCl → Na⁺ + Cl⁻'], ion: ['Na⁺', 'Cl⁻'],
    giaiThich: 'Muối tan phân li hoàn toàn. Chú ý: NaCl RẮN khan không dẫn điện vì ion bị giữ chặt trong mạng tinh thể — phải hoà tan (hoặc nóng chảy) thì ion mới chuyển động được.' },
  { id: 'kno3', ct: 'KNO₃', ten: 'Potassium nitrate', nhom: 'manh', sang: 1,
    phuongTrinh: ['KNO₃ → K⁺ + NO₃⁻'], ion: ['K⁺', 'NO₃⁻'],
    giaiThich: 'Muối tan phân li hoàn toàn thành K⁺ và NO₃⁻.' },
  { id: 'h2so4', ct: 'H₂SO₄', ten: 'Sulfuric acid', nhom: 'manh', sang: 1,
    phuongTrinh: ['H₂SO₄ → H⁺ + HSO₄⁻', 'HSO₄⁻ ⇌ H⁺ + SO₄²⁻'], ion: ['H⁺', 'chủ yếu HSO₄⁻, ít SO₄²⁻'],
    giaiThich: 'Nấc 1 phân li hoàn toàn nên H₂SO₄ là chất điện li mạnh; nấc 2 phân li thêm một phần. Ở 0,1 M, [H⁺] ≈ 0,108 M — chỉ hơn HCl cùng nồng độ một chút vì nấc 2 điện li ít. Khi làm bài tập theo SGK và đề thi, H₂SO₄ loãng thường được coi là điện li hoàn toàn cả hai nấc. Xem mô phỏng "Điện li nhiều nấc".' },
  { id: 'ch3cooh', ct: 'CH₃COOH', ten: 'Acetic acid (có trong giấm)', nhom: 'yeu', sang: 0.3,
    phuongTrinh: ['CH₃COOH ⇌ CH₃COO⁻ + H⁺'], ion: ['H⁺', 'CH₃COO⁻'],
    giaiThich: 'Chỉ khoảng 1,3 % số phân tử phân li ở 0,1 M; phần lớn vẫn là phân tử CH₃COOH. Ít ion nên đèn chỉ sáng mờ. Mũi tên hai chiều: có cân bằng giữa phân tử và ion.' },
  { id: 'nh3', ct: 'NH₃', ten: 'Dung dịch ammonia', nhom: 'yeu', sang: 0.3,
    phuongTrinh: ['NH₃ + H₂O ⇌ NH₄⁺ + OH⁻'], ion: ['NH₄⁺', 'OH⁻'],
    giaiThich: 'NH₃ nhận H⁺ của nước tạo NH₄⁺ và OH⁻, nhưng chỉ khoảng 1,3 % ở 0,1 M. Dung dịch có ít ion, đèn sáng mờ.' },
  { id: 'hf', ct: 'HF', ten: 'Hydrofluoric acid', nhom: 'yeu', sang: 0.4,
    phuongTrinh: ['HF ⇌ H⁺ + F⁻'], ion: ['H⁺', 'F⁻'],
    giaiThich: 'Khác HCl, HBr, HI, acid HF là acid yếu: khoảng 8 % phân tử phân li ở 0,1 M. Số ion gấp khoảng 6 lần CH₃COOH nhưng vẫn ít hơn HCl hơn chục lần, nên đèn vẫn chỉ sáng mờ (sáng hơn CH₃COOH một chút).' },
  { id: 'c2h5oh', ct: 'C₂H₅OH', ten: 'Ethanol (cồn)', nhom: 'khong', sang: 0,
    phuongTrinh: ['C₂H₅OH: tan trong nước nhưng không phân li ra ion'], ion: ['', ''],
    giaiThich: 'Ethanol tan vô hạn trong nước nhưng vẫn ở dạng phân tử, không tạo ion. Không có hạt mang điện chuyển động nên không có dòng điện.' },
  { id: 'saccharose', ct: 'C₁₂H₂₂O₁₁', ten: 'Saccharose (đường mía)', nhom: 'khong', sang: 0,
    phuongTrinh: ['C₁₂H₂₂O₁₁: tan nhưng không phân li'], ion: ['', ''],
    giaiThich: 'Nước đường ngọt đậm vẫn không dẫn điện: phân tử saccharose tan nhưng không tách thành ion. Tan được trong nước không đồng nghĩa với điện li.' },
  { id: 'glycerol', ct: 'C₃H₅(OH)₃', ten: 'Glycerol', nhom: 'khong', sang: 0,
    phuongTrinh: ['C₃H₅(OH)₃: tan nhưng không phân li'], ion: ['', ''],
    giaiThich: 'Glycerol là chất không điện li: trong dung dịch chỉ có phân tử.' },
  { id: 'h2o', ct: 'H₂O', ten: 'Nước cất', nhom: 'khong', sang: 0,
    phuongTrinh: ['H₂O ⇌ H⁺ + OH⁻ (cực yếu, [H⁺] = 10⁻⁷ M)'], ion: ['H⁺', 'OH⁻'],
    nhanNhom: 'Chất điện li rất yếu — đèn không sáng',
    giaiThich: 'Nước nguyên chất điện li cực yếu, nồng độ ion quá nhỏ nên bóng đèn thường không sáng (máy đo độ dẫn nhạy vẫn đo được). Nước máy, nước giếng có muối hoà tan nên dẫn điện — vì vậy không chạm thiết bị điện khi tay ướt.' },
];

const TEN_NHOM: Record<Nhom, string> = {
  manh: 'Chất điện li mạnh — đèn sáng rõ',
  yeu: 'Chất điện li yếu — đèn sáng mờ',
  khong: 'Chất không điện li — đèn không sáng',
};

export const DenDienLi: React.FC<{ toanManHinh: boolean }> = ({ toanManHinh }) => {
  const [chon, setChon] = useState<Chat>(CHAT[0]);
  const [dong, setDong] = useState(true);
  
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, gap: 2 }}>
      <Box>
        <DenDienLi3D chat={chon} dong={dong} toanManHinh={toanManHinh} />
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.75, fontSize: '0.78rem', color: 'var(--chu)' }}>
          <span><Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--tim-nen)', mr: 0.5, verticalAlign: 'middle' }} />ion dương{chon.ion[0] ? ` (${chon.ion[0]})` : ''}</span>
          <span><Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', bgcolor: 'var(--xanh-nen)', mr: 0.5, verticalAlign: 'middle' }} />ion âm{chon.ion[1] ? ` (${chon.ion[1]})` : ''}</span>
          <span><Box component="span" sx={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--chu-mo)', mr: 0.5, verticalAlign: 'middle' }} />phân tử chưa phân li</span>
          <span>· {chon.ct} 0,1 M · kéo để xoay</span>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            onClick={() => setDong(d => !d)}
            sx={{ borderRadius: 0, fontSize: '0.8rem', color: 'var(--chu-dam)', border: '1px solid var(--chu-dam)' }}
          >
            {dong ? 'Mở khoá K (ngắt mạch)' : 'Đóng khoá K (nối mạch)'}
          </Button>
          <Typography sx={{ fontSize: '0.8rem', color: 'var(--chu)' }}>
            Mọi cốc cùng nồng độ 0,1 M để so sánh công bằng.
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--chu)', mb: 1 }}>
          Chọn cốc dung dịch
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 0.75, mb: 2 }}>
          {CHAT.map(c => {
            const dangChon = c.id === chon.id;
            return (
              <Button
                key={c.id}
                onClick={() => setChon(c)}
                aria-pressed={dangChon}
                sx={{
                  borderRadius: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: toanManHinh ? '1rem' : '0.85rem',
                  justifyContent: 'flex-start',
                  border: '1px solid var(--chu-dam)',
                  bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent',
                  color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
                  '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' },
                }}
              >
                {c.ct}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ border: '1px solid var(--chu-dam)' }}>
          <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid var(--chu-dam)', bgcolor: 'var(--nen-nhat)' }}>
            <Typography sx={{ fontWeight: 800, color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.25rem' : '1rem' }}>
              {chon.ct} <Box component="span" sx={{ fontWeight: 500, color: 'var(--chu)' }}>— {chon.ten}</Box>
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: chon.nhom === 'khong' ? 'var(--chu)' : 'var(--luc-tham)' }}>
              {chon.nhanNhom ?? TEN_NHOM[chon.nhom]}
            </Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mb: 0.5 }}>
              Phương trình điện li
            </Typography>
            {chon.phuongTrinh.map(p => (
              <Typography key={p} sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 700, color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.3rem' : '1.05rem' }}>
                {p}
              </Typography>
            ))}
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--chu)', mt: 1.5, mb: 0.5 }}>
              Giải thích hiện tượng
            </Typography>
            <Typography sx={{ color: 'var(--chu-dam)', fontSize: toanManHinh ? '1.1rem' : '0.92rem', lineHeight: 1.6 }}>
              {dong
                ? chon.giaiThich
                : 'Khoá K đang mở: mạch hở nên không có dòng điện, đèn không sáng với bất kì dung dịch nào. Đóng khoá K để thử.'}
            </Typography>
            <Typography sx={{ color: 'var(--chu)', fontSize: toanManHinh ? '1rem' : '0.82rem', lineHeight: 1.6, mt: 1.5 }}>
              Dòng điện trong dung dịch là dòng các ion chuyển động có hướng: ion dương về cực âm, ion âm về cực dương.
              Càng nhiều ion (ở cùng nồng độ chất tan) thì dung dịch dẫn điện càng tốt, đèn càng sáng.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
