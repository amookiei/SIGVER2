// =============================================================================
// PM Analytics — 이벤트 트래커
//
// - 익명 방문자 ID(localStorage) + 세션 ID(30분 미활동 시 갱신)로 이벤트 수집
// - Supabase(analytics_events)가 연결되어 있으면 원격 저장,
//   항상 로컬 링버퍼(localStorage)에도 미러링 → DB 없이도 대시보드 동작
// - /admin 경로는 수집 제외 (내부 트래픽 오염 방지)
// =============================================================================

import { supabase } from "../supabase";
import type { AnalyticsEvent } from "./types";

const VISITOR_KEY = "sig_vid";
const SESSION_KEY = "sig_sid";
const SESSION_TS_KEY = "sig_sid_ts";
const BUFFER_KEY = "sig_analytics_events";

/** 세션 타임아웃 (30분) */
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
/** 로컬 링버퍼 최대 보관 이벤트 수 */
const BUFFER_CAP = 4000;

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** 기기 단위 익명 방문자 ID */
export function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) {
      vid = uuid();
      localStorage.setItem(VISITOR_KEY, vid);
    }
    return vid;
  } catch {
    return "anonymous";
  }
}

/** 세션 ID — 30분 미활동 시 새로 발급 */
export function getSessionId(): string {
  try {
    const now = Date.now();
    const last = Number(sessionStorage.getItem(SESSION_TS_KEY) ?? 0);
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid || now - last > SESSION_TIMEOUT_MS) {
      sid = uuid();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    sessionStorage.setItem(SESSION_TS_KEY, String(now));
    return sid;
  } catch {
    return "session";
  }
}

function getDevice(): string {
  const w = typeof window !== "undefined" ? window.innerWidth : 1280;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getReferrerHost(): string {
  try {
    if (!document.referrer) return "";
    const host = new URL(document.referrer).hostname;
    // 자기 사이트 내부 이동은 direct 취급
    return host === window.location.hostname ? "" : host;
  } catch {
    return "";
  }
}

// ─── 로컬 링버퍼 ─────────────────────────────────────────
export function loadLocalEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function appendLocalEvent(ev: AnalyticsEvent) {
  try {
    const events = loadLocalEvents();
    events.push(ev);
    // 오래된 이벤트부터 버림
    const trimmed = events.length > BUFFER_CAP ? events.slice(events.length - BUFFER_CAP) : events;
    localStorage.setItem(BUFFER_KEY, JSON.stringify(trimmed));
  } catch {
    /* storage full 등은 무시 */
  }
}

export function clearLocalEvents() {
  try {
    localStorage.removeItem(BUFFER_KEY);
  } catch {
    /* ignore */
  }
}

// ─── 이벤트 수집 ─────────────────────────────────────────
/**
 * 이벤트 기록. 실패해도 앱 동작에 영향을 주지 않도록 fire-and-forget.
 */
export function track(event: string, props: Record<string, unknown> = {}): void {
  try {
    const path = typeof window !== "undefined" ? window.location.pathname : "/";
    // 관리자 화면 트래픽은 지표에서 제외
    if (path.startsWith("/admin")) return;

    const ev: AnalyticsEvent = {
      id: uuid(),
      event,
      path,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      device: getDevice(),
      referrer: getReferrerHost(),
      props,
      created_at: new Date().toISOString(),
    };

    appendLocalEvent(ev);

    if (supabase) {
      supabase
        .from("analytics_events")
        .insert({
          id: ev.id,
          event: ev.event,
          path: ev.path,
          visitor_id: ev.visitor_id,
          session_id: ev.session_id,
          device: ev.device,
          referrer: ev.referrer,
          props: ev.props,
          created_at: ev.created_at,
        })
        .then(({ error }) => {
          if (error) console.warn("[analytics]", error.message);
        });
    }
  } catch {
    /* 수집 실패는 조용히 무시 */
  }
}

export function trackPageView(path: string): void {
  track("page_view", { title: typeof document !== "undefined" ? document.title : "", pv_path: path });
}

// ─── 대시보드용 이벤트 로드 (Supabase 우선, 로컬 폴백) ────
export interface EventsSource {
  events: AnalyticsEvent[];
  source: "supabase" | "local";
  error?: string;
}

/**
 * 최근 N일 이벤트 로드. Supabase 연결 시 원격에서, 아니면 로컬 버퍼에서.
 */
export async function loadEvents(days: number): Promise<EventsSource> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("analytics_events")
        .select("*")
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(20000);
      if (error) throw error;
      return { events: (data ?? []) as AnalyticsEvent[], source: "supabase" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      // 테이블 미생성 등 → 로컬 폴백
      return {
        events: loadLocalEvents().filter((e) => e.created_at >= since),
        source: "local",
        error: msg,
      };
    }
  }

  return {
    events: loadLocalEvents().filter((e) => e.created_at >= since),
    source: "local",
  };
}

/** 이벤트 목록 → CSV 문자열 (대시보드 내보내기용) */
export function eventsToCsv(events: AnalyticsEvent[]): string {
  const header = "created_at,event,path,visitor_id,session_id,device,referrer,props";
  const rows = events.map((e) =>
    [
      e.created_at,
      e.event,
      e.path,
      e.visitor_id,
      e.session_id,
      e.device,
      e.referrer,
      JSON.stringify(e.props ?? {}).replace(/"/g, '""'),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}
