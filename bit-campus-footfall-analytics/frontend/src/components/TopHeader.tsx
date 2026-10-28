import React from 'react';
import {
  Menu,
  Search,
  Sparkles,
  Bell,
  RefreshCw,
  Radio,
  SlidersHorizontal,
  Download,
  ShieldCheck,
  Video,
  LogOut,
  User,
} from 'lucide-react';
import { DashboardViewTab } from './Sidebar';
import { TimeRangeOption } from '../types';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  activeTab: DashboardViewTab;
  timeRange: TimeRangeOption;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onOpenAi: () => void;
  onOpenAlerts: () => void;
  onOpenDataModal: () => void;
  onOpenLiveStream: () => void;
  unreadAlertCount: number;
  lastUpdated: Date;
  onRefresh: () => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  currentUser?: { email: string; name: string; role: string; picture?: string } | null;
  onLogout?: () => void;
}

const TAB_TITLES: Record<DashboardViewTab, string> = {
  overview: 'Executive Telemetry Overview',
  map: 'Spatial Campus Heatmap (2D CAD)',
  trends: 'Diurnal Trends & Zone Density Analysis',
  flows: 'Inter-Zone Movement & Path Dynamics',
  dwell: 'Dwell Analytics & Multi-Sensor Inventory',
};

const TIMEFRAME_LABELS: Record<TimeRangeOption, string> = {
  live: 'Live Stream',
  today: 'Today (Diurnal)',
  '7days': '7-Day Trend',
  exam_week: 'Exam Period Peak',
  fest_week: 'Annual Fest Peak',
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  activeTab,
  timeRange,
  isSimulating,
  setIsSimulating,
  onOpenAi,
  onOpenAlerts,
  onOpenDataModal,
  onOpenLiveStream,
  unreadAlertCount,
  lastUpdated,
  onRefresh,
  searchQuery,
  setSearchQuery,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 h-16 flex items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb & Section Name */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
              <span className="hidden sm:inline text-slate-400 font-semibold">BIT Sathy</span>
              <span className="hidden md:inline text-slate-500">• Bannari Amman Institute of Technology</span>
              <span className="hidden sm:inline text-slate-600">/</span>
              <span className="text-indigo-400 font-semibold truncate">
                {TIMEFRAME_LABELS[timeRange]}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight truncate">
              {TAB_TITLES[activeTab]}
            </h2>
          </div>
        </div>

        {/* Center: Quick Zone Search Input */}
        <div className="hidden md:flex items-center flex-1 max-w-xs mx-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter zones (e.g. Library, Cafe)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Live Telemetry Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="text-emerald-300 font-medium">IoT Stream Live</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">42 Sensors</span>
          </div>

          {/* Live Camera Stream Trigger */}
          <button
            type="button"
            onClick={onOpenLiveStream}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold shadow-sm transition"
            title="Connect Live Camera & CCTV Feeds"
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Live Cam</span>
          </button>

          {/* Refresh Telemetry */}
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Refresh sensor metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Incident Alerts Bell */}
          <button
            type="button"
            onClick={onOpenAlerts}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Campus Alerts & Anomaly Monitor"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-slate-900 shadow">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Data I/O */}
          <button
            type="button"
            onClick={onOpenDataModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition"
            title="Export or Import CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden lg:inline">Data I/O</span>
          </button>

          {/* AI Advisor Button */}
          <button
            type="button"
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
            title="Open Gemini Campus AI Analysis"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span className="hidden sm:inline">AI Analyst</span>
          </button>

          {/* Operations Badge & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs overflow-hidden shrink-0">
              {currentUser?.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4 text-indigo-400" />
              )}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-semibold text-slate-200 leading-tight">
                {currentUser?.name || 'Aarav Sharma'}
              </div>
              <div className="text-[10px] text-indigo-400 font-medium capitalize leading-tight">
                {currentUser?.role || 'Student'} • BIT
              </div>
            </div>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition ml-1"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
