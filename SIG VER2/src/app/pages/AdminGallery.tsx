import { useState, useRef } from "react";
import { useGallery, defaultGalleryData } from "../context/GalleryContext";
import type { GalleryData, GallerySection, GalleryImage } from "../context/GalleryContext";
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

// ─── Photo upload ─────────────────────────────────────────
function PhotoUploadArea({
  sectionId,
  onAdd,
}: {
  sectionId: string;
  onAdd: (imgs: GalleryImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: File[]) {
    const valid = files.filter((f) => f.type.match(/png|jpeg|jpg|webp/));
    if (!valid.length) { setErr("PNG/JPG/WebP 파일만 가능합니다."); return; }
    if (!supabase) { setErr("Supabase 미연결"); return; }
    setUploading(true); setErr(null); setProgress(0);
    const uploaded: GalleryImage[] = [];
    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `gallery/${sectionId}-${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage
        .from("project-images")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (!error) {
        const { data } = supabase.storage.from("project-images").getPublicUrl(path);
        uploaded.push({ id: `img-${Date.now()}-${i}`, url: data.publicUrl, alt: "" });
      }
      setProgress(Math.round(((i + 1) / valid.length) * 100));
    }
    onAdd(uploaded);
    setUploading(false);
    setProgress(0);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) handleFiles(files);
          e.target.value = "";
        }}
      />
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `1px dashed ${uploading ? "#333" : "#2A2A2A"}`,
          padding: "20px",
          textAlign: "center",
          cursor: uploading ? "default" : "pointer",
          marginBottom: "12px",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => !uploading && (e.currentTarget.style.borderColor = "#555")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
      >
        <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, margin: 0 }}>
          {uploading
            ? `업로드 중… ${progress}%`
            : "클릭 또는 드래그하여 사진 업로드 (PNG/JPG, 다중 선택 가능)"}
        </p>
      </div>
      {err && <p style={{ fontFamily: F, fontSize: "11px", color: "#FF5555", marginBottom: "8px" }}>{err}</p>}
    </div>
  );
}

// ─── Section Editor ───────────────────────────────────────
function SectionEditor({
  section,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  section: GallerySection;
  onChange: (updated: GallerySection) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function removeImage(imgId: string) {
    onChange({ ...section, images: section.images.filter((i) => i.id !== imgId) });
  }

  function addImages(imgs: GalleryImage[]) {
    onChange({ ...section, images: [...section.images, ...imgs] });
  }

  return (
    <div style={{ background: "#0A0A0A", border: BORDER, marginBottom: "16px" }}>
      {/* Section header row */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "14px 20px", borderBottom: collapsed ? "none" : BORDER,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, flexShrink: 0 }}>
          {collapsed ? "▶" : "▼"}
        </span>
        <input
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          style={{ ...inputStyle, flex: 1, padding: "6px 10px", fontSize: "12px", fontWeight: 600 }}
          placeholder="섹션 이름 (예: 브랜딩, 공간, 캠페인)"
        />
        <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, flexShrink: 0 }}>
          {section.images.length}장
        </span>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button onClick={onMoveUp} disabled={isFirst}
            style={{ background: "none", border: BORDER2, color: isFirst ? TEXT3 : TEXT2, fontFamily: F, fontSize: "11px", width: "28px", height: "28px", cursor: isFirst ? "default" : "pointer" }}>
            ↑
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            style={{ background: "none", border: BORDER2, color: isLast ? TEXT3 : TEXT2, fontFamily: F, fontSize: "11px", width: "28px", height: "28px", cursor: isLast ? "default" : "pointer" }}>
            ↓
          </button>
          <button onClick={onRemove}
            style={{ background: "none", border: BORDER2, color: "#FF5555", fontFamily: F, fontSize: "13px", width: "28px", height: "28px", cursor: "pointer" }}>
            ×
          </button>
        </div>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div style={{ padding: "20px" }}>
          <PhotoUploadArea sectionId={section.id} onAdd={addImages} />

          {/* Thumbnail grid */}
          {section.images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "8px", marginTop: "4px" }}>
              {section.images.map((img) => (
                <div key={img.id} style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#111" }}>
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    style={{
                      position: "absolute", top: "4px", right: "4px",
                      background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer",
                      color: "#FAFAFA", fontFamily: F, fontSize: "14px", lineHeight: 1,
                      width: "22px", height: "22px",
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main AdminGallery ────────────────────────────────────
export function AdminGallery() {
  const { data, saving, saveError, updateData, resetData } = useGallery();
  const [draft, setDraft] = useState<GalleryData>(() => JSON.parse(JSON.stringify(data)));
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSave() {
    await updateData(draft);
    showToast("저장되었습니다 ✓");
  }

  async function handleReset() {
    if (!confirm("갤러리를 초기화하시겠습니까?")) return;
    await resetData();
    setDraft(JSON.parse(JSON.stringify(defaultGalleryData)));
    showToast("초기화되었습니다");
  }

  function addSection() {
    const id = `sec-${Date.now()}`;
    setDraft({ sections: [...draft.sections, { id, title: "", images: [] }] });
  }

  function updateSection(idx: number, updated: GallerySection) {
    const sections = draft.sections.map((s, i) => (i === idx ? updated : s));
    setDraft({ sections });
  }

  function removeSection(idx: number) {
    if (!confirm("섹션을 삭제하시겠습니까? 사진도 모두 제거됩니다.")) return;
    setDraft({ sections: draft.sections.filter((_, i) => i !== idx) });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const arr = [...draft.sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setDraft({ sections: arr });
  }

  return (
    <div style={{ padding: "40px 32px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "36px" }}>
        <div>
          <p style={{ fontFamily: F, fontWeight: 700, fontSize: "13px", color: TEXT, letterSpacing: "0.08em", marginBottom: "4px" }}>
            갤러리 편집
          </p>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            섹션별로 사진을 관리합니다. 섹션 순서가 갤러리 페이지에 그대로 노출됩니다.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {toast && <span style={{ fontFamily: F, fontSize: "12px", color: "#4CAF50" }}>{toast}</span>}
          {saveError && <span style={{ fontFamily: F, fontSize: "11px", color: "#FF5555" }}>{saveError}</span>}
          <button onClick={handleReset}
            style={{ background: "none", border: BORDER2, color: TEXT3, fontFamily: F, fontSize: "12px", padding: "8px 16px", cursor: "pointer" }}>
            초기화
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ background: ACCENT, border: "none", color: "#0D0D0D", fontFamily: F, fontSize: "12px", fontWeight: 700, padding: "8px 22px", cursor: saving ? "default" : "pointer", letterSpacing: "0.05em" }}>
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* Section list */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "12px", borderBottom: BORDER }}>
          <p style={{ ...sectionHead, margin: 0, border: "none", padding: 0 }}>
            갤러리 섹션 — {draft.sections.length}개
          </p>
          <button
            onClick={addSection}
            style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 16px", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            + 섹션 추가
          </button>
        </div>

        {draft.sections.length === 0 && (
          <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, textAlign: "center", padding: "40px 0" }}>
            아직 섹션이 없습니다. + 섹션 추가를 눌러 시작하세요.
          </p>
        )}

        {draft.sections.map((section, idx) => (
          <SectionEditor
            key={section.id}
            section={section}
            onChange={(updated) => updateSection(idx, updated)}
            onRemove={() => removeSection(idx)}
            onMoveUp={() => moveSection(idx, -1)}
            onMoveDown={() => moveSection(idx, 1)}
            isFirst={idx === 0}
            isLast={idx === draft.sections.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
