import React, { useState } from 'react';
import {
  Layers,
  Maximize2,
  Navigation,
  Eye,
  AlertCircle,
  Wifi,
  Video,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Compass,
} from 'lucide-react';
import { CampusZone } from '../types';

interface CampusMapProps {
  zones: CampusZone[];
  selectedZone: CampusZone | null;
  onSelectZone: (zone: CampusZone) => void;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  zones,
  selectedZone,
  onSelectZone,
}) => {
  const [activeLayer, setActiveLayer] = useState<'density' | 'flow' | 'sensors'>('density');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Status color mapper
  const getStatusColor = (percent: number) => {
    if (percent >= 90) return { bg: '#ef4444', border: '#dc2626', text: 'text-rose-400', label: 'Critical' };
    if (percent >= 75) return { bg: '#f59e0b', border: '#d97706', text: 'text-amber-400', label: 'High' };
    if (percent >= 50) return { bg: '#06b6d4', border: '#0891b2', text: 'text-cyan-400', label: 'Moderate' };
    return { bg: '#10b981', border: '#059669', text: 'text-emerald-400', label: 'Safe' };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Map Control Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Bannari Amman Institute of Technology
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                BIT Sathy Spatial Telemetry
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 2D spatial density mapping across the 181-acre campus & Bhavani corridor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer toggles */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveLayer('density')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeLayer === 'density'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Density Heat
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('flow')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeLayer === 'flow'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Movement Vectors
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer('sensors')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeLayer === 'sensors'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sensor Nodes
            </button>
          </div>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={() => setZoomLevel(zoomLevel === 1 ? 1.15 : 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Toggle zoom factor"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px',
          }}
        />

        <div
          className="w-full h-full transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg
            viewBox="0 0 1000 650"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Radial gradient glow for high density alerts */}
              <radialGradient id="alertGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="highGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Arrow Marker for Flow Vectors */}
              <marker
                id="flowArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" />
              </marker>

              {/* Pattern for pathway roads */}
              <pattern id="campusPathway" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="10" x2="20" y2="10" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />
              </pattern>
            </defs>

            {/* Campus Internal Pathways / Walkway Concourse */}
            <g id="campus-arteries" opacity="0.6">
              {/* North Gate to Quad and Academic Concourse */}
              <path
                d="M 480 80 L 480 280 L 320 280 L 320 450 L 500 450 L 500 560"
                fill="none"
                stroke="#1e293b"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 480 80 L 480 280 L 640 280 L 640 450 L 500 450 L 500 560"
                fill="none"
                stroke="#1e293b"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 640 280 L 860 280 L 860 440"
                fill="none"
                stroke="#1e293b"
                strokeWidth="24"
                strokeLinecap="round"
              />
              <path
                d="M 320 450 L 860 450"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
                strokeDasharray="6,6"
              />
              <path
                d="M 480 80 L 480 560"
                fill="none"
                stroke="#334155"
                strokeWidth="4"
                strokeDasharray="6,6"
              />
            </g>

            {/* Central Quad Lawn Area Outline */}
            <rect
              x="370"
              y="415"
              width="280"
              height="130"
              rx="18"
              fill="#064e3b"
              fillOpacity="0.25"
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            <text x="510" y="482" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="600" opacity="0.75">
              Bhavani Riverfront Quadrangle & OAT Lawns
            </text>

            {/* Inter-Zone Movement Flow Vectors (When Flow Layer is Active) */}
            {activeLayer === 'flow' && (
              <g id="flow-vectors">
                {/* Main Arch Gate -> IB Block */}
                <path
                  d="M 500 85 Q 350 140 210 330"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                  className="animate-pulse"
                />
                {/* Main Arch Gate -> Learning Centre */}
                <path
                  d="M 510 85 L 510 160"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
                {/* IB Block -> Food Court */}
                <path
                  d="M 340 330 L 410 330"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
                {/* Food Court -> Sunflower Mech Block */}
                <path
                  d="M 645 330 L 715 330"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="3.5"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
                {/* Food Court -> Riverfront Quad */}
                <path
                  d="M 510 400 L 510 440"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
                {/* Riverfront Quad -> Indoor Stadium */}
                <path
                  d="M 645 490 L 715 490"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
                {/* Quad -> Gents Hostels */}
                <path
                  d="M 560 540 Q 640 560 700 580"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="6,4"
                  markerEnd="url(#flowArrow)"
                />
              </g>
            )}

            {/* Campus Zones (Buildings & Entrances) */}
            {zones.map((zone) => {
              const svgX = (zone.x / 100) * 1000;
              const svgY = (zone.y / 100) * 650;
              const svgW = (zone.width / 100) * 1000;
              const svgH = (zone.height / 100) * 650;

              const isSelected = selectedZone?.id === zone.id;
              const colorInfo = getStatusColor(zone.occupancyPercent);

              return (
                <g
                  key={zone.id}
                  id={`zone-${zone.id}`}
                  onClick={() => onSelectZone(zone)}
                  className="cursor-pointer transition-all duration-200 group"
                >
                  {/* Pulse glow if critical */}
                  {zone.occupancyPercent >= 90 && (
                    <circle
                      cx={svgX + svgW / 2}
                      cy={svgY + svgH / 2}
                      r={Math.max(svgW, svgH) * 0.7}
                      fill="url(#alertGlow)"
                      className="animate-pulse"
                    />
                  )}
                  {zone.occupancyPercent >= 75 && zone.occupancyPercent < 90 && (
                    <circle
                      cx={svgX + svgW / 2}
                      cy={svgY + svgH / 2}
                      r={Math.max(svgW, svgH) * 0.65}
                      fill="url(#highGlow)"
                      className="opacity-70"
                    />
                  )}

                  {/* Building Base Shadow */}
                  <rect
                    x={svgX + 4}
                    y={svgY + 6}
                    width={svgW}
                    height={svgH}
                    rx="10"
                    fill="#020617"
                    opacity="0.6"
                  />

                  {/* Main Zone Block */}
                  <rect
                    x={svgX}
                    y={svgY}
                    width={svgW}
                    height={svgH}
                    rx="10"
                    fill={isSelected ? '#1e1b4b' : '#0f172a'}
                    stroke={
                      isSelected
                        ? '#818cf8'
                        : zone.occupancyPercent >= 90
                        ? '#ef4444'
                        : zone.occupancyPercent >= 75
                        ? '#f59e0b'
                        : '#334155'
                    }
                    strokeWidth={isSelected ? '3' : zone.occupancyPercent >= 90 ? '2.5' : '1.5'}
                    className="transition-all duration-150 group-hover:fill-slate-800"
                  />

                  {/* Zone Capacity Progress Line at top */}
                  <rect
                    x={svgX + 6}
                    y={svgY + 6}
                    width={(svgW - 12) * (Math.min(zone.occupancyPercent, 100) / 100)}
                    height="4"
                    rx="2"
                    fill={colorInfo.bg}
                  />

                  {/* Zone Code & Name */}
                  <text
                    x={svgX + 12}
                    y={svgY + 26}
                    fill="#f8fafc"
                    fontSize="12.5"
                    fontWeight="700"
                    className="group-hover:fill-indigo-300 transition"
                  >
                    {zone.name}
                  </text>

                  <text
                    x={svgX + 12}
                    y={svgY + 41}
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="500"
                  >
                    {zone.code} • {zone.currentCount.toLocaleString()} / {zone.capacity.toLocaleString()}
                  </text>

                  {/* Percentage Pill */}
                  <rect
                    x={svgX + svgW - 54}
                    y={svgY + 12}
                    width="44"
                    height="20"
                    rx="6"
                    fill={colorInfo.bg}
                    fillOpacity="0.2"
                    stroke={colorInfo.border}
                    strokeWidth="1"
                  />
                  <text
                    x={svgX + svgW - 32}
                    y={svgY + 26}
                    textAnchor="middle"
                    fill={colorInfo.bg}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {zone.occupancyPercent.toFixed(0)}%
                  </text>

                  {/* Sensor Icons overlay when sensor layer is active */}
                  {activeLayer === 'sensors' && (
                    <g transform={`translate(${svgX + 12}, ${svgY + svgH - 24})`}>
                      <rect x="0" y="0" width="70" height="18" rx="4" fill="#020617" opacity="0.8" />
                      <text x="6" y="13" fill="#38bdf8" fontSize="9.5" fontWeight="600">
                        📡 {zone.sensorsActive} Sensors
                      </text>
                    </g>
                  )}

                  {/* Trend Indicator */}
                  <g transform={`translate(${svgX + svgW - 28}, ${svgY + svgH - 24})`}>
                    <circle cx="9" cy="9" r="9" fill="#1e293b" />
                    <text
                      x="9"
                      y="13"
                      textAnchor="middle"
                      fill={
                        zone.trend === 'rising'
                          ? '#ef4444'
                          : zone.trend === 'falling'
                          ? '#10b981'
                          : '#94a3b8'
                      }
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {zone.trend === 'rising' ? '▲' : zone.trend === 'falling' ? '▼' : '▬'}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-xs flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-medium">Density:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">&lt; 50% (Normal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300">50-74% (Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">75-89% (High)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-bold">&gt; 90% (Bottleneck)</span>
          </div>
        </div>

        {/* Selected Zone Quick Peek Strip */}
        {selectedZone && (
          <div className="absolute top-3 right-3 max-w-xs bg-slate-950/90 backdrop-blur-md border border-indigo-500/40 rounded-xl p-3 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                  Active Inspector
                </span>
                <h4 className="text-sm font-bold text-slate-100">{selectedZone.name}</h4>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                  getStatusColor(selectedZone.occupancyPercent).text
                }`}
              >
                {selectedZone.occupancyPercent.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{selectedZone.description}</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-2">
              <div>
                <span className="text-slate-500">Live Count:</span>
                <div className="font-bold text-slate-200">
                  {selectedZone.currentCount} / {selectedZone.capacity}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Avg Dwell:</span>
                <div className="font-bold text-slate-200">{selectedZone.avgDwellMinutes} mins</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
