import { useParams, Link, Navigate } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { getProjectBySlug } from "../data/portfolio";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

export function WorkDetail() {
  const { slug } = useParams();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroScale = useTransform(scrollY, [0, 500], [1.06, 1]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.5]);

  const item = getProjectBySlug(slug ?? "");
  if (!item) return <Navigate to="/work" replace />;

  const nextItem = item.nextProject ? getProjectBySlug(item.nextProject) : null;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      {/* Back nav */}
      <div className="px-8 md:px-12 lg:px-16 pt-24 pb-6" style={{ borderBottom: BORDER }}>
        <Link to="/work" data-cursor="hover-link">
          <motion.div
            className="inline-flex items-center gap-3"
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <span style={{ fontFamily: F, fontSize: "16px", color: TEXT3 }}>←</span>
            <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Work
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Hero Image */}
      <div
        ref={heroRef}
        style={{ overflow: "hidden", height: "clamp(300px, 55vw, 700px)", backgroundColor: "#F0F0F0" }}
      >
        <motion.img
          src={item.heroImage}
          alt={item.title}
          className="w-full h-full object-cover"
          style={{ scale: heroScale, opacity: heroOpacity }}
        />
      </div>

      {/* Project Info */}
      <div style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-12 lg:px-16 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Title + Description */}
            <div className="lg:col-span-2">
              <motion.span
                style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {item.category}
              </motion.span>
              <motion.h1
                style={{
                  fontFamily: F,
                  fontWeight: 800,
                  fontSize: "clamp(32px, 6vw, 72px)",
                  color: DARK,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.9,
                  margin: "10px 0 8px",
                  textTransform: "uppercase",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                {item.title}
              </motion.h1>
              <motion.p
                style={{ fontFamily: F, fontSize: "14px", color: TEXT3, marginBottom: "24px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {item.tagline}
              </motion.p>
              <motion.p
                style={{ fontFamily: F, fontSize: "16px", color: TEXT2, lineHeight: 1.75, maxWidth: "560px" }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {item.description}
              </motion.p>

              {item.liveUrl && (
                <motion.a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover-link"
                  className="inline-flex items-center gap-2 mt-8"
                  style={{
                    fontFamily: F,
                    fontSize: "12px",
                    color: DARK,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: BORDER,
                    padding: "10px 20px",
                  }}
                  whileHover={{ backgroundColor: DARK, color: BG }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                >
                  Live Site ↗
                </motion.a>
              )}
            </div>

            {/* Sidebar meta */}
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                { label: "Client", value: item.client },
                { label: "Role", value: item.role },
                { label: "Duration", value: item.duration },
                { label: "Year", value: String(item.year) },
              ].map((meta) => (
                <div key={meta.label} style={{ paddingBottom: "20px", borderBottom: BORDER }}>
                  <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
                    {meta.label}
                  </p>
                  <p style={{ fontFamily: F, fontSize: "14px", color: DARK, lineHeight: 1.55 }}>
                    {meta.value}
                  </p>
                </div>
              ))}
              <div>
                <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: F,
                        fontSize: "11px",
                        color: TEXT2,
                        border: BORDER,
                        padding: "4px 10px",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Challenge & Solution */}
      {(item.challenge || item.solution) && (
        <div style={{ borderBottom: BORDER }}>
          <div className="px-8 md:px-12 lg:px-16 py-14 grid grid-cols-1 md:grid-cols-2 gap-0">
            {item.challenge && (
              <motion.div
                style={{ paddingRight: "48px", borderRight: "1px solid #EEEEEE" }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
                  — Challenge
                </p>
                <p style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.8 }}>
                  {item.challenge}
                </p>
              </motion.div>
            )}
            {item.solution && (
              <motion.div
                style={{ paddingLeft: "48px" }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>
                  — Solution
                </p>
                <p style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.8 }}>
                  {item.solution}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Gallery */}
      <div>
        {/* 2-col */}
        {item.gallery.length >= 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: BORDER }}>
            {item.gallery.slice(0, 2).map((img, i) => (
              <motion.div
                key={i}
                style={{
                  overflow: "hidden",
                  aspectRatio: "4/3",
                  backgroundColor: "#F0F0F0",
                  borderRight: i === 0 ? BORDER : "none",
                }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <motion.img
                  src={img}
                  alt={`${item.title} ${i + 1}`}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Full-width remaining */}
        {item.gallery.slice(2).map((img, i) => (
          <motion.div
            key={i}
            style={{ overflow: "hidden", height: "clamp(280px, 50vw, 640px)", backgroundColor: "#F0F0F0", borderBottom: BORDER }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.img
              src={img}
              alt={`${item.title} ${i + 3}`}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
            />
          </motion.div>
        ))}

        {/* Hero full-width */}
        <motion.div
          style={{ overflow: "hidden", height: "clamp(280px, 50vw, 640px)", backgroundColor: "#F0F0F0", borderBottom: BORDER }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.img
            src={item.heroImage}
            alt={item.title}
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.85)" }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }}
          />
        </motion.div>
      </div>

      {/* Next Project */}
      {nextItem && (
        <div style={{ backgroundColor: BG }}>
          <Link to={`/work/${nextItem.slug}`} data-cursor="view">
            <motion.div
              className="px-8 md:px-12 lg:px-16 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              style={{ borderBottom: BORDER }}
              whileHover={{ backgroundColor: "#F5F3EF" }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
                  Next Project
                </p>
                <h3
                  style={{
                    fontFamily: F,
                    fontWeight: 800,
                    fontSize: "clamp(24px, 4vw, 52px)",
                    color: DARK,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  {nextItem.title}
                </h3>
                <p style={{ fontFamily: F, fontSize: "13px", color: TEXT3 }}>
                  {nextItem.client} · {nextItem.year}
                </p>
              </div>
              <motion.div
                className="shrink-0 w-14 h-14 rounded-full border flex items-center justify-center"
                style={{ borderColor: "#E0E0E0" }}
                whileHover={{ backgroundColor: DARK, borderColor: DARK }}
                transition={{ duration: 0.25 }}
              >
                <motion.span
                  style={{ color: DARK, fontSize: "18px", lineHeight: 1 }}
                  whileHover={{ color: BG }}
                >
                  →
                </motion.span>
              </motion.div>
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  );
}
