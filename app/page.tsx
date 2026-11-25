'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wind, 
  TrendingUp, 
  HeartPulse, 
  Map, 
  GitCompare, 
  Flame, 
  Trees, 
  Bot, 
  FileBarChart,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const FEATURES = [
    {
      icon: TrendingUp,
      title: '1. AI Prediction Engine',
      description: 'Forecast AQI trajectories across 24-hour, 3-day, and 7-day horizons utilizing atmospheric boundary layer modeling.',
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400'
    },
    {
      icon: HeartPulse,
      title: '2. Health Advisory',
      description: 'Personalized medical & lifestyle guidance factoring in age, asthma, respiratory, or cardiac conditions.',
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400'
    },
    {
      icon: Map,
      title: '3. AQI Heat Map',
      description: 'Interactive high-resolution heat map overlaying particulate density and multi-pollutant telemetry across stations.',
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400'
    },
    {
      icon: GitCompare,
      title: '4. Multi-City Compare',
      description: 'Synchronous cross-city comparative analysis across PM2.5, PM10, NO2, and seasonal dispersion curves.',
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400'
    },
    {
      icon: Trees,
      title: '5. Green Zone Recommender',
      description: 'Discover optimal micro-climates, parks, and clean-air corridors for jogging, cycling, and outdoor recreation.',
      color: 'from-teal-500/20 to-emerald-500/10 text-teal-400'
    },
    {
      icon: FileBarChart,
      title: '6. Data & Reports',
      description: 'Audit-ready historical reporting, data visualization, and instant CSV/PDF export for environmental compliance.',
      color: 'from-indigo-500/20 to-violet-500/10 text-indigo-400'
    },
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: 'Air Quality Data',
      desc: 'Real-time telemetry ingestion from multi-sensor monitoring networks (PM2.5, PM10, NO2, O3, CO, SO2).',
      icon: Layers
    },
    {
      step: '02',
      title: 'Data Analysis',
      desc: 'Quality control, meteorological correlation (wind, temperature, boundary layer), and baseline normalization.',
      icon: BarChart3
    },
    {
      step: '03',
      title: 'AI Prediction',
      desc: 'Deep predictive forecast modeling spanning 24-hour diurnal curves, 3-day, and 7-day atmospheric projections.',
      icon: Cpu
    },
    {
      step: '04',
      title: 'Health & Environmental Insights',
      desc: 'Intersecting forecasted pollutants with user health profiles to pinpoint vulnerability windows.',
      icon: Sparkles
    },
    {
      step: '05',
      title: 'Smart Recommendations',
      desc: 'Proactive mitigation: activity reschedule, mask protocols, air purifier optimization, and green zones.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-20 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Wind className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">AIRSense</span>
              <span className="text-xs font-black uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-medium">Predictive Environmental Advisory</span>
          </div>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-95 transition shadow-lg shadow-cyan-500/20"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 hover:text-white transition"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition shadow-lg shadow-cyan-500/20"
              >
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 sm:px-12 pt-16 pb-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Ambient glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Environmental Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1]">
          Don&apos;t Just Observe Today&apos;s AQI. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Predict What Air You Will Breathe Next.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-3xl leading-relaxed">
          AIRSense AI fuses multi-station chemical telemetry, meteorological boundary dynamics, and predictive algorithms to deliver real-time air quality forecasts, actionable health protocols, and smart green sanctuaries.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 transition shadow-xl shadow-cyan-500/25"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/80 hover:bg-slate-800 text-gray-200 border border-slate-700/80 transition"
          >
            <span>Sign In to Platform</span>
          </Link>
        </div>

        {/* Current vs Future AQI Concept Showcase */}
        <div className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {/* Concept 1: Current AQI */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
              <Wind className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Concept 01</span>
            <h3 className="text-2xl font-bold text-white mt-1">Current AQI Monitoring</h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Continuous live telemetry across 6 primary criteria pollutants: fine particulates (PM2.5, PM10), nitrogen dioxide (NO2), ground-level ozone (O3), carbon monoxide (CO), and sulfur dioxide (SO2).
            </p>
            <div className="mt-5 p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Delhi Active Station</span>
                <p className="text-lg font-bold text-white">AQI 184 (Unhealthy)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                PM2.5: 118 µg/m³
              </span>
            </div>
          </div>

          {/* Concept 2: Future AQI Prediction */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Concept 02</span>
            <h3 className="text-2xl font-bold text-white mt-1">Predictive AI Trajectory</h3>
            <p className="mt-2 text-sm text-gray-300 leading-relaxed">
              Don&apos;t wait for pollution spikes to happen. Our AI models anticipate thermal inversion, stagnant boundary layer traps, and commuter surges up to 7 days in advance.
            </p>
            <div className="mt-5 p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400">Next 24h AI Trajectory</span>
                <p className="text-lg font-bold text-white">Peak: 20:00 (AQI 220)</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Best: 06:00 (AQI 95)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Workflow Section */}
      <section className="py-16 px-6 sm:px-12 bg-slate-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Algorithmic Pipeline</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              How AirSense AI Works
            </h2>
            <p className="mt-3 text-sm text-gray-300">
              From raw atmospheric sensor streams to proactive health advisories in 5 coordinated steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div 
                  key={step.step}
                  className="glass-panel p-5 rounded-2xl border border-white/5 relative flex flex-col justify-between hover:border-cyan-500/30 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xl font-black text-cyan-400/80">{step.step}</span>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2">{step.title}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{step.desc}</p>
                  </div>
                  {index < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8 Major Features Showcase */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
            Eight Integrated Intelligence Modules
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-300">
            A complete suite designed for personal health, urban planning, environmental research, and proactive community protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 border border-white/10 group-hover:scale-105 transition`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-6 sm:px-12 pb-24 max-w-7xl mx-auto w-full">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-emerald-950/40 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Breathe Smarter with AirSense AI
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-300">
              Create your account in seconds to receive personalized health advisories, track pollution trends, and plan cleaner outdoor activities.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-7 py-3 rounded-xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition shadow-lg shadow-cyan-500/25"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-gray-200 border border-slate-700 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 sm:px-12 border-t border-white/10 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-gray-300">AIRSense AI</span>
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <p className="text-gray-400 text-center sm:text-right">
          Environmental Intelligence & Smart Advisory System. Not medical advice.
        </p>
      </footer>
    </div>
  );
}
