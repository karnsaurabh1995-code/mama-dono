'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS } from './constants';

export { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS };

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, role?: UserRole) => void;
  setUserSession: (user: User) => void;
  refreshSession: () => Promise<User | null>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoaded: false,
  login: () => {},
  setUserSession: () => {},
  refreshSession: async () => null,
  logout: () => {},
  switchRole: () => {},
  updateProfile: () => {},
});

/**
 * DEPRECATED & NEUTRALIZED:
 * Session cookies are managed exclusively on the server via signed, HttpOnly 'dokind_session' headers.
 * Client-side document.cookie writes are permanently disabled to prevent session forging.
 */
export function syncCookie(_user: User | null) {
  // Intentional NO-OP to enforce server-side authority
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoaded, setIsLoaded] = useState<boolean>(Boolean(initialUser));

  const refreshSession = async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data && data.authenticated && data.user) {
          setUser(data.user);
          setIsLoaded(true);
          try {
            localStorage.setItem('dokind_user', JSON.stringify(data.user));
          } catch {}
          return data.user;
        }
      }
      setUser(null);
      setIsLoaded(true);
      try {
        localStorage.removeItem('dokind_user');
      } catch {}
      return null;
    } catch {
      setUser(null);
      setIsLoaded(true);
      return null;
    }
  };

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setIsLoaded(true);
      return;
    }

    refreshSession();
  }, [initialUser]);

  const login = async (email: string, _targetRole: UserRole = 'donor') => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    // Direct caller to server-verified authentication
    console.warn('[Security] Client-side login() invoked. Directing to server session synchronization.');
    await refreshSession();
  };

  const setUserSession = (sessionUser: User) => {
    setUser(sessionUser);
    setIsLoaded(true);
    try {
      localStorage.setItem('dokind_user', JSON.stringify(sessionUser));
    } catch {}
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    try {
      localStorage.removeItem('dokind_user');
    } catch {}
  };

  const switchRole = (_newRole: UserRole) => {
    console.warn('[Security] Client-side role switching is permanently disabled. Server authentication required.');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    try {
      localStorage.setItem('dokind_user', JSON.stringify(updated));
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoaded,
        login,
        setUserSession,
        refreshSession,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
