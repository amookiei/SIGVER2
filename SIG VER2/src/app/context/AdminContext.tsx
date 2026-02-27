import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { portfolioItems as defaultItems } from "../data/portfolio";
import type { PortfolioItem, Category } from "../data/portfolio";
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
  hero_image: string;
  gallery: string[];
  tagline: string;
  description: string;
  challenge: string | null;
  solution: string | null;
  role: string;
  duration: string;
  tags: string[];
  live_url: string | null;
  next_project: string | null;
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
    heroImage: fixStorageUrl(row.hero_image),
    gallery: (row.gallery ?? []).map(fixStorageUrl),
    tagline: row.tagline,
    description: row.description,
    challenge: row.challenge ?? undefined,
    solution: row.solution ?? undefined,
    role: row.role,
    duration: row.duration,
    tags: row.tags ?? [],
    liveUrl: row.live_url ?? undefined,
    nextProject: row.next_project ?? undefined,
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
    hero_image: item.heroImage,
    gallery: item.gallery,
    tagline: item.tagline,
    description: item.description,
    challenge: item.challenge ?? null,
    solution: item.solution ?? null,
    role: item.role,
    duration: item.duration,
    tags: item.tags,
    live_url: item.liveUrl ?? null,
    next_project: item.nextProject ?? null,
  };
}

// ─── Context type ─────────────────────────────────────────
export interface LoginResult {
  success: boolean;
  error?: string;
}

interface AdminContextType {
  isAdmin: boolean;
  login: (pw: string) => Promise<LoginResult>;
  logout: () => void;
  items: PortfolioItem[];
  loading: boolean;
  dbStatus: "none" | "synced" | "error";
  updateItem: (id: number, data: Partial<PortfolioItem>) => Promise<void>;
  addItem: (data: Omit<PortfolioItem, "id">) => Promise<void>;
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
  const updateItem = async (id: number, data: Partial<PortfolioItem>) => {
    if (!isAdmin) return;
    const next = items.map((i) => (i.id === id ? { ...i, ...data } : i));
    setItems(next);

    if (supabase) {
      const updated = next.find((i) => i.id === id);
      if (updated) {
        const validation = portfolioItemSchema.safeParse(updated);
        if (!validation.success) { setDbStatus("error"); return; }
        const { error } = await supabase.from("portfolio_items").upsert(toDB(updated));
        if (!error) {
          setDbStatus("synced");
          await logAudit({ action: "portfolio.update", resourceId: id });
        } else {
          setDbStatus("error");
        }
      }
    }
  };

  const addItem = async (data: Omit<PortfolioItem, "id">) => {
    if (!isAdmin) return;
    const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: PortfolioItem = { id, ...data };
    const validation = portfolioItemSchema.safeParse(newItem);
    if (!validation.success) { setDbStatus("error"); return; }
    const next = [...items, newItem];
    setItems(next);

    if (supabase) {
      const { error } = await supabase.from("portfolio_items").insert(toDB(newItem));
      if (!error) {
        setDbStatus("synced");
        await logAudit({ action: "portfolio.create", resourceId: id });
      } else {
        setDbStatus("error");
      }
    }
  };

  const deleteItem = async (id: number) => {
    if (!isAdmin) return;
    const next = items.filter((i) => i.id !== id);
    setItems(next);

    if (supabase) {
      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (!error) {
        setDbStatus("synced");
        await logAudit({ action: "portfolio.delete", resourceId: id });
      } else {
        setDbStatus("error");
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
        await logAudit({ action: "portfolio.reset" });
      } else {
        setDbStatus("error");
      }
    }
  };

  const getBySlug = (slug: string) => items.find((i) => i.slug === slug);
  const getByCategory = (cat?: string) =>
    !cat || cat === "All" ? items : items.filter((i) => i.category === cat);
  const getFeatured = () =>
    items
      .filter((i) => i.featured)
      .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        items,
        loading,
        dbStatus,
        updateItem,
        addItem,
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
