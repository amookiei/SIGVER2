import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────
export interface SpaceSpec {
  id: string;
  label: string;
  value: string;
}

export interface SpaceSection {
  id: string;
  icon: string;       // emoji icon
  title: string;
  items: string[];
}

export interface SpaceContent {
  heroImage: string;
  title: string;
  tagline: string;
  description: string;
  reviewEvent: string;   // 리뷰 이벤트 배너 텍스트 (비어있으면 숨김)
  notionUrl: string;     // 기물 보러가기 링크
  specs: SpaceSpec[];
  photos: string[];
  capabilities: string[];
  sections: SpaceSection[];   // 조명장비·조리시설·편의시설 등
}

export const defaultSpaceContent: SpaceContent = {
  heroImage: "",
  title: "MEATVERSE COOKING STUDIO",
  tagline: "유튜브 & 인스타 & 각종 레시피 촬영 전문 쿠킹 스튜디오",
  description:
    "따뜻한 블랙체리 우드톤을 메인으로 한 모던한 쿠킹 스튜디오입니다. 고급스러우면서도 편안한 분위기 속에서 촬영과 요리를 동시에 진행할 수 있는 공간으로, 대형 아일랜드 테이블과 내장형 인덕션을 중심으로 요리 과정을 정면뿐만 아니라 다양한 각도에서 촬영할 수 있어 레시피·푸드 콘텐츠 제작에 최적화되어 있습니다.",
  reviewEvent:
    "리뷰 작성 후 인증 시 이용 시간당 5,000원 페이백 — 최대 30,000원까지 페이백 가능",
  notionUrl: "https://paper-tax-bd7.notion.site/meatverse-manual",
  specs: [
    { id: "s1", label: "위치", value: "서울특별시" },
    { id: "s2", label: "대기 공간", value: "약 7평 (촬영 공간 분리)" },
    { id: "s3", label: "수전", value: "2개 (조리·설거지 동선 분리)" },
    { id: "s4", label: "최대 인원", value: "바테이블 5인" },
    { id: "s5", label: "주차", value: "넓은 지하 주차장 / 화물용 엘리베이터" },
  ],
  photos: [],
  capabilities: [
    "레시피·푸드 콘텐츠",
    "유튜브 촬영",
    "인스타그램 콘텐츠",
    "제품 촬영",
    "라이브 커머스",
  ],
  sections: [
    {
      id: "sec-light",
      icon: "✦",
      title: "조명 장비",
      items: [
        "NANLITE FC-500B 2대 — 전문 지속광",
        "Godox AD600 Pro II 2대 — 전문 순간광",
        "무선 동조기 (소니 · 캐논 카메라 호환)",
        "제품 촬영용 미니 호리존 세팅",
        "촬영용 삼각대",
        "다양한 컬러 배경지",
      ],
    },
    {
      id: "sec-cook",
      icon: "✦",
      title: "조리 시설",
      items: [
        "LG 오브제 광파 오븐 (전자레인지·에어프라이어 내장)",
        "덕트 내장 4구 인덕션",
        "믹서기",
        "칼·도마·냄비·프라이팬·전자저울·믹싱볼 등 기본 조리 도구",
      ],
    },
    {
      id: "sec-amenity",
      icon: "✦",
      title: "편의 시설",
      items: [
        "LG 스탠바이미",
        "최대 5인용 바테이블",
        "4인용 원형 테이블",
        "소파",
        "공기청정기",
      ],
    },
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
      reviewEvent:  p.reviewEvent  ?? defaultSpaceContent.reviewEvent,
      notionUrl:    p.notionUrl    ?? defaultSpaceContent.notionUrl,
      specs:        p.specs        ?? defaultSpaceContent.specs,
      photos:       p.photos       ?? defaultSpaceContent.photos,
      capabilities: p.capabilities ?? defaultSpaceContent.capabilities,
      sections:     p.sections     ?? defaultSpaceContent.sections,
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
  loading: boolean;
  updateContent: (d: SpaceContent) => Promise<void>;
  resetContent: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | null>(null);

export function SpaceProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<SpaceContent>(loadCache);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  const set = (d: SpaceContent) => { setContentState(d); saveCache(d); };

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
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
          reviewEvent:  p.reviewEvent  ?? defaultSpaceContent.reviewEvent,
          notionUrl:    p.notionUrl    ?? defaultSpaceContent.notionUrl,
          specs:        p.specs        ?? defaultSpaceContent.specs,
          photos:       p.photos       ?? defaultSpaceContent.photos,
          capabilities: p.capabilities ?? defaultSpaceContent.capabilities,
          sections:     p.sections     ?? defaultSpaceContent.sections,
        });
      }
    } catch (err) {
      console.error("[SpaceDB fetch]", err);
    } finally {
      setLoading(false);
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
    <SpaceContext.Provider value={{ content, saving, saveError, loading, updateContent, resetContent }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  const ctx = useContext(SpaceContext);
  if (!ctx) throw new Error("useSpace must be inside <SpaceProvider>");
  return ctx;
}
