// =============================================================================
// PM Admin — 프로덕트 지표 대시보드
// 방문자/세션/전환 KPI, 트렌드, 전환 퍼널, 페이지·디바이스·유입 분포.
// =============================================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { loadEvents, eventsToCsv } from "../../lib/analytics/tracker";
import type { EventsSource } from "../../lib/analytics/tracker";
import {
  calcKpis,
  dailySeries,
  topPages,
  deviceBreakdown,
  referrerBreakdown,
  conversionFunnel,
} from "../../lib/analytics/metrics";
import {
  F,
  BORDER,
  TEXT,
  TEXT2,
  TEXT3,
  ACCENT,
  CHART_COLORS,
  Card,
  StatCard,
  SectionTitle,
  Btn,
  SourceBadge,
  downloadCsv,
  fmtPct,
  fmtNum,
} from "../components/adminKit";

const RANGES = [7, 14, 30, 90] as const;

const tooltipStyle: React.CSSProperties = {
  background: "#0A0A0A",
  border: "1px solid #2A2A2A",
  fontFamily: F,
  fontSize: "11px",
  color: TEXT,
};

export function AdminDashboard() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<EventsSource>({ events: [], source: "local" });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setData(await loadEvents(days));
    setLoading(false);
  }, [days]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { events, source } = data;
  const kpis = useMemo(() => calcKpis(events), [events]);
  const series = useMemo(() => dailySeries(events, days), [events, days]);
  const pages = useMemo(() => topPages(events), [events]);
  const devices = useMemo(() => deviceBreakdown(events), [events]);
  const referrers = useMemo(() => referrerBreakdown(events), [events]);
  const funnel = useMemo(() => conversionFunnel(events), [events]);

  return (
    <div style={{ padding: "40px 32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", gap: "2px", background: "#0A0A0A", padding: "3px", border: BORDER }}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                style={{
                  fontFamily: F,
                  fontSize: "11px",
                  padding: "5px 14px",
                  border: "none",
                  cursor: "pointer",
                  background: days === r ? TEXT : "none",
                  color: days === r ? "#0D0D0D" : TEXT3,
                  fontWeight: days === r ? 700 : 400,
                }}
              >
                {r}일
              </button>
            ))}
          </div>
          <SourceBadge source={source} />
          {loading && <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>불러오는 중…</span>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Btn small onClick={refresh}>새로고침</Btn>
          <Btn
            small
            onClick={() => downloadCsv(`sig-events-${days}d.csv`, eventsToCsv(events))}
            disabled={events.length === 0}
          >
            CSV 내보내기 ({fmtNum(events.length)}건)
          </Btn>
        </div>
      </div>

      {events.length === 0 && !loading && (
        <Card style={{ marginBottom: "24px" }}>
          <p style={{ fontFamily: F, fontSize: "13px", color: TEXT2, margin: 0, lineHeight: 1.9 }}>
            아직 수집된 이벤트가 없습니다. 공개 사이트를 방문하면 페이지뷰·클릭·전환 이벤트가 자동 수집됩니다.
            <br />
            <span style={{ color: TEXT3, fontSize: "12px" }}>
              Supabase 연결 시 <code>supabase/pm_analytics_migration.sql</code>을 SQL Editor에서 실행하면 모든 기기의 데이터가 통합 수집됩니다.
              미연결 시에는 현재 브라우저의 로컬 데이터만 표시됩니다.
            </span>
          </p>
        </Card>
      )}

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px", marginBottom: "28px" }}>
        <StatCard label="순 방문자" value={fmtNum(kpis.uniqueVisitors)} />
        <StatCard label="세션" value={fmtNum(kpis.sessions)} />
        <StatCard label="페이지뷰" value={fmtNum(kpis.pageviews)} />
        <StatCard label="세션당 PV" value={kpis.pagesPerSession.toFixed(1)} />
        <StatCard label="이탈률" value={fmtPct(kpis.bounceRate)} sub="PV 1회 세션 비율" />
        <StatCard label="문의 전환" value={fmtNum(kpis.conversions)} accent />
        <StatCard label="전환율" value={fmtPct(kpis.conversionRate)} sub="방문자 → 문의" accent />
      </div>

      {/* Trend */}
      <Card style={{ marginBottom: "28px" }}>
        <SectionTitle>일별 트렌드 — 방문자 · 페이지뷰 · 문의</SectionTitle>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#1F1F1F" vertical={false} />
              <XAxis dataKey="date" tick={{ fontFamily: F, fontSize: 10, fill: TEXT3 }} tickLine={false} axisLine={{ stroke: "#1F1F1F" }} interval="preserveStartEnd" />
              <YAxis tick={{ fontFamily: F, fontSize: 10, fill: TEXT3 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#2A2A2A" }} />
              <Legend wrapperStyle={{ fontFamily: F, fontSize: 11, color: TEXT2 }} />
              <Area type="monotone" dataKey="pageviews" name="페이지뷰" fill="rgba(250,250,250,0.06)" stroke="#555555" strokeWidth={1} />
              <Line type="monotone" dataKey="visitors" name="방문자" stroke="#FAFAFA" strokeWidth={2} dot={false} />
              <Bar dataKey="conversions" name="문의" fill={ACCENT} barSize={10} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Funnel + Devices */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "10px", marginBottom: "28px" }}>
        <Card>
          <SectionTitle>전환 퍼널 (고유 방문자)</SectionTitle>
          {funnel.map((step, i) => (
            <div key={step.label} style={{ marginBottom: i === funnel.length - 1 ? 0 : "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontFamily: F, fontSize: "12px", color: TEXT }}>
                  {i + 1}. {step.label}
                </span>
                <span style={{ fontFamily: F, fontSize: "12px", color: TEXT2 }}>
                  {fmtNum(step.visitors)}명
                  {i > 0 && (
                    <span style={{ color: TEXT3, marginLeft: "8px" }}>
                      (직전 대비 {fmtPct(step.stepRate)})
                    </span>
                  )}
                </span>
              </div>
              <div style={{ background: "#0A0A0A", border: "1px solid #1F1F1F", height: "18px" }}>
                <div
                  style={{
                    width: `${Math.max(step.pctOfTop * 100, step.visitors > 0 ? 2 : 0)}%`,
                    height: "100%",
                    background: i === funnel.length - 1 ? ACCENT : "#333333",
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <SectionTitle>디바이스 (순 방문자)</SectionTitle>
          {devices.length === 0 ? (
            <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3 }}>데이터 없음</p>
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={devices} dataKey="count" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2} stroke="#0D0D0D">
                    {devices.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontFamily: F, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Top pages + Referrers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Card>
          <SectionTitle>인기 페이지 (PV)</SectionTitle>
          {pages.length === 0 ? (
            <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3 }}>데이터 없음</p>
          ) : (
            pages.map((p) => {
              const max = pages[0].count;
              return (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: F, fontSize: "12px", color: TEXT, width: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </span>
                  <div style={{ flex: 1, background: "#0A0A0A", height: "10px" }}>
                    <div style={{ width: `${(p.count / max) * 100}%`, height: "100%", background: "#333333" }} />
                  </div>
                  <span style={{ fontFamily: F, fontSize: "11px", color: TEXT2, width: "48px", textAlign: "right" }}>
                    {fmtNum(p.count)}
                  </span>
                </div>
              );
            })
          )}
        </Card>

        <Card>
          <SectionTitle>유입 채널 (세션)</SectionTitle>
          {referrers.length === 0 ? (
            <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3 }}>데이터 없음</p>
          ) : (
            referrers.map((r) => {
              const max = referrers[0].count;
              return (
                <div key={r.name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontFamily: F, fontSize: "12px", color: r.name === "direct" ? TEXT2 : TEXT, width: "45%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}
                  </span>
                  <div style={{ flex: 1, background: "#0A0A0A", height: "10px" }}>
                    <div style={{ width: `${(r.count / max) * 100}%`, height: "100%", background: "#333333" }} />
                  </div>
                  <span style={{ fontFamily: F, fontSize: "11px", color: TEXT2, width: "48px", textAlign: "right" }}>
                    {fmtNum(r.count)}
                  </span>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </div>
  );
}
