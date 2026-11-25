'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wind, User, Mail, Lock, MapPin, Activity, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: 'Delhi',
    age: '',
    healthSensitivity: 'None'
  });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const CITIES = [
    'Delhi', 'Mumbai', 'Bengaluru', 'New York', 'Los Angeles', 
    'London', 'Tokyo', 'Paris', 'Beijing', 'Sydney', 'Dubai', 'Singapore'
  ];

  const SENSITIVITIES = [
    'None',
    'Asthma',
    'Respiratory sensitivity',
    'Heart condition',
    'Allergy sensitivity',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }
    if (!formData.city) {
      setError('Please select or specify your primary city.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await register(formData);
      if (res.success) {
        setSuccessMessage('Registration successful! Please login to continue.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected network error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Wind className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight">AIRSense AI</span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Create Your AirSense Account
        </h2>
        <p className="mt-1.5 text-xs text-gray-400">
          Personalized predictive air-quality and health monitoring
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-2xl">
          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-semibold">{successMessage}</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">Redirecting to login page...</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* City & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Primary City <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Age <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="e.g. 29"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {/* Health Sensitivity */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Health Sensitivity / Condition <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <select
                  value={formData.healthSensitivity}
                  onChange={(e) => setFormData({ ...formData, healthSensitivity: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
                >
                  {SENSITIVITIES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                Helps personalize respiratory safety thresholds and outdoor guidance.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
            >
              <span>{submitting ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Redirect to login link */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 ml-1">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
