import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminProvider } from "./context/AdminContext";
import { AboutProvider } from "./context/AboutContext";
import { HomeContentProvider } from "./context/HomeContentContext";
import { ContactProvider } from "./context/ContactContext";
import { GalleryProvider } from "./context/GalleryContext";

export default function App() {
  return (
    <AdminProvider>
      <AboutProvider>
        <HomeContentProvider>
          <ContactProvider>
            <GalleryProvider>
              <RouterProvider router={router} />
            </GalleryProvider>
          </ContactProvider>
        </HomeContentProvider>
      </AboutProvider>
    </AdminProvider>
  );
}
