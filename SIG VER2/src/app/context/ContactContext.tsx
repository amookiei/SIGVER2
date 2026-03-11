import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────
export interface ContactContent {
  tagline: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
}

export const defaultContactContent: ContactContent = {
  tagline: "프로젝트 문의, 협업 제안, 견적 요청 모두 환영합니다.",
  email: "hello@sigstudio.kr",
  phone: "010-7667-6013",
  address: "서울특별시 서대문구\n홍제천로 6길 40 1층",
  hours: "월 – 금 / 09:00 – 18:00\n주말 및 공휴일 휴무",
};

const CACHE_KEY = "sig_contact_content";
const DB_KEY = "contact_content";

function loadCache(): ContactContent {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return defaultContactContent;
    const parsed = JSON.parse(raw) as Partial<ContactContent>;
    return {
      tagline: parsed.tagline ?? defaultContactContent.tagline,
      email: parsed.email ?? defaultContactContent.email,
      phone: parsed.phone ?? defaultContactContent.phone,
      address: parsed.address ?? defaultContactContent.address,
      hours: parsed.hours ?? defaultContactContent.hours,
    };
  } catch {
    return defaultContactContent;
  }
}

function saveCache(data: ContactContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────
interface ContactContextType {
  contact: ContactContent;
  saving: boolean;
  saveError: string | null;
  dbStatus: "none" | "synced" | "error";
  updateContact: (data: ContactContent) => Promise<void>;
  resetContact: () => Promise<void>;
}

const ContactContext = createContext<ContactContextType | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [contact, setContactState] = useState<ContactContent>(loadCache);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<"none" | "synced" | "error">("none");

  const setContact = (data: ContactContent) => {
    setContactState(data);
    saveCache(data);
  };

  const fetchFromDB = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", DB_KEY)
        .maybeSingle();
      if (error) throw error;
      if (data?.value) {
        const parsed = data.value as Partial<ContactContent>;
        setContact({
          tagline: parsed.tagline ?? defaultContactContent.tagline,
          email: parsed.email ?? defaultContactContent.email,
          phone: parsed.phone ?? defaultContactContent.phone,
          address: parsed.address ?? defaultContactContent.address,
          hours: parsed.hours ?? defaultContactContent.hours,
        });
      }
      setDbStatus("synced");
    } catch (err) {
      console.error("[ContactDB fetch]", err);
      setDbStatus("error");
    }
  }, []);

  useEffect(() => {
    if (supabase) fetchFromDB();
  }, [fetchFromDB]);

  const updateContact = async (data: ContactContent) => {
    setContact(data);
    setSaveError(null);
    if (!supabase) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("site_settings").upsert({
        key: DB_KEY,
        value: data,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setDbStatus("synced");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 실패");
      setDbStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const resetContact = async () => {
    await updateContact(defaultContactContent);
    localStorage.removeItem(CACHE_KEY);
  };

  return (
    <ContactContext.Provider value={{ contact, saving, saveError, dbStatus, updateContact, resetContact }}>
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContact must be used inside <ContactProvider>");
  return ctx;
}
