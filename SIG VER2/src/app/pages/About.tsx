import { Link } from "react-router";
import { motion } from "motion/react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

const team = [
  { name: "김지훈", role: "Creative Director", desc: "10년 경력의 브랜드 디자이너. 삼성, 현대 등 대형 클라이언트와 협업.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500" },
  { name: "박서연", role: "UX Lead", desc: "사용자 중심 디자인의 전문가. 복잡한 서비스를 단순하게 만드는 것이 특기.", image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500" },
  { name: "이민우", role: "Motion Designer", desc: "인터랙션과 모션 디자인 전문. GSAP, After Effects 고수.", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500" },
];

const values = [
  { num: "01", title: "본질에 집중", desc: "우리는 비주얼만 만드는 게 아닙니다. 브랜드의 본질을 깊이 이해하고 그것을 가장 직관적인 방식으로 표현합니다." },
  { num: "02", title: "경험을 설계", desc: "모든 터치포인트가 하나의 경험으로 연결되도록 설계합니다. 로고부터 디지털 프로덕트까지 일관된 브랜드 세계를 구축합니다." },
  { num: "03", title: "함께 성장", desc: "클라이언트와의 파트너십을 중시합니다. 단순한 용역이 아닌, 장기적인 브랜드 성장을 함께 만들어 갑니다." },
];

const stats = [
  { num: "8+", label: "Years" },
  { num: "120+", label: "Projects" },
  { num: "60+", label: "Clients" },
  { num: "4", label: "Awards" },
];

export function About() {
  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{ borderBottom: BORDER, paddingTop: "72px" }}>
        <div className="px-8 md:px-12 lg:px-16 pt-16 pb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}
          >
            About Us
          </motion.p>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(48px, 10vw, 130px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 0px", textTransform: "uppercase" }}
            >
              WE MAKE
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.18, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(48px, 10vw, 130px)", color: "transparent", WebkitTextStroke: `1px ${DARK}`, letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 40px", textTransform: "uppercase" }}
            >
              BRANDS MOVE.
            </motion.h1>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <p style={{ fontFamily: F, fontSize: "17px", color: TEXT2, lineHeight: 1.8 }}>
              SIG Studio는 2024년 서울에서 시작된 디자인 에이전시입니다. 브랜드 아이덴티티, 디지털 경험, 마케팅 캠페인까지 브랜드가 살아 숨쉬는 순간을 만들어냅니다.
            </p>
            <p style={{ fontFamily: F, fontSize: "17px", color: TEXT3, lineHeight: 1.8 }}>
              정부지원사업부터 대기업 리브랜딩까지 다양한 클라이언트와 협업하며, 문제를 해결하는 디자인을 만들어냅니다.
            </p>
          </motion.div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderTop: BORDER }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              style={{ padding: "28px 32px", borderRight: i < stats.length - 1 ? BORDER : "none" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <p style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(28px, 4vw, 52px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: "6px" }}>
                {stat.num}
              </p>
              <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Values ── */}
      <section style={{ borderBottom: BORDER }}>
        <div
          className="px-8 md:px-12 lg:px-16 py-10 flex items-center justify-between"
          style={{ borderBottom: BORDER }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(22px, 3vw, 36px)", color: DARK, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
          >
            OUR VALUES
          </motion.h2>
          <span style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", color: "#EEEEEE", fontWeight: 800, letterSpacing: "-0.04em" }}>03</span>
        </div>

        {values.map((v, i) => (
          <motion.div
            key={v.num}
            className="px-8 md:px-12 lg:px-16 py-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-start"
            style={{ borderBottom: BORDER }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.55, delay: i * 0.08 }}
          >
            <div className="flex items-start gap-6">
              <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", paddingTop: "4px" }}>{v.num}</span>
              <span style={{ fontFamily: F, fontWeight: 700, fontSize: "clamp(18px, 2.5vw, 26px)", color: DARK, letterSpacing: "-0.01em" }}>
                {v.title}
              </span>
            </div>
            <p className="md:col-span-3" style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.75 }}>
              {v.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* ── Team ── */}
      <section style={{ borderBottom: BORDER, backgroundColor: DARK }}>
        <div
          className="px-8 md:px-12 lg:px-16 py-10 flex items-center justify-between"
          style={{ borderBottom: "1px solid #1F1F1F" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(22px, 3vw, 36px)", color: "#FAFAFA", letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}
          >
            THE TEAM
          </motion.h2>
          <span
            style={{
              fontFamily: F, fontSize: "22px", color: "#333333", lineHeight: 1,
              animationName: "sigSpin", animationDuration: "12s",
              animationTimingFunction: "linear", animationIterationCount: "infinite", display: "block",
            }}
          >
            ✱
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              style={{ borderRight: i < team.length - 1 ? "1px solid #1F1F1F" : "none", padding: "0" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div style={{ overflow: "hidden", aspectRatio: "3/4", backgroundColor: "#141414" }}>
                <motion.img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  style={{ filter: "grayscale(1)", opacity: 0.85 }}
                  whileHover={{ scale: 1.04, filter: "grayscale(0)", opacity: 1 }}
                  transition={{ duration: 0.55 }}
                />
              </div>
              <div style={{ padding: "24px 28px", borderTop: "1px solid #1F1F1F" }}>
                <p style={{ fontFamily: F, fontWeight: 700, fontSize: "17px", color: "#FAFAFA", letterSpacing: "-0.01em", marginBottom: "4px" }}>
                  {member.name}
                </p>
                <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                  {member.role}
                </p>
                <p style={{ fontFamily: F, fontSize: "13px", color: "#555555", lineHeight: 1.6 }}>
                  {member.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderBottom: BORDER }}>
        <div className="px-8 md:px-12 lg:px-16 py-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(36px, 7vw, 88px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.92, textTransform: "uppercase", margin: 0 }}
          >
            함께 만들어갈<br />준비가 됐나요?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <Link to="/contact" data-cursor="hover-button">
              <motion.button
                style={{ fontFamily: F, fontWeight: 700, fontSize: "12px", color: "#FAFAFA", letterSpacing: "0.1em", textTransform: "uppercase", padding: "16px 36px", background: DARK, border: `1px solid ${DARK}` }}
                whileHover={{ background: "rgba(13,13,13,0)", color: DARK }}
                transition={{ duration: 0.25 }}
              >
                CONTACT US →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}