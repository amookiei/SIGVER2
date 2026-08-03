// =============================================================================
// PM Admin — A/B 테스트 관리
// 실험 CRUD + 결정적 트래픽 분배 + 결과(전환율/lift/p-value) 분석.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listExperiments,
  saveExperiment,
  deleteExperiment,
  computeResults,
} from "../../lib/analytics/experiments";
import { loadEvents } from "../../lib/analytics/tracker";
import type { AnalyticsEvent, Experiment, ExperimentStatus, ExperimentVariant } from "../../lib/analytics/types";
import { EVENT_NAMES } from "../../lib/analytics/types";
import { requiredSampleSize } from "../../lib/analytics/stats";
import {
  F,
  BORDER2,
  TEXT,
  TEXT2,
  TEXT3,
  ACCENT,
  GREEN,
  RED,
  Card,
  SectionTitle,
  Btn,
  Chip,
  SourceBadge,
  inputStyle,
  labelStyle,
  fmtPct,
  fmtNum,
} from "../components/adminKit";

const GOAL_EVENTS = [
  { value: EVENT_NAMES.CONTACT_SUBMIT, label: "contact_submit — 문의 제출" },
  { value: EVENT_NAMES.CTA_CLICK, label: "cta_click — CTA 클릭" },
  { value: EVENT_NAMES.WORK_VIEW, label: "work_view — 프로젝트 상세 조회" },
  { value: EVENT_NAMES.SURVEY_RESPONSE, label: "survey_response — 서베이 응답" },
];

const STATUS_META: Record<ExperimentStatus, { label: string; color: string }> = {
  draft: { label: "초안", color: "#888888" },
  running: { label: "진행 중", color: GREEN },
  paused: { label: "일시정지", color: "#CC6622" },
  completed: { label: "종료", color: "#5B8DEF" },
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function blankExperiment(): Experiment {
  return {
    id: "",
    name: "",
    hypothesis: "",
    status: "draft",
    variants: [
      { key: "control", label: "A · 기존안", weight: 50, payload: "" },
      { key: "b", label: "B · 개선안", weight: 50, payload: "" },
    ],
    goalEvent: EVENT_NAMES.CONTACT_SUBMIT,
    targetPage: "",
    createdAt: new Date().toISOString(),
  };
}

// ─── 실험 편집 폼 ─────────────────────────────────────────
function ExperimentForm({
  initial,
  isNew,
  onSave,
  onCancel,
}: {
  initial: Experiment;
  isNew: boolean;
  onSave: (exp: Experiment) => void;
  onCancel: () => void;
}) {
  const [exp, setExp] = useState<Experiment>(initial);
  const set = <K extends keyof Experiment>(key: K, val: Experiment[K]) =>
    setExp((p) => ({ ...p, [key]: val }));

  const setVariant = (i: number, patch: Partial<ExperimentVariant>) =>
    set(
      "variants",
      exp.variants.map((v, j) => (j === i ? { ...v, ...patch } : v))
    );

  const totalWeight = exp.variants.reduce((s, v) => s + (Number(v.weight) || 0), 0);
  const valid = exp.name.trim() && exp.id.trim() && exp.variants.length >= 2 && totalWeight > 0;

  return (
    <Card style={{ marginBottom: "20px", border: `1px solid ${ACCENT}` }}>
      <SectionTitle>{isNew ? "새 실험 만들기" : `실험 수정 — ${exp.name}`}</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>실험 이름</label>
          <input
            style={inputStyle}
            value={exp.name}
            onChange={(e) => {
              const name = e.target.value;
              setExp((p) => ({ ...p, name, id: isNew ? slugify(name) : p.id }));
            }}
            placeholder="홈 CTA 문구 실험"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>실험 ID (slug, 코드에서 참조)</label>
          <input
            style={{ ...inputStyle, opacity: isNew ? 1 : 0.5 }}
            value={exp.id}
            disabled={!isNew}
            onChange={(e) => set("id", slugify(e.target.value))}
            placeholder="home-cta-copy"
          />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label style={labelStyle}>가설 (Hypothesis)</label>
        <textarea
          style={{ ...inputStyle, minHeight: "56px", resize: "vertical" }}
          value={exp.hypothesis}
          onChange={(e) => set("hypothesis", e.target.value)}
          placeholder="[변경]하면 [지표]가 [예상 폭]만큼 개선될 것이다. 근거: …"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>성공 지표 (Goal Event)</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={exp.goalEvent}
            onChange={(e) => set("goalEvent", e.target.value)}
          >
            {GOAL_EVENTS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>대상 페이지 (표시용)</label>
          <input
            style={inputStyle}
            value={exp.targetPage ?? ""}
            onChange={(e) => set("targetPage", e.target.value)}
            placeholder="/ (홈 하단 CTA)"
          />
        </div>
      </div>

      {/* Variants */}
      <label style={labelStyle}>
        변형 (Variants) — 가중치 합 {totalWeight} 기준으로 트래픽 분배 · 첫 행이 Control
      </label>
      {exp.variants.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
          <input
            style={{ ...inputStyle, flex: "0 0 110px" }}
            value={v.key}
            onChange={(e) => setVariant(i, { key: slugify(e.target.value) || v.key })}
            placeholder="key"
            disabled={!isNew && i === 0}
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={v.label}
            onChange={(e) => setVariant(i, { label: e.target.value })}
            placeholder="라벨 (예: B · 개선안)"
          />
          <input
            style={{ ...inputStyle, flex: "0 0 70px" }}
            type="number"
            min={0}
            value={v.weight}
            onChange={(e) => setVariant(i, { weight: Number(e.target.value) })}
            title="가중치"
          />
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={v.payload ?? ""}
            onChange={(e) => setVariant(i, { payload: e.target.value })}
            placeholder="payload (예: CTA 문구)"
          />
          {exp.variants.length > 2 && i > 0 && (
            <button
              onClick={() => set("variants", exp.variants.filter((_, j) => j !== i))}
              style={{ background: "none", border: "none", color: TEXT3, cursor: "pointer", fontSize: "16px" }}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <div style={{ marginBottom: "20px" }}>
        <Btn
          small
          onClick={() =>
            set("variants", [
              ...exp.variants,
              { key: `v${exp.variants.length + 1}`, label: "", weight: 50, payload: "" },
            ])
          }
        >
          + 변형 추가
        </Btn>
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <Btn primary disabled={!valid} onClick={() => onSave(exp)}>저장</Btn>
        <Btn onClick={onCancel}>취소</Btn>
      </div>
    </Card>
  );
}

// ─── 결과 테이블 ─────────────────────────────────────────
function ResultsTable({ exp, events }: { exp: Experiment; events: AnalyticsEvent[] }) {
  const results = useMemo(() => computeResults(exp, events), [exp, events]);
  const control = results[0];
  const hasData = results.some((r) => r.exposures > 0);

  if (!hasData) {
    return (
      <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, margin: "12px 0 0" }}>
        아직 노출 데이터가 없습니다. 실험을 시작하고 대상 페이지에 방문자가 유입되면 결과가 집계됩니다.
      </p>
    );
  }

  const winner = results
    .slice(1)
    .filter((r) => r.pValue !== null && r.pValue < 0.05 && (r.lift ?? 0) > 0)
    .sort((a, b) => (b.lift ?? 0) - (a.lift ?? 0))[0];

  const needed =
    control && control.exposures > 0 && control.rate > 0
      ? requiredSampleSize(control.rate, 0.15)
      : null;

  const th: React.CSSProperties = {
    fontFamily: F,
    fontSize: "10px",
    color: TEXT3,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textAlign: "right",
    padding: "8px 12px",
    borderBottom: "1px solid #1F1F1F",
  };
  const td: React.CSSProperties = {
    fontFamily: F,
    fontSize: "12px",
    color: TEXT,
    textAlign: "right",
    padding: "9px 12px",
    borderBottom: "1px solid #161616",
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: "left" }}>변형</th>
              <th style={th}>노출 (고유)</th>
              <th style={th}>전환</th>
              <th style={th}>전환율</th>
              <th style={th}>95% CI</th>
              <th style={th}>Lift</th>
              <th style={th}>p-value</th>
              <th style={{ ...th, textAlign: "center" }}>판정</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const sig = r.pValue !== null && r.pValue < 0.05;
              return (
                <tr key={r.variant.key}>
                  <td style={{ ...td, textAlign: "left" }}>
                    <span style={{ color: i === 0 ? TEXT2 : TEXT }}>{r.variant.label || r.variant.key}</span>
                    {r.variant.payload && (
                      <span style={{ color: TEXT3, marginLeft: "8px", fontSize: "11px" }}>
                        "{r.variant.payload}"
                      </span>
                    )}
                  </td>
                  <td style={td}>{fmtNum(r.exposures)}</td>
                  <td style={td}>{fmtNum(r.conversions)}</td>
                  <td style={{ ...td, fontWeight: 700 }}>{fmtPct(r.rate)}</td>
                  <td style={{ ...td, color: TEXT3, fontSize: "11px" }}>
                    {fmtPct(r.ciLow)} ~ {fmtPct(r.ciHigh)}
                  </td>
                  <td style={{ ...td, color: r.lift === null ? TEXT3 : r.lift >= 0 ? GREEN : RED }}>
                    {r.lift === null ? "—" : `${r.lift >= 0 ? "+" : ""}${(r.lift * 100).toFixed(1)}%`}
                  </td>
                  <td style={{ ...td, color: TEXT2 }}>
                    {r.pValue === null ? "—" : r.pValue < 0.001 ? "<0.001" : r.pValue.toFixed(3)}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>
                    {i === 0 ? (
                      <span style={{ color: TEXT3, fontSize: "11px" }}>기준</span>
                    ) : sig ? (
                      <Chip color={(r.lift ?? 0) > 0 ? GREEN : RED}>
                        유의 {(r.lift ?? 0) > 0 ? "승" : "패"}
                      </Chip>
                    ) : (
                      <span style={{ color: TEXT3, fontSize: "11px" }}>표본 부족</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, margin: "12px 0 0", lineHeight: 1.8 }}>
        {winner ? (
          <>
            ✅ <span style={{ color: GREEN }}>{winner.variant.label}</span>이(가) 기준안 대비{" "}
            <span style={{ color: GREEN }}>{fmtPct(winner.lift ?? 0)}</span> 개선 — p={winner.pValue!.toFixed(3)} (95% 신뢰수준에서 유의). 실험 종료 및 승자 적용을 검토하세요.
          </>
        ) : (
          <>
            아직 95% 신뢰수준의 유의미한 차이가 없습니다.
            {needed !== null && (
              <>
                {" "}기준 전환율 {fmtPct(control.rate)}에서 15% 상대 개선을 검출하려면 그룹당 약{" "}
                <span style={{ color: TEXT2 }}>{fmtNum(needed)}명</span> 노출이 필요합니다 (α=0.05, power 80%).
              </>
            )}
          </>
        )}
      </p>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────
export function AdminExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [editing, setEditing] = useState<Experiment | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [exps, data] = await Promise.all([listExperiments(), loadEvents(90)]);
    setExperiments(exps);
    setEvents(data.events);
    setSource(data.source);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSave = async (exp: Experiment) => {
    await saveExperiment(exp);
    setEditing(null);
    refresh();
  };

  const setStatus = async (exp: Experiment, status: ExperimentStatus) => {
    const patch: Partial<Experiment> = { status };
    if (status === "running" && !exp.startedAt) patch.startedAt = new Date().toISOString();
    if (status === "completed") {
      patch.endedAt = new Date().toISOString();
      const decision = prompt(
        "실험 종료 — 의사결정 메모를 남겨주세요 (예: B안 채택, 전 사용자 적용)",
        exp.decision ?? ""
      );
      if (decision !== null) patch.decision = decision;
    }
    await saveExperiment({ ...exp, ...patch });
    refresh();
  };

  return (
    <div style={{ padding: "40px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em" }}>
            총 {experiments.length}개 실험 · 최근 90일 이벤트 기준
          </span>
          <SourceBadge source={source} />
        </div>
        <Btn
          primary
          onClick={() => {
            setEditing(blankExperiment());
            setIsNew(true);
          }}
        >
          + 새 실험
        </Btn>
      </div>

      {editing && (
        <ExperimentForm
          initial={editing}
          isNew={isNew}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {experiments.map((exp) => {
        const meta = STATUS_META[exp.status];
        return (
          <Card key={exp.id} style={{ marginBottom: "14px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontFamily: F, fontSize: "15px", fontWeight: 700, color: TEXT }}>
                    {exp.name}
                  </span>
                  <Chip color={meta.color}>{meta.label}</Chip>
                  <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
                    id: {exp.id} · 목표: {exp.goalEvent}
                    {exp.targetPage && ` · 대상: ${exp.targetPage}`}
                  </span>
                </div>
                {exp.hypothesis && (
                  <p style={{ fontFamily: F, fontSize: "12px", color: TEXT2, margin: 0, lineHeight: 1.7, maxWidth: "640px" }}>
                    💡 {exp.hypothesis}
                  </p>
                )}
                {exp.status === "completed" && exp.decision && (
                  <p style={{ fontFamily: F, fontSize: "12px", color: "#5B8DEF", margin: "6px 0 0" }}>
                    📋 의사결정: {exp.decision}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "6px", flexShrink: 0, flexWrap: "wrap" }}>
                {exp.status !== "running" && exp.status !== "completed" && (
                  <Btn small onClick={() => setStatus(exp, "running")}>▶ 시작</Btn>
                )}
                {exp.status === "running" && (
                  <>
                    <Btn small onClick={() => setStatus(exp, "paused")}>⏸ 일시정지</Btn>
                    <Btn small onClick={() => setStatus(exp, "completed")}>종료</Btn>
                  </>
                )}
                {exp.status === "paused" && (
                  <Btn small onClick={() => setStatus(exp, "completed")}>종료</Btn>
                )}
                <Btn small onClick={() => { setEditing(exp); setIsNew(false); }}>수정</Btn>
                {deleteConfirm === exp.id ? (
                  <>
                    <Btn small danger onClick={async () => { await deleteExperiment(exp.id); setDeleteConfirm(null); refresh(); }}>
                      삭제 확인
                    </Btn>
                    <Btn small onClick={() => setDeleteConfirm(null)}>취소</Btn>
                  </>
                ) : (
                  <Btn small onClick={() => setDeleteConfirm(exp.id)}>삭제</Btn>
                )}
              </div>
            </div>

            {/* Traffic split */}
            <div style={{ display: "flex", height: "6px", marginTop: "14px", border: BORDER2 }}>
              {(() => {
                const total = exp.variants.reduce((s, v) => s + Math.max(0, v.weight), 0) || 1;
                return exp.variants.map((v, i) => (
                  <div
                    key={v.key}
                    title={`${v.label || v.key}: ${Math.round((v.weight / total) * 100)}%`}
                    style={{
                      width: `${(Math.max(0, v.weight) / total) * 100}%`,
                      background: i === 0 ? "#333333" : ["#FF4D00", "#5B8DEF", "#B573F5", "#4CAF50"][(i - 1) % 4],
                    }}
                  />
                ));
              })()}
            </div>

            <ResultsTable exp={exp} events={events} />
          </Card>
        );
      })}

      {experiments.length === 0 && (
        <Card>
          <p style={{ fontFamily: F, fontSize: "13px", color: TEXT3, textAlign: "center", margin: "40px 0" }}>
            실험이 없습니다. "+ 새 실험"으로 첫 A/B 테스트를 만들어 보세요.
          </p>
        </Card>
      )}

      {/* 사용법 안내 */}
      <Card style={{ marginTop: "20px" }}>
        <SectionTitle>실험을 코드에 연결하는 법</SectionTitle>
        <pre
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: "#88CCAA",
            background: "#0A0A0A",
            border: "1px solid #1F1F1F",
            padding: "14px 16px",
            margin: 0,
            overflowX: "auto",
            lineHeight: 1.7,
          }}
        >
{`const { variant, payload, trackGoal } = useExperiment("실험-id", "기본값");

<button onClick={() => trackGoal("cta_click")}>{payload}</button>

// variant: 배정된 변형 키 · payload: 변형에 설정한 문구
// 노출은 자동 기록되며, 같은 방문자는 항상 같은 변형을 봅니다.`}
        </pre>
      </Card>
    </div>
  );
}
