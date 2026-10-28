import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, X, FileText, CheckCircle2 } from 'lucide-react';
import { CampusZone, HourlyDataPoint } from '../types';

interface DataManagementModalProps {
  zones: CampusZone[];
  hourlyData: HourlyDataPoint[];
  isOpen: boolean;
  onClose: () => void;
  onResetData: () => void;
  onImportCsv: (importedZones: CampusZone[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  zones,
  hourlyData,
  isOpen,
  onClose,
  onResetData,
  onImportCsv,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Export Zones CSV
  const handleExportZonesCsv = () => {
    const headers = [
      'ZoneID',
      'FacilityName',
      'Code',
      'Category',
      'Capacity',
      'CurrentCount',
      'OccupancyPercent',
      'IngressCount',
      'EgressCount',
      'AvgDwellMinutes',
      'PeakHour',
    ];
    const rows = zones.map((z) => [
      z.id,
      `"${z.name}"`,
      z.code,
      z.category,
      z.capacity,
      z.currentCount,
      z.occupancyPercent.toFixed(1),
      z.ingressCount,
      z.egressCount,
      z.avgDwellMinutes,
      `"${z.peakHour}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bit_campus_zones_footfall_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Hourly Trend CSV
  const handleExportHourlyCsv = () => {
    const headers = ['Hour', 'TodayFootfall', 'YesterdayFootfall', 'SevenDayAvg', 'Ingress', 'Egress', 'NetFlow'];
    const rows = hourlyData.map((h) => [
      h.hour,
      h.todayFootfall,
      h.yesterdayFootfall,
      h.sevenDayAvg,
      h.ingress,
      h.egress,
      h.netFlow,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bit_campus_hourly_footfall_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File Upload parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setImportStatus('Error: CSV file must contain at least a header row and 1 data row.');
          return;
        }

        // Quick simple parser to update current zone counts
        const updatedZones = [...zones];
        let matchedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
          if (parts.length >= 6) {
            const zoneCode = parts[2];
            const newCount = parseInt(parts[5], 10);
            if (zoneCode && !isNaN(newCount)) {
              const zoneIndex = updatedZones.findIndex((z) => z.code === zoneCode || z.id === parts[0]);
              if (zoneIndex !== -1) {
                const z = updatedZones[zoneIndex];
                const newPercent = (newCount / z.capacity) * 100;
                updatedZones[zoneIndex] = {
                  ...z,
                  currentCount: newCount,
                  occupancyPercent: Math.min(newPercent, 100),
                  status: newPercent >= 90 ? 'critical' : newPercent >= 75 ? 'high' : newPercent >= 50 ? 'moderate' : 'safe',
                };
                matchedCount++;
              }
            }
          }
        }

        if (matchedCount > 0) {
          onImportCsv(updatedZones);
          setImportStatus(`Successfully updated ${matchedCount} campus zones from uploaded CSV!`);
        } else {
          setImportStatus('Uploaded CSV processed, but no matching zone codes were identified.');
        }
      } catch (err: any) {
        setImportStatus(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Footfall Data Management</h3>
              <p className="text-xs text-slate-400">Export analytics records or import custom sensor CSVs</p>
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {/* Export Options */}
          <div>
            <span className="font-semibold text-slate-300 block mb-2 uppercase tracking-wider text-[11px]">
              Export Telemetry Datasets:
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExportZonesCsv}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-indigo-400 mb-1">
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-slate-500">.CSV</span>
                </div>
                <span className="font-bold text-slate-200 group-hover:text-indigo-200">
                  Zone Telemetry
                </span>
                <span className="text-[11px] text-slate-400">10 facility occupancies</span>
              </button>

              <button
                type="button"
                onClick={handleExportHourlyCsv}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between text-cyan-400 mb-1">
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] font-mono text-slate-500">.CSV</span>
                </div>
                <span className="font-bold text-slate-200 group-hover:text-cyan-200">
                  Hourly Flows
                </span>
                <span className="text-[11px] text-slate-400">Ingress, egress & baseline</span>
              </button>
            </div>
          </div>

          {/* Import Custom CSV */}
          <div className="pt-3 border-t border-slate-800">
            <span className="font-semibold text-slate-300 block mb-2 uppercase tracking-wider text-[11px]">
              Import Custom Sensor Logs:
            </span>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950/40 text-center cursor-pointer transition"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <div className="font-semibold text-slate-200">
                Click to select or drop CSV sensor log
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Format: ZoneID, FacilityName, Code, Category, Capacity, CurrentCount...
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="mt-2.5 p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 text-[11px]">
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset to benchmark */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">Reset to Default Telemetry</div>
              <div className="text-[11px] text-slate-400">Restore BIT campus default benchmark numbers</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetData();
                setImportStatus('Data reset to BIT benchmark telemetry.');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
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
