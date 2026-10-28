import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  GitBranch,
  Layers,
  Clock,
  Users,
  Sparkles,
  Bell,
  Download,
  RefreshCw,
  Radio,
  ChevronLeft,
  ChevronRight,
  Activity,
  Calendar,
  GraduationCap,
  Check,
  Flame,
  X,
  Sliders,
  Video,
} from 'lucide-react';
import { TimeRangeOption } from '../types';

export type DashboardViewTab = 'overview' | 'map' | 'trends' | 'flows' | 'dwell';

interface SidebarProps {
  activeTab: DashboardViewTab;
  setActiveTab: (tab: DashboardViewTab) => void;
  timeRange: TimeRangeOption;
  setTimeRange: (val: TimeRangeOption) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  onOpenAi: () => void;
  onOpenAlerts: () => void;
  onOpenDataModal: () => void;
  onOpenLiveStream: () => void;
  unreadAlertCount: number;
  lastUpdated: Date;
  onRefresh: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  liveOccupancy: number;
}

const TIMEFRAME_OPTIONS: Array<{
  id: TimeRangeOption;
  label: string;
  badge?: string;
  desc: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'live',
    label: 'Live',
    badge: 'Real-time',
    desc: 'Instantaneous telemetry feed',
    icon: <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />,
  },
  {
    id: 'today',
    label: 'Today',
    badge: 'Standard',
    desc: 'Diurnal aggregate pattern',
    icon: <Clock className="w-3.5 h-3.5 text-indigo-400" />,
  },
  {
    id: '7days',
    label: '7-Day Trend',
    badge: 'Weekly',
    desc: 'Multi-day rolling benchmark',
    icon: <Calendar className="w-3.5 h-3.5 text-cyan-400" />,
  },
  {
    id: 'exam_week',
    label: 'Exam Week',
    badge: 'Scheduled',
    desc: 'Surge in Library & Tech labs',
    icon: <GraduationCap className="w-3.5 h-3.5 text-amber-400" />,
  },
  {
    id: 'fest_week',
    label: 'Fest Week',
    badge: 'High Surge',
    desc: 'Outdoor, dining & arena peak',
    icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
  },
];


const NAV_TABS: Array<{
  id: DashboardViewTab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}> = [
  {
    id: 'overview',
    label: 'Overview Dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: 'map',
    label: 'Spatial Heatmap',
    icon: <MapPin className="w-4 h-4" />,
    badge: '2D CAD',
  },
  {
    id: 'trends',
    label: 'Temporal Trends',
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: 'flows',
    label: 'Inter-Zone Flows',
    icon: <GitBranch className="w-4 h-4" />,
  },
  {
    id: 'dwell',
    label: 'Dwell & Sensors',
    icon: <Layers className="w-4 h-4" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  timeRange,
  setTimeRange,
  isSimulating,
  setIsSimulating,
  onOpenAi,
  onOpenAlerts,
  onOpenDataModal,
  onOpenLiveStream,
  unreadAlertCount,
  lastUpdated,
  onRefresh,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  liveOccupancy,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900/95 border-r border-slate-800/90 backdrop-blur-xl transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
          isMobileOpen
            ? 'translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* 1. Header & Brand Identity */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Animated Logo Shield */}
            <div className="relative shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-xl tracking-wider">
              BIT
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
            </div>

            {/* Title / Subtitle (hidden when collapsed on desktop) */}
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-slate-100 tracking-tight truncate">
                    BIT Sathy
                  </h1>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate" title="Bannari Amman Institute of Technology">
                  Bannari Amman Inst.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Occupancy Metric Strip (expanded only) */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-4 py-2.5 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-xs text-slate-300 font-medium">Live On-Campus:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-cyan-300 tracking-wide font-mono">
                {liveOccupancy.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">pax</span>
            </div>
          </div>
        )}

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Navigation Views */}
          <div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Views & Sections</span>
                <Activity className="w-3 h-3 text-slate-500" />
              </div>
            )}
            <nav className="space-y-1" aria-label="Sidebar navigation">
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (isMobileOpen) setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                    } ${isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''}`}
                    title={tab.label}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {tab.icon}
                    </span>
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="flex-1 text-left truncate">{tab.label}</span>
                    )}
                    {(!isCollapsed || isMobileOpen) && tab.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 3. TIMEFRAME SELECTOR (Highlighted Request) */}
          <div className="pt-2 border-t border-slate-800/70">
            {(!isCollapsed || isMobileOpen) ? (
              <div className="px-2 mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300/90 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>Timeframe Horizon</span>
                </span>
                <span className="text-[10px] font-medium text-slate-500">Filter</span>
              </div>
            ) : (
              <div className="flex justify-center mb-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}

            <div className="space-y-1.5">
              {TIMEFRAME_OPTIONS.map((opt) => {
                const isSelected = timeRange === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTimeRange(opt.id)}
                    className={`w-full group text-left rounded-xl transition-all ${
                      isCollapsed && !isMobileOpen
                        ? 'p-2 flex justify-center'
                        : 'px-3 py-2 flex items-center justify-between gap-2.5'
                    } ${
                      isSelected
                        ? 'bg-indigo-950/70 border border-indigo-500/50 shadow-sm shadow-indigo-950/40 text-white'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 text-slate-300 hover:text-white'
                    }`}
                    title={`${opt.label}: ${opt.desc}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0">{opt.icon}</span>
                      {(!isCollapsed || isMobileOpen) && (
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate leading-tight">
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span
                                className={`text-[9px] px-1 rounded leading-none py-0.5 font-medium ${
                                  isSelected
                                    ? 'bg-indigo-500/30 text-indigo-200'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                            {opt.desc}
                          </p>
                        </div>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && isSelected && (
                      <span className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 text-white shadow">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>


          {/* 5. Quick Tools & Utilities */}
          <div className="pt-2 border-t border-slate-800/70 space-y-1.5">
            {/* Live Camera & CCTV Stream Ingestion */}
            <button
              id="btn-sidebar-live-stream"
              type="button"
              onClick={onOpenLiveStream}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-200 hover:text-white transition group ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="Connect Live Camera & CCTV Stream"
            >
              <div className="relative shrink-0">
                <Video className="w-4 h-4 text-emerald-400 group-hover:animate-pulse" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 text-left min-w-0">
                  <div className="text-xs font-semibold leading-tight truncate">Live CCTV / Camera</div>
                  <div className="text-[10px] text-emerald-300/70 truncate">Optical People Counter</div>
                </div>
              )}
            </button>

            {/* AI Advisor Trigger Button */}
            <button
              id="btn-sidebar-ai-advisor"
              type="button"
              onClick={onOpenAi}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="Launch Gemini Campus AI Analyst"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <div className="flex-1 text-left">
                  <span className="block leading-none">Campus AI Analyst</span>
                  <span className="text-[9px] text-cyan-100/80 font-normal">
                    Gemini 3.8 Telemetry Brief
                  </span>
                </div>
              )}
            </button>

            {/* Alerts Center */}
            <button
              id="btn-sidebar-alerts"
              type="button"
              onClick={onOpenAlerts}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="View Incident Alerts & Sensor Inventory"
            >
              <div className="relative shrink-0">
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <>
                  <span className="flex-1 text-left text-xs font-semibold">
                    Incident Alerts
                  </span>
                  {unreadAlertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                      {unreadAlertCount} active
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Data Management Modal */}
            <button
              id="btn-sidebar-data-io"
              type="button"
              onClick={onOpenDataModal}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition ${
                isCollapsed && !isMobileOpen ? 'justify-center px-2' : ''
              }`}
              title="Import or Export Footfall Telemetry Data"
            >
              <Download className="w-4 h-4 text-slate-400 shrink-0" />
              {(!isCollapsed || isMobileOpen) && (
                <span className="flex-1 text-left text-xs font-semibold">
                  Data I/O & CSV Export
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 6. Footer & Stream State */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-2">
              {/* Telemetry Stream Toggle */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-300">
                    {isSimulating ? 'Realtime Ingestion Active' : 'Realtime Ingestion Paused'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                    isSimulating
                      ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSimulating ? 'Pause' : 'Resume'}
                </button>
              </div>

              {/* Status & Sync Time */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="flex items-center gap-1 hover:text-slate-300 transition"
                  title="Force telemetry refresh"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Sync</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
                title={isSimulating ? 'Realtime Ingestion Active' : 'Realtime Ingestion Paused'}
              >
                <Radio
                  className={`w-4 h-4 ${
                    isSimulating ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
                  }`}
                />
              </button>
              <button
                type="button"
                onClick={onRefresh}
                className="p-2 rounded-lg text-slate-400 hover:text-white"
                title="Force sync"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
