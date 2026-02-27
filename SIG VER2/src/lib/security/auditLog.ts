import { supabase } from "../supabase";

// ─── 감사 로그 타입 ───────────────────────────────────────
export type AuditAction =
  | "admin.login.success"
  | "admin.login.failure"
  | "admin.logout"
  | "portfolio.create"
  | "portfolio.update"
  | "portfolio.delete"
  | "portfolio.reset"
  | "image.upload"
  | "image.delete";

interface AuditPayload {
  action: AuditAction;
  resourceId?: number | string;
  details?: Record<string, unknown>;
}

// ─── 로그 기록 ────────────────────────────────────────────
// Supabase audit_logs 테이블에 기록 (없으면 console만)
// 로그 실패가 핵심 기능을 방해해선 안 됨
export async function logAudit(payload: AuditPayload): Promise<void> {
  const entry = {
    action: payload.action,
    resource_id: payload.resourceId ?? null,
    details: payload.details ? JSON.stringify(payload.details) : null,
    user_agent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 200)
        : null,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from("audit_logs").insert(entry);
    } catch {
      // 로그 실패는 무시 (앱 동작 유지)
    }
  }
}

/*
 * Supabase 마이그레이션 SQL (한 번만 실행):
 *
 * CREATE TABLE IF NOT EXISTS audit_logs (
 *   id          BIGSERIAL PRIMARY KEY,
 *   action      TEXT NOT NULL,
 *   resource_id TEXT,
 *   details     JSONB,
 *   user_agent  TEXT,
 *   created_at  TIMESTAMPTZ DEFAULT NOW()
 * );
 * ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
 * -- anon 역할은 INSERT만 허용 (읽기 불가)
 * CREATE POLICY "audit_insert" ON audit_logs
 *   FOR INSERT TO anon WITH CHECK (true);
 */
