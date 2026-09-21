// /siging 제품 페이지 · 로고 인트로 렌더링 스모크 테스트
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Siging } from "../Siging";
import { LogoIntro, getIntroDelay } from "../../components/LogoIntro";

// jsdom 에는 IntersectionObserver 가 없어 motion 의 whileInView 가 마운트 시 throw — 최소 스텁
class IOStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
(globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = IOStub;

describe("Siging page", () => {
  it("renders hero, features and external siging.kr links", () => {
    render(
      <MemoryRouter>
        <Siging />
      </MemoryRouter>,
    );
    expect(screen.getByText("SIGING")).toBeTruthy();
    expect(screen.getByText(/규격만 입력하면 칼선과 3D 목업이 즉시/)).toBeTruthy();
    const ext = screen.getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("https://siging.kr"));
    expect(ext.length).toBeGreaterThan(0);
    ext.forEach((a) => expect(a.getAttribute("rel")).toContain("noopener"));
  });

  it("sets page title and canonical", () => {
    render(
      <MemoryRouter>
        <Siging />
      </MemoryRouter>,
    );
    expect(document.title).toMatch(/Siging/);
  });
});

describe("LogoIntro", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.matchMedia = ((q: string) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  });

  it("plays once per session and exposes a positive delay while playing", () => {
    render(
      <MemoryRouter>
        <LogoIntro />
      </MemoryRouter>,
    );
    expect(getIntroDelay()).toBeGreaterThan(0);
    expect(sessionStorage.getItem("sig_intro_seen")).toBe("1");
  });

  it("does not play on /admin", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/admin"]}>
        <LogoIntro />
      </MemoryRouter>,
    );
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    expect(sessionStorage.getItem("sig_intro_seen")).toBeNull();
  });
});
