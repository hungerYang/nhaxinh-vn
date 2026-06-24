'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  locale: string;
  avatar: string;
  favorites: string[];
  likes: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; locale?: string; avatar?: string }) => Promise<void>;
  toggleFavorite: (articleId: string) => Promise<void>;
  toggleLike: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  isLiked: (articleId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('user_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchProfile(t: string) {
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('user_token');
        setToken(null);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function register(email: string, password: string, name: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('user_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem('user_token');
    setToken(null);
    setUser(null);
  }

  async function updateProfile(data: { name?: string; locale?: string; avatar?: string }) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resp = await res.json();
        setUser(resp.user);
      }
    } catch { /* ignore */ }
  }

  async function toggleFavorite(articleId: string) {
    if (!token || !user) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/favorites/${articleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, favorites: data.favorites } : null);
      }
    } catch { /* ignore */ }
  }

  async function toggleLike(articleId: string) {
    if (!token || !user) return;
    try {
      const res = await fetch(`${API_BASE}/api/users/likes/${articleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch { /* ignore */ }
  }

  function isFavorite(articleId: string) {
    return user?.favorites.includes(articleId) || false;
  }

  function isLiked(articleId: string) {
    return user?.likes.includes(articleId) || false;
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, toggleFavorite, toggleLike, isFavorite, isLiked }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
