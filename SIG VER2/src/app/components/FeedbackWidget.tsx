// =============================================================================
// UX 리서치 — NPS 마이크로 서베이 위젯 (공개 사이트 우하단)
//
// - 관리자 리서치 탭 설정(enabled/샘플링/질문/지연)에 따라 노출
// - 방문자당 1회만 노출: 응답하거나 닫으면 다시 보이지 않음
// - 응답은 survey_response 이벤트로 수집 → 리서치 탭에서 NPS 집계
// =============================================================================

import { useEffect, useState } from "react";
import { track, getVisitorId } from "../../lib/analytics/tracker";
import { fnv1a } from "../../lib/analytics/experiments";
import { loadResearchConfig } from "../../lib/analytics/research";
import type { ResearchConfig } from "../../lib/analytics/types";
import { EVENT_NAMES } from "../../lib/analytics/types";

const DONE_KEY = "sig_survey_done";
const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";

export function FeedbackWidget() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ResearchConfig | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    (async () => {
      try {
        if (localStorage.getItem(DONE_KEY)) return;
        if (window.location.pathname.startsWith("/admin")) return;
        const cfg = await loadResearchConfig();
        if (!cfg.enabled) return;
        // 방문자 ID 해시 기반 결정적 샘플링
        if (fnv1a(`survey:${getVisitorId()}`) % 100 >= cfg.samplingPct) return;
        setConfig(cfg);
        timer = setTimeout(() => setVisible(true), Math.max(0, cfg.delaySec) * 1000);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DONE_KEY, "dismissed");
    } catch { /* ignore */ }
  };

  const submit = () => {
    if (score === null) return;
    track(EVENT_NAMES.SURVEY_RESPONSE, {
      score,
      comment: comment.trim().slice(0, 500),
      page: window.location.pathname,
    });
    try {
      localStorage.setItem(DONE_KEY, "answered");
    } catch { /* ignore */ }
    setSubmitted(true);
    setTimeout(() => setVisible(false), 1800);
  };

  if (!visible || !config) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 9000,
        width: "min(340px, calc(100vw - 40px))",
        background: "#0D0D0D",
        border: "1px solid #2A2A2A",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        padding: "18px 20px",
        cursor: "auto",
      }}
    >
      {submitted ? (
        <p style={{ fontFamily: F, fontSize: "13px", color: "#FAFAFA", margin: 0, textAlign: "center" }}>
          소중한 의견 감사합니다 🙏
        </p>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
            <p style={{ fontFamily: F, fontSize: "13px", color: "#FAFAFA", margin: 0, lineHeight: 1.6 }}>
              {config.question}
            </p>
            <button
              onClick={dismiss}
              aria-label="닫기"
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: 0, flexShrink: 0 }}
            >
              ×
            </button>
          </div>

          {/* 0~10 스케일 */}
          <div style={{ display: "flex", gap: "3px", marginBottom: "6px" }}>
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => setScore(i)}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  background: score === i ? "#FF4D00" : "#161616",
                  border: score === i ? "1px solid #FF4D00" : "1px solid #2A2A2A",
                  color: score === i ? "#FFFFFF" : "#888888",
                  fontFamily: F,
                  fontSize: "11px",
                  fontWeight: score === i ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {i}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontFamily: F, fontSize: "9px", color: "#555" }}>전혀 아니다</span>
            <span style={{ fontFamily: F, fontSize: "9px", color: "#555" }}>매우 그렇다</span>
          </div>

          {score !== null && (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이유를 알려주시면 큰 도움이 됩니다 (선택)"
              style={{
                width: "100%",
                minHeight: "56px",
                background: "#0A0A0A",
                border: "1px solid #2A2A2A",
                color: "#FAFAFA",
                fontFamily: F,
                fontSize: "12px",
                padding: "8px 10px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                marginBottom: "10px",
              }}
            />
          )}

          <button
            onClick={submit}
            disabled={score === null}
            style={{
              width: "100%",
              padding: "10px 0",
              background: score === null ? "#1A1A1A" : "#FAFAFA",
              border: "none",
              color: score === null ? "#555" : "#0D0D0D",
              fontFamily: F,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              cursor: score === null ? "default" : "pointer",
            }}
          >
            보내기
          </button>
        </>
      )}
    </div>
  );
}
