import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────
export interface SpaceSpec {
  id: string;
  label: string;
  value: string;
}

export interface SpaceContent {
  heroImage: string;
  title: string;
  tagline: string;
  description: string;
  specs: SpaceSpec[];
  photos: string[];        // up to 4 studio photos
  capabilities: string[];  // e.g. ["씨즐 촬영", "광고 영상 촬영", ...]
}

export const defaultSpaceContent: SpaceContent = {
  heroImage: "",
  title: "STUDIO SPACE",
  tagline: "Where Vision Meets Light",
  description:
    "STUDIO SIG의 독립 촬영 스튜디오입니다. 씨즐 촬영부터 광고 영상 제작까지, 모든 비주얼 콘텐츠를 한 공간에서 완성할 수 있는 전문 촬영 환경을 갖추고 있습니다.",
  specs: [
    { id: "s1", label: "규모", value: "" },
    { id: "s2", label: "층고", value: "" },
    { id: "s3", label: "위치", value: "서울특별시 서대문구" },
    { id: "s4", label: "주차", value: "" },
    { id: "s5", label: "이용 시간", value: "" },
  ],
  photos: [],
  capabilities: [
    "씨즐 촬영",
    "광고 영상 촬영",
    "제품 촬영",
    "인물·브랜드 촬영",
    "라이브 커머스",
  ],
};

const CACHE_KEY = "sig_space_content";
const DB_KEY = "space_content";

function loadCache(): SpaceContent {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return defaultSpaceContent;
    const p = JSON.parse(raw) as Partial<SpaceContent>;
    return {
      heroImage:    p.heroImage    ?? defaultSpaceContent.heroImage,
      title:        p.title        ?? defaultSpaceContent.title,
      tagline:      p.tagline      ?? defaultSpaceContent.tagline,
      description:  p.description  ?? defaultSpaceContent.description,
      specs:        p.specs        ?? defaultSpaceContent.specs,
      photos:       p.photos       ?? defaultSpaceContent.photos,
      capabilities: p.capabilities ?? defaultSpaceContent.capabilities,
    };
  } catch {
    return defaultSpaceContent;
  }
}

function saveCache(d: SpaceContent) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────
interface SpaceContextType {
  content: SpaceContent;
  saving: boolean;
  saveError: string | null;
  updateContent: (d: SpaceContent) => Promise<void>;
  resetContent: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | null>(null);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SpaceContent>(loadCache);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const set = (d: SpaceContent) => { setContentState(d); saveCache(d); };

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", DB_KEY)
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        const p = data.value as Partial<SpaceContent>;
        set({
          heroImage:    p.heroImage    ?? defaultSpaceContent.heroImage,
          title:        p.title        ?? defaultSpaceContent.title,
          tagline:      p.tagline      ?? defaultSpaceContent.tagline,
          description:  p.description  ?? defaultSpaceContent.description,
          specs:        p.specs        ?? defaultSpaceContent.specs,
          photos:       p.photos       ?? defaultSpaceContent.photos,
          capabilities: p.capabilities ?? defaultSpaceContent.capabilities,
        });
      }
    } catch (err) {
      console.error("[SpaceDB fetch]", err);
    }
  }, []);

  useEffect(() => { if (supabase) fetchFromDB(); }, [fetchFromDB]);

  const updateContent = async (d: SpaceContent) => {
    set(d);
    setSaveError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: DB_KEY, value: d, updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const resetContent = async () => {
    await updateContent(defaultSpaceContent);
    localStorage.removeItem(CACHE_KEY);
  };

  return (
    <SpaceContext.Provider value={{ content, saving, saveError, updateContent, resetContent }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpace must be inside <SpaceProvider>");
  return ctx;
}
