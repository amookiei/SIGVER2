import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle } from "lucide-react";

const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BORDER = "1px solid #E0E0E0";
const DARK = "#0D0D0D";
const BG = "#FAFAFA";
const TEXT2 = "#666666";
const TEXT3 = "#999999";

const services = [
  "브랜딩 & 아이덴티티",
  "웹 & 앱 디자인",
  "마케팅 캠페인",
  "정부지원 사업",
  "기타",
];

const budgets = [
  "~ 500만원",
  "500 ~ 1,000만원",
  "1,000 ~ 3,000만원",
  "3,000만원 ~",
  "미정",
];

export function Contact() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("https://formspree.io/f/xjgepgzn", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...form,
          services: selectedServices.join(", "),
          budget: selectedBudget,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError("문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Contact
          </motion.p>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(48px, 10vw, 130px)", color: DARK, letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 0px", textTransform: "uppercase" }}
            >
              GET IN
            </motion.h1>
          </div>
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.88, delay: 0.18, ease: [0.76, 0, 0.24, 1] }}
              style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(48px, 10vw, 130px)", color: "transparent", WebkitTextStroke: `1px ${DARK}`, letterSpacing: "-0.04em", lineHeight: 0.88, margin: "0 0 40px", textTransform: "uppercase" }}
            >
              TOUCH.
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ fontFamily: F, fontSize: "17px", color: TEXT2, lineHeight: 1.8, maxWidth: "480px" }}
          >
            프로젝트 문의, 협업 제안, 견적 요청 모두 환영합니다.
          </motion.p>
        </div>
      </div>

      {/* ── Contact Info Row ── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ borderBottom: BORDER }}
      >
        {[
          { label: "Email", value: "hello@sigstudio.kr" },
          { label: "Phone", value: "010-7667-6013" },
          { label: "Address", value: "서울특별시 서대문구\n홍제천로 6길 40 1층" },
          { label: "Hours", value: "월 – 금 / 09:00 – 18:00\n주말 및 공휴일 휴무" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            style={{ padding: "28px 32px", borderRight: i < 3 ? BORDER : "none" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08 }}
          >
            <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
              {item.label}
            </p>
            <p style={{ fontFamily: F, fontSize: "14px", color: TEXT2, lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {item.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Form Section ── */}
      <section>
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
            SEND A MESSAGE
          </motion.h2>
          <span style={{ fontFamily: F, fontSize: "clamp(28px, 4vw, 48px)", color: "#EEEEEE", fontWeight: 800, letterSpacing: "-0.04em" }}>
            ✱
          </span>
        </div>

        <div className="px-8 md:px-12 lg:px-16 py-16">
          <div className="max-w-[1200px] mx-auto">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle size={48} color="#FF4D00" className="mb-6" />
                  <h3
                    style={{ fontFamily: F, fontWeight: 800, fontSize: "28px", color: DARK, letterSpacing: "-0.02em", marginBottom: "12px", textTransform: "uppercase" }}
                  >
                    문의가 접수됐습니다!
                  </h3>
                  <p style={{ fontFamily: F, fontSize: "15px", color: TEXT2, lineHeight: 1.6 }}>
                    빠른 시일 내에 담당자가 연락드리겠습니다.
                    <br />
                    보통 1-2 영업일 이내에 회신합니다.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 lg:grid-cols-5 gap-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Left: selectors */}
                  <motion.div
                    className="lg:col-span-2 flex flex-col gap-10"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {/* Service */}
                    <div>
                      <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
                        관심 서비스
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {services.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleService(s)}
                            data-cursor="hover-button"
                            style={{
                              fontFamily: F,
                              fontSize: "12px",
                              fontWeight: 500,
                              color: selectedServices.includes(s) ? "#FFFFFF" : TEXT2,
                              padding: "7px 16px",
                              border: `1px solid ${selectedServices.includes(s) ? "#FF4D00" : "#DDDDDD"}`,
                              background: selectedServices.includes(s) ? "#FF4D00" : "transparent",
                              transition: "all 0.2s",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
                        예산
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {budgets.map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setSelectedBudget(b)}
                            data-cursor="hover-button"
                            style={{
                              fontFamily: F,
                              fontSize: "12px",
                              fontWeight: 500,
                              color: selectedBudget === b ? "#FFFFFF" : TEXT2,
                              padding: "7px 16px",
                              border: `1px solid ${selectedBudget === b ? "#FF4D00" : "#DDDDDD"}`,
                              background: selectedBudget === b ? "#FF4D00" : "transparent",
                              transition: "all 0.2s",
                            }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Right: input fields */}
                  <motion.div
                    className="lg:col-span-3 flex flex-col gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                  >
                    {/* Name + Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "name", label: "이름 *", placeholder: "홍길동" },
                        { key: "company", label: "회사명", placeholder: "SIG Company" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label
                            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
                          >
                            {field.label}
                          </label>
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            value={form[field.key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                            required={field.key === "name"}
                            style={{
                              fontFamily: F,
                              fontSize: "14px",
                              color: DARK,
                              backgroundColor: "#F7F7F7",
                              border: `1px solid #E8E8E8`,
                              padding: "12px 16px",
                              width: "100%",
                              outline: "none",
                              transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                            onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Email + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: "email", label: "이메일 *", placeholder: "hello@company.com", type: "email" },
                        { key: "phone", label: "연락처", placeholder: "010-0000-0000", type: "tel" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label
                            style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
                          >
                            {field.label}
                          </label>
                          <input
                            type={field.type}
                            placeholder={field.placeholder}
                            value={form[field.key as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                            required={field.key === "email"}
                            style={{
                              fontFamily: F,
                              fontSize: "14px",
                              color: DARK,
                              backgroundColor: "#F7F7F7",
                              border: `1px solid #E8E8E8`,
                              padding: "12px 16px",
                              width: "100%",
                              outline: "none",
                              transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                            onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Message */}
                    <div>
                      <label
                        style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}
                      >
                        프로젝트 내용
                      </label>
                      <textarea
                        placeholder="프로젝트에 대해 간단히 소개해주세요. 목표, 일정, 참고 자료 등 자유롭게 작성해주세요."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        rows={5}
                        style={{
                          fontFamily: F,
                          fontSize: "14px",
                          color: DARK,
                          backgroundColor: "#F7F7F7",
                          border: `1px solid #E8E8E8`,
                          padding: "12px 16px",
                          width: "100%",
                          outline: "none",
                          resize: "vertical",
                          lineHeight: 1.6,
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                        onBlur={(e) => (e.target.style.borderColor = "#E8E8E8")}
                      />
                    </div>

                    {error && (
                      <p style={{ fontFamily: F, fontSize: "13px", color: "#FF4D00", marginTop: "-8px" }}>
                        {error}
                      </p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-3 mt-2"
                      data-cursor="hover-button"
                      style={{
                        fontFamily: F,
                        fontWeight: 700,
                        fontSize: "12px",
                        color: "#FFFFFF",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        padding: "18px 36px",
                        background: isSubmitting ? "#BBBBBB" : DARK,
                        border: `1px solid ${isSubmitting ? "#BBBBBB" : DARK}`,
                        width: "100%",
                        cursor: isSubmitting ? "not-allowed" : "none",
                        transition: "all 0.25s",
                      }}
                      whileHover={isSubmitting ? {} : { background: "rgba(13,13,13,0)", color: DARK }}
                      transition={{ duration: 0.25 }}
                    >
                      {isSubmitting ? "전송 중..." : "문의 보내기"}
                      {!isSubmitting && <ArrowRight size={14} />}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
