import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { portfolioItems as defaultItems } from "../data/portfolio";
import type { PortfolioItem, Category } from "../data/portfolio";
import { supabase, isSupabaseReady } from "../../lib/supabase";

// ─── Constants ────────────────────────────────────────────
const ADMIN_PASSWORD = "sig0802!";
const ITEMS_CACHE_KEY = "sig_admin_items";
const SESSION_KEY = "sig_admin_session";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24h

// ─── Supabase row type (snake_case) ───────────────────────
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

// Supabase Storage URL이 /public/ 없이 저장된 경우 자동 보정
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
interface AdminContextType {
  isAdmin: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
  items: PortfolioItem[];
  loading: boolean;
  dbStatus: "none" | "synced" | "error";
  updateItem: (id: number, data: Partial<PortfolioItem>) => Promise<void>;
  addItem: (data: Omit<PortfolioItem, "id">) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  resetToDefault: () => Promise<void>;
  // helpers
  getBySlug: (slug: string) => PortfolioItem | undefined;
  getByCategory: (cat?: string) => PortfolioItem[];
  getFeatured: () => PortfolioItem[];
  categories: string[];
}

const AdminContext = createContext<AdminContextType | null>(null);

// ─── Session helpers ──────────────────────────────────────
function loadSession(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw) as { ts: number };
    return Date.now() - ts < SESSION_TTL;
  } catch {
    return false;
  }
}

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
  const [isAdmin, setIsAdmin] = useState<boolean>(loadSession);
  const [items, setItemsState] = useState<PortfolioItem[]>(loadCache);
  const [loading, setLoading] = useState(isSupabaseReady);
  const [dbStatus, setDbStatus] = useState<"none" | "synced" | "error">(
    isSupabaseReady ? "none" : "none"
  );

  // ── Fetch from Supabase on mount ─────────────────────────
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
        // Table exists but empty — seed with default data
        setDbStatus("synced");
      }
    } catch {
      setDbStatus("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSupabaseReady) {
      fetchFromDB();
    }
  }, [fetchFromDB]);

  // ── Setters ──────────────────────────────────────────────
  const setItems = (next: PortfolioItem[]) => {
    setItemsState(next);
    saveCache(next);
  };

  // ── Auth ─────────────────────────────────────────────────
  const login = (pw: string): boolean => {
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ts: Date.now() }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem(SESSION_KEY);
  };

  // ── CRUD ─────────────────────────────────────────────────
  const updateItem = async (id: number, data: Partial<PortfolioItem>) => {
    const next = items.map((i) => (i.id === id ? { ...i, ...data } : i));
    setItems(next);

    if (supabase) {
      const updated = next.find((i) => i.id === id);
      if (updated) {
        const { error } = await supabase
          .from("portfolio_items")
          .upsert(toDB(updated));
        if (!error) setDbStatus("synced");
        else setDbStatus("error");
      }
    }
  };

  const addItem = async (data: Omit<PortfolioItem, "id">) => {
    const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: PortfolioItem = { id, ...data };
    const next = [...items, newItem];
    setItems(next);

    if (supabase) {
      const { error } = await supabase
        .from("portfolio_items")
        .insert(toDB(newItem));
      if (!error) setDbStatus("synced");
      else setDbStatus("error");
    }
  };

  const deleteItem = async (id: number) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);

    if (supabase) {
      const { error } = await supabase
        .from("portfolio_items")
        .delete()
        .eq("id", id);
      if (!error) setDbStatus("synced");
      else setDbStatus("error");
    }
  };

  const resetToDefault = async () => {
    setItems(defaultItems);
    localStorage.removeItem(ITEMS_CACHE_KEY);

    if (supabase) {
      // Delete all, then insert defaults
      await supabase.from("portfolio_items").delete().neq("id", -1);
      const { error } = await supabase
        .from("portfolio_items")
        .insert(defaultItems.map(toDB));
      if (!error) setDbStatus("synced");
      else setDbStatus("error");
    }
  };

  // ── Helpers ──────────────────────────────────────────────
  const getBySlug = (slug: string) => items.find((i) => i.slug === slug);

  const getByCategory = (cat?: string) =>
    !cat || cat === "All" ? items : items.filter((i) => i.category === cat);

  const getFeatured = () =>
    items
      .filter((i) => i.featured)
      .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));

  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category))),
  ];

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

// ─── Hook ─────────────────────────────────────────────────
export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminProvider>");
  return ctx;
}
