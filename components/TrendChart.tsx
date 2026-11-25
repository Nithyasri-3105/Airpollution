'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface DataPoint {
  time?: string;
  date?: string;
  name?: string;
  [key: string]: any;
}

interface TrendChartProps {
  data: DataPoint[];
  dataKey?: string;
  name?: string;
  color?: string;
  height?: number;
  showThreshold?: boolean;
  thresholdValue?: number;
  unit?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  dataKey = 'aqi',
  name = 'AQI',
  color = '#06B6D4',
  height = 260,
  showThreshold = false,
  thresholdValue = 100,
  unit = ''
}) => {
  if (!data || data.length === 0) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center bg-slate-900/50 rounded-xl border border-white/5 text-gray-400 text-sm"
      >
        No telemetry records available for the selected period
      </div>
    );
  }

  const gradientId = `colorGradient-${dataKey}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
          <p className="font-semibold text-gray-200 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-gray-400">{name}:</span>
            <span className="font-bold text-white font-mono">{val} {unit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis 
            dataKey={data[0]?.time ? 'time' : data[0]?.date ? 'date' : 'name'} 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748B" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {showThreshold && (
            <ReferenceLine 
              y={thresholdValue} 
              stroke="#EF4444" 
              strokeDasharray="4 4" 
              label={{ value: `Limit (${thresholdValue})`, fill: '#EF4444', fontSize: 10, position: 'top' }} 
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
