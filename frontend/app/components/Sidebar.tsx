import React, { useEffect, useRef, useState } from "react";
import { Home, PlusCircle, UserPen, LogOut, MoreVertical } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router";
import { Button } from "./Button";
import { Tabs, type TabItem } from "./Tabs";
import { Dropdown } from "./Dropdown";
import { useUserStore } from "@/stores/UserStore";
import { getUserWorlds } from "@/services/world";
import { getChannels } from "@/services/worldRoom";
import type { World, Channel } from "@/types/models";

export const Sidebar: React.FC = () => {
  const { user, isLoggedIn, modal, worldsVersion, channelsVersion, setEditingWorld } =
    useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { worldId } = useParams<{ worldId?: string }>();

  const [activeTab, setActiveTab] = useState<string>("worlds");
  const [worlds, setWorlds] = useState<World[]>([]);
  const [channelsByWorldId, setChannelsByWorldId] = useState<Record<number, Channel[]>>({});
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const isHomeActive = location.pathname === "/";

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isAccountMenuOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      setWorlds([]);
      setChannelsByWorldId({});
      return;
    }
    getUserWorlds()
      .then(setWorlds)
      .catch(() => setWorlds([]));
  }, [isLoggedIn, worldsVersion]);

  useEffect(() => {
    if (!isLoggedIn || worlds.length === 0) return;
    worlds.forEach((world) => {
      getChannels(world.id)
        .then((channels) => setChannelsByWorldId((prev) => ({ ...prev, [world.id]: channels })))
        .catch(() => setChannelsByWorldId((prev) => ({ ...prev, [world.id]: [] })));
    });
  }, [isLoggedIn, worlds, channelsVersion]);

  const tabItems: TabItem[] = [
    { id: "worlds", label: "Worlds" },
    { id: "messages", label: "Messages", hasBadge: isLoggedIn },
  ];

  return (
    <aside className="w-85 h-full bg-background border-2 border-primary rounded-2xl flex flex-col px-8 py-10 shrink-0">
      {isLoggedIn && user ? (
        <div className="flex items-center gap-5 mb-12">
          {user.profile?.profile_picture ? (
            <img
              src={user.profile.profile_picture}
              alt="User Avatar"
              className="w-14 h-14 rounded-full border-2 border-primary/50 object-cover shrink-0 transition-all duration-200 hover:border-primary hover:shadow-[0_0_12px_rgba(6,140,124,0.35)] hover:scale-105"
            />
          ) : (
            <div className="w-14 h-14 rounded-full border-2 border-primary/50 bg-primary/15 flex items-center justify-center text-primary shrink-0 transition-all duration-200 hover:border-primary hover:shadow-[0_0_12px_rgba(6,140,124,0.35)] hover:scale-105 select-none">
              {(user.profile?.username || user.email).slice(0, 1)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-input-placeholder mb-1">Account</div>
            <div className="text-white truncate">{user.profile?.username || user.email}</div>
          </div>
          <div className="relative shrink-0" ref={accountMenuRef}>
            <button
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              className="p-1.5 text-input-placeholder hover:text-white hover:bg-primary/20 transition-all rounded-md"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-background border border-primary/50 rounded-xl overflow-hidden shadow-xl flex flex-col min-w-40 animate-fade-in">
                <button
                  onClick={() => {
                    modal.open("edit-profile");
                    setIsAccountMenuOpen(false);
                  }}
                  className="px-4 py-2.5 tracking-widest text-left text-white hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <UserPen className="w-3 h-3" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    modal.open("logout");
                    setIsAccountMenuOpen(false);
                  }}
                  className="px-4 py-2.5 tracking-widest text-left text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 mb-12">
          <Button
            variant="outline"
            className="flex-1 px-0 py-2.5"
            onClick={() => modal.open("login")}
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="flex-1 px-0 py-2.5"
            onClick={() => modal.open("register")}
          >
            Register
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className={`flex items-center justify-start gap-5 w-full rounded-2xl mb-10 ${
          isHomeActive ? "bg-primary" : "hover:bg-primary/10"
        }`}
      >
        <Home className="w-5.5 h-5.5" />
        <span>Home</span>
      </Button>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} items={tabItems} />

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        {activeTab === "worlds" && (
          <>
            {isLoggedIn && worlds.length > 0 && (
              <div className="flex flex-col mb-8">
                {worlds.map((world) => (
                  <Dropdown
                    key={world.id}
                    title={world.name ?? "Untitled World"}
                    items={(channelsByWorldId[world.id] ?? []).map((ch) => ({
                      label: ch.name ?? "Untitled Channel",
                      isActive: false,
                      onClick: () => navigate(`/world/${world.id}/${ch.id}`),
                    }))}
                    defaultOpen={worldId === String(world.id)}
                    isActive={worldId === String(world.id)}
                    onEdit={() => {
                      setEditingWorld(world);
                      modal.open("world-modal");
                    }}
                    onDelete={() => {
                      setEditingWorld(world);
                      modal.open("world-modal");
                    }}
                    onCreateItem={() => {
                      setEditingWorld(world);
                      modal.open("channel-modal");
                    }}
                  />
                ))}
              </div>
            )}

            {isLoggedIn ? (
              <button
                className="flex items-center gap-5 justify-start w-full border border-dashed border-primary/30 rounded-xl px-4 py-3 text-white hover:border-primary/70 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                onClick={() => {
                  setEditingWorld(null);
                  modal.open("world-modal");
                }}
              >
                <PlusCircle className="w-5.5 h-5.5" />
                <span>Create World</span>
              </button>
            ) : (
              <p className="text-input-placeholder tracking-widest text-center mt-4">
                <button
                  className="text-primary hover:underline"
                  onClick={() => modal.open("login")}
                >
                  Login
                </button>{" "}
                to create worlds.
              </p>
            )}
          </>
        )}

        {activeTab === "messages" && (
          <div className="text-input-placeholder mt-10 text-center">
            {isLoggedIn ? "No new messages." : "Login to view messages."}
          </div>
        )}
      </div>

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

        <div className="text-input-placeholder text-center">© 2026 Forum Chronicles</div>
      </div>
    </aside>
  );
};
