// =============================================================================
// Supabase 스키마 마이그레이션 SQL (최초 1회 실행)
//
// CREATE TABLE IF NOT EXISTS site_settings (
//   key        TEXT PRIMARY KEY,
//   value      JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public_read" ON site_settings FOR SELECT USING (true);
// CREATE POLICY "anon_write"  ON site_settings FOR ALL TO anon
//   USING (true) WITH CHECK (true);
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";
import { defaultAboutData } from "../data/about";
import type { AboutData } from "../data/about";

const CACHE_KEY = "sig_about_cache";
const ABOUT_KEY = "about";

function loadCache(): AboutData {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AboutData) : defaultAboutData;
  } catch {
    return defaultAboutData;
  }
}

function saveCache(data: AboutData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

interface AboutContextType {
  about: AboutData;
  loading: boolean;
  dbStatus: "none" | "synced" | "error";
  dbError: string | null;
  updateAbout: (data: AboutData) => Promise<void>;
  resetAbout: () => Promise<void>;
}

const AboutContext = createContext<AboutContextType | null>(null);

export function AboutProvider({ children }: { children: ReactNode }) {
  const [about, setAboutState] = useState<AboutData>(loadCache);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [dbStatus, setDbStatus] = useState<"none" | "synced" | "error">("none");
  const [dbError, setDbError] = useState<string | null>(null);

  const setAbout = (data: AboutData) => {
    setAboutState(data);
    saveCache(data);
  };

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", ABOUT_KEY)
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        const merged = mergeWithDefaults(data.value as Partial<AboutData>);
        setAbout(merged);
        setDbStatus("synced");
      } else {
        setDbStatus("synced"); // 아직 데이터 없음 — 기본값 사용
      }
    } catch (err) {
      console.error("[AboutDB]", err);
      setDbStatus("error");
      setDbError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabase) fetchFromDB();
  }, [fetchFromDB]);

  async function updateAbout(data: AboutData) {
    setAbout(data);
    if (!supabase) return;

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: ABOUT_KEY, value: data, updated_at: new Date().toISOString() });

    if (!error) {
      setDbStatus("synced");
      setDbError(null);
    } else {
      setDbStatus("error");
      setDbError(error.message ?? "알 수 없는 오류");
    }
  }

  async function resetAbout() {
    await updateAbout(defaultAboutData);
  }

  return (
    <AboutContext.Provider value={{ about, loading, dbStatus, dbError, updateAbout, resetAbout }}>
      {children}
    </AboutContext.Provider>
  );
}

export function useAbout() {
  const ctx = useContext(AboutContext);
  if (!ctx) throw new Error("useAbout must be used within AboutProvider");
  return ctx;
}

// ─── 기본값과 병합 (DB에 부분 데이터만 있을 때 대비) ──────────────────────
function mergeWithDefaults(partial: Partial<AboutData>): AboutData {
  return {
    studio: { ...defaultAboutData.studio, ...partial.studio },
    stats: partial.stats?.length ? partial.stats : defaultAboutData.stats,
    values: partial.values?.length ? partial.values : defaultAboutData.values,
    team: partial.team?.length ? partial.team : defaultAboutData.team,
  };
}
