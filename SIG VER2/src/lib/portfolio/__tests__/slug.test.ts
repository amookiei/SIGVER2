import { describe, it, expect } from "vitest";
import { slugify, makeUniqueSlug, findSlugOwner, friendlyDbError } from "../slug";

describe("slugify", () => {
  it("lowercases, hyphenates spaces, strips unsafe chars", () => {
    expect(slugify("  Hyundai  ReBrand 2025! ")).toBe("hyundai-rebrand-2025");
    expect(slugify("a---b")).toBe("a-b");
  });
  it("returns empty for Korean-only titles", () => {
    expect(slugify("밋더한우 브랜딩")).toBe("");
  });
});

describe("makeUniqueSlug", () => {
  it("returns base when free", () => {
    expect(makeUniqueSlug("M3AT", ["seoul-city-portal"])).toBe("m3at");
  });
  it("appends -2, -3 when taken", () => {
    expect(makeUniqueSlug("m3at", ["m3at"])).toBe("m3at-2");
    expect(makeUniqueSlug("m3at", ["m3at", "m3at-2"])).toBe("m3at-3");
  });
  it("falls back to 'project' for empty base", () => {
    expect(makeUniqueSlug("한글만", [])).toBe("project");
    expect(makeUniqueSlug("", ["project"])).toBe("project-2");
  });
  it("is case-insensitive against taken list", () => {
    expect(makeUniqueSlug("M3AT", ["M3AT"])).toBe("m3at-2");
  });
});

describe("findSlugOwner", () => {
  const items = [
    { id: 1, slug: "m3at" },
    { id: 2, slug: "krafton-editorial" },
  ];
  it("finds another item using the slug", () => {
    expect(findSlugOwner("m3at", items)?.id).toBe(1);
    expect(findSlugOwner("M3AT", items)?.id).toBe(1);
  });
  it("ignores the item being edited", () => {
    expect(findSlugOwner("m3at", items, 1)).toBeUndefined();
  });
});

describe("friendlyDbError", () => {
  it("translates the slug unique violation", () => {
    expect(friendlyDbError('duplicate key value violates unique constraint "portfolio_items_slug_key"')).toMatch(/슬러그/);
  });
  it("translates the pkey violation", () => {
    expect(friendlyDbError('duplicate key value violates unique constraint "portfolio_items_pkey"')).toMatch(/ID/);
  });
  it("passes other messages through", () => {
    expect(friendlyDbError("network down")).toBe("network down");
    expect(friendlyDbError(undefined)).toBe("알 수 없는 오류");
  });
});
