// ─── 세션 관리 ────────────────────────────────────────────
// sessionStorage 기반 – 탭/브라우저 닫으면 자동 만료
// localStorage 구버전 세션은 자동 삭제

const SESSION_KEY = "sig_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8시간
const RENEWAL_THRESHOLD_MS = 30 * 60 * 1000; // 30분 미만 남으면 갱신

interface SessionData {
  sessionId: string;
  expiresAt: number;
  fingerprint: string;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getFingerprint(): string {
  try {
    const parts = [
      typeof navigator !== "undefined" ? navigator.userAgent : "",
      typeof navigator !== "undefined" ? navigator.language : "",
      typeof screen !== "undefined" ? `${screen.width}x${screen.height}` : "",
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "",
    ].join("||");

    // FNV-1a 32-bit hash
    let h = 0x811c9dc5;
    for (let i = 0; i < parts.length; i++) {
      h ^= parts.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16);
  } catch {
    return "fallback";
  }
}

export function createSession(): void {
  const now = Date.now();
  const session: SessionData = {
    sessionId: randomHex(32),
    expiresAt: now + SESSION_TTL_MS,
    fingerprint: getFingerprint(),
  };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // 구버전 localStorage 세션 제거
    localStorage.removeItem("sig_admin_session");
  } catch {
    // ignore
  }
}

export function loadSession(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;

    const session = JSON.parse(raw) as SessionData;
    const now = Date.now();

    if (now >= session.expiresAt) {
      clearSession();
      return false;
    }

    if (session.fingerprint !== getFingerprint()) {
      clearSession();
      return false;
    }

    // 만료 임박 시 갱신
    if (session.expiresAt - now < RENEWAL_THRESHOLD_MS) {
      session.expiresAt = now + SESSION_TTL_MS;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return true;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("sig_admin_session");
  } catch {
    // ignore
  }
}
