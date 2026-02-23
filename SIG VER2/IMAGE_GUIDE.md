# SIG Studio — 이미지 & 프로젝트 추가 가이드

---

## 1. 이미지가 사용되는 섹션 전체 목록

| 위치 | 파일 경로 | 용도 | 권장 해상도 | 비율 |
|------|-----------|------|-------------|------|
| Work 카드 썸네일 | `public/images/projects/{slug}/thumb.jpg` | Work 리스트 카드 이미지 | **1080 × 720** | 3:2 |
| WorkDetail 히어로 | `public/images/projects/{slug}/hero.jpg` | 상세 페이지 상단 풀와이드 | **1920 × 1080** | 16:9 |
| WorkDetail 갤러리 | `public/images/projects/{slug}/gallery-1.jpg` 등 | 상세 페이지 갤러리 | **1200 × 800** | 3:2 |
| About 팀 사진 | `public/images/about/team-{이름}.jpg` | About 팀 섹션 인물 사진 | **800 × 1067** | 3:4 |

> 형식: **JPG** 권장. PNG도 가능하나 파일 크기 주의.  
> 용량: thumb 500KB 이하 / hero 1MB 이하 / gallery 700KB 이하 권장.

---

## 2. 섹션별 상세 가이드

### 2-1. Work 카드 썸네일 (`thumb.jpg`)

```
노출 위치: /work 페이지 프로젝트 카드 · 홈 Featured 섹션
표시 방식: 기본 숨김 → 호버 시 reveal (흑백 → 컬러)
```

- **촬영/편집 팁:** 주제가 중앙에 오도록 크롭. 여백이 많으면 호버 시 임팩트 감소.
- 카드 비율이 **3:2** 로 고정되므로 반드시 가로형 이미지 사용.

---

### 2-2. WorkDetail 히어로 (`hero.jpg`)

```
노출 위치: /work/{slug} 상세 페이지 최상단 전체 너비
표시 방식: 스크롤 시 패럴랙스 + 페이드 아웃
```

- 고해상도일수록 자연스러운 패럴랙스 효과.
- 이미지 상단 15~20%는 헤더에 가려질 수 있으므로 핵심 요소를 중하단에 배치.
- thumb과 **같은 사진의 고해상도 버전** 사용 권장 (연속성).

---

### 2-3. WorkDetail 갤러리 (`gallery-1.jpg`, `gallery-2.jpg` ...)

```
노출 위치: /work/{slug} 상세 페이지 하단 갤러리
표시 방식: 그리드 레이아웃, 최소 2장 권장
```

- 갤러리 이미지는 **프로세스·결과물·디테일 컷** 으로 구성 권장.
- 장수 제한 없음. `gallery` 배열에 경로만 추가하면 자동 노출.
- 모두 같은 비율(3:2)로 맞추면 그리드가 정돈되어 보임.

---

### 2-4. About 팀 사진 (`team-{이름}.jpg`)

```
노출 위치: /about THE TEAM 섹션
표시 방식: 흑백 처리 → 호버 시 컬러 전환 + 줌
비율: 3:4 (세로형)
```

- **인물이 중앙 상단**에 오도록 크롭. 카드 하단이 잘릴 수 있음.
- 배경이 단순할수록 흑백→컬러 효과가 강조됨.
- 파일 교체 후 `About.tsx` 의 `team` 배열에서 `image` 경로를 수정:

```ts
// src/app/pages/About.tsx
const team = [
  {
    name: "김지훈",
    role: "Creative Director",
    desc: "...",
    image: "/images/about/team-jihoon.jpg",  // ← 이 경로 수정
  },
  ...
];
```

---

## 3. 새 프로젝트 추가하는 법 (4단계)

### Step 1 — 이미지 준비 & 업로드

GitHub 레포에서 아래 폴더 구조로 업로드:

```
public/images/projects/{새-슬러그}/
  ├── thumb.jpg       필수  (1080×720)
  ├── hero.jpg        필수  (1920×1080)
  ├── gallery-1.jpg   필수
  ├── gallery-2.jpg   필수
  └── gallery-3.jpg   선택
```

> **슬러그 규칙:** 소문자 영문 + 하이픈만 사용.  
> 예: `kakao-brand-kit`, `seoul-city-portal`

---

### Step 2 — `src/assets/images/index.ts` 에 블록 추가

파일 하단 템플릿을 복사해 새 슬러그 블록 추가:

```ts
"새-슬러그": {
  thumbnail: "/images/projects/새-슬러그/thumb.jpg",
  heroImage:  "/images/projects/새-슬러그/hero.jpg",
  gallery: [
    "/images/projects/새-슬러그/gallery-1.jpg",
    "/images/projects/새-슬러그/gallery-2.jpg",
    "/images/projects/새-슬러그/gallery-3.jpg",  // 선택
  ],
},
```

---

### Step 3 — `src/app/data/portfolio.ts` 에 프로젝트 데이터 추가

배열 맨 아래에 새 객체 추가 (id는 마지막 id + 1):

```ts
{
  id: 7,                           // 마지막 id + 1
  slug: "새-슬러그",                // Step 1의 폴더명과 동일
  title: "PROJECT TITLE",          // 대문자 권장
  client: "클라이언트명",
  category: "Branding",            // Branding | Web Design | Campaign | Government
  year: 2025,

  featured: false,                 // 홈 Featured 섹션 노출 여부
  order: 4,                        // featured: true 일 때만 의미 있음

  thumbnail: IMG["새-슬러그"].thumbnail,
  heroImage:  IMG["새-슬러그"].heroImage,
  gallery:    IMG["새-슬러그"].gallery,

  tagline: "한 줄 요약 (40자 이내)",
  description: "프로젝트 개요 3~5문장.",
  challenge: "(선택) 문제 정의.",
  solution:  "(선택) 해결 접근.",

  role: "Brand Strategy, Visual Identity",
  duration: "2025.01 – 2025.03 (3개월)",
  tags: ["브랜드 전략", "아이덴티티"],

  liveUrl: "https://example.com",  // 선택. 없으면 버튼 숨김

  nextProject: "hyundai-rebrand",  // 상세 하단 Next Project 슬러그
},
```

---

### Step 4 — 이전 프로젝트의 `nextProject` 업데이트

마지막으로 추가하기 전 항목의 `nextProject`를 새 슬러그로 교체:

```ts
// 기존 마지막 항목
{
  slug: "krafton-editorial",
  ...
  nextProject: "새-슬러그",   // ← 여기 수정
},
```

---

## 4. 체크리스트 요약

```
□ public/images/projects/{slug}/ 폴더 생성 & 이미지 업로드
□ thumb.jpg / hero.jpg / gallery-*.jpg 파일명 확인
□ src/assets/images/index.ts 에 slug 블록 추가
□ src/app/data/portfolio.ts 에 프로젝트 객체 추가 (id 증가)
□ 이전 항목 nextProject → 새 slug 로 업데이트
□ About 팀 사진 교체 시 About.tsx team 배열 image 경로 수정
```
