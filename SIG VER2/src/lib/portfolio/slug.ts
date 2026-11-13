// =============================================================================
// 포트폴리오 슬러그 유틸 — 관리자 추가/수정 시 URL 슬러그 생성·중복 처리
// =============================================================================

/** 제목 → URL 안전 슬러그. 한글 등 비ASCII만 있으면 빈 문자열을 돌려준다. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * `taken`에 없는 슬러그를 돌려준다. base가 비어 있으면 "project"로 시작하고,
 * 이미 쓰이면 -2, -3 … 을 붙인다.
 */
export function makeUniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(Array.from(taken).map((s) => s.toLowerCase()));
  const root = slugify(base) || "project";
  if (!used.has(root)) return root;
  for (let n = 2; n < 10_000; n++) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** 같은 슬러그를 쓰는 다른 항목을 찾는다 (excludeId는 수정 중인 항목 자신). */
export function findSlugOwner<T extends { id: number; slug: string }>(
  slug: string,
  items: readonly T[],
  excludeId?: number,
): T | undefined {
  const s = slug.toLowerCase();
  return items.find((i) => i.slug.toLowerCase() === s && i.id !== excludeId);
}

/** Supabase/Postgres 오류 메시지를 관리자가 바로 행동할 수 있는 한국어 안내로 바꾼다. */
export function friendlyDbError(message: string | undefined | null): string {
  const m = message ?? "";
  if (m.includes("portfolio_items_slug_key")) {
    return "이미 같은 슬러그(URL)를 가진 프로젝트가 DB에 있습니다. 슬러그를 다른 값으로 바꿔주세요. (삭제한 프로젝트가 DB에 남아 있을 수도 있습니다 — 목록을 새로고침해 확인하세요)";
  }
  if (m.includes("portfolio_items_pkey")) {
    return "같은 ID의 프로젝트가 이미 DB에 있습니다. 목록을 새로고침한 뒤 다시 시도해주세요.";
  }
  return m || "알 수 없는 오류";
}
