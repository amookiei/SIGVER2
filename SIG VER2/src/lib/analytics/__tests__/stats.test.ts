import { describe, it, expect } from "vitest";
import {
  normalCdf,
  twoProportionZTest,
  wilsonInterval,
  requiredSampleSize,
  calcNps,
} from "../stats";

describe("normalCdf", () => {
  it("표준값에서 정확하다", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
    expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3);
    expect(normalCdf(3)).toBeCloseTo(0.99865, 4);
  });
});

describe("twoProportionZTest", () => {
  it("동일 비율이면 p-value ≈ 1", () => {
    const { pValue } = twoProportionZTest(50, 500, 50, 500);
    expect(pValue).toBeCloseTo(1, 5);
  });

  it("명확한 차이는 유의하다 (10% vs 15%, n=1000)", () => {
    const { z, pValue } = twoProportionZTest(100, 1000, 150, 1000);
    expect(Math.abs(z)).toBeGreaterThan(3);
    expect(pValue).toBeLessThan(0.01);
  });

  it("작은 표본의 작은 차이는 유의하지 않다", () => {
    const { pValue } = twoProportionZTest(5, 50, 7, 50);
    expect(pValue).toBeGreaterThan(0.05);
  });

  it("표본이 0이면 안전하게 처리한다", () => {
    expect(twoProportionZTest(0, 0, 5, 100).pValue).toBe(1);
    expect(twoProportionZTest(0, 100, 0, 100).pValue).toBe(1);
  });
});

describe("wilsonInterval", () => {
  it("구간이 관측 비율을 포함한다", () => {
    const [lo, hi] = wilsonInterval(30, 100);
    expect(lo).toBeLessThan(0.3);
    expect(hi).toBeGreaterThan(0.3);
    expect(lo).toBeGreaterThan(0.2);
    expect(hi).toBeLessThan(0.42);
  });

  it("n=0이면 [0,0]", () => {
    expect(wilsonInterval(0, 0)).toEqual([0, 0]);
  });

  it("경계를 벗어나지 않는다", () => {
    const [lo] = wilsonInterval(0, 10);
    const [, hi] = wilsonInterval(10, 10);
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
  });
});

describe("requiredSampleSize", () => {
  it("기준 5% 전환율에서 20% 상대 개선 감지 → 그룹당 약 8000명대", () => {
    const n = requiredSampleSize(0.05, 0.2);
    expect(n).toBeGreaterThan(6000);
    expect(n).toBeLessThan(10000);
  });

  it("MDE가 클수록 필요 표본이 줄어든다", () => {
    expect(requiredSampleSize(0.05, 0.5)).toBeLessThan(requiredSampleSize(0.05, 0.1));
  });

  it("무효 입력은 0", () => {
    expect(requiredSampleSize(0, 0.2)).toBe(0);
    expect(requiredSampleSize(0.05, 0)).toBe(0);
  });
});

describe("calcNps", () => {
  it("NPS = (추천-비추천)/전체 × 100", () => {
    // 추천(9,10) 4명, 중립(7,8) 2명, 비추천(0~6) 4명 → (4-4)/10 = 0
    const r = calcNps([10, 9, 9, 10, 7, 8, 6, 5, 3, 0]);
    expect(r.nps).toBe(0);
    expect(r.promoters).toBe(4);
    expect(r.passives).toBe(2);
    expect(r.detractors).toBe(4);
  });

  it("전원 추천이면 100", () => {
    expect(calcNps([9, 10, 10]).nps).toBe(100);
  });

  it("응답 없으면 0", () => {
    expect(calcNps([]).nps).toBe(0);
    expect(calcNps([]).total).toBe(0);
  });

  it("범위 밖 값은 무시", () => {
    expect(calcNps([11, -1, 10]).total).toBe(1);
  });
});
