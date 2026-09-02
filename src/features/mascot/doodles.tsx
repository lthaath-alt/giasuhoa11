import React from 'react';

/* Bộ hình vẽ nét tay chủ đề Hoá học, dùng làm nền trang trí quanh khối nội dung.
   Tất cả đều là line-art đen, không tô màu, để nhìn như học sinh vẽ nguệch ngoạc
   ra lề vở. Màu lấy theo `currentColor` nên chỉ cần đổi `color` ở lớp cha là
   đổi được cả bộ. */

export type TenHinh =
  | 'nguyenTu'
  | 'binhTamGiac'
  | 'ongNghiem'
  | 'binhCau'
  | 'kinhLup'
  | 'benzen'
  | 'amoniac'
  | 'etilen'
  | 'can'
  | 'cocDong'
  | 'oNguyenTo'
  | 'muiTen'
  | 'phanTuNuoc';

/* viewBox riêng cho từng hình vì tỉ lệ khác nhau (công thức thì nằm ngang,
   dụng cụ thì dựng đứng). Giữ nguyên tỉ lệ để hình không bị bóp méo. */
const KHUNG: Record<TenHinh, string> = {
  nguyenTu: '0 0 100 100',
  binhTamGiac: '0 0 100 112',
  ongNghiem: '0 0 60 112',
  binhCau: '0 0 100 112',
  kinhLup: '0 0 100 100',
  benzen: '0 0 100 100',
  amoniac: '0 0 130 105',
  etilen: '0 0 150 100',
  can: '0 0 110 100',
  cocDong: '0 0 100 100',
  oNguyenTo: '0 0 90 90',
  muiTen: '0 0 120 60',
  phanTuNuoc: '0 0 120 100',
};

const NET: React.SVGProps<SVGGElement> = {
  fill: 'none',
  stroke: 'currentColor',
  /* Nét đậm hẳn lên cho ra dáng vẽ bút mực trên lề vở. Nét mảnh bị mờ tịt khi
     hạ độ đậm của cả lớp xuống. */
  strokeWidth: 3.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

/* Chữ trong công thức: dùng cùng font với trang cho ăn nhập, đậm để đọc rõ
   dù nét mảnh và mờ. */
const chu = (x: number, y: number, noiDung: string, co = 26) => (
  <text
    x={x}
    y={y}
    fontSize={co}
    fontWeight={700}
    textAnchor="middle"
    dominantBaseline="central"
    fill="currentColor"
    stroke="none"
  >
    {noiDung}
  </text>
);

const HINH: Record<TenHinh, React.ReactNode> = {
  /* Nguyên tử: hạt nhân + 3 lớp quỹ đạo electron nghiêng khác nhau. */
  nguyenTu: (
    <g {...NET}>
      <ellipse cx="50" cy="50" rx="46" ry="17" />
      <ellipse cx="50" cy="50" rx="46" ry="17" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="46" ry="17" transform="rotate(120 50 50)" />
      <circle cx="50" cy="50" r="6.5" fill="currentColor" />
      <circle cx="96" cy="50" r="4" fill="currentColor" />
      <circle cx="27" cy="10" r="4" fill="currentColor" />
      <circle cx="27" cy="90" r="4" fill="currentColor" />
    </g>
  ),

  /* Bình tam giác (Erlenmeyer) có dung dịch và bọt khí. */
  binhTamGiac: (
    <g {...NET}>
      <path d="M38 8 L38 36 L11 97 Q8 105 16 105 L84 105 Q92 105 89 97 L62 36 L62 8" />
      <path d="M33 8 L67 8" />
      <path d="M23 78 L77 78" />
      <circle cx="42" cy="88" r="3.4" />
      <circle cx="57" cy="93" r="2.6" />
      <circle cx="50" cy="70" r="2.4" />
      <circle cx="63" cy="63" r="1.9" />
    </g>
  ),

  /* Ống nghiệm đáy tròn. */
  ongNghiem: (
    <g {...NET}>
      <path d="M18 8 L18 90 A12 12 0 0 0 42 90 L42 8" />
      <path d="M12 8 L48 8" />
      <path d="M18 64 L42 64" />
      <circle cx="30" cy="80" r="2.6" />
      <circle cx="25" cy="88" r="1.9" />
    </g>
  ),

  /* Bình cầu đáy tròn, cổ dài. */
  binhCau: (
    <g {...NET}>
      <path d="M36 10 L36 46" />
      <path d="M64 10 L64 46" />
      <path d="M30 10 L70 10" />
      <circle cx="50" cy="74" r="31" />
      <path d="M23 88 L77 88" />
      <circle cx="45" cy="66" r="2.6" />
      <circle cx="58" cy="72" r="2" />
    </g>
  ),

  /* Kính lúp soi mẫu. */
  kinhLup: (
    <g {...NET}>
      <circle cx="41" cy="41" r="28" />
      <path d="M61 61 L88 88" strokeWidth={5} />
      <path d="M28 32 A16 16 0 0 1 40 25" strokeWidth={2} />
    </g>
  ),

  /* Vòng benzen C₆H₆ — ký hiệu vòng thơm. */
  benzen: (
    <g {...NET}>
      <path d="M50 12 L83 31 L83 69 L50 88 L17 69 L17 31 Z" />
      <circle cx="50" cy="50" r="21" />
    </g>
  ),

  /* Amoniac NH₃ — công thức cấu tạo. */
  amoniac: (
    <g {...NET}>
      {chu(65, 52, 'N')}
      {chu(18, 24, 'H', 22)}
      {chu(112, 24, 'H', 22)}
      {chu(65, 95, 'H', 22)}
      <path d="M52 41 L31 29" />
      <path d="M78 41 L99 29" />
      <path d="M65 66 L65 82" />
    </g>
  ),

  /* Etilen C₂H₄ — chú ý nối đôi C=C, kiến thức trọng tâm Hoá 11. */
  etilen: (
    <g {...NET}>
      {chu(55, 50, 'C')}
      {chu(95, 50, 'C')}
      {chu(16, 20, 'H', 22)}
      {chu(16, 80, 'H', 22)}
      {chu(134, 20, 'H', 22)}
      {chu(134, 80, 'H', 22)}
      <path d="M69 45 L81 45" />
      <path d="M69 55 L81 55" />
      <path d="M43 42 L29 28" />
      <path d="M43 58 L29 72" />
      <path d="M107 42 L121 28" />
      <path d="M107 58 L121 72" />
    </g>
  ),

  /* Cân hai đĩa — cân bằng phương trình. */
  can: (
    <g {...NET}>
      <circle cx="55" cy="15" r="5" />
      <path d="M55 20 L55 79" />
      <path d="M40 79 L70 79" />
      <path d="M33 88 L77 88" />
      <path d="M40 79 L33 88" />
      <path d="M70 79 L77 88" />
      <path d="M16 31 L94 31" />
      <path d="M16 31 L16 45" />
      <path d="M94 31 L94 45" />
      <path d="M4 45 A14 9 0 0 0 28 45 Z" />
      <path d="M82 45 A14 9 0 0 0 106 45 Z" />
    </g>
  ),

  /* Cốc đong có vạch chia. */
  cocDong: (
    <g {...NET}>
      <path d="M20 14 L20 84 Q20 92 28 92 L72 92 Q80 92 80 84 L80 14" />
      <path d="M20 14 L11 20" />
      <path d="M20 36 L34 36" />
      <path d="M20 52 L34 52" />
      <path d="M20 68 L34 68" />
      <path d="M20 62 L80 62" />
    </g>
  ),

  /* Ô nguyên tố nitơ, cắt ra từ bảng tuần hoàn. */
  oNguyenTo: (
    <g {...NET}>
      <rect x="6" y="6" width="78" height="78" rx="7" />
      {chu(20, 20, '7', 15)}
      {chu(45, 46, 'N', 34)}
      {chu(45, 72, 'Nitơ', 14)}
    </g>
  ),

  /* Mũi tên thuận nghịch — phản ứng ở trạng thái cân bằng. */
  muiTen: (
    <g {...NET}>
      <path d="M12 22 L104 22" />
      <path d="M92 14 L104 22 L92 30" />
      <path d="M108 38 L16 38" />
      <path d="M28 30 L16 38 L28 46" />
    </g>
  ),

  /* Phân tử nước H₂O dạng quả cầu — góc liên kết ~104,5°. */
  phanTuNuoc: (
    <g {...NET}>
      <path d="M60 55 L26 32" />
      <path d="M60 55 L94 32" />
      <circle cx="60" cy="55" r="22" />
      <circle cx="22" cy="28" r="13" />
      <circle cx="98" cy="28" r="13" />
      {chu(60, 55, 'O', 22)}
    </g>
  ),
};

interface Props {
  ten: TenHinh;
  /** Chiều rộng hiển thị, tính bằng px. Chiều cao tự suy ra theo tỉ lệ viewBox. */
  rong: number;
  /** Góc nghiêng, để các hình không xếp thẳng đơ như bảng biểu. */
  xoay?: number;
}

export const Doodle: React.FC<Props> = ({ ten, rong, xoay = 0 }) => (
  <svg
    viewBox={KHUNG[ten]}
    width={rong}
    style={{
      display: 'block',
      height: 'auto',
      transform: xoay ? `rotate(${xoay}deg)` : undefined,
      overflow: 'visible',
    }}
    aria-hidden="true"
    focusable="false"
  >
    {HINH[ten]}
  </svg>
);
