// =============================================================================
// SIG Studio — 이미지 레지스트리
// =============================================================================
//
// ✅ 이미지 추가하는 법 (GitHub에서 직접 업로드):
//   1. public/images/projects/{slug}/ 폴더에 JPG 파일을 올리세요.
//      파일명 규칙: thumb.jpg / hero.jpg / gallery-1.jpg / gallery-2.jpg ...
//      권장 해상도: thumb 1080×720 · hero 1920×1080 · gallery 1200×800
//
//   2. 아래 IMG 객체에서 해당 slug 블록의 경로 문자열을 확인하세요.
//      파일명이 같으면 경로가 자동으로 맞아 코드 수정이 필요 없습니다.
//
// ✏️  새 프로젝트 추가할 때:
//   1. public/images/projects/{새slug}/ 폴더 만들고 이미지 업로드
//   2. 아래 IMG 객체에 새 블록 추가 (템플릿 참고)
//   3. portfolio.ts에 프로젝트 데이터 추가
//
// =============================================================================

export const IMG: Record<
  string,
  { thumbnail: string; heroImage: string; gallery: string[] }
> = {
  // ─── 1. hyundai-rebrand ───────────────────────────────────────────────────
  "hyundai-rebrand": {
    thumbnail: "/images/projects/hyundai-rebrand/thumb.jpg",
    heroImage:  "/images/projects/hyundai-rebrand/hero.jpg",
    gallery: [
      "/images/projects/hyundai-rebrand/gallery-1.jpg",
      "/images/projects/hyundai-rebrand/gallery-2.jpg",
      "/images/projects/hyundai-rebrand/gallery-3.jpg",
    ],
  },

  // ─── 2. naver-design-system ──────────────────────────────────────────────
  "naver-design-system": {
    thumbnail: "/images/projects/naver-design-system/thumb.jpg",
    heroImage:  "/images/projects/naver-design-system/hero.jpg",
    gallery: [
      "/images/projects/naver-design-system/gallery-1.jpg",
      "/images/projects/naver-design-system/gallery-2.jpg",
      "/images/projects/naver-design-system/gallery-3.jpg",
    ],
  },

  // ─── 3. samsung-galaxy-campaign ──────────────────────────────────────────
  "samsung-galaxy-campaign": {
    thumbnail: "/images/projects/samsung-galaxy-campaign/thumb.jpg",
    heroImage:  "/images/projects/samsung-galaxy-campaign/hero.jpg",
    gallery: [
      "/images/projects/samsung-galaxy-campaign/gallery-1.jpg",
      "/images/projects/samsung-galaxy-campaign/gallery-2.jpg",
    ],
  },

  // ─── 4. kakao-brand-kit ──────────────────────────────────────────────────
  "kakao-brand-kit": {
    thumbnail: "/images/projects/kakao-brand-kit/thumb.jpg",
    heroImage:  "/images/projects/kakao-brand-kit/hero.jpg",
    gallery: [
      "/images/projects/kakao-brand-kit/gallery-1.jpg",
      "/images/projects/kakao-brand-kit/gallery-2.jpg",
    ],
  },

  // ─── 5. seoul-city-portal ────────────────────────────────────────────────
  "seoul-city-portal": {
    thumbnail: "/images/projects/seoul-city-portal/thumb.jpg",
    heroImage:  "/images/projects/seoul-city-portal/hero.jpg",
    gallery: [
      "/images/projects/seoul-city-portal/gallery-1.jpg",
      "/images/projects/seoul-city-portal/gallery-2.jpg",
    ],
  },

  // ─── 2-b. M3AT ───────────────────────────────────────────────────────────
  "M3AT": {
    thumbnail: "/images/projects/M3AT/thumb.jpg",
    heroImage:  "/images/projects/M3AT/hero.jpg",
    gallery: [
      "/images/projects/M3AT/gallery-1.jpg",
      "/images/projects/M3AT/gallery-2.jpg",
    ],
  },

  // ─── 6. krafton-editorial ────────────────────────────────────────────────
  "krafton-editorial": {
    thumbnail: "/images/projects/krafton-editorial/thumb.jpg",
    heroImage:  "/images/projects/krafton-editorial/hero.jpg",
    gallery: [
      "/images/projects/krafton-editorial/gallery-1.jpg",
      "/images/projects/krafton-editorial/gallery-2.jpg",
    ],
  },

  // ─── 새 프로젝트 템플릿 ───────────────────────────────────────────────────
  // "your-project-slug": {
  //   thumbnail: "/images/projects/your-project-slug/thumb.jpg",
  //   heroImage:  "/images/projects/your-project-slug/hero.jpg",
  //   gallery: [
  //     "/images/projects/your-project-slug/gallery-1.jpg",
  //     "/images/projects/your-project-slug/gallery-2.jpg",
  //   ],
  // },
};
