import React from 'react';
import {
  Activity,
  Radio,
  Download,
  Upload,
  Sparkles,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { TimeRangeOption } from '../types';

interface NavbarProps {
  timeRange: TimeRangeOption;
  setTimeRange: (val: TimeRangeOption) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onOpenAi: () => void;
  onOpenAlerts: () => void;
  onOpenDataModal: () => void;
  unreadAlertCount: number;
  lastUpdated: Date;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  timeRange,
  setTimeRange,
  isSimulating,
  setIsSimulating,
  onOpenAi,
  onOpenAlerts,
  onOpenDataModal,
  unreadAlertCount,
  lastUpdated,
  onRefresh,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Campus Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl tracking-wider">
              BIT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 tracking-tight">
                  Campus Footfall Analytics
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Bannari Amman Institute of Technology
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span className="text-emerald-400 font-medium">Telemetry Online</span>
                </span>
                <span className="hidden md:inline text-slate-500">•</span>
                <span className="hidden md:inline text-slate-400">
                  Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Controls & AI Quick Launch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Ticking Stream Toggle */}
            <button
              id="btn-toggle-telemetry"
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                isSimulating
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle realtime telemetry ingestion feed"
            >
              <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isSimulating ? 'Realtime Ingestion Active' : 'Realtime Feed Paused'}</span>
            </button>

            {/* Refresh Button */}
            <button
              id="btn-refresh-data"
              type="button"
              onClick={onRefresh}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Refresh Telemetry Readings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Alert Indicator */}
            <button
              id="btn-open-alerts"
              type="button"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Campus Incident & Overcapacity Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {/* CSV Import/Export */}
            <button
              id="btn-open-data-modal"
              type="button"
              onClick={onOpenDataModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition"
              title="Export or Import Footfall CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Data I/O</span>
            </button>

            {/* AI Advisor Button */}
            <button
              id="btn-open-ai-advisor"
              type="button"
              onClick={onOpenAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden xs:inline">Campus AI Analyst</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Filters & Dimensions */}
        <div className="py-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Time range selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Timeframe:</span>
            {(
              [
                { id: 'live', label: 'Live' },
                { id: 'today', label: 'Today (Real-time)' },
                { id: '7days', label: '7-Day Trend' },
                { id: 'exam_week', label: 'Exam Week' },
                { id: 'fest_week', label: 'Fest Week' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeRange(opt.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  timeRange === opt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
