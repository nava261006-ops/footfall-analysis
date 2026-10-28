import React, { useState } from 'react';
import {
  Bell,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  X,
  Radio,
  Clock,
  Wifi,
} from 'lucide-react';
import { IncidentAlert, SensorDevice } from '../types';

interface AlertsAndSensorsModalProps {
  alerts: IncidentAlert[];
  sensors: SensorDevice[];
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const AlertsAndSensorsModal: React.FC<AlertsAndSensorsModalProps> = ({
  alerts,
  sensors,
  isOpen,
  onClose,
  onAcknowledgeAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'sensors'>('alerts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('alerts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'alerts'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Active Incidents ({alerts.filter((a) => a.status !== 'resolved').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sensors')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'sensors'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>IoT Sensor Telemetry ({sensors.length})</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {activeTab === 'alerts' ? (
            <div className="space-y-2.5">
              {alerts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">
                  No active incidents or overcapacity warnings.
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-xl border text-xs transition ${
                      alert.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-500/40'
                        : alert.severity === 'high'
                        ? 'bg-amber-950/30 border-amber-500/40'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              alert.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-400'
                                : alert.severity === 'high'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="font-bold text-slate-200">{alert.zoneName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{alert.message}</p>
                        <div className="mt-1.5 text-[11px] text-indigo-300 font-mono">
                          Telemetry trigger: {alert.deltaMetric}
                        </div>
                      </div>

                      {alert.status !== 'resolved' ? (
                        <button
                          type="button"
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium flex-shrink-0 transition"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold text-slate-200">Aruba + Hikvision Edge Mesh</span>
                </div>
                <span className="text-slate-400 font-mono">Network latency: ~18ms</span>
              </div>

              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{sensor.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {sensor.type}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      {sensor.location} • Reading: {sensor.lastReading}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        sensor.status === 'online'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {sensor.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Accuracy: {sensor.countAccuracy}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
