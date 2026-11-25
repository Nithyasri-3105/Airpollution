'use client';

import React from 'react';

interface PollutantCardProps {
  name: string;
  fullName: string;
  value: number;
  unit: string;
  safeLimit: number;
  description: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
  name,
  fullName,
  value,
  unit,
  safeLimit,
  description
}) => {
  const ratio = value / safeLimit;
  let statusText = 'Normal';
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  let barColor = 'bg-emerald-500';

  if (ratio > 2.5) {
    statusText = 'Hazardous';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    barColor = 'bg-rose-500';
  } else if (ratio > 1.5) {
    statusText = 'Elevated';
    statusColor = 'text-red-400 bg-red-500/10 border-red-500/30';
    barColor = 'bg-red-500';
  } else if (ratio > 1.0) {
    statusText = 'Moderate';
    statusColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    barColor = 'bg-yellow-500';
  }

  const percent = Math.min(Math.round((value / (safeLimit * 2.5)) * 100), 100);

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-base font-bold text-white uppercase tracking-wider">{name}</span>
          <p className="text-xs text-gray-400 truncate">{fullName}</p>
        </div>
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <div className="my-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>

      {/* Threshold comparison bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 mb-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>Standard: &le; {safeLimit} {unit}</span>
        <span className="text-gray-300 font-mono">{(ratio * 100).toFixed(0)}% ref</span>
      </div>

      <p className="mt-2 text-[11px] text-gray-400 line-clamp-1 border-t border-white/5 pt-2">
        {description}
      </p>
    </div>
  );
};
