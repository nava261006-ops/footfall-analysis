import React from 'react';
import { Clock, Users, PieChart as PieIcon, Radio } from 'lucide-react';
import { DwellDistribution } from '../types';

interface DwellAndDemographicsProps {
  dwellData: DwellDistribution[];
}

export const DwellAndDemographics: React.FC<DwellAndDemographicsProps> = ({
  dwellData,
}) => {
  const cohorts = [
    { label: 'Undergraduate Students', count: 12450, percent: 67.6, color: '#6366f1' },
    { label: 'Postgraduate & PhD Scholars', count: 3210, percent: 17.4, color: '#06b6d4' },
    { label: 'Faculty & Research Staff', count: 1680, percent: 9.1, color: '#10b981' },
    { label: 'Visitors, Vendors & Guests', count: 1080, percent: 5.9, color: '#f59e0b' },
  ];

  const sensorBreakdown = [
    { type: 'RFID Badge Turnstiles', count: 14200, percent: 77.1, desc: 'Perimeter gates & Library turnstiles' },
    { type: 'CCTV AI Optical Counters', count: 12850, percent: 69.8, desc: 'Cafeteria, SAC & Concourse doorways' },
    { type: 'WiFi AP Probe Signals', count: 16900, percent: 91.7, desc: 'Campus-wide Aruba enterprise network' },
    { type: 'BLE Proximity Beacons', count: 3400, percent: 18.5, desc: 'Specialized Innovation Labs & Studios' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Dwell Duration Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Dwell Time Distribution</h3>
            <p className="text-xs text-slate-400">Duration spent by visitors inside specific facilities</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {dwellData.map((item, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-200">{item.category}</span>
                <span className="font-bold text-purple-400">{item.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                <div
                  className="bg-purple-500 h-full rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 flex justify-between">
                <span>Typical: {item.typicalZones}</span>
                <span>{item.count.toLocaleString()} visits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Campus Cohort Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Campus Cohort Breakdown</h3>
            <p className="text-xs text-slate-400">Segment distribution detected via digital credentials</p>
          </div>
        </div>

        <div className="space-y-3">
          {cohorts.map((cohort, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-300">{cohort.label}</span>
                <span className="font-bold text-slate-100">{cohort.count.toLocaleString()} ({cohort.percent}%)</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${cohort.percent}%`, backgroundColor: cohort.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200">
          💡 <strong>Analytics Note:</strong> Undergraduates generate 78% of peak cafeteria rush between 12:45-13:30.
        </div>
      </div>

      {/* 3. Multi-Sensor Data Fusion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Sensor Network Fusion</h3>
            <p className="text-xs text-slate-400">IoT sensor telemetry feeds & correlation</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {sensorBreakdown.map((sensor, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">{sensor.type}</span>
                <span className="text-teal-400 font-bold">{sensor.percent}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{sensor.desc}</p>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>Daily captures: {sensor.count.toLocaleString()}</span>
                <span className="text-emerald-400">Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
