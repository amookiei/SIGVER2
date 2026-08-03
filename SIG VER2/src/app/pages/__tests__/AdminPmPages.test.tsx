// PM 관리자 신규 탭 렌더링 스모크 테스트
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminSQL } from "../AdminSQL";
import { AdminDashboard } from "../AdminDashboard";
import { AdminExperiments } from "../AdminExperiments";
import { AdminResearch } from "../AdminResearch";

describe("PM admin pages render smoke", () => {
  it("AdminSQL renders", () => {
    render(<AdminSQL />);
    expect(screen.getByText(/PM 분석 쿼리 프리셋/)).toBeTruthy();
  });

  it("AdminDashboard renders", () => {
    render(<AdminDashboard />);
    expect(screen.getByText(/일별 트렌드/)).toBeTruthy();
  });

  it("AdminExperiments renders", () => {
    render(<AdminExperiments />);
    expect(screen.getAllByText(/새 실험/).length).toBeGreaterThan(0);
  });

  it("AdminResearch renders", () => {
    render(<AdminResearch />);
    expect(screen.getByText(/서베이 위젯 설정/)).toBeTruthy();
  });
});
