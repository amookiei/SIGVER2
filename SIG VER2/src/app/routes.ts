import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Home } from "./pages/Home";
import { Work } from "./pages/Work";
import { WorkDetail } from "./pages/WorkDetail";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "work", Component: Work },
      { path: "work/:slug", Component: WorkDetail },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
    ],
  },
]);
