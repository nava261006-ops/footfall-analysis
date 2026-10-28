import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_ZONES,
  HOURLY_DATA,
  DAY_OF_WEEK_DATA,
  INTER_ZONE_FLOWS,
  DWELL_DISTRIBUTION,
  RECENT_ALERTS,
  SENSOR_INVENTORY,
} from './data/campusData';
import {
  CampusZone,
  ZoneStatus,
  TimeRangeOption,
  IncidentAlert,
  HourlyDataPoint,
} from './types';
import { Sidebar, DashboardViewTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { KpiMetrics } from './components/KpiMetrics';
import { CampusMap } from './components/CampusMap';
import { HourlyTrendChart } from './components/HourlyTrendChart';
import { ZoneDensityComparison } from './components/ZoneDensityComparison';
import { MovementFlowSection } from './components/MovementFlowSection';
import { DwellAndDemographics } from './components/DwellAndDemographics';
import { AiAnalyticsPanel } from './components/AiAnalyticsPanel';
import { ZoneDetailModal } from './components/ZoneDetailModal';
import { AlertsAndSensorsModal } from './components/AlertsAndSensorsModal';
import { DataManagementModal } from './components/DataManagementModal';
import { LiveStreamModal } from './components/LiveStreamModal';
import { LoginPage } from './components/LoginPage';
import {
  Sparkles,
  LayoutDashboard,
  MapPin,
  TrendingUp,
  GitBranch,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

export default function App() {
  const [zones, setZones] = useState<CampusZone[]>(INITIAL_ZONES);
  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>(HOURLY_DATA);
  const [alerts, setAlerts] = useState<IncidentAlert[]>(RECENT_ALERTS);
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('today');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState<DashboardViewTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active inspectors & modals
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isLiveStreamOpen, setIsLiveStreamOpen] = useState<boolean>(false);
  const [liveStreamAiQuery, setLiveStreamAiQuery] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name: string;
    role: 'student' | 'faculty' | 'admin';
    picture?: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('bit_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogin = (user: {
    email: string;
    name: string;
    role: 'student' | 'faculty' | 'admin';
    picture?: string;
  }) => {
    setCurrentUser(user);
    localStorage.setItem('bit_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bit_current_user');
  };

  // Filter multiplier based on time range scenario (Exam Week vs Fest Week etc.)
  const adjustedZones = useMemo(() => {
    return zones.map((zone) => {
      let multiplier = 1.0;
      if (timeRange === 'exam_week') {
        if (zone.category === 'library') multiplier = 1.12;
        if (zone.category === 'tech') multiplier = 1.08;
        if (zone.category === 'recreation') multiplier = 0.55;
      } else if (timeRange === 'fest_week') {
        if (zone.category === 'recreation' || zone.category === 'outdoor') multiplier = 1.6;
        if (zone.category === 'academic') multiplier = 0.6;
      }

      const newCount = Math.min(Math.round(zone.currentCount * multiplier), zone.capacity);
      const newPercent = Number(((newCount / zone.capacity) * 100).toFixed(1));

      return {
        ...zone,
        currentCount: newCount,
        occupancyPercent: newPercent,
        status: (newPercent >= 90
          ? 'critical'
          : newPercent >= 75
          ? 'high'
          : newPercent >= 50
          ? 'moderate'
          : 'safe') as ZoneStatus,
      };
    });
  }, [zones, timeRange]);

  // Filtered zones based on quick search query
  const displayZones = useMemo(() => {
    if (!searchQuery.trim()) return adjustedZones;
    const q = searchQuery.toLowerCase().trim();
    return adjustedZones.filter(
      (z) =>
        z.name.toLowerCase().includes(q) ||
        z.code.toLowerCase().includes(q) ||
        z.category.toLowerCase().includes(q)
    );
  }, [adjustedZones, searchQuery]);

  // Total Campus Footfall & Live Occupancy calculation
  const totalCumulativeFootfall = useMemo(() => {
    return adjustedZones.reduce((acc, z) => acc + z.ingressCount, 0);
  }, [adjustedZones]);

  const liveOccupancy = useMemo(() => {
    return adjustedZones.reduce((acc, z) => acc + z.currentCount, 0);
  }, [adjustedZones]);

  // Realtime telemetry flux stream (updates zone footfall with active sensor fluctuations)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setZones((prev) =>
        prev.map((zone) => {
          // 40% chance of small flux
          if (Math.random() > 0.4) return zone;

          const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
          const updatedCount = Math.max(10, Math.min(zone.capacity, zone.currentCount + delta));
          const updatedPercent = Number(((updatedCount / zone.capacity) * 100).toFixed(1));

          return {
            ...zone,
            currentCount: updatedCount,
            occupancyPercent: updatedPercent,
            ingressCount: delta > 0 ? zone.ingressCount + delta : zone.ingressCount,
            egressCount: delta < 0 ? zone.egressCount + Math.abs(delta) : zone.egressCount,
            trend: delta > 1 ? 'rising' : delta < -1 ? 'falling' : 'stable',
            status: (updatedPercent >= 90
              ? 'critical'
              : updatedPercent >= 75
              ? 'high'
              : updatedPercent >= 50
              ? 'moderate'
              : 'safe') as ZoneStatus,
          };
        })
      );
      setLastUpdated(new Date());
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handle alert acknowledgement
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  // Reset to benchmark
  const handleResetData = () => {
    setZones(INITIAL_ZONES);
    setHourlyData(HOURLY_DATA);
    setAlerts(RECENT_ALERTS);
    setSelectedZone(null);
    setSearchQuery('');
    setLastUpdated(new Date());
  };

  // Handle live optical stream count increments from camera/CCTV
  const handleSyncLiveCount = (zoneId: string, ingressDelta: number, egressDelta: number) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id !== zoneId) return z;
        const newIngress = z.ingressCount + ingressDelta;
        const newEgress = z.egressCount + egressDelta;
        const newCount = Math.max(0, Math.min(z.capacity, z.currentCount + ingressDelta - egressDelta));
        const newPercent = Number(((newCount / z.capacity) * 100).toFixed(1));
        return {
          ...z,
          currentCount: newCount,
          ingressCount: newIngress,
          egressCount: newEgress,
          occupancyPercent: newPercent,
          status: (newPercent >= 90
            ? 'critical'
            : newPercent >= 75
            ? 'high'
            : newPercent >= 50
            ? 'moderate'
            : 'safe') as ZoneStatus,
        };
      })
    );
    setLastUpdated(new Date());
  };

  const unreadAlerts = alerts.filter((a) => a.status !== 'resolved').length;

  // Render Login Page if not signed in
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 1. Professional Side Navigation Bar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        onOpenAi={() => setIsAiOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenLiveStream={() => setIsLiveStreamOpen(true)}
        unreadAlertCount={unreadAlerts}
        lastUpdated={lastUpdated}
        onRefresh={() => setLastUpdated(new Date())}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        liveOccupancy={liveOccupancy}
      />

      {/* 2. Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Top Header Bar */}
        <TopHeader
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          activeTab={activeTab}
          timeRange={timeRange}
          isSimulating={isSimulating}
          setIsSimulating={setIsSimulating}
          onOpenAi={() => setIsAiOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          onOpenLiveStream={() => setIsLiveStreamOpen(true)}
          unreadAlertCount={unreadAlerts}
          lastUpdated={lastUpdated}
          onRefresh={() => setLastUpdated(new Date())}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dashboard Main Workspace */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
          {/* View Filter Pill Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {(
                [
                  { id: 'overview', label: 'All Dashboard Sections', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
                  { id: 'map', label: 'Campus Spatial Map', icon: <MapPin className="w-3.5 h-3.5" /> },
                  { id: 'trends', label: 'Temporal Trends & Ranking', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                  { id: 'flows', label: 'Inter-Zone Movement Flows', icon: <GitBranch className="w-3.5 h-3.5" /> },
                  { id: 'dwell', label: 'Dwell & Cohort Analytics', icon: <Layers className="w-3.5 h-3.5" /> },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setActiveTab(chip.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === chip.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {chip.icon}
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Quick Context Summary */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>{displayZones.length} Zones Monitored</span>
              </span>
              <span>•</span>
              <span className="font-mono text-cyan-300 font-semibold">
                {totalCumulativeFootfall.toLocaleString()} Cumulative Daily Ingress
              </span>
            </div>
          </div>

          {/* Search Active Filter Banner */}
          {searchQuery && (
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-2 text-xs text-indigo-200">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Filtering campus zones matching <strong className="text-white font-mono">"{searchQuery}"</strong> ({displayZones.length} match{displayZones.length === 1 ? '' : 'es'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold text-[11px]"
              >
                Clear Search
              </button>
            </div>
          )}


          {/* 1. Core Key Performance Indicator Cards (Shown in 'overview' or 'trends') */}
          {(activeTab === 'overview' || activeTab === 'trends') && (
            <section aria-label="Campus Footfall KPIs">
              <KpiMetrics
                zones={displayZones}
                totalCumulativeFootfall={totalCumulativeFootfall}
                liveOccupancy={liveOccupancy}
                onSelectZone={(zone) => setSelectedZone(zone)}
              />
            </section>
          )}

          {/* 2. Interactive 2D Architectural Campus Heatmap (Shown in 'overview' or 'map') */}
          {(activeTab === 'overview' || activeTab === 'map') && (
            <section aria-label="Spatial Campus Heatmap">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>2D Spatial Campus Density Heatmap</span>
                </h3>
                <span className="text-[11px] text-slate-500">Interactive zone floor plans • Click any zone to inspect</span>
              </div>
              <CampusMap
                zones={displayZones}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
              />
            </section>
          )}

          {/* 3. Temporal Footfall Trends & Zone Capacity Comparison (Shown in 'overview' or 'trends') */}
          {(activeTab === 'overview' || activeTab === 'trends') && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 cols: Hourly Trend & Forecasting */}
              <div className="lg:col-span-7">
                <HourlyTrendChart data={hourlyData} />
              </div>

              {/* Right 5 cols: Zone Capacity & Density Ranking */}
              <div className="lg:col-span-5">
                <ZoneDensityComparison
                  zones={displayZones}
                  onSelectZone={(zone) => setSelectedZone(zone)}
                />
              </div>
            </section>
          )}

          {/* 4. Movement Flows & Day-of-Week Patterns (Shown in 'overview' or 'flows') */}
          {(activeTab === 'overview' || activeTab === 'flows') && (
            <section aria-label="Inter-Zone Movement Flows">
              <MovementFlowSection
                flows={INTER_ZONE_FLOWS}
                dayData={DAY_OF_WEEK_DATA}
              />
            </section>
          )}

          {/* 5. Dwell Time Distribution & Multi-Sensor Fusion (Shown in 'overview' or 'dwell') */}
          {(activeTab === 'overview' || activeTab === 'dwell') && (
            <section aria-label="Dwell & Sensor Analytics">
              <DwellAndDemographics dwellData={DWELL_DISTRIBUTION} />
            </section>
          )}
        </main>

        {/* Executive Footer */}
        <footer className="mt-12 border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">BIT Campus Analytics Engine</span>
              <span>•</span>
              <span>Multi-Sensor IoT Telemetry & Gemini 3.8 Flash AI</span>
            </div>
            <div>
              Bannari Amman Institute of Technology (BIT Sathy) • Spatial Operations & Facility Analytics Suite
            </div>
          </div>
        </footer>
      </div>

      {/* Modals & AI Drawer Panels */}
      <ZoneDetailModal
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onAskAi={(query) => {
          setIsAiOpen(true);
        }}
      />

      <AiAnalyticsPanel
        zones={adjustedZones}
        liveOccupancy={liveOccupancy}
        totalFootfall={totalCumulativeFootfall}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      <AlertsAndSensorsModal
        alerts={alerts}
        sensors={SENSOR_INVENTORY}
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      <DataManagementModal
        zones={adjustedZones}
        hourlyData={hourlyData}
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onResetData={handleResetData}
        onImportCsv={(imported) => setZones(imported)}
      />

      <LiveStreamModal
        isOpen={isLiveStreamOpen}
        onClose={() => setIsLiveStreamOpen(false)}
        zones={adjustedZones}
        onSyncLiveCount={handleSyncLiveCount}
        onOpenAiWithPrompt={(customPrompt) => {
          setIsLiveStreamOpen(false);
          setIsAiOpen(true);
        }}
      />
    </div>
  );
}
