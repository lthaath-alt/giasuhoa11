import React, { useRef, useState } from 'react';
import { useCheDoMau } from '../../../core/hooks/useCheDoMau';
import { Box, Button, Paper, Typography } from '@mui/material';
import { KhungToanManHinh } from './mo-phong/KhungToanManHinh';
import { DenDienLi } from './mo-phong/DenDienLi';
import { ChuanDo } from './mo-phong/ChuanDo';
import { DienLiNhieuNac } from './mo-phong/DienLiNhieuNac';
import { ThiNghiemTheoBai } from './ThiNghiemTheoBai';
import { MoPhong } from '../thiNghiemTheoBai';

/**
 * TAB THÍ NGHIỆM — ba khung (27/09/2026):
 *   · Mô phỏng: bóng đèn dẫn điện, chuẩn độ tính C_M, điện li nhiều nấc (React).
 *   · Thí nghiệm theo bài: danh sách gợi ý (thiNghiemTheoBai.ts).
 *   · Mô hình phân tử 3D: PHÒNG TRƯNG BÀY VI MÔ.
 *
 * Phòng trưng bày là một trang tĩnh nằm ở public/thi-nghiem.html: HTML + canvas
 * dựng mô hình phân tử 3D, không phụ thuộc thư viện ngoài. Để ngoài React vì
 * cùng lý do với khu bài giảng — nó tự lo phần vẽ, nhúng vào bundle chỉ làm app
 * nặng thêm. Dùng chung cách làm với SlidesSection: iframe trỏ vào file HTML tĩnh.
 */

/* nen=toi -> ép trang đi theo chế độ của app.
   Trang này CHỈ hiểu đúng một tham số đó: nền sáng thì không truyền gì cả, chứ
   không phải truyền `nen=sang`. Nó cũng không hiểu `theme=` hay `embed=` như
   trang bài giảng, nên đừng chép nguyên chuỗi truy vấn từ SlidesSection sang. */
const diaChiThiNghiem = (toi: boolean) =>
  toi ? '/thi-nghiem.html?nen=toi' : '/thi-nghiem.html';

type Khung = 'mo-phong' | 'theo-bai' | 'phan-tu';

const KHUNG: { id: Khung; nhan: string }[] = [
  { id: 'mo-phong', nhan: 'Mô phỏng' },
  { id: 'theo-bai', nhan: 'Thí nghiệm theo bài' },
  { id: 'phan-tu', nhan: 'Mô hình phân tử 3D' },
];

const MO_PHONG: { id: MoPhong; ten: string; nhan: string }[] = [
  { id: 'den-dien-li', ten: 'Tính dẫn điện của dung dịch', nhan: 'Bài 2' },
  { id: 'chuan-do', ten: 'Chuẩn độ acid – base tính nồng độ', nhan: 'Bài 2' },
  { id: 'dien-li-nhieu-nac', ten: 'Điện li nhiều nấc', nhan: 'Bài 2 · mở rộng' },
];

const nutChon = (dangChon: boolean) => ({
  borderRadius: 0,
  fontWeight: 700,
  textTransform: 'none' as const,
  border: '1px solid var(--chu-dam)',
  bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent',
  color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
  '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' },
});

export const PhongThiNghiem: React.FC = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const { laToi } = useCheDoMau();
  /* Địa chỉ chốt một lần lúc dựng, KHÔNG dựng lại theo `laToi` — giống
     SlidesSection. Để nó đổi theo thì mỗi lần bấm đổi nền là iframe nạp lại,
     ai đang xoay dở một phân tử sẽ bị đá về trạng thái đầu. */
  const [diaChi] = useState(() => diaChiThiNghiem(laToi));
  const [khung, setKhung] = useState<Khung>('mo-phong');
  const [moPhong, setMoPhong] = useState<MoPhong>('den-dien-li');

  const moMoPhong = (m: MoPhong) => {
    setMoPhong(m);
    setKhung('mo-phong');
  };
  const dangMo = MO_PHONG.find(m => m.id === moPhong)!;

  return (
    <Box sx={{ width: '100%', bgcolor: 'var(--nen-xam)', borderRadius: 0, p: { xs: 1.5, md: 3 } }}>
      <Box role="tablist" aria-label="Khu thí nghiệm" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
        {KHUNG.map(k => (
          <Button key={k.id} role="tab" aria-selected={khung === k.id} onClick={() => setKhung(k.id)}
            sx={{ ...nutChon(khung === k.id), fontSize: '0.9rem', px: 2 }}>
            {k.nhan}
          </Button>
        ))}
      </Box>

      {khung === 'mo-phong' && (
        <Box>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--chu)', mr: 0.5 }}>
              Chọn mô phỏng
            </Typography>
            {MO_PHONG.map(m => (
              <Button key={m.id} aria-pressed={moPhong === m.id} onClick={() => setMoPhong(m.id)}
                sx={{ ...nutChon(moPhong === m.id), fontSize: '0.82rem' }}>
                {m.ten}
              </Button>
            ))}
          </Box>
          {/* key: đổi mô phỏng là dựng khung mới (thoát toàn màn hình của khung cũ). */}
          <KhungToanManHinh key={moPhong} tieuDe={dangMo.ten} nhan={dangMo.nhan}>
            {toan => (
              moPhong === 'den-dien-li' ? <DenDienLi toanManHinh={toan} />
                : moPhong === 'chuan-do' ? <ChuanDo toanManHinh={toan} />
                  : <DienLiNhieuNac toanManHinh={toan} />
            )}
          </KhungToanManHinh>
        </Box>
      )}

      {khung === 'theo-bai' && <ThiNghiemTheoBai onMoMoPhong={moMoPhong} />}

      {/* Iframe KHÔNG gỡ khi đổi khung, chỉ ẩn: gỡ ra là người đang xoay dở một
          phân tử bị nạp lại từ đầu. */}
      <Box sx={{ display: khung === 'phan-tu' ? 'block' : 'none' }}>
        <KhungToanManHinh tieuDe="Phòng trưng bày phân tử 3D">
          {toan => (
            /* KHÔNG thêm tiêu đề trong khung iframe: thi-nghiem.html đã có sẵn
               tiêu đề và câu mô tả riêng bên trong, đặt thêm là hiện hai lần. */
            <Paper
              sx={{
                overflow: 'hidden',
                borderRadius: 0,
                border: '1px solid var(--vien)',
                boxShadow: 'none',
                height: toan ? 'calc(100vh - 110px)' : { xs: 'calc(100vh - 330px)', md: 'calc(100vh - 300px)' },
                minHeight: '400px',
              }}
            >
              <iframe
                ref={frameRef}
                src={diaChi}
                title="Phòng trưng bày mô hình phân tử 3D"
                allow="fullscreen"
                style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              />
            </Paper>
          )}
        </KhungToanManHinh>
      </Box>
    </Box>
  );
};
