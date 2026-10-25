'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface AuthUIContextType {
  isLoginModalOpen: boolean;
  returnUrl: string;
  openLogin: (returnUrl?: string) => void;
  closeLogin: () => void;
}

const AuthUIContext = createContext<AuthUIContextType>({
  isLoginModalOpen: false,
  returnUrl: '/',
  openLogin: () => {},
  closeLogin: () => {},
});

export function AuthUIProvider({ children }: { children: React.ReactNode }) {
  // CRITICAL REQUIREMENT: Modal is strictly closed by default on initial page load, refresh, or navigation
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [returnUrl, setReturnUrl] = useState('/');

  const openLogin = useCallback((targetUrl?: string) => {
    if (targetUrl) {
      setReturnUrl(targetUrl);
    }
    setIsLoginModalOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoginModalOpen,
      returnUrl,
      openLogin,
      closeLogin,
    }),
    [isLoginModalOpen, returnUrl, openLogin, closeLogin]
  );

  return <AuthUIContext.Provider value={value}>{children}</AuthUIContext.Provider>;
}

export function useLoginModal() {
  const context = useContext(AuthUIContext);
  if (!context) {
    throw new Error('useLoginModal must be used within an AuthUIProvider');
  }
  return context;
}
