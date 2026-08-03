-- =============================================================================
-- PM Analytics 마이그레이션 (Supabase SQL Editor에서 1회 실행)
--
-- 생성 대상:
--   1. analytics_events  — 이벤트 로그 (페이지뷰/클릭/전환/실험 노출/서베이)
--   2. experiments       — A/B 실험 정의 (config JSONB)
--   3. run_admin_query   — 관리자 SQL 콘솔용 읽기 전용 쿼리 함수
--
-- 주의: 이 프로젝트는 기존 테이블(portfolio_items 등)과 동일하게 anon 키 기반
-- 정책을 사용합니다. 실서비스 확장 시 Supabase Auth 기반 정책으로 강화하세요.
-- =============================================================================

-- ── 1. 이벤트 로그 ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event      TEXT NOT NULL,
  path       TEXT NOT NULL DEFAULT '',
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  device     TEXT NOT NULL DEFAULT '',
  referrer   TEXT NOT NULL DEFAULT '',
  props      JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event      ON analytics_events (event);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor    ON analytics_events (visitor_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "analytics_public_insert" ON analytics_events;
CREATE POLICY "analytics_public_insert" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "analytics_public_read" ON analytics_events;
CREATE POLICY "analytics_public_read" ON analytics_events
  FOR SELECT USING (true);

-- ── 2. A/B 실험 정의 ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS experiments (
  id         TEXT PRIMARY KEY,
  config     JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "experiments_public_all" ON experiments;
CREATE POLICY "experiments_public_all" ON experiments
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── 3. SQL 콘솔용 읽기 전용 쿼리 함수 ────────────────────────────────────────
-- SELECT/WITH 단일 구문만 허용, 결과는 최대 500행 JSONB 배열로 반환.
CREATE OR REPLACE FUNCTION run_admin_query(query_sql text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- 주의: Postgres 정규식에서 단어 경계는 \b가 아니라 \y
  IF query_sql !~* '^\s*(select|with)\y' THEN
    RAISE EXCEPTION 'SELECT 또는 WITH로 시작하는 읽기 쿼리만 실행할 수 있습니다';
  END IF;
  IF query_sql ~ ';' THEN
    RAISE EXCEPTION '복수 구문(;)은 허용되지 않습니다';
  END IF;

  EXECUTE format(
    'SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (SELECT * FROM (%s) q LIMIT 500) t',
    query_sql
  ) INTO result;

  RETURN result;
END $$;

GRANT EXECUTE ON FUNCTION run_admin_query(text) TO anon;

-- ── (참고) site_settings 테이블이 아직 없다면 ────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_settings_public_all" ON site_settings;
CREATE POLICY "site_settings_public_all" ON site_settings
  FOR ALL TO anon USING (true) WITH CHECK (true);
