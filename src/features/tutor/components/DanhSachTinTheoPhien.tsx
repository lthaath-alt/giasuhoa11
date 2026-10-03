import React, { useLayoutEffect, useRef, useState } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { ArrowDown, ChevronsDown, ChevronsUp } from 'lucide-react';
import { nhomTheoPhien, nhanNhom, type TinCoThoiGian } from '../services/nhomPhien';

/* Danh sách tin chia theo phiên, dùng chung cho TutorChat và iChat (03/10/2026).

   Mặc định chỉ mở phiên mới nhất; các phiên trước gập thành một nút. Mở ra
   hay gập lại thì giữ nguyên chỗ em đang đọc: đo khoảng cách tới ĐÁY khung
   trước khi đổi, rồi đặt lại sau khi trang vẽ xong. Không trông vào "scroll
   anchoring" của trình duyệt, vì Safari trên iPhone không có. */

interface Props<T extends TinCoThoiGian & { id: string }> {
  tin: T[];
  veTin: (m: T) => React.ReactNode;
  /** Khung cuộn chứa danh sách, để giữ vị trí khi mở/gập */
  khungRef: React.RefObject<HTMLDivElement | null>;
  /** Đổi khoá (đổi bài) thì gập lại như lúc mới mở */
  khoa: string;
}

const vachPhien = { '&::before, &::after': { borderColor: 'var(--vien)' } };

export function DanhSachTinTheoPhien<T extends TinCoThoiGian & { id: string }>(
  { tin, veTin, khungRef, khoa }: Props<T>,
) {
  /* Lưu khoá đang mở thay cho một cờ true/false: đổi bài là tự gập lại,
     không cần effect đặt lại. */
  const [moCho, setMoCho] = useState<string | null>(null);
  const moHet = moCho === khoa;
  const cachDay = useRef<number | null>(null);

  useLayoutEffect(() => {
    const k = khungRef.current;
    if (cachDay.current === null || !k) return;
    k.scrollTop = k.scrollHeight - cachDay.current;
    cachDay.current = null;
  }, [moHet, khungRef]);

  const doi = (mo: boolean) => {
    const k = khungRef.current;
    if (k) cachDay.current = k.scrollHeight - k.scrollTop;
    setMoCho(mo ? khoa : null);
  };

  const nhom = nhomTheoPhien(tin);
  if (nhom.length === 0) return null;
  const cu = nhom.slice(0, -1);
  const soTinCu = cu.reduce((s, n) => s + n.tin.length, 0);
  const hien = moHet ? nhom : nhom.slice(-1);

  return (
    <>
      {cu.length > 0 && (
        <Button
          size="small"
          onClick={() => doi(!moHet)}
          startIcon={moHet ? <ChevronsDown size={14} /> : <ChevronsUp size={14} />}
          sx={{
            alignSelf: 'center',
            borderRadius: 0,
            textTransform: 'none',
            fontWeight: 'bold',
            color: 'var(--chu-dam)',
            border: '1px solid var(--vien)',
            bgcolor: 'var(--nen-trang)',
          }}
        >
          {moHet ? 'Gập các phiên trước' : `Xem ${cu.length} phiên trước (${soTinCu} tin)`}
        </Button>
      )}
      {hien.map((n) => (
        <React.Fragment key={n.khoa}>
          <Divider sx={vachPhien}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}
            >
              {nhanNhom(n)}
            </Typography>
          </Divider>
          {n.tin.map((m) => (
            <React.Fragment key={m.id}>{veTin(m)}</React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

/** Nút nổi ở đáy khung chat khi em đã kéo lên đọc lại. Đặt CUỐI khung cuộn. */
export const NutTinMoiNhat: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    size="small"
    onClick={onClick}
    startIcon={<ArrowDown size={14} />}
    sx={{
      position: 'sticky',
      bottom: 0,
      alignSelf: 'center',
      flexShrink: 0,
      borderRadius: 0,
      textTransform: 'none',
      fontWeight: 'bold',
      color: 'var(--chu-dam)',
      border: '1px solid var(--chu-dam)',
      bgcolor: 'var(--nen-trang)',
      '&:hover': { bgcolor: 'var(--nen-nhat)' },
    }}
  >
    Tin mới nhất
  </Button>
);
