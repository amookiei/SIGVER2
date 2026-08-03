// =============================================================================
// PM Analytics — A/B 실험 프레임워크
//
// - 실험 정의 CRUD: Supabase(experiments 테이블) + localStorage 폴백
// - 변형 배정: FNV-1a 해시(visitorId:experimentId) 기반 결정적 버킷팅
//   → 서버 없이도 동일 방문자는 항상 동일 변형, 새로고침에도 일관성 유지
// - 노출(exposure)은 세션당 1회 experiment_exposure 이벤트로 기록
// - 결과 계산: 고유 방문자 기준 노출/전환 + z-test 유의성
// =============================================================================

import { supabase } from "../supabase";
import { track, getVisitorId } from "./tracker";
import { twoProportionZTest, wilsonInterval } from "./stats";
import type { AnalyticsEvent, Experiment, VariantResult } from "./types";
import { EVENT_NAMES } from "./types";

const STORE_KEY = "sig_experiments";
const EXPOSED_KEY = "sig_exp_exposed"; // 세션 내 노출 기록 (중복 이벤트 방지)

// ─── 기본 실험 (최초 1회 시드) ────────────────────────────
export const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: "home-cta-copy",
    name: "홈 CTA 문구 실험",
    hypothesis:
      "행동 결과가 구체적인 CTA 문구(START A PROJECT)가 일반 문구(GET IN TOUCH)보다 문의 전환율을 15% 이상 높일 것이다.",
    status: "running",
    variants: [
      { key: "control", label: "A · GET IN TOUCH", weight: 50, payload: "GET IN TOUCH" },
      { key: "b", label: "B · START A PROJECT", weight: 50, payload: "START A PROJECT" },
    ],
    goalEvent: EVENT_NAMES.CONTACT_SUBMIT,
    targetPage: "/ (홈 하단 CTA)",
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
  },
];

// ─── 저장소 ──────────────────────────────────────────────
function loadLocal(): Experiment[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(DEFAULT_EXPERIMENTS));
      return DEFAULT_EXPERIMENTS;
    }
    return JSON.parse(raw) as Experiment[];
  } catch {
    return DEFAULT_EXPERIMENTS;
  }
}

function saveLocal(experiments: Experiment[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(experiments));
  } catch {
    /* ignore */
  }
}

/** 실험 목록 로드 (Supabase 우선, 실패 시 로컬) */
export async function listExperiments(): Promise<Experiment[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("experiments").select("id, config");
      if (error) throw error;
      if (data && data.length > 0) {
        const exps = data.map((r) => r.config as Experiment);
        saveLocal(exps); // 공개 페이지의 동기 접근용 캐시
        return exps;
      }
      // 원격이 비어 있으면 기본 실험 시드
      const seeds = loadLocal();
      await Promise.all(
        seeds.map((e) => supabase!.from("experiments").upsert({ id: e.id, config: e }))
      );
      return seeds;
    } catch {
      return loadLocal();
    }
  }
  return loadLocal();
}

/** 공개 페이지용 동기 로드 (로컬 캐시만) — useExperiment에서 사용 */
export function listExperimentsSync(): Experiment[] {
  return loadLocal();
}

export async function saveExperiment(exp: Experiment): Promise<void> {
  const all = loadLocal();
  const idx = all.findIndex((e) => e.id === exp.id);
  if (idx >= 0) all[idx] = exp;
  else all.push(exp);
  saveLocal(all);

  if (supabase) {
    await supabase.from("experiments").upsert({ id: exp.id, config: exp });
  }
}

export async function deleteExperiment(id: string): Promise<void> {
  saveLocal(loadLocal().filter((e) => e.id !== id));
  if (supabase) {
    await supabase.from("experiments").delete().eq("id", id);
  }
}

// ─── 변형 배정 (결정적 해시 버킷팅) ────────────────────────
/** FNV-1a 32bit 해시 */
export function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * 방문자를 실험 변형에 배정. 같은 (visitorId, experimentId)는 항상 같은 변형.
 * running 상태가 아니면 첫 번째 변형(control) 반환.
 */
export function assignVariant(exp: Experiment, visitorId: string): string {
  if (exp.variants.length === 0) return "control";
  if (exp.status !== "running") return exp.variants[0].key;

  const totalWeight = exp.variants.reduce((s, v) => s + Math.max(0, v.weight), 0);
  if (totalWeight <= 0) return exp.variants[0].key;

  const bucket = fnv1a(`${visitorId}:${exp.id}`) % 10000;
  const scale = 10000 / totalWeight;
  let cumulative = 0;
  for (const v of exp.variants) {
    cumulative += Math.max(0, v.weight) * scale;
    if (bucket < cumulative) return v.key;
  }
  return exp.variants[exp.variants.length - 1].key;
}

/** 세션당 1회 노출 이벤트 기록 */
export function logExposure(experimentId: string, variant: string): void {
  try {
    const raw = sessionStorage.getItem(EXPOSED_KEY);
    const exposed = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    if (exposed[experimentId]) return;
    exposed[experimentId] = variant;
    sessionStorage.setItem(EXPOSED_KEY, JSON.stringify(exposed));
  } catch {
    /* dedupe 실패 시에도 이벤트는 기록 */
  }
  track(EVENT_NAMES.EXPERIMENT_EXPOSURE, { experiment: experimentId, variant });
}

/**
 * 실험 참여 헬퍼 (공개 페이지용):
 * 로컬 캐시에서 실험을 찾아 배정 + 노출 기록 후 배정된 variant 키 반환.
 */
export function getAssignedVariant(experimentId: string): string {
  const exp = listExperimentsSync().find((e) => e.id === experimentId);
  if (!exp || exp.status !== "running") return "control";
  const variant = assignVariant(exp, getVisitorId());
  logExposure(exp.id, variant);
  return variant;
}

// ─── 결과 계산 ────────────────────────────────────────────
/**
 * 이벤트 로그에서 실험 결과 집계.
 * - 노출: experiment_exposure(experiment=id) 고유 방문자
 * - 전환: 노출된 방문자 중 goalEvent를 발생시킨 고유 방문자
 * - control(첫 변형) 대비 lift / p-value
 */
export function computeResults(exp: Experiment, events: AnalyticsEvent[]): VariantResult[] {
  const exposedBy = new Map<string, Set<string>>(); // variantKey → visitor set
  for (const v of exp.variants) exposedBy.set(v.key, new Set());

  for (const e of events) {
    if (e.event !== EVENT_NAMES.EXPERIMENT_EXPOSURE) continue;
    if (e.props?.experiment !== exp.id) continue;
    const variant = String(e.props?.variant ?? "");
    exposedBy.get(variant)?.add(e.visitor_id);
  }

  const goalVisitors = new Set(
    events.filter((e) => e.event === exp.goalEvent).map((e) => e.visitor_id)
  );

  const raw = exp.variants.map((variant) => {
    const exposed = exposedBy.get(variant.key) ?? new Set<string>();
    let conversions = 0;
    for (const vid of exposed) if (goalVisitors.has(vid)) conversions++;
    return { variant, exposures: exposed.size, conversions };
  });

  const control = raw[0];
  return raw.map((r, i) => {
    const rate = r.exposures ? r.conversions / r.exposures : 0;
    const [ciLow, ciHigh] = wilsonInterval(r.conversions, r.exposures);
    if (i === 0 || !control || control.exposures === 0 || r.exposures === 0) {
      return { ...r, rate, ciLow, ciHigh, lift: null, pValue: null };
    }
    const controlRate = control.conversions / control.exposures;
    const lift = controlRate > 0 ? (rate - controlRate) / controlRate : null;
    const { pValue } = twoProportionZTest(
      control.conversions,
      control.exposures,
      r.conversions,
      r.exposures
    );
    return { ...r, rate, ciLow, ciHigh, lift, pValue };
  });
}
