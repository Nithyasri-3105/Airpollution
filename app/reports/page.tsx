'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { AQIBadge } from '@/components/AQIBadge';
import { TrendChart } from '@/components/TrendChart';
import { useAuth } from '@/context/AuthContext';
import { CITIES_DATA, getAQIColor } from '@/lib/aqi-data';
import {
  FileBarChart,
  Download,
  Printer,
  Filter,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';

export default function ReportsPage() {
  const { selectedCity } = useAuth();

  const [filterCity, setFilterCity] = useState<string>(selectedCity);
  const [filterRange, setFilterRange] = useState<string>('30'); // days
  const [filterMinAQI, setFilterMinAQI] = useState<string>('0');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReportData(filterCity, filterRange, filterMinAQI);
  }, [filterCity, filterRange, filterMinAQI]);

  const fetchReportData = async (city: string, range: string, minAQI: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?city=${encodeURIComponent(city)}&range=${range}&minAQI=${minAQI}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    window.location.href = `/api/reports?city=${encodeURIComponent(filterCity)}&range=${filterRange}&minAQI=${filterMinAQI}&format=csv`;
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Pagination
  const totalPages = Math.ceil(records.length / itemsPerPage) || 1;
  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Compute summary stats
  const avgAQI = records.length > 0 
    ? Math.round(records.reduce((acc, r) => acc + r.aqi, 0) / records.length) 
    : 0;
  const maxAQI = records.length > 0 
    ? Math.max(...records.map(r => r.aqi)) 
    : 0;
  const minAQIVal = records.length > 0 
    ? Math.min(...records.map(r => r.aqi)) 
    : 0;

  // Chart data reversed for chronological order
  const chartData = [...records].reverse().map(r => ({
    date: r.date.split('-').slice(1).join('/'),
    aqi: r.aqi,
    pm25: r.pm25,
    pm10: r.pm10
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Environmental Data & Reports
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Historical air telemetry archives, sensor logs, and exportable regulatory audit sheets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-gray-200 border border-slate-700 transition"
              title="Print formatted executive audit report"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print Audit Sheet</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs hover:opacity-90 transition shadow-sm"
              title="Download filtered CSV"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
              Report Query Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* City Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Target Station / City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Major Cities Combined</option>
                {CITIES_DATA.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.stateCountry})</option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Historical Lookback Horizon
              </label>
              <select
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="7">Past 7 Days</option>
                <option value="15">Past 15 Days</option>
                <option value="30">Past 30 Days</option>
              </select>
            </div>

            {/* Minimum Severity Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Filter by Minimum AQI
              </label>
              <select
                value={filterMinAQI}
                onChange={(e) => setFilterMinAQI(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="0">All Readings (AQI &ge; 0)</option>
                <option value="51">Moderate & Above (&ge; 51)</option>
                <option value="101">Sensitive & Above (&ge; 101)</option>
                <option value="151">Unhealthy Only (&ge; 151)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistical Summary Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-400 font-semibold uppercase block">Records Found</span>
            <span className="text-2xl font-black text-white mt-1 block">{records.length}</span>
            <span className="text-[10px] text-gray-400">Validated Telemetry Logs</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] text-cyan-400 font-semibold uppercase block">Average Period AQI</span>
            <span className="text-2xl font-black text-cyan-300 mt-1 block">{avgAQI}</span>
            <span className="text-[10px] text-gray-400">Mean Exposure</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] text-rose-400 font-semibold uppercase block">Max Pollution Peak</span>
            <span className="text-2xl font-black text-rose-300 mt-1 block">{maxAQI}</span>
            <span className="text-[10px] text-gray-400">Worst Incident AQI</span>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/5">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase block">Best Air Baseline</span>
            <span className="text-2xl font-black text-emerald-300 mt-1 block">{minAQIVal}</span>
            <span className="text-[10px] text-gray-400">Cleanest Incident AQI</span>
          </div>
        </div>

        {/* Historical Trend Visualization */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Historical Telemetry Progression</h3>
              <p className="text-xs text-gray-400">Chronological AQI trajectory over the selected lookback range</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              {filterRange} Day Historical Log
            </span>
          </div>

          <TrendChart
            data={chartData}
            dataKey="aqi"
            name="Daily AQI"
            color="#6366F1"
            height={240}
            showThreshold={true}
            thresholdValue={100}
          />
        </div>

        {/* Interactive Data Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Tabular Telemetry Records</h3>
              <p className="text-xs text-gray-400">
                Displaying {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, records.length)} of {records.length} records
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-300 px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-400">Retrieving atmospheric database records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No telemetry records match your current filter parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3">AQI</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">PM2.5</th>
                    <th className="py-2.5 px-3">PM10</th>
                    <th className="py-2.5 px-3">NO2</th>
                    <th className="py-2.5 px-3">O3</th>
                    <th className="py-2.5 px-3">Weather</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {paginatedRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/60 transition">
                      <td className="py-3 px-3 font-semibold text-white font-sans">{r.date}</td>
                      <td className="py-3 px-3 text-gray-300 font-sans">{r.city}</td>
                      <td className="py-3 px-3 font-bold text-sm" style={{ color: getAQIColor(r.aqi) }}>
                        {r.aqi}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <AQIBadge category={r.category} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-gray-200">{r.pm25} µg/m³</td>
                      <td className="py-3 px-3 text-gray-200">{r.pm10} µg/m³</td>
                      <td className="py-3 px-3 text-gray-200">{r.no2} ppb</td>
                      <td className="py-3 px-3 text-gray-200">{r.o3} ppb</td>
                      <td className="py-3 px-3 text-gray-400 font-sans">
                        {r.temp}&deg;C | {r.humidity}% hum
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
