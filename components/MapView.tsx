'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CITIES_DATA, getAQICategory, getAQIColor } from '@/lib/aqi-data';
import { AQIBadge } from './AQIBadge';
import { CityData } from '@/lib/types';
import { 
  MapPin, 
  Wind, 
  Thermometer, 
  Droplets, 
  Layers, 
  Search,
  RefreshCw,
  Eye,
  Navigation,
  Globe
} from 'lucide-react';

interface MapViewProps {
  onSelectCity?: (city: CityData) => void;
  selectedCityId?: string;
}

type BasemapStyle = 'osm' | 'street' | 'dark' | 'satellite';

const BASEMAP_URLS: Record<BasemapStyle, { url: string; attribution: string; subdomains?: string }> = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  street: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

export const MapView: React.FC<MapViewProps> = ({ onSelectCity, selectedCityId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatCirclesRef = useRef<any[]>([]);

  const [cities, setCities] = useState<CityData[]>(CITIES_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'aqi' | 'pm25' | 'pm10' | 'no2' | 'o3'>('aqi');
  const [basemapStyle, setBasemapStyle] = useState<BasemapStyle>('osm');

  const [selectedStation, setSelectedStation] = useState<CityData>(() => {
    return CITIES_DATA.find(c => c.id.toLowerCase() === selectedCityId?.toLowerCase()) || CITIES_DATA[0];
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load live cities telemetry on mount
  useEffect(() => {
    let isSubscribed = true;
    const loadLiveCities = async () => {
      setIsLoadingLive(true);
      try {
        const res = await fetch('/api/aqi/cities');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.cities && data.cities.length > 0 && isSubscribed) {
            setCities(data.cities);
            const match = data.cities.find((c: CityData) => c.id.toLowerCase() === selectedStation.id.toLowerCase());
            if (match) {
              setSelectedStation(match);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load live map cities:', err);
      } finally {
        if (isSubscribed) setIsLoadingLive(false);
      }
    };

    loadLiveCities();
    return () => { isSubscribed = false; };
  }, []);

  // Handle City Location Search (Zero API Key required)
  const handleSearchCity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const res = await fetch(`/api/aqi/current?city=${encodeURIComponent(searchQuery.trim())}`);
      if (!res.ok) throw new Error('City not found');

      const data = await res.json();
      if (data.success && data.city) {
        const newCity: CityData = data.city;

        setCities(prev => {
          const exists = prev.some(c => c.id.toLowerCase() === newCity.id.toLowerCase() || c.name.toLowerCase() === newCity.name.toLowerCase());
          if (exists) {
            return prev.map(c => (c.id.toLowerCase() === newCity.id.toLowerCase() || c.name.toLowerCase() === newCity.name.toLowerCase()) ? newCity : c);
          }
          return [newCity, ...prev];
        });

        setSelectedStation(newCity);
        if (onSelectCity) onSelectCity(newCity);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newCity.lat, newCity.lng], 9, {
            duration: 1.5
          });
        }
        setSearchQuery('');
      } else {
        setSearchError(`Could not locate "${searchQuery}". Try another city name.`);
      }
    } catch (err) {
      setSearchError(`Failed to locate "${searchQuery}". Please check city spelling.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialLat = selectedStation ? selectedStation.lat : 25;
      const initialLng = selectedStation ? selectedStation.lng : 40;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 3,
        minZoom: 2,
        maxZoom: 15,
        zoomControl: true,
        attributionControl: false
      });

      const styleConfig = BASEMAP_URLS[basemapStyle] || BASEMAP_URLS.osm;
      const primaryTileLayer = L.tileLayer(styleConfig.url, {
        maxZoom: 19,
        crossOrigin: true
      });

      primaryTileLayer.addTo(map);

      mapInstanceRef.current = map;
      renderHeatmapAndMarkers(L, map);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, basemapStyle]);

  // Update map visual elements when filters or cities change
  useEffect(() => {
    if (!mapInstanceRef.current || !isClient) return;

    import('leaflet').then((L) => {
      renderHeatmapAndMarkers(L, mapInstanceRef.current);
    });
  }, [activeFilter, selectedStation, cities, isClient]);

  const renderHeatmapAndMarkers = (L: any, map: any) => {
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    heatCirclesRef.current.forEach(hc => map.removeLayer(hc));
    heatCirclesRef.current = [];

    // Render Clean Gradient Heat Map Circles & City Name Pins
    cities.forEach(city => {
      let metricValue = city.currentAQI;
      if (activeFilter === 'pm25') metricValue = city.pollutants.pm25;
      else if (activeFilter === 'pm10') metricValue = city.pollutants.pm10;
      else if (activeFilter === 'no2') metricValue = city.pollutants.no2;
      else if (activeFilter === 'o3') metricValue = city.pollutants.o3;

      const color = getAQIColor(city.currentAQI);
      const isSelected = selectedStation?.id === city.id;

      // Heat Diffusion Radius
      const outerHeatRadius = Math.max(120000, Math.min(450000, metricValue * 2200));
      const innerHeatRadius = outerHeatRadius * 0.45;

      const outerCircle = L.circle([city.lat, city.lng], {
        radius: outerHeatRadius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.22,
        interactive: false
      }).addTo(map);

      const innerCircle = L.circle([city.lat, city.lng], {
        radius: innerHeatRadius,
        color: color,
        weight: 1,
        opacity: 0.4,
        fillColor: color,
        fillOpacity: 0.45,
        interactive: false
      }).addTo(map);

      heatCirclesRef.current.push(outerCircle, innerCircle);

      // Custom Marker with visible City Name Pill Label
      const customIcon = L.divIcon({
        className: 'custom-aqi-city-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <!-- Pulsing Badge Circle -->
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              width: ${isSelected ? '48px' : '38px'};
              height: ${isSelected ? '48px' : '38px'};
              background: rgba(15, 23, 42, 0.92);
              border: 2.5px solid ${color};
              border-radius: 50%;
              box-shadow: 0 0 ${isSelected ? '24px' : '10px'} ${color}bb;
              transition: all 0.2s ease-out;
            ">
              <span style="
                color: #ffffff;
                font-size: ${isSelected ? '12px' : '10px'};
                font-weight: 800;
                font-family: monospace;
              ">
                ${metricValue}
              </span>
            </div>

            <!-- City Name Text Tag -->
            <div style="
              margin-top: 4px;
              padding: 2px 8px;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid ${isSelected ? color : 'rgba(255,255,255,0.2)'};
              border-radius: 12px;
              color: ${isSelected ? '#ffffff' : '#cbd5e1'};
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              backdrop-filter: blur(4px);
            ">
              ${city.name}
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setSelectedStation(city);
        if (onSelectCity) onSelectCity(city);
        map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 7), {
          duration: 1.2
        });
      });

      markersRef.current.push(marker);
    });
  };

  const handleStationClick = (city: CityData) => {
    setSelectedStation(city);
    if (onSelectCity) onSelectCity(city);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lng], Math.max(mapInstanceRef.current.getZoom(), 7), { duration: 1.2 });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Map Display Box */}
      <div className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10 min-h-[550px] shadow-2xl relative">
        
        {/* Top Controls & Google Maps City Location Finder Search Bar */}
        <div className="p-3 bg-slate-900/95 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          
          {/* City Location Search Input Box */}
          <form onSubmit={handleSearchCity} className="flex items-center gap-2 flex-1 min-w-[280px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search city location (e.g. Chennai, London, Tokyo, Chicago)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-1"
              >
                {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                <span>Go</span>
              </button>
            </div>
          </form>

          {/* Filter & Basemap Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pollutant Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 text-xs">
              {[
                { id: 'aqi', label: 'AQI' },
                { id: 'pm25', label: 'PM2.5' },
                { id: 'pm10', label: 'PM10' },
                { id: 'no2', label: 'NO₂' },
                { id: 'o3', label: 'O₃' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
                    activeFilter === f.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Basemap Style Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/5 text-xs">
              <Layers className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
              {[
                { id: 'osm', label: 'OpenStreetMap' },
                { id: 'street', label: 'Street' },
                { id: 'dark', label: 'Dark' },
                { id: 'satellite', label: 'Satellite' },
              ].map(b => (
                <button
                  key={b.id}
                  onClick={() => setBasemapStyle(b.id as BasemapStyle)}
                  className={`px-2 py-1 text-[11px] rounded-lg font-medium transition ${
                    basemapStyle === b.id
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Error Notification Banner if any */}
        {searchError && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
            <span>{searchError}</span>
            <button onClick={() => setSearchError(null)} className="text-rose-400 font-bold">✕</button>
          </div>
        )}

        {/* Heat Map Banner Status Notice */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-white/5 flex items-center justify-between text-[11px] text-gray-300">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              <strong>Geospatial Heat Map:</strong> Type any city name to jump directly to its live AQI heatmap.
            </span>
          </div>
          <span className="text-gray-400 hidden sm:inline">
            Showing <strong className="text-cyan-300">{cities.length}</strong> Locations
          </span>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="relative flex-1 min-h-[480px] bg-slate-950">
          {!isClient && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
              Loading Geospatial Visualizer...
            </div>
          )}
          <div ref={mapContainerRef} className="w-full h-full min-h-[480px] z-0" />

          {/* Map Legend Floating Drawer */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-[10px] space-y-1.5 shadow-xl">
            <span className="font-bold text-gray-200 block border-b border-white/10 pb-1">
              AQI Heat Severity Scale
            </span>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-gray-300">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" /> Good (0-50)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] shadow-[0_0_8px_#EAB308]" /> Moderate (51-100)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-[0_0_8px_#F97316]" /> Sensitive (101-150)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" /> Unhealthy (151-200)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" /> Very Unhealthy (201-300)</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#881337] shadow-[0_0_8px_#881337]" /> Hazardous (301+)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Station Inspector Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {selectedStation && (
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between h-full shadow-xl">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Station Inspector
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedStation.name}</h3>
                  <p className="text-xs text-gray-400">{selectedStation.stateCountry}</p>
                </div>
                <AQIBadge category={selectedStation.category} size="md" />
              </div>

              {/* Main Reading Box */}
              <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-xs text-gray-400">Measured AQI Index</span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {selectedStation.currentAQI}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-medium block mt-0.5">
                    {selectedStation.lastUpdated || 'Live Telemetry'}
                  </span>
                </div>
                <div 
                  className="w-13 h-13 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg"
                  style={{ backgroundColor: `${getAQIColor(selectedStation.currentAQI)}33`, border: `2px solid ${getAQIColor(selectedStation.currentAQI)}` }}
                >
                  {selectedStation.currentAQI}
                </div>
              </div>

              {/* Pollutant Breakdown Grid */}
              <div className="mt-4 space-y-2">
                <span className="text-xs font-semibold text-gray-300 block">Atmospheric Pollutants</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">PM2.5 (Fine Aerosols)</span>
                    <span className="font-bold text-white">{selectedStation.pollutants.pm25} µg/m³</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">PM10 (Coarse Dust)</span>
                    <span className="font-bold text-white">{selectedStation.pollutants.pm10} µg/m³</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">NO2 (Nitrogen Dioxide)</span>
                    <span className="font-bold text-white">{selectedStation.pollutants.no2} ppb</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">O3 (Ground Ozone)</span>
                    <span className="font-bold text-white">{selectedStation.pollutants.o3} ppb</span>
                  </div>
                </div>
              </div>

              {/* Atmospheric Conditions */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs text-gray-300">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedStation.weather.temperature}°C</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedStation.weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedStation.weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* Quick Station Selector List */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                Active Map Locations ({cities.length})
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {cities.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleStationClick(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition ${
                      selectedStation.id === c.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {c.name} ({c.currentAQI})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
