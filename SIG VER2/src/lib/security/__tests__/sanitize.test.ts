import { describe, it, expect } from "vitest";
import { sanitizeHTML, sanitizeText, sanitizeErrorMessage } from "../sanitize";

describe("sanitizeHTML", () => {
  it("script 태그를 제거한다", () => {
    const result = sanitizeHTML('<script>alert("xss")</script>hello');
    expect(result).not.toContain("<script>");
    expect(result).toContain("hello");
  });

  it("onclick 이벤트 핸들러를 제거한다", () => {
    const result = sanitizeHTML('<p onclick="evil()">text</p>');
    expect(result).not.toContain("onclick");
    expect(result).toContain("text");
  });

  it("onerror 이벤트를 제거한다", () => {
    const result = sanitizeHTML('<img src="x" onerror="alert(1)">');
    expect(result).not.toContain("onerror");
  });

  it("javascript: URL을 제거한다", () => {
    const result = sanitizeHTML('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain("javascript:");
  });

  it("허용된 태그(strong, em, p)는 유지한다", () => {
    const result = sanitizeHTML("<strong>굵은</strong> <em>기울기</em>");
    expect(result).toContain("<strong>굵은</strong>");
    expect(result).toContain("<em>기울기</em>");
  });

  it("빈 문자열을 처리한다", () => {
    expect(sanitizeHTML("")).toBe("");
  });

  it("이모지와 유니코드를 보존한다", () => {
    const result = sanitizeHTML("안녕하세요 🎨");
    expect(result).toContain("안녕하세요");
    expect(result).toContain("🎨");
  });
});

describe("sanitizeText", () => {
  it("모든 HTML 태그를 제거한다", () => {
    const result = sanitizeText("<b>bold</b> plain text");
    expect(result).not.toContain("<b>");
    expect(result).toContain("plain text");
  });

  it("script 태그를 제거한다", () => {
    const result = sanitizeText("<script>evil()</script>clean");
    expect(result).not.toContain("<script>");
    expect(result).toContain("clean");
  });

  it("일반 텍스트는 그대로 반환한다", () => {
    const result = sanitizeText("hello world 안녕");
    expect(result).toBe("hello world 안녕");
  });
});

describe("sanitizeErrorMessage", () => {
  it("PostgreSQL 상세 정보를 숨긴다", () => {
    const err = new Error("PGRST116: relation not found");
    expect(sanitizeErrorMessage(err)).toBe("데이터베이스 오류가 발생했습니다.");
  });

  it("Supabase 내부 오류를 숨긴다", () => {
    const err = new Error("supabase connection error at 192.168.1.1");
    expect(sanitizeErrorMessage(err)).toBe("데이터베이스 오류가 발생했습니다.");
  });

  it("네트워크 오류 메시지를 반환한다", () => {
    const err = new Error("Failed to fetch resource");
    expect(sanitizeErrorMessage(err)).toBe("네트워크 오류가 발생했습니다.");
  });

  it("ERR_ 네트워크 에러를 숨긴다", () => {
    const err = new Error("ERR_CONNECTION_REFUSED");
    expect(sanitizeErrorMessage(err)).toBe("네트워크 오류가 발생했습니다.");
  });

  it("안전한 오류 메시지는 그대로 반환한다", () => {
    const err = new Error("비밀번호가 틀렸습니다.");
    expect(sanitizeErrorMessage(err)).toBe("비밀번호가 틀렸습니다.");
  });

  it("스택 트레이스를 포함한 오류에서 첫 줄만 반환한다", () => {
    const err = new Error("오류 발생\n    at fn (app.js:10:5)");
    expect(sanitizeErrorMessage(err)).toBe("오류 발생");
  });

  it("150자 초과 메시지를 잘라낸다", () => {
    const err = new Error("a".repeat(200));
    expect(sanitizeErrorMessage(err).length).toBeLessThanOrEqual(150);
  });

  it("문자열 오류를 처리한다", () => {
    expect(sanitizeErrorMessage("something went wrong")).toBe("something went wrong");
  });

  it("unknown 타입 오류를 처리한다", () => {
    expect(sanitizeErrorMessage(42)).toBe("알 수 없는 오류가 발생했습니다.");
    expect(sanitizeErrorMessage(null)).toBe("알 수 없는 오류가 발생했습니다.");
    expect(sanitizeErrorMessage(undefined)).toBe("알 수 없는 오류가 발생했습니다.");
  });
});
