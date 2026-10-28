import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Clock, Calendar, Sparkles } from 'lucide-react';
import { HourlyDataPoint } from '../types';

interface HourlyTrendChartProps {
  data: HourlyDataPoint[];
}

export const HourlyTrendChart: React.FC<HourlyTrendChartProps> = ({ data }) => {
  const [metricView, setMetricView] = useState<'footfall' | 'flow'>('footfall');

  // Find peak point
  const peakData = [...data].sort((a, b) => b.todayFootfall - a.todayFootfall)[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100">
              Hourly Footfall Velocity & Movement Flow
            </h3>
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              <Sparkles className="w-3 h-3" />
              6h Predictive Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Temporal distribution of entries, exits, and forecast bottlenecks across campus turnstiles
          </p>
        </div>

        {/* View Switch */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setMetricView('footfall')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              metricView === 'footfall'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Footfall Volume
          </button>
          <button
            type="button"
            onClick={() => setMetricView('flow')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              metricView === 'flow'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ingress vs Egress
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metricView === 'footfall' ? (
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(value: any, name: string) => [
                  Number(value).toLocaleString(),
                  name === 'todayFootfall'
                    ? "Today's Footfall"
                    : name === 'yesterdayFootfall'
                    ? 'Yesterday'
                    : name === 'sevenDayAvg'
                    ? '7-Day Baseline'
                    : 'Predictive Forecast',
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => {
                  if (value === 'todayFootfall') return "Today's Telemetry";
                  if (value === 'yesterdayFootfall') return 'Yesterday';
                  if (value === 'sevenDayAvg') return '7-Day Baseline';
                  if (value === 'forecast') return 'Predicted Outlook';
                  return value;
                }}
              />

              {/* Peak indicator */}
              {peakData && (
                <ReferenceLine
                  x={peakData.hour}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: `Peak: ${peakData.todayFootfall.toLocaleString()}`,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
              )}

              {/* Areas & Lines */}
              <Area
                type="monotone"
                dataKey="todayFootfall"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#todayGradient)"
                name="todayFootfall"
              />
              <Line
                type="monotone"
                dataKey="yesterdayFootfall"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="yesterdayFootfall"
              />
              <Line
                type="monotone"
                dataKey="sevenDayAvg"
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
                name="sevenDayAvg"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#06b6d4' }}
                name="forecast"
              />
            </ComposedChart>
          ) : (
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="ingress" fill="#10b981" name="Turnstile Ingress (+)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="egress" fill="#f43f5e" name="Turnstile Egress (-)" radius={[3, 3, 0, 0]} />
              <Line
                type="monotone"
                dataKey="netFlow"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="Net Campus Influx"
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Analytical Callouts Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Primary Rush: <strong className="text-slate-200">12:30 - 14:00</strong> (Lunch & Class change)
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Morning Ingress Influx: <strong className="text-emerald-300">5,800/hr</strong> at 09:00 AM
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Evening Exodus Shift: <strong className="text-cyan-300">16:30 - 18:00</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
