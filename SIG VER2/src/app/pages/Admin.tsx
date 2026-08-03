import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../context/AdminContext";
import { AdminAbout } from "./AdminAbout";
import { AdminHome } from "./AdminHome";
import { AdminContact } from "./AdminContact";
import { AdminGallery } from "./AdminGallery";
import { AdminSpace } from "./AdminSpace";
import { AdminDashboard } from "./AdminDashboard";
import { AdminExperiments } from "./AdminExperiments";
import { AdminResearch } from "./AdminResearch";
import { AdminSQL } from "./AdminSQL";
import type { PortfolioItem, ContentBlock } from "../data/portfolio";
import { supabase } from "../../lib/supabase";

// ─── Design tokens ────────────────────────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BG = "#0D0D0D";
const SURFACE = "#111111";
const BORDER = "1px solid #1F1F1F";
const BORDER2 = "1px solid #2A2A2A";
const TEXT = "#FAFAFA";
const TEXT2 = "#888888";
const TEXT3 = "#444444";
const ACCENT = "#FAFAFA";

const CATS = ["Branding", "Web Design", "Campaign", "Government"] as const;

// ─── Blank item template ──────────────────────────────────
const blank: Omit<PortfolioItem, "id"> = {
  slug: "",
  title: "",
  client: "",
  category: "Branding",
  year: new Date().getFullYear(),
  featured: false,
  order: undefined,
  hidden: false,
  thumbnail: "",
  thumbnailHover: "",
  heroImage: "",
  gallery: [],
  tagline: "",
  description: "",
  contentBlocks: [],
  role: "",
  duration: "",
  tags: [],
  liveUrl: "",
  nextProject: "",
  workScope: [],
  additionalInfo: [],
};

// ─── Form state (flat, with string versions for tags/gallery) ──
interface FormState extends Omit<PortfolioItem, "tags" | "gallery"> {
  tagsStr: string;
  galleryUrls: string[];
}

function toForm(item: PortfolioItem): FormState {
  const { tags, gallery, ...rest } = item;
  // challenge/solution → contentBlocks 자동 마이그레이션
  let contentBlocks: ContentBlock[] = item.contentBlocks ?? [];
  if (contentBlocks.length === 0 && (item.challenge || item.solution)) {
    contentBlocks = [];
    if (item.challenge) contentBlocks.push({ id: crypto.randomUUID(), type: "text", title: "Challenge", body: item.challenge });
    if (item.solution) contentBlocks.push({ id: crypto.randomUUID(), type: "text", title: "Solution", body: item.solution });
  }
  return {
    ...rest,
    contentBlocks,
    tagsStr: tags.join(", "),
    galleryUrls: gallery.length ? [...gallery, ""] : [""],
  };
}

function blankForm(): FormState {
  const { tags: _t, gallery: _g, ...restBlank } = blank;
  return {
    id: 0,
    ...restBlank,
    contentBlocks: [],
    tagsStr: "",
    galleryUrls: [""],
  };
}

function fromForm(form: FormState): Omit<PortfolioItem, "id"> {
  return {
    slug: form.slug.trim(),
    title: form.title.trim(),
    client: form.client.trim(),
    category: form.category,
    year: Number(form.year),
    featured: form.featured,
    order: form.featured && form.order ? Number(form.order) : undefined,
    hidden: form.hidden ?? false,
    thumbnail: form.thumbnail.trim(),
    thumbnailHover: form.thumbnailHover?.trim() || undefined,
    heroImage: form.heroImage.trim(),
    gallery: form.galleryUrls.map((u) => u.trim()).filter(Boolean),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    contentBlocks: form.contentBlocks && form.contentBlocks.length > 0 ? form.contentBlocks : undefined,
    challenge: undefined,
    solution: undefined,
    role: form.role.trim(),
    duration: form.duration.trim(),
    tags: form.tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    liveUrl: form.liveUrl?.trim() || undefined,
    nextProject: form.nextProject?.trim() || undefined,
    workScope: form.workScope && form.workScope.length > 0 ? form.workScope.filter(Boolean) : undefined,
    additionalInfo: form.additionalInfo && form.additionalInfo.length > 0 ? form.additionalInfo.filter(i => i.label || i.value) : undefined,
  };
}

// ─── Shared input styles ──────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: "#0A0A0A",
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

const fieldStyle: React.CSSProperties = { marginBottom: "20px" };

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── Image upload field ───────────────────────────────────
function ImageUploadField({
  label,
  value,
  uploading,
  onFile,
  onChange,
  previewHeight = 80,
}: {
  label: string;
  value: string;
  uploading: boolean;
  onFile: (file: File) => void;
  onChange: (url: string) => void;
  previewHeight?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            background: "none",
            border: BORDER2,
            color: uploading ? TEXT3 : TEXT2,
            fontFamily: F,
            fontSize: "11px",
            padding: "0 14px",
            cursor: uploading ? "default" : "pointer",
            letterSpacing: "0.06em",
            height: "38px",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {uploading ? "업로드 중…" : "JPG 업로드"}
        </button>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="또는 URL 직접 입력"
        />
      </div>
      {value && (
        <img
          src={value}
          alt={`${label} preview`}
          style={{
            marginTop: "8px",
            height: `${previewHeight}px`,
            objectFit: "cover",
            display: "block",
            width: "100%",
          }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
    </div>
  );
}

// ─── Image slot (hook-safe 분리) ──────────────────────────
function ImageSlot({
  value,
  uploadKey,
  label,
  uploading,
  onUpload,
  onChange,
}: {
  value: string;
  uploadKey: string;
  label: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          style={{
            background: "none",
            border: "1px solid #2A2A2A",
            color: uploading ? TEXT3 : TEXT2,
            fontFamily: F,
            fontSize: "10px",
            padding: "5px 8px",
            cursor: uploading ? "default" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {uploading ? "업로드중…" : "JPG 업로드"}
        </button>
        <input
          type="text"
          placeholder={`${label} URL`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, fontSize: "11px" }}
        />
      </div>
      {value && (
        <img
          src={value}
          alt=""
          style={{ width: "100%", height: "56px", objectFit: "cover", display: "block" }}
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      )}
    </div>
  );
}

// ─── Content Block Editor ─────────────────────────────────
function ContentBlocksEditor({
  blocks,
  onChange,
  onUpload,
  uploading,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  onUpload: (file: File, key: string, onSuccess: (url: string) => void) => void;
  uploading: Record<string, boolean>;
}) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const isDragging = useRef(false);
  const draggingIdxRef = useRef<number | null>(null);
  const insertAtRef = useRef<number | null>(null);
  const blockEls = useRef<(HTMLDivElement | null)[]>([]);
  const activePointerId = useRef<number | null>(null);

  const addText = () =>
    onChange([...blocks, { id: crypto.randomUUID(), type: "text", title: "", body: "" }]);

  const addImage = () =>
    onChange([...blocks, { id: crypto.randomUUID(), type: "image", images: [] }]);

  const removeBlock = (idx: number) => onChange(blocks.filter((_, i) => i !== idx));

  const updateBlock = (idx: number, patch: Partial<ContentBlock>) => {
    onChange(blocks.map((b, i) => (i === idx ? { ...b, ...patch } as ContentBlock : b)));
  };

  const getInsertIdx = (clientY: number) => {
    for (let i = 0; i < blockEls.current.length; i++) {
      const el = blockEls.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return blocks.length;
  };

  const onHandleDown = (idx: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const pid = e.pointerId;
    activePointerId.current = pid;
    isDragging.current = true;
    draggingIdxRef.current = idx;
    insertAtRef.current = idx;
    setDraggingIdx(idx);
    setInsertAt(idx);
    try { el.setPointerCapture(pid); } catch { /* ignore */ }
  };

  const onHandleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || draggingIdxRef.current === null) return;
    e.preventDefault();
    const idx = getInsertIdx(e.clientY);
    insertAtRef.current = idx;
    setInsertAt(idx);
  };

  const onHandleUp = () => {
    if (isDragging.current && draggingIdxRef.current !== null && insertAtRef.current !== null) {
      const from = draggingIdxRef.current;
      const dest = insertAtRef.current > from ? insertAtRef.current - 1 : insertAtRef.current;
      if (dest !== from) {
        const next = [...blocks];
        const [moved] = next.splice(from, 1);
        next.splice(dest, 0, moved);
        onChange(next);
      }
    }
    isDragging.current = false;
    draggingIdxRef.current = null;
    insertAtRef.current = null;
    setDraggingIdx(null);
    setInsertAt(null);
    activePointerId.current = null;
  };

  const insertLine = (
    <div style={{ height: "2px", background: "#FF4D00", borderRadius: "2px", margin: "0 0 4px", boxShadow: "0 0 6px rgba(255,77,0,0.5)" }} />
  );

  return (
    <div>
      {/* Add buttons */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {[
          { label: "+ 텍스트 블록", fn: addText, color: "#FF4D00" },
          { label: "+ 이미지 블록", fn: addImage, color: "#888" },
        ].map(({ label, fn, color }) => (
          <button
            key={label}
            type="button"
            onClick={fn}
            style={{
              background: "none",
              border: "1px solid #2A2A2A",
              color,
              fontFamily: F,
              fontSize: "11px",
              letterSpacing: "0.08em",
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {blocks.length === 0 && (
        <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, padding: "20px 0" }}>
          블록을 추가해 콘텐츠를 구성하세요. ≡ 아이콘을 드래그해 순서를 바꿀 수 있습니다.
        </p>
      )}

      {/* Block list */}
      <div>
        {blocks.map((block, idx) => (
          <div key={block.id}>
            {insertAt === idx && draggingIdx !== null && draggingIdx !== idx && insertLine}

            <div
              ref={(el) => { blockEls.current[idx] = el; }}
              style={{
                display: "flex",
                gap: "10px",
                background: "#111111",
                border: `1px solid ${draggingIdx === idx ? "#FF4D00" : "#1F1F1F"}`,
                padding: "12px",
                marginBottom: "6px",
                opacity: draggingIdx === idx ? 0.38 : 1,
                transform: draggingIdx === idx ? "scale(0.985)" : "scale(1)",
                transition: "opacity 0.1s, transform 0.1s, border-color 0.1s",
              }}
            >
              {/* Drag handle */}
              <div
                onPointerDown={(e) => onHandleDown(idx, e)}
                onPointerMove={onHandleMove}
                onPointerUp={onHandleUp}
                onPointerCancel={onHandleUp}
                style={{
                  cursor: draggingIdx === idx ? "grabbing" : "grab",
                  color: draggingIdx === idx ? "#FF4D00" : TEXT3,
                  userSelect: "none",
                  touchAction: "none",
                  padding: "4px 6px",
                  fontSize: "14px",
                  flexShrink: 0,
                  lineHeight: 1,
                  transition: "color 0.1s",
                }}
                title="드래그해서 순서 변경"
              >
                ⠿
              </div>

              {/* Block content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: "8px" }}>
                  <span
                    style={{
                      fontFamily: F,
                      fontSize: "9px",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: block.type === "text" ? "#FF4D00" : "#888",
                      border: `1px solid ${block.type === "text" ? "#FF4D00" : "#333"}`,
                      padding: "2px 6px",
                    }}
                  >
                    {block.type === "text" ? "TEXT" : "IMAGE"}
                  </span>
                </div>

                {block.type === "text" && (
                  <>
                    <input
                      type="text"
                      placeholder="섹션 제목 (예: Challenge, Overview, Process…)"
                      value={block.title}
                      onChange={(e) => updateBlock(idx, { title: e.target.value })}
                      style={{ ...inputStyle, marginBottom: "6px" }}
                    />
                    <textarea
                      placeholder="내용"
                      value={block.body}
                      onChange={(e) => updateBlock(idx, { body: e.target.value })}
                      style={{ ...inputStyle, minHeight: "72px", resize: "vertical" }}
                    />
                  </>
                )}

                {block.type === "image" && (
                  <div>
                    {/* 1장 / 2장 토글 */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                      {([1, 2] as const).map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            const imgs = [...(block.images ?? [])];
                            updateBlock(idx, { imageCount: n, images: imgs });
                          }}
                          style={{
                            background: (block.imageCount ?? 2) === n ? "#FAFAFA" : "none",
                            border: "1px solid #2A2A2A",
                            color: (block.imageCount ?? 2) === n ? "#0D0D0D" : TEXT3,
                            fontFamily: F,
                            fontSize: "10px",
                            padding: "4px 12px",
                            cursor: "pointer",
                            letterSpacing: "0.08em",
                            fontWeight: (block.imageCount ?? 2) === n ? 700 : 400,
                          }}
                        >
                          {n}장
                        </button>
                      ))}
                      <span style={{ fontFamily: F, fontSize: "10px", color: TEXT3, alignSelf: "center", marginLeft: "4px" }}>
                        {(block.imageCount ?? 2) === 1 ? "풀와이드" : "나란히 (높이 축소)"}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: (block.imageCount ?? 2) === 1 ? "1fr" : "1fr 1fr", gap: "8px" }}>
                      {Array.from({ length: block.imageCount ?? 2 }, (_, imgIdx) => (
                        <ImageSlot
                          key={imgIdx}
                          value={block.images?.[imgIdx] ?? ""}
                          uploadKey={`cb-${block.id}-${imgIdx}`}
                          label={`이미지 ${imgIdx + 1}`}
                          uploading={!!uploading[`cb-${block.id}-${imgIdx}`]}
                          onUpload={(file) =>
                            onUpload(file, `cb-${block.id}-${imgIdx}`, (url) => {
                              const imgs = [...(block.images ?? [])];
                              imgs[imgIdx] = url;
                              updateBlock(idx, { images: imgs });
                            })
                          }
                          onChange={(url) => {
                            const imgs = [...(block.images ?? [])];
                            imgs[imgIdx] = url;
                            updateBlock(idx, { images: imgs });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeBlock(idx)}
                style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: "18px", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Insert line at end */}
        {insertAt === blocks.length && draggingIdx !== null && insertLine}
      </div>
    </div>
  );
}

// ─── Tab bar ─────────────────────────────────────────────
type Tab = "basic" | "images" | "content" | "settings";
const TABS: { id: Tab; label: string }[] = [
  { id: "basic", label: "기본정보" },
  { id: "images", label: "이미지" },
  { id: "content", label: "콘텐츠" },
  { id: "settings", label: "설정" },
];

// ─── Edit / Add Modal ─────────────────────────────────────
function EditModal({
  form,
  setForm,
  onSave,
  onCancel,
  isAdding,
  allItems,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  isAdding: boolean;
  allItems: PortfolioItem[];
}) {
  const [tab, setTab] = useState<Tab>("basic");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File, key: string, onSuccess: (url: string) => void) {
    if (!file.type.match(/jpeg|jpg/)) {
      setUploadError("JPG 파일만 업로드 가능합니다.");
      return;
    }
    setUploading((p) => ({ ...p, [key]: true }));
    setUploadError(null);

    if (!supabase) {
      setUploadError("Supabase가 연결되지 않았습니다. URL을 직접 입력해 주세요.");
      setUploading((p) => ({ ...p, [key]: false }));
      return;
    }

    const slug = form.slug || "unsaved";
    const path = `${slug}/${key}-${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from("project-images")
      .upload(path, file, { contentType: "image/jpeg", upsert: true });

    if (error) {
      setUploadError(`업로드 실패: ${error.message}`);
      setUploading((p) => ({ ...p, [key]: false }));
      return;
    }

    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    onSuccess(data.publicUrl);
    setUploading((p) => ({ ...p, [key]: false }));
  }

  const set = (key: keyof FormState, val: unknown) =>
    setForm({ ...form, [key]: val });

  const setGallery = (idx: number, val: string) => {
    const next = [...form.galleryUrls];
    next[idx] = val;
    setForm({ ...form, galleryUrls: next });
  };

  const addGalleryRow = () =>
    setForm({ ...form, galleryUrls: [...form.galleryUrls, ""] });

  const removeGalleryRow = (idx: number) => {
    const next = form.galleryUrls.filter((_, i) => i !== idx);
    setForm({ ...form, galleryUrls: next.length ? next : [""] });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "stretch",
        justifyContent: "flex-end",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: "560px",
          maxWidth: "100vw",
          background: BG,
          borderLeft: BORDER,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontFamily: F,
                fontSize: "13px",
                fontWeight: 700,
                color: TEXT,
                letterSpacing: "0.08em",
              }}
            >
              {isAdding ? "새 프로젝트 추가" : "프로젝트 수정"}
            </span>
            {!isAdding && (
              <label
                style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}
                title="숨김 처리 시 Work / 홈 등 공개 페이지에서 보이지 않습니다"
              >
                {/* 토글 트랙 */}
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "36px",
                    height: "20px",
                    background: form.hidden ? "#E53E3E" : "#D0D0D0",
                    borderRadius: "10px",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                  onClick={() => setForm({ ...form, hidden: !form.hidden })}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: form.hidden ? "19px" : "3px",
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </span>
                <span style={{ fontFamily: F, fontSize: "11px", color: form.hidden ? "#E53E3E" : TEXT3, fontWeight: form.hidden ? 700 : 400, letterSpacing: "0.06em" }}>
                  {form.hidden ? "숨김" : "공개"}
                </span>
              </label>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: BORDER2,
                color: TEXT2,
                fontFamily: F,
                fontSize: "12px",
                padding: "6px 16px",
                cursor: "pointer",
              }}
            >
              취소
            </button>
            <button
              onClick={onSave}
              style={{
                background: ACCENT,
                border: "none",
                color: BG,
                fontFamily: F,
                fontSize: "12px",
                fontWeight: 700,
                padding: "6px 20px",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              저장
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            borderBottom: BORDER,
            flexShrink: 0,
            padding: "0 28px",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? `2px solid ${ACCENT}` : "2px solid transparent",
                color: tab === t.id ? TEXT : TEXT3,
                fontFamily: F,
                fontSize: "12px",
                padding: "12px 16px 10px",
                cursor: "pointer",
                letterSpacing: "0.06em",
                marginRight: "4px",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {/* ── Tab 1: 기본정보 ── */}
          {tab === "basic" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="제목 (Title)">
                  <input
                    style={inputStyle}
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="HYUNDAI REBRAND"
                  />
                </Field>
                <Field label="슬러그 (Slug)">
                  <input
                    style={inputStyle}
                    value={form.slug}
                    onChange={(e) =>
                      set(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")  // URL 안전: 영문·숫자·하이픈만
                          .replace(/-+/g, "-")           // 연속 하이픈 제거
                      )
                    }
                    placeholder="hyundai-rebrand (영문·숫자·하이픈만)"
                  />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="클라이언트">
                  <input
                    style={inputStyle}
                    value={form.client}
                    onChange={(e) => set("client", e.target.value)}
                    placeholder="현대자동차"
                  />
                </Field>
                <Field label="카테고리">
                  <select
                    style={{ ...inputStyle, cursor: "pointer" }}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {CATS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Field label="연도">
                  <input
                    style={inputStyle}
                    type="number"
                    value={form.year}
                    onChange={(e) => set("year", Number(e.target.value))}
                    placeholder="2025"
                  />
                </Field>
                <Field label="기간 (Duration)">
                  <input
                    style={inputStyle}
                    value={form.duration}
                    onChange={(e) => set("duration", e.target.value)}
                    placeholder="2024.09 – 2025.02 (6개월)"
                  />
                </Field>
              </div>

              <Field label="태그라인 (Tagline)">
                <input
                  style={inputStyle}
                  value={form.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="글로벌 모빌리티 브랜드의 새로운 정체성"
                />
              </Field>

              <Field label="역할 (Role)">
                <input
                  style={inputStyle}
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="Brand Strategy, Visual Identity, Motion Guidelines"
                />
              </Field>

              <Field label="태그 (Tags) — 쉼표로 구분">
                <input
                  style={inputStyle}
                  value={form.tagsStr}
                  onChange={(e) => set("tagsStr", e.target.value)}
                  placeholder="브랜드 전략, 아이덴티티 디자인, 모션 가이드라인"
                />
              </Field>

              <Field label="라이브 URL (선택)">
                <input
                  style={inputStyle}
                  value={form.liveUrl ?? ""}
                  onChange={(e) => set("liveUrl", e.target.value)}
                  placeholder="https://www.example.com"
                />
              </Field>
            </>
          )}

          {/* ── Tab 2: 이미지 ── */}
          {tab === "images" && (
            <>
              {/* Spec guide */}
              <div
                style={{
                  background: "#0A0A0A",
                  border: BORDER,
                  padding: "14px 16px",
                  marginBottom: "24px",
                }}
              >
                <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, lineHeight: 2, margin: 0 }}>
                  <span style={{ color: TEXT2, letterSpacing: "0.08em", fontSize: "10px" }}>권장 규격 — JPG 형식</span><br />
                  썸네일 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;800 × 600 px &nbsp;·&nbsp; 4:3 &nbsp;·&nbsp; 300 KB 이하<br />
                  썸네일(호버) &nbsp;800 × 600 px &nbsp;·&nbsp; 4:3 &nbsp;·&nbsp; 300 KB 이하 (선택)<br />
                  히어로 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1920 × 1080 px &nbsp;·&nbsp; 16:9 &nbsp;·&nbsp; 800 KB 이하
                </p>
              </div>

              {/* Upload error */}
              {uploadError && (
                <div
                  style={{
                    background: "#1A0000",
                    border: "1px solid #440000",
                    padding: "10px 14px",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontFamily: F, fontSize: "12px", color: "#FF5555" }}>{uploadError}</span>
                </div>
              )}

              {/* 썸네일 */}
              <ImageUploadField
                label="썸네일 (800 × 600)"
                value={form.thumbnail}
                uploading={!!uploading["thumbnail"]}
                onFile={(file) =>
                  handleUpload(file, "thumbnail", (url) => set("thumbnail", url))
                }
                onChange={(url) => set("thumbnail", url)}
                previewHeight={70}
              />

              {/* 썸네일 호버 */}
              <ImageUploadField
                label="썸네일 – 호버 이미지 (800 × 600, 선택)"
                value={form.thumbnailHover ?? ""}
                uploading={!!uploading["thumbnailHover"]}
                onFile={(file) =>
                  handleUpload(file, "thumbnailHover", (url) => set("thumbnailHover", url))
                }
                onChange={(url) => set("thumbnailHover", url)}
                previewHeight={70}
              />

              {/* 히어로 */}
              <ImageUploadField
                label="히어로 이미지 (1920 × 1080)"
                value={form.heroImage}
                uploading={!!uploading["hero"]}
                onFile={(file) =>
                  handleUpload(file, "hero", (url) => set("heroImage", url))
                }
                onChange={(url) => set("heroImage", url)}
                previewHeight={90}
              />

              <div style={{ background: "#0A0A0A", border: BORDER, padding: "12px 16px" }}>
                <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, margin: 0, lineHeight: 1.8 }}>
                  상세 콘텐츠 이미지는 <span style={{ color: TEXT2 }}>콘텐츠 탭 → 이미지 블록</span>에서 추가하세요.
                </p>
              </div>
            </>
          )}

          {/* ── Tab 3: 콘텐츠 ── */}
          {tab === "content" && (
            <>
              <Field label="프로젝트 개요 (Description)">
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="3~5문장으로 프로젝트를 설명합니다."
                />
              </Field>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #1F1F1F", margin: "8px 0 20px" }} />

              <div style={{ marginBottom: "10px" }}>
                <label style={labelStyle}>콘텐츠 블록 — 텍스트·이미지를 자유롭게 배치</label>
              </div>
              <ContentBlocksEditor
                blocks={form.contentBlocks ?? []}
                onChange={(blocks) => set("contentBlocks", blocks)}
                onUpload={handleUpload}
                uploading={uploading}
              />

              {/* Divider */}
              <div style={{ borderTop: "1px solid #1F1F1F", margin: "24px 0 20px" }} />

              {/* Work Scope */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>Work Scope — 작업 범위 항목</label>
                {(form.workScope ?? []).map((scope, i) => (
                  <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <input
                      type="text"
                      value={scope}
                      onChange={(e) => {
                        const next = [...(form.workScope ?? [])];
                        next[i] = e.target.value;
                        set("workScope", next);
                      }}
                      placeholder="예: Brand Strategy"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (form.workScope ?? []).filter((_, j) => j !== i);
                        set("workScope", next);
                      }}
                      style={{ background: "none", border: BORDER2, color: TEXT3, fontFamily: F, fontSize: "12px", padding: "0 10px", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set("workScope", [...(form.workScope ?? []), ""])}
                  style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 12px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}
                >
                  + 항목 추가
                </button>
              </div>

              {/* Additional Info */}
              <div style={{ marginBottom: "20px" }}>
                <label style={labelStyle}>추가 정보 (Additional Info) — 하단 키-값 표시</label>
                {(form.additionalInfo ?? []).map((info, i) => (
                  <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                    <input
                      type="text"
                      value={info.label}
                      onChange={(e) => {
                        const next = [...(form.additionalInfo ?? [])];
                        next[i] = { ...next[i], label: e.target.value };
                        set("additionalInfo", next);
                      }}
                      placeholder="레이블 (예: Client)"
                      style={{ ...inputStyle, flex: "0 0 140px" }}
                    />
                    <input
                      type="text"
                      value={info.value}
                      onChange={(e) => {
                        const next = [...(form.additionalInfo ?? [])];
                        next[i] = { ...next[i], value: e.target.value };
                        set("additionalInfo", next);
                      }}
                      placeholder="값 (예: 현대자동차)"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = (form.additionalInfo ?? []).filter((_, j) => j !== i);
                        set("additionalInfo", next);
                      }}
                      style={{ background: "none", border: BORDER2, color: TEXT3, fontFamily: F, fontSize: "12px", padding: "0 10px", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set("additionalInfo", [...(form.additionalInfo ?? []), { label: "", value: "" }])}
                  style={{ background: "none", border: BORDER2, color: TEXT2, fontFamily: F, fontSize: "11px", padding: "6px 12px", cursor: "pointer", letterSpacing: "0.06em", marginTop: "4px" }}
                >
                  + 항목 추가
                </button>
              </div>
            </>
          )}

          {/* ── Tab 4: 설정 ── */}
          {tab === "settings" && (
            <>
              <Field label="홈 Featured 노출">
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    fontFamily: F,
                    fontSize: "13px",
                    color: TEXT,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                    style={{ width: "16px", height: "16px", accentColor: ACCENT }}
                  />
                  홈 페이지 Featured 섹션에 노출
                </label>
              </Field>

              {form.featured && (
                <Field label="노출 순서 (Order)">
                  <input
                    style={{ ...inputStyle, width: "120px" }}
                    type="number"
                    min={1}
                    value={form.order ?? ""}
                    onChange={(e) => set("order", Number(e.target.value) || undefined)}
                    placeholder="1"
                  />
                  <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, marginTop: "6px" }}>
                    숫자가 낮을수록 먼저 표시됩니다.
                  </p>
                </Field>
              )}

              <Field label="다음 프로젝트 (Next Project) — 선택">
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={form.nextProject ?? ""}
                  onChange={(e) => set("nextProject", e.target.value)}
                >
                  <option value="">없음</option>
                  {allItems
                    .filter((i) => i.id !== form.id)
                    .map((i) => (
                      <option key={i.id} value={i.slug}>
                        {i.title} ({i.slug})
                      </option>
                    ))}
                </select>
              </Field>

              <div
                style={{
                  background: "#0A0A0A",
                  border: BORDER,
                  padding: "12px 16px",
                  marginTop: "8px",
                }}
              >
                <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, lineHeight: 1.8 }}>
                  📌 <strong style={{ color: TEXT2 }}>Slug</strong>는 URL에 사용됩니다. 저장 후 변경 시 기존 링크가 깨질 수 있습니다.
                  <br />
                  현재 Slug: <code style={{ color: TEXT2 }}>{form.slug || "(없음)"}</code>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────
export function Admin() {
  const navigate = useNavigate();
  const { isAdmin, logout, items, loading, dbStatus, dbError, updateItem, addItem, deleteItem, resetToDefault } = useAdmin();

  const [adminPage, setAdminPage] = useState<
    "dashboard" | "experiments" | "research" | "sql" | "portfolio" | "about" | "home" | "gallery" | "space" | "contact"
  >("dashboard");
  const [editForm, setEditForm] = useState<FormState | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(blankForm());
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) navigate("/", { replace: true });
  }, [isAdmin, navigate]);

  // Restore cursor on admin page (global CSS hides it)
  useEffect(() => {
    document.body.classList.add("sig-admin");
    return () => document.body.classList.remove("sig-admin");
  }, []);

  if (!isAdmin) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    await updateItem(editForm.id, fromForm(editForm));
    setEditForm(null);
    showToast("저장되었습니다 ✓");
  };

  const handleSaveAdd = async () => {
    await addItem(fromForm(addForm));
    setIsAdding(false);
    setAddForm(blankForm());
    showToast("프로젝트가 추가되었습니다 ✓");
  };

  const handleDelete = async (id: number) => {
    await deleteItem(id);
    setDeleteConfirm(null);
    showToast("삭제되었습니다");
  };

  const handleReset = async () => {
    if (confirm("모든 수정사항이 사라지고 기본 데이터로 초기화됩니다.\n계속하시겠습니까?")) {
      await resetToDefault();
      showToast("기본 데이터로 초기화되었습니다");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: F }}>
      {/* ─── Header ─────────────────────────────────────── */}
      <div
        style={{
          borderBottom: BORDER,
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: BG,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span
            style={{
              color: TEXT,
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            SIG ADMIN
          </span>
          {/* 페이지 탭 */}
          <div style={{ display: "flex", gap: "2px", background: "#0A0A0A", padding: "3px", border: BORDER }}>
            {([
              { id: "dashboard", label: "📊 지표" },
              { id: "experiments", label: "🧪 A/B 실험" },
              { id: "research", label: "🎧 리서치" },
              { id: "sql", label: "SQL" },
              { id: "portfolio", label: "포트폴리오" },
              { id: "home", label: "홈 콘텐츠" },
              { id: "gallery", label: "갤러리" },
              { id: "space", label: "스페이스" },
              { id: "about", label: "About 페이지" },
              { id: "contact", label: "Contact" },
            ] as const).map((page) => (
              <button
                key={page.id}
                onClick={() => setAdminPage(page.id)}
                style={{
                  fontFamily: F,
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "5px 14px",
                  border: "none",
                  cursor: "pointer",
                  background: adminPage === page.id ? TEXT : "none",
                  color: adminPage === page.id ? BG : TEXT3,
                  fontWeight: adminPage === page.id ? 700 : 400,
                }}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {loading && (
            <span style={{ color: TEXT3, fontSize: "11px", letterSpacing: "0.06em" }}>
              DB 연결중…
            </span>
          )}
          {!loading && dbStatus === "synced" && (
            <span style={{ color: "#4CAF50", fontSize: "11px", letterSpacing: "0.06em" }}>
              ● Supabase 연결됨
            </span>
          )}
          {!loading && dbStatus === "error" && (
            <span style={{ color: "#CC6622", fontSize: "11px", letterSpacing: "0.06em" }}>
              ⚠ DB 오류 (로컬 저장)
            </span>
          )}
          {!loading && dbStatus === "none" && (
            <span style={{ color: "#CC4444", fontSize: "11px", letterSpacing: "0.06em" }}>
              ⚠ Supabase 미연결 — 배포 환경변수 확인 필요
            </span>
          )}
          {toast && (
            <span style={{ color: "#4CAF50", fontSize: "12px", letterSpacing: "0.04em" }}>
              {toast}
            </span>
          )}
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: TEXT3,
              fontFamily: F,
              fontSize: "12px",
              cursor: "pointer",
              padding: "6px 12px",
              letterSpacing: "0.04em",
            }}
          >
            사이트 보기 ↗
          </button>
          <button
            onClick={logout}
            style={{
              background: "none",
              border: BORDER2,
              color: TEXT2,
              fontFamily: F,
              fontSize: "12px",
              cursor: "pointer",
              padding: "6px 16px",
              letterSpacing: "0.04em",
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* ─── DB 오류 진단 배너 ──────────────────────────────── */}
      {dbStatus === "error" && dbError && (
        <div
          style={{
            background: "#1A0A00",
            borderBottom: "1px solid #663300",
            padding: "14px 32px",
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: "#FF8844", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>⚠ DB 오류</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: F, fontSize: "12px", color: "#CC6622", margin: "0 0 6px" }}>
              {dbError}
            </p>
            {dbError.includes("thumbnail_hover") && (
              <details>
                <summary style={{ fontFamily: F, fontSize: "11px", color: TEXT3, cursor: "pointer", letterSpacing: "0.06em" }}>
                  → Supabase SQL Editor에서 아래 마이그레이션을 실행하세요
                </summary>
                <pre
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "#88CCAA",
                    background: "#0A0A0A",
                    border: BORDER,
                    padding: "12px 14px",
                    marginTop: "8px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    userSelect: "all",
                  }}
                >
{`ALTER TABLE portfolio_items
  ADD COLUMN IF NOT EXISTS thumbnail_hover TEXT;`}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}

      {/* ─── PM 지표 대시보드 탭 ──────────────────────────── */}
      {adminPage === "dashboard" && <AdminDashboard />}

      {/* ─── A/B 실험 탭 ─────────────────────────────────── */}
      {adminPage === "experiments" && <AdminExperiments />}

      {/* ─── UX 리서치 탭 ────────────────────────────────── */}
      {adminPage === "research" && <AdminResearch />}

      {/* ─── SQL 콘솔 탭 ─────────────────────────────────── */}
      {adminPage === "sql" && <AdminSQL />}

      {/* ─── About 탭 ────────────────────────────────────── */}
      {adminPage === "about" && <AdminAbout />}

      {/* ─── 홈 콘텐츠 탭 ─────────────────────────────────── */}
      {adminPage === "home" && <AdminHome />}

      {/* ─── 갤러리 탭 ──────────────────────────────────── */}
      {adminPage === "gallery" && <AdminGallery />}

      {/* ─── 스페이스 탭 ─────────────────────────────────── */}
      {adminPage === "space" && <AdminSpace />}

      {/* ─── Contact 탭 ──────────────────────────────────── */}
      {adminPage === "contact" && <AdminContact />}

      {/* ─── Portfolio 탭 Content ─────────────────────────── */}
      {adminPage === "portfolio" && <>
      <div style={{ padding: "40px 32px", maxWidth: "1100px", margin: "0 auto" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "28px",
          }}
        >
          <span style={{ color: TEXT3, fontSize: "11px", letterSpacing: "0.1em" }}>
            총 {items.length}개 프로젝트
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                setAddForm(blankForm());
                setIsAdding(true);
              }}
              style={{
                background: ACCENT,
                border: "none",
                color: BG,
                fontFamily: F,
                fontSize: "12px",
                fontWeight: 700,
                padding: "10px 22px",
                cursor: "pointer",
                letterSpacing: "0.06em",
              }}
            >
              + 새 프로젝트
            </button>
            <button
              onClick={handleReset}
              style={{
                background: "none",
                border: BORDER2,
                color: TEXT3,
                fontFamily: F,
                fontSize: "12px",
                padding: "10px 18px",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              기본값 초기화
            </button>
          </div>
        </div>

        {/* ─── Project list ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: SURFACE,
                border: BORDER,
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "14px 20px",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "88px",
                  height: "60px",
                  flexShrink: 0,
                  background: "#1A1A1A",
                  overflow: "hidden",
                }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.opacity = "0")}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: TEXT3,
                      fontSize: "10px",
                    }}
                  >
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      color: TEXT,
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.title || "(제목 없음)"}
                  </span>
                  {item.featured && (
                    <span
                      style={{
                        background: "#161616",
                        border: BORDER2,
                        color: TEXT2,
                        fontSize: "9px",
                        padding: "2px 8px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      Featured {item.order ? `#${item.order}` : ""}
                    </span>
                  )}
                  {item.hidden && (
                    <span
                      style={{
                        background: "rgba(229,62,62,0.12)",
                        border: "1px solid rgba(229,62,62,0.35)",
                        color: "#E53E3E",
                        fontSize: "9px",
                        padding: "2px 8px",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      숨김
                    </span>
                  )}
                </div>
                <div style={{ color: TEXT3, fontSize: "12px" }}>
                  {item.client} · {item.category} · {item.year}
                </div>
                <div style={{ color: "#2A2A2A", fontSize: "11px", marginTop: "3px" }}>
                  /{item.slug}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                <button
                  onClick={() => {
                    setEditForm(toForm(item));
                    setIsAdding(false);
                  }}
                  style={{
                    background: "none",
                    border: BORDER2,
                    color: TEXT,
                    fontFamily: F,
                    fontSize: "12px",
                    padding: "6px 16px",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  수정
                </button>

                {deleteConfirm === item.id ? (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        background: "#CC2222",
                        border: "none",
                        color: "#fff",
                        fontFamily: F,
                        fontSize: "12px",
                        padding: "6px 14px",
                        cursor: "pointer",
                      }}
                    >
                      삭제 확인
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{
                        background: "none",
                        border: BORDER2,
                        color: TEXT3,
                        fontFamily: F,
                        fontSize: "12px",
                        padding: "6px 12px",
                        cursor: "pointer",
                      }}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    style={{
                      background: "none",
                      border: BORDER2,
                      color: TEXT3,
                      fontFamily: F,
                      fontSize: "12px",
                      padding: "6px 16px",
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: TEXT3,
              fontSize: "13px",
              letterSpacing: "0.06em",
            }}
          >
            프로젝트가 없습니다.
            <br />
            <button
              onClick={() => { setAddForm(blankForm()); setIsAdding(true); }}
              style={{
                background: "none",
                border: "none",
                color: TEXT2,
                fontFamily: F,
                fontSize: "13px",
                cursor: "pointer",
                marginTop: "12px",
                textDecoration: "underline",
              }}
            >
              첫 번째 프로젝트를 추가하세요
            </button>
          </div>
        )}
      </div>

      {/* ─── Edit Modal ────────────────────────────────── */}
      {editForm && (
        <EditModal
          form={editForm}
          setForm={setEditForm as (f: FormState) => void}
          onSave={handleSaveEdit}
          onCancel={() => setEditForm(null)}
          isAdding={false}
          allItems={items}
        />
      )}

      {/* ─── Add Modal ─────────────────────────────────── */}
      {isAdding && (
        <EditModal
          form={addForm}
          setForm={setAddForm}
          onSave={handleSaveAdd}
          onCancel={() => setIsAdding(false)}
          isAdding={true}
          allItems={items}
        />
      )}
      </>}
    </div>
  );
}
