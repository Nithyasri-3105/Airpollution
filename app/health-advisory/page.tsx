'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { AQIBadge } from '@/components/AQIBadge';
import { useAuth } from '@/context/AuthContext';
import { HealthAdvisoryResult, HealthSensitivity } from '@/lib/types';
import {
  HeartPulse,
  ShieldAlert,
  AlertTriangle,
  Wind,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck,
  Info,
  Clock,
  Home,
  RefreshCw
} from 'lucide-react';

export default function HealthAdvisoryPage() {
  const { user, selectedCity } = useAuth();

  const [simulatedSensitivity, setSimulatedSensitivity] = useState<HealthSensitivity>(
    user?.healthSensitivity || 'None'
  );
  const [simulatedAge, setSimulatedAge] = useState<number | string>(user?.age || '');
  const [advisoryData, setAdvisoryData] = useState<{
    city: { id: string; name: string; currentAQI: number; category: string };
    userContext: { age?: number; healthSensitivity: HealthSensitivity };
    advisory: HealthAdvisoryResult;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const SENSITIVITIES: HealthSensitivity[] = [
    'None',
    'Asthma',
    'Respiratory sensitivity',
    'Heart condition',
    'Allergy sensitivity',
    'Other'
  ];

  useEffect(() => {
    const cacheKey = `airsense_adv_${selectedCity}_${simulatedSensitivity}_${simulatedAge}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.advisoryData) {
          setAdvisoryData(parsed.advisoryData);
          setLoading(false);
        }
      }
    } catch (e) {}

    fetchHealthAdvisory(selectedCity, simulatedSensitivity, simulatedAge);
  }, [selectedCity, simulatedSensitivity, simulatedAge]);

  const fetchHealthAdvisory = async (city: string, sensitivity: string, age: number | string) => {
    const cacheKey = `airsense_adv_${city}_${sensitivity}_${age}`;
    if (!sessionStorage.getItem(cacheKey)) {
      setLoading(true);
    }

    try {
      let url = `/api/health-advisory?city=${encodeURIComponent(city)}&sensitivity=${encodeURIComponent(sensitivity)}`;
      if (age) url += `&age=${encodeURIComponent(age)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAdvisoryData(data);
        sessionStorage.setItem(cacheKey, JSON.stringify({ advisoryData: data }));
      }
    } catch (error) {
      console.error('Error fetching advisory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Moderate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'High':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Very High':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Severe':
      default:
        return 'bg-purple-900/40 text-purple-300 border-purple-500/50';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Health & Environmental Advisory
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Personalized preventative protocols calculated for <strong className="text-gray-200">{selectedCity}</strong>
            </p>
          </div>

          {/* User simulation context selector */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-700/60 text-xs">
            <span className="text-gray-400 font-medium px-1">Simulation:</span>
            <select
              value={simulatedSensitivity}
              onChange={(e) => setSimulatedSensitivity(e.target.value as HealthSensitivity)}
              className="bg-slate-950 text-gray-200 font-semibold px-2.5 py-1.5 rounded-xl border border-white/5 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {SENSITIVITIES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Age"
              min="1"
              max="120"
              value={simulatedAge}
              onChange={(e) => setSimulatedAge(e.target.value)}
              className="w-16 bg-slate-950 text-gray-200 font-semibold px-2 py-1.5 rounded-xl border border-white/5 focus:outline-none focus:border-cyan-400 text-center"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Evaluating Physiological Risk Matrix...
            </p>
          </div>
        ) : advisoryData ? (
          <>
            {/* Top Risk Level Banner */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeColor(advisoryData.advisory.overallRisk)}`}>
                      OVERALL RISK: {advisoryData.advisory.overallRisk.toUpperCase()}
                    </span>
                    <AQIBadge category={advisoryData.city.category} size="sm" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                    {advisoryData.city.name} Ambient AQI: {advisoryData.city.currentAQI}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
                    {advisoryData.advisory.generalAdvice}
                  </p>
                </div>

                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 p-3 rounded-2xl bg-slate-900/80 border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Active Health Profile</span>
                  <div className="text-xs font-bold text-cyan-300 text-center">
                    {advisoryData.userContext.healthSensitivity}
                  </div>
                  {advisoryData.userContext.age && (
                    <span className="text-[10px] text-gray-400">Age: {advisoryData.userContext.age} yrs</span>
                  )}
                </div>
              </div>
            </div>

            {/* Condition-Specific Guidance (If sensitive) */}
            {advisoryData.userContext.healthSensitivity !== 'None' && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Specialized Alert for {advisoryData.userContext.healthSensitivity}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-100/90 mt-1 leading-relaxed">
                    {advisoryData.advisory.sensitiveGroupAdvice.details}
                  </p>
                </div>
              </div>
            )}

            {/* Primary Action Protocols: 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Outdoor Activities Advice */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Outdoor Exertion</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      advisoryData.advisory.outdoorActivities.status === 'Safe'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : advisoryData.advisory.outdoorActivities.status === 'Caution'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {advisoryData.advisory.outdoorActivities.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Cardio & Outdoor Sports</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {advisoryData.advisory.outdoorActivities.details}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Check Green Zone Recommender for clean paths</span>
                </div>
              </div>

              {/* Mask & Filtration Advice */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Respiratory Protection</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      advisoryData.advisory.maskAdvice.recommended
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-slate-800 text-gray-400'
                    }`}>
                      {advisoryData.advisory.maskAdvice.recommended ? 'Mask Advised' : 'Optional'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Mask / Filtration Gear</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {advisoryData.advisory.maskAdvice.details}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-cyan-300 font-semibold">
                  Standard: {advisoryData.advisory.maskAdvice.maskType}
                </div>
              </div>

              {/* Indoor Air & Ventilation Advice */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Indoor Management</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {advisoryData.advisory.ventilationAdvice.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Window & Purifier Strategy</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {advisoryData.advisory.ventilationAdvice.details}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <Home className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Maintain HEPA filter runtime when windows are sealed</span>
                </div>
              </div>
            </div>

            {/* Dos and Don'ts Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Recommended Actions */}
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Recommended Protective Actions</h3>
                </div>
                <ul className="space-y-2.5">
                  {advisoryData.advisory.recommendedActions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Activities to Avoid */}
              <div className="glass-panel p-6 rounded-3xl border border-rose-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">High-Risk Activities to Avoid</h3>
                </div>
                <ul className="space-y-2.5">
                  {advisoryData.advisory.activitiesToAvoid.length > 0 ? (
                    advisoryData.advisory.activitiesToAvoid.map((activity, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{activity}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-400">No strict activity prohibitions under current air quality.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Prominent Medical Disclaimer */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-start gap-3 text-xs text-gray-400">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {advisoryData.advisory.disclaimer}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
