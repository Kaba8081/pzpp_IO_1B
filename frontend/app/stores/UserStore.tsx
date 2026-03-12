import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
    try {
      const storedUser = localStorage.getItem('user-store');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [currentModal, setCurrentModal] = useState<string | undefined>(undefined);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user-store', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user-store');
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