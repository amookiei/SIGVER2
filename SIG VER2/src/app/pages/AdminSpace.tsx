import { useState, useRef } from "react";
import { useSpace, defaultSpaceContent } from "../context/SpaceContext";
import type { SpaceContent, SpaceSpec, SpaceSection } from "../context/SpaceContext";
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
  background: SURFACE, border: BORDER2, color: TEXT,
  fontFamily: F, fontSize: "13px", padding: "9px 12px",
  width: "100%", outline: "none", boxSizing: "border-box",
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

// ─── Image upload ──────────────────────────────────────────
function ImageField({ label, value, onChange, uploadPath }: {
  label: string; value: string; onChange: (url: string) => void; uploadPath: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!supabase) { setErr("Supabase 미연결 — URL 직접 입력"); return; }
    setUploading(true); setErr(null);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${uploadPath}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-images")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (error) { setErr(`업로드 실패: ${error.message}`); setUploading(false); return; }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  }

  return (
    <Field label={label}>
      <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }}
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
  return (
    <div>
      {specs.map((spec, i) => (
        <div key={spec.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 28px", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
          <input style={inputStyle} value={spec.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="항목 (예: 규모)" />
          <input style={inputStyle} value={spec.value} onChange={(e) => set(i, "value", e.target.value)} placeholder="값 (예: 200평)" />
          <button onClick={() => onChange(specs.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "16px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button onClick={() => onChange([...specs, { id: `s-${Date.now()}`, label: "", value: "" }])}
        style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}>
        + 항목 추가
      </button>
    </div>
  );
}

// ─── Photo slots ──────────────────────────────────────────
function PhotoSlotsEditor({ photos, onChange }: { photos: string[]; onChange: (p: string[]) => void }) {
  const filled = [...photos, "", "", ""].slice(0, 3) as [string, string, string];
  function setPhoto(idx: number, url: string) {
    const next = [...filled] as string[];
    next[idx] = url;
    while (next.length > 0 && !next[next.length - 1]) next.pop();
    onChange(next);
  }
  const labels = [
    "사진 1 — 대형 좌 (세로형 권장)",
    "사진 2 — 우측 상단 (가로형 권장)",
    "사진 3 — 우측 하단 (가로형 권장)",
  ];
  return (
    <div>
      <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", padding: "10px 14px", marginBottom: "20px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555", letterSpacing: "0.04em" }}>
          📐 <span style={{ color: "#777" }}>사진 1</span> — 세로형 · 2:3 비율 · 800×1200px 이상
        </span>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555", letterSpacing: "0.04em" }}>
          📐 <span style={{ color: "#777" }}>사진 2·3</span> — 가로형 · 4:3 비율 · 1200×900px 이상
        </span>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555", letterSpacing: "0.04em" }}>
          🗂 JPG / PNG / WebP
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Photo 1 takes full width (big portrait) */}
        <div style={{ gridColumn: "1 / 3" }}>
          <ImageField label={labels[0]} value={filled[0]} onChange={(u) => setPhoto(0, u)} uploadPath="space/photo-1" />
        </div>
        <ImageField label={labels[1]} value={filled[1]} onChange={(u) => setPhoto(1, u)} uploadPath="space/photo-2" />
        <ImageField label={labels[2]} value={filled[2]} onChange={(u) => setPhoto(2, u)} uploadPath="space/photo-3" />
      </div>
    </div>
  );
}

// ─── String list editor ───────────────────────────────────
function StringListEditor({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 28px", gap: "8px", marginBottom: "8px" }}>
          <input style={inputStyle} value={item} onChange={(e) => onChange(items.map((s, j) => j === i ? e.target.value : s))} placeholder={placeholder ?? ""} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "16px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])}
        style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}>
        + 항목 추가
      </button>
    </div>
  );
}

// ─── Sections editor (조명/조리/편의 등) ─────────────────
function SectionsEditor({ sections, onChange }: { sections: SpaceSection[]; onChange: (s: SpaceSection[]) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function setSection(idx: number, patch: Partial<SpaceSection>) {
    onChange(sections.map((s, i) => i === idx ? { ...s, ...patch } : s));
  }
  function addSection() {
    const s: SpaceSection = { id: `sec-${Date.now()}`, icon: "✦", title: "", items: [] };
    onChange([...sections, s]);
    setOpenIdx(sections.length);
  }

  return (
    <div>
      {sections.map((sec, i) => (
        <div key={sec.id} style={{ border: BORDER2, marginBottom: "8px" }}>
          {/* Accordion header */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", cursor: "pointer" }}
            onClick={() => setOpenIdx(openIdx === i ? null : i)}>
            <span style={{ fontFamily: F, fontSize: "14px", color: TEXT2, flexShrink: 0 }}>{sec.icon || "✦"}</span>
            <span style={{ fontFamily: F, fontSize: "12px", color: TEXT, flex: 1, fontWeight: 600 }}>{sec.title || "제목 없음"}</span>
            <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>{openIdx === i ? "▲" : "▼"}</span>
            <button onClick={(e) => { e.stopPropagation(); onChange(sections.filter((_, j) => j !== i)); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: TEXT3, fontFamily: F, fontSize: "14px", lineHeight: 1, marginLeft: "8px" }}>×</button>
          </div>

          {/* Accordion body */}
          {openIdx === i && (
            <div style={{ padding: "12px 14px", borderTop: BORDER }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "8px", marginBottom: "14px" }}>
                <input style={inputStyle} value={sec.icon} onChange={(e) => setSection(i, { icon: e.target.value })} placeholder="아이콘" />
                <input style={inputStyle} value={sec.title} onChange={(e) => setSection(i, { title: e.target.value })} placeholder="섹션 제목 (예: 조명 장비)" />
              </div>
              <label style={{ display: "block", color: TEXT3, fontFamily: F, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                항목 목록
              </label>
              <StringListEditor
                items={sec.items}
                onChange={(items) => setSection(i, { items })}
                placeholder="예: NANLITE FC-500B 2대"
              />
            </div>
          )}
        </div>
      ))}
      <button onClick={addSection}
        style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 14px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}>
        + 섹션 추가
      </button>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: TEXT, letterSpacing: "0.08em", marginBottom: "4px" }}>
            스페이스 페이지 편집
          </p>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            스튜디오 소개 페이지의 콘텐츠를 관리합니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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

      {/* ── 히어로 이미지 ──────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>히어로 이미지</p>
        <ImageField label="배경 이미지 (1920×1080 권장)" value={draft.heroImage}
          onChange={(url) => setDraft({ ...draft, heroImage: url })} uploadPath="space/hero" />
      </div>

      {/* ── 기본 정보 ──────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>기본 정보</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="페이지 제목">
            <input style={inputStyle} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="MEATVERSE COOKING STUDIO" />
          </Field>
          <Field label="태그라인">
            <input style={inputStyle} value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
          </Field>
        </div>
        <Field label="스튜디오 설명">
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
      </div>

      {/* ── 리뷰 이벤트 ────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>리뷰 이벤트 배너 (비워두면 숨김)</p>
        <Field label="이벤트 문구">
          <input style={inputStyle} value={draft.reviewEvent} onChange={(e) => setDraft({ ...draft, reviewEvent: e.target.value })}
            placeholder="예: 리뷰 작성 후 인증 시 시간당 5,000원 페이백" />
        </Field>
        <Field label="기물 소개 노션 URL">
          <input style={inputStyle} value={draft.notionUrl} onChange={(e) => setDraft({ ...draft, notionUrl: e.target.value })}
            placeholder="https://notion.so/..." />
        </Field>
      </div>

      {/* ── 스펙 ───────────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>스튜디오 스펙 (빈 값은 숨겨집니다)</p>
        <SpecsEditor specs={draft.specs} onChange={(s) => setDraft({ ...draft, specs: s })} />
      </div>

      {/* ── 사진 4장 ───────────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>스튜디오 사진 (3장, 에디토리얼 그리드)</p>
        <PhotoSlotsEditor photos={draft.photos} onChange={(p) => setDraft({ ...draft, photos: p })} />
      </div>

      {/* ── 시설·장비 섹션 ────────────────────────────── */}
      <div style={{ marginBottom: "40px" }}>
        <p style={sectionHead}>시설 & 장비 섹션 (조명장비·조리시설·편의시설 등)</p>
        <SectionsEditor sections={draft.sections} onChange={(s) => setDraft({ ...draft, sections: s })} />
      </div>

      {/* ── 촬영 가능 목록 ─────────────────────────────── */}
      <div>
        <p style={sectionHead}>촬영 가능 목록 (What We Shoot)</p>
        <StringListEditor items={draft.capabilities} onChange={(v) => setDraft({ ...draft, capabilities: v })} placeholder="예: 레시피·푸드 콘텐츠" />
      </div>
    </div>
  );
}
