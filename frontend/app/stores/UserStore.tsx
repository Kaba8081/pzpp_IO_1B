import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser, World, WorldUserProfile } from "@/types/models";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookieUtils";
import { registerToastHandler, type ToastType } from "@/lib/toastBridge";
import { registerLogoutHandler } from "@/lib/authBridge";

const USER_COOKIE_NAME = "user";
const PROFILES_BY_WORLD_KEY = "activeProfilesByWorld";

function readProfilesByWorldFromStorage(): Record<number, WorldUserProfile> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(PROFILES_BY_WORLD_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function persistProfilesByWorld(profiles: Record<number, WorldUserProfile>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILES_BY_WORLD_KEY, JSON.stringify(profiles));
  } catch {
    // ignore
  }
}

interface UserContextType {
  user: SessionUser | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;

  permissionsByWorld: Record<number, string[]>;
  setWorldPermissions: (worldId: number, permissions: string[]) => void;

  currentModal: string | undefined;
  modal: {
    open: (name: string) => void;
    close: () => void;
  };

  currentToast: { message: string; type: ToastType } | null;
  toast: {
    open: (message: string, type: ToastType, duration?: number) => void;
    close: () => void;
  };

  worldsVersion: number;
  bumpWorldsVersion: () => void;
  removedWorldMembership: { worldId: number; version: number } | null;
  markWorldMembershipRemoved: (worldId: number) => void;

  channelsVersion: number;
  bumpChannelsVersion: () => void;

  editingWorld: World | null;
  setEditingWorld: (world: World | null) => void;

  deletingWorld: World | null;
  setDeletingWorld: (world: World | null) => void;

  channelCreationWorld: World | null;
  setChannelCreationWorld: (world: World | null) => void;

  activeProfile: WorldUserProfile | null;
  setActiveProfile: (profile: WorldUserProfile | null) => void;
  activeProfilesByWorld: Record<number, WorldUserProfile>;
  setActiveProfileForWorld: (worldId: number, profile: WorldUserProfile | null) => void;

  deletingCharacter: { worldId: number; profile: WorldUserProfile } | null;
  setDeletingCharacter: (target: { worldId: number; profile: WorldUserProfile } | null) => void;

  unreadDMThreadIds: Set<number>;
  unreadRoomIds: Set<number>;
  setUnreadDM: (threadId: number, unread: boolean) => void;
  setUnreadRoom: (roomId: number, unread: boolean) => void;
  initializeUnread: (dmIds: number[], roomIds: number[]) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function readUserFromCookie(): SessionUser | null {
  return getCookie(USER_COOKIE_NAME);
}

function persistUser(user: SessionUser | null): void {
  if (user === null) {
    deleteCookie(USER_COOKIE_NAME);
    return;
  }

  setCookie(USER_COOKIE_NAME, user, 7);
}

export function getStoredUser(): SessionUser | null {
  return readUserFromCookie();
}

export function clearUserStoreAuth(): void {
  persistUser(null);
}

export function setStoredUser(user: SessionUser | null): void {
  persistUser(user);
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<SessionUser | null>(() => readUserFromCookie());

  const [currentModal, setCurrentModal] = useState<string | undefined>(undefined);
  const [currentToast, setCurrentToast] = useState<{ message: string; type: ToastType } | null>(
    null
  );
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [worldsVersion, setWorldsVersion] = useState(0);
  const [removedWorldMembership, setRemovedWorldMembership] = useState<{
    worldId: number;
    version: number;
  } | null>(null);
  const [channelsVersion, setChannelsVersion] = useState(0);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [deletingWorld, setDeletingWorld] = useState<World | null>(null);
  const [channelCreationWorld, setChannelCreationWorld] = useState<World | null>(null);
  const [activeProfile, setActiveProfile] = useState<WorldUserProfile | null>(null);
  const [activeProfilesByWorld, setActiveProfilesByWorld] = useState<
    Record<number, WorldUserProfile>
  >(readProfilesByWorldFromStorage);
  const [deletingCharacter, setDeletingCharacter] = useState<{
    worldId: number;
    profile: WorldUserProfile;
  } | null>(null);
  const [permissionsByWorld, setPermissionsByWorld] = useState<Record<number, string[]>>({});
  const [unreadDMThreadIds, setUnreadDMThreadIds] = useState<Set<number>>(new Set());
  const [unreadRoomIds, setUnreadRoomIds] = useState<Set<number>>(new Set());

  const setUser = (nextUser: SessionUser | null) => {
    setUserState(nextUser);
    persistUser(nextUser);
  };

  const logout = () => {
    setUser(null);
    setActiveProfile(null);
    setActiveProfilesByWorld({});
    persistProfilesByWorld({});
    setDeletingCharacter(null);
    setPermissionsByWorld({});
    setUnreadDMThreadIds(new Set());
    setUnreadRoomIds(new Set());
  };

  const setUnreadDM = useCallback((threadId: number, unread: boolean) => {
    setUnreadDMThreadIds((prev) => {
      const next = new Set(prev);
      if (unread) next.add(threadId);
      else next.delete(threadId);
      return next;
    });
  }, []);

  const setUnreadRoom = useCallback((roomId: number, unread: boolean) => {
    setUnreadRoomIds((prev) => {
      const next = new Set(prev);
      if (unread) next.add(roomId);
      else next.delete(roomId);
      return next;
    });
  }, []);

  const initializeUnread = useCallback((dmIds: number[], roomIds: number[]) => {
    setUnreadDMThreadIds(new Set(dmIds));
    setUnreadRoomIds(new Set(roomIds));
  }, []);

  const setWorldPermissions = useCallback((worldId: number, permissions: string[]) => {
    setPermissionsByWorld((prev) => ({ ...prev, [worldId]: permissions }));
  }, []);

  const setActiveProfileForWorld = useCallback(
    (worldId: number, profile: WorldUserProfile | null) => {
      setActiveProfile(profile);
      setActiveProfilesByWorld((prev) => {
        let next: Record<number, WorldUserProfile>;
        if (!profile) {
          next = { ...prev };
          delete next[worldId];
        } else {
          next = { ...prev, [worldId]: profile };
        }
        persistProfilesByWorld(next);
        return next;
      });
    },
    []
  );

  const modal = {
    open: (name: string) => setCurrentModal(name),
    close: () => setCurrentModal(undefined),
  };

  const toast = {
    open: (message: string, type: ToastType, duration = 4000) => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setCurrentToast({ message, type });
      toastTimerRef.current = setTimeout(() => setCurrentToast(null), duration);
    },
    close: () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setCurrentToast(null);
    },
  };

  useEffect(() => {
    registerToastHandler((message, type, duration) => {
      toast.open(message, type, duration);
    });
    registerLogoutHandler(logout);
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken: user?.accessToken ?? null,
        refreshToken: user?.refreshToken ?? null,
        isLoggedIn: user !== null,
        setUser,
        logout,
        currentModal,
        modal,
        currentToast,
        toast,
        worldsVersion,
        bumpWorldsVersion: () => setWorldsVersion((v) => v + 1),
        removedWorldMembership,
        markWorldMembershipRemoved: (worldId) =>
          setRemovedWorldMembership((prev) => ({
            worldId,
            version: (prev?.version ?? 0) + 1,
          })),
        channelsVersion,
        bumpChannelsVersion: () => setChannelsVersion((v) => v + 1),
        editingWorld,
        setEditingWorld,
        deletingWorld,
        setDeletingWorld,
        channelCreationWorld,
        setChannelCreationWorld,
        activeProfile,
        setActiveProfile,
        activeProfilesByWorld,
        setActiveProfileForWorld,
        deletingCharacter,
        setDeletingCharacter,
        permissionsByWorld,
        setWorldPermissions,
        unreadDMThreadIds,
        unreadRoomIds,
        setUnreadDM,
        setUnreadRoom,
        initializeUnread,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserStore must be used inside a UserProvider");
  }
  return context;
};
