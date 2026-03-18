import { Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CustomCursor } from "../components/CustomCursor";

export function Root() {
  const location = useLocation();
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none)").matches);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div style={{ backgroundColor: "#FAFAFA", cursor: isTouchDevice ? "auto" : "none" }}>
      {!isTouchDevice && <CustomCursor />}
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}