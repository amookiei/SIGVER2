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

export interface HomeContent {
  services: HomeService[];
  heroImage: string;
  aboutImage: string;
  aboutLine1: string;
  aboutLine2: string;
}

// ─── Defaults (현재 Home.tsx 하드코딩 값) ─────────────────
export const defaultHomeContent: HomeContent = {
  heroImage: "",
  services: [
    {
      id: "01",
      title: "BRANDING\n& IDENTITY",
      desc: "브랜드 전략 수립부터 시각 아이덴티티까지, 기업의 본질을 정제된 언어로 시각화합니다.",
      count: "(12)",
      image: "https://images.unsplash.com/photo-1658863025658-4a259cc68fc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "02",
      title: "WEB &\nDIGITAL",
      desc: "반응형 웹, 앱 UI/UX, 인터랙티브 경험 설계. 사용자 중심의 디지털 프로덕트를 만듭니다.",
      count: "(08)",
      image: "https://images.unsplash.com/photo-1750056393331-82e69d28c9d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "03",
      title: "MARKETING\nCAMPAIGN",
      desc: "캠페인, 콘텐츠 제작, 퍼포먼스 마케팅. 브랜드 메시지를 세상에 효과적으로 전달합니다.",
      count: "(15)",
      image: "https://images.unsplash.com/photo-1759308553474-ce2c768a6b7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
    {
      id: "04",
      title: "GOVERNMENT\nSUPPORT",
      desc: "정부지원사업 기반 예산 디자인 실행 최적화.",
      count: "(21)",
      image: "https://images.unsplash.com/photo-1758384077411-6a06e201a177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
    },
  ],
  aboutImage:
    "https://images.unsplash.com/photo-1765371513276-a74f1ecbcf7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
  aboutLine1: "SIG STUDIO는 디자인이 단순한 비주얼이 아닌, 비즈니스 전략이 되는 순간을 만듭니다.",
  aboutLine2: "전문 디자인 파트너로서, 효율적인 예산 운용과 최대의 결과를 도출합니다.",
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
