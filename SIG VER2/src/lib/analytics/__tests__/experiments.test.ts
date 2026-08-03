import { describe, it, expect } from "vitest";
import { fnv1a, assignVariant, computeResults } from "../experiments";
import type { AnalyticsEvent, Experiment } from "../types";

const exp: Experiment = {
  id: "test-exp",
  name: "테스트 실험",
  hypothesis: "B가 낫다",
  status: "running",
  variants: [
    { key: "control", label: "A", weight: 50 },
    { key: "b", label: "B", weight: 50 },
  ],
  goalEvent: "contact_submit",
  createdAt: "2026-01-01T00:00:00Z",
};

function makeEvent(partial: Partial<AnalyticsEvent>): AnalyticsEvent {
  return {
    id: Math.random().toString(36),
    event: "page_view",
    path: "/",
    visitor_id: "v1",
    session_id: "s1",
    device: "desktop",
    referrer: "",
    props: {},
    created_at: "2026-01-02T00:00:00Z",
    ...partial,
  };
}

describe("assignVariant", () => {
  it("같은 방문자는 항상 같은 변형에 배정된다 (결정적)", () => {
    for (let i = 0; i < 20; i++) {
      const vid = `visitor-${i}`;
      const first = assignVariant(exp, vid);
      expect(assignVariant(exp, vid)).toBe(first);
    }
  });

  it("50/50 분배가 대략 균등하다 (±10%p)", () => {
    let control = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      if (assignVariant(exp, `visitor-${i}`) === "control") control++;
    }
    expect(control / N).toBeGreaterThan(0.4);
    expect(control / N).toBeLessThan(0.6);
  });

  it("running이 아니면 첫 변형(control)만 반환", () => {
    const paused = { ...exp, status: "paused" as const };
    for (let i = 0; i < 20; i++) {
      expect(assignVariant(paused, `visitor-${i}`)).toBe("control");
    }
  });

  it("가중치 0인 변형에는 배정되지 않는다", () => {
    const skewed: Experiment = {
      ...exp,
      variants: [
        { key: "control", label: "A", weight: 100 },
        { key: "b", label: "B", weight: 0 },
      ],
    };
    for (let i = 0; i < 100; i++) {
      expect(assignVariant(skewed, `visitor-${i}`)).toBe("control");
    }
  });

  it("fnv1a는 안정적인 해시를 반환한다", () => {
    expect(fnv1a("abc")).toBe(fnv1a("abc"));
    expect(fnv1a("abc")).not.toBe(fnv1a("abd"));
  });
});

describe("computeResults", () => {
  it("노출·전환을 고유 방문자 기준으로 집계하고 유의성을 계산한다", () => {
    const events: AnalyticsEvent[] = [];
    // control: 100명 노출, 10명 전환 / b: 100명 노출, 30명 전환
    for (let i = 0; i < 100; i++) {
      events.push(
        makeEvent({
          event: "experiment_exposure",
          visitor_id: `c-${i}`,
          props: { experiment: "test-exp", variant: "control" },
        })
      );
      events.push(
        makeEvent({
          event: "experiment_exposure",
          visitor_id: `b-${i}`,
          props: { experiment: "test-exp", variant: "b" },
        })
      );
      // 중복 노출은 고유 방문자 1명으로 집계되어야 함
      events.push(
        makeEvent({
          event: "experiment_exposure",
          visitor_id: `c-${i}`,
          props: { experiment: "test-exp", variant: "control" },
        })
      );
    }
    for (let i = 0; i < 10; i++) {
      events.push(makeEvent({ event: "contact_submit", visitor_id: `c-${i}` }));
    }
    for (let i = 0; i < 30; i++) {
      events.push(makeEvent({ event: "contact_submit", visitor_id: `b-${i}` }));
    }

    const [control, b] = computeResults(exp, events);
    expect(control.exposures).toBe(100);
    expect(control.conversions).toBe(10);
    expect(control.rate).toBeCloseTo(0.1);
    expect(control.lift).toBeNull();
    expect(control.pValue).toBeNull();

    expect(b.exposures).toBe(100);
    expect(b.conversions).toBe(30);
    expect(b.rate).toBeCloseTo(0.3);
    expect(b.lift).toBeCloseTo(2.0); // (0.3-0.1)/0.1
    expect(b.pValue).not.toBeNull();
    expect(b.pValue!).toBeLessThan(0.05);
  });

  it("다른 실험의 노출 이벤트는 무시한다", () => {
    const events = [
      makeEvent({
        event: "experiment_exposure",
        visitor_id: "x",
        props: { experiment: "other-exp", variant: "control" },
      }),
    ];
    const [control] = computeResults(exp, events);
    expect(control.exposures).toBe(0);
  });
});
