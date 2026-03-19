import { motion } from "motion/react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

export default function SigLoading() {
  return (
    <motion.div
      key="sig-loading"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(30,30,30,0.72)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
        pointerEvents: "none",
      }}
    >
      {/* 스피너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", width: 56, height: 56 }}
      >
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ position: "absolute", inset: 0 }}>
          <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <motion.circle
            cx="28" cy="28" r="24"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="150.796"
            strokeDashoffset="113"
            style={{ transformOrigin: "28px 28px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </motion.div>

      {/* 텍스트 */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        style={{
          fontFamily: F,
          fontSize: "13px",
          fontWeight: 400,
          color: "#FFFFFF",
          letterSpacing: "0.04em",
          margin: 0,
        }}
      >
        Standard of Innovation, Global Leader
      </motion.p>
    </motion.div>
  );
}
