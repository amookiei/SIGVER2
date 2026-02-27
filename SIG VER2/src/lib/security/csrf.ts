// ─── CSRF 토큰 관리 ───────────────────────────────────────
// SPA + Supabase Bearer token 구조에서 CSRF 위험은 낮지만
// 폼 제출(Formspree 등) 보호를 위해 Double-Submit 패턴 적용

const CSRF_KEY = "sig_csrf";

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

// 토큰 초기화 (없으면 생성, 있으면 기존 반환)
export function initCsrfToken(): string {
  try {
    const existing = sessionStorage.getItem(CSRF_KEY);
    if (existing) return existing;
    const token = randomHex(32);
    sessionStorage.setItem(CSRF_KEY, token);
    return token;
  } catch {
    return randomHex(32);
  }
}

export function getCsrfToken(): string | null {
  try {
    return sessionStorage.getItem(CSRF_KEY);
  } catch {
    return null;
  }
}

// 상수 시간 비교 (타이밍 공격 방어)
export function verifyCsrfToken(submitted: string): boolean {
  const stored = getCsrfToken();
  if (!stored || !submitted) return false;
  if (stored.length !== submitted.length) return false;
  let diff = 0;
  for (let i = 0; i < stored.length; i++) {
    diff |= stored.charCodeAt(i) ^ submitted.charCodeAt(i);
  }
  return diff === 0;
}

// 토큰 교체 (제출 후 갱신)
export function rotateCsrfToken(): string {
  try {
    const token = randomHex(32);
    sessionStorage.setItem(CSRF_KEY, token);
    return token;
  } catch {
    return randomHex(32);
  }
}
