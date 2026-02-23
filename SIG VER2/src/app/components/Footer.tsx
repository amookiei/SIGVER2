import { Link } from "react-router";
import { motion } from "motion/react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer style={{ backgroundColor: "#0D0D0D" }}>
      {/* Top */}
      <div className="px-8 md:px-12 lg:px-16 pt-16 pb-0">
        <div className="flex items-start justify-between" style={{ borderBottom: "1px solid #1F1F1F", paddingBottom: "40px" }}>
          <span
            style={{
              fontFamily: F,
              fontWeight: 800,
              fontSize: "15px",
              color: "#FAFAFA",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            SIG STUDIO
          </span>
          {/* ✱ rotating */}
          <span
            style={{
              fontFamily: F,
              fontSize: "28px",
              color: "#333333",
              lineHeight: 1,
              animationName: "sigSpin",
              animationDuration: "12s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              display: "block",
            }}
          >
            ✱
          </span>
        </div>

        {/* 3-col grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 py-12"
          style={{ borderBottom: "1px solid #1F1F1F" }}
        >
          {/* Col 1: Services */}
          <div style={{ borderRight: "1px solid #1F1F1F", paddingRight: "40px", paddingBottom: "32px" }}>
            <p
              style={{
                fontFamily: F,
                fontSize: "10px",
                color: "#444444",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Services
            </p>
            {["Branding & Identity", "Web & Digital Design", "Marketing Campaign", "Government Support"].map((item) => (
              <div key={item} style={{ marginBottom: "12px" }}>
                <span
                  style={{
                    fontFamily: F,
                    fontSize: "14px",
                    color: "#555555",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* Col 2: Contact */}
          <div className="md:pl-10 md:pr-10 py-0 md:py-0 pt-8 md:pt-0 pb-8 md:pb-0" style={{ borderRight: "1px solid #1F1F1F" }}>
            <p
              style={{
                fontFamily: F,
                fontSize: "10px",
                color: "#444444",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Contact
            </p>
            <a
              href="mailto:hello@sigstudio.kr"
              data-cursor="hover-link"
            >
              <motion.div
                style={{ marginBottom: "12px" }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <span style={{ fontFamily: F, fontSize: "14px", color: "#555555" }}>
                  hello@sigstudio.kr
                </span>
              </motion.div>
            </a>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ fontFamily: F, fontSize: "14px", color: "#555555" }}>
                010-7667-6013
              </span>
            </div>
            <div>
              <span style={{ fontFamily: F, fontSize: "14px", color: "#555555", lineHeight: 1.6 }}>
                서울특별시 서대문구<br />홍제천로 6길 40 1층
              </span>
            </div>
          </div>

          {/* Col 3: Social */}
          <div className="pl-0 md:pl-10 pt-8 md:pt-0">
            <p
              style={{
                fontFamily: F,
                fontSize: "10px",
                color: "#444444",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Social
            </p>
            {["Instagram", "Behance", "LinkedIn"].map((item) => (
              <motion.div
                key={item}
                style={{ marginBottom: "12px" }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                data-cursor="hover-link"
              >
                <span
                  style={{
                    fontFamily: F,
                    fontSize: "14px",
                    color: "#555555",
                  }}
                >
                  {item} ↗
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
          <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.02em" }}>
            © 2025 SIG Studio. All rights reserved.
          </span>
          <div className="flex items-center gap-8">
            <Link to="/" data-cursor="hover-link">
              <span style={{ fontFamily: F, fontSize: "12px", color: "#333333" }}>
                개인정보처리방침
              </span>
            </Link>
            <motion.button
              onClick={scrollToTop}
              data-cursor="hover-button"
              className="flex items-center gap-2"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{ fontFamily: F, fontSize: "12px", color: "#444444", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Back to top ↑
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
