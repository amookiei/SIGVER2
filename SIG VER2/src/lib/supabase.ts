import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * supabase 클라이언트.
 * .env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없으면 null.
 * null인 경우 AdminContext는 localStorage만 사용합니다.
 */
export const supabase = url && key ? createClient(url, key) : null;
export const isSupabaseReady = Boolean(url && key);
