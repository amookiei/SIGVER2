// ─── 로그인 브루트포스 방어 ───────────────────────────────
// sessionStorage 기반 – 탭 닫으면 초기화, 창 내에서는 유지

const STORAGE_KEY = "sig_rl";
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15분 윈도우
const LOCKOUT_MS = 30 * 60 * 1000; // 30분 잠금

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

function getRecord(): AttemptRecord {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, firstAttemptAt: 0, lockedUntil: null };
    return JSON.parse(raw) as AttemptRecord;
  } catch {
    return { count: 0, firstAttemptAt: 0, lockedUntil: null };
  }
}

function setRecord(r: AttemptRecord): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  } catch {
    // sessionStorage not available (e.g., private browsing full)
  }
}

// ─── 현재 잠금 상태 확인 ─────────────────────────────────
export function isRateLimited(): {
  limited: boolean;
  remainingMs: number;
  remainingAttempts: number;
} {
  const now = Date.now();
  const r = getRecord();

  if (r.lockedUntil !== null && now < r.lockedUntil) {
    return { limited: true, remainingMs: r.lockedUntil - now, remainingAttempts: 0 };
  }

  if (r.firstAttemptAt > 0 && now - r.firstAttemptAt > WINDOW_MS) {
    resetRateLimit();
    return { limited: false, remainingMs: 0, remainingAttempts: MAX_ATTEMPTS };
  }

  if (r.count >= MAX_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_MS;
    setRecord({ ...r, lockedUntil });
    return { limited: true, remainingMs: LOCKOUT_MS, remainingAttempts: 0 };
  }

  return {
    limited: false,
    remainingMs: 0,
    remainingAttempts: MAX_ATTEMPTS - r.count,
  };
}

// ─── 로그인 시도 기록 ────────────────────────────────────
export function recordLoginAttempt(): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil: number | null;
} {
  const now = Date.now();
  let r = getRecord();

  // 잠금 중이면 거부
  if (r.lockedUntil !== null && now < r.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: r.lockedUntil };
  }

  // 윈도우 만료 시 초기화
  if (r.firstAttemptAt > 0 && now - r.firstAttemptAt > WINDOW_MS) {
    r = { count: 0, firstAttemptAt: now, lockedUntil: null };
  }

  if (r.firstAttemptAt === 0) r.firstAttemptAt = now;
  r.count++;

  if (r.count >= MAX_ATTEMPTS) {
    r.lockedUntil = now + LOCKOUT_MS;
    setRecord(r);
    return { allowed: false, remainingAttempts: 0, lockedUntil: r.lockedUntil };
  }

  setRecord(r);
  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - r.count,
    lockedUntil: null,
  };
}

// ─── 성공 후 리셋 ─────────────────────────────────────────
export function resetRateLimit(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ─── 지수 백오프 지연 (ms) ───────────────────────────────
export function getBackoffDelay(): number {
  const r = getRecord();
  if (r.count <= 1) return 0;
  return Math.min(500 * Math.pow(2, r.count - 1), 10_000);
}
