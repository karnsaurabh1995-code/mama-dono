'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

export const DEMO_USERS: Record<UserRole, User> = {
  donor: {
    id: 'user-donor-1',
    name: 'Vikramaditya Sharma',
    email: 'vikram.sharma@example.com',
    role: 'donor',
    phone: '+91 98765 43210',
    panNumber: 'ABCPS1234D',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-01-10T00:00:00Z',
  },
  fundraiser: {
    id: 'user-fundraiser-1',
    name: 'Ramesh Kumar (Aarav’s Father)',
    email: 'ramesh.kumar@example.com',
    role: 'fundraiser',
    phone: '+91 98112 34567',
    panNumber: 'BKLPR9876Q',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    createdAt: '2026-09-01T00:00:00Z',
  },
  organization_manager: {
    id: 'user-org-1',
    name: 'Dr. Sunita Rao',
    email: 'sunita.rao@ashajyoti.org',
    role: 'organization_manager',
    phone: '+91 99201 54321',
    organizationId: 'org-hope-india',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-06-15T00:00:00Z',
  },
  reviewer: {
    id: 'user-reviewer-1',
    name: 'Kavita Nair',
    email: 'kavita.nair@dokind.org.in',
    role: 'reviewer',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10T00:00:00Z',
  },
  finance: {
    id: 'user-finance-1',
    name: 'Anand Kulkarni',
    email: 'anand.k@dokind.org.in',
    role: 'finance',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10T00:00:00Z',
  },
  content_editor: {
    id: 'user-editor-1',
    name: 'Meera Sen',
    email: 'meera.sen@dokind.org.in',
    role: 'content_editor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-01-10T00:00:00Z',
  },
  head_staff: {
    id: 'user-head-staff-1',
    name: 'Priyanka Sharma (Field Lead)',
    email: 'priyanka.staff@dokind.org.in',
    role: 'head_staff',
    phone: '+91 98200 44556',
    avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2025-08-01T00:00:00Z',
  },
  ops_admin: {
    id: 'user-ops-1',
    name: 'Arjun Singhal',
    email: 'arjun.s@dokind.org.in',
    role: 'ops_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-11-01T00:00:00Z',
  },
  super_admin: {
    id: 'user-admin-1',
    name: 'Chief Administrator (dokind)',
    email: 'admin@dokind.org.in',
    role: 'super_admin',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    createdAt: '2024-01-01T00:00:00Z',
  },
};

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  login: (email: string, role?: UserRole) => void;
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
  logout: () => {},
  switchRole: () => {},
  updateProfile: () => {},
});

function syncCookie(user: User | null) {
  if (typeof document === 'undefined') return;
  if (user) {
    const sessionPayload = encodeURIComponent(
      JSON.stringify({ id: user.id, role: user.role, name: user.name })
    );
    document.cookie = `dokind_session=${sessionPayload}; path=/; max-age=2592000; SameSite=Lax`;
  } else {
    document.cookie = 'dokind_session=; path=/; max-age=0; SameSite=Lax';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem('dokind_user') || localStorage.getItem('sevasetu_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        syncCookie(parsed);
      } else {
        // Unauthenticated visitor
        setUser(null);
        syncCookie(null);
      }
    } catch {
      setUser(null);
      syncCookie(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (email: string, targetRole: UserRole = 'donor') => {
    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    const selectedUser = matched || {
      ...DEMO_USERS[targetRole],
      email,
      name: email.split('@')[0],
    };
    setUser(selectedUser);
    localStorage.setItem('dokind_user', JSON.stringify(selectedUser));
    syncCookie(selectedUser);
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
