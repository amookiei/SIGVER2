import { Link } from "react-router";
import { motion } from "motion/react";
import { useSEO } from "../hooks/useSEO";
import { DielineArt } from "../components/DielineArt";
import { LogoSymbol } from "../components/LogoSymbol";
import { sigingFeatures, sigingGravureTools, sigingWorkspaces, sigingRoadmap, processSteps, SIGING_URL } from "../data/capabilities";
import sigingMark from "../../assets/images/siging-mark.svg";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT2 = "#666666";
const TEXT3 = "#999999";
const EASE = [0.76, 0, 0.24, 1] as const;
const SIGING_GRAD = "linear-gradient(135deg, #f78f4e 0%, #ef4c90 50%, #7a59a6 100%)";

const STATS = [
  { num: "11", label: "봉지·박스·병 3D 모델" },
  { num: "4단계", label: "봉지 → 박스 → 팔레트 → 트럭 적재" },
  { num: "10", label: "그라비아 프리프레스·감리 도구" },
  { num: "₩0", label: "기본 기능 무료 · 크레딧 충전제" },
];

function ExtButton({ href, children, dark }: { href: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="hover-button">
      <motion.span
        style={{
          display: "inline-block",
          fontFamily: F,
          fontWeight: 700,
          fontSize: "12px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "16px 32px",
          color: dark ? DARK : BG,
          background: dark ? BG : DARK,
          border: `1px solid ${dark ? BG : DARK}`,
        }}
        whileHover={{ background: dark ? "rgba(250,250,250,0)" : "rgba(13,13,13,0)", color: dark ? BG : DARK }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.span>
    </a>
  );
}

export function Siging() {
  useSEO({
    title: "Siging | 패키지 칼선·3D 목업·그라비아 감리 툴 — 스튜디오 시그 Studio SIG",
    description:
      "siging(사이징)은 시그코퍼레이션이 만든 웹 패키지 스튜디오입니다. 봉지·박스·병 11종 3D 목업과 칼선 자동 생성, 팔레트·트럭 적재 시뮬레이션, 중국 수출 표기 검수(GB 7718·28050), 그라비아 인쇄 감리 도구 10종을 제공합니다. 기본 기능 무료.",
    canonical: "https://www.studiosig.com/siging",
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "@id": "https://siging.kr/#app",
          name: "siging",
          alternateName: ["사이징", "siging 패키지 스튜디오"],
          url: SIGING_URL,
          applicationCategory: "DesignApplication",
          operatingSystem: "Web",
          description:
            "규격 입력만으로 패키지 칼선과 3D 목업을 자동 생성하고, 그라비아 인쇄 감리(색판 플래너·핀트 시뮬레이터·측색 ΔE)까지 지원하는 웹 기반 패키지 스튜디오.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "KRW", description: "기본 기능 무료, 고품질 렌더·AI 매칭은 크레딧 충전제" },
          creator: { "@id": "https://www.studiosig.com/#organization" },
          featureList: sigingFeatures.map((f) => f.title),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "홈", item: "https://www.studiosig.com/" },
            { "@type": "ListItem", position: 2, name: "Siging", item: "https://www.studiosig.com/siging" },
          ],
        },
      ],
    },
  });

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>
      {/* ── Hero ── */}
      <div style={{ borderBottom: BORDER, paddingTop: "72px" }}>
        <div className="px-8 md:px-16 lg:px-28 pt-16 pb-14 grid grid-cols-1 lg:grid-cols-5 gap-12 items-end">
          <div className="lg:col-span-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
              style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}
            >
              <img src={sigingMark} alt="" width={18} height={18} style={{ display: "block" }} />
              Product · siging.kr
            </motion.p>
            <div style={{ overflow: "hidden" }}>
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.88, delay: 0.1, ease: EASE }}
                style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(48px, 10vw, 130px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.88, margin: 0, textTransform: "uppercase" }}
              >
                SIGING
              </motion.h1>
            </div>
            <div style={{ overflow: "hidden" }}>
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.88, delay: 0.18, ease: EASE }}
                style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(48px, 10vw, 130px)", color: "transparent", WebkitTextStroke: `1px ${DARK}`, letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 40px", textTransform: "uppercase" }}
              >
                PACKAGE STUDIO.
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              style={{ fontFamily: F, fontSize: "17px", color: TEXT2, lineHeight: 1.8, maxWidth: "560px" }}
            >
              규격을 넣으면 칼선과 3D 목업이 바로 만들어집니다.
              <br />
              식품·생활용품 패키지 담당자를 위한 웹 스튜디오.
              <br />
              샘플 전에 검증하고, 적재 계획과 인쇄 감리까지 한 곳에서.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-3 mt-10"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <ExtButton href={`${SIGING_URL}/register`}>무료로 시작하기 ↗</ExtButton>
              <ExtButton href={`${SIGING_URL}/pricing`} dark>요금제 보기 ↗</ExtButton>
            </motion.div>
          </div>
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ maxWidth: "420px", width: "100%", justifySelf: "end" }}
          >
            <DielineArt />
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="px-8 md:px-16 lg:px-28" style={{ borderTop: BORDER }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className={["py-9 pr-8", i % 2 === 0 ? "pl-0 border-r border-[#E0E0E0]" : "pl-8", i === 0 ? "md:pl-0" : "md:pl-10", i < 3 ? "md:border-r md:border-[#E0E0E0]" : "md:border-r-0"].join(" ")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
              >
                <p style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(28px, 4vw, 52px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "8px" }}>{stat.num}</p>
                <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why we built it ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(30px, 4.5vw, 56px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 1.05, margin: 0 }}
          >
            설계가 생산을 알아야,<br />감리가 됩니다.
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="flex flex-col gap-6"
          >
            <p style={{ fontFamily: F, fontSize: "16px", color: TEXT2, lineHeight: 1.85, margin: 0 }}>
              패키지가 어긋나는 지점은 시안이 아니라 그 다음입니다.
              칼선이 봉지 규격과 안 맞거나, 색이 동판을 거치며 달라지거나, 라미 후에 변하는 일들입니다.
            </p>
            <p style={{ fontFamily: F, fontSize: "16px", color: TEXT2, lineHeight: 1.85, margin: 0 }}>
              siging은 이 문제를 프로젝트마다 겪으며 만든 도구입니다. 사내 그라비아 인쇄 명시지의 판단 기준을 그대로 코드로 옮겼습니다.
              설계에서 색판을 계획하고, 제판 전에 핀트와 라미 변화를 시뮬레이션하고, 현장에서 측색값으로 판정합니다.
              클라이언트와 제조 파트너가 같은 화면을 보며 결정하는 것이 목표입니다.
            </p>
            <Link to="/about" data-cursor="hover-link" style={{ fontFamily: F, fontSize: "13px", color: DARK, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "underline", textUnderlineOffset: "4px" }}>
              시그가 일하는 방식 →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Workspaces ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-10 flex items-center justify-between" style={{ borderBottom: BORDER }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
          >
            Three workspaces
          </motion.h2>
          <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.1em" }}>({String(sigingWorkspaces.length).padStart(2, "0")})</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {sigingWorkspaces.map((w, i) => (
            <motion.div
              key={w.num}
              className="px-8 md:px-10 py-12"
              style={{ borderRight: i < sigingWorkspaces.length - 1 ? BORDER : "none", borderBottom: BORDER }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", marginBottom: "20px" }}>{w.num}</p>
              <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(22px, 2.2vw, 28px)", color: DARK, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 14px" }}>{w.name}</h3>
              <p style={{ fontFamily: F, fontSize: "14.5px", color: TEXT2, lineHeight: 1.7, margin: "0 0 24px", whiteSpace: "pre-line" }}>{w.summary}</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: BORDER }}>
                {w.details.map((d) => (
                  <li key={d} style={{ fontFamily: F, fontSize: "13px", color: TEXT2, lineHeight: 1.6, padding: "10px 0", borderBottom: BORDER, display: "flex", gap: "10px" }}>
                    <span style={{ color: "#CCC", flexShrink: 0 }}>—</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-10 flex items-center justify-between" style={{ borderBottom: BORDER }}>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
          >
            What it does
          </motion.h2>
          <span style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.1em" }}>({String(sigingFeatures.length).padStart(2, "0")})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sigingFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              className="px-8 md:px-10 py-10"
              style={{
                borderBottom: BORDER,
                borderRight: BORDER,
                minHeight: "240px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: BG,
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              whileHover={{ backgroundColor: "#F2F2F2" }}
            >
              <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em" }}>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "18px", color: DARK, letterSpacing: "-0.02em", lineHeight: 1.35, margin: "0 0 10px" }}>{f.title}</h3>
                <p style={{ fontFamily: F, fontSize: "14px", color: TEXT2, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Gravure tools ── */}
      <section style={{ backgroundColor: DARK }}>
        <div className="px-8 md:px-16 lg:px-28 py-20 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <p style={{ fontFamily: F, fontSize: "11px", color: "#666", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Gravure Prepress</p>
              <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(26px, 3.6vw, 44px)", color: BG, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
                그라비아<br />프리프레스·감리
              </h2>
            </div>
            <p className="md:col-span-2" style={{ fontFamily: F, fontSize: "15px", color: "#9A9A9A", lineHeight: 1.8, margin: 0, maxWidth: "620px" }}>
              OPP 연포장 디자이너와 감리자를 위한 설계·검증·감리 도구 모음. 그라비아 인쇄 명시지의 판단 기준을 코드화해, 제판 전에
              문제를 잡고 현장에서는 숫자로 판정합니다. 모바일 감리 모드로 현장 측색값이 데스크톱과 자동 동기화됩니다.
            </p>
          </div>
          <div style={{ borderTop: "1px solid #262626" }}>
            {sigingGravureTools.map((t, i) => (
              <motion.div
                key={t.name}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-6"
                style={{ borderBottom: "1px solid #262626" }}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                whileHover={{ x: 6 }}
              >
                <span className="md:col-span-1" style={{ fontFamily: F, fontSize: "11px", color: "#555", letterSpacing: "0.12em" }}>{String(i + 1).padStart(2, "0")}</span>
                <span className="md:col-span-4" style={{ fontFamily: F, fontWeight: 700, fontSize: "18px", color: BG, letterSpacing: "-0.01em" }}>{t.name}</span>
                <span className="md:col-span-7" style={{ fontFamily: F, fontSize: "14px", color: "#8A8A8A", lineHeight: 1.7 }}>{t.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section style={{ borderBottom: BORDER, backgroundColor: "#F5F3EF" }}>
        <div className="px-8 md:px-16 lg:px-28 py-16 md:py-20">
          <div className="flex items-end justify-between gap-6" style={{ marginBottom: "36px" }}>
            <div>
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>Roadmap</p>
              <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(24px, 3.4vw, 40px)", color: DARK, letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0 }}>
                다음에 만들고 있는 것
              </h2>
            </div>
            <span className="hidden md:block" style={{ fontFamily: F, fontSize: "12px", color: TEXT3, letterSpacing: "0.06em" }}>2026 Q4 →</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {sigingRoadmap.map((r, i) => (
              <motion.div
                key={r.title}
                className="py-6 flex gap-5"
                style={{ borderTop: "1px solid #D8D5CF" }}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
              >
                <span
                  style={{
                    fontFamily: F,
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    padding: "4px 8px",
                    height: "fit-content",
                    flexShrink: 0,
                    color: r.status === "진행 중" ? BG : TEXT2,
                    background: r.status === "진행 중" ? DARK : "transparent",
                    border: `1px solid ${r.status === "진행 중" ? DARK : "#C9C5BD"}`,
                  }}
                >
                  {r.status}
                </span>
                <div>
                  <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "17px", color: DARK, letterSpacing: "-0.02em", margin: "0 0 6px" }}>{r.title}</h3>
                  <p style={{ fontFamily: F, fontSize: "13.5px", color: TEXT2, lineHeight: 1.7, margin: 0 }}>{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where it sits in our process ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-10 flex items-center justify-between" style={{ borderBottom: BORDER }}>
          <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(20px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}>
            In our workflow
          </h2>
          <LogoSymbol style={{ color: "#EEEEEE", width: "clamp(28px, 4vw, 48px)", height: "clamp(28px, 4vw, 48px)" }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {processSteps.map((s, i) => (
            <motion.div
              key={s.num}
              className="px-8 md:px-8 py-10"
              style={{ borderRight: i < processSteps.length - 1 ? BORDER : "none", borderBottom: BORDER }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", marginBottom: "18px" }}>{s.num}</p>
              <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: "20px", color: DARK, letterSpacing: "-0.02em", margin: "0 0 10px" }}>{s.title}</h3>
              <p style={{ fontFamily: F, fontSize: "13.5px", color: TEXT2, lineHeight: 1.7, margin: "0 0 16px" }}>{s.desc}</p>
              {s.tool ? (
                <span style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: BG, background: SIGING_GRAD, padding: "5px 9px", display: "inline-block" }}>
                  {s.tool}
                </span>
              ) : (
                <span style={{ fontFamily: F, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: TEXT3, border: BORDER, padding: "4px 9px", display: "inline-block" }}>
                  파트너 협업
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-16 lg:px-28 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "14px" }}>Pricing</p>
            <h2 style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(28px, 4vw, 48px)", color: DARK, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 16px" }}>
              기본 기능은 무료,<br />월 구독 없이 크레딧 충전제.
            </h2>
            <p style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.8, margin: 0, maxWidth: "480px" }}>
              3D 시뮬레이터 · 칼선 · 검수 · 그라비아 도구는 계정만 있으면 무료입니다. 고품질 렌더와 검수 AI 매칭에만 크레딧을 씁니다.
              프로젝트 단위로 감리·생산까지 맡기고 싶다면 시그에 바로 문의하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <ExtButton href={`${SIGING_URL}/register`}>siging 시작하기 ↗</ExtButton>
            <Link to="/contact" data-cursor="hover-button">
              <motion.span
                style={{ display: "inline-block", fontFamily: F, fontWeight: 700, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 32px", color: DARK, background: "transparent", border: `1px solid ${DARK}` }}
                whileHover={{ background: DARK, color: BG }}
                transition={{ duration: 0.25 }}
              >
                프로젝트 문의
              </motion.span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
