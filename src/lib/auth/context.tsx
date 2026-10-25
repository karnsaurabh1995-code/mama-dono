'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../db';
import { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS } from './constants';

export { INITIAL_SUPER_ADMIN_ACCOUNTS, DEMO_USERS };

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, role?: UserRole) => void;
  setUserSession: (user: User) => void;
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
  logout: () => {},
  switchRole: () => {},
  updateProfile: () => {},
});

export function syncCookie(user: User | null) {
  if (typeof document === 'undefined') return;
  if (user) {
    const sessionPayload = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        role: user.role,
        secondaryRole: user.secondaryRole,
        roles: user.roles || (user.secondaryRole ? [user.role, user.secondaryRole] : [user.role]),
        name: user.name,
        email: user.email,
        sessionCreatedAt: new Date().toISOString(),
      })
    );
    document.cookie = `dokind_session=${sessionPayload}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = 'dokind_session=; path=/; max-age=0; SameSite=Lax';
  }
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem('dokind_user') || localStorage.getItem('sevasetu_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // If initialUser was not supplied by server (e.g. cookie missing on first visit), adopt localStorage
        if (!initialUser) {
          setUser(parsed);
        }
        syncCookie(parsed);
      } else if (initialUser) {
        // Populate localStorage if session arrived from server cookie
        localStorage.setItem('dokind_user', JSON.stringify(initialUser));
      }
    } catch {
      // ignore storage parse errors
    }
  }, [initialUser]);

  const login = (email: string, targetRole: UserRole = 'donor') => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user exists in db (including bootstrapped super admins & employees)
    const dbUser = db.getUserByEmail(cleanEmail);
    if (dbUser) {
      setUser(dbUser);
      localStorage.setItem('dokind_user', JSON.stringify(dbUser));
      syncCookie(dbUser);
      return;
    }

    // 2. Check if email is an authorized super admin
    if (db.isDesignatedSuperAdmin(cleanEmail)) {
      const sa = INITIAL_SUPER_ADMIN_ACCOUNTS.find((a) => a.email.toLowerCase() === cleanEmail);
      const selectedUser: User = sa || {
        id: `usr-sa-${Date.now()}`,
        name: cleanEmail.startsWith('karn') ? 'Saurabh Karn' : cleanEmail.startsWith('sarthak') ? 'Sarthak Raj' : 'Super Administrator',
        email: cleanEmail,
        role: 'super_admin',
        department: 'Executive Governance',
        jobTitle: 'Super Administrator',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setUser(selectedUser);
      localStorage.setItem('dokind_user', JSON.stringify(selectedUser));
      syncCookie(selectedUser);
      return;
    }

    // 3. Check demo users list
    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    const selectedUser = matched || {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: targetRole,
      createdAt: new Date().toISOString(),
    };
    setUser(selectedUser);
    localStorage.setItem('dokind_user', JSON.stringify(selectedUser));
    syncCookie(selectedUser);
  };

  const setUserSession = (sessionUser: User) => {
    setUser(sessionUser);
    localStorage.setItem('dokind_user', JSON.stringify(sessionUser));
    syncCookie(sessionUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dokind_user');
    localStorage.removeItem('sevasetu_user');
    syncCookie(null);
  };

  const switchRole = (newRole: UserRole) => {
    const demoUser = DEMO_USERS[newRole];
    setUser(demoUser);
    localStorage.setItem('dokind_user', JSON.stringify(demoUser));
    syncCookie(demoUser);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('dokind_user', JSON.stringify(updated));
    syncCookie(updated);
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
