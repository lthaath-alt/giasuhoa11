import React from 'react';

type FrameProps = { bg: string; children: React.ReactNode };

const ArtFrame: React.FC<FrameProps> = ({ bg, children }) => (
  <svg
    viewBox="0 0 320 150"
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <rect x="-100" y="-80" width="520" height="310" fill={bg} />
    {children}
  </svg>
);

const BLUE = '#1e50a2';
const SKY = '#6aa8e8';
const ORANGE = '#f5a623';
const WHITE = '#ffffff';

const tube = (cx: number, level: number, fill: string) => (
  <g key={cx}>
    <path d={`M ${cx - 11} 38 V 101 A 11 11 0 0 0 ${cx + 11} 101 V 38 Z`} fill={WHITE} stroke={BLUE} strokeWidth="3.5" />
    <path d={`M ${cx - 8.5} ${level} V 101 A 8.5 8.5 0 0 0 ${cx + 8.5} 101 V ${level} Z`} fill={fill} />
    <ellipse cx={cx} cy="38" rx="11" ry="3" fill={WHITE} stroke={BLUE} strokeWidth="3.5" />
  </g>
);

export const DetectiveArt = () => (
  <ArtFrame bg="#e8f0fb">
    <rect x="60" y="110" width="128" height="13" rx="5" fill={ORANGE} />
    <rect x="66" y="123" width="10" height="8" rx="2" fill={ORANGE} />
    <rect x="172" y="123" width="10" height="8" rx="2" fill={ORANGE} />
    {tube(80, 68, SKY)}
    {tube(112, 79, SKY)}
    {tube(144, 58, ORANGE)}
    {tube(176, 88, BLUE)}
    <circle cx="112" cy="70" r="3.6" fill={WHITE} stroke={BLUE} strokeWidth="1.8" />
    <circle cx="107" cy="59" r="2.6" fill={WHITE} stroke={BLUE} strokeWidth="1.5" />
    <circle cx="117" cy="50" r="2" fill={WHITE} stroke={BLUE} strokeWidth="1.3" />
    <line x1="234" y1="80" x2="256" y2="106" stroke={ORANGE} strokeWidth="10" strokeLinecap="round" />
    <line x1="234" y1="80" x2="256" y2="106" stroke={BLUE} strokeWidth="4" strokeLinecap="round" opacity="0.35" />
    <circle cx="217" cy="61" r="26" fill={WHITE} opacity="0.9" />
    <circle cx="217" cy="61" r="26" fill="none" stroke={BLUE} strokeWidth="7" />
    <path d="M 203 51 Q 209 44 219 44" stroke={SKY} strokeWidth="4" fill="none" strokeLinecap="round" />
  </ArtFrame>
);

/* Giải Cứu Phòng Thí Nghiệm: một khung màn platformer — nền đất, bệ gạch,
   ô ?, đồng xu, nhân vật đang nhảy và cái lồng giam ở cuối màn. */
export const RescueArt = () => {
  const brick = (x: number, y: number, w: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height="14" rx="2" fill="#b5622f" stroke={BLUE} strokeWidth="2.5" />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + 14} stroke={BLUE} strokeWidth="1.6" opacity="0.5" />
    </g>
  );
  return (
    <ArtFrame bg="#dcecfa">
      {/* ống khói nhà máy ở xa */}
      <rect x="18" y="34" width="20" height="80" fill={WHITE} opacity="0.85" />
      <rect x="44" y="52" width="14" height="62" fill={WHITE} opacity="0.7" />
      <circle cx="28" cy="26" r="8" fill={WHITE} opacity="0.6" />
      <circle cx="38" cy="14" r="6" fill={WHITE} opacity="0.45" />

      {/* nền đất */}
      <rect x="-10" y="114" width="340" height="46" fill="#b5622f" />
      <rect x="-10" y="114" width="340" height="7" fill="#5fb84c" />

      {/* ô ? và bệ gạch */}
      <rect x="96" y="46" width="26" height="26" rx="3" fill={ORANGE} stroke={BLUE} strokeWidth="3" />
      <text
        x="109"
        y="64"
        fontSize="19"
        fontWeight="bold"
        fill={BLUE}
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        ?
      </text>
      {brick(122, 52, 26)}
      {brick(168, 78, 52)}

      {/* đồng xu */}
      <ellipse cx="140" cy="30" rx="7" ry="10" fill={ORANGE} stroke={BLUE} strokeWidth="2.5" />
      <ellipse cx="160" cy="24" rx="5" ry="8" fill={ORANGE} stroke={BLUE} strokeWidth="2" opacity="0.75" />

      {/* nhân vật đang nhảy, mặc áo blouse */}
      <g>
        <rect x="66" y="86" width="7" height="12" rx="2" fill={BLUE} />
        <rect x="76" y="88" width="7" height="10" rx="2" fill={BLUE} />
        <rect x="63" y="70" width="23" height="18" rx="4" fill={WHITE} stroke={BLUE} strokeWidth="2.5" />
        <circle cx="74" cy="58" r="10" fill="#f6cba3" stroke={BLUE} strokeWidth="2.5" />
        <rect x="65" y="49" width="18" height="5" rx="2" fill="#3a2a1c" />
        <rect x="66" y="56" width="15" height="5" rx="2" fill={SKY} />
      </g>

      {/* lồng giam ở cuối màn */}
      <rect x="252" y="66" width="46" height="48" fill={WHITE} opacity="0.55" />
      <rect x="258" y="80" width="16" height="34" rx="3" fill={WHITE} stroke={BLUE} strokeWidth="2" />
      <circle cx="266" cy="72" r="8" fill="#f6cba3" stroke={BLUE} strokeWidth="2" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={252 + i * 11.5}
          y1="64"
          x2={252 + i * 11.5}
          y2="114"
          stroke={BLUE}
          strokeWidth="3"
        />
      ))}
      <line x1="252" y1="64" x2="298" y2="64" stroke={BLUE} strokeWidth="3.5" />
    </ArtFrame>
  );
};

export const BoardGameArt = () => (
  <ArtFrame bg="#eaf3ec">
    {/* Đường đi bàn cờ: các ô vuông uốn lượn từ trái sang phải */}
    {[
      [46, 104], [74, 104], [102, 104],
      [102, 76], [102, 48],
      [130, 48], [158, 48],
      [158, 76], [158, 104],
      [186, 104], [214, 104],
      [214, 76], [242, 76],
    ].map(([x, y], i) => (
      <rect
        key={i}
        x={x}
        y={y}
        width="24"
        height="24"
        rx="5"
        fill={i === 12 ? ORANGE : i % 3 === 0 ? SKY : WHITE}
        stroke={BLUE}
        strokeWidth="3"
      />
    ))}

    {/* Quân cờ đang đứng trên ô thứ tư */}
    <ellipse cx="114" cy="74" rx="9" ry="3.5" fill={BLUE} opacity="0.25" />
    <path d="M 108 70 Q 108 58 114 58 Q 120 58 120 70 Z" fill={ORANGE} stroke={BLUE} strokeWidth="3" strokeLinejoin="round" />
    <circle cx="114" cy="54" r="6" fill={ORANGE} stroke={BLUE} strokeWidth="3" />

    {/* Xúc xắc mặt 5 */}
    <rect x="252" y="24" width="42" height="42" rx="9" fill={WHITE} stroke={BLUE} strokeWidth="3.5" />
    <circle cx="263" cy="35" r="3.6" fill={BLUE} />
    <circle cx="283" cy="35" r="3.6" fill={BLUE} />
    <circle cx="273" cy="45" r="3.6" fill={ORANGE} />
    <circle cx="263" cy="55" r="3.6" fill={BLUE} />
    <circle cx="283" cy="55" r="3.6" fill={BLUE} />

    {/* Lá cờ đích */}
    <line x1="254" y1="76" x2="254" y2="104" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M 254 78 H 276 L 270 85 L 276 92 H 254 Z" fill={ORANGE} stroke={BLUE} strokeWidth="3" strokeLinejoin="round" />
  </ArtFrame>
);


/** Hình cho trò Rắn và Thang: bàn cờ ô vuông, một cái thang và một con rắn. */
export const SnakeLadderArt = () => (
  <svg viewBox="0 0 320 150" xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="Bàn cờ rắn và thang">
    <rect width="320" height="150" fill="#f3f7fb" />
    {Array.from({ length: 30 }, (_, i) => {
      const c = i % 10, h = Math.floor(i / 10);
      return (
        <rect key={i} x={12 + c * 29.5} y={22 + h * 34} width={27} height={31} rx={4}
              fill={(c + h) % 2 ? '#e2ebf3' : '#ffffff'} stroke="#cbd8e4" strokeWidth="1.5" />
      );
    })}
    {/* Thang */}
    <g stroke="#12855f" strokeWidth="4" strokeLinecap="round">
      <line x1="56" y1="118" x2="86" y2="34" />
      <line x1="72" y1="120" x2="102" y2="36" />
      <line x1="62" y1="98" x2="78" y2="100" />
      <line x1="68" y1="76" x2="84" y2="78" />
      <line x1="74" y1="54" x2="90" y2="56" />
    </g>
    {/* Rắn */}
    <path d="M232 34 C 205 52, 262 74, 232 94 C 208 110, 246 118, 246 126"
          fill="none" stroke="#c2372a" strokeWidth="9" strokeLinecap="round" />
    <circle cx="232" cy="32" r="8" fill="#c2372a" />
    <circle cx="229" cy="30" r="1.8" fill="#fff" />
    <circle cx="235" cy="30" r="1.8" fill="#fff" />
    {/* Xúc xắc */}
    <g transform="translate(140 96)">
      <rect width="34" height="34" rx="7" fill="#ffffff" stroke="#12242e" strokeWidth="3" />
      <circle cx="10" cy="10" r="3.2" fill="#12242e" />
      <circle cx="24" cy="10" r="3.2" fill="#12242e" />
      <circle cx="17" cy="17" r="3.2" fill="#12242e" />
      <circle cx="10" cy="24" r="3.2" fill="#12242e" />
      <circle cx="24" cy="24" r="3.2" fill="#12242e" />
    </g>
  </svg>
);
