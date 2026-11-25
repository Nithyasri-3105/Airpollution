'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { AQIBadge } from '@/components/AQIBadge';
import { CITIES_DATA, getAQIColor } from '@/lib/aqi-data';
import { CityData } from '@/lib/types';
import {
  GitCompare,
  Plus,
  X,
  BarChart3,
  TrendingUp,
  Table as TableIcon,
  Check
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from 'recharts';

export default function ComparePage() {
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([
    'delhi',
    'mumbai',
    'bengaluru',
    'new-york'
  ]);

  const selectedCities: CityData[] = selectedCityIds
    .map(id => CITIES_DATA.find(c => c.id === id))
    .filter(Boolean) as CityData[];

  const availableCities = CITIES_DATA.filter(c => !selectedCityIds.includes(c.id));

  const toggleCity = (cityId: string) => {
    if (selectedCityIds.includes(cityId)) {
      if (selectedCityIds.length > 2) {
        setSelectedCityIds(selectedCityIds.filter(id => id !== cityId));
      }
    } else {
      setSelectedCityIds([...selectedCityIds, cityId]);
    }
  };

  // Bar chart dataset for AQI and Particulates
  const barChartData = selectedCities.map(c => ({
    name: c.name,
    AQI: c.currentAQI,
    'PM2.5': c.pollutants.pm25,
    'PM10': c.pollutants.pm10,
    'NO2': c.pollutants.no2,
    'O3': c.pollutants.o3,
  }));

  // Historical comparative trend (7 simulated days)
  const trendDays = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
  const comparativeTrendData = trendDays.map((day, idx) => {
    const point: any = { day };
    selectedCities.forEach((c, cIdx) => {
      // realistic relative progression
      const factor = Math.sin((idx + cIdx) * 0.9) * 18;
      point[c.name] = Math.max(15, Math.round(c.currentAQI + factor * (c.currentAQI > 100 ? 1.2 : 0.4)));
    });
    return point;
  });

  const cityLineColors = ['#06B6D4', '#EF4444', '#10B981', '#EAB308', '#A855F7', '#EC4899'];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <GitCompare className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Multi-City Comparative Analytics
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Objective side-by-side evaluation of ambient AQI, particulate concentrations, and trends
            </p>
          </div>

          <span className="text-xs text-gray-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
            Comparing <strong className="text-white">{selectedCities.length}</strong> Locations
          </span>
        </div>

        {/* City Selector Chips */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs font-semibold text-gray-300 block mb-2">
            Select Cities to Include in Comparison Matrix (Min 2):
          </span>
          <div className="flex flex-wrap gap-2">
            {CITIES_DATA.map(c => {
              const isSelected = selectedCityIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCity(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-80">({c.currentAQI})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedCities.map((city, idx) => (
            <div
              key={city.id}
              className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-cyan-500/30 transition relative group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{city.name}</h3>
                    <p className="text-xs text-gray-400">{city.stateCountry}</p>
                  </div>
                  <AQIBadge category={city.category} size="sm" />
                </div>

                <div className="my-4 flex items-baseline gap-2">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: getAQIColor(city.currentAQI) }}
                  >
                    {city.currentAQI}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">AQI</span>
                </div>

                {/* Pollutants Breakdown */}
                <div className="space-y-1.5 text-xs pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">PM2.5:</span>
                    <span className="font-semibold">{city.pollutants.pm25} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">PM10:</span>
                    <span className="font-semibold">{city.pollutants.pm10} µg/m³</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">NO2:</span>
                    <span className="font-semibold">{city.pollutants.no2} ppb</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span className="text-gray-400">O3:</span>
                    <span className="font-semibold">{city.pollutants.o3} ppb</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                <span>Dominant: <strong className="text-cyan-400 uppercase">{city.dominantPollutant}</strong></span>
                <span>{city.weather.temperature}&deg;C | {city.weather.humidity}% hum</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section: Side-by-Side Bar Chart & Multi-Line Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart Comparison */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white">Atmospheric Metrics Comparison</h3>
                <p className="text-xs text-gray-400">Side-by-side criteria pollutant levels</p>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="AQI" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="PM2.5" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="PM10" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="NO2" fill="#EAB308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 7-Day Trend Comparison */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-base font-bold text-white">7-Day Historical Trajectory Comparison</h3>
                <p className="text-xs text-gray-400">Comparing AQI variability across selected cities</p>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparativeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  {selectedCities.map((c, i) => (
                    <Line
                      key={c.id}
                      type="monotone"
                      dataKey={c.name}
                      stroke={cityLineColors[i % cityLineColors.length]}
                      strokeWidth={2.5}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Comparative Matrix Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <TableIcon className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Comprehensive Telemetry Matrix</h3>
              <p className="text-xs text-gray-400">Tabular side-by-side scientific comparisons</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">City / Region</th>
                  <th className="py-2.5 px-3">Measured AQI</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">PM2.5</th>
                  <th className="py-2.5 px-3">PM10</th>
                  <th className="py-2.5 px-3">NO2</th>
                  <th className="py-2.5 px-3">O3</th>
                  <th className="py-2.5 px-3">CO</th>
                  <th className="py-2.5 px-3">SO2</th>
                  <th className="py-2.5 px-3">Weather</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedCities.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/60 transition">
                    <td className="py-3 px-3 font-bold text-white">
                      {c.name}
                      <span className="block text-[10px] text-gray-400 font-normal">{c.stateCountry}</span>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-base" style={{ color: getAQIColor(c.currentAQI) }}>
                      {c.currentAQI}
                    </td>
                    <td className="py-3 px-3">
                      <AQIBadge category={c.category} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.pm25} µg/m³</td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.pm10} µg/m³</td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.no2} ppb</td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.o3} ppb</td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.co} ppm</td>
                    <td className="py-3 px-3 font-mono text-gray-200">{c.pollutants.so2} ppb</td>
                    <td className="py-3 px-3 text-gray-300">
                      {c.weather.temperature}&deg;C, {c.weather.windSpeed} km/h {c.weather.windDirection}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
