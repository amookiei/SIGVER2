import DOMPurify from "dompurify";

// ─── HTML sanitizer (XSS 방어) ────────────────────────────
export function sanitizeHTML(dirty: string): string {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "li", "ol"],
    ALLOWED_ATTR: [],
  });
}

// ─── Plain text sanitizer ─────────────────────────────────
export function sanitizeText(input: string): string {
  if (typeof window === "undefined") return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// ─── 에러 메시지 노출 차단 ────────────────────────────────
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message;
    if (/PGRST|PostgreSQL|supabase|prisma|sequelize|pg\s/i.test(msg)) {
      return "데이터베이스 오류가 발생했습니다.";
    }
    if (/Failed to fetch|network|fetch|ERR_/i.test(msg)) {
      return "네트워크 오류가 발생했습니다.";
    }
    // 스택 트레이스 제거, 길이 제한
    return msg.replace(/\n[\s\S]*/g, "").slice(0, 150);
  }
  if (typeof error === "string") {
    return error.slice(0, 150);
  }
  return "알 수 없는 오류가 발생했습니다.";
}
