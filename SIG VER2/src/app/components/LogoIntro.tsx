import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation } from "react-router";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const SEEN_KEY = "sig_intro_seen";
const DURATION_MS = 2700;
const EASE = [0.76, 0, 0.24, 1] as const;

// LogoSymbol.tsx 와 동일한 패스 — 인트로에서는 스트로크로 그려진 뒤 채워집니다.
const PATHS = [
  "M206.33,2.76C117.51,9.94,43.45,69.29,14.76,150.1-3.93,125.33-2.59,95.58,21.98,70.23,62.21,28.7,138.59,7.08,206.33,2.76Z",
  "M427.06,378.8c-40.19,41.49-116.49,63.07-184.15,67.43,88.7-7.26,162.69-66.53,191.34-147.26,18.68,24.77,17.35,54.52-7.18,79.83Z",
  "M34.26,168.9c-20.57,14.99-31.67,33.68-32.22,52.87.27-25.12,4.75-49.22,12.72-71.67,5.06,6.71,11.58,13.03,19.51,18.8Z",
  "M224.5,113.25v111.27c-66.13-2.32-144.87-17.54-190.24-55.62,45.37-38.11,124.1-53.34,190.24-55.65Z",
  "M21.98,267.53c43.88,45.33,130.74,66.88,202.52,68.25v111.23C101.61,447.02,2,347.4,2,224.52v-.79c.12,14.91,6.59,30.03,19.98,43.8Z",
  "M224.5,224.52c66.17,2.32,144.87,17.54,190.24,55.62-45.37,38.11-124.07,53.34-190.24,55.65v-111.27Z",
  "M447,226.52c-.2,25.39-4.67,49.77-12.76,72.41-5.06-6.71-11.58-13.03-19.51-18.8,20.8-15.15,31.99-34.19,32.26-53.61Z",
  "M427.06,181.46c-43.88-45.29-130.78-66.84-202.56-68.21V2.02c122.89,0,222.54,99.61,222.54,222.5v.75c-.12-14.91-6.59-30.03-19.98-43.8Z",
];

const WORDMARK = "STUDIO SIG".split("");

/** 인트로가 끝나는 시각 (ms). 재생하지 않으면 0. */
let introEndAt = 0;

/** 인트로가 걷히는 시점에 맞춰 시작해야 하는 애니메이션이 쓸 지연(초). 인트로가 없으면 0. */
export function getIntroDelay(): number {
  const remain = (introEndAt - Date.now()) / 1000;
  return remain > 0 ? Math.max(0, remain - 0.5) : 0;
}

function shouldPlay(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (pathname.startsWith("/admin")) return false;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
  } catch {
    /* 스토리지 접근 불가 환경 — 그냥 재생 */
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
  introEndAt = Date.now() + DURATION_MS;
  return true;
}

/**
 * 첫 방문 시 1회 재생되는 로고 인트로.
 * 심볼 패스 드로잉 → 채움 → 워드마크 리빌 → 커튼 업 순서로 약 2.7초.
 * 세션 내 재방문, /admin, prefers-reduced-motion 환경에서는 재생하지 않습니다.
 */
export function LogoIntro() {
  const { pathname } = useLocation();
  // 렌더 시점에 판단해야 같은 렌더 패스의 다른 컴포넌트가 getIntroDelay() 로 지연을 읽을 수 있음
  const [show, setShow] = useState(() => shouldPlay(pathname));

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), DURATION_MS);
    return () => clearTimeout(t);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="logo-intro"
          aria-hidden="true"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.85, ease: EASE } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "#0D0D0D",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(20px, 3vw, 32px)",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <motion.div
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(20px, 3vw, 32px)" }}
          >
            {/* 심볼: 스트로크 드로잉 → 채움 */}
            <motion.svg
              viewBox="0 0 449.03 449.03"
              initial={{ scale: 0.86, rotate: -18, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ width: "clamp(96px, 18vw, 180px)", height: "clamp(96px, 18vw, 180px)", overflow: "visible" }}
            >
              {PATHS.map((d, i) => (
                <motion.path
                  key={i}
                  d={d}
                  stroke="#FAFAFA"
                  strokeWidth={3}
                  strokeLinejoin="round"
                  fill="#FAFAFA"
                  initial={{ pathLength: 0, fillOpacity: 0, strokeOpacity: 1 }}
                  animate={{ pathLength: 1, fillOpacity: 1, strokeOpacity: 0 }}
                  transition={{
                    pathLength: { duration: 1.0, delay: 0.1 + i * 0.07, ease: "easeInOut" },
                    fillOpacity: { duration: 0.5, delay: 1.05 + i * 0.03 },
                    strokeOpacity: { duration: 0.4, delay: 1.5 },
                  }}
                />
              ))}
            </motion.svg>

            {/* 워드마크 리빌 */}
            <div style={{ overflow: "hidden", display: "flex", lineHeight: 1 }}>
              {WORDMARK.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.7, delay: 1.15 + i * 0.035, ease: EASE }}
                  style={{
                    display: "inline-block",
                    fontFamily: F,
                    fontWeight: 700,
                    fontSize: "clamp(26px, 5.5vw, 60px)",
                    letterSpacing: "-0.04em",
                    color: "#FAFAFA",
                    whiteSpace: "pre",
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            {/* 태그라인 */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7, ease: "easeOut" }}
              style={{
                fontFamily: F,
                fontSize: "clamp(10px, 1.1vw, 12px)",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "#6A6A6A",
                margin: 0,
              }}
            >
              Brand · Package · Production · Global
            </motion.p>
          </motion.div>

          {/* 진행 바 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: DURATION_MS / 1000 - 0.3, ease: "linear" }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "2px",
              backgroundColor: "#FAFAFA",
              transformOrigin: "left center",
              opacity: 0.6,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
