// =============================================================================
// PM Analytics — 공용 타입 정의
// 이벤트 수집 / A/B 실험 / UX 리서치에서 공통으로 사용하는 타입.
// =============================================================================

/** 수집되는 단일 이벤트. Supabase analytics_events 테이블 1행과 대응. */
export interface AnalyticsEvent {
  id: string;
  /** 이벤트 이름 (page_view, cta_click, contact_submit, experiment_exposure, survey_response …) */
  event: string;
  /** 이벤트 발생 경로 (예: /work/hyundai-rebrand) */
  path: string;
  /** 익명 방문자 ID (localStorage, 기기 단위) */
  visitor_id: string;
  /** 세션 ID (30분 미활동 시 새 세션) */
  session_id: string;
  /** desktop | tablet | mobile */
  device: string;
  /** 유입 referrer 호스트 ("" = direct) */
  referrer: string;
  /** 이벤트별 추가 속성 */
  props: Record<string, unknown>;
  /** ISO 8601 */
  created_at: string;
}

/** 잘 알려진 이벤트 이름 (자동완성/일관성용) */
export const EVENT_NAMES = {
  PAGE_VIEW: "page_view",
  CTA_CLICK: "cta_click",
  CONTACT_SUBMIT: "contact_submit",
  WORK_VIEW: "work_view",
  EXPERIMENT_EXPOSURE: "experiment_exposure",
  SURVEY_RESPONSE: "survey_response",
} as const;

/** A/B 실험의 단일 변형(variant) */
export interface ExperimentVariant {
  /** 변형 키 (control, b, c …) */
  key: string;
  /** 관리자용 라벨 */
  label: string;
  /** 트래픽 가중치 (합계 기준 비율 배분) */
  weight: number;
  /** UI에 주입할 값 (예: CTA 문구) */
  payload?: string;
}

export type ExperimentStatus = "draft" | "running" | "paused" | "completed";

/** A/B 실험 정의 */
export interface Experiment {
  /** slug 형태 ID (예: home-cta-copy) */
  id: string;
  name: string;
  /** 가설: "…하면 …가 …% 개선될 것이다" */
  hypothesis: string;
  status: ExperimentStatus;
  variants: ExperimentVariant[];
  /** 성공 지표로 사용할 이벤트 이름 (예: contact_submit) */
  goalEvent: string;
  /** 실험 대상 페이지 (표시용) */
  targetPage?: string;
  /** 종료 시 기록하는 의사결정 메모 */
  decision?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

/** 변형별 실험 결과 (통계 계산 후) */
export interface VariantResult {
  variant: ExperimentVariant;
  exposures: number;      // 고유 방문자 기준 노출 수
  conversions: number;    // 노출 후 goalEvent를 발생시킨 고유 방문자 수
  rate: number;           // 전환율
  ciLow: number;          // Wilson 95% 신뢰구간 하한
  ciHigh: number;         // Wilson 95% 신뢰구간 상한
  /** control 대비 상대 lift (control 자신은 null) */
  lift: number | null;
  /** control 대비 two-proportion z-test p-value (control 자신은 null) */
  pValue: number | null;
}

/** UX 리서치(마이크로 서베이) 설정 */
export interface ResearchConfig {
  /** 위젯 노출 여부 */
  enabled: boolean;
  /** 노출 샘플링 비율 0~100 (%) */
  samplingPct: number;
  /** 위젯 질문 문구 */
  question: string;
  /** 최초 노출까지 대기 (초) */
  delaySec: number;
}

export const DEFAULT_RESEARCH_CONFIG: ResearchConfig = {
  enabled: true,
  samplingPct: 100,
  question: "Studio SIG를 지인에게 추천할 의향이 얼마나 되시나요?",
  delaySec: 20,
};
