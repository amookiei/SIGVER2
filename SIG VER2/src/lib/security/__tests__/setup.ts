import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// 각 테스트 전에 스토리지 초기화
beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  vi.useRealTimers();
});
