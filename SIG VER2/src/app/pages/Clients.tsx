import { motion } from "motion/react";
import { LogoSymbol } from "../components/LogoSymbol";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT3 = "#999999";

export function Clients() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ borderBottom: BORDER, paddingTop: "72px" }}>
        <div className="px-8 md:px-16 lg:px-28 pt-14 pb-0">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}
          >
            Our Work
          </motion.p>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(64px, 14vw, 180px)", color: DARK, letterSpacing: "-0.05em", lineHeight: 0.84, margin: "0 0 20px", textTransform: "uppercase" }}
            >
              CLIENTS
            </motion.h1>
          </div>
        </div>

        {/* Sub info bar */}
        <div className="px-8 md:px-16 lg:px-28 py-4 flex items-center justify-between">
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.06em" }}>
            Client Showreel
          </span>
          <LogoSymbol style={{ color: "#DDDDDD", width: "13px", height: "13px", display: "block", animationName: "sigSpin", animationDuration: "8s", animationTimingFunction: "linear", animationIterationCount: "infinite" }} />
        </div>
      </div>

      {/* Video */}
      <motion.div
        className="px-8 md:px-16 lg:px-28 py-10 md:py-16"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div style={{ width: "100%", aspectRatio: "16/9", backgroundColor: "#0D0D0D", overflow: "hidden" }}>
          <video
            src="/clint.mp4"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
      </motion.div>

    </div>
  );
}
