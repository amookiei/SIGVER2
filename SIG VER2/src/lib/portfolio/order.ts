// =============================================================================
// 포트폴리오 표시 순서 유틸 — Work 목록·홈·관리자 목록이 같은 규칙으로 정렬된다
// =============================================================================

interface Orderable {
  id: number;
  order?: number;
}

/**
 * 표시 순서로 정렬한 새 배열을 돌려준다.
 * order 가 있는 항목이 앞(오름차순), 없는 항목은 뒤에 id 순으로.
 */
export function sortByOrder<T extends Orderable>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const ao = a.order ?? Number.POSITIVE_INFINITY;
    const bo = b.order ?? Number.POSITIVE_INFINITY;
    if (ao !== bo) return ao - bo;
    return a.id - b.id;
  });
}

/** 배열에서 from 위치의 항목을 to 위치로 옮긴 새 배열. 범위를 벗어나면 그대로. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

/** 주어진 순서대로 order 를 1부터 다시 매긴다 (순서에 없는 항목은 뒤에 이어 붙임). */
export function renumber<T extends Orderable>(items: readonly T[], orderedIds: readonly number[]): T[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const seen = new Set<number>();
  const result: T[] = [];
  for (const id of orderedIds) {
    const item = byId.get(id);
    if (item && !seen.has(id)) {
      seen.add(id);
      result.push({ ...item, order: result.length + 1 });
    }
  }
  for (const item of sortByOrder(items)) {
    if (!seen.has(item.id)) result.push({ ...item, order: result.length + 1 });
  }
  return result;
}
