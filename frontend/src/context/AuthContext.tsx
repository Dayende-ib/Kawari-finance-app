import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../lib/apiInterceptor';

type User = { id: number; email: string; name?: string; role?: 'admin' | 'seller' };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isSeller: boolean;
};

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const login = async (email: string, password: string) => {
    const resp = await api.post('/auth/login', { email, password });
    setUser(resp.user);
    setToken(resp.token);
    setAuthToken(resp.token);
    localStorage.setItem('token', resp.token);
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const resp = await api.post('/auth/register', payload);
    setUser(resp.user);
    setToken(resp.token);
    setAuthToken(resp.token);
    localStorage.setItem('token', resp.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(undefined);
    localStorage.removeItem('token');
  };

  const isAdmin = user?.role === 'admin';
  const isSeller = user?.role === 'seller';

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAdmin, isSeller }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
