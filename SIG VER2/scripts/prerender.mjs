// =============================================================================
// SEO 포스트빌드 스크립트 — sitemap.xml 자동 생성 + 라우트 프리렌더링
// =============================================================================
//
// `npm run build` 마지막 단계에서 실행됩니다.
//
// 1) sitemap.xml 생성
//    src/app/data/portfolio.ts 의 프로젝트 목록(hidden 제외)을 읽어
//    dist/sitemap.xml 을 자동 생성합니다. 프로젝트를 추가/삭제하면
//    다음 빌드에서 사이트맵에 자동 반영됩니다.
//
// 2) 프리렌더링 (네이버·다음 SEO 핵심)
//    빌드된 SPA를 로컬 서버로 띄우고 headless Chromium 으로 각 라우트를
//    방문해 완성된 HTML 을 dist/<route>/index.html 로 저장합니다.
//    검색엔진 크롤러가 자바스크립트 없이도 본문을 읽을 수 있게 됩니다.
//
//    Chromium 을 찾지 못하면 프리렌더링만 건너뛰고 빌드는 성공합니다
//    (사이트는 기존처럼 SPA 로 동작). 빌드 로그에서 "[prerender]" 를 확인하세요.
//
// =============================================================================

import { createServer as createViteServer } from "vite";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const execFileP = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ORIGIN = "https://www.studiosig.com";

// ─── 0. 포트폴리오 데이터 로드 (vite SSR 로더로 TS 그대로 평가) ─────────────
async function loadPortfolio() {
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
    optimizeDeps: { noDiscovery: true },
  });
  try {
    const mod = await vite.ssrLoadModule("/src/app/data/portfolio.ts");
    return mod.portfolioItems.filter((p) => !p.hidden);
  } finally {
    await vite.close();
  }
}

// ─── 1. sitemap.xml 생성 ────────────────────────────────────────────────────
function generateSitemap(items) {
  const today = new Date().toISOString().slice(0, 10);
  const staticRoutes = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/work", priority: "0.9", changefreq: "weekly" },
    { loc: "/about", priority: "0.85", changefreq: "monthly" },
    { loc: "/contact", priority: "0.8", changefreq: "monthly" },
    { loc: "/gallery", priority: "0.75", changefreq: "weekly" },
    { loc: "/space", priority: "0.7", changefreq: "monthly" },
  ];
  const workRoutes = items.map((p) => ({
    loc: `/work/${p.slug}`,
    priority: "0.7",
    changefreq: "yearly",
  }));
  const urls = [...staticRoutes, ...workRoutes]
    .map(
      (r) => `  <url>
    <loc>${ORIGIN}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  fs.writeFileSync(path.join(dist, "sitemap.xml"), xml);
  console.log(`[sitemap] dist/sitemap.xml 생성 완료 (${staticRoutes.length + workRoutes.length}개 URL)`);
}

// ─── 2. Chromium 실행 파일 탐색 ─────────────────────────────────────────────
async function findChromium() {
  // 2-1. 환경 변수로 명시된 경우
  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) {
    return { bin: process.env.CHROMIUM_PATH, args: [] };
  }
  // 2-2. 로컬에 설치된 브라우저
  const candidates = [
    "/opt/pw-browsers/chromium",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const st = fs.statSync(c);
      if (st.isFile()) return { bin: c, args: [] };
      if (st.isDirectory()) {
        // playwright 스타일 디렉토리 안에서 실행 파일 탐색
        for (const sub of ["chrome", "chrome-linux/chrome", "chrome-linux/headless_shell", "headless_shell"]) {
          const p = path.join(c, sub);
          if (fs.existsSync(p)) return { bin: p, args: [] };
        }
        const found = findBinRecursive(c, ["chrome", "headless_shell", "chromium"], 3);
        if (found) return { bin: found, args: [] };
      }
    }
  }
  // 2-3. @sparticuz/chromium (Vercel/AWS 빌드 환경용, devDependency)
  try {
    const { default: sparticuz } = await import("@sparticuz/chromium");
    const bin = await sparticuz.executablePath();
    return { bin, args: sparticuz.args.filter((a) => !a.startsWith("--headless")) };
  } catch {
    return null;
  }
}

function findBinRecursive(dir, names, depth) {
  if (depth < 0) return null;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isFile() && names.includes(entry.name)) return p;
    if (entry.isDirectory()) {
      const found = findBinRecursive(p, names, depth - 1);
      if (found) return found;
    }
  }
  return null;
}

// ─── 3. dist 정적 서버 (SPA fallback 포함) ──────────────────────────────────
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".mp4": "video/mp4", ".wav": "audio/wav", ".woff2": "font/woff2", ".txt": "text/plain",
};

// 프리렌더 중 GA 히트가 쌓이지 않도록 gtag 스크립트를 임시 제거하고,
// 저장 시 원본 그대로 복원합니다.
const GTAG_RE = /<!-- Google tag \(gtag\.js\) -->[\s\S]*?<\/script>\s*<script>[\s\S]*?<\/script>/;

function startServer(indexHtml) {
  const servedIndex = indexHtml.replace(GTAG_RE, "<!-- gtag removed during prerender -->");
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
      const filePath = path.join(dist, urlPath);
      if (urlPath !== "/" && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.setHeader("Content-Type", MIME[path.extname(filePath)] ?? "application/octet-stream");
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.setHeader("Content-Type", "text/html");
        res.end(servedIndex);
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

// ─── 4. 프리렌더링 ──────────────────────────────────────────────────────────
async function prerender(routes, indexHtml) {
  const chromium = await findChromium();
  if (!chromium) {
    console.warn("[prerender] ⚠ Chromium 을 찾지 못해 프리렌더링을 건너뜁니다. (SPA 로 배포됨)");
    console.warn("[prerender]   해결: CHROMIUM_PATH 환경변수 지정 또는 `npm i -D @sparticuz/chromium`");
    return;
  }
  console.log(`[prerender] Chromium: ${chromium.bin}`);

  const server = await startServer(indexHtml);
  const port = server.address().port;
  const gtagSnippet = indexHtml.match(GTAG_RE)?.[0];

  let ok = 0;
  try {
    for (const route of routes) {
      const url = `http://127.0.0.1:${port}${route}`;
      try {
        const { stdout } = await execFileP(
          chromium.bin,
          [
            ...chromium.args,
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--hide-scrollbars",
            "--window-size=1280,1024",
            "--virtual-time-budget=10000",
            "--dump-dom",
            url,
          ],
          { maxBuffer: 64 * 1024 * 1024, timeout: 90_000 },
        );
        let html = stdout.trim();
        if (!html.toLowerCase().startsWith("<!doctype")) html = "<!DOCTYPE html>\n" + html;
        // 본문이 실제로 렌더링됐는지 확인 (root 가 비어 있으면 저장하지 않음)
        if (!/<div id="root">[\s\S]*?<[a-z]/i.test(html)) {
          console.warn(`[prerender] ⚠ ${route} — 렌더 결과가 비어 있어 건너뜁니다`);
          continue;
        }
        // 프리렌더 시 제거했던 gtag 스니펫 복원
        if (gtagSnippet && !html.includes("googletagmanager.com/gtag")) {
          html = html.replace("<head>", `<head>\n${gtagSnippet}`);
        }
        const outDir = route === "/" ? dist : path.join(dist, route.slice(1));
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(path.join(outDir, "index.html"), html);
        ok++;
        console.log(`[prerender] ✓ ${route}`);
      } catch (err) {
        console.warn(`[prerender] ⚠ ${route} 실패: ${err.message?.split("\n")[0]}`);
      }
    }
  } finally {
    server.close();
  }
  console.log(`[prerender] ${ok}/${routes.length} 라우트 완료`);
}

// ─── 실행 ───────────────────────────────────────────────────────────────────
try {
  if (!fs.existsSync(path.join(dist, "index.html"))) {
    console.error("[prerender] dist/index.html 이 없습니다. 먼저 vite build 를 실행하세요.");
    process.exit(1);
  }
  const items = await loadPortfolio();
  generateSitemap(items);

  const routes = [
    "/",
    "/work",
    "/about",
    "/contact",
    "/gallery",
    "/space",
    ...items.map((p) => `/work/${p.slug}`),
  ];
  const indexHtml = fs.readFileSync(path.join(dist, "index.html"), "utf-8");
  await prerender(routes, indexHtml);
} catch (err) {
  // SEO 후처리 실패가 배포 자체를 막지 않도록 경고만 남기고 성공 종료
  console.warn(`[prerender] ⚠ 후처리 중 오류 (빌드는 계속됩니다): ${err.message}`);
}
