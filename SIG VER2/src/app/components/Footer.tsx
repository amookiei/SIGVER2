import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAdmin } from "../context/AdminContext";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

// ─── Password Modal ───────────────────────────────────────
function AdminModal({ onClose }: { onClose: () => void }) {
  const { login } = useAdmin();
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (isSubmitting || !pw.trim()) return;
    setIsSubmitting(true);
    setError(null);
    const result = await login(pw);
    setIsSubmitting(false);
    if (result.success) {
      onClose();
      navigate("/admin");
    } else {
      setError(result.error ?? "암호가 올바르지 않습니다");
      setPw("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0D0D0D",
          border: "1px solid #1F1F1F",
          padding: "48px 44px",
          width: "360px",
          maxWidth: "90vw",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <p
          style={{
            fontFamily: F,
            fontSize: "10px",
            color: "#444",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          SIG ADMIN
        </p>

        {/* Input */}
        <input
          ref={inputRef}
          autoFocus
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="암호를 입력하세요"
          disabled={isSubmitting}
          autoComplete="current-password"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            borderBottom: error ? "1px solid #CC2222" : "1px solid #2A2A2A",
            color: error ? "#CC2222" : "#FAFAFA",
            fontFamily: F,
            fontSize: "14px",
            padding: "10px 0",
            outline: "none",
            marginBottom: "8px",
            boxSizing: "border-box",
            transition: "border-color 0.2s, color 0.2s",
            opacity: isSubmitting ? 0.5 : 1,
          }}
        />

        {/* Error */}
        <div style={{ minHeight: "18px", marginBottom: "28px" }}>
          {error && (
            <p style={{ fontFamily: F, fontSize: "11px", color: "#CC2222", letterSpacing: "0.04em" }}>
              {error}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "none",
              border: "1px solid #1F1F1F",
              color: "#444",
              fontFamily: F,
              fontSize: "12px",
              padding: "10px",
              cursor: "pointer",
              letterSpacing: "0.06em",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              flex: 2,
              background: "#FAFAFA",
              border: "none",
              color: "#0D0D0D",
              fontFamily: F,
              fontSize: "12px",
              fontWeight: 700,
              padding: "10px",
              cursor: isSubmitting ? "default" : "pointer",
              letterSpacing: "0.08em",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? "확인 중..." : "로그인 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────
export function Footer() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleAdminTrigger = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
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
                  <span style={{ fontFamily: F, fontSize: "14px", color: "#555555" }}>
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
              <a href="mailto:hello@sigstudio.kr" data-cursor="hover-link">
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
                  <span style={{ fontFamily: F, fontSize: "14px", color: "#555555" }}>
                    {item} ↗
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <span style={{ fontFamily: F, fontSize: "12px", color: "#333333", letterSpacing: "0.02em" }}>
                © 2025 SIG Studio. All rights reserved.
              </span>
              {/* Hidden admin trigger — barely visible on dark bg */}
              <span
                onClick={handleAdminTrigger}
                data-cursor="hover-link"
                title=""
                style={{
                  fontFamily: F,
                  fontSize: "8px",
                  color: isAdmin ? "#2A2A2A" : "#161616",
                  marginLeft: "10px",
                  userSelect: "none",
                  letterSpacing: "0.15em",
                }}
              >
                {isAdmin ? "ADMIN" : "·"}
              </span>
            </div>
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

      {/* Password Modal */}
      {showModal && <AdminModal onClose={() => setShowModal(false)} />}
    </>
  );
}
