import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminProvider } from "./context/AdminContext";
import { AboutProvider } from "./context/AboutContext";
import { HomeContentProvider } from "./context/HomeContentContext";

export default function App() {
  return (
    <AdminProvider>
      <AboutProvider>
        <HomeContentProvider>
          <RouterProvider router={router} />
        </HomeContentProvider>
      </AboutProvider>
    </AdminProvider>
  );
}
