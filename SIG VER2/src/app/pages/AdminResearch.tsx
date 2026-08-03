// =============================================================================
// PM Admin — UX 리서치
// NPS 마이크로 서베이 응답 분석 + 위젯 운영 설정.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadEvents } from "../../lib/analytics/tracker";
import { calcNps } from "../../lib/analytics/stats";
import { loadResearchConfig, saveResearchConfig } from "../../lib/analytics/research";
import type { AnalyticsEvent, ResearchConfig } from "../../lib/analytics/types";
import { DEFAULT_RESEARCH_CONFIG, EVENT_NAMES } from "../../lib/analytics/types";
import {
  F,
  TEXT,
  TEXT2,
  TEXT3,
  ACCENT,
  GREEN,
  RED,
  Card,
  StatCard,
  SectionTitle,
  Btn,
  SourceBadge,
  inputStyle,
  labelStyle,
  downloadCsv,
  fmtNum,
} from "../components/adminKit";

interface SurveyRow {
  score: number;
  comment: string;
  page: string;
  device: string;
  created_at: string;
}

function toSurveyRows(events: AnalyticsEvent[]): SurveyRow[] {
  return events
    .filter((e) => e.event === EVENT_NAMES.SURVEY_RESPONSE)
    .map((e) => ({
      score: Number(e.props?.score ?? NaN),
      comment: String(e.props?.comment ?? ""),
      page: String(e.props?.page ?? e.path),
      device: e.device,
      created_at: e.created_at,
    }))
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function AdminResearch() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [source, setSource] = useState<"supabase" | "local">("local");
  const [config, setConfig] = useState<ResearchConfig>(DEFAULT_RESEARCH_CONFIG);
  const [saved, setSaved] = useState(false);

  const refresh = useCallback(async () => {
    const [data, cfg] = await Promise.all([loadEvents(90), loadResearchConfig()]);
    setEvents(data.events);
    setSource(data.source);
    setConfig(cfg);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = useMemo(() => toSurveyRows(events), [events]);
  const nps = useMemo(() => calcNps(rows.map((r) => r.score)), [rows]);
  const withComment = rows.filter((r) => r.comment.trim());

  const distribution = useMemo(() => {
    const dist = Array.from({ length: 11 }, (_, i) => ({ score: i, count: 0 }));
    for (const r of rows) {
      if (r.score >= 0 && r.score <= 10) dist[r.score].count++;
    }
    return dist;
  }, [rows]);
  const maxDist = Math.max(1, ...distribution.map((d) => d.count));

  const handleSaveConfig = async () => {
    await saveResearchConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const scoreColor = (s: number) => (s >= 9 ? GREEN : s >= 7 ? "#CC9922" : RED);

  return (
    <div style={{ padding: "40px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3, letterSpacing: "0.1em" }}>
            최근 90일 · 응답 {fmtNum(nps.total)}건
          </span>
          <SourceBadge source={source} />
        </div>
        <Btn
          small
          disabled={rows.length === 0}
          onClick={() =>
            downloadCsv(
              "sig-survey-responses.csv",
              ["created_at,score,comment,page,device"]
                .concat(
                  rows.map((r) =>
                    [r.created_at, r.score, r.comment, r.page, r.device]
                      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                      .join(",")
                  )
                )
                .join("\n")
            )
          }
        >
          응답 CSV 내보내기
        </Btn>
      </div>

      {/* NPS Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "28px" }}>
        <StatCard
          label="NPS"
          value={nps.total ? String(nps.nps) : "—"}
          sub={nps.total ? (nps.nps >= 30 ? "우수" : nps.nps >= 0 ? "보통" : "개선 필요") : "응답 없음"}
          accent
        />
        <StatCard label="추천 (9-10)" value={fmtNum(nps.promoters)} sub={nps.total ? `${Math.round((nps.promoters / nps.total) * 100)}%` : undefined} />
        <StatCard label="중립 (7-8)" value={fmtNum(nps.passives)} sub={nps.total ? `${Math.round((nps.passives / nps.total) * 100)}%` : undefined} />
        <StatCard label="비추천 (0-6)" value={fmtNum(nps.detractors)} sub={nps.total ? `${Math.round((nps.detractors / nps.total) * 100)}%` : undefined} />
        <StatCard label="코멘트" value={fmtNum(withComment.length)} sub="정성 피드백" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "10px", marginBottom: "28px" }}>
        {/* Distribution */}
        <Card>
          <SectionTitle>점수 분포 (0~10)</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "140px" }}>
            {distribution.map((d) => (
              <div key={d.score} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%", justifyContent: "flex-end" }}>
                {d.count > 0 && (
                  <span style={{ fontFamily: F, fontSize: "10px", color: TEXT2 }}>{d.count}</span>
                )}
                <div
                  style={{
                    width: "100%",
                    height: `${(d.count / maxDist) * 100}%`,
                    minHeight: d.count > 0 ? "4px" : "1px",
                    background: d.count > 0 ? scoreColor(d.score) : "#1A1A1A",
                  }}
                />
                <span style={{ fontFamily: F, fontSize: "10px", color: TEXT3 }}>{d.score}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Widget config */}
        <Card>
          <SectionTitle>서베이 위젯 설정</SectionTitle>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontFamily: F, fontSize: "13px", color: TEXT }}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                style={{ width: "15px", height: "15px", accentColor: ACCENT }}
              />
              공개 사이트에 위젯 노출
            </label>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>질문 문구</label>
            <textarea
              style={{ ...inputStyle, minHeight: "48px", resize: "vertical" }}
              value={config.question}
              onChange={(e) => setConfig({ ...config, question: e.target.value })}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>샘플링 (%)</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={100}
                value={config.samplingPct}
                onChange={(e) => setConfig({ ...config, samplingPct: Math.min(100, Math.max(0, Number(e.target.value))) })}
              />
            </div>
            <div>
              <label style={labelStyle}>노출 지연 (초)</label>
              <input
                style={inputStyle}
                type="number"
                min={0}
                value={config.delaySec}
                onChange={(e) => setConfig({ ...config, delaySec: Math.max(0, Number(e.target.value)) })}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Btn primary onClick={handleSaveConfig}>설정 저장</Btn>
            {saved && <span style={{ fontFamily: F, fontSize: "12px", color: GREEN }}>저장됨 ✓</span>}
          </div>
          <p style={{ fontFamily: F, fontSize: "11px", color: TEXT3, marginTop: "12px", lineHeight: 1.7 }}>
            방문자당 1회만 노출되며, 응답/닫기 후 재노출되지 않습니다.
          </p>
        </Card>
      </div>

      {/* Responses */}
      <Card>
        <SectionTitle>응답 목록 (최신순)</SectionTitle>
        {rows.length === 0 ? (
          <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, margin: "20px 0" }}>
            아직 응답이 없습니다. 위젯이 켜져 있으면 방문자가 공개 사이트에서 응답할 수 있습니다.
          </p>
        ) : (
          rows.slice(0, 50).map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: i === Math.min(rows.length, 50) - 1 ? "none" : "1px solid #161616",
              }}
            >
              <span
                style={{
                  fontFamily: F,
                  fontSize: "15px",
                  fontWeight: 700,
                  color: scoreColor(r.score),
                  width: "32px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {r.score}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: F, fontSize: "13px", color: r.comment ? TEXT : TEXT3, margin: 0, lineHeight: 1.6 }}>
                  {r.comment || "(코멘트 없음)"}
                </p>
                <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
                  {new Date(r.created_at).toLocaleString("ko-KR")} · {r.page} · {r.device}
                </span>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
