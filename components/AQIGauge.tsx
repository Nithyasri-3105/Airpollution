'use client';

import React from 'react';
import { getAQICategory, getAQIColor } from '@/lib/aqi-data';
import { AQIBadge } from './AQIBadge';

interface AQIGaugeProps {
  aqi: number;
  dominantPollutant?: string;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ aqi, dominantPollutant = 'PM2.5' }) => {
  const category = getAQICategory(aqi);
  const color = getAQIColor(aqi);

  // SVG Gauge calculations
  // Max AQI is capped visually at 500
  const normalizedAQI = Math.min(Math.max(aqi, 0), 500);
  // Angle: -90 deg to +90 deg (180 degree semi-circle)
  const angle = (normalizedAQI / 500) * 180 - 90;

  // Arc path constants
  const radius = 85;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half-circle perimeter
  const strokeDashoffset = circumference - (normalizedAQI / 500) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-56 h-32 flex items-center justify-center">
        <svg className="w-56 h-36 overflow-visible" viewBox="0 0 200 120">
          <defs>
            <linearGradient id="aqiGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="25%" stopColor="#EAB308" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="75%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background track */}
          <path
            d="M 15 110 A 85 85 0 0 1 185 110"
            fill="none"
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Filled active track */}
          <path
            d="M 15 110 A 85 85 0 0 1 185 110"
            fill="none"
            stroke="url(#aqiGaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            filter="url(#glow)"
          />

          {/* Ticks & Labels */}
          <text x="12" y="125" fill="#64748B" fontSize="10" textAnchor="start">0</text>
          <text x="55" y="45" fill="#64748B" fontSize="10" textAnchor="middle">100</text>
          <text x="100" y="22" fill="#64748B" fontSize="10" textAnchor="middle">200</text>
          <text x="145" y="45" fill="#64748B" fontSize="10" textAnchor="middle">300</text>
          <text x="188" y="125" fill="#64748B" fontSize="10" textAnchor="end">500</text>
        </svg>

        {/* Center AQI value */}
        <div className="absolute top-12 flex flex-col items-center">
          <span 
            className="text-5xl font-extrabold tracking-tight"
            style={{ color: color, textShadow: `0 0 20px ${color}40` }}
          >
            {aqi}
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 mt-0.5">Air Quality Index</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <AQIBadge category={category} size="lg" />
        <span className="text-xs text-gray-400">
          Dominant Pollutant: <strong className="text-cyan-400 uppercase">{dominantPollutant}</strong>
        </span>
      </div>
    </div>
  );
};
