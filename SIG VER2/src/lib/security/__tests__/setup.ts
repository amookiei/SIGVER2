import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// jsdom에는 ResizeObserver가 없음 — recharts ResponsiveContainer용 스텁
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

// 각 테스트 전에 스토리지 초기화
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.useRealTimers();
});
