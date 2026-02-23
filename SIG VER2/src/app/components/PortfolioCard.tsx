import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { PortfolioItem } from "../data/portfolio";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

interface PortfolioCardProps {
  item: PortfolioItem;
  index?: number;
  /** 4열 그리드 셀 버전 (Work 페이지) */
  variant?: "grid";
}

export function PortfolioCard({ item, index = 0, variant = "grid" }: PortfolioCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ borderRight: "1px solid #E0E0E0", borderBottom: "1px solid #E0E0E0" }}
    >
      <Link to={`/work/${item.slug}`} data-cursor="view">
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Image — 4:3 aspect ratio */}
          <div
            style={{
              aspectRatio: "4/3",
              overflow: "hidden",
              position: "relative",
              backgroundColor: "#F0F0F0",
            }}
          >
            <motion.img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            />
            {/* Hover overlay */}
            <motion.div
              className="absolute inset-0"
              style={{ backgroundColor: "#0D0D0D" }}
              animate={{ opacity: hovered ? 0.08 : 0 }}
              transition={{ duration: 0.3 }}
            />
            {/* Category tag */}
            <div className="absolute top-4 left-4">
              <motion.span
                style={{
                  fontFamily: F,
                  fontSize: "10px",
                  fontWeight: 500,
                  color: "#FAFAFA",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "rgba(13,13,13,0.6)",
                  backdropFilter: "blur(8px)",
                  padding: "3px 8px",
                }}
                animate={{ opacity: hovered ? 1 : 0.8 }}
              >
                {item.category}
              </motion.span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#E0E0E0" }} />

          {/* Metadata */}
          <div
            style={{ padding: "16px 20px 20px" }}
          >
            <motion.p
              style={{
                fontFamily: F,
                fontWeight: 700,
                fontSize: "14px",
                color: "#0D0D0D",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
              animate={{ x: hovered ? 4 : 0 }}
              transition={{ duration: 0.25 }}
            >
              {item.title}
            </motion.p>
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: F,
                  fontSize: "11px",
                  color: "#999999",
                  letterSpacing: "0.04em",
                }}
              >
                {item.client}
              </span>
              <span
                style={{
                  fontFamily: F,
                  fontSize: "11px",
                  color: "#CCCCCC",
                  letterSpacing: "0.04em",
                }}
              >
                {item.year}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
