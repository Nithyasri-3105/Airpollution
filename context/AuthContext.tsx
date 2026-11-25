'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, SystemAlert } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  alerts: SystemAlert[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  markAlertRead: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start as false when sessionStorage flag exists so navigating between pages
  // never shows the full-screen spinner unnecessarily.
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return !sessionStorage.getItem('airsense_authed');
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          sessionStorage.setItem('airsense_authed', '1');
          if (data.user.city) {
            setSelectedCity(data.user.city);
          }
          if (data.alerts) {
            setAlerts(data.alerts);
          }
        } else {
          setUser(null);
          sessionStorage.removeItem('airsense_authed');
        }
      } else {
        setUser(null);
        sessionStorage.removeItem('airsense_authed');
      }
    } catch (err) {
      console.error('Failed to check auth:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      if (data.user.city) {
        setSelectedCity(data.user.city);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Connection error during login' };
    }
  };

  const register = async (formData: any) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: 'Connection error during registration' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      sessionStorage.removeItem('airsense_authed');
      router.push('/login');
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, error: resData.error || 'Profile update failed' };
      }
      setUser(resData.user);
      if (resData.user.city) {
        setSelectedCity(resData.user.city);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Connection error updating profile' };
    }
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        alerts,
        selectedCity,
        setSelectedCity,
        login,
        register,
        logout,
        updateProfile,
        markAlertRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
