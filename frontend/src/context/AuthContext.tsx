import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (t: string | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      setToken(res.data.token);
      setUser(res.data.user);
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    authApi.logout().catch(() => {});
  }, [setToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
