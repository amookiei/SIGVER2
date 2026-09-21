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
    headline2: "BRANDS REAL.",
    description1:
      "스튜디오 시그(STUDIO SIG, 법인명 시그코퍼레이션)는 브랜드와 패키지 설계를 생산 현장의 언어로 번역하는 회사입니다. 규격·칼선·소재를 처음부터 생산 기준으로 잡고, 색은 제판 전에 시뮬레이션하고, 현장에서는 측색값으로 판정합니다.",
    description2:
      "그라비아 연포장을 비롯한 공정별 제조 파트너, 그리고 해외 생산 파트너와 같은 문서·같은 기준으로 협업합니다. 이 과정에서 반복해 겪은 문제를 풀기 위해 웹 패키지 스튜디오 siging을 직접 만들었습니다.",
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
      title: "설계가 생산을 안다",
      desc: "예쁜 시안이 아니라 만들어지는 시안을 그립니다. 칼선·실링·거싯·블리드를 규격에서 출발해 설계하고, 3D 목업으로 실물을 먼저 확인합니다.",
    },
    {
      id: "v2",
      num: "02",
      title: "감리로 증명한다",
      desc: "색은 감이 아니라 숫자로 판정합니다. 색판을 계획하고 핀트와 라미 변화를 제판 전에 시뮬레이션하며, 현장에서는 ΔE 측색으로 합격을 결정합니다.",
    },
    {
      id: "v3",
      num: "03",
      title: "국경 없는 기준",
      desc: "규격·색 기준·감리 절차를 문서로 시스템화해 해외 파트너와도 같은 품질을 재현합니다. 수출 표기 검수와 적재 계획까지 한 흐름으로 잇습니다.",
    },
  ],
  team: [],
};
