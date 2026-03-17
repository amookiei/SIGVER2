import { useState, useRef } from "react";
import { useHomeContent, defaultHomeContent } from "../context/HomeContentContext";
import type { HomeContent, HomeClient } from "../context/HomeContentContext";
import { supabase } from "../../lib/supabase";

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

// ─── Image upload + URL input ──────────────────────────────
function ImageField({
  label,
  value,
  onChange,
  uploadKey,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadKey: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.match(/jpeg|jpg/)) { setErr("JPG 파일만 업로드 가능합니다."); return; }
    if (!supabase) { setErr("Supabase 미연결 — URL 직접 입력"); return; }
    setUploading(true); setErr(null);
    const path = `home/${uploadKey}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file, { contentType: "image/jpeg", upsert: true });
    if (error) { setErr(`업로드 실패: ${error.message}`); setUploading(false); return; }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <Field label={label}>
      <input ref={inputRef} type="file" accept=".jpg,.jpeg" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ background: "none", border: BORDER2, color: uploading ? TEXT3 : TEXT2, fontFamily: F, fontSize: "11px", padding: "0 14px", cursor: uploading ? "default" : "pointer", letterSpacing: "0.06em", height: "38px", whiteSpace: "nowrap", flexShrink: 0 }}>
          {uploading ? "업로드 중…" : "JPG 업로드"}
        </button>
        <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="또는 URL 직접 입력" />
      </div>
      {err && <p style={{ fontFamily: F, fontSize: "11px", color: "#FF5555", marginTop: "4px" }}>{err}</p>}
      {value && (
        <img src={value} alt="" style={{ marginTop: "8px", height: "80px", width: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => (e.currentTarget.style.display = "none")} />
      )}
    </Field>
  );
}

// ─── Logo upload (PNG/JPG) ────────────────────────────────
function LogoField({
  label,
  value,
  onChange,
  uploadKey,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadKey: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.match(/png|jpeg|jpg|webp|svg/)) { setErr("PNG/JPG/SVG 파일만 업로드 가능합니다."); return; }
    if (!supabase) { setErr("Supabase 미연결 — URL 직접 입력"); return; }
    setUploading(true); setErr(null);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `clients/${uploadKey}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (error) { setErr(`업로드 실패: ${error.message}`); setUploading(false); return; }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <Field label={label}>
      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,.webp,.svg" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          style={{ background: "none", border: BORDER2, color: uploading ? TEXT3 : TEXT2, fontFamily: F, fontSize: "11px", padding: "0 14px", cursor: uploading ? "default" : "pointer", letterSpacing: "0.06em", height: "38px", whiteSpace: "nowrap", flexShrink: 0 }}>
          {uploading ? "업로드 중…" : "PNG 업로드"}
        </button>
        <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="또는 URL 직접 입력" />
        {value && (
          <img src={value} alt="" style={{ height: "36px", width: "60px", objectFit: "contain", background: "#fff", border: "1px solid #222", padding: "4px", flexShrink: 0 }}
            onError={(e) => (e.currentTarget.style.display = "none")} />
        )}
      </div>
      {err && <p style={{ fontFamily: F, fontSize: "11px", color: "#FF5555", marginTop: "4px" }}>{err}</p>}
    </Field>
  );
}

// ─── Single Client Editor ─────────────────────────────────
function ClientEditor({
  client,
  idx,
  onChange,
  onRemove,
}: {
  client: HomeClient;
  idx: number;
  onChange: (updated: HomeClient) => void;
  onRemove: () => void;
}) {
  return (
    <div style={{ background: "#0A0A0A", border: BORDER, padding: "16px 20px", marginBottom: "10px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0 16px", alignItems: "end" }}>
          <Field label="클라이언트명 (alt 텍스트)">
            <input style={inputStyle} value={client.name} onChange={(e) => onChange({ ...client, name: e.target.value })} placeholder="Google" />
          </Field>
          <LogoField label="로고 PNG/SVG" value={client.logoUrl} onChange={(url) => onChange({ ...client, logoUrl: url })} uploadKey={`client-${idx}`} />
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "18px", lineHeight: 1, paddingTop: "28px", flexShrink: 0 }}
        title="삭제"
      >
        ×
      </button>
    </div>
  );
}


// ─── Main AdminHome Component ──────────────────────────────
export function AdminHome() {
  const { content, saving, saveError, updateContent, resetContent } = useHomeContent();
  const [draft, setDraft] = useState<HomeContent>(() => JSON.parse(JSON.stringify(content)));
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSave() {
    await updateContent(draft);
    showToast("저장되었습니다 ✓");
  }

  async function handleReset() {
    if (!confirm("홈 콘텐츠를 기본값으로 초기화하시겠습니까?")) return;
    await resetContent();
    setDraft(JSON.parse(JSON.stringify(defaultHomeContent)));
    showToast("초기화되었습니다");
  }

  function setClient(idx: number, updated: HomeClient) {
    const clients = draft.clients.map((c, i) => (i === idx ? updated : c));
    setDraft({ ...draft, clients });
  }

  function addClient() {
    const id = `client-${Date.now()}`;
    setDraft({ ...draft, clients: [...draft.clients, { id, name: "", logoUrl: "" }] });
  }

  function removeClient(idx: number) {
    setDraft({ ...draft, clients: draft.clients.filter((_, i) => i !== idx) });
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: TEXT, letterSpacing: "0.08em", marginBottom: "4px" }}>
            홈 콘텐츠 편집
          </p>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            클라이언트 로고 및 About 섹션 내용을 수정합니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {toast && <span style={{ fontFamily: F, fontSize: "12px", color: "#4CAF50" }}>{toast}</span>}
          {saveError && <span style={{ fontFamily: F, fontSize: "11px", color: "#FF5555" }}>{saveError}</span>}
          <button onClick={handleReset}
            style={{ background: "none", border: BORDER2, color: TEXT3, fontFamily: F, fontSize: "12px", padding: "8px 16px", cursor: "pointer" }}>
            기본값 초기화
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ background: ACCENT, border: "none", color: "#0D0D0D", fontFamily: F, fontSize: "12px", fontWeight: 700, padding: "8px 22px", cursor: saving ? "default" : "pointer", letterSpacing: "0.05em" }}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* ── Section 0: Hero ─────────────────────────────── */}
      <div style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>히어로 섹션 이미지</p>
        <ImageField
          label="히어로 이미지 (1920 × 1080 권장) — 비워두면 기본 이미지 사용"
          value={draft.heroImage}
          onChange={(url) => setDraft({ ...draft, heroImage: url })}
          uploadKey="hero"
        />
      </div>

      {/* ── Section 1: Clients ──────────────────────────── */}
      <div style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: BORDER }}>
          <p style={{ ...sectionHead, margin: 0, border: "none", padding: 0 }}>클라이언트 로고 — 앞 6개가 메인 노출</p>
          <button
            onClick={addClient}
            style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            + 추가
          </button>
        </div>
        {draft.clients.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, textAlign: "center", padding: "24px 0" }}>
            아직 등록된 클라이언트가 없습니다. + 추가를 눌러 로고를 등록하세요.
          </p>
        )}
        {draft.clients.map((client, idx) => (
          <ClientEditor key={client.id} client={client} idx={idx} onChange={(updated) => setClient(idx, updated)} onRemove={() => removeClient(idx)} />
        ))}
      </div>

      {/* ── Section 2: About Preview ────────────────────── */}
      <div>
        <p style={sectionHead}>About 프리뷰 섹션</p>
        <ImageField
          label="About 이미지 (좌측 영역)"
          value={draft.aboutImage}
          onChange={(url) => setDraft({ ...draft, aboutImage: url })}
          uploadKey="about-preview"
        />
        <Field label="첫 번째 문장 (강조)">
          <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
            value={draft.aboutLine1}
            onChange={(e) => setDraft({ ...draft, aboutLine1: e.target.value })} />
        </Field>
        <Field label="두 번째 문장 (보조)">
          <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
            value={draft.aboutLine2}
            onChange={(e) => setDraft({ ...draft, aboutLine2: e.target.value })} />
        </Field>
      </div>
    </div>
  );
}
