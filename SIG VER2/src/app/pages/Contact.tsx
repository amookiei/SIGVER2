import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, CheckCircle } from "lucide-react";

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
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", message: "" });

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      {/* Hero */}
      <div className="px-8 md:px-12 lg:px-16 pt-40 pb-16">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: "11px",
                color: "#555555",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Contact
            </p>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(48px, 10vw, 120px)",
                color: "#000000",
                letterSpacing: "-0.04em",
                lineHeight: 0.9,
                margin: "0 0 24px",
              }}
            >
              GET IN TOUCH
            </h1>
            <p
              style={{
                fontFamily: "'Satoshi', sans-serif",
                fontSize: "16px",
                color: "#777777",
              }}
            >
              프로젝트 문의, 협업 제안, 견적 요청 모두 환영합니다.
            </p>
          </motion.div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1A1A1A" }} />

      <div className="px-8 md:px-12 lg:px-16 py-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left: Contact Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col gap-10">
              <div>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "11px",
                    color: "#444444",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Email
                </p>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "16px",
                    color: "#CCCCCC",
                  }}
                >
                  hello@sigstudio.kr
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "11px",
                    color: "#444444",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Phone
                </p>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "16px",
                    color: "#CCCCCC",
                  }}
                >
                  +82 02-0000-0000
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "11px",
                    color: "#444444",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Address
                </p>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "16px",
                    color: "#CCCCCC",
                    lineHeight: 1.6,
                  }}
                >
                  서울특별시 성동구
                  <br />
                  성수이로 7길 000
                  <br />
                  SIG 빌딩 4F
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "11px",
                    color: "#444444",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  Hours
                </p>
                <p
                  style={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontSize: "15px",
                    color: "#777777",
                    lineHeight: 1.6,
                  }}
                >
                  월 – 금 / 09:00 – 18:00
                  <br />
                  주말 및 공휴일 휴무
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle size={48} color="#FF4D00" className="mb-6" />
                  <h3
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "28px",
                      color: "#000000",
                      letterSpacing: "-0.02em",
                      marginBottom: "12px",
                    }}
                  >
                    문의가 접수됐습니다!
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      fontSize: "15px",
                      color: "#777777",
                      lineHeight: 1.6,
                    }}
                  >
                    빠른 시일 내에 담당자가 연락드리겠습니다.
                    <br />
                    보통 1-2 영업일 이내에 회신합니다.
                  </p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Service Selection */}
                  <div>
                    <label
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "11px",
                        color: "#444444",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      관심 서비스
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          data-cursor="hover-button"
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "13px",
                            color: selectedServices.includes(s) ? "#FFFFFF" : "#555555",
                            padding: "7px 16px",
                            border: "1px solid",
                            borderColor: selectedServices.includes(s) ? "#FF4D00" : "#222222",
                            background: selectedServices.includes(s) ? "#FF4D00" : "transparent",
                            borderRadius: "2px",
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
                    <label
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "11px",
                        color: "#444444",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "12px",
                      }}
                    >
                      예산
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {budgets.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBudget(b)}
                          data-cursor="hover-button"
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "13px",
                            color: selectedBudget === b ? "#FFFFFF" : "#555555",
                            padding: "7px 16px",
                            border: "1px solid",
                            borderColor: selectedBudget === b ? "#FF4D00" : "#222222",
                            background: selectedBudget === b ? "#FF4D00" : "transparent",
                            borderRadius: "2px",
                            transition: "all 0.2s",
                          }}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name + Company */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: "name", label: "이름 *", placeholder: "홍길동" },
                      { key: "company", label: "회사명", placeholder: "SIG Company" },
                    ].map((field) => (
                      <div key={field.key}>
                        <label
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "11px",
                            color: "#444444",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type="text"
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) =>
                            setForm({ ...form, [field.key]: e.target.value })
                          }
                          required={field.key === "name"}
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "14px",
                            color: "#FFFFFF",
                            backgroundColor: "#141414",
                            border: "1px solid #222222",
                            borderRadius: "2px",
                            padding: "12px 16px",
                            width: "100%",
                            outline: "none",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                          onBlur={(e) => (e.target.style.borderColor = "#222222")}
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
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "11px",
                            color: "#444444",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) =>
                            setForm({ ...form, [field.key]: e.target.value })
                          }
                          required={field.key === "email"}
                          style={{
                            fontFamily: "'Satoshi', sans-serif",
                            fontSize: "14px",
                            color: "#FFFFFF",
                            backgroundColor: "#141414",
                            border: "1px solid #222222",
                            borderRadius: "2px",
                            padding: "12px 16px",
                            width: "100%",
                            outline: "none",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                          onBlur={(e) => (e.target.style.borderColor = "#222222")}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "11px",
                        color: "#444444",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      프로젝트 내용
                    </label>
                    <textarea
                      placeholder="프로젝트에 대해 간단히 소개해주세요. 목표, 일정, 참고 자료 등 자유롭게 작성해주세요."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      style={{
                        fontFamily: "'Satoshi', sans-serif",
                        fontSize: "14px",
                        color: "#FFFFFF",
                        backgroundColor: "#141414",
                        border: "1px solid #222222",
                        borderRadius: "2px",
                        padding: "12px 16px",
                        width: "100%",
                        outline: "none",
                        resize: "vertical",
                        lineHeight: 1.6,
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#FF4D00")}
                      onBlur={(e) => (e.target.style.borderColor = "#222222")}
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    className="flex items-center justify-center gap-3 mt-2"
                    data-cursor="hover-button"
                    style={{
                      fontFamily: "'Satoshi', sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#FFFFFF",
                      letterSpacing: "0.05em",
                      padding: "16px 32px",
                      background: "#FF4D00",
                      border: "none",
                      borderRadius: "2px",
                      width: "100%",
                    }}
                    whileHover={{ backgroundColor: "#FF6B2B" }}
                    transition={{ duration: 0.2 }}
                  >
                    문의 보내기
                    <ArrowRight size={16} />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}