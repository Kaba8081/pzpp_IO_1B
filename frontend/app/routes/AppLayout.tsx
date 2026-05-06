import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Menu, X } from "lucide-react";
import { Outlet, useLocation } from "react-router";
import { Sidebar } from "@/components/Sidebar";

export type MobileSidebar = "left" | "right" | null;

export interface AppLayoutOutletContext {
  mobileSidebar: MobileSidebar;
  setMobileSidebar: Dispatch<SetStateAction<MobileSidebar>>;
  closeMobileSidebar: () => void;
}

export default function AppLayout() {
  const location = useLocation();
  const [mobileSidebar, setMobileSidebar] = useState<MobileSidebar>(null);
  const isSidebarOpen = mobileSidebar === "left";
  const closeMobileSidebar = useCallback(() => setMobileSidebar(null), []);

  useEffect(() => {
    closeMobileSidebar();
  }, [closeMobileSidebar, location.pathname]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background-site text-white">
      <button
        type="button"
        onClick={() => setMobileSidebar((openSidebar) => (openSidebar === "left" ? null : "left"))}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={isSidebarOpen}
        className="fixed left-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-primary bg-background text-primary shadow-xl lg:hidden"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-background-site/75 lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 h-dvh p-3 transition-transform duration-300 lg:static lg:z-auto lg:p-4 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>
      <Outlet context={{ mobileSidebar, setMobileSidebar, closeMobileSidebar }} />
    </div>
  );
}
