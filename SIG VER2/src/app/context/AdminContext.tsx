import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { portfolioItems as defaultItems } from "../data/portfolio";
import type { PortfolioItem } from "../data/portfolio";

// ─── Constants ────────────────────────────────────────────
const ADMIN_PASSWORD = "sig0802!";
const ITEMS_KEY = "sig_admin_items";
const SESSION_KEY = "sig_admin_session";
const SESSION_TTL = 24 * 60 * 60 * 1000; // 24h

// ─── Context type ─────────────────────────────────────────
interface AdminContextType {
  isAdmin: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
  items: PortfolioItem[];
  updateItem: (id: number, data: Partial<PortfolioItem>) => void;
  addItem: (data: Omit<PortfolioItem, "id">) => void;
  deleteItem: (id: number) => void;
  resetToDefault: () => void;
  // helpers
  getBySlug: (slug: string) => PortfolioItem | undefined;
  getByCategory: (cat?: string) => PortfolioItem[];
  getFeatured: () => PortfolioItem[];
  categories: string[];
}

const AdminContext = createContext<AdminContextType | null>(null);

// ─── Loaders ──────────────────────────────────────────────
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

function loadItems(): PortfolioItem[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    return raw ? (JSON.parse(raw) as PortfolioItem[]) : defaultItems;
  } catch {
    return defaultItems;
  }
}

// ─── Provider ─────────────────────────────────────────────
export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(loadSession);
  const [items, setItems] = useState<PortfolioItem[]>(loadItems);

  // Persist items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items]);

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

  const updateItem = (id: number, data: Partial<PortfolioItem>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));

  const addItem = (data: Omit<PortfolioItem, "id">) => {
    const id = items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems((prev) => [...prev, { id, ...data }]);
  };

  const deleteItem = (id: number) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const resetToDefault = () => {
    setItems(defaultItems);
    localStorage.removeItem(ITEMS_KEY);
  };

  // ─── Helpers ──────────────────────────────────────────
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
