import React, { useEffect, useMemo, useRef, useState } from "react";
import { Home, PlusCircle, UserPen, LogOut, MoreVertical } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router";
import { Button } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { WorldDropdown } from "@/components/ui/WorldDropdown";
import { useUserStore } from "@/stores/UserStore";
import { getUserWorlds, getWorldById } from "@/services/world";
import { getChannels } from "@/services/worldRoom";
import { getDMThreads } from "@/services/dm/getThreads.service";
import { useWorldPermissions } from "@/hooks/useWorldPermissions";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import type { World, Channel, DirectMessageThread, ProfilePopupData } from "@/types/models";

interface WorldSidebarItemProps {
  world: World;
  channels: Channel[];
  activeWorldId?: string;
  activeRoomId?: string;
  unreadRoomIds: Set<number>;
}

const WorldSidebarItem: React.FC<WorldSidebarItemProps> = ({
  world,
  channels,
  activeWorldId,
  activeRoomId,
  unreadRoomIds,
}) => {
  const { modal, setEditingWorld } = useUserStore();
  const navigate = useNavigate();
  const perms = useWorldPermissions(world.id);

  const worldHasUnread = channels.some((ch) => unreadRoomIds.has(ch.id));

  return (
    <WorldDropdown
      title={world.name ?? "Untitled World"}
      hasUnread={worldHasUnread}
      items={channels.map((ch) => ({
        label: ch.name ?? "Untitled Channel",
        isActive: activeRoomId === String(ch.id),
        hasUnread: unreadRoomIds.has(ch.id),
        onClick: () => navigate(`/world/${world.id}/${ch.id}`),
      }))}
      defaultOpen={activeWorldId === String(world.id)}
      isActive={activeWorldId === String(world.id)}
      onEdit={
        perms.has("manage_world")
          ? () => {
              setEditingWorld(world);
              modal.open("world-modal");
            }
          : undefined
      }
      onDelete={
        perms.has("manage_world")
          ? () => {
              setEditingWorld(world);
              modal.open("world-modal");
            }
          : undefined
      }
      onCreateItem={
        perms.has("manage_channels")
          ? () => {
              setEditingWorld(world);
              modal.open("channel-modal");
            }
          : undefined
      }
      onManageRoles={
        perms.has("manage_roles") ? () => navigate(`/world/roles/${world.id}`) : undefined
      }
    />
  );
};

export const Sidebar: React.FC = () => {
  const {
    user,
    isLoggedIn,
    modal,
    worldsVersion,
    removedWorldMembership,
    channelsVersion,
    setEditingWorld,
    unreadDMThreadIds,
    unreadRoomIds,
  } = useUserStore();

  const navigate = useNavigate();
  const location = useLocation();
  const { worldId, roomId } = useParams<{ worldId?: string; roomId?: string }>();

  const [activeTab, setActiveTab] = useState<string>("worlds");
  const [worlds, setWorlds] = useState<World[]>([]);
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [channelsByWorldId, setChannelsByWorldId] = useState<Record<number, Channel[]>>({});
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const [dmThreads, setDmThreads] = useState<DirectMessageThread[]>([]);
  const [viewingProfile, setViewingProfile] = useState<ProfilePopupData | null>(null);

  const isHomeActive = location.pathname === "/";
  const sidebarWorlds = useMemo(() => {
    if (!currentWorld || worlds.some((world) => world.id === currentWorld.id)) return worlds;
    return [currentWorld, ...worlds];
  }, [currentWorld, worlds]);

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

  // Get Worlds
  useEffect(() => {
    if (!isLoggedIn) {
      setWorlds([]);
      return;
    }
    getUserWorlds()
      .then(setWorlds)
      .catch(() => setWorlds([]));
  }, [isLoggedIn, worldsVersion]);

  // Get Dm Threads
  useEffect(() => {
    if (!isLoggedIn) {
      setDmThreads([]);
      return;
    }
    getDMThreads()
      .then(setDmThreads)
      .catch(() => setDmThreads([]));
  }, [isLoggedIn]);

  // Filter out the world's that the user doesn't belong to
  useEffect(() => {
    if (!removedWorldMembership) return;
    setWorlds((prev) => prev.filter((world) => world.id !== removedWorldMembership.worldId));
    setChannelsByWorldId((prev) => {
      const next = { ...prev };
      delete next[removedWorldMembership.worldId];
      return next;
    });
  }, [removedWorldMembership]);

  // Fetch current world
  useEffect(() => {
    if (!worldId) {
      setCurrentWorld(null);
      return;
    }

    const parsedWorldId = parseInt(worldId);
    if (!Number.isFinite(parsedWorldId)) {
      setCurrentWorld(null);
      return;
    }

    setCurrentWorld((prev) => (prev?.id === parsedWorldId ? prev : null));

    if (worlds.some((world) => world.id === parsedWorldId)) {
      setCurrentWorld(null);
      return;
    }

    let isMounted = true;
    getWorldById(parsedWorldId)
      .then((world) => {
        if (isMounted) setCurrentWorld(world);
      })
      .catch(() => {
        if (isMounted) setCurrentWorld(null);
      });

    return () => {
      isMounted = false;
    };
  }, [worldId, worlds]);

  // Get world channels
  useEffect(() => {
    if (sidebarWorlds.length === 0) {
      setChannelsByWorldId({});
      return;
    }

    sidebarWorlds.forEach((world) => {
      getChannels(world.id)
        .then((channels) => setChannelsByWorldId((prev) => ({ ...prev, [world.id]: channels })))
        .catch(() => setChannelsByWorldId((prev) => ({ ...prev, [world.id]: [] })));
    });
  }, [sidebarWorlds, channelsVersion]);

  const hasUnreadThreads = useMemo(() => unreadDMThreadIds.size > 0, [unreadDMThreadIds]);

  const tabItems: TabItem[] = [
    { id: "worlds", label: "Worlds" },
    { id: "messages", label: "Messages", hasBadge: hasUnreadThreads },
  ];

  return (
    <aside className="w-[min(21.25rem,calc(100vw-1.5rem))] lg:w-85 h-full bg-background border-2 border-primary rounded-2xl flex flex-col px-6 py-8 lg:px-8 lg:py-10 shrink-0">
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
                    if (user) {
                      setViewingProfile({
                        id: user.id,
                        name: user.profile?.username ?? user.email,
                        description: user.profile?.description ?? null,
                        avatar: user.profile?.profile_picture ?? null,
                        user_id: user.id,
                      });
                    }
                    setIsAccountMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-left text-white hover:bg-primary/20 transition-colors flex items-center gap-2"
                >
                  <UserPen className="w-3 h-3" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    modal.open("logout");
                    setIsAccountMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-left text-error hover:bg-error/10 transition-colors flex items-center gap-2"
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
            {sidebarWorlds.length > 0 && (
              <div className="flex flex-col mb-8">
                {sidebarWorlds.map((world) => (
                  <WorldSidebarItem
                    key={world.id}
                    world={world}
                    channels={channelsByWorldId[world.id] ?? []}
                    activeWorldId={worldId}
                    activeRoomId={roomId}
                    unreadRoomIds={unreadRoomIds}
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
              <p className="text-input-placeholder text-center mt-4">
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
          <div className="flex flex-col mt-4 gap-1">
            {!isLoggedIn ? (
              <p className="text-input-placeholder text-center mt-6">
                <button
                  className="text-primary hover:underline"
                  onClick={() => modal.open("login")}
                >
                  Login
                </button>{" "}
                to view messages.
              </p>
            ) : dmThreads.length === 0 ? (
              <p className="text-input-placeholder text-center mt-6">No messages yet.</p>
            ) : (
              dmThreads.map((thread) => {
                const hasUnread = unreadDMThreadIds.has(thread.id);
                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => navigate(`/dm/${thread.id}`)}
                    className="flex items-center gap-3 w-full text-left rounded-xl px-3 py-2.5 hover:bg-primary/10 transition-colors"
                  >
                    <div className="relative shrink-0">
                      {thread.other_user?.avatar ? (
                        <img
                          src={thread.other_user.avatar}
                          alt={thread.other_user.username}
                          className="w-9 h-9 rounded-full object-cover border border-primary/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary select-none text-sm">
                          {(thread.other_user?.username ?? "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      {hasUnread && (
                        <span
                          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                          aria-label="Unread messages"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm truncate ${hasUnread ? "text-white font-medium" : "text-white"}`}
                      >
                        {thread.other_user?.username ?? "Unknown"}
                      </div>
                      {thread.last_message && (
                        <div
                          className={`text-xs truncate ${hasUnread ? "text-primary/80" : "text-input-placeholder"}`}
                        >
                          {thread.last_message.content}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-center">
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

      {viewingProfile && (
        <UserProfileModal profile={viewingProfile} onClose={() => setViewingProfile(null)} />
      )}
    </aside>
  );
};
