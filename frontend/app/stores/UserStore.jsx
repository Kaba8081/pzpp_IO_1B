import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentModal, setCurrentModal] = useState(undefined);

  const modal = {
    open: (name) => setCurrentModal(name),
    close: () => setCurrentModal(undefined)
  };

  return (
    <UserContext.Provider value={{ user, setUser, currentModal, modal }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserStore = () => useContext(UserContext);