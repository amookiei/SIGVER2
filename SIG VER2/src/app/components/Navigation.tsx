import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { LogoSymbol } from "./LogoSymbol";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // 홈 히어로(영상 배경)에서는 투명 + 블러 + 흰 텍스트
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  const logoColor = isTransparent ? "#FFFFFF" : "#0D0D0D";
  const mobileToggleColor = isTransparent ? "#FFFFFF" : "#0D0D0D";

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-8 md:px-16 lg:px-28"
        animate={{
          backgroundColor: isTransparent
            ? "rgba(0,0,0,0)"
            : scrolled
            ? "rgba(250,250,250,0.92)"
            : "#FAFAFA",
          backdropFilter: isTransparent ? "blur(18px)" : scrolled ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        style={{
          borderBottom: isTransparent
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid #E0E0E0",
        }}
      >
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" data-cursor="hover-link">
            <motion.div
              className="flex items-center"
              whileHover={{ opacity: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <span
                style={{
                  fontFamily: F,
                  fontWeight: 800,
                  fontSize: "15px",
                  color: logoColor,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "color 0.3s",
                }}
              >
                SIG STUDIO
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.href);
              const linkColor = isTransparent
                ? isActive ? "#FFFFFF" : "rgba(255,255,255,0.6)"
                : isActive ? "#0D0D0D" : "#999999";
              const indicatorColor = isTransparent ? "#FFFFFF" : "#0D0D0D";
              return (
                <Link key={link.href} to={link.href} data-cursor="hover-link">
                  <motion.span
                    className="relative block overflow-hidden"
                    style={{
                      fontFamily: F,
                      fontWeight: 500,
                      fontSize: "13px",
                      color: linkColor,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      transition: "color 0.3s",
                    }}
                    whileHover={{ color: isTransparent ? "#FFFFFF" : "#0D0D0D" }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        style={{
                          position: "absolute",
                          bottom: -2,
                          left: 0,
                          right: 0,
                          height: "1px",
                          backgroundColor: indicatorColor,
                        }}
                      />
                    )}
                  </motion.span>
                </Link>
              );
            })}
            <Link to="/contact" data-cursor="hover-button">
              <motion.button
                style={{
                  fontFamily: F,
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#FFFFFF",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "9px 20px",
                  border: isTransparent ? "1px solid rgba(255,255,255,0.55)" : "1px solid #0D0D0D",
                  background: isTransparent ? "transparent" : "#0D0D0D",
                  transition: "border-color 0.3s, background 0.3s",
                }}
                whileHover={
                  isTransparent
                    ? { background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }
                    : { background: "#FAFAFA", color: "#0D0D0D" }
                }
                transition={{ duration: 0.25 }}
              >
                문의하기
              </motion.button>
            </Link>
          </div>

          {/* Mobile toggle — ✱ symbol */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
              {menuOpen ? (
              <motion.span style={{ fontSize: "22px", color: "#0D0D0D", lineHeight: 1, display: "block" }}>
                ×
              </motion.span>
            ) : (
              <LogoSymbol
                style={{
                  color: mobileToggleColor,
                  width: "20px",
                  height: "20px",
                  display: "block",
                  animationName: "sigSpin",
                  animationDuration: "8s",
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  transition: "color 0.3s",
                }}
              />
            )}
          </button>
        </div>
      </motion.nav>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end"
            style={{ backgroundColor: "#0D0D0D" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Big nav links */}
            <div className="px-8 pb-16 flex flex-col gap-0">
              {[{ href: "/", label: "Home" }, ...navLinks].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.5 }}
                  style={{ borderTop: "1px solid #1A1A1A" }}
                >
                  <Link
                    to={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-5"
                    data-cursor="hover-link"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{
                          fontFamily: F,
                          fontWeight: 700,
                          fontSize: "clamp(36px, 10vw, 64px)",
                          color: location.pathname === link.href ? "#FAFAFA" : "#444444",
                          letterSpacing: "-0.02em",
                          textTransform: "uppercase",
                        }}
                      >
                        {link.label}
                      </span>
                      <LogoSymbol style={{ color: "#444444", width: "20px", height: "20px", flexShrink: 0 }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bottom info */}
            <motion.div
              className="px-8 pb-10 pt-6 flex justify-between items-end"
              style={{ borderTop: "1px solid #1A1A1A" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span style={{ fontFamily: F, fontSize: "12px", color: "#444444", letterSpacing: "0.05em" }}>
                SIG STUDIO — SEOUL
              </span>
              <div className="flex gap-5">
                {["IG", "BE", "LI"].map((s) => (
                  <span
                    key={s}
                    style={{ fontFamily: F, fontSize: "12px", color: "#444444", letterSpacing: "0.08em" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
