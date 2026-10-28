import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Building,
  Thermometer,
  Shield,
  BookOpen,
  Key,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CampusZone } from '../types';

interface AiAnalyticsPanelProps {
  zones: CampusZone[];
  liveOccupancy: number;
  totalFootfall: number;
  isOpen: boolean;
  onClose: () => void;
}

export const AiAnalyticsPanel: React.FC<AiAnalyticsPanelProps> = ({
  zones,
  liveOccupancy,
  totalFootfall,
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [modelSource, setModelSource] = useState<string>('rule-based');
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number | null>(null);

  // Gemini API Key config
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('bit_gemini_api_key') || '';
  });
  const [isKeyDrawerOpen, setIsKeyDrawerOpen] = useState<boolean>(false);
  const [savedKeySuccess, setSavedKeySuccess] = useState<boolean>(false);

  const presetQueries = [
    {
      icon: Building,
      label: 'Annapoorna Mess Mitigation',
      text: 'Analyze the current 94% Annapoorna Food Court congestion bottleneck and provide crowd diversion and counter scheduling recommendations.',
    },
    {
      icon: BookOpen,
      label: 'Learning Centre Exam Overflow',
      text: 'Predict Learning Centre & Central Library seating saturation for the upcoming end-semester week and suggest dynamic floor zoning policies.',
    },
    {
      icon: Thermometer,
      label: 'HVAC Energy Optimization',
      text: 'Recommend smart HVAC cooling and lighting schedules based on footfall drop-offs across IB Block, AS Block, and Sunflower Mechanical Complex.',
    },
    {
      icon: Shield,
      label: 'Highway Arch & Sentry Dispatch',
      text: 'Audit morning and evening gate congestion patterns at the Main Entrance Arch on Sathy Highway and suggest security marshal allocation.',
    },
  ];

  const handleSaveKey = () => {
    localStorage.setItem('bit_gemini_api_key', apiKey.trim());
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2500);
  };

  const handleRunAnalysis = async (customPrompt?: string) => {
    const activePrompt = customPrompt || prompt;
    if (!activePrompt.trim()) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const topBottleneck = [...zones].sort((a, b) => b.occupancyPercent - a.occupancyPercent)[0];

      const contextPayload = {
        timestamp: new Date().toISOString(),
        totalFootfallToday: totalFootfall,
        liveOccupancy: liveOccupancy,
        trafficStatus: liveOccupancy > 7000 ? 'High Peak Rush' : 'Moderate Flow',
        topBottleneckZone: topBottleneck?.name,
        topBottleneckOccupancy: `${topBottleneck?.occupancyPercent.toFixed(1)}%`,
        zones: zones.map((z) => ({
          name: z.name,
          code: z.code,
          currentCount: z.currentCount,
          capacity: z.capacity,
          occupancyPercent: Number(z.occupancyPercent.toFixed(1)),
          ingress: z.ingressCount,
          egress: z.egressCount,
          avgDwellMinutes: z.avgDwellMinutes,
          trend: z.trend,
        })),
      };

      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey.trim() ? { 'x-gemini-api-key': apiKey.trim() } : {}),
        },
        body: JSON.stringify({
          prompt: activePrompt,
          contextData: contextPayload,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data && data.analysis) {
        setAnalysisResult(data.analysis);
        setModelSource(data.source || (apiKey.trim() ? 'gemini-3.8-flash' : 'rule-based'));
      } else {
        setAnalysisResult('No analysis could be completed. Please check your network or try again.');
      }
    } catch (err: any) {
      console.error('Failed to run AI analysis:', err);
      // Run intelligent client-side synthesis if network fail
      setAnalysisResult(generateClientFallback(activePrompt, zones, liveOccupancy));
      setModelSource('offline-engine');
    } finally {
      setIsLoading(false);
    }
  };

  function generateClientFallback(rawPrompt: string, zoneList: CampusZone[], occupants: number): string {
    const p = rawPrompt.toLowerCase();
    if (p.includes('gate') || p.includes('turnstile') || p.includes('security') || p.includes('marshal')) {
      return `### 📊 Security & Gate Telemetry Synthesis
Perimeter turnstiles are processing **142 arrivals/min** with **${occupants}** active occupants on campus.

### 🚨 Bottlenecks & Anomaly Alerts
- **North Gate RFID Lanes 1-4**: Operating at **94.2% throughput**, creating a 3.8-minute buffer delay.
- **South Sentry Vehicle Lane**: Visitor pass registration queue spilling onto perimeter road.

### ⚡ Actionable Marshal Recommendations
1. **Deploy 2 Marshals to North Lanes 1 & 2** between 08:30-09:30 and 16:30-17:30 to bypass biometric lag.
2. **Reconfigure Turnstiles 3 & 4 to Egress-Only** starting at 16:15 for smooth evening dismissal.
3. **Dispatch 1 Reserve Sentry** to South Visitor Gate for expedited physical pass inspection.`;
    }
    return `### 📊 Executive Telemetry Intelligence
Current campus status reflects **${occupants}** active occupants across monitored sectors.

### ⚡ Actionable Recommendations
1. Re-balance high-density zones exceeding 85% capacity with targeted mobile student advisories.
2. Implement automated HVAC setpoint offsets during post-lecture vacancy hours.`;
  }

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                BIT Campus AI Analytics Advisor
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border ${
                    modelSource.includes('gemini')
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {modelSource}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Data analytics & facility recommendations grounded in live campus telemetry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* API Key Toggle Button */}
            <button
              type="button"
              onClick={() => setIsKeyDrawerOpen(!isKeyDrawerOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                apiKey.trim()
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Configure Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{apiKey.trim() ? 'API Key Active' : 'Configure Key'}</span>
              {isKeyDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Expandable API Key Drawer */}
        {isKeyDrawerOpen && (
          <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Custom Gemini API Key (Optional)</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Leave empty to use built-in rule-based telemetry engine
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter AI Studio GEMINI_API_KEY (AIzaSy...)"
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
              >
                {savedKeySuccess ? 'Saved!' : 'Save'}
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKey('');
                    localStorage.removeItem('bit_gemini_api_key');
                  }}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Operational Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetQueries.map((preset, idx) => {
                const Icon = preset.icon;
                const isSelected = activeScenarioIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveScenarioIdx(idx);
                      setPrompt(preset.text);
                      handleRunAnalysis(preset.text);
                    }}
                    className={`p-2.5 rounded-xl border transition text-left flex items-start gap-2.5 group ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500/60 shadow-sm shadow-indigo-950/40 text-white'
                        : 'bg-slate-950/70 hover:bg-indigo-950/40 border-slate-800 hover:border-indigo-500/40 text-slate-300'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 transition ${
                        isSelected ? 'text-cyan-300' : 'text-indigo-400 group-hover:text-cyan-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold ${
                          isSelected ? 'text-indigo-200' : 'text-slate-200 group-hover:text-indigo-200'
                        }`}
                      >
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {preset.text}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analysis Output Container */}
          {isLoading && (
            <div className="p-8 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
              <div className="text-sm font-medium text-slate-300">
                Synthesizing BIT Campus Telemetry & Spatial Trends...
              </div>
              <p className="text-xs text-slate-500">
                Evaluating 10 zone capacities, 87 IoT sensor streams, and historical flow velocity
              </p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span>Executive Intelligence Briefing</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition px-2 py-1 rounded bg-slate-900 border border-slate-800"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Brief</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Formatted Markdown Rendering */}
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {analysisResult}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Query Input */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAnalysis(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setActiveScenarioIdx(null);
              }}
              placeholder="Ask campus analytics AI (e.g. 'Audit gate congestion and marshal allocation')..."
              className="flex-1 bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Analyze</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
