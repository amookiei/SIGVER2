import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useSpace } from "../context/SpaceContext";
import type { SpaceSection } from "../context/SpaceContext";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const BORDER = "1px solid #E0E0E0";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

// ─── Fade-in wrapper ──────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  y = 20,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Photo grid (editorial asymmetric) ───────────────────
function PhotoGrid({ photos }: { photos: string[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const filled = [...photos, "", "", "", ""].slice(0, 4);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gridTemplateRows: "auto auto",
        gap: "6px",
      }}
    >
      {/* Photo 0 — large, spans 2 rows */}
      <div
        style={{ gridColumn: "1", gridRow: "1 / 3", overflow: "hidden", aspectRatio: "3/4", position: "relative", background: "#EBEBEB" }}
        onMouseEnter={() => setHovered(0)} onMouseLeave={() => setHovered(null)}
      >
        {filled[0] ? (
          <motion.img src={filled[0]} alt="스튜디오"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: hovered === 0 ? 1.04 : 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} />
        ) : <PlaceholderBox label="01" />}
      </div>

      {/* Photo 1 — top right, spans 2 cols */}
      <div
        style={{ gridColumn: "2 / 4", gridRow: "1", overflow: "hidden", aspectRatio: "16/9", position: "relative", background: "#EBEBEB" }}
        onMouseEnter={() => setHovered(1)} onMouseLeave={() => setHovered(null)}
      >
        {filled[1] ? (
          <motion.img src={filled[1]} alt="스튜디오"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: hovered === 1 ? 1.04 : 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} />
        ) : <PlaceholderBox label="02" />}
      </div>

      {/* Photo 2 — bottom middle */}
      <div
        style={{ gridColumn: "2", gridRow: "2", overflow: "hidden", aspectRatio: "4/5", position: "relative", background: "#EBEBEB" }}
        onMouseEnter={() => setHovered(2)} onMouseLeave={() => setHovered(null)}
      >
        {filled[2] ? (
          <motion.img src={filled[2]} alt="스튜디오"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: hovered === 2 ? 1.04 : 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} />
        ) : <PlaceholderBox label="03" />}
      </div>

      {/* Photo 3 — bottom right */}
      <div
        style={{ gridColumn: "3", gridRow: "2", overflow: "hidden", aspectRatio: "4/5", position: "relative", background: "#EBEBEB" }}
        onMouseEnter={() => setHovered(3)} onMouseLeave={() => setHovered(null)}
      >
        {filled[3] ? (
          <motion.img src={filled[3]} alt="스튜디오"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            animate={{ scale: hovered === 3 ? 1.04 : 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }} />
        ) : <PlaceholderBox label="04" />}
      </div>
    </div>
  );
}

function PlaceholderBox({ label }: { label: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: F, fontSize: "11px", color: "#CCCCCC", letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

// ─── Equipment / Facility section card ───────────────────
function SectionCard({ section, delay }: { section: SpaceSection; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ padding: "36px 32px", border: BORDER, height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <span style={{ fontSize: "14px", color: DARK }}>{section.icon}</span>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "12px", color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            {section.title}
          </p>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {section.items.map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
              <span style={{ color: TEXT3, fontFamily: F, fontSize: "11px", lineHeight: "22px", flexShrink: 0 }}>—</span>
              <span style={{ fontFamily: F, fontSize: "13px", color: TEXT2, lineHeight: "22px", letterSpacing: "-0.01em" }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

// ─── Space Page ───────────────────────────────────────────
export function Space() {
  const { content } = useSpace();

  return (
    <div style={{ backgroundColor: BG, paddingTop: "72px" }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "88vh", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {content.heroImage ? (
          <>
            <motion.img
              src={content.heroImage} alt="Studio Space"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              initial={{ scale: 1.06 }} animate={{ scale: 1 }}
              transition={{ duration: 1.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.75) 0%, rgba(13,13,13,0.1) 55%, transparent 100%)" }} />
          </>
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#111111" }} />
        )}

        <div className="relative px-8 md:px-16 lg:px-28 pb-14 md:pb-20" style={{ zIndex: 2 }}>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
            STUDIO SIG — SPACE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(36px, 7.5vw, 96px)", color: "#FAFAFA", letterSpacing: "-0.04em", lineHeight: 0.9, textTransform: "uppercase", margin: 0 }}>
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
            style={{ fontFamily: F, fontSize: "clamp(12px, 1.4vw, 16px)", color: "rgba(255,255,255,0.5)", letterSpacing: "0.02em", marginTop: "20px", maxWidth: "500px" }}>
            {content.tagline}
          </motion.p>
        </div>
      </section>

      {/* ── 리뷰 이벤트 배너 ────────────────────────────── */}
      {content.reviewEvent && (
        <section style={{ background: DARK, borderBottom: "1px solid #1A1A1A" }}>
          <div className="px-8 md:px-16 lg:px-28 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p style={{ fontFamily: F, fontSize: "12px", color: "rgba(255,255,255,0.65)", letterSpacing: "0.02em", margin: 0 }}>
              <span style={{ color: "#FAFAFA", fontWeight: 600, marginRight: "10px" }}>REVIEW EVENT</span>
              {content.reviewEvent}
            </p>
            {content.notionUrl && (
              <a href={content.notionUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap", flexShrink: 0 }}>
                기물 사진 보러가기 →
              </a>
            )}
          </div>
        </section>
      )}

      {/* ── Overview ─────────────────────────────────── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="grid grid-cols-1 md:grid-cols-2 px-8 md:px-16 lg:px-28 py-16 md:py-24 gap-12 md:gap-0">
          {/* Left — description */}
          <div className="md:pr-16 md:border-r md:border-[#E0E0E0]">
            <Reveal>
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "28px" }}>
                Our Studio
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p style={{ fontFamily: F, fontSize: "clamp(15px, 1.8vw, 20px)", color: DARK, lineHeight: 1.8, fontWeight: 400 }}>
                {content.description}
              </p>
            </Reveal>
          </div>

          {/* Right — specs */}
          <div className="md:pl-16">
            <Reveal delay={0.1}>
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "28px" }}>
                Specifications
              </p>
            </Reveal>
            {content.specs.filter(s => s.value).map((spec, i) => (
              <Reveal key={spec.id} delay={0.12 + i * 0.06}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: "15px", marginBottom: "15px", borderBottom: BORDER }}>
                  <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0, marginRight: "16px" }}>
                    {spec.label}
                  </span>
                  <span style={{ fontFamily: F, fontSize: "14px", color: DARK, fontWeight: 500, letterSpacing: "-0.01em", textAlign: "right" }}>
                    {spec.value}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo Grid ───────────────────────────────── */}
      {content.photos.some(Boolean) && (
        <section style={{ borderBottom: BORDER }}>
          <div className="px-8 md:px-16 lg:px-28 py-14">
            <Reveal>
              <PhotoGrid photos={content.photos} />
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Equipment & Facilities ───────────────────── */}
      {content.sections.length > 0 && (
        <section style={{ borderBottom: BORDER }}>
          <div className="px-8 md:px-16 lg:px-28 py-16 md:py-24">
            <Reveal>
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "36px" }}>
                Facilities & Equipment
              </p>
            </Reveal>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                gap: "0",
                borderTop: BORDER,
                borderLeft: BORDER,
              }}
            >
              {content.sections.map((sec, i) => (
                <div key={sec.id} style={{ borderRight: BORDER, borderBottom: BORDER }}>
                  <SectionCard section={sec} delay={i * 0.07} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── What We Shoot ───────────────────────────── */}
      {content.capabilities.length > 0 && (
        <section style={{ backgroundColor: DARK, borderBottom: "1px solid #1A1A1A" }}>
          <div className="px-8 md:px-16 lg:px-28 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
              <div className="md:pr-12">
                <Reveal>
                  <p style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
                    What We Shoot
                  </p>
                </Reveal>
              </div>
              <div className="md:col-span-2">
                {content.capabilities.map((cap, i) => (
                  <CapabilityItem key={i} label={cap} index={i} delay={i * 0.07} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <Reveal>
            <p style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(28px, 5vw, 64px)", color: DARK, letterSpacing: "-0.03em", lineHeight: 1, margin: 0, textTransform: "uppercase" }}>
              스튜디오<br />사용 문의
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link to="/contact" data-cursor="hover-link">
              <motion.div
                style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "16px 32px", background: DARK, cursor: "pointer" }}
                whileHover={{ gap: "20px" }}
                transition={{ duration: 0.25 }}>
                <span style={{ fontFamily: F, fontSize: "13px", color: "#FAFAFA", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>
                  문의하기
                </span>
                <span style={{ color: "#FAFAFA", fontSize: "16px" }}>→</span>
              </motion.div>
            </Link>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

// ─── Capability row ───────────────────────────────────────
function CapabilityItem({ label, index, delay }: { label: string; index: number; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", alignItems: "center", gap: "20px", paddingTop: "20px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "default" }}>
        <span style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em", flexShrink: 0, minWidth: "24px" }}>
          {num}
        </span>
        <span style={{ fontFamily: F, fontWeight: 600, fontSize: "clamp(18px, 3vw, 32px)", color: hovered ? "#FAFAFA" : "rgba(255,255,255,0.5)", letterSpacing: "-0.02em", transition: "color 0.3s ease", textDecoration: hovered ? "underline" : "none", textUnderlineOffset: "4px" }}>
          {label}
        </span>
      </div>
    </Reveal>
  );
}
