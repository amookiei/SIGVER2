// =============================================================================
// About 페이지 데이터 타입 & 기본값
// Supabase site_settings 테이블의 key='about'에 JSONB로 저장됩니다.
// =============================================================================

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  desc: string;
  image: string;
}

export interface StatItem {
  num: string;
  label: string;
}

export interface ValueItem {
  id: string;
  num: string;
  title: string;
  desc: string;
}

export interface StudioInfo {
  headline1: string;
  headline2: string;
  description1: string;
  description2: string;
}

export interface AboutData {
  studio: StudioInfo;
  stats: StatItem[];
  values: ValueItem[];
  team: TeamMember[];
}

export const defaultAboutData: AboutData = {
  studio: {
    headline1: "WE MAKE",
    headline2: "BRANDS MOVE.",
    description1:
      "SIG Studio는 2024년 서울에서 시작된 디자인 에이전시입니다. 브랜드 아이덴티티, 디지털 경험, 마케팅 캠페인까지 브랜드가 살아 숨쉬는 순간을 만들어냅니다.",
    description2:
      "정부지원사업부터 대기업 리브랜딩까지 다양한 클라이언트와 협업하며, 문제를 해결하는 디자인을 만들어냅니다.",
  },
  stats: [
    { num: "8+",   label: "Years"    },
    { num: "120+", label: "Projects" },
    { num: "60+",  label: "Clients"  },
    { num: "4",    label: "Awards"   },
  ],
  values: [
    {
      id: "v1",
      num: "01",
      title: "본질에 집중",
      desc: "우리는 비주얼만 만드는 게 아닙니다. 브랜드의 본질을 깊이 이해하고 그것을 가장 직관적인 방식으로 표현합니다.",
    },
    {
      id: "v2",
      num: "02",
      title: "경험을 설계",
      desc: "모든 터치포인트가 하나의 경험으로 연결되도록 설계합니다. 로고부터 디지털 프로덕트까지 일관된 브랜드 세계를 구축합니다.",
    },
    {
      id: "v3",
      num: "03",
      title: "함께 성장",
      desc: "클라이언트와의 파트너십을 중시합니다. 단순한 용역이 아닌, 장기적인 브랜드 성장을 함께 만들어 갑니다.",
    },
  ],
  team: [
    {
      id: "t1",
      name: "김지훈",
      role: "Creative Director",
      desc: "10년 경력의 브랜드 디자이너. 삼성, 현대 등 대형 클라이언트와 협업.",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500",
    },
    {
      id: "t2",
      name: "박서연",
      role: "UX Lead",
      desc: "사용자 중심 디자인의 전문가. 복잡한 서비스를 단순하게 만드는 것이 특기.",
      image:
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500",
    },
    {
      id: "t3",
      name: "이민우",
      role: "Motion Designer",
      desc: "인터랙션과 모션 디자인 전문. GSAP, After Effects 고수.",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=500",
    },
  ],
};
