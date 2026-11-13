// =============================================================================
// Supabase 스키마 마이그레이션 SQL (최초 1회 실행)
// Supabase → SQL Editor에서 아래를 실행한 뒤 배포하세요.
//
// ── portfolio_items 테이블 초기 생성 ──────────────────────────────────────
// CREATE TABLE IF NOT EXISTS portfolio_items (
//   id              BIGSERIAL PRIMARY KEY,
//   slug            TEXT NOT NULL UNIQUE,
//   title           TEXT NOT NULL,
//   client          TEXT NOT NULL,
//   category        TEXT NOT NULL,
//   year            INT  NOT NULL,
//   featured        BOOLEAN NOT NULL DEFAULT false,
//   display_order   INT,
//   thumbnail       TEXT NOT NULL DEFAULT '',
//   thumbnail_hover TEXT,          -- 호버 이미지 (선택)
//   hero_image      TEXT NOT NULL DEFAULT '',
//   gallery         TEXT[] NOT NULL DEFAULT '{}',
//   tagline         TEXT NOT NULL DEFAULT '',
//   description     TEXT NOT NULL DEFAULT '',
//   challenge       TEXT,
//   solution        TEXT,
//   role            TEXT NOT NULL DEFAULT '',
//   duration        TEXT NOT NULL DEFAULT '',
//   tags            TEXT[] NOT NULL DEFAULT '{}',
//   live_url        TEXT,
//   next_project    TEXT
// );
// ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "public_read"  ON portfolio_items FOR SELECT USING (true);
// CREATE POLICY "anon_write"   ON portfolio_items FOR ALL TO anon USING (true) WITH CHECK (true);
//
// ── 기존 테이블에 thumbnail_hover 칼럼 추가 (이미 테이블이 있는 경우) ─────
// ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS thumbnail_hover TEXT;
//
// ── content_blocks 칼럼 추가 (contentBlocks 기능 추가 시) ─────────────────
// ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS content_blocks JSONB;
//
// ── work_scope, additional_info 칼럼 추가 ────────────────────────────────
// ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS work_scope TEXT[];
// ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS additional_info JSONB;
// =============================================================================

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { portfolioItems as defaultItems } from "../data/portfolio";
import type { PortfolioItem, Category, ContentBlock } from "../data/portfolio";
import { supabase, isSupabaseReady } from "../../lib/supabase";
import {
  createSession,
  loadSession as loadAdminSession,
  clearSession,
} from "../../lib/security/session";
import {
  recordLoginAttempt,
  resetRateLimit,
  isRateLimited,
} from "../../lib/security/rateLimiter";
import { logAudit } from "../../lib/security/auditLog";
import { sanitizeErrorMessage } from "../../lib/security/sanitize";
import { portfolioItemSchema } from "../../lib/security/validation";
import { findSlugOwner, friendlyDbError } from "../../lib/portfolio/slug";

// ─── Constants ────────────────────────────────────────────
const ITEMS_CACHE_KEY = "sig_admin_items";

// ─── SHA-256 해시 ────────────────────────────────────────
async function hashPassword(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Supabase row type ────────────────────────────────────
interface DBRow {
  id: number;
  slug: string;
  title: string;
  client: string;
  category: string;
  year: number;
  featured: boolean;
  display_order: number | null;
  thumbnail: string;
  thumbnail_hover: string | null;
  hero_image: string;
  gallery: string[];
  tagline: string;
  description: string;
  challenge: string | null;
  solution: string | null;
  content_blocks: ContentBlock[] | null;
  role: string;
  duration: string;
  tags: string[];
  live_url: string | null;
  next_project: string | null;
  work_scope: string[] | null;
  additional_info: { label: string; value: string }[] | null;
}

function fixStorageUrl(url: string): string {
  if (!url) return url;
  return url.replace(/\/storage\/v1\/object\/(?!public\/)/, "/storage/v1/object/public/");
}

function fromDB(row: DBRow): PortfolioItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    category: row.category as Category,
    year: row.year,
    featured: row.featured,
    order: row.display_order ?? undefined,
    thumbnail: fixStorageUrl(row.thumbnail),
    thumbnailHover: row.thumbnail_hover ? fixStorageUrl(row.thumbnail_hover) : undefined,
    heroImage: fixStorageUrl(row.hero_image),
    gallery: (row.gallery ?? []).map(fixStorageUrl),
    tagline: row.tagline,
    description: row.description,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    contentBlocks: row.content_blocks ?? undefined,
    role: row.role,
    duration: row.duration,
    tags: row.tags ?? [],
    liveUrl: row.live_url ?? undefined,
    nextProject: row.next_project ?? undefined,
    workScope: row.work_scope ?? undefined,
    additionalInfo: row.additional_info ?? undefined,
  };
}

function toDB(item: PortfolioItem): DBRow {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    client: item.client,
    category: item.category,
    year: item.year,
    featured: item.featured,
    display_order: item.order ?? null,
    thumbnail: item.thumbnail,
    thumbnail_hover: item.thumbnailHover ?? null,
    hero_image: item.heroImage,
    gallery: item.gallery,
    tagline: item.tagline,
    description: item.description,
    challenge: item.challenge ?? null,
    solution: item.solution ?? null,
    content_blocks: item.contentBlocks ?? null,
    role: item.role,
    duration: item.duration,
    tags: item.tags,
    live_url: item.liveUrl ?? null,
    next_project: item.nextProject ?? null,
    work_scope: item.workScope ?? null,
    additional_info: item.additionalInfo ?? null,
  };
}

// ─── Context type ─────────────────────────────────────────
export interface LoginResult {
  success: boolean;
  error?: string;
}

export type SaveResult = { ok: true } | { ok: false; error: string };

interface AdminContextType {
  isAdmin: boolean;
  login: (pw: string) => Promise<LoginResult>;
  logout: () => void;
  items: PortfolioItem[];
  loading: boolean;
  dbStatus: "none" | "synced" | "error";
  dbError: string | null;          // 마지막 DB 오류 메시지 (스키마 오류 진단용)
  /** 저장 결과. ok=false 면 error 에 사용자에게 보여줄 메시지가 담긴다. */
  updateItem: (id: number, data: Partial<PortfolioItem>) => Promise<SaveResult>;
  addItem: (data: Omit<PortfolioItem, "id">) => Promise<SaveResult>;
  /** DB 에서 목록을 다시 읽어 로컬 캐시와 동기화 */
  refresh: () => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  resetToDefault: () => Promise<void>;
  getBySlug: (slug: string) => PortfolioItem | undefined;
  getByCategory: (cat?: string) => PortfolioItem[];
  getFeatured: () => PortfolioItem[];
  categories: string[];
}

const AdminContext = createContext<AdminContextType | null>(null);

// ─── 캐시 helpers ─────────────────────────────────────────
function loadCache(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as PortfolioItem[]) : defaultItems;
  } catch {
    return defaultItems;
  }
}

function saveCache(items: PortfolioItem[]) {
  localStorage.setItem(ITEMS_CACHE_KEY, JSON.stringify(items));
}

// ─── Provider ─────────────────────────────────────────────
export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(loadAdminSession);
  const [items, setItemsState] = useState<PortfolioItem[]>(loadCache);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [dbStatus, setDbStatus] = useState<"none" | "synced" | "error">("none");
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("id");
      if (error) throw error;
      if (data && data.length > 0) {
        const fetched = (data as DBRow[]).map(fromDB);
        setItemsState(fetched);
        saveCache(fetched);
        setDbStatus("synced");
      } else {
        setDbStatus("synced");
      }
    } catch (err) {
      console.error("[DB]", sanitizeErrorMessage(err));
      setDbStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseReady) fetchFromDB();
  }, [fetchFromDB]);

  const setItems = (next: PortfolioItem[]) => {
    setItemsState(next);
    saveCache(next);
  };

  // ── Auth ─────────────────────────────────────────────────
  const login = async (pw: string): Promise<LoginResult> => {
    const rlStatus = isRateLimited();
    if (rlStatus.limited) {
      const mins = Math.ceil(rlStatus.remainingMs / 60000);
      await logAudit({ action: "admin.login.failure", details: { reason: "rate_limited" } });
      return {
        success: false,
        error: `로그인 시도가 너무 많습니다. ${mins}분 후 다시 시도해주세요.`,
      };
    }

    const attempt = recordLoginAttempt();
    if (!attempt.allowed) {
      const mins = Math.ceil((attempt.lockedUntil! - Date.now()) / 60000);
      await logAudit({ action: "admin.login.failure", details: { reason: "rate_limited" } });
      return {
        success: false,
        error: `로그인이 잠겼습니다. ${mins}분 후 다시 시도해주세요.`,
      };
    }

    const hash = await hashPassword(pw);
    const storedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH as string | undefined;
    const isValid = storedHash
      ? hash === storedHash
      : hash === "4ac782a60bc0d5696f76feea0f51709dc21021cf6100bf1a4a2a3c3cbdba4e01";

    if (isValid) {
      setIsAdmin(true);
      createSession();
      resetRateLimit();
      await logAudit({ action: "admin.login.success" });
      return { success: true };
    }

    const remaining = attempt.remainingAttempts - 1;
    await logAudit({
      action: "admin.login.failure",
      details: { reason: "wrong_password", remaining },
    });
    return {
      success: false,
      error:
        remaining > 0
          ? `비밀번호가 틀렸습니다. (${remaining}회 남음)`
          : "비밀번호가 틀렸습니다.",
    };
  };

  const logout = async () => {
    setIsAdmin(false);
    clearSession();
    await logAudit({ action: "admin.logout" });
  };

  // ── CRUD (최소권한: isAdmin 검증) ─────────────────────────
  const fail = (error: string): SaveResult => {
    setDbStatus("error");
    setDbError(error);
    return { ok: false, error };
  };

  /** 로컬 목록과 DB 양쪽에서 슬러그 충돌을 확인한다. 충돌 시 안내 문구를 돌려준다. */
  const checkSlugConflict = async (slug: string, excludeId?: number): Promise<string | null> => {
    const local = findSlugOwner(slug, items, excludeId);
    if (local) return `슬러그 "${slug}" 는 이미 "${local.title}" 프로젝트가 사용 중입니다. 다른 슬러그를 입력해주세요.`;
    if (supabase) {
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("id, title")
        .eq("slug", slug)
        .limit(1);
      if (!error && data && data.length > 0 && data[0].id !== excludeId) {
        // 로컬 캐시에는 없는데 DB 에만 있는 항목 — 캐시가 오래된 상태이므로 다시 읽는다
        void fetchFromDB();
        return `슬러그 "${slug}" 는 DB 에 있는 "${data[0].title}" 프로젝트(ID ${data[0].id})가 이미 사용 중입니다. 목록을 새로고침했으니 확인 후 다른 슬러그를 입력해주세요.`;
      }
    }
    return null;
  };

  const updateItem = async (id: number, data: Partial<PortfolioItem>): Promise<SaveResult> => {
    if (!isAdmin) return { ok: false, error: "관리자 권한이 필요합니다." };
    const prev = items;
    const updated = { ...(items.find((i) => i.id === id) as PortfolioItem), ...data, id };
    const validation = portfolioItemSchema.safeParse(updated);
    if (!validation.success) return fail(validation.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.");

    const conflict = await checkSlugConflict(updated.slug, id);
    if (conflict) return fail(conflict);

    const next = prev.map((i) => (i.id === id ? updated : i));
    setItems(next);

    if (supabase) {
      const { error } = await supabase.from("portfolio_items").upsert(toDB(updated));
      if (error) {
        setItems(prev); // DB 와 어긋나지 않도록 되돌림
        return fail(friendlyDbError(error.message));
      }
      await logAudit({ action: "portfolio.update", resourceId: id });
    }
    setDbStatus(supabase ? "synced" : "none");
    setDbError(null);
    return { ok: true };
  };

  const addItem = async (data: Omit<PortfolioItem, "id">): Promise<SaveResult> => {
    if (!isAdmin) return { ok: false, error: "관리자 권한이 필요합니다." };

    const conflict = await checkSlugConflict(data.slug);
    if (conflict) return fail(conflict);

    // ID 는 로컬 최대값과 DB 최대값 중 큰 쪽 + 1 (캐시가 오래됐을 때의 PK 충돌 방지)
    let maxId = items.length ? Math.max(...items.map((i) => i.id)) : 0;
    if (supabase) {
      const { data: rows } = await supabase.from("portfolio_items").select("id").order("id", { ascending: false }).limit(1);
      if (rows && rows.length > 0) maxId = Math.max(maxId, Number(rows[0].id));
    }
    const newItem: PortfolioItem = { id: maxId + 1, ...data };
    const validation = portfolioItemSchema.safeParse(newItem);
    if (!validation.success) return fail(validation.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.");

    if (supabase) {
      // DB 에 먼저 넣고 성공했을 때만 화면에 반영 — 실패한 항목이 로컬에만 남는 일을 막는다
      const { error } = await supabase.from("portfolio_items").insert(toDB(newItem));
      if (error) return fail(friendlyDbError(error.message));
      await logAudit({ action: "portfolio.create", resourceId: newItem.id });
    }
    setItems([...items, newItem]);
    setDbStatus(supabase ? "synced" : "none");
    setDbError(null);
    return { ok: true };
  };

  const deleteItem = async (id: number) => {
    if (!isAdmin) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);

    if (supabase) {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (!error) {
        setDbStatus("synced");
        setDbError(null);
        await logAudit({ action: "portfolio.delete", resourceId: id });
      } else {
        setDbStatus("error");
        setDbError(friendlyDbError(error.message));
      }
    }
  };

  const resetToDefault = async () => {
    if (!isAdmin) return;
    setItems(defaultItems);
    localStorage.removeItem(ITEMS_CACHE_KEY);

    if (supabase) {
      await supabase.from("portfolio_items").delete().neq("id", -1);
      const { error } = await supabase
        .from("portfolio_items")
        .insert(defaultItems.map(toDB));
      if (!error) {
        setDbStatus("synced");
        setDbError(null);
        await logAudit({ action: "portfolio.reset" });
      } else {
        setDbStatus("error");
        setDbError(friendlyDbError(error.message));
      }
    }
  };

  const visibleItems = items.filter((i) => !i.hidden);
  const getBySlug = (slug: string) => items.find((i) => i.slug === slug);
  const getByCategory = (cat?: string) =>
    !cat || cat === "All" ? visibleItems : visibleItems.filter((i) => i.category === cat);
  const getFeatured = () =>
    visibleItems
      .filter((i) => i.featured)
      .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
  const categories = ["All", ...Array.from(new Set(visibleItems.map((i) => i.category)))];

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        items,
        loading,
        dbStatus,
        dbError,
        updateItem,
        addItem,
        refresh: fetchFromDB,
        deleteItem,
        resetToDefault,
        getBySlug,
        getByCategory,
        getFeatured,
        categories,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
