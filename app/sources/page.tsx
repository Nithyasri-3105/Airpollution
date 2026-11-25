'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { AQIBadge } from '@/components/AQIBadge';
import { useAuth } from '@/context/AuthContext';
import { PollutionSource } from '@/lib/types';
import {
  Flame,
  PieChart as PieIcon,
  ShieldAlert,
  Info,
  Car,
  Factory,
  Building2,
  TreePine,
  CloudFog,
  RefreshCw
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function PollutionSourcePage() {
  const { selectedCity } = useAuth();

  const [sources, setSources] = useState<PollutionSource[]>([]);
  const [cityInfo, setCityInfo] = useState<{ name: string; currentAQI: number; category: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `airsense_src_${selectedCity}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.sources) setSources(parsed.sources);
        if (parsed.cityInfo) setCityInfo(parsed.cityInfo);
        setLoading(false);
      }
    } catch (e) {}

    fetchSources(selectedCity);
  }, [selectedCity]);

  const fetchSources = async (city: string) => {
    const cacheKey = `airsense_src_${city}`;
    if (!sessionStorage.getItem(cacheKey)) {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/sources?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data.success) {
        setSources(data.sources);
        setCityInfo(data.city);
        sessionStorage.setItem(cacheKey, JSON.stringify({ sources: data.sources, cityInfo: data.city }));
      }
    } catch (error) {
      console.error('Error fetching pollution sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('vehicular') || lower.includes('traffic')) return Car;
    if (lower.includes('industrial') || lower.includes('refinery')) return Factory;
    if (lower.includes('construction') || lower.includes('dust')) return Building2;
    if (lower.includes('biomass') || lower.includes('burning')) return TreePine;
    return CloudFog;
  };

  const pieData = sources.map(s => ({
    name: s.source,
    value: s.percentage,
    color: s.color
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pollution Source Identification
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Statistical multi-pollutant fingerprinting & source attribution for <strong className="text-gray-200">{selectedCity}</strong>
            </p>
          </div>

          {cityInfo && (
            <div className="flex items-center gap-2.5 bg-slate-900 p-2.5 rounded-2xl border border-white/5 text-xs">
              <span className="text-gray-400">Station AQI:</span>
              <span className="font-extrabold text-white">{cityInfo.currentAQI}</span>
              <AQIBadge category={cityInfo.category} size="sm" />
            </div>
          )}
        </div>

        {/* Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">Methodology Note:</strong> AirSense AI analyzes multi-sensor ratios (PM2.5 to PM10 proportion, NO2/SO2 chemical signatures, and planetary boundary layer height). These results represent <em>likely source patterns</em> and <em>modeled statistical contributors</em>, and do not attribute emissions to any single physical industrial facility.
          </p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
            <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Evaluating Particulate Chemical Fingerprints...
            </p>
          </div>
        ) : (
          <>
            {/* Visual Breakdown: Donut Chart & Contribution Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Donut Chart */}
              <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PieIcon className="w-4 h-4 text-rose-400" />
                    <h3 className="text-base font-bold text-white">Estimated Contribution Ratio</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Proportionate mass contribution to current ambient particulate loading
                  </p>
                </div>

                <div className="w-full h-72 my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val}%`, 'Est. Share']}
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  {sources.map(s => (
                    <div key={s.source} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="text-gray-300 truncate max-w-[190px]">{s.source}</span>
                      </div>
                      <span className="font-bold text-white font-mono">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Details Cards */}
              <div className="lg:col-span-7 space-y-3.5">
                {sources.map(source => {
                  const Icon = getSourceIcon(source.source);
                  return (
                    <div
                      key={source.source}
                      className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2.5 rounded-xl border"
                              style={{ backgroundColor: `${source.color}15`, borderColor: `${source.color}35` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: source.color }} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{source.source}</h4>
                              <span className="text-[11px] text-gray-400 font-mono">
                                Markers: {source.relatedPollutants.join(', ')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black text-white font-mono">
                              {source.percentage}%
                            </span>
                            <span className={`block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-0.5 ${
                              source.confidence === 'High'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : source.confidence === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            }`}>
                              {source.confidence} Confidence
                            </span>
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-300 leading-relaxed">
                          {source.description}
                        </p>
                      </div>

                      {/* Percentage Bar */}
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${source.percentage}%`, backgroundColor: source.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
