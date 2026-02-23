import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";

type CursorState = "default" | "hover-link" | "hover-button" | "view";

// 브랜드 심볼 ✱ — mix-blend-mode: difference로 배경색에 따라 자동 반전
export function CustomCursor() {
  const [cursorState, setCursorState] = useState<CursorState>("default");
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const springX = useSpring(cursorX, { damping: 30, stiffness: 600, mass: 0.2 });
  const springY = useSpring(cursorY, { damping: 30, stiffness: 600, mass: 0.2 });

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const closest = target.closest("[data-cursor]") as HTMLElement | null;
      if (closest) {
        const type = closest.getAttribute("data-cursor") as CursorState;
        setCursorState(type || "hover-link");
      } else if (
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']")
      ) {
        setCursorState("hover-link");
      } else {
        setCursorState("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const isHover = cursorState === "hover-link" || cursorState === "hover-button";
  const isView = cursorState === "view";

  const spinDuration = isHover ? "1.5s" : "8s";

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        opacity: isVisible ? 1 : 0,
        mixBlendMode: "difference",
        color: "#FFFFFF",
      }}
    >
      <AnimatePresence mode="wait">
        {isView ? (
          /* VIEW 상태: 원형 + VIEW 텍스트 */
          <motion.div
            key="view"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "1px solid #FFFFFF",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "9px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              VIEW
            </span>
            <span
              style={{
                fontSize: "14px",
                lineHeight: 1,
                animationName: "sigSpin",
                animationDuration: "2s",
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                display: "block",
              }}
            >
              ✱
            </span>
          </motion.div>
        ) : (
          /* 기본 / 호버 상태: ✱ 심볼 */
          <motion.div
            key="asterisk"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHover ? 2.4 : 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "18px",
                fontWeight: 300,
                lineHeight: 1,
                display: "block",
                animationName: "sigSpin",
                animationDuration: spinDuration,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
              }}
            >✱</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
