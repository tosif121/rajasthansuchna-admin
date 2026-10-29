'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { PageHeader } from '@/components/reusable/PageHeader';
import { ToggleSwitch } from '@/components/reusable/ToggleSwitch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  Cpu,
  ExternalLink,
  Copy,
  Check,
  Save,
  MessageSquare,
  ShieldCheck,
  Zap,
  Bot,
} from 'lucide-react';

interface PublicAiSettings {
  hasKey: boolean;
  maskedApiKey: string;
  model: string;
  isEnabled: boolean;
  groundingEnabled: boolean;
  temperature: number;
  maxOutputTokens: number;
  systemPrompt: string;
  lastTestedAt?: string;
  lastTestStatus?: 'success' | 'failed' | 'untested';
  lastTestMessage?: string;
  updatedAt: string;
  updatedBy: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isEnabled, setIsEnabled] = useState(true);
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrompt, setSystemPrompt] = useState('');

  // Live Test State
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    modelsFound?: number;
  } | null>(null);

  // Live Playground State
  const [testPrompt, setTestPrompt] = useState('What is the age limit for Rajasthan Police Constable recruitment 2026?');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/ai-settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s: PublicAiSettings = data.settings;
        setHasExistingKey(s.hasKey);
        setMaskedKey(s.maskedApiKey);
        setModel(s.model || 'gemini-2.0-flash');
        setIsEnabled(s.isEnabled !== false);
        setGroundingEnabled(s.groundingEnabled !== false);
        setTemperature(s.temperature ?? 0.2);
        setSystemPrompt(s.systemPrompt || '');
        if (s.lastTestStatus && s.lastTestStatus !== 'untested') {
          setTestResult({
            success: s.lastTestStatus === 'success',
            message: s.lastTestMessage || '',
          });
        }
      }
    } catch {
      setErrorMessage('Failed to load current AI settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage(null);
      setSaveSuccess(false);

      const body: Record<string, unknown> = {
        model,
        isEnabled,
        groundingEnabled,
        temperature,
        systemPrompt,
      };

      if (apiKey.trim()) {
        body.apiKey = apiKey.trim();
      }

      const res = await fetch('/api/v1/admin/ai-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setHasExistingKey(data.settings.hasKey);
        setMaskedKey(data.settings.maskedApiKey);
        setApiKey('');
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'Failed to save settings');
      }
    } catch {
      setErrorMessage('Network error while saving AI settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      setErrorMessage(null);

      const res = await fetch('/api/v1/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setTestResult(data.result);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed',
        });
      }
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network test error',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRunPlayground = async () => {
    if (!testPrompt.trim()) return;
    try {
      setGenerating(true);
      setPlaygroundOutput('');

      const res = await fetch('/api/v1/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setPlaygroundOutput(data.result.text);
      } else {
        setPlaygroundOutput(`Error: ${data.error || 'Could not generate response'}`);
      }
    } catch (err: unknown) {
      setPlaygroundOutput(`Error: ${err instanceof Error ? err.message : 'Network error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />

        <main className="p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          <div className="space-y-6">
      {/* Header */}
      <PageHeader
        eyebrow="AI INTEGRATION & LLM CONFIGURATION"
        title="Gemini AI Settings"
        description="Configure your Google Gemini API Key, choose high-speed inference models, and manage bilingual Q&A behavior for the Rajasthan Suchna ecosystem."
        badge={
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isEnabled && hasExistingKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isEnabled && hasExistingKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {isEnabled && hasExistingKey ? 'Gemini AI Active' : 'Setup Required'}
          </span>
        }
        actions={
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A30B0B] to-[#7A0606] text-white font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
          </button>
        }
      />

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-medium">Gemini AI settings saved and deployed successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Card 1: API Key Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Google Gemini API Key
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your secret key from Google AI Studio used for LLM queries
              </p>
            </div>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#A30B0B] dark:text-amber-400 font-semibold hover:underline"
          >
            Get Gemini Key <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Existing key indicator */}
        {hasExistingKey && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Active Key in Vault:
              </span>
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white">
                {maskedKey}
              </code>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(maskedKey)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              title="Copy masked key"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* API Key Input with Eye Toggle */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {hasExistingKey ? 'Update API Key (Leave empty to keep current)' : 'Enter Gemini API Key'}
          </Label>
          <div className="relative flex items-center">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={hasExistingKey ? 'Enter new AIzaSy... to overwrite' : 'AIzaSy...'}
              className="w-full pr-12 font-mono text-sm"
            />
            <div className="absolute right-2 flex items-center">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Test Connection Button & Result */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing || (!hasExistingKey && !apiKey.trim())}
            className="inline-flex items-center gap-2 cursor-pointer w-fit text-xs font-bold"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A30B0B]" /> : <Zap className="w-3.5 h-3.5 text-amber-500" />}
            {testing ? 'Testing with Google API...' : 'Test Connection'}
          </Button>

          {testResult && (
            <div
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>
                {testResult.message}
                {testResult.latencyMs && ` (${testResult.latencyMs}ms)`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Model & Operational Controls */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Model & Intelligence Parameters
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your Gemini architecture and generation settings
            </p>
          </div>
        </div>

        {/* Model Selection Radios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'gemini-2.0-flash',
              title: 'Gemini 2.0 Flash',
              tag: 'RECOMMENDED',
              desc: 'Ultra-fast sub-second responses, ideal for mobile chatbot.',
            },
            {
              id: 'gemini-1.5-flash',
              title: 'Gemini 1.5 Flash',
              tag: 'STABLE & FAST',
              desc: 'High throughput, optimal balance of accuracy and latency.',
            },
            {
              id: 'gemini-1.5-pro',
              title: 'Gemini 1.5 Pro',
              tag: 'DEEP REASONING',
              desc: 'Complex syllabus breakdown and multi-document reasoning.',
            },
          ].map((m) => {
            const isSelected = model === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#A30B0B] bg-red-50/20 dark:bg-red-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {m.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Toggles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Enable AI Assistant
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Allow mobile app users to chat with the Gemini assistant
              </span>
            </div>
            <ToggleSwitch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              label="Enable AI Assistant"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">
                Strict Fact Grounding
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Prevent hallucinations by strictly using verified notice facts
              </span>
            </div>
            <ToggleSwitch
              checked={groundingEnabled}
              onCheckedChange={setGroundingEnabled}
              label="Strict Fact Grounding"
            />
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> Temperature (Creativity vs Strict Factualness):
            </span>
            <span className="font-mono font-bold text-[#A30B0B] dark:text-amber-400">
              {temperature.toFixed(2)} (Strictly Factual)
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-[#A30B0B] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>0.0 (Strict Facts)</span>
            <span>0.2 (Recommended for Jobs)</span>
            <span>1.0 (Creative)</span>
          </div>
        </div>
      </div>

      {/* Card 3: System Prompt / Personality */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Persona & System Prompt
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bilingual guidelines and recruitment factual guardrails
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSystemPrompt(
                'You are Rajasthan Suchna AI Assistant. You provide accurate, verified information about government recruitment, exams, eligibility, age limits, syllabus, and application deadlines strictly based on verified official notices. Answer concisely and politely in the language the user asked in (Hindi or English). Never hallucinate or invent dates or eligibility criteria.'
              )
            }
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white underline cursor-pointer"
          >
            Reset to Default
          </button>
        </div>

        <Textarea
          rows={4}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="System prompt instructions..."
          className="w-full font-mono text-xs leading-relaxed"
        />
      </div>

      {/* Card 4: Live Playground */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Gemini Playground
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test your configured Gemini model with sample student questions
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Type a sample question..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleRunPlayground}
            disabled={generating || !testPrompt.trim() || !hasExistingKey}
            className="bg-[#A30B0B] hover:bg-[#850909] text-white cursor-pointer shrink-0"
          >
            {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {generating ? 'Querying...' : 'Ask Gemini'}
          </Button>
        </div>

        {playgroundOutput && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Gemini Output ({model})
            </div>
            {playgroundOutput}
          </div>
        )}
      </div>

      {/* Save Bottom Bar */}
      <div className="sticky bottom-4 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Remember to save changes after updating your Gemini API key or settings.
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A30B0B] to-[#7A0606] text-white font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Gemini Settings'}
        </button>
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}
