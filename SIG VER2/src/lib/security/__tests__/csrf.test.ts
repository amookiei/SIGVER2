import { describe, it, expect, beforeEach } from "vitest";
import {
  initCsrfToken,
  getCsrfToken,
  verifyCsrfToken,
  rotateCsrfToken,
} from "../csrf";

describe("csrf", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("토큰을 생성한다 (64자 hex)", () => {
    const token = initCsrfToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("두 번 호출해도 같은 토큰을 반환한다", () => {
    const t1 = initCsrfToken();
    const t2 = initCsrfToken();
    expect(t1).toBe(t2);
  });

  it("getCsrfToken으로 토큰을 조회한다", () => {
    const token = initCsrfToken();
    expect(getCsrfToken()).toBe(token);
  });

  it("초기화 전 getCsrfToken은 null 반환", () => {
    expect(getCsrfToken()).toBeNull();
  });

  it("올바른 토큰 검증 성공", () => {
    const token = initCsrfToken();
    expect(verifyCsrfToken(token)).toBe(true);
  });

  it("잘못된 토큰 검증 실패", () => {
    initCsrfToken();
    expect(verifyCsrfToken("wrong-token")).toBe(false);
  });

  it("빈 토큰 검증 실패", () => {
    initCsrfToken();
    expect(verifyCsrfToken("")).toBe(false);
  });

  it("길이가 다른 토큰 검증 실패 (타이밍 공격 방어)", () => {
    initCsrfToken();
    expect(verifyCsrfToken("short")).toBe(false);
  });

  it("토큰 교체 후 새 토큰이 다르다", () => {
    const t1 = initCsrfToken();
    const t2 = rotateCsrfToken();
    expect(t1).not.toBe(t2);
  });

  it("교체 후 새 토큰으로 검증 성공", () => {
    initCsrfToken();
    const newToken = rotateCsrfToken();
    expect(verifyCsrfToken(newToken)).toBe(true);
  });

  it("교체 후 이전 토큰으로 검증 실패", () => {
    const oldToken = initCsrfToken();
    rotateCsrfToken();
    expect(verifyCsrfToken(oldToken)).toBe(false);
  });

  it("각 토큰은 고유하다 (충돌 없음)", () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 20; i++) {
      sessionStorage.clear();
      tokens.add(initCsrfToken());
    }
    expect(tokens.size).toBe(20);
  });
});
