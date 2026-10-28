import React from 'react';
import {
  Users,
  Activity,
  AlertTriangle,
  Clock,
  ArrowDownUp,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { CampusZone } from '../types';

interface KpiMetricsProps {
  zones: CampusZone[];
  totalCumulativeFootfall: number;
  liveOccupancy: number;
  onSelectZone: (zone: CampusZone) => void;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({
  zones,
  totalCumulativeFootfall,
  liveOccupancy,
  onSelectZone,
}) => {
  // Find highest density zone
  const highestDensityZone = [...zones].sort(
    (a, b) => b.occupancyPercent - a.occupancyPercent
  )[0];

  // Calculate weighted average dwell time
  const totalCount = zones.reduce((acc, z) => acc + z.currentCount, 0);
  const weightedDwell =
    totalCount > 0
      ? Math.round(
          zones.reduce((acc, z) => acc + z.avgDwellMinutes * z.currentCount, 0) /
            totalCount
        )
      : 65;

  const totalIngress = zones.reduce((acc, z) => acc + z.ingressCount, 0);
  const totalEgress = zones.reduce((acc, z) => acc + z.egressCount, 0);
  const netRate = totalIngress - totalEgress;

  const totalSensors = zones.reduce((acc, z) => acc + z.sensorsActive, 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Daily Footfall */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Total Footfall</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {totalCumulativeFootfall.toLocaleString()}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
          <TrendingUp className="w-3 h-3" />
          <span>+8.4% vs 7-day avg</span>
        </div>
      </div>

      {/* 2. Live Active Occupancy */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Live On-Campus</span>
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {liveOccupancy.toLocaleString()}
        </div>
        <div className="mt-1.5 text-[11px] text-slate-400 font-medium">
          <span className="text-cyan-300 font-semibold">
            {Math.round((liveOccupancy / 18000) * 100)}%
          </span>{' '}
          of campus capacity
        </div>
      </div>

      {/* 3. Critical Peak Bottleneck */}
      <div
        onClick={() => highestDensityZone && onSelectZone(highestDensityZone)}
        className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3.5 sm:p-4 hover:border-amber-400 transition cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-amber-300">
            Peak Bottleneck
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-base sm:text-lg font-bold text-slate-100 truncate tracking-tight">
          {highestDensityZone?.name || 'Central Cafeteria'}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20">
            {highestDensityZone?.occupancyPercent.toFixed(1)}% Capacity
          </span>
        </div>
      </div>

      {/* 4. Average Campus Dwell Time */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Dwell Time</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {Math.floor(weightedDwell / 60)}h {weightedDwell % 60}m
        </div>
        <div className="mt-1.5 text-[11px] text-slate-400">
          Library top: <span className="text-purple-300 font-semibold">2h 25m</span>
        </div>
      </div>

      {/* 5. Net Movement Velocity */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Net Movement Influx</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowDownUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {netRate > 0 ? `+${netRate.toLocaleString()}` : netRate.toLocaleString()}
        </div>
        <div className="mt-1.5 text-[11px] text-emerald-400 font-medium">
          Active flow into facilities
        </div>
      </div>

      {/* 6. Active IoT Sensor Array */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">Sensor Array</span>
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Cpu className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          {totalSensors} <span className="text-xs text-slate-400 font-normal">Active</span>
        </div>
        <div className="mt-1.5 text-[11px] text-teal-400 font-medium">
          98.6% reading accuracy
        </div>
      </div>
    </div>
  );
};
