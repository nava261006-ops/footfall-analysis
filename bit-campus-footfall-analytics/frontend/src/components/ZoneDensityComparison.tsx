import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Filter, ArrowUpDown, AlertTriangle, ExternalLink } from 'lucide-react';
import { CampusZone } from '../types';

interface ZoneDensityComparisonProps {
  zones: CampusZone[];
  onSelectZone: (zone: CampusZone) => void;
}

export const ZoneDensityComparison: React.FC<ZoneDensityComparisonProps> = ({
  zones,
  onSelectZone,
}) => {
  const [sortBy, setSortBy] = useState<'occupancy' | 'count' | 'dwell'>('occupancy');

  const sortedZones = [...zones].sort((a, b) => {
    if (sortBy === 'occupancy') return b.occupancyPercent - a.occupancyPercent;
    if (sortBy === 'count') return b.currentCount - a.currentCount;
    return b.avgDwellMinutes - a.avgDwellMinutes;
  });

  const getBarColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 75) return '#f59e0b';
    if (percent >= 50) return '#06b6d4';
    return '#10b981';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Zone Capacity & Density Comparison
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {zones.length} Monitored Facilities
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time occupancy threshold levels against physical capacity limits
          </p>
        </div>

        {/* Sorting options */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 hidden sm:inline">Sort:</span>
          <button
            type="button"
            onClick={() => setSortBy('occupancy')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              sortBy === 'occupancy'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Occupancy %
          </button>
          <button
            type="button"
            onClick={() => setSortBy('count')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              sortBy === 'count'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Headcount
          </button>
          <button
            type="button"
            onClick={() => setSortBy('dwell')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              sortBy === 'dwell'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Avg Dwell
          </button>
        </div>
      </div>

      {/* Density Bar Visualization */}
      <div className="space-y-2.5">
        {sortedZones.map((zone) => {
          const isCritical = zone.occupancyPercent >= 90;
          const isHigh = zone.occupancyPercent >= 75 && !isCritical;

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone)}
              className="group p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200 group-hover:text-indigo-300 transition flex items-center gap-1.5">
                    {zone.name}
                    <ExternalLink className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                  <span className="text-slate-500 text-[11px]">({zone.code})</span>
                  {isCritical && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20 animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" /> Bottleneck
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    <strong className="text-slate-100 font-bold">
                      {zone.currentCount.toLocaleString()}
                    </strong>{' '}
                    / {zone.capacity.toLocaleString()}
                  </span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isHigh
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {zone.occupancyPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with 80% and 95% threshold tick marks */}
              <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(zone.occupancyPercent, 100)}%`,
                    backgroundColor: getBarColor(zone.occupancyPercent),
                  }}
                />
              </div>

              {/* Auxiliary Sub-Stats: Ingress, Egress, Dwell */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <div className="flex items-center gap-3">
                  <span>
                    Ingress: <strong className="text-emerald-400">+{zone.ingressCount}</strong>
                  </span>
                  <span>
                    Egress: <strong className="text-rose-400">-{zone.egressCount}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>
                    Avg Dwell: <strong className="text-slate-200">{zone.avgDwellMinutes}m</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Peak: <strong className="text-indigo-300">{zone.peakHour.split(' - ')[0]}</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
