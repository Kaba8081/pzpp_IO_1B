import React, { useState } from "react";
import { Home, PlusCircle } from "lucide-react";
import { Button } from "./Button";
import { Tabs, type TabItem } from "./Tabs";
import { Dropdown, type DropdownItem } from "./Dropdown";
import { useUserStore } from "@/stores/UserStore";
import type { World, WorldRoom } from "@/types/models";

export interface SidebarWorldData {
  world: World;
  rooms: WorldRoom[];
  defaultOpen?: boolean;
  activeRoomId?: number;
}

interface SidebarProps {
  isHomeActive?: boolean;
  worlds?: SidebarWorldData[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isHomeActive = false, worlds = [] }) => {
  const { user, isLoggedIn } = useUserStore();
  const [activeTab, setActiveTab] = useState<string>("worlds");

  const tabItems: TabItem[] = [
    { id: "worlds", label: "Worlds" },
    { id: "messages", label: "Messages", hasBadge: isLoggedIn },
  ];

  return (
    <aside className="w-85 h-full bg-background border-2 border-primary rounded-2xl flex flex-col px-8 py-10 overflow-y-auto">
      {/* gorna sekcja - account */}
      {isLoggedIn && user ? (
        <div className="flex items-center gap-5 mb-12">
          {user.profile?.profile_picture ? (
            <img
              src={user.profile.profile_picture}
              alt="User Avatar"
              className="w-14 h-14 rounded-full border border-primary/50 object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border border-primary/50 bg-primary/15 flex items-center justify-center text-primary">
              {(user.profile?.username || user.email).slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-input-placeholder mb-1">Account</div>
            <div>{user.profile?.username || user.email}</div>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-12">
          <Button variant="outline" className="flex-1 px-0 py-2.5">
            Login
          </Button>
          <Button variant="outline" className="flex-1 px-0 py-2.5">
            Register
          </Button>
        </div>
      )}

      {/* home button */}
      <Button
        variant="ghost"
        className={`flex items-center justify-start gap-5 w-full rounded-2xl mb-10 ${
          isHomeActive ? "bg-primary" : "hover:bg-primary/10"
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span>Home</span>
      </Button>

      {/* tabs */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} items={tabItems} />

      {/* tabs - kontent (worlds-dropdown/wiadomości) */}
      <div className="flex-1 flex flex-col">
        {activeTab === "worlds" && (
          <>
            {/* Lista światów dla zalogowanych */}
            {isLoggedIn && worlds.length > 0 && (
              <div className="flex flex-col gap-2 mb-8">
                {worlds.map((worldData) => {
                  const items: DropdownItem[] = worldData.rooms.map((room) => ({
                    label: room.name ?? "Untitled Room",
                    isActive: room.id === worldData.activeRoomId,
                  }));

                  return (
                    <Dropdown
                      key={worldData.world.id}
                      title={worldData.world.name ?? "Untitled World"}
                      items={items}
                      defaultOpen={worldData.defaultOpen}
                    />
                  );
                })}
              </div>
            )}

            {/* Przycisk dodawania światów */}
            <Button variant="clear" className="flex items-center gap-5 justify-start w-full">
              <PlusCircle className="w-5.5 h-5.5" />
              <span>Create World</span>
            </Button>
          </>
        )}

        {activeTab === "messages" && (
          <div className="text-input-placeholder  mt-10 text-center">
            {isLoggedIn ? "No new messages." : "Login to view messages."}
          </div>
        )}
      </div>

      {/* stopkaa */}
      <div className="mt-12 flex flex-col items-center">
        <div className="mb-8 w-40 h-52 bg-linear-to-b from-primary/10 to-transparent border border-primary/20 rounded flex items-center justify-center text-center">
          <span className="text-primary">
            LOGO
            <br />
            PLACEHOLDER
          </span>
        </div>

        <div className="flex gap-6 text-input-placeholder mb-5">
          <a
            href="#"
            className="hover:transition-colors underline underline-offset-[5px] decoration-gray-600 hover:decoration-primary"
          >
            Terms of service
          </a>
          <a
            href="#"
            className="hover:transition-colors underline underline-offset-[5px] decoration-gray-600 hover:decoration-primary"
          >
            Help
          </a>
        </div>

        <div className="text-input-placeholder text-center">©2026 Forum Chronicles</div>
      </div>
    </aside>
  );
};
