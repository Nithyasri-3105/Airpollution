'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { AlertTriangle, X } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, loading, alerts } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-cyan-400 uppercase animate-pulse">
          Initializing AIRSense AI Engine...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const unreadCriticalAlert = alerts.find(a => !a.read && (a.type === 'danger' || a.type === 'warning'));

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-16">
          {/* Critical Alert Banner */}
          {unreadCriticalAlert && !dismissBanner && (
            <div className="bg-gradient-to-r from-rose-950/70 via-red-900/60 to-rose-950/70 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
              <div className="flex items-center gap-2 max-w-4xl">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                <span className="font-semibold">{unreadCriticalAlert.title}:</span>
                <span className="truncate">{unreadCriticalAlert.message}</span>
              </div>
              <button
                onClick={() => setDismissBanner(true)}
                className="text-rose-400 hover:text-white p-1 rounded transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
