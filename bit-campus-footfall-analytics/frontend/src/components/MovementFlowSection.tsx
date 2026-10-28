import React, { useState } from 'react';
import {
  ArrowRight,
  GitCommit,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { InterZoneFlow, DayOfWeekDataPoint } from '../types';

interface MovementFlowSectionProps {
  flows: InterZoneFlow[];
  dayData: DayOfWeekDataPoint[];
}

export const MovementFlowSection: React.FC<MovementFlowSectionProps> = ({
  flows,
  dayData,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');

  const uniqueOrigins = ['all', ...Array.from(new Set(flows.map((f) => f.source)))];

  const filteredFlows =
    selectedOrigin === 'all'
      ? flows
      : flows.filter((f) => f.source === selectedOrigin);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Inter-Zone Transition Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              Inter-Facility Transition Flows
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Directional crowd migration paths detected across optical & WiFi sensors
            </p>
          </div>

          {/* Origin filter */}
          <select
            value={selectedOrigin}
            onChange={(e) => setSelectedOrigin(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            {uniqueOrigins.map((orig) => (
              <option key={orig} value={orig}>
                {orig === 'all' ? 'All Origin Zones' : `From: ${orig}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredFlows.map((flow, index) => (
            <div
              key={index}
              className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-slate-200 truncate">{flow.source}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="font-semibold text-cyan-300 truncate">{flow.target}</span>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${Math.min(flow.percentage * 1.5, 100)}%` }}
                  />
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-100">{flow.volume.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {flow.percentage}% of exits
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Day-of-Week Trend & Academic Rhythm */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Day-of-Week Traffic Patterns
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Weekday academic peak load vs weekend residential migration
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {dayData.map((d) => {
            const isToday = d.day === 'Monday'; // Default benchmark
            const maxFootfall = 22000;
            const fillPercent = (d.footfall / maxFootfall) * 100;

            return (
              <div
                key={d.day}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  isToday
                    ? 'bg-indigo-950/40 border-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{d.day}</span>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                        Current Day
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">
                      Top: <strong className="text-slate-200">{d.topCongestedZone}</strong>
                    </span>
                    <span className="font-bold text-slate-100">
                      {d.footfall.toLocaleString()} entries
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      d.day === 'Saturday' || d.day === 'Sunday'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Peak Occupancy: {d.peakOccupancy.toLocaleString()} concurrent</span>
                  <span>Avg Dwell: {d.avgDwellMinutes}m</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
