// =============================================================================
// PM Analytics — 대시보드 지표 집계 (순수 함수)
//
// 이벤트 배열(AnalyticsEvent[])을 받아 KPI / 시계열 / 퍼널 / 분포를 계산.
// Supabase·로컬 어느 소스에서 온 이벤트든 동일하게 동작.
// =============================================================================

import type { AnalyticsEvent } from "./types";
import { EVENT_NAMES } from "./types";

export interface Kpis {
  uniqueVisitors: number;
  sessions: number;
  pageviews: number;
  pagesPerSession: number;
  /** 페이지뷰 1회로 끝난 세션 비율 */
  bounceRate: number;
  /** contact_submit 발생 고유 방문자 수 */
  conversions: number;
  /** conversions / uniqueVisitors */
  conversionRate: number;
}

export function calcKpis(events: AnalyticsEvent[]): Kpis {
  const pv = events.filter((e) => e.event === EVENT_NAMES.PAGE_VIEW);
  const visitors = new Set(events.map((e) => e.visitor_id));
  const sessions = new Set(events.map((e) => e.session_id));

  const pvBySession = new Map<string, number>();
  for (const e of pv) {
    pvBySession.set(e.session_id, (pvBySession.get(e.session_id) ?? 0) + 1);
  }
  const sessionsWithPv = pvBySession.size;
  const bounced = Array.from(pvBySession.values()).filter((n) => n === 1).length;

  const converters = new Set(
    events.filter((e) => e.event === EVENT_NAMES.CONTACT_SUBMIT).map((e) => e.visitor_id)
  );

  return {
    uniqueVisitors: visitors.size,
    sessions: sessions.size,
    pageviews: pv.length,
    pagesPerSession: sessionsWithPv ? pv.length / sessionsWithPv : 0,
    bounceRate: sessionsWithPv ? bounced / sessionsWithPv : 0,
    conversions: converters.size,
    conversionRate: visitors.size ? converters.size / visitors.size : 0,
  };
}

export interface DailyPoint {
  date: string; // MM.DD
  visitors: number;
  pageviews: number;
  conversions: number;
}

/** 최근 N일 일별 시계열 (빈 날짜 0으로 채움) */
export function dailySeries(events: AnalyticsEvent[], days: number): DailyPoint[] {
  const byDay = new Map<string, { visitors: Set<string>; pageviews: number; conversions: number }>();
  const dayKey = (iso: string) => iso.slice(0, 10);

  for (const e of events) {
    const key = dayKey(e.created_at);
    if (!byDay.has(key)) byDay.set(key, { visitors: new Set(), pageviews: 0, conversions: 0 });
    const d = byDay.get(key)!;
    d.visitors.add(e.visitor_id);
    if (e.event === EVENT_NAMES.PAGE_VIEW) d.pageviews += 1;
    if (e.event === EVENT_NAMES.CONTACT_SUBMIT) d.conversions += 1;
  }

  const out: DailyPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    out.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`,
      visitors: row ? row.visitors.size : 0,
      pageviews: row ? row.pageviews : 0,
      conversions: row ? row.conversions : 0,
    });
  }
  return out;
}

export interface NamedCount {
  name: string;
  count: number;
}

/** 페이지별 조회수 상위 N */
export function topPages(events: AnalyticsEvent[], limit = 8): NamedCount[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    if (e.event !== EVENT_NAMES.PAGE_VIEW) continue;
    counts.set(e.path, (counts.get(e.path) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** 디바이스 분포 (고유 방문자 기준) */
export function deviceBreakdown(events: AnalyticsEvent[]): NamedCount[] {
  const byDevice = new Map<string, Set<string>>();
  for (const e of events) {
    if (!byDevice.has(e.device)) byDevice.set(e.device, new Set());
    byDevice.get(e.device)!.add(e.visitor_id);
  }
  return Array.from(byDevice.entries())
    .map(([name, set]) => ({ name, count: set.size }))
    .sort((a, b) => b.count - a.count);
}

/** 유입 채널 분포 (세션 기준, "" → direct) */
export function referrerBreakdown(events: AnalyticsEvent[], limit = 6): NamedCount[] {
  const bySession = new Map<string, string>();
  for (const e of events) {
    if (!bySession.has(e.session_id)) bySession.set(e.session_id, e.referrer || "direct");
  }
  const counts = new Map<string, number>();
  for (const ref of bySession.values()) {
    counts.set(ref, (counts.get(ref) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export interface FunnelStep {
  label: string;
  visitors: number;
  /** 첫 단계 대비 비율 */
  pctOfTop: number;
  /** 직전 단계 대비 전환율 */
  stepRate: number;
}

/**
 * 핵심 전환 퍼널 (고유 방문자 기준):
 * 방문 → Work 탐색 → 프로젝트 상세 → Contact 방문 → 문의 제출
 */
export function conversionFunnel(events: AnalyticsEvent[]): FunnelStep[] {
  const all = new Set<string>();
  const work = new Set<string>();
  const detail = new Set<string>();
  const contact = new Set<string>();
  const submit = new Set<string>();

  for (const e of events) {
    all.add(e.visitor_id);
    if (e.event === EVENT_NAMES.PAGE_VIEW) {
      if (e.path === "/work") work.add(e.visitor_id);
      if (e.path.startsWith("/work/")) detail.add(e.visitor_id);
      if (e.path === "/contact") contact.add(e.visitor_id);
    }
    if (e.event === EVENT_NAMES.CONTACT_SUBMIT) submit.add(e.visitor_id);
  }

  const steps = [
    { label: "사이트 방문", set: all },
    { label: "Work 탐색", set: work },
    { label: "프로젝트 상세", set: detail },
    { label: "Contact 방문", set: contact },
    { label: "문의 제출", set: submit },
  ];

  const top = steps[0].set.size;
  return steps.map((s, i) => {
    const prev = i === 0 ? s.set.size : steps[i - 1].set.size;
    return {
      label: s.label,
      visitors: s.set.size,
      pctOfTop: top ? s.set.size / top : 0,
      stepRate: i === 0 ? 1 : prev ? s.set.size / prev : 0,
    };
  });
}
