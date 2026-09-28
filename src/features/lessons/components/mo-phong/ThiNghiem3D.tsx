import React, { useCallback, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { chieu, giamChuyenDong, useCanh3D, V3 } from './canh3d';
import { KichBan } from './kichBan';

/**
 * KHUNG CHẠY MỘT KỊCH BẢN THÍ NGHIỆM 3D.
 *
 * Một khung dùng cho mọi thí nghiệm: canvas 3D kéo để xoay, dải bước bấm được,
 * và phần chữ "hiện tượng + phương trình" của đúng bước đang xem.
 *
 * Bước tự chạy hết thời lượng thì sang bước sau và DỪNG ở bước cuối — không lặp
 * lại, vì lặp thì học sinh không kịp đọc phần giải thích.
 *
 * Người bật "giảm chuyển động" (prefers-reduced-motion) không bị tự chạy: cảnh
 * đứng yên ở bước đang chọn, bấm từng bước để xem.
 */

const nut = (dangChon: boolean) => ({
  borderRadius: 0,
  fontWeight: 700,
  textTransform: 'none' as const,
  fontSize: '0.82rem',
  border: '1px solid var(--chu-dam)',
  bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'transparent',
  color: dangChon ? 'var(--chu-nguoc)' : 'var(--chu-dam)',
  '&:hover': { bgcolor: dangChon ? 'var(--tin-hieu-nen)' : 'var(--nen-nhat)' },
});

export const ThiNghiem3D: React.FC<{ canh: KichBan; toanManHinh: boolean }> = ({ canh, toanManHinh }) => {
  const tinhBanDau = giamChuyenDong();
  const [buoc, setBuoc] = useState(0);
  const [chay, setChay] = useState(!tinhBanDau);

  const tt = useRef(canh.tao());
  const tGiay = useRef(0);
  const tong = useRef(0);
  const buocRef = useRef(0);
  const chayRef = useRef(chay);
  chayRef.current = chay;
  /* Bấm thẳng vào một bước thì DIỄN hết bước đó rồi dừng, kể cả khi đang tạm
     dừng: nhảy tới bước "Đun nhẹ" mà đèn chưa kịp cháy thì coi như bước đó
     trống, học sinh không thấy hiện tượng nào cả. */
  const motBuoc = useRef(false);

  /** Nhảy tới một bước. Lùi lại thì dựng lại trạng thái: hạt của bước sau không
   *  được phép còn bay ở bước trước. */
  const toiBuoc = useCallback((b: number, lamLai = false) => {
    const moi = Math.max(0, Math.min(canh.buoc.length - 1, b));
    if (lamLai || moi <= buocRef.current) { tt.current = canh.tao(); tong.current = 0; }
    buocRef.current = moi;
    tGiay.current = 0;
    motBuoc.current = !lamLai;
    setBuoc(moi);
  }, [canh]);

  const ref = useCanh3D((ctx, W, H, dt, cam) => {
    const tinh = giamChuyenDong();
    const S = Math.min(H / 3.9, W / 4.0) * (canh.phong ?? 1);
    const P = (p: V3) => chieu(p, cam, W, H, S, canh.cy ?? 0.45);
    const b = canh.buoc[buocRef.current];

    const tuChay = chayRef.current && !tinh;
    if ((tuChay || motBuoc.current) && !tinh) {
      tGiay.current += dt;
      tong.current += dt;
      if (tGiay.current >= b.giay) {
        if (tuChay && buocRef.current < canh.buoc.length - 1) {
          buocRef.current += 1;
          tGiay.current = 0;
          setBuoc(buocRef.current);
        } else {
          /* Hết bước: giữ nguyên cảnh cuối bước cho kịp đọc phần giải thích. */
          tGiay.current = b.giay;
          motBuoc.current = false;
          if (tuChay) setChay(false);
        }
      }
    }

    canh.ve({
      ctx, W, H, dt: tinh ? 0 : dt, cam, P, S,
      buoc: buocRef.current,
      /* Tắt chuyển động thì vẽ thẳng cảnh CUỐI bước: có hiện tượng để nhìn,
         chỉ không có phần chạy dần. */
      tienDo: tinh ? 1 : Math.max(0, Math.min(1, tGiay.current / b.giay)),
      tGiay: tGiay.current,
      tong: tong.current,
      tinh,
      tt: tt.current,
    });
  }, canh.cam);

  const b = canh.buoc[buoc];
  const cuoi = buoc === canh.buoc.length - 1;

  return (
    <Box>
      <Box
        component="canvas"
        ref={ref}
        role="img"
        aria-label={`${canh.moTaAria} Bước ${buoc + 1}: ${b.nhan}. ${b.hienTuong} Kéo để xoay.`}
        /* Cao 440 px ở desktop, KHÔNG phải 360: cỡ cảnh tính bằng
           min(H/3,9 , W/4) nên trên màn hình rộng chiều CAO mới là cái chặn —
           để 360 thì dụng cụ chỉ chiếm chừng một phần ba bề ngang, hai bên
           trống huơ. Cao thêm 80 px là hình to thêm chừng 22 %.
           Chặn luôn bề ngang 900 px: cảnh cao gần bằng rộng (4 × 3,9 đơn vị),
           kéo khung ra 1300 px thì phần thừa chỉ là nền trống hai bên.
           Toàn màn hình thì bỏ chặn và lấy 68vh — lúc đó là chiếu lên lớp. */
        sx={{
          width: '100%', height: toanManHinh ? '68vh' : { xs: 330, md: 440 },
          ...(toanManHinh ? {} : { maxWidth: 900, mx: 'auto' }),
          display: 'block', touchAction: 'none', cursor: 'grab',
          bgcolor: 'var(--nen-rat-nhat)', border: '1px solid var(--vien)',
          '&:active': { cursor: 'grabbing' },
        }}
      />

      {/* Dải bước: bấm thẳng vào bước muốn xem, không phải chờ chạy tới. */}
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.25, alignItems: 'center' }}>
        {canh.buoc.map((x, i) => (
          <Button key={x.nhan} onClick={() => toiBuoc(i)} aria-pressed={i === buoc} sx={nut(i === buoc)}>
            {i + 1}. {x.nhan}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1 }}>
        <Button
          onClick={() => { if (cuoi && !chay) toiBuoc(0, true); setChay(c => !c); }}
          sx={{ ...nut(false), fontWeight: 800 }}
        >
          {chay ? '❙❙ Tạm dừng' : cuoi ? '▷ Chạy lại' : '▷ Chạy'}
        </Button>
        <Button onClick={() => toiBuoc(buoc - 1)} disabled={buoc === 0} sx={nut(false)}>‹ Bước trước</Button>
        <Button onClick={() => toiBuoc(buoc + 1)} disabled={cuoi} sx={nut(false)}>Bước sau ›</Button>
        <Button onClick={() => { toiBuoc(0, true); setChay(false); }} sx={nut(false)}>Làm lại</Button>
      </Box>

      <Box sx={{ mt: 1.5, border: '1px solid var(--chu-dam)', bgcolor: 'var(--nen-the)', p: 1.5 }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--chu)' }}>
          Hiện tượng — bước {buoc + 1}
        </Typography>
        <Typography sx={{ color: 'var(--chu-dam)', fontSize: '0.95rem', lineHeight: 1.6, mt: 0.25 }}>
          {b.hienTuong}
        </Typography>
        {canh.ptHoaHoc.length > 0 && (
          <Box sx={{ mt: 1.25, borderTop: '1px solid var(--vien)', pt: 1 }}>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--chu)' }}>
              Phương trình
            </Typography>
            {canh.ptHoaHoc.map(p => (
              <Typography key={p} sx={{ fontFamily: 'var(--f-hien-thi)', fontWeight: 700, color: 'var(--chu-dam)', fontSize: '0.95rem', mt: 0.25 }}>
                {p}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
