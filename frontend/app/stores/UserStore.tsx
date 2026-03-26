import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookieUtils';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  
  currentModal: string | undefined;
  modal: {
    open: (name: string) => void;
    close: () => void;
  };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(() => {
    return getCookie('user-store');
  });

  const [currentModal, setCurrentModal] = useState<string | undefined>(undefined);

  const login = (userData: User) => {
    setUser(userData);
    setCookie('user-store', userData, 7);
  };

  const logout = () => {
    setUser(null);
    deleteCookie('user-store');
  };

  const modal = {
    open: (name: string) => setCurrentModal(name),
    close: () => setCurrentModal(undefined),
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isLoggedIn: !!user, 
        login, 
        logout, 
        currentModal, 
        modal 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserStore must be used inside a UserProvider');
  }
  return context;
};