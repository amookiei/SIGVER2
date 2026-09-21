// =============================================================================
// 회사 역량·프로세스·siging 제품 소개 데이터
// 홈(Home.tsx)과 /siging(Siging.tsx) 페이지가 공유합니다. 문구 수정은 여기서.
//
// ✏️ 줄바꿈 규칙: desc 안의 "\n" 은 화면에서 실제 줄바꿈으로 렌더링됩니다
//    (whiteSpace: pre-line). 한 줄은 의미 단위로 끊고 20자 안팎을 유지하세요.
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
    desc: "브랜드에서 패키지 구조까지.\n처음부터 생산 기준으로 설계합니다.",
    items: ["브랜드 아이덴티티", "패키지 구조·칼선 설계", "3D 목업·상세페이지 이미지", "시안 프리플라이트"],
  },
  {
    id: "prepress",
    num: "02",
    title: "PREPRESS &\nSUPERVISION",
    titleKo: "제판·인쇄 감리",
    desc: "색은 감이 아니라 숫자로.\n제판 전에 검증하고, 현장에서 측색합니다.",
    items: ["색판 플래너·도수 계산", "핀트·라미네이션 시뮬레이션", "현장 측색 ΔE 판정", "감리 체크리스트·Stop Rule"],
  },
  {
    id: "production",
    num: "03",
    title: "PRODUCTION\nPARTNERS",
    titleKo: "생산 파트너",
    desc: "공정별 제조 파트너와\n사양서 기준으로 양산까지.",
    items: ["그라비아 연포장(OPP)", "파우치·박스·병 패키지", "발주 사양서·색판 시안표", "샘플 → 양산 관리"],
  },
  {
    id: "global",
    num: "04",
    title: "GLOBAL\nCOOPERATION",
    titleKo: "해외 협력",
    desc: "기준을 문서로 시스템화해\n해외 파트너와도 같은 품질로.",
    items: ["수출 표기 검수 (GB 7718·28050)", "해외 생산 파트너 협업", "규격·색 기준 문서화", "팔레트·트럭 적재 시뮬레이션"],
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
  { num: "01", title: "설계", desc: "제품 정보만 넣으면\n포장 형태와 규격을 추천합니다.", tool: "siging 추천" },
  { num: "02", title: "칼선·시안", desc: "칼선은 자동 생성,\n3D 목업으로 먼저 확인합니다.", tool: "siging 3D" },
  { num: "03", title: "제판·감리", desc: "색판·핀트·라미 변화를 시뮬레이션,\n현장에선 ΔE로 판정합니다.", tool: "siging 그라비아" },
  { num: "04", title: "생산", desc: "사양서로 파트너에 전달,\n샘플부터 양산까지 관리합니다." },
  { num: "05", title: "해외 협력", desc: "수출 표기 검수와 적재 계획까지,\n국경 너머도 같은 기준으로.", tool: "siging 검수·적재" },
];

/** 홈 siging 섹션 불릿 — 짧게, 숫자 중심 */
export const sigingHighlights: string[] = [
  "규격 입력 → 칼선·3D 목업 즉시 생성",
  "봉지 · 박스 · 병, 11종 파라메트릭 3D 모델",
  "봉지 → 박스 → 팔레트 → 트럭 적재 시뮬레이션",
  "중국 수출 표기 검수 · 그라비아 감리 도구 10종",
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

/** siging 3대 워크스페이스 (기능설명서 v1.0 기준) */
export interface SigingWorkspace {
  num: string;
  name: string;
  summary: string;
  details: string[];
}

export const sigingWorkspaces: SigingWorkspace[] = [
  {
    num: "01",
    name: "3D 시뮬레이터",
    summary: "봉지·박스·병을 규격으로 만들고,\n시안을 입혀 실물처럼 봅니다.",
    details: [
      "봉지 4종 — 백씰 백 · 3면 밀봉백 · 스탠드업 파우치 · 종이 스틱",
      "박스 2종 — 단상자(터크 엔드) · 우유곽(게이블탑)",
      "병 5종 — 소스병 · 스퀴즈 병 · 시즈닝 자 · 컵볼 등, 재질 5종",
      "후가공 — 질소 충전 · 주름 · 실링 엠보싱 · 핑킹컷 · 행잉홀 6종 · 노치 · 지퍼",
      "면당 3종 SVG 마스크 — 유광 · 무광 · 투명창",
      "내보내기 — 칼선 SVG·PDF, 렌더 PNG, 메시 OBJ·STL",
      "적재 시뮬 — 봉지 패킹 → 실물 박스 → 팔레트(T11·1200×1000) → 트럭 7종",
    ],
  },
  {
    num: "02",
    name: "패키지 검수",
    summary: "시안 글자를 읽어\n수출 표기 규정을 자동 판정합니다.",
    details: [
      "중국 GB 7718 · GB 28050 — 중문 최소 크기 · 종횡비 1:3 규칙",
      "브라우저 내 OCR (중·영·한 동시 인식, 서버 전송 없음)",
      "px → mm 스케일 보정, 글자 높이 mm 산출",
      "같은 의미 다국어 문구를 AI가 묶어 최소 크기 규칙 판정",
      "검수 요약 리포트",
    ],
  },
  {
    num: "03",
    name: "그라비아 스튜디오",
    summary: "발주·제판·감리를 위한\n프리프레스 도구 10종과 현장 감리 모드.",
    details: [
      "설계 — 색판 플래너 · 색판 시안표 · 프리플라이트 · 잉크 프리셋(CIP3)",
      "검증 — 핀트 시뮬레이터 · 라미 색 변화 프리뷰 · 컨트롤 스트립",
      "감리 — 타겟 포인트 · 측색 분석(ΔE76·94·2000·CMC) · 체크리스트",
      "모바일 감리 모드 — 인쇄소 현장에서 측색 기록, 데스크톱과 자동 동기화",
    ],
  },
];

/** 그라비아 프리프레스·감리 도구 10종 (siging /gravure) */
export const sigingGravureTools: { name: string; desc: string }[] = [
  { name: "색판 플래너", desc: "요소 8종 분류 + 별색 판단 질문 5개 → 별색/합색 판정, 동판 도수 산출, 구성표 내보내기" },
  { name: "색판 시안표", desc: "발주용 표지 SVG 생성, 팬톤 코트 룩업" },
  { name: "프리플라이트", desc: "해상도 · TAC 300% · 가뮤트 ΔE 기준으로 적합/주의/부적합 자동 판정" },
  { name: "잉크 프리셋", desc: "CIP3식 존별 잉크 키 개도, 피지별 커브 4종, 콘솔 입력용 CSV" },
  { name: "타겟 포인트", desc: "시안 클릭 → 3×3mm 평균 Lab·CMYK 저장, 인접 포인트 농도차 경고" },
  { name: "측색 분석", desc: "ΔE76 · ΔE94 · ΔE2000 · ΔECMC 계산 + 해석문, 감리 기록 CSV" },
  { name: "핀트 시뮬레이터", desc: "CMYK 4판 어긋남 미리보기 — 사방 분산 · 주행 · 폭 방향 · M판 밀림" },
  { name: "라미 색 변화", desc: "라미네이팅 후 색 변화 예측 — 광택 상승 · 접착제 황변 · 필름 투과, ΔE00 예측" },
  { name: "컨트롤 스트립", desc: "측색 패치 띠 1:1 SVG/PDF 생성" },
  { name: "감리 체크리스트", desc: "설계 → 제판 → 감리 → 라미 후 단계별 체크 + Stop Rule + 사전 고지 문구" },
];

/** 진행 중·예정 기능 (과업지시서 v1.4 / 2026 Q4 단기 과업 기준) */
export const sigingRoadmap: { title: string; desc: string; status: "진행 중" | "예정" }[] = [
  { title: "전개도 자동 접힘 (Dieline-to-3D)", desc: "칼선을 올리면 재단선·접는선을 읽어 3D로 접어 줍니다.", status: "진행 중" },
  { title: "Adobe Illustrator 연동", desc: "일러스트에서 고치면 3D 목업이 실시간으로 갱신됩니다.", status: "예정" },
  { title: "통합 개발 파이프라인", desc: "제품 정보 → 구조 추천 → 3D 검토 → 컬러·감리 → 최종 사양서까지 한 흐름으로.", status: "예정" },
  { title: "디자이너 · 사무직 이원화 UX", desc: "같은 기능을 직군에 맞는 화면과 용어로. 사무직은 마법사형, 디자이너는 수치 정밀 입력.", status: "예정" },
];
