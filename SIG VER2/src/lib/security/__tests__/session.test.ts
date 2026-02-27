import { describe, it, expect, beforeEach, vi } from "vitest";
import { createSession, loadSession, clearSession } from "../session";

describe("session", () => {
  beforeEach(() => {
    clearSession();
    vi.useRealTimers();
  });

  it("세션이 없으면 false 반환", () => {
    expect(loadSession()).toBe(false);
  });

  it("세션 생성 후 true 반환", () => {
    createSession();
    expect(loadSession()).toBe(true);
  });

  it("세션 삭제 후 false 반환", () => {
    createSession();
    clearSession();
    expect(loadSession()).toBe(false);
  });

  it("sessionStorage에 저장됨을 확인한다", () => {
    createSession();
    expect(sessionStorage.getItem("sig_admin_session")).not.toBeNull();
  });

  it("clearSession이 localStorage 구버전도 삭제한다", () => {
    localStorage.setItem("sig_admin_session", JSON.stringify({ ts: Date.now() }));
    clearSession();
    expect(localStorage.getItem("sig_admin_session")).toBeNull();
  });

  it("만료된 세션은 false 반환", () => {
    createSession();
    // 9시간 경과 (TTL=8시간 초과)
    vi.setSystemTime(new Date(Date.now() + 9 * 60 * 60 * 1000));
    expect(loadSession()).toBe(false);
  });

  it("만료된 세션은 자동으로 삭제됨", () => {
    createSession();
    vi.setSystemTime(new Date(Date.now() + 9 * 60 * 60 * 1000));
    loadSession();
    expect(sessionStorage.getItem("sig_admin_session")).toBeNull();
  });

  it("TTL 내에서는 세션이 유지된다", () => {
    createSession();
    // 7시간 경과 (TTL=8시간 이내)
    vi.setSystemTime(new Date(Date.now() + 7 * 60 * 60 * 1000));
    expect(loadSession()).toBe(true);
  });

  it("잘못된 JSON 세션 데이터를 안전하게 처리한다", () => {
    sessionStorage.setItem("sig_admin_session", "invalid-json{");
    expect(loadSession()).toBe(false);
  });

  it("만료 임박 시 세션을 갱신한다", () => {
    createSession();
    const raw = sessionStorage.getItem("sig_admin_session")!;
    const old = JSON.parse(raw);
    // 7시간 30분 경과 (30분 미만 남음)
    vi.setSystemTime(new Date(Date.now() + 7 * 60 * 60 * 1000 + 31 * 60 * 1000));
    loadSession();
    const updated = JSON.parse(sessionStorage.getItem("sig_admin_session")!);
    expect(updated.expiresAt).toBeGreaterThan(old.expiresAt);
  });
});
