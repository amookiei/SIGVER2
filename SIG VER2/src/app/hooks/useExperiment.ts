import { useEffect, useMemo } from "react";
import { listExperimentsSync, assignVariant, logExposure } from "../../lib/analytics/experiments";
import { getVisitorId, track } from "../../lib/analytics/tracker";

/**
 * A/B 실험 참여 훅 (공개 페이지용).
 *
 * 로컬 캐시된 실험 정의에서 결정적 해시로 변형을 배정하고,
 * 마운트 시 세션당 1회 노출 이벤트를 기록한다.
 *
 * @returns variant  배정된 변형 키 (실험 미존재/중지 시 "control")
 * @returns payload  변형에 설정된 payload 문자열 (없으면 fallback)
 * @returns trackGoal  실험 문맥이 붙은 이벤트 기록 헬퍼
 */
export function useExperiment(experimentId: string, fallbackPayload = "") {
  const { variant, payload } = useMemo(() => {
    const exp = listExperimentsSync().find((e) => e.id === experimentId);
    if (!exp || exp.status !== "running") {
      return { variant: "control", payload: fallbackPayload };
    }
    const key = assignVariant(exp, getVisitorId());
    const v = exp.variants.find((x) => x.key === key);
    return { variant: key, payload: v?.payload || fallbackPayload };
  }, [experimentId, fallbackPayload]);

  useEffect(() => {
    const exp = listExperimentsSync().find((e) => e.id === experimentId);
    if (exp && exp.status === "running") logExposure(experimentId, variant);
  }, [experimentId, variant]);

  const trackGoal = (event: string, props: Record<string, unknown> = {}) =>
    track(event, { ...props, experiment: experimentId, variant });

  return { variant, payload, trackGoal };
}
