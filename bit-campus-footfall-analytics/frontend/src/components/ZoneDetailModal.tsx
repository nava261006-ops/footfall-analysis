import React from 'react';
import {
  X,
  Users,
  Clock,
  ArrowDownUp,
  Radio,
  Cpu,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { CampusZone } from '../types';

interface ZoneDetailModalProps {
  zone: CampusZone | null;
  onClose: () => void;
  onAskAi: (prompt: string) => void;
}

export const ZoneDetailModal: React.FC<ZoneDetailModalProps> = ({
  zone,
  onClose,
  onAskAi,
}) => {
  if (!zone) return null;

  const isCritical = zone.occupancyPercent >= 90;
  const isHigh = zone.occupancyPercent >= 75 && !isCritical;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {zone.code}
              </span>
              <span className="text-xs text-slate-400 capitalize">{zone.category} Facility</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{zone.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{zone.description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Status banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
              isCritical
                ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                : isHigh
                ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {isCritical ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : isHigh ? (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>
                Status:{' '}
                {isCritical
                  ? 'Severe Bottleneck / Near Capacity'
                  : isHigh
                  ? 'Elevated Traffic Density'
                  : 'Normal Operating Conditions'}
              </span>
            </div>
            <span className="font-bold text-sm">{zone.occupancyPercent.toFixed(1)}%</span>
          </div>

          {/* Metric Quad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Current Headcount
              </span>
              <div className="text-xl font-bold text-slate-100">
                {zone.currentCount.toLocaleString()}{' '}
                <span className="text-xs text-slate-500 font-normal">
                  / {zone.capacity.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(zone.occupancyPercent, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Average Dwell Time
              </span>
              <div className="text-xl font-bold text-slate-100">{zone.avgDwellMinutes} min</div>
              <div className="mt-1 text-[11px] text-slate-400">
                Peak Time: <strong className="text-slate-200">{zone.peakHour}</strong>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Turnstile Ingress
              </span>
              <div className="text-lg font-bold text-emerald-400">
                +{zone.ingressCount.toLocaleString()} entries
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Today cumulative</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Turnstile Egress
              </span>
              <div className="text-lg font-bold text-rose-400">
                -{zone.egressCount.toLocaleString()} exits
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Today cumulative</div>
            </div>
          </div>

          {/* Sensor Coverage */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-400" />
                Active IoT Sensors ({zone.sensorsActive} nodes)
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">100% Online</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {zone.sensorTypes.map((type, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-slate-700"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-200">
            <strong className="block text-indigo-300 font-semibold mb-1">
              Facility Action Recommendation:
            </strong>
            {isCritical
              ? 'Overcapacity alert: Re-route incoming students toward alternative facilities and deploy extra service attendants.'
              : isHigh
              ? 'Monitor turnstile queue velocity; schedule HVAC chillers for elevated heat-load management.'
              : 'Zone running at optimal occupancy. Regular cleaning & patrol intervals recommended.'}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onAskAi(`Provide targeted footfall optimization strategies for ${zone.name} (${zone.code}).`);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI About This Facility</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
