import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useGallery } from "../context/GalleryContext";
import { useSEO } from "../hooks/useSEO";
import { useExperiment } from "../hooks/useExperiment";
import { motion, useMotionValue, useSpring } from "motion/react";
import { LogoSymbol } from "../components/LogoSymbol";
import { useAdmin } from "../context/AdminContext";
import { useHomeContent } from "../context/HomeContentContext";
import type { HomeClient } from "../context/HomeContentContext";
import type { PortfolioItem } from "../data/portfolio";
import { capabilities, processSteps, sigingFeatures, SIGING_URL } from "../data/capabilities";
import { DielineArt } from "../components/DielineArt";
import { getIntroDelay } from "../components/LogoIntro";
import sigingMark from "../../assets/images/siging-mark.svg";

// ─── Design tokens ───────────────────────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const CREAM = "#F5F3EF";
const TEXT2 = "#666666";
const TEXT3 = "#999999";
const EASE = [0.76, 0, 0.24, 1] as const;
const SIGING_GRAD = "linear-gradient(135deg, #f78f4e 0%, #ef4c90 50%, #7a59a6 100%)";

// ─── Row layout grouping ──────────────────────────────────
type RowConfig =
  | { type: "A"; item: PortfolioItem }
  | { type: "B"; item: PortfolioItem }
  | { type: "C"; item: PortfolioItem }
  | { type: "D"; items: [PortfolioItem, PortfolioItem] };

function groupIntoRows(items: PortfolioItem[]): RowConfig[] {
  const rows: RowConfig[] = [];
  const pattern = ["A", "B", "C", "D"] as const;
  let i = 0, p = 0;
  while (i < items.length) {
    const type = pattern[p % 4];
    if (type === "D") {
      if (i + 1 < items.length) {
        rows.push({ type: "D", items: [items[i], items[i + 1]] as [PortfolioItem, PortfolioItem] });
        i += 2;
      } else {
        rows.push({ type: "B", item: items[i] });
        i++;
      }
    } else {
      rows.push({ type, item: items[i] });
      i++;
    }
    p++;
  }
  return rows;
}

// ─── Image cell with cursor-tracking hover button ─────────
function ImageHoverCell({
  item,
  aspectRatio = "16/9",
  revealClass = "work-img-reveal",
}: {
  item: PortfolioItem;
  aspectRatio?: string;
  revealClass?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const btnX = useSpring(mouseX, { stiffness: 280, damping: 28 });
  const btnY = useSpring(mouseY, { stiffness: 280, damping: 28 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  return (
    <Link to={`/work/${item.slug}`} data-cursor="view">
      <div
        ref={containerRef}
        style={{
          position: "relative",
          overflow: "hidden",
          aspectRatio,
          backgroundColor: "#F0F0F0",
          display: "block",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={onMouseMove}
      >
        {/* GSAP reveal wrapper — starts fully clipped */}
        <div
          className={revealClass}
          style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 100% 0)" }}
        >
          <motion.img
            src={item.heroImage}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>

        {/* Cursor-tracking circular button */}
        <motion.div
          style={{
            position: "absolute",
            x: btnX,
            y: btnY,
            translateX: "-50%",
            translateY: "-50%",
            pointerEvents: "none",
            zIndex: 10,
          }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
          transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.85)",
              backgroundColor: "rgba(13,13,13,0.68)",
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
            }}
          >
            <span style={{ color: "#FAFAFA", fontSize: "15px", lineHeight: 1 }}>→</span>
            <LogoSymbol
              style={{
                color: "#FAFAFA",
                width: "9px",
                height: "9px",
                display: "block",
                animationName: "sigSpin",
                animationDuration: "3s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            />
          </div>
        </motion.div>
      </div>
    </Link>
  );
}

// ─── Project info block ───────────────────────────────────
function ProjectInfo({
  item,
  titleSize = "clamp(22px, 3vw, 40px)",
  pad = "32px 32px",
}: {
  item: PortfolioItem;
  titleSize?: string;
  pad?: string;
}) {
  return (
    <motion.div
      style={{ padding: pad }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Title + Year */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <Link to={`/work/${item.slug}`} data-cursor="hover-link">
          <motion.h3
            whileHover={{ x: 6 }}
            transition={{ duration: 0.25 }}
            style={{
              fontFamily: F,
              fontWeight: 700,
              fontSize: titleSize,
              color: DARK,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              textTransform: "uppercase",
              maxWidth: "75%",
            }}
          >
            {item.title}
          </motion.h3>
        </Link>
        <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3, paddingTop: "6px" }}>
          {item.year}
        </span>
      </div>

      {/* Tagline — hover: grey → dark */}
      <motion.p
        whileHover={{ color: DARK }}
        transition={{ duration: 0.22 }}
        style={{
          fontFamily: F, fontSize: "13px", color: TEXT3,
          letterSpacing: "0.01em", lineHeight: 1.5,
          marginBottom: "12px", cursor: "default",
        }}
      >
        {item.tagline}
      </motion.p>

      {/* Description — hover: grey → dark, 3-line clamp */}
      <motion.p
        whileHover={{ color: DARK }}
        transition={{ duration: 0.22 }}
        style={{
          fontFamily: F, fontSize: "12px", color: TEXT3,
          lineHeight: 1.7, marginBottom: "16px",
          display: "-webkit-box", WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          cursor: "default",
        } as React.CSSProperties}
      >
        {item.description}
      </motion.p>

      {/* Category badge */}
      <span style={{
        display: "inline-block",
        fontFamily: F, fontSize: "10px", fontWeight: 600,
        color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase",
        border: `1px solid #D8D8D8`, padding: "4px 10px",
      }}>
        {item.category}
      </span>
    </motion.div>
  );
}

// Row A — Full-width hero
function RowA({ item }: { item: PortfolioItem }) {
  return (
    <div style={{ borderBottom: BORDER }}>
      <ImageHoverCell item={item} aspectRatio="16/9" />
      <div style={{ borderTop: BORDER }} className="px-8 md:px-16 lg:px-28">
        <ProjectInfo item={item} titleSize="clamp(24px, 3.5vw, 48px)" pad="28px 0" />
      </div>
    </div>
  );
}

// Row B — 40% text : 60% image
function RowB({ item }: { item: PortfolioItem }) {
  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ borderBottom: BORDER, minHeight: "400px" }}
    >
      <div
        className="pl-8 md:pl-16 lg:pl-28"
        style={{
          flex: "0 0 40%",
          borderRight: BORDER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <ProjectInfo item={item} titleSize="clamp(20px, 2.8vw, 36px)" pad="40px 24px 40px 0" />
      </div>
      <div style={{ flex: "0 0 60%", minHeight: "340px" }}>
        <ImageHoverCell item={item} aspectRatio="4/3" />
      </div>
    </div>
  );
}

// Row C — 30% text : 70% image
function RowC({ item }: { item: PortfolioItem }) {
  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ borderBottom: BORDER, minHeight: "360px" }}
    >
      <div
        className="pl-8 md:pl-16 lg:pl-28"
        style={{
          flex: "0 0 30%",
          borderRight: BORDER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <ProjectInfo item={item} titleSize="clamp(18px, 2.4vw, 30px)" pad="40px 24px 40px 0" />
      </div>
      <div style={{ flex: "0 0 70%", minHeight: "320px" }}>
        <ImageHoverCell item={item} aspectRatio="16/10" />
      </div>
    </div>
  );
}

// Row D — 2 equal columns
function RowD({ items }: { items: [PortfolioItem, PortfolioItem] }) {
  const [hoveredSide, setHoveredSide] = useState<number | null>(null);
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ borderBottom: BORDER }}
    >
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          onMouseEnter={() => setHoveredSide(i)}
          onMouseLeave={() => setHoveredSide(null)}
          animate={{ opacity: hoveredSide !== null && hoveredSide !== i ? 0.45 : 1 }}
          transition={{ duration: 0.35 }}
          style={{
            borderRight: i === 0 ? BORDER : "none",
          }}
        >
          <ImageHoverCell item={item} aspectRatio="4/3" />
          <div
            style={{ borderTop: BORDER }}
            className={i === 0 ? "pl-8 md:pl-16 lg:pl-28" : "pr-8 md:pr-16 lg:pr-28"}
          >
            <ProjectInfo
              item={item}
              titleSize="clamp(16px, 2vw, 26px)"
              pad={i === 0 ? "24px 24px 24px 0" : "24px 0 24px 24px"}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Home Work Card (3-col grid) ──────────────────────────
function HomeWorkCard({ item, index }: { item: PortfolioItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const btnX = useSpring(mouseX, { stiffness: 280, damping: 28 });
  const btnY = useSpring(mouseY, { stiffness: 280, damping: 28 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      {/* Thumbnail */}
      <Link to={`/work/${item.slug}`} data-cursor="view">
        <div
          style={{ aspectRatio: "4/3", overflow: "hidden", position: "relative", backgroundColor: "#F0F0F0" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={onMouseMove}
        >
          {/* Base thumbnail */}
          <motion.img
            src={item.thumbnail}
            alt={item.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
            animate={{ scale: hovered && !item.thumbnailHover ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          />
          {/* Hover thumbnail crossfade */}
          {item.thumbnailHover && (
            <motion.img
              src={item.thumbnailHover}
              alt=""
              aria-hidden
              style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
          {/* Cursor-tracking circle button */}
          <motion.div
            style={{ position: "absolute", x: btnX, y: btnY, translateX: "-50%", translateY: "-50%", pointerEvents: "none", zIndex: 10 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.5 }}
            transition={{ duration: 0.26 }}
          >
            <div style={{
              width: 60, height: 60, borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.85)",
              backgroundColor: "rgba(13,13,13,0.65)",
              backdropFilter: "blur(6px)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              <span style={{ color: "#FAFAFA", fontSize: "12px" }}>→</span>
              <LogoSymbol style={{ color: "#FAFAFA", width: "8px", height: "8px", display: "block", animationName: "sigSpin", animationDuration: "3s", animationTimingFunction: "linear", animationIterationCount: "infinite" }} />
            </div>
          </motion.div>
          {/* Category tag */}
          <div style={{ position: "absolute", top: "12px", left: "12px" }}>
            <span style={{ fontFamily: F, fontSize: "9px", fontWeight: 600, color: "#FAFAFA", letterSpacing: "0.1em", textTransform: "uppercase", background: "rgba(13,13,13,0.55)", backdropFilter: "blur(6px)", padding: "3px 8px" }}>
              {item.category}
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: "20px 4px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <Link to={`/work/${item.slug}`} data-cursor="hover-link">
            <motion.h3
              whileHover={{ x: 4 }}
              transition={{ duration: 0.25 }}
              style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(15px, 1.6vw, 20px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", lineHeight: 1.2 }}
            >
              {item.title}
            </motion.h3>
          </Link>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, paddingTop: "3px", flexShrink: 0, marginLeft: "12px" }}>{item.year}</span>
        </div>

        {/* Tagline — hover: grey → dark */}
        <motion.p
          whileHover={{ color: DARK }}
          transition={{ duration: 0.22 }}
          style={{ fontFamily: F, fontSize: "12px", color: TEXT3, lineHeight: 1.5, marginBottom: "10px", cursor: "default" }}
        >
          {item.tagline}
        </motion.p>

        {/* Description — hover: grey → dark, 3-line clamp */}
        <motion.p
          whileHover={{ color: DARK }}
          transition={{ duration: 0.22 }}
          style={{
            fontFamily: F, fontSize: "12px", color: TEXT3, lineHeight: 1.7,
            marginBottom: "16px", display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
            cursor: "default",
          } as React.CSSProperties}
        >
          {item.description}
        </motion.p>

        {/* Category badge */}
        <span style={{ display: "inline-block", fontFamily: F, fontSize: "10px", fontWeight: 600, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase", border: `1px solid #D8D8D8`, padding: "4px 10px" }}>
          {item.category}
        </span>
      </div>
    </motion.div>
  );
}

// ─── CAPABILITIES ─────────────────────────────────────────
function CapabilitiesSection() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <section id="capabilities" style={{ borderBottom: BORDER }}>
      <div className="px-8 md:px-16 lg:px-28 py-10 flex items-center justify-between" style={{ borderBottom: BORDER }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
        >
          What we connect
        </motion.h2>
        <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.1em" }}>({String(capabilities.length).padStart(2, "0")})</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((c, i) => {
          const on = active === c.id;
          return (
            <motion.div
              key={c.id}
              className="px-8 md:px-10 py-12"
              onMouseEnter={() => setActive(c.id)}
              onMouseLeave={() => setActive(null)}
              data-cursor="hover-link"
              animate={{ backgroundColor: on ? DARK : BG }}
              transition={{ duration: 0.35 }}
              style={{
                borderRight: BORDER,
                borderBottom: BORDER,
                minHeight: "400px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "40px",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
              >
                <p style={{ fontFamily: F, fontSize: "11px", color: on ? "#777" : TEXT3, letterSpacing: "0.12em", marginBottom: "22px" }}>{c.num}</p>
                <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(24px, 2.2vw, 30px)", color: on ? BG : DARK, letterSpacing: "-0.03em", lineHeight: 1.0, margin: "0 0 12px", whiteSpace: "pre-line", textTransform: "uppercase" }}>
                  {c.title}
                </h3>
                <p style={{ fontFamily: F, fontSize: "13px", color: on ? "#9A9A9A" : TEXT3, letterSpacing: "0.02em", margin: 0 }}>{c.titleKo}</p>
              </motion.div>
              <div>
                <p style={{ fontFamily: F, fontSize: "14px", color: on ? "#BDBDBD" : TEXT2, lineHeight: 1.75, margin: "0 0 18px" }}>{c.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {c.items.map((it) => (
                    <li key={it} style={{ fontFamily: F, fontSize: "12.5px", color: on ? "#8A8A8A" : TEXT3, lineHeight: 1.9, display: "flex", gap: "10px" }}>
                      <span style={{ color: on ? "#555" : "#CCC" }}>—</span>
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

// ─── PROCESS ──────────────────────────────────────────────
function ProcessSection() {
  return (
    <section id="process" style={{ borderBottom: BORDER, backgroundColor: CREAM }}>
      <div className="px-8 md:px-16 lg:px-28 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
          <div>
            <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Process</p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
              style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(28px, 3.8vw, 48px)", color: DARK, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}
            >
              시안이 실물이 되기까지,<br />다섯 번의 검증.
            </motion.h2>
          </div>
          <motion.p
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.85, margin: 0, maxWidth: "620px" }}
          >
            디자인이 끝나는 곳에서 우리 일이 시작됩니다. 규격과 칼선은 생산 기준으로 잡고, 색은 제판 전에 시뮬레이션하고,
            현장에서는 측색값으로 판정합니다. 해외 파트너와 일할 때도 같은 문서와 같은 기준을 씁니다.
          </motion.p>
        </div>

        <div style={{ position: "relative" }}>
          <div className="hidden md:block" style={{ position: "absolute", top: "14px", left: 0, right: 0, height: "1px", backgroundColor: "#D8D5CF" }} />
          <motion.div
            className="hidden md:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.8, ease: EASE }}
            style={{ position: "absolute", top: "14px", left: 0, right: 0, height: "1px", backgroundColor: DARK, transformOrigin: "left center" }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-12">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.25 + i * 0.22 }}
                style={{ position: "relative" }}
              >
                <div
                  style={{
                    width: "29px",
                    height: "29px",
                    borderRadius: "50%",
                    border: `1px solid ${DARK}`,
                    backgroundColor: CREAM,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: F,
                    fontSize: "10px",
                    fontWeight: 700,
                    color: DARK,
                    letterSpacing: "0.04em",
                    marginBottom: "26px",
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "20px", color: DARK, letterSpacing: "-0.02em", margin: "0 0 10px" }}>{step.title}</h3>
                <p style={{ fontFamily: F, fontSize: "13.5px", color: TEXT2, lineHeight: 1.7, margin: "0 0 14px" }}>{step.desc}</p>
                {step.tool && (
                  <span style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BG, background: SIGING_GRAD, padding: "5px 9px", display: "inline-block" }}>
                    {step.tool}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SIGING PRODUCT ───────────────────────────────────────
function SigingSection() {
  return (
    <section id="siging" style={{ backgroundColor: DARK, position: "relative", overflow: "hidden" }}>
      <div className="px-8 md:px-16 lg:px-28 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: "28px" }}
          >
            <img src={sigingMark} alt="siging" width={26} height={26} style={{ display: "block" }} />
            <span style={{ fontFamily: F, fontSize: "11px", color: "#777", letterSpacing: "0.14em", textTransform: "uppercase" }}>Our product · siging.kr</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(32px, 4.6vw, 62px)", color: BG, letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 24px" }}
          >
            규격을 넣으면<br />칼선과 3D 목업이<br />
            <span style={{ background: SIGING_GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>바로 만들어집니다.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ fontFamily: F, fontSize: "15px", color: "#9A9A9A", lineHeight: 1.85, margin: "0 0 30px", maxWidth: "520px" }}
          >
            siging은 시그코퍼레이션이 직접 현장 감리에 쓰기 위해 만든 웹 패키지 스튜디오입니다. 샘플을 만들기 전에 화면에서
            검증하고, 상세페이지 이미지·적재 계획·그라비아 인쇄 감리까지 한 곳에서 끝냅니다. 기본 기능은 무료입니다.
          </motion.p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px", borderTop: "1px solid #262626" }}>
            {sigingFeatures.slice(0, 4).map((f, i) => (
              <motion.li
                key={f.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.2 + i * 0.07 }}
                style={{ display: "flex", gap: "14px", alignItems: "baseline", padding: "13px 0", borderBottom: "1px solid #262626" }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: SIGING_GRAD, flexShrink: 0, transform: "translateY(-2px)" }} />
                <span style={{ fontFamily: F, fontSize: "14.5px", color: "#DADADA", lineHeight: 1.5 }}>{f.title}</span>
              </motion.li>
            ))}
          </ul>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/siging" data-cursor="hover-button">
              <motion.span
                style={{ display: "inline-block", fontFamily: F, fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 32px", color: DARK, background: BG, border: `1px solid ${BG}` }}
                whileHover={{ background: "rgba(250,250,250,0)", color: BG }}
                transition={{ duration: 0.25 }}
              >
                자세히 보기 →
              </motion.span>
            </Link>
            <a href={SIGING_URL} target="_blank" rel="noopener noreferrer" data-cursor="hover-button">
              <motion.span
                style={{ display: "inline-block", fontFamily: F, fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 32px", color: BG, background: "transparent", border: "1px solid #444" }}
                whileHover={{ borderColor: BG }}
                transition={{ duration: 0.25 }}
              >
                siging.kr ↗
              </motion.span>
            </a>
          </motion.div>
        </div>

        {/* 칼선 드로잉 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ position: "relative", maxWidth: "520px", width: "100%", justifySelf: "center" }}
        >
          <div style={{ border: "1px solid #262626", backgroundColor: "#111111", padding: "clamp(20px, 4vw, 44px)" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: "18px" }}>
              <span style={{ fontFamily: F, fontSize: "10px", color: "#666", letterSpacing: "0.14em", textTransform: "uppercase" }}>Stand-up pouch · dieline</span>
              <span style={{ fontFamily: F, fontSize: "10px", color: "#666", letterSpacing: "0.14em" }}>150 × 200 · G30</span>
            </div>
            <DielineArt color="#FAFAFA" muted="#5A5A5A" />
          </div>
          {/* 질소 충전 인디케이터 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 2.2 }}
            style={{ position: "absolute", top: "-14px", right: "-8px", background: "#0D0D0D", border: "1px solid #333", padding: "10px 14px", minWidth: "150px" }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: "8px" }}>
              <span style={{ fontFamily: F, fontSize: "10px", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase" }}>N₂ Fill</span>
              <span style={{ fontFamily: F, fontSize: "11px", fontWeight: 700, color: BG }}>72%</span>
            </div>
            <div style={{ height: "3px", background: "#2A2A2A", overflow: "hidden" }}>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 0.72 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 2.4, ease: EASE }}
                style={{ height: "100%", background: SIGING_GRAD, transformOrigin: "left center" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── SELECTED WORKS SECTION ───────────────────────────────
function SelectedWorksSection() {
  const { getFeatured, items } = useAdmin();
  const featured = getFeatured();
  const displayItems = (featured.length > 0 ? featured : items).slice(0, 6);

  return (
    <section style={{ borderBottom: BORDER }}>
      {/* Header */}
      <div
        className="px-8 md:px-16 lg:px-28 pt-16 pb-10 flex items-end justify-between"
        style={{ borderBottom: BORDER }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(40px, 8vw, 100px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.88, textTransform: "uppercase", margin: 0 }}
        >
          SELECTED WORKS
        </motion.h2>
        <Link to="/work" data-cursor="hover-link" style={{ flexShrink: 0 }}>
          <motion.span
            style={{ fontFamily: F, fontSize: "13px", color: TEXT3, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}
            whileHover={{ color: DARK }}
            transition={{ duration: 0.2 }}
          >
            VIEW ALL →
          </motion.span>
        </Link>
      </div>

      {/* 3-col grid (mobile: 1-col) */}
      <div className="px-8 md:px-16 lg:px-28 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {displayItems.map((item, i) => (
            <HomeWorkCard key={item.id} item={item} index={i} />
          ))}
          {displayItems.length === 0 && (
            <div className="col-span-3 py-24 text-center">
              <p style={{ fontFamily: F, fontSize: "14px", color: TEXT3 }}>등록된 프로젝트가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────
// 배경 영상: src/assets/images/bghero.mp4 을 넣으면 자동 적용됩니다.
const bgVideoModules = import.meta.glob(
  "../../assets/images/bghero.mp4",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;
const BG_VIDEO: string = Object.values(bgVideoModules)[0] || "";

// 배경 음악: src/assets/images/bgsound.mp4 을 넣으면 자동 적용됩니다.
const bgSoundModules = import.meta.glob(
  "../../assets/images/bgsound.mp4",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;
const BG_SOUND: string = Object.values(bgSoundModules)[0] || "";

function HeroSection() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  // 첫 방문 로고 인트로가 끝난 뒤 헤드라인이 등장하도록 지연
  const introDelay = getIntroDelay();

  // 비디오 강제 자동 재생 (iOS Safari 재생 버튼 완전 제거)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const tryPlay = () => { video.muted = true; video.play().catch(() => {}); };

    // 로드되는 즉시 재생
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    tryPlay();

    // iOS가 pause시킬 때마다 즉시 재개 (저전력 모드, 스크롤 등)
    video.addEventListener("pause", tryPlay);

    // iOS가 autoplay 막을 경우 첫 터치에 재생
    const onTouch = () => tryPlay();
    document.addEventListener("touchstart", onTouch, { once: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("pause", tryPlay);
      document.removeEventListener("touchstart", onTouch);
    };
  }, []);

  // 오디오 자동 재생 시도 (뮤트 상태로 시작)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !BG_SOUND) return;
    audio.muted = true;
    audio.loop = true;
    audio.play().catch(() => {});
    return () => { audio.pause(); };
  }, []);

  const toggleSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (soundOn) {
      audio.muted = true;
      setSoundOn(false);
    } else {
      audio.muted = false;
      audio.play().catch(() => {});
      setSoundOn(true);
    }
  };

  return (
    <section
      style={{
        minHeight: "100svh",
        position: "relative",
        overflow: "hidden",
        borderBottom: BORDER,
      }}
    >
      {/* 스크림 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(13,13,13,0.18) 0%, rgba(13,13,13,0) 30%, rgba(13,13,13,0.78) 100%)",
        }}
      />

      {/* 헤드라인 */}
      <div
        className="px-8 md:px-16 lg:px-28"
        style={{ position: "absolute", left: 0, right: 0, bottom: "clamp(44px, 9vh, 104px)", zIndex: 2 }}
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: introDelay + 0.1 }}
          style={{ fontFamily: F, fontSize: "11px", color: "rgba(250,250,250,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "18px" }}
        >
          Brand · Package · Production · Global
        </motion.p>
        <h1 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(34px, 6.4vw, 92px)", color: "#FAFAFA", letterSpacing: "-0.04em", lineHeight: 0.98, margin: 0 }}>
          {["브랜드에서 생산까지,", "한 팀이 끝까지 책임집니다."].map((line, i) => (
            <span key={i} style={{ display: "block", overflow: "hidden", paddingBottom: "0.06em" }}>
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.9, delay: introDelay + 0.15 + i * 0.1, ease: EASE }}
                style={{ display: "block" }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: introDelay + 0.55 }}
          style={{ fontFamily: F, fontSize: "clamp(13px, 1.3vw, 16px)", color: "rgba(250,250,250,0.72)", lineHeight: 1.7, maxWidth: "560px", marginTop: "22px" }}
        >
          스튜디오 시그(시그코퍼레이션)는 브랜드·패키지 설계, 그라비아 인쇄 감리, 제조 파트너 생산, 해외 협력을
          하나의 흐름으로 연결합니다. 자체 개발 패키지 스튜디오 <em style={{ fontStyle: "normal", color: "#FAFAFA" }}>siging</em>으로 시안이 실물이 되는 과정을 검증합니다.
        </motion.p>
      </div>

      {/* 배경 영상 */}
      {BG_VIDEO && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          onPlay={() => setVideoPlaying(true)}
          {...{ "webkit-playsinline": "true", "x-webkit-airplay": "deny", "playsinline": "true" } as any}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 0,
          }}
        >
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
      )}

      {/* 배경 음악 */}
      {BG_SOUND && (
        <audio ref={audioRef} preload="none">
          <source src={BG_SOUND} type="audio/mp4" />
        </audio>
      )}

      {/* 사운드 토글 버튼 */}
      {BG_SOUND && (
        <motion.button
          onClick={toggleSound}
          style={{
            position: "absolute",
            bottom: "28px",
            right: "28px",
            zIndex: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          whileHover={{ opacity: 0.7 }}
        >
          {/* 소리 상태 표시 점 */}
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: soundOn ? "#FFFFFF" : "rgba(255,255,255,0.35)",
              display: "block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: F,
              fontSize: "10px",
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {soundOn ? "SOUND ON" : "SOUND OFF"}
          </span>
        </motion.button>
      )}
    </section>
  );
}

// ─── MARQUEE ──────────────────────────────────────────────
const marqueeItems = ["BRAND", "PACKAGE", "DIELINE", "GRAVURE", "SUPERVISION", "PRODUCTION", "GLOBAL", "SIGING"];

function MarqueeSection() {
  const [hovered, setHovered] = useState(false);
  const items = [...marqueeItems, ...marqueeItems, ...marqueeItems];
  return (
    <div
      style={{ borderBottom: BORDER, overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="flex whitespace-nowrap py-5"
        animate={{ x: [0, "-33.33%"] }}
        transition={{ duration: hovered ? 60 : 30, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(13px, 1.8vw, 21px)", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 10px" }}>
              {item}
            </span>
            <LogoSymbol style={{ color: "#CCCCCC", width: "14px", height: "14px", marginRight: "4px", flexShrink: 0 }} />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─── CLIENTS ─────────────────────────────────────────────
function ClientLogo({ client }: { client: HomeClient }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="client-logo-item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1 / 1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        padding: "12px",
      }}
    >
      {client.logoUrl ? (
        <img
          className="client-logo-img"
          src={client.logoUrl}
          alt={client.name}
          style={{
            width: "100%",
            height: "auto",
            maxWidth: "100%",
            maxHeight: "60px",
            objectFit: "contain",
            filter: hovered ? "none" : "grayscale(100%)",
            transition: "filter 0.4s ease",
          }}
        />
      ) : (
        <span style={{ fontFamily: F, fontSize: "13px", color: "#CCCCCC", letterSpacing: "0.04em" }}>{client.name || "—"}</span>
      )}
    </div>
  );
}

function ClientsSection() {
  const { content } = useHomeContent();
  const [showAll, setShowAll] = useState(false);

  const featured = content.clients.slice(0, 6);
  const hasMore = content.clients.length > 6;
  const displayClients = showAll ? content.clients : featured;

  if (content.clients.length === 0) return null;

  return (
    <section style={{ borderBottom: BORDER }}>
      <style>{`
        @media (max-width: 767px) {
          .clients-left { min-height: 0 !important; }
          .clients-tagline { position: static !important; margin-top: 10px; }
        }
      `}</style>
      <div className="px-8 md:px-16 lg:px-28 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
          {/* Left */}
          <div className="clients-left" style={{ position: "relative", minHeight: "140px" }}>
            <div className="flex items-start justify-between md:flex-col md:items-start gap-4">
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase" }}
              >
                Our clients
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link to="/about#clients" data-cursor="hover-link">
                  <motion.span
                    style={{ fontFamily: F, fontSize: "13px", color: TEXT3, letterSpacing: "0.06em", textTransform: "uppercase" }}
                    whileHover={{ color: DARK }}
                    transition={{ duration: 0.2 }}
                  >
                    VIEW ALL →
                  </motion.span>
                </Link>
              </motion.div>
            </div>
            <motion.div
              className="clients-tagline"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.15 }}
              style={{ position: "absolute", bottom: 0, left: 0 }}
            >
              <p style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(30px, 4.5vw, 54px)", color: "#E8E8E8", letterSpacing: "-0.04em", lineHeight: 1.05, margin: 0 }}>
                Pleasure to<br />work with
              </p>
            </motion.div>
          </div>

          {/* Right — 2-col logo grid */}
          <div className="md:col-span-2">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "8px",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {displayClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <ClientLogo client={client} />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div style={{ marginTop: "28px" }}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: F,
                    fontSize: "13px",
                    color: DARK,
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    letterSpacing: "0.02em",
                  }}
                >
                  {showAll ? "Close ↑" : "All Clients →"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── GALLERY PREVIEW ──────────────────────────────────────
function GalleryPreviewSection() {
  const { data } = useGallery();

  const totalPhotos = data.sections.reduce((acc, s) => acc + s.images.length, 0);
  if (totalPhotos === 0) return null;

  // Build lookup map: imageId → { url, alt }
  const imgMap = new Map<string, { url: string; alt: string }>();
  for (const section of data.sections) {
    for (const img of section.images) {
      imgMap.set(img.id, { url: img.url, alt: img.alt || section.title });
    }
  }

  // Use admin-selected featured IDs (up to 4); fall back to first 4 if none selected
  let previews: { url: string; alt: string }[] = [];
  if (data.featuredImageIds.length > 0) {
    previews = data.featuredImageIds
      .slice(0, 4)
      .map((id) => imgMap.get(id))
      .filter((x): x is { url: string; alt: string } => !!x);
  }
  if (previews.length === 0) {
    for (const section of data.sections) {
      for (const img of section.images) {
        if (previews.length >= 4) break;
        previews.push({ url: img.url, alt: img.alt || section.title });
      }
      if (previews.length >= 4) break;
    }
  }

  return (
    <section style={{ borderBottom: BORDER }}>
      {/* Header row */}
      <div
        className="px-8 md:px-16 lg:px-28 py-8 flex items-center justify-between"
        style={{ borderBottom: BORDER }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
        >
          GALLERY
        </motion.h2>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3 }}>
            {data.sections.length} Series · {totalPhotos} Photos
          </span>
          <Link to="/gallery" data-cursor="hover-link">
            <motion.span
              style={{ fontFamily: F, fontSize: "13px", color: TEXT3, letterSpacing: "0.06em", textTransform: "uppercase" }}
              whileHover={{ color: DARK }}
              transition={{ duration: 0.2 }}
            >
              VIEW ALL →
            </motion.span>
          </Link>
        </div>
      </div>

      {/* 4-photo horizontal strip */}
      {previews.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${previews.length}, 1fr)` }}>
          {previews.map((p, i) => (
            <Link to="/gallery" key={i} data-cursor="view">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  borderRight: i < previews.length - 1 ? BORDER : "none",
                  position: "relative",
                }}
              >
                <motion.img
                  src={p.url}
                  alt={p.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────
function CTASection() {
  // A/B 실험: 홈 CTA 문구 (관리자 → A/B 실험 탭에서 관리)
  const { variant, payload: ctaLabel, trackGoal } = useExperiment("home-cta-copy", "GET IN TOUCH");
  return (
    <section style={{ backgroundColor: DARK, position: "relative", overflow: "hidden" }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <LogoSymbol
          style={{
            color: "rgba(255,255,255,0.025)",
            width: "clamp(200px, 38vw, 400px)",
            height: "clamp(200px, 38vw, 400px)",
            animationName: "sigSpin",
            animationDuration: "30s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            display: "block",
          }}
        />
      </div>
      <div className="relative z-10 px-8 md:px-16 lg:px-28 py-28 md:py-40">
        <div className="max-w-[900px]">
          {["READY TO", "MAKE IT", "REAL?"].map((line, i) => (
            <motion.h2
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: i * 0.1, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(40px, 9vw, 112px)", color: "#FAFAFA", letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 4px", textTransform: "uppercase" }}
            >
              {line}
            </motion.h2>
          ))}
          <motion.div
            style={{ marginTop: "52px" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link to="/contact" data-cursor="hover-button" onClick={() => trackGoal("cta_click", { placement: "home_bottom", label: ctaLabel })}>
              <motion.button
                style={{ fontFamily: F, fontWeight: 700, fontSize: "12px", color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", padding: "18px 44px", background: "#FAFAFA", border: "1px solid #FAFAFA" }}
                whileHover={{ background: "rgba(250,250,250,0)", color: "#FAFAFA" }}
                transition={{ duration: 0.25 }}
                data-variant={variant}
              >
                {ctaLabel}
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1F1F1F" }} className="flex justify-between items-center px-8 md:px-16 lg:px-28 py-4">
        <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.06em" }}>BRAND · PACKAGE · PRODUCTION · SEOUL</span>
        <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.06em" }}>duwhz1226@studiosig.com</span>
      </div>
    </section>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────
export function Home() {
  useSEO({
    title: "스튜디오 시그 Studio SIG | 브랜드·패키지 설계부터 인쇄 감리·생산·해외 협력까지",
    description: "스튜디오 시그(Studio SIG, 시그코퍼레이션)는 브랜드·패키지 설계, 그라비아 인쇄 감리, 제조 파트너 생산, 해외 협력을 하나로 연결하는 서울의 패키지 솔루션 회사입니다. 자체 개발 패키지 스튜디오 siging으로 칼선·3D 목업·감리를 검증합니다.",
    canonical: "https://www.studiosig.com/",
  });

  return (
    <div style={{ backgroundColor: BG }}>
      <HeroSection />
      <MarqueeSection />
      <CapabilitiesSection />
      <ProcessSection />
      <SigingSection />
      <SelectedWorksSection />
      <ClientsSection />
      <GalleryPreviewSection />
      <CTASection />
    </div>
  );
}
