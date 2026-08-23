import React from 'react';

// 1. Thám Tử Hóa Chất: 4 ống nghiệm đứng trên giá gỗ, mực dung dịch khác nhau, ống thứ 2 đang sủi bọt (3-4 vòng tròn nhỏ nổi lên). Bên phải có kính lúp lớn nghiêng 45 độ soi vào.
export const DetectiveArt = () => (
  <svg viewBox="0 0 320 180" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#6aa8e8" opacity="0.2"/>
    {/* Giá gỗ (màu cam sậm) */}
    <rect x="60" y="130" width="140" height="20" rx="4" fill="#f5a623" />
    {/* Ống nghiệm 1 */}
    <path d="M 80 70 L 80 140 A 10 10 0 0 0 100 140 L 100 70 Z" stroke="#1e50a2" strokeWidth="4" fill="#ffffff" />
    <path d="M 82 100 L 82 140 A 8 8 0 0 0 98 140 L 98 100 Z" fill="#6aa8e8" />
    {/* Ống nghiệm 2 (sủi bọt) */}
    <path d="M 110 70 L 110 140 A 10 10 0 0 0 130 140 L 130 70 Z" stroke="#1e50a2" strokeWidth="4" fill="#ffffff" />
    <path d="M 112 110 L 112 140 A 8 8 0 0 0 128 140 L 128 110 Z" fill="#6aa8e8" />
    <circle cx="120" cy="100" r="3" fill="#ffffff" stroke="#1e50a2" strokeWidth="2"/>
    <circle cx="116" cy="90" r="2" fill="#ffffff" stroke="#1e50a2" strokeWidth="1"/>
    <circle cx="124" cy="82" r="2" fill="#ffffff" stroke="#1e50a2" strokeWidth="1"/>
    {/* Ống nghiệm 3 */}
    <path d="M 140 70 L 140 140 A 10 10 0 0 0 160 140 L 160 70 Z" stroke="#1e50a2" strokeWidth="4" fill="#ffffff" />
    <path d="M 142 90 L 142 140 A 8 8 0 0 0 158 140 L 158 90 Z" fill="#f5a623" />
    {/* Ống nghiệm 4 */}
    <path d="M 170 70 L 170 140 A 10 10 0 0 0 190 140 L 190 70 Z" stroke="#1e50a2" strokeWidth="4" fill="#ffffff" />
    <path d="M 172 120 L 172 140 A 8 8 0 0 0 188 140 L 188 120 Z" fill="#1e50a2" />
    {/* Kính lúp */}
    <g transform="translate(190, 40) rotate(45)">
      <circle cx="40" cy="40" r="30" fill="#ffffff" stroke="#1e50a2" strokeWidth="6"/>
      <circle cx="40" cy="40" r="24" fill="#6aa8e8" opacity="0.3"/>
      <rect x="36" y="70" width="8" height="40" rx="4" fill="#f5a623" stroke="#1e50a2" strokeWidth="4"/>
    </g>
  </svg>
);

// 2. Đường Ống Chuyển Hóa: 4 vòng tròn nối nhau bằng mũi tên cong. Vòng tròn 3 nét đứt.
export const PipelineArt = () => (
  <svg viewBox="0 0 320 180" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#6aa8e8" opacity="0.1"/>
    {/* Mũi tên */}
    <path d="M 60 90 Q 95 50 130 90" stroke="#1e50a2" strokeWidth="4" fill="none" markerEnd="url(#arrow)"/>
    <path d="M 130 90 Q 165 130 200 90" stroke="#1e50a2" strokeWidth="4" fill="none" markerEnd="url(#arrow)"/>
    <path d="M 200 90 Q 235 50 270 90" stroke="#1e50a2" strokeWidth="4" fill="none" markerEnd="url(#arrow)"/>
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e50a2" />
      </marker>
    </defs>
    {/* Vòng tròn 1 */}
    <circle cx="50" cy="90" r="20" fill="#1e50a2" />
    <circle cx="50" cy="90" r="10" fill="#ffffff" />
    {/* Vòng tròn 2 */}
    <circle cx="120" cy="90" r="20" fill="#f5a623" />
    <circle cx="120" cy="90" r="10" fill="#ffffff" />
    {/* Vòng tròn 3 (nét đứt) */}
    <circle cx="190" cy="90" r="18" fill="#ffffff" stroke="#1e50a2" strokeWidth="4" strokeDasharray="6 6" />
    {/* Vòng tròn 4 */}
    <circle cx="260" cy="90" r="20" fill="#6aa8e8" />
    <circle cx="260" cy="90" r="10" fill="#ffffff" />
  </svg>
);

// 3. Ghép Tên Gọi IUPAC: 4 thẻ bài so le, 2 úp, 2 lật hiện mạch zigzag.
export const IUPACArt = () => (
  <svg viewBox="0 0 320 180" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#1e50a2" opacity="0.05"/>
    {/* Thẻ 1 (lật) */}
    <g transform="translate(40, 50) rotate(-10)">
      <rect width="50" height="70" rx="6" fill="#ffffff" stroke="#1e50a2" strokeWidth="3"/>
      <path d="M 10 40 L 25 25 L 40 40" stroke="#f5a623" strokeWidth="3" strokeLinejoin="round" fill="none"/>
    </g>
    {/* Thẻ 2 (úp) */}
    <g transform="translate(100, 70) rotate(5)">
      <rect width="50" height="70" rx="6" fill="#6aa8e8" stroke="#1e50a2" strokeWidth="3"/>
      <circle cx="25" cy="35" r="12" fill="#ffffff" opacity="0.5"/>
    </g>
    {/* Thẻ 3 (lật) */}
    <g transform="translate(170, 45) rotate(15)">
      <rect width="50" height="70" rx="6" fill="#ffffff" stroke="#1e50a2" strokeWidth="3"/>
      <path d="M 10 45 L 20 30 L 30 45 L 40 30" stroke="#1e50a2" strokeWidth="3" strokeLinejoin="round" fill="none"/>
    </g>
    {/* Thẻ 4 (úp) */}
    <g transform="translate(230, 60) rotate(-5)">
      <rect width="50" height="70" rx="6" fill="#f5a623" stroke="#1e50a2" strokeWidth="3"/>
      <rect x="15" y="25" width="20" height="20" fill="#ffffff" opacity="0.5" rx="2"/>
    </g>
  </svg>
);

// 4. Cân Bằng Thần Tốc: cân hai đĩa thăng bằng, mỗi đĩa 2 khối vuông, phía trên có đồng hồ.
export const BalanceArt = () => (
  <svg viewBox="0 0 320 180" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#f5a623" opacity="0.1"/>
    {/* Đồng hồ */}
    <circle cx="160" cy="40" r="20" fill="#ffffff" stroke="#1e50a2" strokeWidth="4"/>
    <path d="M 160 40 L 160 25 M 160 40 L 170 45" stroke="#f5a623" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 150 15 L 170 15" stroke="#1e50a2" strokeWidth="4" strokeLinecap="round"/>
    
    {/* Chân cân */}
    <path d="M 160 80 L 160 150 M 130 150 L 190 150" stroke="#1e50a2" strokeWidth="6" strokeLinecap="round"/>
    {/* Đòn cân */}
    <path d="M 80 80 L 240 80" stroke="#1e50a2" strokeWidth="6" strokeLinecap="round"/>
    {/* Đĩa trái */}
    <path d="M 80 80 L 60 120 L 100 120 Z" fill="#6aa8e8" stroke="#1e50a2" strokeWidth="3" strokeLinejoin="round"/>
    {/* Khối vuông trái */}
    <rect x="65" y="100" width="15" height="15" fill="#f5a623" stroke="#1e50a2" strokeWidth="2"/>
    <rect x="80" y="100" width="15" height="15" fill="#ffffff" stroke="#1e50a2" strokeWidth="2"/>
    
    {/* Đĩa phải */}
    <path d="M 240 80 L 220 120 L 260 120 Z" fill="#6aa8e8" stroke="#1e50a2" strokeWidth="3" strokeLinejoin="round"/>
    {/* Khối vuông phải */}
    <rect x="225" y="100" width="15" height="15" fill="#ffffff" stroke="#1e50a2" strokeWidth="2"/>
    <rect x="240" y="100" width="15" height="15" fill="#f5a623" stroke="#1e50a2" strokeWidth="2"/>
  </svg>
);

// 5. Leo Tháp Hóa Học: tháp bậc thang 5 tầng đi lên, tầng 5 có ngôi sao, 2 tầng tô cam.
export const TowerArt = () => (
  <svg viewBox="0 0 320 180" width="100%" height="auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="180" fill="#6aa8e8" opacity="0.1"/>
    {/* Bậc 1 */}
    <rect x="40" y="140" width="40" height="20" fill="#1e50a2" />
    {/* Bậc 2 (cam) */}
    <rect x="80" y="120" width="40" height="40" fill="#f5a623" />
    {/* Bậc 3 */}
    <rect x="120" y="100" width="40" height="60" fill="#6aa8e8" />
    {/* Bậc 4 (cam) */}
    <rect x="160" y="80" width="40" height="80" fill="#f5a623" />
    {/* Bậc 5 */}
    <rect x="200" y="60" width="40" height="100" fill="#1e50a2" />
    
    {/* Viền bậc */}
    <path d="M 40 140 L 80 140 L 80 120 L 120 120 L 120 100 L 160 100 L 160 80 L 200 80 L 200 60 L 240 60 L 240 160 L 40 160 Z" stroke="#1e50a2" strokeWidth="4" strokeLinejoin="round"/>
    
    {/* Ngôi sao trên đỉnh */}
    <path d="M 220 30 L 225 45 L 240 45 L 228 55 L 232 70 L 220 60 L 208 70 L 212 55 L 200 45 L 215 45 Z" fill="#f5a623" stroke="#1e50a2" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);
