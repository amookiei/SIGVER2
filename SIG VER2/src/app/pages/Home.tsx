import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { LogoSymbol } from "../components/LogoSymbol";
import { useAdmin } from "../context/AdminContext";
import { useHomeContent } from "../context/HomeContentContext";
import type { HomeService } from "../context/HomeContentContext";
import type { PortfolioItem } from "../data/portfolio";

// ─── Design tokens ───────────────────────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const CREAM = "#F5F3EF";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

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

// ─── SELECTED WORKS — editorial list row ──────────────────
function WorkListRow({ item, index, total }: { item: PortfolioItem; index: number; total: number }) {
  const [hovered, setHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const imgX = useSpring(mouseX, { stiffness: 220, damping: 24 });
  const imgY = useSpring(mouseY, { stiffness: 220, damping: 24 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - r.left);
    mouseY.set(e.clientY - r.top);
  };

  return (
    <Link to={`/work/${item.slug}`} data-cursor="hover-link">
      <motion.div
        ref={containerRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={onMouseMove}
        className="px-8 md:px-16 lg:px-28"
        style={{
          borderBottom: index < total - 1 ? BORDER : "none",
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "clamp(16px, 2.5vw, 40px)",
          paddingTop: "clamp(20px, 2.2vw, 32px)",
          paddingBottom: "clamp(20px, 2.2vw, 32px)",
          overflow: "visible",
        }}
        animate={{ backgroundColor: hovered ? CREAM : BG }}
        transition={{ duration: 0.38 }}
      >
        {/* Index */}
        <span style={{
          fontFamily: F, fontSize: "11px", color: TEXT3,
          letterSpacing: "0.08em", flexShrink: 0, width: "22px",
        }}>
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Title */}
        <motion.h3
          style={{
            fontFamily: F, fontWeight: 700,
            fontSize: "clamp(20px, 3.2vw, 48px)",
            color: DARK, letterSpacing: "-0.03em",
            textTransform: "uppercase", flex: 1,
            lineHeight: 1, margin: 0,
          }}
          animate={{ x: hovered ? 10 : 0 }}
          transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {item.title}
        </motion.h3>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 3vw, 48px)", flexShrink: 0 }}>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.09em", textTransform: "uppercase" }}>
            {item.category}
          </span>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            {item.year}
          </span>
          <motion.span
            style={{ fontFamily: F, fontSize: "16px", color: DARK, lineHeight: 1 }}
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -6 }}
            transition={{ duration: 0.25 }}
          >
            →
          </motion.span>
        </div>

        {/* Floating thumbnail that follows cursor */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              style={{
                position: "absolute",
                left: imgX,
                top: imgY,
                translateX: "-50%",
                translateY: "-110%",
                width: "clamp(200px, 22vw, 300px)",
                aspectRatio: "3/2",
                pointerEvents: "none",
                zIndex: 30,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              }}
              initial={{ opacity: 0, scale: 0.86, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.86, y: 12 }}
              transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <img
                src={item.heroImage}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}

// ─── SELECTED WORKS SECTION ───────────────────────────────
function SelectedWorksSection() {
  const { items } = useAdmin();
  const displayItems = items.slice(0, 6);

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
          style={{
            fontFamily: F, fontWeight: 700,
            fontSize: "clamp(40px, 8vw, 100px)",
            color: DARK, letterSpacing: "-0.04em",
            lineHeight: 0.88, textTransform: "uppercase", margin: 0,
          }}
        >
          SELECTED<br />WORKS
        </motion.h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
          <span style={{ fontFamily: F, fontSize: "clamp(28px, 5vw, 64px)", color: "#EBEBEB", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {String(displayItems.length).padStart(2, "0")}
          </span>
          <Link to="/work" data-cursor="hover-link">
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

      {/* Editorial list */}
      <div>
        {displayItems.map((item, i) => (
          <WorkListRow key={item.id} item={item} index={i} total={displayItems.length} />
        ))}
        {displayItems.length === 0 && (
          <div className="py-24 text-center px-8">
            <p style={{ fontFamily: F, fontSize: "14px", color: TEXT3 }}>
              등록된 프로젝트가 없습니다.
            </p>
          </div>
        )}
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
  const [soundOn, setSoundOn] = useState(false);

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
      {/* 배경 영상 */}
      {BG_VIDEO && (
        <video
          autoPlay
          muted
          loop
          playsInline
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
const marqueeItems = ["BRANDING", "WEB DESIGN", "CAMPAIGN", "STRATEGY", "UX/UI", "MOTION", "EDITORIAL", "IDENTITY"];

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

// ─── SERVICES ─────────────────────────────────────────────
type ServiceItem = HomeService;

function ServiceCard({
  svc,
  idx,
  hoveredIdx,
  setHoveredIdx,
  isMobile,
  total = 4,
}: {
  svc: ServiceItem;
  idx: number;
  hoveredIdx: number | null;
  setHoveredIdx: (i: number | null) => void;
  isMobile: boolean;
  total?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mobileInView, setMobileInView] = useState(false);

  useEffect(() => {
    if (!isMobile || !cardRef.current) return;
    const el = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => setMobileInView(entry.isIntersecting),
      { threshold: 0.45 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  const isActive = isMobile ? mobileInView : hoveredIdx === idx;
  const isDimmed = !isMobile && hoveredIdx !== null && hoveredIdx !== idx;

  return (
    <motion.div
      ref={cardRef}
      style={{
        borderRight: idx < total - 1 ? BORDER : "none",
        position: "relative",
        overflow: "hidden",
        minHeight: "420px",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={() => { if (!isMobile) setHoveredIdx(idx); }}
      onMouseLeave={() => { if (!isMobile) setHoveredIdx(null); }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: idx * 0.08 }}
    >
      {/* Text content */}
      <motion.div
        style={{ padding: "32px 28px", flex: 1, position: "relative", zIndex: 2 }}
        animate={{ opacity: isDimmed ? 0.25 : 1 }}
        transition={{ duration: 0.35 }}
      >
        <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", marginBottom: "20px" }}>{svc.id}</p>
        <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "17px", color: DARK, letterSpacing: "-0.01em", lineHeight: 1.25, textTransform: "uppercase", marginBottom: "16px", whiteSpace: "pre-line" }}>
          {svc.title}
        </h3>
        <p style={{ fontFamily: F, fontSize: "13px", color: TEXT2, lineHeight: 1.7, marginBottom: "24px" }}>{svc.desc}</p>
        <div style={{ width: "32px", height: "1px", backgroundColor: "#CCCCCC", marginBottom: "12px" }} />
        <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3 }}>{svc.count}</span>
      </motion.div>

      {/* Image — 항상 표시, 기본 그레이스케일 → 호버 시 컬러 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "55%",
          zIndex: 1,
        }}
      >
        {/* Gradient fade */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", background: `linear-gradient(to bottom, #FAFAFA, rgba(250,250,250,0))`, zIndex: 2 }} />
        <img
          src={svc.image}
          alt={svc.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: isActive ? "grayscale(0%)" : "grayscale(100%)",
            transition: "filter 0.55s ease",
          }}
        />
      </div>
    </motion.div>
  );
}

function ServicesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { content } = useHomeContent();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section style={{ borderBottom: BORDER }}>
      <div className="flex items-center justify-between px-8 md:px-16 lg:px-28 py-10" style={{ borderBottom: BORDER }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
        >
          WHAT WE DO
        </motion.h2>
        <span style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 52px)", color: "#EEEEEE", fontWeight: 700, letterSpacing: "-0.04em" }}>
          {String(content.services.length).padStart(2, "0")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-8 md:px-16 lg:px-28" style={{ borderTop: BORDER }}>
        {content.services.map((svc, idx) => (
          <ServiceCard
            key={svc.id}
            svc={svc}
            idx={idx}
            hoveredIdx={hoveredIdx}
            setHoveredIdx={setHoveredIdx}
            isMobile={isMobile}
            total={content.services.length}
          />
        ))}
      </div>
    </section>
  );
}

// ─── ABOUT PREVIEW ────────────────────────────────────────
function AboutPreviewSection() {
  const { content } = useHomeContent();
  return (
    <section style={{ borderBottom: BORDER }}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div style={{ overflow: "hidden", aspectRatio: "4/3", position: "relative", backgroundColor: "#F0F0F0", borderRight: BORDER }}>
          <motion.img
            src={content.aboutImage}
            alt="SIG Studio"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            initial={{ scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
        <div style={{ padding: "60px 48px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <motion.p
            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "24px" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            About Us
          </motion.p>
          {[content.aboutLine1, content.aboutLine2].map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
              style={{ fontFamily: F, fontSize: "17px", color: i === 0 ? DARK : TEXT2, lineHeight: 1.75, marginBottom: "20px" }}
            >
              {line}
            </motion.p>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginTop: "12px" }}
          >
            <Link to="/about" data-cursor="hover-link">
              <motion.span
                style={{ fontFamily: F, fontSize: "12px", color: DARK, letterSpacing: "0.08em", textTransform: "uppercase" }}
                whileHover={{ letterSpacing: "0.14em" }}
                transition={{ duration: 0.3 }}
              >
                ABOUT US →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────
function CTASection() {
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
          {["READY TO", "START YOUR", "PROJECT?"].map((line, i) => (
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
            <Link to="/contact" data-cursor="hover-button">
              <motion.button
                style={{ fontFamily: F, fontWeight: 700, fontSize: "12px", color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", padding: "18px 44px", background: "#FAFAFA", border: "1px solid #FAFAFA" }}
                whileHover={{ background: "rgba(250,250,250,0)", color: "#FAFAFA" }}
                transition={{ duration: 0.25 }}
              >
                GET IN TOUCH
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid #1F1F1F" }} className="flex justify-between items-center px-8 md:px-16 lg:px-28 py-4">
        <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.06em" }}>DESIGN AGENCY · SEOUL</span>
        <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.06em" }}>hello@sigstudio.kr</span>
      </div>
    </section>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────
export function Home() {
  return (
    <div style={{ backgroundColor: BG }}>
      <HeroSection />
      <MarqueeSection />
      <SelectedWorksSection />
      <ServicesSection />
      <AboutPreviewSection />
      <CTASection />
    </div>
  );
}
