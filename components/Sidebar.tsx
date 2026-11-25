'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  HeartPulse,
  Map,
  GitCompare,
  Flame,
  Trees,
  Bot,
  FileBarChart,
  UserCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Prediction', href: '/prediction', icon: TrendingUp },
  { label: 'Health Advisory', href: '/health-advisory', icon: HeartPulse },
  { label: 'AQI Heat Map', href: '/map', icon: Map },
  { label: 'Multi-City Compare', href: '/compare', icon: GitCompare },
  { label: 'Green Zone Recommender', href: '/green-zones', icon: Trees },
  { label: 'Data & Reports', href: '/reports', icon: FileBarChart },
  { label: 'User Profile', href: '/profile', icon: UserCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Features & Analytics
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-gray-400 group-hover:text-gray-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User mini status & Logout */}
        <div className="p-3 border-t border-white/10 bg-slate-950">
          {user && (
            <div className="mb-2 p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="flex items-center justify-between text-[11px] text-gray-400">
                <span>Active Location</span>
                <span className="font-semibold text-cyan-400">{user.city}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
