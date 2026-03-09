import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminProvider } from "./context/AdminContext";
import { AboutProvider } from "./context/AboutContext";

export default function App() {
  return (
    <AdminProvider>
      <AboutProvider>
        <RouterProvider router={router} />
      </AboutProvider>
    </AdminProvider>
  );
}
