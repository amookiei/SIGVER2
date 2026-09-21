// =============================================================================
// SIG Studio — 포트폴리오 데이터 파일
// =============================================================================
//
// ✏️  새 프로젝트 추가하는 법:
//   1. src/assets/images/index.ts 에 이미지를 등록합니다.
//   2. 아래 portfolioItems 배열에 새 객체를 추가합니다.
//   3. 이전 마지막 항목의 nextProject를 새 slug로 업데이트합니다.
//   4. 저장하면 Work 리스트와 상세 페이지에 자동 반영됩니다.
//
// 🖼️  이미지:
//   - 로컬 파일: src/assets/images/projects/{slug}/ 에 넣고 index.ts에서 import
//   - 권장 해상도: thumbnail 1080×720, heroImage 1920×1080, gallery 1200×800
//
// =============================================================================

import { IMG } from "../../assets/images";

export type Category = "Branding" | "Web Design" | "Campaign" | "Government";

// ─── 커스텀 콘텐츠 블록 ────────────────────────────────────────────────────────
export type ContentBlock =
  | { id: string; type: "text"; title: string; body: string }
  | { id: string; type: "image"; images: string[]; imageCount?: 1 | 2 }; // imageCount: 1=풀와이드, 2=나란히

export interface PortfolioItem {
  // ── 기본 정보 ───────────────────────────────────────────────────────────────
  id: number;           // 고유 숫자 ID. 추가할 때 마지막 id + 1로 증가시키세요.
  slug: string;         // URL에 사용되는 영문 식별자. 소문자·하이픈만 사용. (예: "seoul-city-portal")
  title: string;        // 카드·상세 헤딩에 표시되는 프로젝트명. 보통 모두 대문자.
  client: string;       // 클라이언트 이름 (한국어 또는 영문)
  category: Category;   // 필터 카테고리. 위 Category 타입 중 하나를 선택.
  year: number;         // 프로젝트 완료 연도

  // ── 노출 설정 ────────────────────────────────────────────────────────────────
  featured: boolean;    // true 시 홈 페이지 Featured 섹션에 노출됩니다.
  order?: number;       // featured 항목 간 노출 순서 (낮을수록 먼저). 생략 시 id 순.
  hidden?: boolean;     // true 시 Work/홈 등 모든 공개 페이지에서 숨겨집니다. (삭제 없이 임시 비공개)

  // ── 이미지 ──────────────────────────────────────────────────────────────────
  thumbnail: string;       // Work 리스트 카드에 보이는 썸네일 이미지 URL.
  thumbnailHover?: string; // (선택) Work 카드 호버 시 교체되는 이미지 URL. 없으면 기본 스케일 효과만 적용.
  heroImage: string;       // 상세 페이지 상단 풀와이드 히어로 이미지 URL.
  gallery: string[];       // 상세 페이지 갤러리 이미지 URL 배열. 최소 2장 권장.

  // ── 텍스트 콘텐츠 ────────────────────────────────────────────────────────────
  tagline: string;      // 카드 하단 한 줄 요약. 40자 이내 권장.
  description: string;  // 상세 페이지 프로젝트 개요. 3~5문장 권장.
  challenge?: string;   // (선택) 레거시. contentBlocks 로 대체됩니다.
  solution?: string;    // (선택) 레거시. contentBlocks 로 대체됩니다.
  contentBlocks?: ContentBlock[]; // (선택) 커스텀 섹션 블록 배열 (텍스트 / 이미지)

  // ── 메타 정보 ────────────────────────────────────────────────────────────────
  role: string;         // SIG Studio가 수행한 역할. 쉼표 구분. (예: "Brand Strategy, Visual Identity")
  duration: string;     // 프로젝트 기간. (예: "3개월", "2024.06 – 2024.09")
  tags: string[];       // 사용 기술·서비스 태그 배열.

  // ── 링크 ─────────────────────────────────────────────────────────────────────
  liveUrl?: string;     // (선택) 실제 서비스 URL. 없으면 버튼이 숨겨집니다.

  // ── 네비게이션 ───────────────────────────────────────────────────────────────
  nextProject?: string; // (선택) 다음 프로젝트의 slug. 상세 하단 "Next Project"에 사용.

  // ── 하단 Work Scope & 추가 정보 ──────────────────────────────────────────────
  workScope?: string[];                              // (선택) 작업 범위 항목 배열. 예: ["Brand Strategy", "Visual Identity"]
  additionalInfo?: { label: string; value: string }[]; // (선택) 추가 키-값 정보 배열. 예: [{label:"Credits", value:"..."}]
}

// =============================================================================
// 포트폴리오 데이터
// =============================================================================

export const portfolioItems: PortfolioItem[] = [
  // ── 2 ───────────────────────────────────────────────────────────────────────
  {
    id: 2,
    slug: "m3at",
    title: "M3AT",
    client: "밋더한우",
    category: "Branding",
    year: 2024,
    featured: true,
    order: 1,

    thumbnail: IMG["M3AT"].thumbnail,
    heroImage: IMG["M3AT"].heroImage,
    gallery: IMG["M3AT"].gallery,

    tagline: "상위0.1% 미식 경험 브랜딩",
    description:
      "상위 0.1% 한우의 정체성을 로고 시스템·키 메시지·색채·카피 톤 등 브랜드 아이덴티티 전반에 재정의했습니다.",
    challenge:
      "미슐랭 파인다이닝의 맛·품격·희소성을 일반 소비자도 '집에서 경험할 수 있는 미식'으로 전달하는 것.",
    solution:
      "패키지 디자인은 청와대 납품 박스의 톤을 계승한 리넨 텍스처·블랙&골드 포일·리본 스텝 구조 등 고급스러운 선물 경험을 강화하는 방향으로 설계했고, 상세페이지는 기준이 되는 ‘한우의 등급 체계 → 파인다이닝 스토리텔링 → ‘No.9’ 희소성 → 시즈닝 3종의 경험 가치 → 리워드 구성’ 까지 자연스럽게 이어지는 구조로 기획했습니다.",
    role: "Packaging",
    duration: "2024.03 – 2024.10 (8개월)",
    tags: ["브랜딩", "UI/UX", "Figma", "React", "Design Token"],

    nextProject: "seoul-city-portal",
  },

  // ── 5 ───────────────────────────────────────────────────────────────────────
  {
    id: 5,
    slug: "seoul-city-portal",
    title: "SEOUL CITY PORTAL",
    client: "서울특별시",
    category: "Government",
    year: 2024,
    featured: true,
    order: 2,

    thumbnail: IMG["seoul-city-portal"].thumbnail,
    heroImage: IMG["seoul-city-portal"].heroImage,
    gallery: IMG["seoul-city-portal"].gallery,

    tagline: "1000만 시민을 위한 디지털 서비스 경험",
    description:
      "서울시 공식 시민 포털 리뉴얼 프로젝트. 접근성과 사용성을 최우선으로 하여 다양한 시민이 편리하게 사용할 수 있는 디지털 서비스 환경을 구축했습니다. 정부 지원 사업의 복잡한 정보를 직관적으로 전달하는 UX를 설계했습니다.",
    challenge:
      "노인, 장애인, 외국인 등 다양한 시민을 대상으로 하는 서비스이므로 WCAG 2.1 AA 기준을 충족하면서도 현대적인 디자인을 유지해야 했습니다.",
    solution:
      "사용자 리서치 기반의 정보 구조(IA) 재설계를 통해 클릭 수를 평균 40% 줄였습니다. 고대비 컬러 시스템과 다국어 타이포그래피를 적용하여 접근성 인증을 취득했습니다.",

    role: "Service Design, UX Research, Accessibility, UI Design",
    duration: "2024.02 – 2024.08 (7개월)",
    tags: ["공공 UX", "접근성", "서비스 디자인", "WCAG"],

    nextProject: "krafton-editorial",
  },

  // ── 6 ───────────────────────────────────────────────────────────────────────
  {
    id: 6,
    slug: "krafton-editorial",
    title: "KRAFTON EDITORIAL",
    client: "크래프톤",
    category: "Campaign",
    year: 2025,
    featured: true,
    order: 3,

    thumbnail: IMG["krafton-editorial"].thumbnail,
    heroImage: IMG["krafton-editorial"].heroImage,
    gallery: IMG["krafton-editorial"].gallery,

    tagline: "게임 세계관과 현실을 잇는 에디토리얼",
    description:
      "크래프톤의 신규 게임 IP 에디토리얼 캠페인. 게임의 세계관을 현실 세계와 연결하는 몰입형 비주얼 스토리를 제작했습니다. 매거진 스타일의 에디토리얼 디자인으로 게임 팬덤을 넘어 더 넓은 대중에게 브랜드를 알렸습니다.",

    role: "Editorial Design, Art Direction, Visual Storytelling",
    duration: "2025.01 – 2025.03 (3개월)",
    tags: ["에디토리얼", "IP 브랜딩", "비주얼 스토리텔링", "아트 디렉션"],

    nextProject: "m3at",
  },
];

// =============================================================================
// 헬퍼 함수 — 컴포넌트에서 바로 import해서 사용하세요
// =============================================================================

/** slug로 단일 프로젝트 조회 */
export function getProjectBySlug(slug: string): PortfolioItem | undefined {
  return portfolioItems.find((p) => p.slug === slug);
}

/** 카테고리 필터링 (undefined 또는 "All" 전달 시 전체 반환) */
export function getProjectsByCategory(category?: string): PortfolioItem[] {
  if (!category || category === "All") return portfolioItems;
  return portfolioItems.filter((p) => p.category === category);
}

/** 홈 Featured 섹션용: featured: true 항목을 order 순으로 반환 */
export function getFeaturedProjects(): PortfolioItem[] {
  return portfolioItems
    .filter((p) => p.featured)
    .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
}

/** 사용 중인 카테고리 목록 (중복 제거, "All" 포함) */
export const CATEGORIES = [
  "All",
  ...Array.from(new Set(portfolioItems.map((p) => p.category))),
] as const;
