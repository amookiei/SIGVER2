import { motion } from "motion/react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const TEXT3 = "#999999";

export function Clients() {
  return (
    <div style={{ backgroundColor: "#0D0D0D", minHeight: "100vh", position: "relative", overflow: "hidden" }}>

      {/* Fullscreen video background */}
      <video
        src="/clint.mp4"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
          zIndex: 0,
        }}
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Overlay — page label bottom-left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: "fixed",
          bottom: "40px",
          left: "clamp(32px, 7vw, 112px)",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <span style={{ fontFamily: F, fontSize: "11px", color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Clients Showreel
        </span>
      </motion.div>

    </div>
  );
}
