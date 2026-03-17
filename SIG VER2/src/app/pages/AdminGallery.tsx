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
      {/* 권장 규격 안내 */}
      <div style={{ background: "#0D0D0D", border: "1px solid #1A1A1A", padding: "8px 14px", marginBottom: "10px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555" }}>
          📐 <span style={{ color: "#666" }}>권장 비율</span> — 1:1 정사각형 (갤러리 UI 최적화)
        </span>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555" }}>
          📏 <span style={{ color: "#666" }}>권장 크기</span> — 1200×1200px 이상
        </span>
        <span style={{ fontFamily: F, fontSize: "11px", color: "#555" }}>
          🗂 JPG / PNG / WebP · 라이트박스에서는 원본 비율로 전체 표시됨
        </span>
      </div>
      <div
        onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `1px dashed ${uploading ? "#333" : "#2A2A2A"}`,
          padding: "18px",
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

// ─── Draggable image grid ──────────────────────────────────
function DraggableImageGrid({
  images,
  onChange,
  onRemove,
}: {
  images: GalleryImage[];
  onChange: (reordered: GalleryImage[]) => void;
  onRemove: (id: string) => void;
}) {
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function handleDragStart(i: number) {
    dragIdx.current = i;
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }

  function handleDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === targetIdx) { setOverIdx(null); return; }
    const arr = [...images];
    const [removed] = arr.splice(from, 1);
    arr.splice(targetIdx, 0, removed);
    onChange(arr);
    dragIdx.current = null;
    setOverIdx(null);
  }

  function handleDragEnd() {
    dragIdx.current = null;
    setOverIdx(null);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
        gap: "8px",
        marginTop: "4px",
      }}
    >
      {images.map((img, i) => (
        <div
          key={img.id}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={(e) => handleDrop(e, i)}
          onDragEnd={handleDragEnd}
          style={{
            position: "relative",
            aspectRatio: "1",
            overflow: "hidden",
            background: "#111",
            cursor: "grab",
            outline: overIdx === i && dragIdx.current !== i ? "2px solid #FAFAFA" : "none",
            opacity: dragIdx.current === i ? 0.4 : 1,
            transition: "opacity 0.15s, outline 0.1s",
          }}
        >
          <img
            src={img.url}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }}
            onError={(e) => (e.currentTarget.style.opacity = "0.2")}
          />
          {/* Drag handle indicator */}
          <div style={{
            position: "absolute", top: "4px", left: "4px",
            color: "rgba(255,255,255,0.6)", fontSize: "10px", lineHeight: 1,
            pointerEvents: "none", letterSpacing: "1px",
          }}>
            ⠿
          </div>
          {/* Delete */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
            style={{
              position: "absolute", top: "4px", right: "4px",
              background: "rgba(0,0,0,0.7)", border: "none", cursor: "pointer",
              color: "#FAFAFA", fontFamily: F, fontSize: "13px", lineHeight: 1,
              width: "20px", height: "20px",
            }}
          >
            ×
          </button>
        </div>
      ))}
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

  return (
    <div style={{ background: "#0A0A0A", border: BORDER, marginBottom: "16px" }}>
      {/* Header row */}
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

      {!collapsed && (
        <div style={{ padding: "20px" }}>
          <PhotoUploadArea
            sectionId={section.id}
            onAdd={(imgs) => onChange({ ...section, images: [...section.images, ...imgs] })}
          />
          {section.images.length > 0 && (
            <DraggableImageGrid
              images={section.images}
              onChange={(reordered) => onChange({ ...section, images: reordered })}
              onRemove={(id) => onChange({ ...section, images: section.images.filter((i) => i.id !== id) })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Home Preview Picker ─────────────────────────────────
function HomePreviewPicker({
  sections,
  featuredIds,
  onChange,
}: {
  sections: GallerySection[];
  featuredIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const allImages: Array<{ img: GalleryImage; sectionTitle: string }> = [];
  for (const s of sections) {
    for (const img of s.images) {
      allImages.push({ img, sectionTitle: s.title });
    }
  }

  function toggle(id: string) {
    if (featuredIds.includes(id)) {
      onChange(featuredIds.filter((x) => x !== id));
    } else {
      if (featuredIds.length >= 4) return; // max 4
      onChange([...featuredIds, id]);
    }
  }

  if (allImages.length === 0) {
    return (
      <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, padding: "16px 0" }}>
        섹션에 사진을 먼저 등록하세요.
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, marginBottom: "14px" }}>
        사진을 클릭해 홈 프리뷰에 노출할 4장을 선택하세요. ({featuredIds.length}/4)
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px" }}>
        {allImages.map(({ img, sectionTitle }) => {
          const pos = featuredIds.indexOf(img.id);
          const selected = pos !== -1;
          const maxed = featuredIds.length >= 4 && !selected;
          return (
            <div
              key={img.id}
              onClick={() => !maxed && toggle(img.id)}
              style={{
                position: "relative",
                aspectRatio: "1",
                overflow: "hidden",
                cursor: maxed ? "default" : "pointer",
                outline: selected ? "2px solid #FAFAFA" : "2px solid transparent",
                opacity: maxed ? 0.35 : 1,
                transition: "outline 0.15s, opacity 0.15s",
              }}
            >
              <img
                src={img.url}
                alt={img.alt || sectionTitle}
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              {selected && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: F, fontSize: "22px", fontWeight: 800, color: "#FAFAFA" }}>
                    {pos + 1}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {featuredIds.length > 0 && (
        <button
          onClick={() => onChange([])}
          style={{ marginTop: "12px", background: "none", border: "none", cursor: "pointer", fontFamily: F, fontSize: "11px", color: TEXT3, padding: 0, textDecoration: "underline" }}
        >
          선택 초기화
        </button>
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
    setDraft({ ...draft, sections: [...draft.sections, { id, title: "", images: [] }] });
  }

  function updateSection(idx: number, updated: GallerySection) {
    const sections = draft.sections.map((s, i) => (i === idx ? updated : s));
    setDraft({ ...draft, sections });
  }

  function removeSection(idx: number) {
    if (!confirm("섹션을 삭제하시겠습니까? 사진도 모두 제거됩니다.")) return;
    // Remove any featured IDs that belonged to this section
    const removedIds = new Set(draft.sections[idx].images.map((i) => i.id));
    setDraft({
      sections: draft.sections.filter((_, i) => i !== idx),
      featuredImageIds: draft.featuredImageIds.filter((id) => !removedIds.has(id)),
    });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const arr = [...draft.sections];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setDraft({ ...draft, sections: arr });
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
            섹션별로 사진을 관리합니다. 이미지를 드래그해 순서를 변경할 수 있습니다.
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

      {/* ── 홈 프리뷰 4장 선택 ───────────────────────────── */}
      <div style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>홈 프리뷰 사진 선택 (4장 고정)</p>
        <HomePreviewPicker
          sections={draft.sections}
          featuredIds={draft.featuredImageIds}
          onChange={(ids) => setDraft({ ...draft, featuredImageIds: ids })}
        />
      </div>

      {/* ── 섹션 목록 ────────────────────────────────────── */}
      <div>
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
