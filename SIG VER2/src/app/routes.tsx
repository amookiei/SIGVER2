import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Work } from "./pages/Work";
import { WorkDetail } from "./pages/WorkDetail";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "work", Component: Work },
      {
        path: "work/:slug",
        Component: WorkDetail,
        // 잘못된 slug (URL 디코딩 실패 등)는 Work 목록으로 복구
        errorElement: <Navigate to="/work" replace />,
      },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);
