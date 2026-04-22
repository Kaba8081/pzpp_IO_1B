import { Outlet } from "react-router";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-site text-white">
      <div className="p-4 h-full">
        <Sidebar />
      </div>
      <Outlet />
    </div>
  );
}
