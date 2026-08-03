// =============================================================================
// PM Analytics — 통계 유틸리티 (순수 함수)
//
// A/B 테스트 유의성 검정과 리서치 지표 계산에 사용.
// - 표준정규 CDF (Abramowitz & Stegun 근사)
// - Two-proportion z-test (양측)
// - Wilson score 신뢰구간
// - 필요 표본 수 추정
// - NPS 계산
// =============================================================================

/** 표준정규분포 CDF. |오차| < 7.5e-8 (Abramowitz & Stegun 7.1.26 기반) */
export function normalCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

export interface ZTestResult {
  z: number;
  /** 양측 p-value */
  pValue: number;
}

/**
 * Two-proportion z-test (pooled).
 * @param c1 그룹1 전환 수  @param n1 그룹1 표본 수
 * @param c2 그룹2 전환 수  @param n2 그룹2 표본 수
 */
export function twoProportionZTest(c1: number, n1: number, c2: number, n2: number): ZTestResult {
  if (n1 <= 0 || n2 <= 0) return { z: 0, pValue: 1 };
  const p1 = c1 / n1;
  const p2 = c2 / n2;
  const pooled = (c1 + c2) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return { z: 0, pValue: 1 };
  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return { z, pValue: Math.min(1, Math.max(0, pValue)) };
}

/** Wilson score 95% 신뢰구간 */
export function wilsonInterval(conversions: number, n: number): [number, number] {
  if (n <= 0) return [0, 0];
  const z = 1.959964; // 95%
  const p = conversions / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const margin = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
}

/**
 * 그룹당 필요 표본 수 추정 (two-proportion, α=0.05 양측, power 80%).
 * @param baseRate 기준(control) 전환율 (0~1)
 * @param mde 상대 최소검출효과 (예: 0.2 = 20% 개선 감지)
 */
export function requiredSampleSize(baseRate: number, mde: number): number {
  if (baseRate <= 0 || baseRate >= 1 || mde <= 0) return 0;
  const zAlpha = 1.959964; // α/2 = 0.025
  const zBeta = 0.841621; // power 0.8
  const p1 = baseRate;
  const p2 = Math.min(0.999, baseRate * (1 + mde));
  const pBar = (p1 + p2) / 2;
  const numerator =
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
  const n = (numerator * numerator) / ((p2 - p1) * (p2 - p1));
  return Math.ceil(n);
}

export interface NpsResult {
  nps: number; // -100 ~ 100
  promoters: number;
  passives: number;
  detractors: number;
  total: number;
}

/** NPS 계산. scores: 0~10 응답 배열 */
export function calcNps(scores: number[]): NpsResult {
  const valid = scores.filter((s) => Number.isFinite(s) && s >= 0 && s <= 10);
  const total = valid.length;
  if (total === 0) return { nps: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
  const promoters = valid.filter((s) => s >= 9).length;
  const passives = valid.filter((s) => s >= 7 && s <= 8).length;
  const detractors = valid.filter((s) => s <= 6).length;
  const nps = Math.round(((promoters - detractors) / total) * 100);
  return { nps, promoters, passives, detractors, total };
}
