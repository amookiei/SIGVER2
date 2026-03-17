import { createBrowserRouter, Navigate } from "react-router";
import { createElement } from "react";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Work } from "./pages/Work";
import { WorkDetail } from "./pages/WorkDetail";
import { About } from "./pages/About";
import { Clients } from "./pages/Clients";
import { Gallery } from "./pages/Gallery";
import { Space } from "./pages/Space";
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
        errorElement: createElement(Navigate, { to: "/work", replace: true }),
      },
      { path: "about", Component: About },
      { path: "clients", Component: Clients },
      { path: "gallery", Component: Gallery },
      { path: "space", Component: Space },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);
