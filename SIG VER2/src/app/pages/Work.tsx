import { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import { Link } from "react-router";
import { CATEGORIES, getProjectsByCategory } from "../data/portfolio";
import type { PortfolioItem } from "../data/portfolio";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

// ─── Grid Cell with hover image cursor ───────────────────
function WorkCell({
  item,
  index,
  hoveredId,
  onHover,
}: {
  item: PortfolioItem;
  index: number;
  hoveredId: number | null;
  onHover: (id: number | null) => void;
}) {
  const [localHover, setLocalHover] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const btnX = useSpring(mouseX, { stiffness: 280, damping: 28 });
  const btnY = useSpring(mouseY, { stiffness: 280, damping: 28 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const isActive = hoveredId === null || hoveredId === item.id;

  return (
    <motion.div
      style={{ borderRight: BORDER, borderBottom: BORDER, position: "relative" }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
    >
      <Link to={`/work/${item.slug}`} data-cursor="view">
        <div
          onMouseEnter={() => { setLocalHover(true); onHover(item.id); }}
          onMouseLeave={() => { setLocalHover(false); onHover(null); }}
          onMouseMove={onMouseMove}
        >
          {/* Image */}
          <div style={{ aspectRatio: "4/3", overflow: "hidden", position: "relative", backgroundColor: "#F0F0F0" }}>
            <motion.img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
              animate={{ scale: localHover ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            {/* Cursor-tracking hover button */}
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
              animate={{ opacity: localHover ? 1 : 0, scale: localHover ? 1 : 0.5 }}
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
                <span style={{
                  color: "#FAFAFA", fontSize: "8px", display: "block",
                  animationName: "sigSpin", animationDuration: "3s",
                  animationTimingFunction: "linear", animationIterationCount: "infinite",
                }}>✱</span>
              </div>
            </motion.div>
            {/* Category tag */}
            <div className="absolute top-3 left-3">
              <span style={{
                fontFamily: F, fontSize: "9px", fontWeight: 600,
                color: "#FAFAFA", letterSpacing: "0.1em", textTransform: "uppercase",
                background: "rgba(13,13,13,0.55)", backdropFilter: "blur(6px)",
                padding: "3px 8px",
              }}>
                {item.category}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#E0E0E0" }} />

          {/* Meta */}
          <div style={{ padding: "16px 18px 20px" }}>
            <motion.p
              style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: DARK, letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: "8px", textTransform: "uppercase" }}
              animate={{ x: localHover ? 4 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {item.title}
            </motion.p>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>{item.client}</span>
              <span style={{ fontFamily: F, fontSize: "11px", color: "#CCCCCC" }}>{item.year}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── WORK PAGE ────────────────────────────────────────────
export function Work() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const filtered = getProjectsByCategory(activeCategory);

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ borderBottom: BORDER, paddingTop: "72px" }}>
        <div className="px-8 md:px-12 lg:px-16 pt-14 pb-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}
          >
            Portfolio
          </motion.p>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(64px, 14vw, 180px)", color: DARK, letterSpacing: "-0.05em", lineHeight: 0.84, margin: "0 0 20px", textTransform: "uppercase" }}
            >
              WORK
            </motion.h1>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ borderTop: BORDER }}>
          <div className="px-8 md:px-12 lg:px-16 flex items-center gap-0 overflow-x-auto">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  data-cursor="hover-button"
                  style={{
                    fontFamily: F,
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? DARK : TEXT3,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "15px 20px",
                    background: "none",
                    border: "none",
                    borderRight: BORDER,
                    position: "relative",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  whileHover={{ color: DARK }}
                  transition={{ duration: 0.2 }}
                >
                  {isActive ? `(${cat})` : cat}
                  {isActive && (
                    <motion.div
                      layoutId="work-filter-indicator"
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", backgroundColor: DARK }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ borderLeft: BORDER }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderTop: BORDER }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {filtered.map((item, i) => (
              <WorkCell
                key={item.id}
                item={item}
                index={i}
                hoveredId={hoveredId}
                onHover={setHoveredId}
              />
            ))}

            {filtered.length === 0 && (
              <div className="col-span-4 py-32 text-center" style={{ borderRight: BORDER, borderBottom: BORDER }}>
                <p style={{ fontFamily: F, fontSize: "14px", color: TEXT3 }}>
                  해당 카테고리의 프로젝트가 없습니다.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Count bar */}
      <div className="px-8 md:px-12 lg:px-16 py-5 flex items-center justify-between" style={{ borderTop: BORDER }}>
        <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.06em" }}>
          {filtered.length} projects
        </span>
        <span style={{ fontFamily: F, fontSize: "13px", color: "#DDDDDD", animationName: "sigSpin", animationDuration: "8s", animationTimingFunction: "linear", animationIterationCount: "infinite", display: "block" }}>
          ✱
        </span>
      </div>
    </div>
  );
}