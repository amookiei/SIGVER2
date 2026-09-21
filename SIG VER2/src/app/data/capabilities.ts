// =============================================================================
// 회사 역량·프로세스·siging 제품 소개 데이터
// 홈(Home.tsx)과 /siging(Siging.tsx) 페이지가 공유합니다. 문구 수정은 여기서.
// =============================================================================

export const SIGING_URL = "https://siging.kr";

export interface Capability {
  id: string;
  num: string;
  /** 영문 디스플레이 타이틀 (줄바꿈은 \n) */
  title: string;
  titleKo: string;
  desc: string;
  items: string[];
}

export const capabilities: Capability[] = [
  {
    id: "brand",
    num: "01",
    title: "BRAND &\nPACKAGE",
    titleKo: "브랜드·패키지 설계",
    desc: "브랜드 아이덴티티에서 패키지 구조까지. 규격·칼선·소재를 처음부터 생산 기준으로 설계합니다.",
    items: ["브랜드 아이덴티티", "패키지 구조·칼선 설계", "3D 목업·상세페이지 이미지", "시안 프리플라이트(해상도·TAC·가뮤트)"],
  },
  {
    id: "prepress",
    num: "02",
    title: "PREPRESS &\nSUPERVISION",
    titleKo: "제판·인쇄 감리",
    desc: "색판 구성, 핀트 오차, 라미네이션 색 변화를 제판 전에 검증하고 현장에서는 측색으로 확인합니다.",
    items: ["색판 플래너·도수 계산", "핀트·라미네이션 시뮬레이션", "현장 측색 ΔE 감리", "감리 체크리스트·Stop Rule"],
  },
  {
    id: "production",
    num: "03",
    title: "PRODUCTION\nPARTNERS",
    titleKo: "생산 파트너 네트워크",
    desc: "연포장·박스·라벨 등 공정별 제조 파트너와 발주 사양서·컨트롤 스트립 기준으로 협업합니다.",
    items: ["그라비아 연포장(OPP)", "파우치 5종·박스·라벨", "발주 사양서·색판 시안표", "샘플 → 양산 관리"],
  },
  {
    id: "global",
    num: "04",
    title: "GLOBAL\nCOOPERATION",
    titleKo: "해외 협력·시스템화",
    desc: "규격·색 기준·감리 절차를 문서화해 해외 파트너와도 같은 품질을 재현하는 협업 체계를 만듭니다.",
    items: ["수출 표기 규정 검수", "해외 생산 파트너 협업", "규격·기준 문서화", "박스·팔레트·트럭 적재 시뮬레이션"],
  },
];

export interface ProcessStep {
  num: string;
  title: string;
  desc: string;
  /** 해당 단계에서 쓰이는 siging 도구 (없으면 생략) */
  tool?: string;
}

export const processSteps: ProcessStep[] = [
  { num: "01", title: "설계", desc: "브랜드 방향과 제품에 맞는 포장 형태·규격을 정합니다.", tool: "siging 추천 마법사" },
  { num: "02", title: "칼선·시안", desc: "칼선을 자동 생성하고 3D 목업으로 실물을 미리 검증합니다.", tool: "siging 3D 스튜디오" },
  { num: "03", title: "제판·감리", desc: "색판·핀트·라미 변화를 시뮬레이션하고 현장에서 측색합니다.", tool: "siging 그라비아 도구" },
  { num: "04", title: "생산", desc: "제조 파트너에 사양서를 전달하고 샘플부터 양산까지 관리합니다." },
  { num: "05", title: "해외 협력", desc: "수출 표기 검수와 적재 계획까지, 국경을 넘어도 같은 기준으로.", tool: "siging 검수·적재" },
];

/** siging.kr 랜딩의 6대 기능 (siging 제품 카피 그대로) */
export const sigingFeatures: { title: string; desc: string }[] = [
  { title: "규격만 입력하면 칼선과 3D 목업이 즉시", desc: "봉지·박스·병 치수를 넣는 순간 칼선(전개도)과 3D 모델이 실시간으로 만들어져요. 칼선은 SVG·PDF로 바로 내려받아 일러스트레이터에서 편집할 수 있어요." },
  { title: "실물에 가까운 물리 기반 렌더링", desc: "질소 충전량, 주름, 실링 엠보싱, 유광·무광·투명 창까지 실제 포장재의 질감을 재현해요. 샘플을 만들기 전에 화면에서 완성품을 확인해요." },
  { title: "시안 한 장으로 상세페이지 이미지와 3D 파일까지", desc: "면별로 시안을 올리면 조명·배경·각도를 조절한 고해상도 PNG와 OBJ·STL 파일을 바로 내보내요." },
  { title: "박스 · 팔레트 · 트럭 적재 시뮬레이션", desc: "박스에 몇 개 들어가는지, 팔레트와 트럭에 어떻게 쌓이는지 자동으로 계산하고 3D로 보여줘요." },
  { title: "수출 표기 검수와 그라비아 인쇄 감리", desc: "시안 글자를 인식해 중국 수출 표기 규정을 자동 점검하고, 색판 플래너·핀트 시뮬레이터·측색 기록 등 감리 도구를 함께 제공해요." },
  { title: "전문 지식 없이도 질문에 답하며 시작", desc: "사무직·디자이너 모드를 고르고, \"어떤 제품을 담으시나요?\" 같은 질문에 답하면 알맞은 포장 형태와 크기를 추천해요." },
];

/** 그라비아 프리프레스·감리 도구 (siging /gravure) */
export const sigingGravureTools: { name: string; desc: string }[] = [
  { name: "색판 플래너", desc: "요소 단위 별색/합색 판정, 도수(동판) 계산, 색판 구성표 내보내기" },
  { name: "핀트 시뮬레이터", desc: "CMYK 4판 분판으로 판별 오차(mm) 재현, 녹아웃 가장자리 색 번짐 사전 확인" },
  { name: "라미네이션 색 변화 프리뷰", desc: "광택 상승·접착제 황변·필름 투과를 Lab 공간에서 근사, ΔE(CIEDE2000) 예측" },
  { name: "컨트롤 스트립 생성기", desc: "원색·별색·백색·레지스터 마크를 1:1 SVG/PDF로, 제판소 표준 질의문 자동 작성" },
  { name: "프리플라이트", desc: "유효 DPI · 잉크 커버리지(TAC) 히트맵 · RGB 전용 색 소프트프루프 자동 판정" },
  { name: "측색 분석·타겟 포인트", desc: "감리 측색값(L*a*b*) 기록 → ΔE₇₆/ΔE₉₄/ΔE₀₀/CMC 자동 계산, 허용 오차 판정" },
  { name: "감리 체크리스트", desc: "설계→제판→감리→라미 후 단계별 체크리스트, Stop Rule, 클라이언트 사전 고지 문구" },
  { name: "모바일 감리 모드", desc: "현장에서 측색 기록·체크리스트·타겟 포인트를 데스크톱과 자동 동기화" },
];
