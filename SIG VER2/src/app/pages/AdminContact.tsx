import { useState } from "react";
import { useContact, defaultContactContent } from "../context/ContactContext";
import type { ContactContent } from "../context/ContactContext";

// ─── Design tokens (Admin 스타일 동일) ────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const SURFACE = "#111111";
const BORDER = "1px solid #1F1F1F";
const BORDER2 = "1px solid #2A2A2A";
const TEXT = "#FAFAFA";
const TEXT2 = "#888888";
const TEXT3 = "#444444";
const ACCENT = "#FAFAFA";

const inputStyle: React.CSSProperties = {
  background: SURFACE,
  border: BORDER2,
  color: TEXT,
  fontFamily: F,
  fontSize: "13px",
  padding: "9px 12px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  color: TEXT3,
  fontFamily: F,
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "6px",
};
const sectionHead: React.CSSProperties = {
  fontFamily: F,
  fontWeight: 700,
  fontSize: "11px",
  color: TEXT2,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: BORDER,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export function AdminContact() {
  const { contact, saving, saveError, dbStatus, updateContact, resetContact } = useContact();
  const [draft, setDraft] = useState<ContactContent>(() => ({ ...contact }));
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSave() {
    await updateContact(draft);
    showToast("저장되었습니다 ✓");
  }

  async function handleReset() {
    if (!confirm("Contact 정보를 기본값으로 초기화하시겠습니까?")) return;
    await resetContact();
    setDraft({ ...defaultContactContent });
    showToast("초기화되었습니다");
  }

  function set(key: keyof ContactContent, value: string) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: TEXT, letterSpacing: "0.08em", marginBottom: "4px" }}>
            Contact 페이지 편집
          </p>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            이메일, 연락처, 주소, 운영시간 등 Contact 정보를 수정합니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {toast && <span style={{ fontFamily: F, fontSize: "12px", color: "#4CAF50" }}>{toast}</span>}
          {saveError && <span style={{ fontFamily: F, fontSize: "11px", color: "#FF5555" }}>{saveError}</span>}
          {dbStatus === "none" && (
            <span style={{ fontFamily: F, fontSize: "11px", color: "#CC4444" }}>⚠ Supabase 미연결</span>
          )}
          <button
            onClick={handleReset}
            style={{ background: "none", border: BORDER2, color: TEXT3, fontFamily: F, fontSize: "12px", padding: "8px 16px", cursor: "pointer" }}
          >
            기본값 초기화
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: ACCENT, border: "none", color: "#0D0D0D", fontFamily: F, fontSize: "12px", fontWeight: 700, padding: "8px 22px", cursor: saving ? "default" : "pointer", letterSpacing: "0.05em" }}
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* ── 섹션 1: 히어로 멘트 ─── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>히어로 멘트</p>
        <Field label="서브 타이틀 (상단 멘트)">
          <textarea
            style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
            value={draft.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="프로젝트 문의, 협업 제안, 견적 요청 모두 환영합니다."
          />
        </Field>
      </div>

      {/* ── 섹션 2: 연락처 정보 ─── */}
      <div>
        <p style={sectionHead}>연락처 정보</p>
        <Field label="이메일">
          <input
            style={inputStyle}
            type="email"
            value={draft.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="hello@sigstudio.kr"
          />
        </Field>
        <Field label="전화번호">
          <input
            style={inputStyle}
            type="tel"
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="010-0000-0000"
          />
        </Field>
        <Field label="주소 (줄바꿈: Enter)">
          <textarea
            style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
            value={draft.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder={"서울특별시 서대문구\n홍제천로 6길 40 1층"}
          />
        </Field>
        <Field label="운영 시간 (줄바꿈: Enter)">
          <textarea
            style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
            value={draft.hours}
            onChange={(e) => set("hours", e.target.value)}
            placeholder={"월 – 금 / 09:00 – 18:00\n주말 및 공휴일 휴무"}
          />
        </Field>

        {/* 미리보기 */}
        <div style={{ background: "#0A0A0A", border: BORDER, padding: "16px 20px", marginTop: "8px" }}>
          <p style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
            미리보기
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {[
              { label: "Email", value: draft.email },
              { label: "Phone", value: draft.phone },
              { label: "Address", value: draft.address },
              { label: "Hours", value: draft.hours },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontFamily: F, fontSize: "9px", color: TEXT3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: F, fontSize: "12px", color: TEXT2, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
