import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export interface GallerySection {
  id: string;
  title: string;
  images: GalleryImage[];
}

export interface GalleryData {
  sections: GallerySection[];
}

export const defaultGalleryData: GalleryData = { sections: [] };

const CACHE_KEY = "sig_gallery_data";
const DB_KEY = "gallery_data";

function loadCache(): GalleryData {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return defaultGalleryData;
    const parsed = JSON.parse(raw) as Partial<GalleryData>;
    return { sections: parsed.sections ?? [] };
  } catch {
    return defaultGalleryData;
  }
}

function saveCache(data: GalleryData) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────
interface GalleryContextType {
  data: GalleryData;
  saving: boolean;
  saveError: string | null;
  updateData: (data: GalleryData) => Promise<void>;
  resetData: () => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | null>(null);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [data, setDataState] = useState<GalleryData>(loadCache);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setData = (d: GalleryData) => { setDataState(d); saveCache(d); };

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data: row, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", DB_KEY)
        .maybeSingle();
      if (error) throw error;
      if (row?.value) {
        const parsed = row.value as Partial<GalleryData>;
        setData({ sections: parsed.sections ?? [] });
      }
    } catch (err) {
      console.error("[GalleryDB fetch]", err);
    }
  }, []);

  useEffect(() => { if (supabase) fetchFromDB(); }, [fetchFromDB]);

  const updateData = async (d: GalleryData) => {
    setData(d);
    setSaveError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: DB_KEY,
        value: d,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const resetData = async () => {
    await updateData(defaultGalleryData);
    localStorage.removeItem(CACHE_KEY);
  };

  return (
    <GalleryContext.Provider value={{ data, saving, saveError, updateData, resetData }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const ctx = useContext(GalleryContext);
  if (!ctx) throw new Error("useGallery must be inside <GalleryProvider>");
  return ctx;
}
