// =============================================================================
// PM Admin — 공용 UI 킷 (대시보드/실험/리서치/SQL 페이지에서 공유)
// Admin.tsx의 다크 디자인 토큰과 동일한 룩앤필.
// =============================================================================

import type { ReactNode } from "react";

export const F = "'Plus Jakarta Sans', 'Pretendard', sans-serif";
export const BG = "#0D0D0D";
export const SURFACE = "#111111";
export const BORDER = "1px solid #1F1F1F";
export const BORDER2 = "1px solid #2A2A2A";
export const TEXT = "#FAFAFA";
export const TEXT2 = "#888888";
export const TEXT3 = "#444444";
export const ACCENT = "#FF4D00";
export const GREEN = "#4CAF50";
export const RED = "#E53E3E";

/** 차트 시리즈 색상 */
export const CHART_COLORS = ["#FF4D00", "#FAFAFA", "#4CAF50", "#5B8DEF", "#B573F5", "#888888"];

export const inputStyle: React.CSSProperties = {
  background: "#0A0A0A",
  border: BORDER2,
  color: TEXT,
  fontFamily: F,
  fontSize: "13px",
  padding: "9px 12px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  color: TEXT3,
  fontFamily: F,
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 14px" }}>
      <h3
        style={{
          fontFamily: F,
          fontSize: "11px",
          fontWeight: 700,
          color: TEXT2,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {children}
      </h3>
      {right}
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: SURFACE, border: BORDER, padding: "20px 22px", ...style }}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <div style={{ fontFamily: F, fontSize: "10px", color: TEXT3, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
        {label}
      </div>
      <div style={{ fontFamily: F, fontSize: "26px", fontWeight: 700, color: accent ? ACCENT : TEXT, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: F, fontSize: "11px", color: TEXT2, marginTop: "8px" }}>{sub}</div>
      )}
    </Card>
  );
}

export function Btn({
  children,
  onClick,
  primary,
  danger,
  small,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: primary ? TEXT : "none",
        border: primary ? "none" : danger ? `1px solid ${RED}` : BORDER2,
        color: disabled ? TEXT3 : primary ? BG : danger ? RED : TEXT2,
        fontFamily: F,
        fontSize: small ? "11px" : "12px",
        fontWeight: primary ? 700 : 400,
        padding: small ? "5px 12px" : "8px 18px",
        cursor: disabled ? "default" : "pointer",
        letterSpacing: "0.05em",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function Chip({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      style={{
        fontFamily: F,
        fontSize: "9px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color,
        border: `1px solid ${color}`,
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** 로컬/원격 데이터 소스 배지 */
export function SourceBadge({ source }: { source: "supabase" | "local" }) {
  const isRemote = source === "supabase";
  return (
    <span
      style={{
        fontFamily: F,
        fontSize: "10px",
        letterSpacing: "0.08em",
        color: isRemote ? GREEN : "#CC6622",
      }}
      title={
        isRemote
          ? "Supabase analytics_events 테이블에서 로드됨"
          : "Supabase 미연결 또는 테이블 없음 — 이 브라우저의 로컬 이벤트만 표시 중"
      }
    >
      ● {isRemote ? "Supabase 데이터" : "로컬 데이터 (이 브라우저만)"}
    </span>
  );
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const fmtPct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
export const fmtNum = (v: number) => v.toLocaleString("ko-KR");
