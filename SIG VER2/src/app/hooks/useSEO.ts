import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  /** 페이지별 JSON-LD 구조화 데이터 (예: BreadcrumbList, CreativeWork) */
  jsonLd?: Record<string, unknown>;
  /** true 시 검색엔진 인덱스 제외 (관리자 페이지 등) */
  noindex?: boolean;
}

const JSONLD_ID = "page-jsonld";

export function useSEO({ title, description, canonical, jsonLd, noindex }: SEOProps) {
  const jsonLdStr = jsonLd ? JSON.stringify(jsonLd) : undefined;

  useEffect(() => {
    document.title = title;

    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", description);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", description);

      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute("content", description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", title);

    if (canonical) {
      const link = document.querySelector('link[rel="canonical"]');
      if (link) link.setAttribute("href", canonical);

      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute("content", canonical);
    }

    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");

    // 페이지별 JSON-LD: 기존 것 제거 후 새로 주입
    const prev = document.getElementById(JSONLD_ID);
    if (prev) prev.remove();
    if (jsonLdStr) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = JSONLD_ID;
      script.textContent = jsonLdStr;
      document.head.appendChild(script);
    }
  }, [title, description, canonical, jsonLdStr, noindex]);
}
