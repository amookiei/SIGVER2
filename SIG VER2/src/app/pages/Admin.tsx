import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAdmin } from "../context/AdminContext";
import type { PortfolioItem } from "../data/portfolio";
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
  thumbnail: "",
  heroImage: "",
  gallery: [],
  tagline: "",
  description: "",
  challenge: "",
  solution: "",
  role: "",
  duration: "",
  tags: [],
  liveUrl: "",
  nextProject: "",
};

// ─── Form state (flat, with string versions for tags/gallery) ──
interface FormState extends Omit<PortfolioItem, "tags" | "gallery"> {
  tagsStr: string;
  galleryUrls: string[];
}

function toForm(item: PortfolioItem): FormState {
  const { tags, gallery, ...rest } = item;
  return {
    ...rest,
    tagsStr: tags.join(", "),
    galleryUrls: gallery.length ? [...gallery, ""] : [""],
  };
}

function blankForm(): FormState {
  const { tags: _t, gallery: _g, ...restBlank } = blank;
  return {
    id: 0,
    ...restBlank,
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
    thumbnail: form.thumbnail.trim(),
    heroImage: form.heroImage.trim(),
    gallery: form.galleryUrls.map((u) => u.trim()).filter(Boolean),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    challenge: form.challenge?.trim() || undefined,
    solution: form.solution?.trim() || undefined,
    role: form.role.trim(),
    duration: form.duration.trim(),
    tags: form.tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    liveUrl: form.liveUrl?.trim() || undefined,
    nextProject: form.nextProject?.trim() || undefined,
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
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="hyundai-rebrand"
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
                  썸네일 &nbsp;&nbsp;800 × 600 px &nbsp;·&nbsp; 4:3 &nbsp;·&nbsp; 300 KB 이하<br />
                  히어로 &nbsp;&nbsp;&nbsp;1920 × 1080 px &nbsp;·&nbsp; 16:9 &nbsp;·&nbsp; 800 KB 이하<br />
                  갤러리 &nbsp;&nbsp;1200 × 800 px &nbsp;·&nbsp; 3:2 &nbsp;·&nbsp; 400 KB 이하
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

              {/* 갤러리 */}
              <div style={fieldStyle}>
                <label style={labelStyle}>갤러리 이미지 (1200 × 800)</label>
                {form.galleryUrls.map((url, idx) => (
                  <div key={idx} style={{ marginBottom: "12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <label
                        style={{
                          background: "none",
                          border: BORDER2,
                          color: uploading[`gallery-${idx}`] ? TEXT3 : TEXT2,
                          fontFamily: F,
                          fontSize: "11px",
                          padding: "0 14px",
                          cursor: uploading[`gallery-${idx}`] ? "default" : "pointer",
                          letterSpacing: "0.06em",
                          height: "38px",
                          display: "flex",
                          alignItems: "center",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        <input
                          type="file"
                          accept=".jpg,.jpeg"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file)
                              handleUpload(file, `gallery-${idx}`, (uploadedUrl) =>
                                setGallery(idx, uploadedUrl)
                              );
                            e.target.value = "";
                          }}
                        />
                        {uploading[`gallery-${idx}`] ? "업로드 중…" : "JPG 업로드"}
                      </label>
                      <input
                        style={{ ...inputStyle, flex: 1 }}
                        value={url}
                        onChange={(e) => setGallery(idx, e.target.value)}
                        placeholder="또는 URL 직접 입력"
                      />
                      {form.galleryUrls.length > 1 && (
                        <button
                          onClick={() => removeGalleryRow(idx)}
                          style={{
                            background: "none",
                            border: BORDER2,
                            color: TEXT3,
                            fontFamily: F,
                            fontSize: "12px",
                            padding: "0 10px",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {url && (
                      <img
                        src={url}
                        alt={`gallery-${idx + 1} preview`}
                        style={{
                          marginTop: "6px",
                          height: "60px",
                          objectFit: "cover",
                          display: "block",
                          width: "100%",
                        }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={addGalleryRow}
                  style={{
                    background: "none",
                    border: BORDER2,
                    color: TEXT2,
                    fontFamily: F,
                    fontSize: "11px",
                    padding: "6px 12px",
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                    marginTop: "4px",
                  }}
                >
                  + 이미지 추가
                </button>
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
              <Field label="도전 과제 (Challenge) — 선택">
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={form.challenge ?? ""}
                  onChange={(e) => set("challenge", e.target.value)}
                  placeholder="해결해야 했던 문제나 도전 과제를 설명합니다."
                />
              </Field>
              <Field label="해결 방법 (Solution) — 선택">
                <textarea
                  style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                  value={form.solution ?? ""}
                  onChange={(e) => set("solution", e.target.value)}
                  placeholder="문제를 어떻게 해결했는지 설명합니다."
                />
              </Field>
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
  const { isAdmin, logout, items, loading, dbStatus, updateItem, addItem, deleteItem, resetToDefault } = useAdmin();

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
          <span style={{ color: TEXT3, fontSize: "11px", letterSpacing: "0.06em" }}>
            포트폴리오 관리
          </span>
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

      {/* ─── Content ─────────────────────────────────────── */}
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
    </div>
  );
}
