import { useState } from "react";
import { useAbout } from "../context/AboutContext";
import { supabase } from "../../lib/supabase";
import type { AboutData, TeamMember, StatItem, ValueItem } from "../data/about";

// ─── Design tokens (Admin 스타일과 동일) ─────────────────────────────────────
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
const BG = "#0D0D0D";
const SURFACE = "#111111";
const BORDER = "1px solid #1F1F1F";
const BORDER2 = "1px solid #2A2A2A";
const TEXT = "#FAFAFA";
const TEXT2 = "#888888";
const TEXT3 = "#444444";

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
const btnBase: React.CSSProperties = {
  fontFamily: F,
  fontSize: "11px",
  letterSpacing: "0.08em",
  cursor: "pointer",
  padding: "7px 16px",
  border: BORDER2,
  background: "none",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function AdminAbout() {
  const { about, updateAbout, dbStatus, dbError } = useAbout();

  // 로컬 draft 상태 — 저장 버튼 눌러야 반영
  const [draft, setDraft] = useState<AboutData>(() => JSON.parse(JSON.stringify(about)));
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  // draft를 context → About 페이지 원본과 다시 동기화
  function discardDraft() {
    setDraft(JSON.parse(JSON.stringify(about)));
  }

  async function handleSave() {
    setSaving(true);
    await updateAbout(draft);
    setSaving(false);
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 2200);
  }

  // ─── 이미지 업로드 ────────────────────────────────────────────────────────
  async function handleUpload(
    file: File,
    key: string,
    onSuccess: (url: string) => void
  ) {
    if (!file.type.match(/jpeg|jpg/)) {
      setUploadError("JPG 파일만 업로드 가능합니다.");
      return;
    }
    if (!supabase) {
      setUploadError("Supabase 미연결. URL을 직접 입력해 주세요.");
      return;
    }
    setUploading((p) => ({ ...p, [key]: true }));
    setUploadError(null);

    const path = `team/${key}-${Date.now()}.jpg`;
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

  // ─── Studio 헬퍼 ─────────────────────────────────────────────────────────
  function setStudio<K extends keyof typeof draft.studio>(k: K, v: string) {
    setDraft((d) => ({ ...d, studio: { ...d.studio, [k]: v } }));
  }

  // ─── Stats 헬퍼 ──────────────────────────────────────────────────────────
  function setStat(i: number, field: keyof StatItem, v: string) {
    setDraft((d) => {
      const next = [...d.stats];
      next[i] = { ...next[i], [field]: v };
      return { ...d, stats: next };
    });
  }
  function addStat() {
    setDraft((d) => ({ ...d, stats: [...d.stats, { num: "", label: "" }] }));
  }
  function removeStat(i: number) {
    setDraft((d) => ({ ...d, stats: d.stats.filter((_, idx) => idx !== i) }));
  }

  // ─── Values 헬퍼 ─────────────────────────────────────────────────────────
  function setValue(i: number, field: keyof ValueItem, v: string) {
    setDraft((d) => {
      const next = [...d.values];
      next[i] = { ...next[i], [field]: v };
      return { ...d, values: next };
    });
  }
  function addValue() {
    const n = draft.values.length + 1;
    setDraft((d) => ({
      ...d,
      values: [
        ...d.values,
        { id: uid(), num: String(n).padStart(2, "0"), title: "", desc: "" },
      ],
    }));
  }
  function removeValue(i: number) {
    setDraft((d) => ({ ...d, values: d.values.filter((_, idx) => idx !== i) }));
  }

  // ─── Team 헬퍼 ───────────────────────────────────────────────────────────
  function setMember(i: number, field: keyof TeamMember, v: string) {
    setDraft((d) => {
      const next = [...d.team];
      next[i] = { ...next[i], [field]: v };
      return { ...d, team: next };
    });
  }
  function addMember() {
    setDraft((d) => ({
      ...d,
      team: [
        ...d.team,
        { id: uid(), name: "", role: "", desc: "", image: "" },
      ],
    }));
  }
  function removeMember(i: number) {
    setDraft((d) => ({ ...d, team: d.team.filter((_, idx) => idx !== i) }));
  }

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "40px 32px", maxWidth: "860px", margin: "0 auto" }}>

      {/* DB 오류 배너 */}
      {dbStatus === "error" && dbError && (
        <div style={{ background: "#1A0A00", border: "1px solid #663300", padding: "12px 16px", marginBottom: "28px" }}>
          <p style={{ fontFamily: F, fontSize: "12px", color: "#CC6622", margin: 0 }}>
            ⚠ DB 오류 — {dbError}
          </p>
          {dbError.includes("site_settings") && (
            <pre style={{ fontFamily: "monospace", fontSize: "11px", color: "#88CCAA", background: "#0A0A0A", padding: "10px", marginTop: "8px", userSelect: "all" }}>
{`CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "anon_write"  ON site_settings FOR ALL TO anon USING (true) WITH CHECK (true);`}
            </pre>
          )}
        </div>
      )}

      {/* 이미지 업로드 오류 */}
      {uploadError && (
        <div style={{ background: "#1A0000", border: "1px solid #440000", padding: "10px 14px", marginBottom: "20px" }}>
          <span style={{ fontFamily: F, fontSize: "12px", color: "#FF5555" }}>{uploadError}</span>
        </div>
      )}

      {/* ── 1. 스튜디오 소개 ─────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>스튜디오 소개</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={labelStyle}>헤드라인 1 (채워진 텍스트)</label>
            <input
              style={inputStyle}
              value={draft.studio.headline1}
              onChange={(e) => setStudio("headline1", e.target.value)}
              placeholder="WE MAKE"
            />
          </div>
          <div>
            <label style={labelStyle}>헤드라인 2 (아웃라인 텍스트)</label>
            <input
              style={inputStyle}
              value={draft.studio.headline2}
              onChange={(e) => setStudio("headline2", e.target.value)}
              placeholder="BRANDS MOVE."
            />
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>설명 (좌 — 주요 소개)</label>
          <textarea
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={draft.studio.description1}
            onChange={(e) => setStudio("description1", e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>설명 (우 — 보조 소개)</label>
          <textarea
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={draft.studio.description2}
            onChange={(e) => setStudio("description2", e.target.value)}
          />
        </div>
      </section>

      {/* ── 2. 수치 정보 ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>수치 정보 (Stats)</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          {draft.stats.map((stat, i) => (
            <div key={i} style={{ background: SURFACE, border: BORDER, padding: "14px 16px", position: "relative" }}>
              <button
                onClick={() => removeStat(i)}
                style={{ ...btnBase, position: "absolute", top: "8px", right: "8px", padding: "2px 8px", fontSize: "10px", color: TEXT3, border: "none" }}
              >
                ✕
              </button>
              <label style={labelStyle}>숫자</label>
              <input
                style={{ ...inputStyle, marginBottom: "10px", fontWeight: 700, fontSize: "22px", textAlign: "center" }}
                value={stat.num}
                onChange={(e) => setStat(i, "num", e.target.value)}
                placeholder="8+"
              />
              <label style={labelStyle}>레이블</label>
              <input
                style={{ ...inputStyle, textAlign: "center" }}
                value={stat.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
                placeholder="Years"
              />
            </div>
          ))}
        </div>

        <button onClick={addStat} style={{ ...btnBase, color: TEXT2 }}>
          + 수치 추가
        </button>
      </section>

      {/* ── 3. Our Values ────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>Our Values</p>

        {draft.values.map((v, i) => (
          <div key={v.id} style={{ background: SURFACE, border: BORDER, padding: "20px 20px 16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "64px", flexShrink: 0 }}>
                <label style={labelStyle}>번호</label>
                <input
                  style={inputStyle}
                  value={v.num}
                  onChange={(e) => setValue(i, "num", e.target.value)}
                  placeholder="01"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>제목</label>
                <input
                  style={inputStyle}
                  value={v.title}
                  onChange={(e) => setValue(i, "title", e.target.value)}
                  placeholder="본질에 집중"
                />
              </div>
              <button
                onClick={() => removeValue(i)}
                style={{ ...btnBase, alignSelf: "flex-end", color: TEXT3, padding: "8px 12px" }}
              >
                삭제
              </button>
            </div>
            <label style={labelStyle}>설명</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={v.desc}
              onChange={(e) => setValue(i, "desc", e.target.value)}
            />
          </div>
        ))}

        <button onClick={addValue} style={{ ...btnBase, color: TEXT2 }}>
          + Value 추가
        </button>
      </section>

      {/* ── 4. Team ──────────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "48px" }}>
        <p style={sectionHead}>Team 멤버</p>

        {draft.team.map((member, i) => (
          <div key={member.id} style={{ background: SURFACE, border: BORDER, padding: "20px", marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>

              {/* 이미지 프리뷰 + 업로드 */}
              <div style={{ flexShrink: 0, width: "100px" }}>
                {member.image && (
                  <img
                    src={member.image}
                    alt={member.name}
                    style={{ width: "100px", height: "133px", objectFit: "cover", filter: "grayscale(1)", marginBottom: "8px", display: "block" }}
                  />
                )}
                <label
                  style={{
                    display: "block",
                    background: "none",
                    border: BORDER2,
                    color: uploading[member.id] ? TEXT3 : TEXT2,
                    fontFamily: F,
                    fontSize: "10px",
                    padding: "6px 0",
                    cursor: uploading[member.id] ? "default" : "pointer",
                    letterSpacing: "0.06em",
                    textAlign: "center",
                    marginBottom: "6px",
                  }}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        handleUpload(file, `member-${member.id}`, (url) => setMember(i, "image", url));
                      e.target.value = "";
                    }}
                  />
                  {uploading[member.id] ? "업로드 중…" : "JPG 업로드"}
                </label>
              </div>

              {/* 텍스트 필드 */}
              <div style={{ flex: 1, display: "grid", gap: "10px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={labelStyle}>이름</label>
                    <input
                      style={inputStyle}
                      value={member.name}
                      onChange={(e) => setMember(i, "name", e.target.value)}
                      placeholder="김지훈"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>직급 / 역할</label>
                    <input
                      style={inputStyle}
                      value={member.role}
                      onChange={(e) => setMember(i, "role", e.target.value)}
                      placeholder="Creative Director"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>이미지 URL (직접 입력)</label>
                  <input
                    style={inputStyle}
                    value={member.image}
                    onChange={(e) => setMember(i, "image", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label style={labelStyle}>설명</label>
                  <textarea
                    style={{ ...inputStyle, minHeight: "56px", resize: "vertical" }}
                    value={member.desc}
                    onChange={(e) => setMember(i, "desc", e.target.value)}
                  />
                </div>
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={() => removeMember(i)}
                style={{ ...btnBase, color: TEXT3, flexShrink: 0, padding: "6px 12px" }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}

        <button onClick={addMember} style={{ ...btnBase, color: TEXT2 }}>
          + 멤버 추가
        </button>
      </section>

      {/* ── 저장 액션 ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: BG,
          borderTop: BORDER,
          padding: "16px 0",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...btnBase,
            background: saving ? "#222" : TEXT,
            color: BG,
            border: "none",
            padding: "11px 28px",
            fontWeight: 700,
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? "저장 중…" : "About 페이지 저장"}
        </button>

        <button
          onClick={discardDraft}
          style={{ ...btnBase, color: TEXT2 }}
        >
          변경 취소
        </button>

        {saveOk && (
          <span style={{ fontFamily: F, fontSize: "12px", color: "#4CAF50", letterSpacing: "0.04em" }}>
            ✓ 저장 완료
          </span>
        )}

        {dbStatus === "none" && (
          <span style={{ fontFamily: F, fontSize: "11px", color: "#CC4444", letterSpacing: "0.04em" }}>
            ⚠ Supabase 미연결 — 로컬 저장만 됩니다
          </span>
        )}
      </div>
    </div>
  );
}
