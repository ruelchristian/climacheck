import React, { createContext, useContext, useState } from 'react';
import { setToken, setStoredUser, getStoredUser } from './api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  function login(token, userData) {
    setToken(token);
    setStoredUser(userData);
    setUser(userData);
  }

  function logout() {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
