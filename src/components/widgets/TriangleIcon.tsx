import React from "react";

export default function TriangleIcon({ size = 24, style }: { size?: number, style?: React.CSSProperties }) {
  // 사이트 로고용: 코어 베이스 비율을 유지하되, 작은 화면(파비콘, GNB)에서도 명확히 보이도록 선 굵기를 크게 올리고 단순화한 디자인
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      {/* 굵은 기본 원형 */}
      <circle 
        cx="50" cy="44" r="38" 
        fill="none" 
        stroke="var(--color-emerald)" 
        strokeWidth="6" 
      />
      {/* 굵은 역삼각형 */}
      <polygon 
        points="5,18 95,18 50,96"
        fill="none" 
        stroke="var(--color-neon-cyan)" 
        strokeWidth="6" 
        strokeLinejoin="round"
      />
      {/* 단순명료한 Y자 라인 */}
      <g stroke="var(--color-amber-gold)" strokeWidth="5" opacity="0.9" strokeLinecap="round">
        <line x1="50" y1="44" x2="5" y2="18" />
        <line x1="50" y1="44" x2="95" y2="18" />
        <line x1="50" y1="44" x2="50" y2="96" />
      </g>
      {/* 강조된 중앙 코어 점 */}
      <circle 
        cx="50" cy="44" r="6" 
        fill="var(--color-amber-gold)" 
      />
    </svg>
  );
}
