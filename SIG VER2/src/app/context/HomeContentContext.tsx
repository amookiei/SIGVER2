import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────
export interface HomeService {
  id: string;
  title: string;
  desc: string;
  count: string;
  image: string;
}

export interface HomeClient {
  id: string;
  name: string;
  logoUrl: string;
}

export interface HomeContent {
  services: HomeService[];
  clients: HomeClient[];
  heroImage: string;
  aboutImage: string;
  aboutLine1: string;
  aboutLine2: string;
}

// ─── Defaults (현재 Home.tsx 하드코딩 값) ─────────────────
export const defaultHomeContent: HomeContent = {
  heroImage: "",
  clients: [],
  services: [
    {
      id: "01",
      title: "BRAND &\nPACKAGE",
      desc: "브랜드 아이덴티티에서 패키지 구조까지. 규격·칼선·소재를 처음부터 생산 기준으로 설계합니다.",
      count: "(01)",
      image: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "02",
      title: "PREPRESS &\nSUPERVISION",
      desc: "색판·핀트·라미네이션 변화를 제판 전에 검증하고 현장에서 측색으로 확인하는 인쇄 감리.",
      count: "(02)",
      image: "https://images.unsplash.com/photo-1750056393331-82e69d28c9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "03",
      title: "PRODUCTION\nPARTNERS",
      desc: "연포장·박스·라벨 등 공정별 제조 파트너와 사양서 기준으로 샘플부터 양산까지 관리합니다.",
      count: "(03)",
      image: "https://images.unsplash.com/photo-1759308553474-ce2c768a6b7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "04",
      title: "GLOBAL\nCOOPERATION",
      desc: "규격·색 기준·감리 절차를 문서화해 해외 파트너와도 같은 품질을 재현합니다.",
      count: "(04)",
      image: "https://images.unsplash.com/photo-1758384077411-6a06e201a177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
  ],
  aboutImage:
    "https://images.unsplash.com/photo-1765371513276-a74f1ecbcf7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  aboutLine1: "스튜디오 시그는 브랜드와 패키지 설계를 생산 현장의 언어로 번역합니다.",
  aboutLine2: "인쇄 감리와 제조 파트너 네트워크로, 시안이 실물이 되는 순간까지 책임집니다.",
};

const CACHE_KEY = "sig_home_content";
const DB_KEY = "home_content";

function loadCache(): HomeContent {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return defaultHomeContent;
    const parsed = JSON.parse(raw) as Partial<HomeContent>;
    return {
      heroImage: parsed.heroImage ?? defaultHomeContent.heroImage,
      services: parsed.services ?? defaultHomeContent.services,
      clients: parsed.clients ?? defaultHomeContent.clients,
      aboutImage: parsed.aboutImage ?? defaultHomeContent.aboutImage,
      aboutLine1: parsed.aboutLine1 ?? defaultHomeContent.aboutLine1,
      aboutLine2: parsed.aboutLine2 ?? defaultHomeContent.aboutLine2,
    };
  } catch {
    return defaultHomeContent;
  }
}

function saveCache(data: HomeContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────
interface HomeContentContextType {
  content: HomeContent;
  saving: boolean;
  saveError: string | null;
  updateContent: (data: HomeContent) => Promise<void>;
  resetContent: () => Promise<void>;
}

const HomeContentContext = createContext<HomeContentContextType | null>(null);

export function HomeContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<HomeContent>(loadCache);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const setContent = (data: HomeContent) => {
    setContentState(data);
    saveCache(data);
  };

  // Fetch from Supabase on mount
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
        const parsed = data.value as Partial<HomeContent>;
        setContent({
          heroImage: parsed.heroImage ?? defaultHomeContent.heroImage,
          services: parsed.services ?? defaultHomeContent.services,
          clients: parsed.clients ?? defaultHomeContent.clients,
          aboutImage: parsed.aboutImage ?? defaultHomeContent.aboutImage,
          aboutLine1: parsed.aboutLine1 ?? defaultHomeContent.aboutLine1,
          aboutLine2: parsed.aboutLine2 ?? defaultHomeContent.aboutLine2,
        });
      }
    } catch (err) {
      console.error("[HomeContentDB fetch]", err);
    }
  }, []);

  useEffect(() => {
    if (supabase) fetchFromDB();
  }, [fetchFromDB]);

  const updateContent = async (data: HomeContent) => {
    setContent(data);
    setSaveError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: DB_KEY,
        value: data,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const resetContent = async () => {
    await updateContent(defaultHomeContent);
    localStorage.removeItem(CACHE_KEY);
  };

  return (
    <HomeContentContext.Provider value={{ content, saving, saveError, updateContent, resetContent }}>
      {children}
    </HomeContentContext.Provider>
  );
}

export function useHomeContent() {
  const ctx = useContext(HomeContentContext);
  if (!ctx) throw new Error("useHomeContent must be used inside <HomeContentProvider>");
  return ctx;
}
