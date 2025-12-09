import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../lib/apiInterceptor';

type User = { id: number; email: string; name?: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setToken(data.token);
    setAuthToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    setToken(data.token);
    setAuthToken(data.token);
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(undefined);
    localStorage.removeItem('token');
  };

  return <AuthContext.Provider value={{ user, token, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
