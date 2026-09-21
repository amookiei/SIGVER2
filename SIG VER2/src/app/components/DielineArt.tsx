import { motion } from "motion/react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

interface DielineArtProps {
  /** 라인 색 (기본: 밝은 배경용 다크) */
  color?: string;
  /** 보조 텍스트/치수선 색 */
  muted?: string;
  style?: React.CSSProperties;
}

/**
 * 스탠드업 파우치(도이팩) 칼선 도면을 스크롤 진입 시 그려 주는 장식 SVG.
 * siging 이 만들어 내는 결과물(칼선·실링 영역·치수)을 시각 언어로 보여 줍니다.
 */
export function DielineArt({ color = "#0D0D0D", muted = "#B5B5B5", style }: DielineArtProps) {
  const draw = (delay: number, duration = 1.2) => ({
    initial: { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration, delay, ease: "easeInOut" as const },
  });

  return (
    <svg viewBox="0 0 420 520" fill="none" style={{ width: "100%", height: "auto", display: "block", ...style }} aria-hidden="true">
      {/* 외곽 (블리드 포함) */}
      <motion.rect x="40" y="40" width="340" height="440" rx="2" stroke={muted} strokeWidth="1" strokeDasharray="4 6" {...draw(0, 1.4)} />
      {/* 본체 칼선 */}
      <motion.path d="M60 60 H360 V460 H60 Z" stroke={color} strokeWidth="1.8" {...draw(0.2, 1.4)} />
      {/* 상단 실링 */}
      <motion.path d="M60 60 V96 H360 V60" stroke={color} strokeWidth="1.2" {...draw(0.6, 0.9)} />
      <motion.path d="M60 96 H360" stroke={color} strokeWidth="1.2" strokeDasharray="6 5" {...draw(0.7, 0.9)} />
      {/* 좌우 실링 */}
      <motion.path d="M84 96 V400" stroke={color} strokeWidth="1.2" strokeDasharray="6 5" {...draw(0.9, 1.0)} />
      <motion.path d="M336 96 V400" stroke={color} strokeWidth="1.2" strokeDasharray="6 5" {...draw(0.9, 1.0)} />
      {/* 하단 거싯 (W자 접힘) */}
      <motion.path d="M60 400 L110 460 L210 420 L310 460 L360 400" stroke={color} strokeWidth="1.2" {...draw(1.2, 1.0)} />
      <motion.path d="M60 400 H360" stroke={color} strokeWidth="1.2" strokeDasharray="3 5" {...draw(1.3, 0.8)} />
      {/* 노치 */}
      <motion.path d="M60 130 l10 6 l-10 6 M360 130 l-10 6 l10 6" stroke={color} strokeWidth="1.4" {...draw(1.6, 0.4)} />
      {/* 디자인 영역 안전선 */}
      <motion.rect x="100" y="112" width="220" height="272" stroke={muted} strokeWidth="1" strokeDasharray="2 4" {...draw(1.5, 1.0)} />

      {/* 치수선: 폭 */}
      <motion.path d="M60 500 H360" stroke={muted} strokeWidth="1" {...draw(1.9, 0.6)} />
      <motion.path d="M60 494 V506 M360 494 V506" stroke={muted} strokeWidth="1" {...draw(2.0, 0.3)} />
      <motion.text x="210" y="516" textAnchor="middle" fontFamily={F} fontSize="11" fill={muted} letterSpacing="0.08em"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.1, duration: 0.5 }}>
        W 150
      </motion.text>
      {/* 치수선: 높이 */}
      <motion.path d="M400 60 V460" stroke={muted} strokeWidth="1" {...draw(1.9, 0.6)} />
      <motion.path d="M394 60 H406 M394 460 H406" stroke={muted} strokeWidth="1" {...draw(2.0, 0.3)} />
      <motion.text x="404" y="270" textAnchor="middle" fontFamily={F} fontSize="11" fill={muted} letterSpacing="0.08em" transform="rotate(90 404 270)"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.1, duration: 0.5 }}>
        H 200
      </motion.text>

      {/* 라벨 */}
      {[
        { x: 210, y: 82, t: "TOP SEAL 8" },
        { x: 72, y: 250, t: "SIDE 6", r: -90 },
        { x: 348, y: 250, t: "SIDE 6", r: 90 },
        { x: 210, y: 446, t: "GUSSET 30" },
        { x: 210, y: 250, t: "DESIGN AREA", big: true },
      ].map((l, i) => (
        <motion.text
          key={i}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontFamily={F}
          fontSize={l.big ? 12 : 9}
          fill={l.big ? color : muted}
          letterSpacing="0.14em"
          transform={l.r ? `rotate(${l.r} ${l.x} ${l.y})` : undefined}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: l.big ? 0.9 : 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.8 + i * 0.1, duration: 0.5 }}
        >
          {l.t}
        </motion.text>
      ))}
    </svg>
  );
}
