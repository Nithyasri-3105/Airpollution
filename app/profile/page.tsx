'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { HealthSensitivity } from '@/lib/types';
import { CITIES_DATA } from '@/lib/aqi-data';
import {
  UserCheck,
  Mail,
  MapPin,
  Activity,
  Bell,
  Save,
  LogOut,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Calendar
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: 'Delhi',
    age: '',
    healthSensitivity: 'None' as HealthSensitivity,
    alertPreferences: {
      unhealthyAlerts: true,
      predictionSpikeAlerts: true,
      activityAlerts: true,
      emailDigest: false
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        city: user.city || 'Delhi',
        age: user.age ? String(user.age) : '',
        healthSensitivity: user.healthSensitivity || 'None',
        alertPreferences: user.alertPreferences || {
          unhealthyAlerts: true,
          predictionSpikeAlerts: true,
          activityAlerts: true,
          emailDigest: false
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);
    setSaving(true);

    try {
      const res = await updateProfile({
        name: formData.name,
        city: formData.city,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        healthSensitivity: formData.healthSensitivity,
        alertPreferences: formData.alertPreferences
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        setError(res.error || 'Failed to update profile settings.');
      }
    } catch (err) {
      setError('A connection error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const SENSITIVITIES: HealthSensitivity[] = [
    'None',
    'Asthma',
    'Respiratory sensitivity',
    'Heart condition',
    'Allergy sensitivity',
    'Other'
  ];

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                User Profile & Environmental Preferences
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Manage your personal thresholds, sensitive group flags, and notification preferences
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Your profile settings and notification preferences have been saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User ID Card */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center justify-between">
            <div className="w-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-3xl font-black text-slate-950 shadow-xl shadow-cyan-500/20 mb-4">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-lg font-bold text-white">{formData.name || 'AirSense User'}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{formData.email}</p>

              <div className="mt-4 w-full space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">Primary City:</span>
                  <span className="font-semibold text-cyan-300">{formData.city}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">Condition:</span>
                  <span className="font-semibold text-emerald-300">{formData.healthSensitivity}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="font-semibold text-gray-200">{formData.age ? `${formData.age} yrs` : 'Not specified'}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 w-full pt-4 border-t border-white/5 text-[10px] text-gray-500">
              AirSense AI Authenticated Session Active
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
            <h3 className="text-base font-bold text-white pb-2 border-b border-white/10">
              Personal Information & Sensitivity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Email Address <span className="text-gray-500 text-[10px]">(Account Key)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={formData.email}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary City */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Primary Location / City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {CITIES_DATA.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.stateCountry})</option>
                  ))}
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Age <span className="text-gray-500 font-normal">(Years)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Health Sensitivity */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Health Sensitivity / Pre-Existing Condition
              </label>
              <select
                value={formData.healthSensitivity}
                onChange={(e) => setFormData({ ...formData, healthSensitivity: e.target.value as HealthSensitivity })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {SENSITIVITIES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-400">
                Customizes threshold alerts, cardio workout recommendations, and mask filtration reminders.
              </p>
            </div>

            {/* Notification / Alert Preferences */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Air Quality Notification Preferences
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={formData.alertPreferences.unhealthyAlerts}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertPreferences: { ...formData.alertPreferences, unhealthyAlerts: e.target.checked }
                    })}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-200 block">Severe & Unhealthy AQI Alerts</span>
                    <span className="text-[11px] text-gray-400">Notify immediately when ambient AQI breaches unhealthy thresholds (&gt;150).</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={formData.alertPreferences.predictionSpikeAlerts}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertPreferences: { ...formData.alertPreferences, predictionSpikeAlerts: e.target.checked }
                    })}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-200 block">Forecast Spike Warnings</span>
                    <span className="text-[11px] text-gray-400">Alert in advance when the AI prediction predicts a &gt;25% particulate surge.</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer hover:bg-slate-900">
                  <input
                    type="checkbox"
                    checked={formData.alertPreferences.activityAlerts}
                    onChange={(e) => setFormData({
                      ...formData,
                      alertPreferences: { ...formData.alertPreferences, activityAlerts: e.target.checked }
                    })}
                    className="rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-gray-200 block">Green Zone & Clean Window Advisories</span>
                    <span className="text-[11px] text-gray-400">Receive morning notifications when ideal low-pollution outdoor windows are detected.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
