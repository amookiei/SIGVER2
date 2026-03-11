import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminProvider } from "./context/AdminContext";
import { AboutProvider } from "./context/AboutContext";
import { HomeContentProvider } from "./context/HomeContentContext";
import { ContactProvider } from "./context/ContactContext";

export default function App() {
  return (
    <AdminProvider>
      <AboutProvider>
        <HomeContentProvider>
          <ContactProvider>
            <RouterProvider router={router} />
          </ContactProvider>
        </HomeContentProvider>
      </AboutProvider>
    </AdminProvider>
  );
}
