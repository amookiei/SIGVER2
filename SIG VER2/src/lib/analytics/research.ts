// =============================================================================
// PM Analytics — UX 리서치 설정 저장소
// 마이크로 서베이(NPS) 위젯 설정을 site_settings(Supabase) + localStorage에 보관.
// =============================================================================

import { supabase } from "../supabase";
import type { ResearchConfig } from "./types";
import { DEFAULT_RESEARCH_CONFIG } from "./types";

const CACHE_KEY = "sig_research_config";
const DB_KEY = "research_config";

export function loadResearchConfigSync(): ResearchConfig {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? { ...DEFAULT_RESEARCH_CONFIG, ...(JSON.parse(raw) as Partial<ResearchConfig>) } : DEFAULT_RESEARCH_CONFIG;
  } catch {
    return DEFAULT_RESEARCH_CONFIG;
  }
}

export async function loadResearchConfig(): Promise<ResearchConfig> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", DB_KEY)
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        const cfg = { ...DEFAULT_RESEARCH_CONFIG, ...(data.value as Partial<ResearchConfig>) };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cfg));
        return cfg;
      }
    } catch {
      /* 폴백 */
    }
  }
  return loadResearchConfigSync();
}

export async function saveResearchConfig(cfg: ResearchConfig): Promise<void> {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cfg));
  } catch {
    /* ignore */
  }
  if (supabase) {
    await supabase.from("site_settings").upsert({
      key: DB_KEY,
      value: cfg,
      updated_at: new Date().toISOString(),
    });
  }
}
