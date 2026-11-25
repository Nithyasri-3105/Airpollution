'use client';

import React from 'react';
import { AQICategory } from '@/lib/types';

interface AQIBadgeProps {
  category: AQICategory | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const AQIBadge: React.FC<AQIBadgeProps> = ({
  category,
  size = 'md',
  showDot = true,
}) => {
  const getBadgeStyle = (cat: string) => {
    switch (cat) {
      case 'Good':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
        };
      case 'Moderate':
        return {
          bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
          dot: 'bg-yellow-400 shadow-[0_0_8px_#EAB308]'
        };
      case 'Unhealthy for Sensitive Groups':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
          dot: 'bg-orange-400 shadow-[0_0_8px_#F97316]'
        };
      case 'Unhealthy':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/30',
          dot: 'bg-red-400 shadow-[0_0_8px_#EF4444]'
        };
      case 'Very Unhealthy':
        return {
          bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400 shadow-[0_0_8px_#A855F7]'
        };
      case 'Hazardous':
      default:
        return {
          bg: 'bg-rose-900/30 text-rose-300 border-rose-600/40',
          dot: 'bg-rose-500 shadow-[0_0_8px_#F43F5E]'
        };
    }
  };

  const style = getBadgeStyle(category);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${sizeClasses}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {category}
    </span>
  );
};
