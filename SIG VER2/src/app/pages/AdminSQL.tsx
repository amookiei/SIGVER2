// =============================================================================
// PM Admin — SQL 콘솔
// Supabase RPC(run_admin_query)를 통해 읽기 전용 SELECT 쿼리를 실행.
// 자주 쓰는 PM 분석 쿼리 프리셋 포함.
// =============================================================================

import { useState } from "react";
import { supabase, isSupabaseReady } from "../../lib/supabase";
import {
  F,
  TEXT,
  TEXT2,
  TEXT3,
  GREEN,
  RED,
  Card,
  SectionTitle,
  Btn,
  downloadCsv,
  fmtNum,
} from "../components/adminKit";

interface Preset {
  label: string;
  sql: string;
}

const PRESETS: Preset[] = [
  {
    label: "일별 방문자·PV",
    sql: `SELECT date_trunc('day', created_at)::date AS day,
       count(DISTINCT visitor_id) AS visitors,
       count(*) FILTER (WHERE event = 'page_view') AS pageviews,
       count(*) FILTER (WHERE event = 'contact_submit') AS inquiries
FROM analytics_events
WHERE created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC`,
  },
  {
    label: "인기 페이지 TOP 10",
    sql: `SELECT path,
       count(*) AS pageviews,
       count(DISTINCT visitor_id) AS visitors
FROM analytics_events
WHERE event = 'page_view'
  AND created_at > now() - interval '30 days'
GROUP BY path
ORDER BY pageviews DESC
LIMIT 10`,
  },
  {
    label: "전환 퍼널",
    sql: `SELECT
  count(DISTINCT visitor_id) AS visited,
  count(DISTINCT visitor_id) FILTER (WHERE path LIKE '/work%' AND event = 'page_view') AS viewed_work,
  count(DISTINCT visitor_id) FILTER (WHERE path = '/contact' AND event = 'page_view') AS viewed_contact,
  count(DISTINCT visitor_id) FILTER (WHERE event = 'contact_submit') AS submitted
FROM analytics_events
WHERE created_at > now() - interval '30 days'`,
  },
  {
    label: "실험별 노출·전환",
    sql: `WITH exposures AS (
  SELECT props->>'experiment' AS experiment,
         props->>'variant' AS variant,
         visitor_id
  FROM analytics_events
  WHERE event = 'experiment_exposure'
  GROUP BY 1, 2, 3
), goals AS (
  SELECT DISTINCT visitor_id FROM analytics_events WHERE event = 'contact_submit'
)
SELECT e.experiment, e.variant,
       count(*) AS exposures,
       count(g.visitor_id) AS conversions,
       round(100.0 * count(g.visitor_id) / nullif(count(*), 0), 2) AS cvr_pct
FROM exposures e
LEFT JOIN goals g ON g.visitor_id = e.visitor_id
GROUP BY 1, 2
ORDER BY 1, 2`,
  },
  {
    label: "디바이스 분포",
    sql: `SELECT device,
       count(DISTINCT visitor_id) AS visitors,
       count(DISTINCT session_id) AS sessions
FROM analytics_events
WHERE created_at > now() - interval '30 days'
GROUP BY device
ORDER BY visitors DESC`,
  },
  {
    label: "유입 채널",
    sql: `SELECT coalesce(nullif(referrer, ''), 'direct') AS channel,
       count(DISTINCT session_id) AS sessions,
       count(DISTINCT visitor_id) FILTER (WHERE event = 'contact_submit') AS conversions
FROM analytics_events
WHERE created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY sessions DESC`,
  },
  {
    label: "NPS 응답",
    sql: `SELECT created_at,
       (props->>'score')::int AS score,
       props->>'comment' AS comment,
       path, device
FROM analytics_events
WHERE event = 'survey_response'
ORDER BY created_at DESC
LIMIT 100`,
  },
];

const MIGRATION_HINT = `-- Supabase SQL Editor에서 supabase/pm_analytics_migration.sql 전체를 실행하세요.
-- SQL 콘솔에 필요한 함수만 먼저 만들려면:
CREATE OR REPLACE FUNCTION run_admin_query(query_sql text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF query_sql !~* '^\\s*(select|with)\\y' OR query_sql ~ ';' THEN
    RAISE EXCEPTION 'SELECT 단일 쿼리만 실행할 수 있습니다';
  END IF;
  EXECUTE format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (%s) t', query_sql)
  INTO result;
  RETURN result;
END $$;`;

type Row = Record<string, unknown>;

export function AdminSQL() {
  const [sql, setSql] = useState<string>(PRESETS[0].sql);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const run = async () => {
    setError(null);
    setRows(null);
    setElapsed(null);

    const trimmed = sql.trim().replace(/;\s*$/, "");
    if (!/^(select|with)\b/i.test(trimmed)) {
      setError("안전을 위해 SELECT / WITH 로 시작하는 읽기 쿼리만 실행할 수 있습니다.");
      return;
    }
    if (trimmed.includes(";")) {
      setError("복수 구문(;)은 실행할 수 없습니다. 단일 SELECT 쿼리만 허용됩니다.");
      return;
    }
    if (!supabase) {
      setError("Supabase가 연결되지 않았습니다. 환경변수(VITE_SUPABASE_URL / ANON_KEY)를 설정하세요.");
      return;
    }

    setRunning(true);
    const start = performance.now();
    try {
      const { data, error: rpcError } = await supabase.rpc("run_admin_query", {
        query_sql: trimmed,
      });
      if (rpcError) throw new Error(rpcError.message);
      setRows((data ?? []) as Row[]);
      setElapsed(Math.round(performance.now() - start));
    } catch (err) {
      setError(err instanceof Error ? err.message : "쿼리 실행 실패");
    } finally {
      setRunning(false);
    }
  };

  const columns = rows && rows.length > 0 ? Array.from(new Set(rows.flatMap((r) => Object.keys(r)))) : [];

  const resultsCsv = () => {
    if (!rows) return "";
    const header = columns.join(",");
    const body = rows.map((r) =>
      columns.map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`).join(",")
    );
    return [header, ...body].join("\n");
  };

  return (
    <div style={{ padding: "40px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      {!isSupabaseReady && (
        <Card style={{ marginBottom: "20px", border: "1px solid #663300" }}>
          <p style={{ fontFamily: F, fontSize: "12px", color: "#CC6622", margin: 0, lineHeight: 1.8 }}>
            ⚠ Supabase 미연결 — SQL 콘솔은 원격 DB에서만 동작합니다. 배포 환경변수를 설정하고
            아래 마이그레이션을 실행하세요. (지표·실험·리서치 탭은 로컬 데이터로도 동작합니다.)
          </p>
        </Card>
      )}

      {/* Presets */}
      <SectionTitle>PM 분석 쿼리 프리셋</SectionTitle>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setSql(p.sql)}
            style={{
              background: sql === p.sql ? "#FAFAFA" : "none",
              border: "1px solid #2A2A2A",
              color: sql === p.sql ? "#0D0D0D" : TEXT2,
              fontFamily: F,
              fontSize: "11px",
              padding: "6px 12px",
              cursor: "pointer",
              letterSpacing: "0.04em",
              fontWeight: sql === p.sql ? 700 : 400,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <Card style={{ marginBottom: "16px", padding: 0 }}>
        <textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: "220px",
            background: "#0A0A0A",
            border: "none",
            outline: "none",
            color: "#88CCAA",
            fontFamily: "monospace",
            fontSize: "12px",
            lineHeight: 1.7,
            padding: "16px 18px",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: "1px solid #1F1F1F" }}>
          <span style={{ fontFamily: F, fontSize: "11px", color: TEXT3 }}>
            읽기 전용 · SELECT/WITH 단일 구문만 허용 · 최대 500행 반환
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {elapsed !== null && rows && (
              <span style={{ fontFamily: F, fontSize: "11px", color: GREEN }}>
                {fmtNum(rows.length)}행 · {elapsed}ms
              </span>
            )}
            <Btn small onClick={() => downloadCsv("sig-query-result.csv", resultsCsv())} disabled={!rows || rows.length === 0}>
              결과 CSV
            </Btn>
            <Btn primary onClick={run} disabled={running || !isSupabaseReady}>
              {running ? "실행 중…" : "▶ 실행"}
            </Btn>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card style={{ marginBottom: "16px", border: `1px solid ${RED}` }}>
          <p style={{ fontFamily: F, fontSize: "12px", color: RED, margin: 0 }}>{error}</p>
          {(error.includes("run_admin_query") || error.toLowerCase().includes("function")) && (
            <details style={{ marginTop: "10px" }}>
              <summary style={{ fontFamily: F, fontSize: "11px", color: TEXT3, cursor: "pointer" }}>
                → run_admin_query 함수가 없다면 Supabase SQL Editor에서 아래를 실행하세요
              </summary>
              <pre style={{ fontFamily: "monospace", fontSize: "11px", color: "#88CCAA", background: "#0A0A0A", border: "1px solid #1F1F1F", padding: "12px 14px", marginTop: "8px", whiteSpace: "pre-wrap", userSelect: "all" }}>
                {MIGRATION_HINT}
              </pre>
            </details>
          )}
        </Card>
      )}

      {/* Results */}
      {rows && rows.length === 0 && !error && (
        <Card>
          <p style={{ fontFamily: F, fontSize: "12px", color: TEXT3, margin: 0 }}>결과가 없습니다 (0행).</p>
        </Card>
      )}
      {rows && rows.length > 0 && (
        <Card style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c}
                    style={{
                      fontFamily: F,
                      fontSize: "10px",
                      color: TEXT3,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textAlign: "left",
                      padding: "10px 14px",
                      borderBottom: "1px solid #1F1F1F",
                      background: "#0A0A0A",
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 500).map((r, i) => (
                <tr key={i}>
                  {columns.map((c) => {
                    const v = r[c];
                    const rendered =
                      v === null || v === undefined
                        ? "—"
                        : typeof v === "object"
                          ? JSON.stringify(v)
                          : String(v);
                    return (
                      <td
                        key={c}
                        style={{
                          fontFamily: F,
                          fontSize: "12px",
                          color: v === null || v === undefined ? TEXT3 : TEXT,
                          padding: "8px 14px",
                          borderBottom: "1px solid #161616",
                          maxWidth: "320px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={rendered}
                      >
                        {rendered}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Schema reference */}
      <Card style={{ marginTop: "20px" }}>
        <SectionTitle>스키마 참고</SectionTitle>
        <pre style={{ fontFamily: "monospace", fontSize: "11px", color: TEXT2, background: "#0A0A0A", border: "1px solid #1F1F1F", padding: "14px 16px", margin: 0, overflowX: "auto", lineHeight: 1.8 }}>
{`analytics_events (id, event, path, visitor_id, session_id, device, referrer, props jsonb, created_at)
  · event: page_view | cta_click | contact_submit | experiment_exposure | survey_response
experiments      (id, config jsonb)  — A/B 실험 정의
portfolio_items  (id, slug, title, client, category, year, featured, …)
site_settings    (key, value jsonb, updated_at)`}
        </pre>
      </Card>
    </div>
  );
}
