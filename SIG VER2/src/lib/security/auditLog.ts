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

// ─── Circuit breaker ─────────────────────────────────────
// audit_logs 테이블이 없을 때 반복 404 에러를 막기 위한 플래그
let _auditEnabled = true;

// ─── 로그 기록 ────────────────────────────────────────────
// Supabase audit_logs 테이블에 기록.
// 테이블이 없으면(404/42P01) 이후 요청을 중단해 콘솔 노이즈 방지.
export async function logAudit(payload: AuditPayload): Promise<void> {
  if (!supabase || !_auditEnabled) return;

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

  try {
    const { error } = await supabase.from("audit_logs").insert(entry);
    // 테이블 미존재(PostgreSQL 42P01) 또는 HTTP 404 → 이후 요청 비활성화
    if (
      error &&
      (error.code === "42P01" ||
        (error as { status?: number }).status === 404 ||
        error.message?.includes("does not exist"))
    ) {
      _auditEnabled = false;
    }
  } catch {
    // 네트워크 오류 등 예외 → 무시 (앱 동작 유지)
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
