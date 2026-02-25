import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";

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

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 px-8 md:px-12 lg:px-16"
        animate={{
          backgroundColor: scrolled ? "rgba(250,250,250,0.92)" : "#FAFAFA",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.3 }}
        style={{ borderBottom: "1px solid #E0E0E0" }}
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
                  color: "#0D0D0D",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                SIG STUDIO
              </span>
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} data-cursor="hover-link">
                <motion.span
                  className="relative block overflow-hidden"
                  style={{
                    fontFamily: F,
                    fontWeight: 500,
                    fontSize: "13px",
                    color: location.pathname.startsWith(link.href) ? "#0D0D0D" : "#999999",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                  whileHover={{ color: "#0D0D0D" }}
                  transition={{ duration: 0.2 }}
                >
                  {link.label}
                  {location.pathname.startsWith(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      style={{
                        position: "absolute",
                        bottom: -2,
                        left: 0,
                        right: 0,
                        height: "1px",
                        backgroundColor: "#0D0D0D",
                      }}
                    />
                  )}
                </motion.span>
              </Link>
            ))}
            <Link to="/contact" data-cursor="hover-button">
              <motion.button
                style={{
                  fontFamily: F,
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#FAFAFA",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "9px 20px",
                  border: "1px solid #0D0D0D",
                  background: "#0D0D0D",
                }}
                whileHover={{ background: "#FAFAFA", color: "#0D0D0D" }}
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
            <motion.span
              style={{
                fontFamily: F,
                fontSize: "20px",
                color: "#0D0D0D",
                lineHeight: 1,
                display: "block",
                animationName: menuOpen ? "sigSpin" : "sigSpin",
                animationDuration: menuOpen ? "1.5s" : "8s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >
              {menuOpen ? "×" : "✱"}
            </motion.span>
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
                      <span style={{ color: "#444444", fontSize: "20px" }}>✱</span>
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
