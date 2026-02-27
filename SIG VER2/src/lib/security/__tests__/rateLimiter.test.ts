import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  isRateLimited,
  recordLoginAttempt,
  resetRateLimit,
  getBackoffDelay,
} from "../rateLimiter";

describe("rateLimiter", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it("초기 상태에서는 잠금이 없다", () => {
    const result = isRateLimited();
    expect(result.limited).toBe(false);
    expect(result.remainingAttempts).toBe(5);
  });

  it("첫 번째 시도를 허용한다", () => {
    const result = recordLoginAttempt();
    expect(result.allowed).toBe(true);
    expect(result.remainingAttempts).toBe(4);
  });

  it("4번째 시도까지 허용한다", () => {
    for (let i = 0; i < 3; i++) {
      const r = recordLoginAttempt();
      expect(r.allowed).toBe(true);
    }
    const fourth = recordLoginAttempt();
    expect(fourth.allowed).toBe(true);
    expect(fourth.remainingAttempts).toBe(1);
  });

  it("5번째 시도에서 잠금된다", () => {
    for (let i = 0; i < 4; i++) recordLoginAttempt();
    const fifth = recordLoginAttempt();
    expect(fifth.allowed).toBe(false);
    expect(fifth.remainingAttempts).toBe(0);
    expect(fifth.lockedUntil).not.toBeNull();
  });

  it("잠금 후 isRateLimited가 true를 반환한다", () => {
    for (let i = 0; i < 5; i++) recordLoginAttempt();
    const result = isRateLimited();
    expect(result.limited).toBe(true);
    expect(result.remainingAttempts).toBe(0);
    expect(result.remainingMs).toBeGreaterThan(0);
  });

  it("잠금 후 추가 시도를 거부한다", () => {
    for (let i = 0; i < 5; i++) recordLoginAttempt();
    const extra = recordLoginAttempt();
    expect(extra.allowed).toBe(false);
    expect(extra.lockedUntil).not.toBeNull();
  });

  it("리셋 후 정상 동작한다", () => {
    for (let i = 0; i < 3; i++) recordLoginAttempt();
    resetRateLimit();
    const result = isRateLimited();
    expect(result.limited).toBe(false);
    expect(result.remainingAttempts).toBe(5);
    const attempt = recordLoginAttempt();
    expect(attempt.allowed).toBe(true);
  });

  it("시간 창 만료 후 카운터가 초기화된다", () => {
    // 4번 시도
    for (let i = 0; i < 4; i++) recordLoginAttempt();
    // 16분 경과 (15분 창 초과)
    vi.setSystemTime(new Date(Date.now() + 16 * 60 * 1000));
    const result = isRateLimited();
    expect(result.limited).toBe(false);
    expect(result.remainingAttempts).toBe(5);
    vi.useRealTimers();
  });

  it("지수 백오프 지연이 증가한다", () => {
    const delay0 = getBackoffDelay();
    recordLoginAttempt();
    const delay1 = getBackoffDelay();
    recordLoginAttempt();
    const delay2 = getBackoffDelay();
    expect(delay0).toBe(0);
    expect(delay1).toBe(0);
    expect(delay2).toBeGreaterThan(delay1);
  });

  it("백오프 지연이 10초를 초과하지 않는다", () => {
    for (let i = 0; i < 4; i++) recordLoginAttempt();
    const delay = getBackoffDelay();
    expect(delay).toBeLessThanOrEqual(10_000);
  });
});
