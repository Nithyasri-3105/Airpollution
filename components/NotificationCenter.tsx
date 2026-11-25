'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const NotificationCenter: React.FC = () => {
  const { alerts, markAlertRead } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm">Environmental Alerts</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
            {alerts.length === 0 ? (
              <p className="text-center py-6 text-xs text-gray-400">No active alerts at this time.</p>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    alert.read 
                      ? 'bg-slate-800/40 border-white/5 opacity-70' 
                      : 'bg-slate-800/90 border-cyan-500/30 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getIcon(alert.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200">{alert.title}</span>
                        <span className="text-[10px] text-gray-400">{alert.timestamp}</span>
                      </div>
                      <p className="mt-1 text-gray-300 leading-relaxed">{alert.message}</p>
                      {!alert.read && (
                        <button
                          onClick={() => markAlertRead(alert.id)}
                          className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" /> Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
