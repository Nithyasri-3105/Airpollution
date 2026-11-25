'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Map, Layers, Radio, Info } from 'lucide-react';

// Dynamically import MapView to prevent Leaflet SSR issues
const MapView = dynamic(
  () => import('@/components/MapView').then((mod) => mod.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] glass-panel rounded-2xl flex flex-col items-center justify-center text-xs text-gray-400">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-3" />
        <span>Initializing Geographic Sensor Heat Map...</span>
      </div>
    )
  }
);

export default function MapPage() {
  const { selectedCity, setSelectedCity } = useAuth();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Map className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                AQI Spatial Heat Map
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Geospatial multi-pollutant sensor telemetry across global and regional monitoring stations
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-white/5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>12 Connected Telemetry Nodes</span>
          </div>
        </div>

        {/* Map View */}
        <div className="w-full">
          <MapView
            selectedCityId={selectedCity.toLowerCase()}
            onSelectCity={(city) => setSelectedCity(city.name)}
          />
        </div>

        {/* Informational Guidance Box */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start gap-3 text-xs text-gray-400">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-200">Interactive Map Controls:</strong> Click on any station marker to inspect full particulate and atmospheric metrics. Use the telemetry layer toggle above the map to isolate PM2.5 aerosols, coarse PM10 dust, or nitrogen dioxide plumes. Coordinates and station data can be expanded via the REST API at <code className="text-cyan-300">/api/aqi/cities</code>.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
