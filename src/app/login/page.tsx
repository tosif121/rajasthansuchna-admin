'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Store client session metadata
      localStorage.setItem('rs_auth_user', JSON.stringify(data.user));

      // Redirect to Admin Dashboard
      router.push('/');
      router.refresh();
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors relative">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#A30B0B] to-[#7A0606] flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-red-950/20">
            RS
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rajasthan Suchna</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official Administrative Console
          </p>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 rounded-xl text-xs bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/80 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <Label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Admin Email or Username</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type="text"
                required
                placeholder="admin@rajasthansuchna.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 pr-3 h-10 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <Label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Admin Password</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10 h-10 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-0.5 focus:outline-none z-10"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-3 h-11 bg-[#A30B0B] hover:bg-[#850909] text-white font-semibold shadow-md transition-colors cursor-pointer"
          >
            {loading ? 'Verifying Admin Access...' : 'Sign In as Admin'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Authorized Administrator Access Only
          </p>
        </div>
      </div>
    </div>
  );
}
