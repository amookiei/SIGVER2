import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGallery } from "../context/GalleryContext";
import SigLoading from "../components/SigLoading";
import type { GalleryImage, GallerySection } from "../context/GalleryContext";
import { useSEO } from "../hooks/useSEO";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const BORDER = "1px solid #E0E0E0";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

// ─── Lightbox ─────────────────────────────────────────────
function Lightbox({
  images,
  startIdx,
  sectionTitle,
  onClose,
}: {
  images: GalleryImage[];
  startIdx: number;
  sectionTitle: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const current = images[idx];

  const prev = useCallback(() => setIdx((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        backgroundColor: "rgba(13,13,13,0.96)",
        display: "flex", flexDirection: "column",
      }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 32px", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontFamily: F, fontSize: "11px", color: "#666", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {sectionTitle}
        </span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#FAFAFA", fontFamily: F, fontSize: "22px", lineHeight: 1, padding: "4px 8px" }}
        >
          ×
        </button>
      </div>

      {/* Image area */}
      <div
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current.id}
            src={current.url}
            alt={current.alt || sectionTitle}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        </AnimatePresence>

        {/* Prev */}
        {images.length > 1 && (
          <button
            onClick={prev}
            style={{
              position: "absolute", left: "24px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#FAFAFA",
              fontFamily: F, fontSize: "28px", lineHeight: 1, opacity: 0.5,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            ←
          </button>
        )}

        {/* Next */}
        {images.length > 1 && (
          <button
            onClick={next}
            style={{
              position: "absolute", right: "24px", top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "#FAFAFA",
              fontFamily: F, fontSize: "28px", lineHeight: 1, opacity: 0.5,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
          >
            →
          </button>
        )}
      </div>

      {/* Bottom counter */}
      <div
        style={{ padding: "16px 32px", textAlign: "right", flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontFamily: F, fontSize: "11px", color: "#444", letterSpacing: "0.08em" }}>
          {idx + 1} / {images.length}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Photo Item (1:1 square) ───────────────────────────────
function PhotoItem({
  img,
  onClick,
}: {
  img: GalleryImage;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        background: "#EBEBEB",
      }}
    >
      <img
        src={img.url}
        alt={img.alt}
        loading="lazy"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.55s cubic-bezier(0.25, 0.1, 0.25, 1)",
        }}
      />
    </div>
  );
}

// ─── Gallery Section Block ─────────────────────────────────
function SectionBlock({
  section,
  onOpenLightbox,
}: {
  section: GallerySection;
  onOpenLightbox: (images: GalleryImage[], idx: number, title: string) => void;
}) {
  return (
    <div id={`section-${section.id}`} style={{ marginBottom: "80px" }}>
      {/* Section header */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "20px",
          marginBottom: "28px", paddingBottom: "16px", borderBottom: BORDER,
        }}
      >
        <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: "12px", color: TEXT3, letterSpacing: "0.14em", textTransform: "uppercase", margin: 0 }}>
          {section.title}
        </h2>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#CCCCCC" }}>
          ({section.images.length})
        </span>
      </div>

      {/* 1:1 square grid */}
      <div className="gallery-grid">
        {section.images.map((img, i) => (
          <PhotoItem
            key={img.id}
            img={img}
            onClick={() => onOpenLightbox(section.images, i, section.title)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Filter Bar ────────────────────────────────────────────
function FilterBar({
  sections,
  activeId,
  onFilter,
}: {
  sections: GallerySection[];
  activeId: string | null;
  onFilter: (id: string | null) => void;
}) {
  const scrollToSection = (id: string | null) => {
    onFilter(id);
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const links = [{ id: null, label: "ALL" }, ...sections.map((s) => ({ id: s.id, label: s.title }))];

  return (
    <div
      style={{
        position: "sticky",
        top: "72px",
        zIndex: 30,
        backgroundColor: "rgba(250,250,250,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: BORDER,
      }}
    >
      <div
        className="px-8 md:px-16 lg:px-28"
        style={{ display: "flex", gap: "0", overflowX: "auto", scrollbarWidth: "none" }}
      >
        {links.map(({ id, label }) => {
          const isActive = activeId === id;
          return (
            <button
              key={id ?? "all"}
              onClick={() => scrollToSection(id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: F,
                fontSize: "11px",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? DARK : TEXT3,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "16px 20px",
                borderBottom: isActive ? `2px solid ${DARK}` : "2px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gallery Page ──────────────────────────────────────────
export function Gallery() {
  useSEO({
    title: "Gallery | 스튜디오 시그 Studio SIG — 디자인 작업 갤러리",
    description: "Studio SIG의 브랜딩, 마케팅, UI/UX 디자인 작업 갤러리입니다. 다양한 프로젝트 비주얼을 확인하세요.",
    canonical: "https://www.studiosig.com/gallery",
  });

  const { data, loading } = useGallery();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    images: GalleryImage[];
    idx: number;
    title: string;
  } | null>(null);

  const sectionRefs = useRef<Map<string, IntersectionObserverEntry>>(new Map());

  // IntersectionObserver to track active section for filter bar
  useEffect(() => {
    if (!data.sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace("section-", "");
          sectionRefs.current.set(id, entry);
        });
        // Find the topmost intersecting section
        let topId: string | null = null;
        let topY = Infinity;
        sectionRefs.current.forEach((entry, id) => {
          if (entry.isIntersecting && entry.boundingClientRect.top < topY) {
            topY = entry.boundingClientRect.top;
            topId = id;
          }
        });
        setActiveSection(topId);
      },
      { threshold: 0.1, rootMargin: "-100px 0px -60% 0px" }
    );

    data.sections.forEach((s) => {
      const el = document.getElementById(`section-${s.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data.sections]);

  const totalPhotos = data.sections.reduce((acc, s) => acc + s.images.length, 0);

  const openLightbox = (images: GalleryImage[], idx: number, title: string) => {
    setLightbox({ images, idx, title });
  };

  return (
    <div style={{ backgroundColor: BG, paddingTop: "72px" }}>
      <AnimatePresence>{loading && <SigLoading />}</AnimatePresence>
      {/* ── Page Header ────────────────────────────────── */}
      <div className="px-8 md:px-16 lg:px-28 pt-16 pb-10" style={{ borderBottom: BORDER }}>
        <div className="flex items-end justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            style={{
              fontFamily: F, fontWeight: 700,
              fontSize: "clamp(40px, 8vw, 100px)",
              color: DARK, letterSpacing: "-0.04em",
              lineHeight: 0.88, textTransform: "uppercase", margin: 0,
            }}
          >
            GALLERY
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ textAlign: "right" }}
          >
            <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.06em" }}>
              {data.sections.length} Series · {totalPhotos} Photos
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────────── */}
      {data.sections.length > 1 && (
        <FilterBar sections={data.sections} activeId={activeSection} onFilter={setActiveSection} />
      )}

      {/* ── Content ────────────────────────────────────── */}
      <div className="px-8 md:px-16 lg:px-28 py-14">
        {data.sections.length === 0 ? (
          <div style={{ textAlign: "center", padding: "120px 0" }}>
            <p style={{ fontFamily: F, fontSize: "14px", color: TEXT3 }}>
              아직 등록된 갤러리가 없습니다.
            </p>
          </div>
        ) : (
          data.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              onOpenLightbox={openLightbox}
            />
          ))
        )}
      </div>

      {/* ── Lightbox ───────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={lightbox.images}
            startIdx={lightbox.idx}
            sectionTitle={lightbox.title}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        @media (max-width: 640px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 4px; }
        }
      `}</style>
    </div>
  );
}
