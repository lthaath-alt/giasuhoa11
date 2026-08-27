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

const node = (cx: number, fill: string) => (
  <g key={cx}>
    <circle cx={cx} cy="75" r="22" fill={fill} />
    <circle cx={cx} cy="75" r="8.5" fill={WHITE} />
  </g>
);

const arrow = (x: number) => (
  <path key={x} d={`M ${x - 4} 67 L ${x + 4} 75 L ${x - 4} 83`} fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
);

export const PipelineArt = () => (
  <ArtFrame bg="#e6f4f1">
    <rect x="44" y="53" width="232" height="44" rx="22" fill={WHITE} opacity="0.75" />
    <rect x="44" y="53" width="232" height="44" rx="22" fill="none" stroke={SKY} strokeWidth="3" />
    {node(70, BLUE)}
    {node(128, ORANGE)}
    {node(244, SKY)}
    <circle cx="186" cy="75" r="20" fill={WHITE} stroke={BLUE} strokeWidth="3.5" strokeDasharray="7 6" />
    {arrow(99)}
    {arrow(157)}
    {arrow(215)}
  </ArtFrame>
);

const card = (cx: number, cy: number, rot: number, fill: string, inner: React.ReactNode) => (
  <g key={cx} transform={`translate(${cx} ${cy}) rotate(${rot})`}>
    <rect x="-27" y="-39" width="54" height="78" rx="8" fill={fill} stroke={BLUE} strokeWidth="3.5" />
    {inner}
  </g>
);

export const IUPACArt = () => (
  <ArtFrame bg="#fdf0e0">
    {card(92, 72, -12, WHITE,
      <path d="M -16 8 L -5 -9 L 6 8 L 17 -9" fill="none" stroke={ORANGE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    )}
    {card(138, 78, -4, SKY,
      <>
        <circle cx="0" cy="0" r="14" fill={WHITE} opacity="0.5" />
        <circle cx="0" cy="0" r="6" fill={WHITE} opacity="0.7" />
      </>
    )}
    {card(184, 74, 6, WHITE,
      <path d="M -16 6 L -5 -11 L 6 6 L 17 -11" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    )}
    {card(230, 68, 14, ORANGE,
      <rect x="-12" y="-12" width="24" height="24" rx="5" fill={WHITE} opacity="0.55" />
    )}
  </ArtFrame>
);

export const BalanceArt = () => (
  <ArtFrame bg="#eef0f7">
    <rect x="152" y="21" width="16" height="6" rx="2.5" fill={BLUE} />
    <circle cx="160" cy="45" r="17" fill={WHITE} stroke={BLUE} strokeWidth="4.5" />
    <path d="M 160 45 V 34 M 160 45 L 168 50" stroke={ORANGE} strokeWidth="3.5" strokeLinecap="round" />
    <rect x="156" y="74" width="9" height="46" fill={BLUE} />
    <path d="M 136 120 H 185 L 192 130 H 129 Z" fill={BLUE} />
    <path d="M 160 64 L 171 76 H 149 Z" fill={BLUE} />
    <line x1="66" y1="72" x2="254" y2="72" stroke={BLUE} strokeWidth="7.5" strokeLinecap="round" />
    <line x1="66" y1="72" x2="44" y2="95" stroke={BLUE} strokeWidth="2.5" />
    <line x1="66" y1="72" x2="88" y2="95" stroke={BLUE} strokeWidth="2.5" />
    <path d="M 42 95 H 90 Q 66 116 42 95 Z" fill={SKY} stroke={BLUE} strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="49" y="77" width="17" height="17" rx="2" fill={ORANGE} stroke={BLUE} strokeWidth="2.5" />
    <rect x="66" y="77" width="17" height="17" rx="2" fill={WHITE} stroke={BLUE} strokeWidth="2.5" />
    <line x1="254" y1="72" x2="232" y2="95" stroke={BLUE} strokeWidth="2.5" />
    <line x1="254" y1="72" x2="276" y2="95" stroke={BLUE} strokeWidth="2.5" />
    <path d="M 230 95 H 278 Q 254 116 230 95 Z" fill={SKY} stroke={BLUE} strokeWidth="3.5" strokeLinejoin="round" />
    <rect x="237" y="77" width="17" height="17" rx="2" fill={WHITE} stroke={BLUE} strokeWidth="2.5" />
    <rect x="254" y="77" width="17" height="17" rx="2" fill={ORANGE} stroke={BLUE} strokeWidth="2.5" />
  </ArtFrame>
);

export const TowerArt = () => (
  <ArtFrame bg="#fbeceb">
    <rect x="52" y="108" width="42" height="20" fill={BLUE} />
    <rect x="94" y="93" width="42" height="35" fill={ORANGE} />
    <rect x="136" y="78" width="42" height="50" fill={SKY} />
    <rect x="178" y="63" width="42" height="65" fill={ORANGE} />
    <rect x="220" y="48" width="42" height="80" fill={BLUE} />
    <path d="M 52 128 V 108 H 94 V 93 H 136 V 78 H 178 V 63 H 220 V 48 H 262 V 128 Z" fill="none" stroke={BLUE} strokeWidth="4" strokeLinejoin="round" />
    <path d="M 241 21 L 244.2 29.6 L 253.4 30 L 246.2 35.7 L 248.6 44.5 L 241 39.5 L 233.4 44.5 L 235.8 35.7 L 228.6 30 L 237.8 29.6 Z" fill={ORANGE} stroke={BLUE} strokeWidth="3" strokeLinejoin="round" />
  </ArtFrame>
);