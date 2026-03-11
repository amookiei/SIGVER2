import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { LogoSymbol } from "../components/LogoSymbol";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAdmin } from "../context/AdminContext";
import { useHomeContent } from "../context/HomeContentContext";
import type { HomeService } from "../context/HomeContentContext";
import type { PortfolioItem } from "../data/portfolio";

gsap.registerPlugin(ScrollTrigger);

// ─── Design tokens ───────────────────────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const CREAM = "#F5F3EF";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <Link to={`/work/${item.slug}`} data-cursor="hover-link">
          <motion.h3
            whileHover={{ x: 6 }}
            transition={{ duration: 0.25 }}
            style={{
              fontFamily: F,
              fontWeight: 800,
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
      <div style={{ display: "flex", gap: "36px" }}>
        {[
          { label: "Client", value: item.client },
          { label: "Type", value: item.category },
        ].map((m) => (
          <div key={m.label}>
            <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
              {m.label}
            </p>
            <p style={{ fontFamily: F, fontSize: "13px", color: TEXT2 }}>{m.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Row A — Full-width hero
function RowA({ item }: { item: PortfolioItem }) {
  return (
    <div style={{ borderBottom: BORDER }}>
      <ImageHoverCell item={item} aspectRatio="16/9" />
      <div style={{ borderTop: BORDER }}>
        <ProjectInfo item={item} titleSize="clamp(24px, 3.5vw, 48px)" pad="28px 32px" />
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
        style={{
          flex: "0 0 40%",
          borderRight: BORDER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <ProjectInfo item={item} titleSize="clamp(20px, 2.8vw, 36px)" pad="40px 36px" />
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
        style={{
          flex: "0 0 30%",
          borderRight: BORDER,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <ProjectInfo item={item} titleSize="clamp(18px, 2.4vw, 30px)" pad="40px 32px" />
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
          <div style={{ borderTop: BORDER }}>
            <ProjectInfo item={item} titleSize="clamp(16px, 2vw, 26px)" pad="24px 24px" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── SELECTED WORKS SECTION ───────────────────────────────
const WORK_FILTERS = ["All", "Branding", "Web Design", "Campaign", "Government"] as const;

function SelectedWorksSection() {
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const sectionRef = useRef<HTMLElement>(null);
  const { items } = useAdmin();

  const displayItems =
    activeFilter === "All"
      ? items.slice(0, 5)
      : items.filter((p) => p.category === activeFilter);

  const rows = groupIntoRows(displayItems);

  // GSAP ScrollTrigger — clip-path image reveals
  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;

    timerId = setTimeout(() => {
      const reveals = document.querySelectorAll(".work-img-reveal");
      reveals.forEach((el) => {
        // Reset to clipped state first
        gsap.set(el, { clipPath: "inset(0 0 100% 0)" });

        gsap.to(el, {
          clipPath: "inset(0 0 0% 0)",
          duration: 0.95,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            once: true,
          },
        });
      });
    }, 380);

    return () => {
      clearTimeout(timerId);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [activeFilter]);

  return (
    <section ref={sectionRef} style={{ borderBottom: BORDER }}>
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
            fontFamily: F,
            fontWeight: 800,
            fontSize: "clamp(40px, 8vw, 100px)",
            color: DARK,
            letterSpacing: "-0.04em",
            lineHeight: 0.88,
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          SELECTED
          <br />
          WORKS
        </motion.h2>
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

      {/* Filter tabs — active item gets parentheses */}
      <div
        className="hidden md:flex items-center gap-0"
        style={{ borderBottom: BORDER }}
      >
        {WORK_FILTERS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <motion.button
              key={f}
              onClick={() => setActiveFilter(f)}
              data-cursor="hover-button"
              style={{
                fontFamily: F,
                fontSize: "12px",
                fontWeight: isActive ? 700 : 400,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "12px 14px",
                background: "none",
                border: "none",
                outline: "none",
                borderRight: `1px solid #E0E0E0`,
              }}
              animate={{ color: isActive ? DARK : TEXT3 }}
              whileHover={{ color: DARK }}
              transition={{ duration: 0.2 }}
            >
              {isActive ? `(${f})` : f}
            </motion.button>
          );
        })}
      </div>

      {/* Rows */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {rows.map((row, i) => {
            if (row.type === "A") return <RowA key={`A-${i}`} item={row.item} />;
            if (row.type === "B") return <RowB key={`B-${i}`} item={row.item} />;
            if (row.type === "C") return <RowC key={`C-${i}`} item={row.item} />;
            if (row.type === "D") return <RowD key={`D-${i}`} items={row.items} />;
            return null;
          })}

          {/* Empty state */}
          {rows.length === 0 && (
            <div className="py-24 text-center">
              <p style={{ fontFamily: F, fontSize: "14px", color: TEXT3 }}>
                해당 카테고리의 프로젝트가 없습니다.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

// ─── HERO SECTION ─────────────────────────────────────────
// 히어로 이미지: src/assets/images/ 에 hero.jpg / hero.png / hero.webp / hero.gif 중 하나를 넣으면 자동 적용됩니다.
const heroModules = import.meta.glob(
  "../../assets/images/hero.{jpg,jpeg,png,webp,gif}",
  { eager: true, as: "url" }
) as Record<string, string>;
const HERO_IMAGE: string =
  Object.values(heroModules)[0] ||
  "https://images.unsplash.com/photo-1615852993296-b42d4dbb5555?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

const bottomCells = [
  { label: "Our Approach", sub: "Design-first strategy", href: "/about" },
  { label: "Our Work", sub: "Selected projects", href: "/work" },
  { label: "Our Story", sub: "Who we are", href: "/about" },
  { label: "Our Team", sub: "The people behind", href: "/about" },
];

function HeroSection() {
  const headlineRef = useRef<HTMLDivElement>(null);

  // GSAP hero text stagger reveal
  useEffect(() => {
    if (!headlineRef.current) return;
    const lines = headlineRef.current.querySelectorAll(".hero-headline-line");
    gsap.fromTo(
      lines,
      { y: "105%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.88,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.25,
      }
    );
  }, []);

  return (
    <section
      style={{
        minHeight: "100svh",
        backgroundColor: BG,
        display: "flex",
        flexDirection: "column",
        borderBottom: BORDER,
      }}
    >
      {/* Desktop grid */}
      <div
        className="hidden md:grid flex-1"
        style={{ gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr) minmax(0,5fr)", flex: 1 }}
      >
        {/* Cell 1 — Tagline */}
        <div
          style={{
            borderRight: BORDER,
            padding: "100px 32px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.65, maxWidth: "180px" }}
          >
            Where Design Meets Strategy
          </motion.p>
          <motion.div
            className="flex items-center gap-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: DARK, display: "block" }} />
            <span style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              EST. 2024 · SEOUL
            </span>
          </motion.div>
        </div>

        {/* Cell 2 — Image with clip reveal */}
        <div style={{ borderRight: BORDER, overflow: "hidden", position: "relative", backgroundColor: "#F0F0F0" }}>
          <motion.div
            style={{ position: "absolute", inset: 0 }}
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.77, 0, 0.175, 1] }}
          >
            <img src={HERO_IMAGE} alt="SIG Studio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </motion.div>
          <motion.div
            className="absolute bottom-5 right-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
          >
            <LogoSymbol
              style={{
                color: "rgba(255,255,255,0.65)",
                width: "22px",
                height: "22px",
                display: "block",
                animationName: "sigSpin",
                animationDuration: "10s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            />
          </motion.div>
        </div>

        {/* Cell 3 — Headline (GSAP animated) */}
        <div
          style={{
            padding: "100px 44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          <div ref={headlineRef} style={{ marginBottom: "32px" }}>
            {["CREATING", "BRANDS", "THAT", "MOVE"].map((line, i) => (
              <div key={i} style={{ overflow: "hidden" }}>
                <div
                  className="hero-headline-line"
                  style={{
                    fontFamily: F,
                    fontWeight: 800,
                    fontSize: "clamp(38px, 5.2vw, 84px)",
                    color: DARK,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.94,
                    textTransform: "uppercase",
                    opacity: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.12em",
                  }}
                >
                  {line}
                  {i === 3 && (
                    <LogoSymbol style={{ width: "0.72em", height: "0.72em", display: "inline-block", flexShrink: 0 }} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div style={{ width: "72px", height: "1px", backgroundColor: DARK, marginBottom: "18px" }} />
            <Link to="/work" data-cursor="hover-link">
              <motion.span
                style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase" }}
                whileHover={{ color: DARK, letterSpacing: "0.16em" }}
                transition={{ duration: 0.3 }}
              >
                (EXPLORE WORK)
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col md:hidden flex-1 pt-24 pb-8">
        <div style={{ overflow: "hidden", height: "52vw", backgroundColor: "#F0F0F0" }}>
          <img src={HERO_IMAGE} alt="SIG Studio" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div className="px-6 mt-8">
          {["CREATING", "BRANDS", "THAT", "MOVE"].map((line, i) => (
            <div key={i} style={{ overflow: "hidden" }}>
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.82, delay: 0.15 + i * 0.08, ease: [0.76, 0, 0.24, 1] }}
                style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(38px, 11vw, 64px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.9, textTransform: "uppercase", display: "flex", alignItems: "center", gap: "0.12em" }}
              >
                {line}
                {i === 3 && (
                  <LogoSymbol style={{ width: "0.72em", height: "0.72em", display: "inline-block", flexShrink: 0 }} />
                )}
              </motion.div>
            </div>
          ))}
          <div style={{ marginTop: "24px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "36px", height: "1px", backgroundColor: DARK }} />
            <Link to="/work">
              <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                (EXPLORE WORK)
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile bottom cells — 2×2 grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderTop: BORDER,
            marginTop: "32px",
          }}
        >
          {bottomCells.map((cell, i) => (
            <Link key={i} to={cell.href}>
              <motion.div
                style={{
                  padding: "18px 20px",
                  borderRight: i % 2 === 0 ? BORDER : "none",
                  borderBottom: i < 2 ? BORDER : "none",
                }}
                whileHover={{ backgroundColor: CREAM }}
                transition={{ duration: 0.3 }}
              >
                <p style={{ fontFamily: F, fontSize: "9px", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                  {cell.label}
                </p>
                <p style={{ fontFamily: F, fontSize: "11px", color: "#BBBBBB" }}>{cell.sub}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row cells */}
      <div
        className="hidden md:grid"
        style={{ gridTemplateColumns: `repeat(${bottomCells.length + 1}, 1fr)`, borderTop: BORDER }}
      >
        {bottomCells.map((cell, i) => (
          <Link key={i} to={cell.href} data-cursor="hover-link">
            <motion.div
              style={{ padding: "18px 24px", borderRight: BORDER, position: "relative" }}
              whileHover={{ backgroundColor: CREAM }}
              transition={{ duration: 0.3 }}
            >
              <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                {cell.label}
              </p>
              <p style={{ fontFamily: F, fontSize: "12px", color: "#BBBBBB" }}>{cell.sub}</p>
            </motion.div>
          </Link>
        ))}
        <div style={{ padding: "18px 24px" }}>
          <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
            EST. 2024
          </p>
          <p style={{ fontFamily: F, fontSize: "12px", color: "#BBBBBB" }}>Seoul, Korea</p>
        </div>
      </div>
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
          style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
        >
          WHAT WE DO
        </motion.h2>
        <span style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 52px)", color: "#EEEEEE", fontWeight: 800, letterSpacing: "-0.04em" }}>
          {String(content.services.length).padStart(2, "0")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(40px, 9vw, 112px)", color: "#FAFAFA", letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 4px", textTransform: "uppercase" }}
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
