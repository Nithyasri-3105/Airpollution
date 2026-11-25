'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { AQIBadge } from '@/components/AQIBadge';
import { useAuth } from '@/context/AuthContext';
import { GreenZone } from '@/lib/types';
import { getAQIColor, CITIES_DATA } from '@/lib/aqi-data';
import {
  Trees,
  Clock,
  Navigation,
  Compass,
  Sparkles,
  Info,
  CheckCircle,
  RefreshCw,
  Activity,
  Calendar,
  MapPin,
  ChevronDown
} from 'lucide-react';

export default function GreenZonePage() {
  const { selectedCity, setSelectedCity } = useAuth();

  const [selectedActivity, setSelectedActivity] = useState<string>('All');
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('Morning (06:00 - 08:30 AM)');
  const [zones, setZones] = useState<GreenZone[]>([]);
  const [cityAQI, setCityAQI] = useState<number>(100);
  const [loading, setLoading] = useState(true);

  const ACTIVITIES = [
    'All',
    'Walking',
    'Jogging',
    'Cycling',
    'Outdoor exercise',
    'Relaxing outdoors'
  ];

  const TIME_WINDOWS = [
    'Morning (06:00 - 08:30 AM)',
    'Late Morning (09:00 - 11:30 AM)',
    'Afternoon (12:00 - 03:30 PM)',
    'Evening (05:00 - 07:30 PM)'
  ];

  useEffect(() => {
    fetchGreenZones(selectedCity, selectedActivity);
  }, [selectedCity, selectedActivity]);

  const fetchGreenZones = async (city: string, activity: string) => {
    setLoading(true);
    try {
      let url = `/api/green-zones?city=${encodeURIComponent(city)}`;
      if (activity && activity !== 'All') {
        url += `&activity=${encodeURIComponent(activity)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setZones(data.zones);
        setCityAQI(data.city.currentAQI);
      }
    } catch (error) {
      console.error('Error fetching green zones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <Trees className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Green Zone Recommender
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Discover comparatively cleaner micro-climates, parks, and low-traffic sanctuaries in <strong className="text-teal-300">{selectedCity}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct City Switcher */}
            <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl px-3 py-2 shadow-inner">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mr-2" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-200 focus:outline-none cursor-pointer pr-5 appearance-none"
                aria-label="Select city for green zones"
              >
                {CITIES_DATA.map((c) => (
                  <option key={c.id} value={c.name} className="bg-slate-900 text-gray-200">
                    {c.name} ({c.stateCountry})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 pointer-events-none -ml-4" />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-2xl border border-white/5 text-xs text-gray-300">
              <span className="text-gray-400">City Center Avg:</span>
              <span className="font-extrabold font-mono" style={{ color: getAQIColor(cityAQI) }}>
                AQI {cityAQI}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar: Activity + Time Window */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Activity Filter */}
          <div>
            <span className="text-xs font-semibold text-gray-300 block mb-2">
              Planned Physical Activity:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITIES.map(act => (
                <button
                  key={act}
                  onClick={() => setSelectedActivity(act)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                    selectedActivity === act
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Time Window */}
          <div className="shrink-0">
            <span className="text-xs font-semibold text-gray-300 block mb-2">
              Preferred Workout Horizon:
            </span>
            <select
              value={selectedTimeOfDay}
              onChange={(e) => setSelectedTimeOfDay(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {TIME_WINDOWS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Informational Guidance Notice */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-start gap-3 text-xs text-teal-200/90">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-teal-300">Clean Air Advisory:</strong> Green zones are <em>comparatively cleaner</em> due to dense foliage interception of particulates and absence of internal automotive transit. They are not guaranteed to be 100% pollution-free during regional smog episodes.
          </p>
        </div>

        {/* Zones List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
            <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Evaluating Micro-Climate Canopy Density...
            </p>
          </div>
        ) : zones.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl border border-white/5">
            <p className="text-sm text-gray-400">No matching green zones found for the selected activity in {selectedCity}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {zones.map((zone, idx) => {
              const cleanerPercent = Math.max(
                5,
                Math.round(((cityAQI - zone.currentAQI) / Math.max(cityAQI, 1)) * 100)
              );

              return (
                <div
                  key={zone.id}
                  className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-teal-500/30 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                            Recommended Zone #{idx + 1}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
                            {zone.city}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-gray-400 border border-white/5">
                            {zone.distanceKm} km away
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1 group-hover:text-teal-300 transition">
                          {zone.name}
                        </h3>
                      </div>
                      <AQIBadge category={zone.category} size="sm" />
                    </div>

                    {/* AQI Comparison Box */}
                    <div className="my-4 p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 grid grid-cols-3 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Current Zone AQI</span>
                        <span className="text-xl font-extrabold text-white font-mono">{zone.currentAQI}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-teal-400 block">Window Expected</span>
                        <span className="text-xl font-extrabold text-teal-300 font-mono">{zone.expectedAQI}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 block">Air Advantage</span>
                        <span className="text-sm font-extrabold text-emerald-300 mt-1 block">
                          +{cleanerPercent}% Cleaner
                        </span>
                      </div>
                    </div>

                    {/* Recommended Time Window */}
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200 mb-3">
                      <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                      <span><strong>Optimal Activity Window:</strong> {zone.bestTimeWindow}</span>
                    </div>

                    {/* Scientific Rationale */}
                    <p className="text-xs text-gray-300 leading-relaxed mb-3">
                      <strong className="text-gray-200">Environmental Rationale:</strong> {zone.reason}
                    </p>

                    {/* Suitable activities pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 mr-1">Ideal for:</span>
                      {zone.suitableActivities.map(act => (
                        <span
                          key={act}
                          className="px-2 py-0.5 rounded-lg bg-slate-900 text-gray-300 text-[10px] border border-white/5"
                        >
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="text-teal-400 font-medium">{zone.vegetationIndex}</span>
                    <span className="text-gray-400">Zero motorized lanes</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
