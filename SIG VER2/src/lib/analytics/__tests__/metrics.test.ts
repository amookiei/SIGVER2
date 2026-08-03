import { describe, it, expect } from "vitest";
import { calcKpis, topPages, deviceBreakdown, conversionFunnel } from "../metrics";
import type { AnalyticsEvent } from "../types";

function ev(partial: Partial<AnalyticsEvent>): AnalyticsEvent {
  return {
    id: Math.random().toString(36),
    event: "page_view",
    path: "/",
    visitor_id: "v1",
    session_id: "s1",
    device: "desktop",
    referrer: "",
    props: {},
    created_at: "2026-08-01T10:00:00Z",
    ...partial,
  };
}

describe("calcKpis", () => {
  it("방문자·세션·PV·이탈률·전환율을 계산한다", () => {
    const events: AnalyticsEvent[] = [
      // v1/s1: PV 2회 (비이탈)
      ev({ visitor_id: "v1", session_id: "s1", path: "/" }),
      ev({ visitor_id: "v1", session_id: "s1", path: "/work" }),
      // v2/s2: PV 1회 (이탈)
      ev({ visitor_id: "v2", session_id: "s2", path: "/" }),
      // v1 전환
      ev({ visitor_id: "v1", session_id: "s1", event: "contact_submit" }),
    ];
    const k = calcKpis(events);
    expect(k.uniqueVisitors).toBe(2);
    expect(k.sessions).toBe(2);
    expect(k.pageviews).toBe(3);
    expect(k.bounceRate).toBeCloseTo(0.5);
    expect(k.conversions).toBe(1);
    expect(k.conversionRate).toBeCloseTo(0.5);
  });

  it("빈 배열에서 0으로 안전하다", () => {
    const k = calcKpis([]);
    expect(k.uniqueVisitors).toBe(0);
    expect(k.bounceRate).toBe(0);
    expect(k.conversionRate).toBe(0);
  });
});

describe("topPages", () => {
  it("PV 수 기준 내림차순 정렬", () => {
    const events = [
      ev({ path: "/work" }),
      ev({ path: "/work" }),
      ev({ path: "/" }),
      ev({ path: "/contact", event: "cta_click" }), // PV 아님 → 제외
    ];
    const pages = topPages(events);
    expect(pages[0]).toEqual({ name: "/work", count: 2 });
    expect(pages.find((p) => p.name === "/contact")).toBeUndefined();
  });
});

describe("deviceBreakdown", () => {
  it("고유 방문자 기준으로 집계한다", () => {
    const events = [
      ev({ visitor_id: "v1", device: "mobile" }),
      ev({ visitor_id: "v1", device: "mobile" }),
      ev({ visitor_id: "v2", device: "desktop" }),
    ];
    const devices = deviceBreakdown(events);
    expect(devices).toHaveLength(2);
    expect(devices.find((d) => d.name === "mobile")?.count).toBe(1);
  });
});

describe("conversionFunnel", () => {
  it("방문→Work→상세→Contact→제출 단계별 고유 방문자를 계산한다", () => {
    const events = [
      // v1: 전체 퍼널 통과
      ev({ visitor_id: "v1", path: "/" }),
      ev({ visitor_id: "v1", path: "/work" }),
      ev({ visitor_id: "v1", path: "/work/project-a" }),
      ev({ visitor_id: "v1", path: "/contact" }),
      ev({ visitor_id: "v1", event: "contact_submit", path: "/contact" }),
      // v2: 홈만 방문
      ev({ visitor_id: "v2", path: "/" }),
    ];
    const funnel = conversionFunnel(events);
    expect(funnel.map((f) => f.visitors)).toEqual([2, 1, 1, 1, 1]);
    expect(funnel[0].pctOfTop).toBe(1);
    expect(funnel[1].stepRate).toBeCloseTo(0.5);
    expect(funnel[4].pctOfTop).toBeCloseTo(0.5);
  });
});
