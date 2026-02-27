import { z } from "zod";

// ─── SSRF-safe URL validator ──────────────────────────────
const PRIVATE_IP_RE = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^0\.\d+\.\d+\.\d+$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fe80:/i,
  /^169\.254\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^metadata\.google\.internal$/i,
  /^169\.254\.169\.254$/,
];

export function isSafeUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const host = parsed.hostname.toLowerCase();
    return !PRIVATE_IP_RE.some((re) => re.test(host));
  } catch {
    return false;
  }
}

const safeUrlField = z
  .string()
  .max(2048)
  .nullable()
  .optional()
  .refine((url) => !url || isSafeUrl(url), {
    message: "안전하지 않거나 잘못된 URL입니다.",
  });

// ─── Portfolio item schema ────────────────────────────────
export const portfolioItemSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(200).trim(),
  client: z.string().min(1, "클라이언트를 입력해주세요.").max(200).trim(),
  category: z.string().min(1).max(100).trim(),
  year: z
    .number()
    .int()
    .min(2000, "연도는 2000 이후여야 합니다.")
    .max(new Date().getFullYear() + 1),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "slug는 소문자·숫자·하이픈만 사용 가능합니다."),
  tagline: z.string().max(500).trim(),
  description: z.string().max(5000).trim(),
  challenge: z.string().max(2000).trim().nullable().optional(),
  solution: z.string().max(2000).trim().nullable().optional(),
  role: z.string().max(200).trim(),
  duration: z.string().max(100).trim(),
  tags: z.array(z.string().max(50).trim()).max(20),
  liveUrl: safeUrlField,
  nextProject: z.string().max(100).nullable().optional(),
  featured: z.boolean(),
  order: z.number().int().nullable().optional(),
  thumbnail: z.string().max(500).trim(),
  heroImage: z.string().max(500).trim(),
  gallery: z.array(z.string().max(500).trim()).max(50),
});

// ─── Contact form schema ──────────────────────────────────
const XSS_CHARS_RE = /[<>{}|\\^~\[\]`]/;

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(100)
    .trim()
    .refine((v) => !XSS_CHARS_RE.test(v), "특수문자를 사용할 수 없습니다."),
  company: z.string().max(200).trim().optional(),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요.")
    .max(254)
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .max(20)
    .trim()
    .optional()
    .refine((v) => !v || /^[\d\s+\-().]{7,20}$/.test(v), {
      message: "올바른 전화번호 형식을 입력해주세요.",
    }),
  message: z.string().min(5, "메시지는 최소 5자 이상 입력해주세요.").max(2000).trim(),
  services: z.array(z.string().max(100)).max(20).optional(),
  budget: z.string().max(100).optional(),
});

// ─── Login schema ─────────────────────────────────────────
export const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요.").max(200),
});

// ─── Slug sanitizer ───────────────────────────────────────
export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
