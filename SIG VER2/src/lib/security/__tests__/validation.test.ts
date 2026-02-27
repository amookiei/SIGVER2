import { describe, it, expect } from "vitest";
import {
  portfolioItemSchema,
  contactSchema,
  loginSchema,
  sanitizeSlug,
  isSafeUrl,
} from "../validation";

const validPortfolio = {
  title: "브랜딩 프로젝트",
  client: "테스트 클라이언트",
  category: "Branding",
  year: 2024,
  slug: "branding-project",
  tagline: "짧은 설명",
  description: "프로젝트 설명입니다.",
  role: "디자이너",
  duration: "3개월",
  tags: ["branding", "design"],
  featured: false,
  thumbnail: "https://cdn.example.com/thumb.jpg",
  heroImage: "https://cdn.example.com/hero.jpg",
  gallery: [],
};

describe("portfolioItemSchema", () => {
  it("유효한 포트폴리오 아이템을 허용한다", () => {
    expect(portfolioItemSchema.safeParse(validPortfolio).success).toBe(true);
  });

  it("빈 제목을 거부한다", () => {
    const r = portfolioItemSchema.safeParse({ ...validPortfolio, title: "" });
    expect(r.success).toBe(false);
  });

  it("200자 초과 제목을 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      title: "a".repeat(201),
    });
    expect(r.success).toBe(false);
  });

  it("대문자가 포함된 slug를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      slug: "My-Project",
    });
    expect(r.success).toBe(false);
  });

  it("특수문자가 포함된 slug를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      slug: "test_project!",
    });
    expect(r.success).toBe(false);
  });

  it("1999년 이전 연도를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({ ...validPortfolio, year: 1999 });
    expect(r.success).toBe(false);
  });

  it("2년 이상 미래 연도를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      year: new Date().getFullYear() + 2,
    });
    expect(r.success).toBe(false);
  });

  it("유효한 liveUrl을 허용한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "https://example.com/portfolio",
    });
    expect(r.success).toBe(true);
  });

  it("null liveUrl을 허용한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: null,
    });
    expect(r.success).toBe(true);
  });

  it("SSRF - localhost URL을 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "http://localhost/attack",
    });
    expect(r.success).toBe(false);
  });

  it("SSRF - 127.0.0.1 URL을 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "http://127.0.0.1:8080/secret",
    });
    expect(r.success).toBe(false);
  });

  it("SSRF - 10.x.x.x 내부 IP를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "http://10.0.0.1/internal",
    });
    expect(r.success).toBe(false);
  });

  it("SSRF - 192.168.x.x 내부 IP를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "http://192.168.1.100/router",
    });
    expect(r.success).toBe(false);
  });

  it("SSRF - AWS 메타데이터 엔드포인트를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "http://169.254.169.254/latest/meta-data/",
    });
    expect(r.success).toBe(false);
  });

  it("SSRF - file:// 프로토콜을 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      liveUrl: "file:///etc/passwd",
    });
    expect(r.success).toBe(false);
  });

  it("20개 초과 태그를 거부한다", () => {
    const r = portfolioItemSchema.safeParse({
      ...validPortfolio,
      tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
    });
    expect(r.success).toBe(false);
  });
});

describe("contactSchema", () => {
  const validContact = {
    name: "홍길동",
    email: "hong@example.com",
    message: "프로젝트 문의드립니다.",
  };

  it("유효한 문의를 허용한다", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("XSS - <script> 태그를 이름에서 거부한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      name: '<script>alert("xss")</script>',
    });
    expect(r.success).toBe(false);
  });

  it("XSS - 중괄호를 이름에서 거부한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      name: "test{injection}",
    });
    expect(r.success).toBe(false);
  });

  it("잘못된 이메일 형식을 거부한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      email: "not-an-email",
    });
    expect(r.success).toBe(false);
  });

  it("5자 미만 메시지를 거부한다", () => {
    const r = contactSchema.safeParse({ ...validContact, message: "hi" });
    expect(r.success).toBe(false);
  });

  it("2000자 초과 메시지를 거부한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      message: "a".repeat(2001),
    });
    expect(r.success).toBe(false);
  });

  it("유효한 한국 전화번호를 허용한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      phone: "010-1234-5678",
    });
    expect(r.success).toBe(true);
  });

  it("잘못된 전화번호 형식을 거부한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      phone: "not-a-phone!!!",
    });
    expect(r.success).toBe(false);
  });

  it("이메일을 소문자로 정규화한다", () => {
    const r = contactSchema.safeParse({
      ...validContact,
      email: "UPPER@EXAMPLE.COM",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("upper@example.com");
    }
  });
});

describe("loginSchema", () => {
  it("비밀번호가 있으면 허용한다", () => {
    expect(loginSchema.safeParse({ password: "mypassword" }).success).toBe(true);
  });

  it("빈 비밀번호를 거부한다", () => {
    expect(loginSchema.safeParse({ password: "" }).success).toBe(false);
  });

  it("200자 초과 비밀번호를 거부한다", () => {
    expect(
      loginSchema.safeParse({ password: "a".repeat(201) }).success
    ).toBe(false);
  });
});

describe("isSafeUrl", () => {
  it("https://example.com 허용", () => expect(isSafeUrl("https://example.com")).toBe(true));
  it("http://example.com 허용", () => expect(isSafeUrl("http://example.com")).toBe(true));
  it("빈 문자열 허용 (optional)", () => expect(isSafeUrl("")).toBe(true));
  it("localhost 거부", () => expect(isSafeUrl("http://localhost")).toBe(false));
  it("127.0.0.1 거부", () => expect(isSafeUrl("http://127.0.0.1")).toBe(false));
  it("10.0.0.1 거부", () => expect(isSafeUrl("http://10.0.0.1")).toBe(false));
  it("172.16.0.1 거부", () => expect(isSafeUrl("http://172.16.0.1")).toBe(false));
  it("192.168.0.1 거부", () => expect(isSafeUrl("http://192.168.0.1")).toBe(false));
  it("169.254.169.254 거부", () => expect(isSafeUrl("http://169.254.169.254")).toBe(false));
  it("file:// 거부", () => expect(isSafeUrl("file:///etc/passwd")).toBe(false));
  it("javascript: 거부", () => expect(isSafeUrl("javascript:alert(1)")).toBe(false));
});

describe("sanitizeSlug", () => {
  it("소문자로 변환한다", () => {
    expect(sanitizeSlug("HelloWorld")).toBe("helloworld");
  });

  it("공백을 하이픈으로 교체한다", () => {
    expect(sanitizeSlug("hello world")).toBe("hello-world");
  });

  it("특수문자를 제거한다", () => {
    expect(sanitizeSlug("hello@world!")).toBe("helloworld");
  });

  it("다중 하이픈을 단일로 축소한다", () => {
    expect(sanitizeSlug("hello--world")).toBe("hello-world");
  });

  it("앞뒤 하이픈을 제거한다", () => {
    expect(sanitizeSlug("-hello-world-")).toBe("hello-world");
  });

  it("100자로 잘라낸다", () => {
    const long = "a".repeat(150);
    expect(sanitizeSlug(long)).toHaveLength(100);
  });

  it("이미 유효한 slug는 그대로 반환한다", () => {
    expect(sanitizeSlug("my-project-2024")).toBe("my-project-2024");
  });
});
