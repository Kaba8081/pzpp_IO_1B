import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { SessionUser } from "@/types/models";
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
