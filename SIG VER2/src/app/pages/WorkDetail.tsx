import { useParams, Link, Navigate } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useEffect } from "react";
import { useAdmin } from "../context/AdminContext";
import { useSEO } from "../hooks/useSEO";

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

  const { getBySlug } = useAdmin();
  const item = getBySlug(slug ?? "");

  useSEO({
    title: item ? `${item.title} | Studio SIG` : "Work | Studio SIG",
    description: item
      ? `${item.tagline ?? item.description?.slice(0, 120)} — Studio SIG ${item.category} 프로젝트`
      : undefined,
    canonical: item ? `https://studiosig.com/work/${item.slug}` : undefined,
  });

  useEffect(() => {
    if (!item) return;
    const id = "ld-creative-work";
    document.getElementById(id)?.remove();
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `https://studiosig.com/work/${item.slug}`,
      "name": item.title,
      "description": item.description ?? item.tagline,
      "creator": { "@type": "Organization", "name": "Studio SIG", "url": "https://studiosig.com" },
      "dateCreated": String(item.year),
      "genre": item.category,
      "keywords": item.tags?.join(", "),
      "url": `https://studiosig.com/work/${item.slug}`,
      ...(item.heroImage ? { "image": item.heroImage } : {}),
      ...(item.client ? { "contributor": { "@type": "Organization", "name": item.client } } : {}),
    });
    document.head.appendChild(script);
    return () => { document.getElementById(id)?.remove(); };
  }, [item]);

  if (!item) return <Navigate to="/work" replace />;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      {/* Back nav */}
      <div className="px-8 md:px-16 lg:px-28 pt-24 pb-6" style={{ borderBottom: BORDER }}>
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

      {/* ─── Hero Image ─────────────────────────────────── */}
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

      {/* ─── Title + Description (editorial split layout) ─ */}
      <div style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
            {/* Left: category + big title */}
            <div>
              <motion.span
                style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.14em", textTransform: "uppercase", display: "block", marginBottom: "20px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {item.category}
              </motion.span>
              <motion.h1
                style={{
                  fontFamily: F,
                  fontWeight: 700,
                  fontSize: "clamp(36px, 6vw, 80px)",
                  color: DARK,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.9,
                  margin: 0,
                  textTransform: "uppercase",
                }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15 }}
              >
                {item.title}
              </motion.h1>
            </div>

            {/* Right: tagline + description */}
            <motion.div
              className="flex flex-col justify-end"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
            >
              {item.tagline && (
                <p style={{ fontFamily: F, fontSize: "13px", color: TEXT3, marginBottom: "16px", letterSpacing: "0.02em" }}>
                  {item.tagline}
                </p>
              )}
              <p style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.8 }}>
                {item.description}
              </p>
              {item.liveUrl && (
                <motion.a
                  href={item.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="hover-link"
                  className="inline-flex items-center gap-2 mt-8 self-start"
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
                  transition={{ duration: 0.2 }}
                >
                  Live Site ↗
                </motion.a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Content Blocks ──────────────────────────────── */}
      {item.contentBlocks && item.contentBlocks.length > 0 && (
        <>
          {item.contentBlocks.map((block, i) => (
            <motion.div
              key={block.id}
              style={{ borderBottom: BORDER }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
            >
              {block.type === "text" && (
                <div className="py-16 md:py-20" style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ width: "100%", maxWidth: "680px", padding: "0 32px" }}>
                    {block.title && (
                      <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
                        {block.title}
                      </p>
                    )}
                    <p style={{ fontFamily: F, fontWeight: 400, fontSize: "14px", color: TEXT2, lineHeight: 1.9 }}>
                      {block.body}
                    </p>
                  </div>
                </div>
              )}

              {block.type === "image" && block.images.filter(Boolean).length > 0 && (() => {
                const imgs = block.images.filter(Boolean);
                const count = block.imageCount ?? (imgs.length >= 2 ? 2 : 1);
                const show = imgs.slice(0, count);
                const isSingle = show.length === 1;

                return isSingle ? (
                  /* 한 장: 모바일 적정 높이 / PC 풀스크린 */
                  <div
                    className="overflow-hidden bg-[#F0F0F0] h-[55vw] md:h-screen"
                  >
                    <motion.img
                      src={show[0]}
                      alt={`${item.title} — 이미지`}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                ) : (
                  /* 두 장: 모바일 풀와이드 / PC 네비 패딩 맞춰 정렬 */
                  <div className="md:px-16 lg:px-28">
                    <div className="grid grid-cols-2">
                      {show.map((src, j) => (
                        <div
                          key={j}
                          className="overflow-hidden bg-[#F0F0F0] h-[35vw] md:h-[28vw]"
                          style={{ borderRight: j === 0 ? BORDER : "none" }}
                        >
                          <motion.img
                            src={src}
                            alt={`${item.title} — 이미지 ${j + 1}`}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ))}
        </>
      )}

      {/* fallback: challenge / solution (레거시) */}
      {(!item.contentBlocks || item.contentBlocks.length === 0) && (item.challenge || item.solution) && (
        <>
          {item.challenge && (
            <motion.div
              style={{ borderBottom: BORDER }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="py-16 md:py-20" style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: "680px", padding: "0 32px" }}>
                  <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Challenge</p>
                  <p style={{ fontFamily: F, fontWeight: 400, fontSize: "14px", color: TEXT2, lineHeight: 1.9 }}>{item.challenge}</p>
                </div>
              </div>
            </motion.div>
          )}
          {item.solution && (
            <motion.div
              style={{ borderBottom: BORDER }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="py-16 md:py-20" style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: "680px", padding: "0 32px" }}>
                  <p style={{ fontFamily: F, fontSize: "13px", fontWeight: 700, color: DARK, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>Solution</p>
                  <p style={{ fontFamily: F, fontWeight: 400, fontSize: "14px", color: TEXT2, lineHeight: 1.9 }}>{item.solution}</p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ─── Work Scope ──────────────────────────────────── */}
      {item.workScope && item.workScope.length > 0 && (
        <motion.div
          style={{ borderBottom: BORDER }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-8 md:px-16 lg:px-28 py-14">
            <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "28px" }}>
              — Work Scope
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-3">
              {item.workScope.map((scope, i) => (
                <motion.span
                  key={i}
                  style={{ fontFamily: F, fontSize: "14px", color: DARK, letterSpacing: "-0.01em" }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  {scope}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Additional Info ─────────────────────────────── */}
      {item.additionalInfo && item.additionalInfo.length > 0 && (
        <motion.div
          style={{ borderBottom: BORDER }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="px-8 md:px-16 lg:px-28 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {item.additionalInfo.map((info, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
                    {info.label}
                  </p>
                  <p style={{ fontFamily: F, fontSize: "14px", color: DARK, lineHeight: 1.55 }}>
                    {info.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
