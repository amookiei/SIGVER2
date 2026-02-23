import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CustomCursor } from "../components/CustomCursor";

export function Root() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div style={{ backgroundColor: "#FAFAFA", cursor: "none" }}>
      <CustomCursor />
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}