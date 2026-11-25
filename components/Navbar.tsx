'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wind, 
  MapPin, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, selectedCity, setSelectedCity, logout } = useAuth();
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/aqi/cities')
      .then(res => res.json())
      .then(data => {
        if (data.cities) {
          setCities(data.cities.map((c: any) => ({ id: c.id, name: c.name })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Wind className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                AIRSense
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium hidden sm:block">Smart Environmental Advisory</span>
          </div>
        </Link>
      </div>

      {/* Right side: City selector + Notifications + User profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* City Selector */}
        <div className="relative flex items-center bg-slate-900 border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-inner">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mr-1.5" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-medium text-gray-200 focus:outline-none cursor-pointer pr-4 appearance-none"
          >
            {cities.map((city) => (
              <option key={city.id} value={city.name} className="bg-slate-900 text-gray-200">
                {city.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none -ml-3" />
        </div>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Pill / Profile */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-slate-950">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-gray-200 group-hover:text-cyan-300 transition truncate max-w-[120px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-gray-400">{user.healthSensitivity || 'General'}</p>
              </div>
            </Link>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-xs font-medium text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
