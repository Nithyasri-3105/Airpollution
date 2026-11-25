'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { AQIGauge } from '@/components/AQIGauge';
import { AQIBadge } from '@/components/AQIBadge';
import { PollutantCard } from '@/components/PollutantCard';
import { TrendChart } from '@/components/TrendChart';
import { useAuth } from '@/context/AuthContext';
import { CityData, PredictionResult, HealthAdvisoryResult } from '@/lib/types';
import { 
  TrendingUp, 
  HeartPulse, 
  Map, 
  GitCompare, 
  Flame, 
  Trees, 
  Bot, 
  FileBarChart,
  ArrowRight,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const { user, selectedCity } = useAuth();

  const [cityData, setCityData] = useState<CityData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [advisory, setAdvisory] = useState<HealthAdvisoryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = React.useRef<AbortController | null>(null);


  useEffect(() => {
    // Cancel any in-flight request from previous city
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Check local session cache for instant 0ms rendering
    const cacheKey = `airsense_dash_${selectedCity}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.cityData) setCityData(parsed.cityData);
        if (parsed.prediction) setPrediction(parsed.prediction);
        if (parsed.advisory) setAdvisory(parsed.advisory);
        setLoading(false);
      }
    } catch (e) {}

    fetchDashboardData(selectedCity, abortRef.current);
  }, [selectedCity]);

  const fetchDashboardData = async (city: string, signal?: AbortController, forceRefresh = false) => {
    // Only show spinner if we don't have any cached data to display
    const cacheKey = `airsense_dash_${city}`;
    if (forceRefresh) {
      sessionStorage.removeItem(cacheKey);
      setRefreshing(true);
    } else if (!sessionStorage.getItem(cacheKey)) {
      setLoading(true);
    }

    try {
      const opts = signal ? { signal: signal.signal } : {};
      const refreshParam = forceRefresh ? '&refresh=true' : '';
      // Parallel fetch for dashboard telemetry
      const [currentRes, predRes, advRes] = await Promise.all([
        fetch(`/api/aqi/current?city=${encodeURIComponent(city)}${refreshParam}`, opts),
        fetch(`/api/prediction?city=${encodeURIComponent(city)}&period=24h`, opts),
        fetch(`/api/health-advisory?city=${encodeURIComponent(city)}`, opts)
      ]);

      const currentJson = await currentRes.json();
      const predJson = await predRes.json();
      const advJson = await advRes.json();

      let freshCity = cityData;
      let freshPred = prediction;
      let freshAdv = advisory;

      if (currentJson.success) {
        setCityData(currentJson.city);
        freshCity = currentJson.city;
      }
      if (predJson.success) {
        setPrediction(predJson.prediction);
        freshPred = predJson.prediction;
      }
      if (advJson.success) {
        setAdvisory(advJson.advisory);
        freshAdv = advJson.advisory;
      }

      sessionStorage.setItem(cacheKey, JSON.stringify({
        cityData: freshCity,
        prediction: freshPred,
        advisory: freshAdv
      }));
    } catch (error: any) {
      if (error?.name === 'AbortError') return; // Ignore cancelled requests
      console.error('Error fetching dashboard telemetry:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(selectedCity, undefined, true);
  };

  if (loading && !cityData) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Loading Live Station Telemetry...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!cityData) {
    return (
      <AppShell>
        <div className="p-8 text-center glass-panel rounded-2xl">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm text-gray-300">Station data temporarily unavailable for {selectedCity}.</p>
        </div>
      </AppShell>
    );
  }

  // Quick Action Modules
  const QUICK_ACTIONS = [
    { name: 'AI Prediction', desc: 'Next 24h & 7d Trajectory', href: '/prediction', icon: TrendingUp, color: 'text-cyan-400' },
    { name: 'Health Advisory', desc: 'Custom Risk Protocols', href: '/health-advisory', icon: HeartPulse, color: 'text-emerald-400' },
    { name: 'AQI Heat Map', desc: 'Spatial Sensor Network', href: '/map', icon: Map, color: 'text-amber-400' },
    { name: 'Multi-City Compare', desc: 'Cross-Urban Telemetry', href: '/compare', icon: GitCompare, color: 'text-purple-400' },
    { name: 'Green Zones', desc: 'Low-Pollution Sanctuaries', href: '/green-zones', icon: Trees, color: 'text-teal-400' },
    { name: 'Data & Reports', desc: 'Audit Logs & CSV Export', href: '/reports', icon: FileBarChart, color: 'text-indigo-400' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header & Overview Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {cityData.name} Overview
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-gray-300 border border-white/10">
                {cityData.stateCountry}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry synchronized {cityData.lastUpdated}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-gray-300 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Station'}</span>
            </button>
            <Link
              href="/prediction"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:opacity-90 transition shadow-sm"
            >
              <span>View Predictions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Hero Section: Large AQI Gauge Card + Prediction & Health Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Live AQI Gauge */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Primary Monitor</span>
                <h3 className="text-lg font-bold text-white">Current Ambient AQI</h3>
              </div>
              <AQIBadge category={cityData.category} size="md" />
            </div>

            <div className="my-2">
              <AQIGauge aqi={cityData.currentAQI} dominantPollutant={cityData.dominantPollutant} />
            </div>

            {/* Weather Telemetry Row */}
            <div className="pt-3 border-t border-white/10 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Temp</span>
                <span className="font-bold text-white">{cityData.weather.temperature}&deg;C</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Humidity</span>
                <span className="font-bold text-white">{cityData.weather.humidity}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Wind className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Wind</span>
                <span className="font-bold text-white">{cityData.weather.windSpeed} km/h</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                <Compass className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block">Vector</span>
                <span className="font-bold text-white">{cityData.weather.windDirection}</span>
              </div>
            </div>
          </div>

          {/* Card 2: 24h Prediction Preview & Health Advisory Preview */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 24-Hour Forecast Preview */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Next 24 Hours AI Prediction Preview</h3>
                    <p className="text-xs text-gray-400">Atmospheric boundary layer regression</p>
                  </div>
                </div>
                <Link
                  href="/prediction"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  Full Forecast <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {prediction && (
                <>
                  <div className="my-1">
                    <TrendChart
                      data={prediction.hourly || []}
                      dataKey="aqi"
                      name="Predicted AQI"
                      color="#06B6D4"
                      height={150}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/10 text-xs">
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-gray-400 block">24h Average AQI</span>
                      <span className="font-extrabold text-white text-base">{prediction.predictedAQI}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-rose-400 block">Projected Peak</span>
                      <span className="font-extrabold text-rose-300 text-sm">{prediction.expectedPeakTime} (AQI {prediction.expectedPeakAQI})</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-slate-900/60 border border-white/5">
                      <span className="text-[10px] text-emerald-400 block">Cleanest Window</span>
                      <span className="font-extrabold text-emerald-300 text-sm">{prediction.expectedCleanestTime} (AQI {prediction.expectedCleanestAQI})</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Health Advisory Snapshot */}
            {advisory && (
              <div className="glass-panel p-5 rounded-3xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Smart Health Advisory</h3>
                      <p className="text-xs text-gray-400">
                        Profile: {user?.healthSensitivity || 'General Public'} {user?.age ? `(Age ${user.age})` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Risk Level: {advisory.overallRisk}
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mt-2 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  {advisory.generalAdvice}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Outdoor Activity: <strong className="text-cyan-400">{advisory.outdoorActivities.status}</strong>
                  </span>
                  <Link
                    href="/health-advisory"
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    Personalized Guidance <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6 Key Criteria Pollutants */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Main Atmospheric Pollutants</h2>
              <p className="text-xs text-gray-400">Real-time concentration vs WHO/EPA ambient safety limits</p>
            </div>
            <span className="text-xs text-gray-400 hidden sm:block">6 Telemetry Sensors Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <PollutantCard
              name="PM2.5"
              fullName="Fine Particulate Matter"
              value={cityData.pollutants.pm25}
              unit="µg/m³"
              safeLimit={15}
              description="Microscopic particulates penetrating deep into pulmonary alveoli."
            />
            <PollutantCard
              name="PM10"
              fullName="Coarse Particulate Matter"
              value={cityData.pollutants.pm10}
              unit="µg/m³"
              safeLimit={45}
              description="Inhalable particles from unpaved roads and construction dust."
            />
            <PollutantCard
              name="NO2"
              fullName="Nitrogen Dioxide"
              value={cityData.pollutants.no2}
              unit="ppb"
              safeLimit={25}
              description="Combustion gas from vehicular tailpipes and thermal generation."
            />
            <PollutantCard
              name="O3"
              fullName="Ground-Level Ozone"
              value={cityData.pollutants.o3}
              unit="ppb"
              safeLimit={50}
              description="Photochemical secondary oxidant triggered by intense sunlight."
            />
            <PollutantCard
              name="CO"
              fullName="Carbon Monoxide"
              value={cityData.pollutants.co}
              unit="ppm"
              safeLimit={4}
              description="Colorless gas reducing hemoglobin oxygen-carrying capacity."
            />
            <PollutantCard
              name="SO2"
              fullName="Sulfur Dioxide"
              value={cityData.pollutants.so2}
              unit="ppb"
              safeLimit={20}
              description="Pungent toxic gas originating from smelting and coal utility."
            />
          </div>
        </div>

        {/* Quick Access to All Major Features */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AirSense AI Platform Modules</h2>
              <p className="text-xs text-gray-400">Quick access to predictive, geospatial, and analytical tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition group flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5 group-hover:scale-105 transition">
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                        {action.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
