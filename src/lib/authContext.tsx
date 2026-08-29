import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { watchAuth, AppUser } from './authService';

interface AuthContextValue {
  user: AppUser | null;
  ready: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = watchAuth((u) => {
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  return <AuthContext.Provider value={{ user, ready }}>{children}</AuthContext.Provider>;
}

export function useCurrentUser(): AuthContextValue {
  return useContext(AuthContext);
}
