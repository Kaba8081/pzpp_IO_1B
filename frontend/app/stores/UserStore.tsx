import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { SessionUser, World, WorldUserProfile } from "@/types/models";
import { setCookie, getCookie, deleteCookie } from "@/utils/cookieUtils";

const USER_COOKIE_NAME = "user";

interface UserContextType {
  user: SessionUser | null;
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: SessionUser | null) => void;
  logout: () => void;

  currentModal: string | undefined;
  modal: {
    open: (name: string) => void;
    close: () => void;
  };

  worldsVersion: number;
  bumpWorldsVersion: () => void;

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
  const [worldsVersion, setWorldsVersion] = useState(0);
  const [channelsVersion, setChannelsVersion] = useState(0);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [deletingWorld, setDeletingWorld] = useState<World | null>(null);
  const [channelCreationWorld, setChannelCreationWorld] = useState<World | null>(null);
  const [activeProfile, setActiveProfile] = useState<WorldUserProfile | null>(null);

  const setUser = (nextUser: SessionUser | null) => {
    setUserState(nextUser);
    persistUser(nextUser);
  };

  const logout = () => {
    setUser(null);
  };

  const modal = {
    open: (name: string) => setCurrentModal(name),
    close: () => setCurrentModal(undefined),
  };

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
        worldsVersion,
        bumpWorldsVersion: () => setWorldsVersion((v) => v + 1),
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
