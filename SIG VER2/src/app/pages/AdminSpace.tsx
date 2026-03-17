import { useState, useRef } from "react";
import { useSpace, defaultSpaceContent } from "../context/SpaceContext";
import type { SpaceContent, SpaceSpec } from "../context/SpaceContext";
import { supabase } from "../../lib/supabase";

// ─── Design tokens ────────────────────────────────────────
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

const sectionHead: React.CSSProperties = {
  fontFamily: F, fontWeight: 700, fontSize: "11px", color: TEXT2,
  letterSpacing: "0.14em", textTransform: "uppercase",
  marginBottom: "20px", paddingBottom: "12px", borderBottom: BORDER,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", color: TEXT3, fontFamily: F, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Image upload (JPG/PNG/WebP) ─────────────────────────
function ImageField({
  label,
  value,
  onChange,
  uploadPath,
  accept = ".jpg,.jpeg,.png,.webp",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadPath: string;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!supabase) { setErr("Supabase 미연결 — URL 직접 입력"); return; }
    setUploading(true); setErr(null);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${uploadPath}-${Date.now()}.${ext}`;
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
      <input ref={ref} type="file" accept={accept} style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={() => ref.current?.click()} disabled={uploading}
          style={{ background: "none", border: BORDER2, color: uploading ? TEXT3 : TEXT2, fontFamily: F, fontSize: "11px", padding: "0 14px", cursor: uploading ? "default" : "pointer", height: "38px", whiteSpace: "nowrap", flexShrink: 0, letterSpacing: "0.06em" }}>
          {uploading ? "업로드 중…" : "이미지 업로드"}
        </button>
        <input style={{ ...inputStyle, flex: 1 }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="또는 URL 직접 입력" />
      </div>
      {err && <p style={{ fontFamily: F, fontSize: "11px", color: "#FF5555", marginTop: "4px" }}>{err}</p>}
      {value && (
        <div style={{ marginTop: "8px", position: "relative", display: "inline-block" }}>
          <img src={value} alt="" style={{ height: "90px", maxWidth: "100%", objectFit: "cover", display: "block", background: "#0A0A0A" }}
            onError={(e) => (e.currentTarget.style.display = "none")} />
          <button onClick={() => onChange("")}
            style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer", color: "#FAFAFA", fontFamily: F, fontSize: "13px", width: "20px", height: "20px", lineHeight: 1 }}>
            ×
          </button>
        </div>
      )}
    </Field>
  );
}

// ─── Specs editor ─────────────────────────────────────────
function SpecsEditor({ specs, onChange }: { specs: SpaceSpec[]; onChange: (s: SpaceSpec[]) => void }) {
  function set(idx: number, key: keyof SpaceSpec, val: string) {
    onChange(specs.map((s, i) => i === idx ? { ...s, [key]: val } : s));
  }
  function add() {
    onChange([...specs, { id: `s-${Date.now()}`, label: "", value: "" }]);
  }
  function remove(idx: number) {
    onChange(specs.filter((_, i) => i !== idx));
  }

  return (
    <div>
      {specs.map((spec, i) => (
        <div key={spec.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
          <input style={inputStyle} value={spec.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="항목 (예: 규모)" />
          <input style={inputStyle} value={spec.value} onChange={(e) => set(i, "value", e.target.value)} placeholder="값 (예: 200평)" />
          <button onClick={() => remove(i)}
            style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "16px", lineHeight: 1 }}>
            ×
          </button>
        </div>
      ))}
      <button onClick={add}
        style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}>
        + 항목 추가
      </button>
    </div>
  );
}

// ─── Capabilities editor ─────────────────────────────────
function CapabilitiesEditor({ items, onChange }: { items: string[]; onChange: (v: string[]) => void }) {
  function set(idx: number, val: string) {
    onChange(items.map((s, i) => i === idx ? val : s));
  }
  function remove(idx: number) { onChange(items.filter((_, i) => i !== idx)); }
  function add() { onChange([...items, ""]); }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: "8px", marginBottom: "8px" }}>
          <input style={inputStyle} value={item} onChange={(e) => set(i, e.target.value)} placeholder="예: 씨즐 촬영" />
          <button onClick={() => remove(i)}
            style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "16px", lineHeight: 1 }}>
            ×
          </button>
        </div>
      ))}
      <button onClick={add}
        style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}>
        + 항목 추가
      </button>
    </div>
  );
}

// ─── 4-Photo slots ────────────────────────────────────────
function PhotoSlotsEditor({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (p: string[]) => void;
}) {
  const filled = [...photos, "", "", "", ""].slice(0, 4) as [string, string, string, string];

  function setPhoto(idx: number, url: string) {
    const next = [...filled] as string[];
    next[idx] = url;
    // trim trailing empty strings
    while (next.length > 0 && !next[next.length - 1]) next.pop();
    onChange(next);
  }

  const labels = ["사진 1 (대형 좌)", "사진 2 (상단 우)", "사진 3 (하단 중)", "사진 4 (하단 우)"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {filled.map((url, i) => (
        <ImageField
          key={i}
          label={labels[i]}
          value={url}
          onChange={(u) => setPhoto(i, u)}
          uploadPath={`space/photo-${i + 1}`}
        />
      ))}
    </div>
  );
}

// ─── Main AdminSpace ──────────────────────────────────────
export function AdminSpace() {
  const { content, saving, saveError, updateContent, resetContent } = useSpace();
  const [draft, setDraft] = useState<SpaceContent>(() => JSON.parse(JSON.stringify(content)));
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  async function handleSave() {
    await updateContent(draft);
    showToast("저장되었습니다 ✓");
  }

  async function handleReset() {
    if (!confirm("스페이스 콘텐츠를 기본값으로 초기화하시겠습니까?")) return;
    await resetContent();
    setDraft(JSON.parse(JSON.stringify(defaultSpaceContent)));
    showToast("초기화되었습니다");
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: TEXT, letterSpacing: "0.08em", marginBottom: "4px" }}>
            스페이스 페이지 편집
          </p>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            스튜디오 소개 페이지의 콘텐츠를 관리합니다.
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

      {/* ── Hero 이미지 ────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>히어로 이미지</p>
        <ImageField
          label="배경 이미지 (1920×1080 권장, 세로 이미지도 가능)"
          value={draft.heroImage}
          onChange={(url) => setDraft({ ...draft, heroImage: url })}
          uploadPath="space/hero"
        />
      </div>

      {/* ── 기본 텍스트 ────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>기본 정보</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="페이지 제목">
            <input style={inputStyle} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="STUDIO SPACE" />
          </Field>
          <Field label="태그라인">
            <input style={inputStyle} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} placeholder="Where Vision Meets Light" />
          </Field>
        </div>
        <Field label="스튜디오 설명">
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
      </div>

      {/* ── 스펙 ───────────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>스튜디오 스펙 (빈 값은 숨겨집니다)</p>
        <SpecsEditor specs={draft.specs} onChange={(s) => setDraft({ ...draft, specs: s })} />
      </div>

      {/* ── 스튜디오 사진 4장 ─────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>스튜디오 사진 (4장, 에디토리얼 그리드 배치)</p>
        <PhotoSlotsEditor photos={draft.photos} onChange={(p) => setDraft({ ...draft, photos: p })} />
      </div>

      {/* ── 촬영 가능 목록 ─────────────────────────────── */}
      <div>
        <p style={sectionHead}>촬영 가능 목록 (What We Shoot)</p>
        <CapabilitiesEditor items={draft.capabilities} onChange={(v) => setDraft({ ...draft, capabilities: v })} />
      </div>
    </div>
  );
}
