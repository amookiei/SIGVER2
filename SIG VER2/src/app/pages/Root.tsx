import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CustomCursor } from "../components/CustomCursor";
import { FeedbackWidget } from "../components/FeedbackWidget";
import { trackPageView } from "../../lib/analytics/tracker";

export function Root() {
  const location = useLocation();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  // PM Analytics — 라우트 변경마다 페이지뷰 수집
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  // Scroll to top on route change, or to hash element if present
  useEffect(() => {
    if (location.hash) {
      const id = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(id);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);

  return (
    <div style={{ backgroundColor: "#FAFAFA", cursor: isTouchDevice ? "auto" : "none" }}>
      {!isTouchDevice && <CustomCursor />}
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FeedbackWidget />
    </div>
  );
}