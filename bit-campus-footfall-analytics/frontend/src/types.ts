export type ZoneCategory =
  | 'academic'
  | 'library'
  | 'dining'
  | 'tech'
  | 'recreation'
  | 'residential'
  | 'gate'
  | 'outdoor';

export type ZoneStatus = 'safe' | 'moderate' | 'high' | 'critical';

export interface CampusZone {
  id: string;
  name: string;
  code: string;
  category: ZoneCategory;
  capacity: number;
  currentCount: number;
  occupancyPercent: number;
  ingressCount: number;
  egressCount: number;
  avgDwellMinutes: number;
  trend: 'rising' | 'stable' | 'falling';
  status: ZoneStatus;
  // Spatial coordinates on campus map (percentage based for responsive SVG)
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  sensorsActive: number;
  sensorTypes: string[];
  description: string;
  peakHour: string;
}

export interface HourlyDataPoint {
  hour: string;
  todayFootfall: number;
  yesterdayFootfall: number;
  sevenDayAvg: number;
  ingress: number;
  egress: number;
  netFlow: number;
  forecast?: number;
  isForecast?: boolean;
}

export interface DayOfWeekDataPoint {
  day: string;
  footfall: number;
  peakOccupancy: number;
  topCongestedZone: string;
  avgDwellMinutes: number;
}

export interface InterZoneFlow {
  source: string;
  target: string;
  volume: number;
  percentage: number;
}

export interface DwellDistribution {
  category: string;
  count: number;
  percentage: number;
  typicalZones: string;
}

export interface IncidentAlert {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  type: 'surge' | 'overcapacity' | 'stagnation' | 'sensor_offline' | 'unusual_exit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  status: 'active' | 'investigating' | 'resolved';
  deltaMetric: string;
}

export interface SensorDevice {
  id: string;
  name: string;
  type: 'WiFi AP Probe' | 'CCTV Optical Counter' | 'Turnstile RFID' | 'BLE Beacon';
  location: string;
  status: 'online' | 'degraded' | 'offline';
  uptimePercent: number;
  lastReading: string;
  countAccuracy: number;
}

export type TimeRangeOption = 'live' | 'today' | '7days' | 'exam_week' | 'fest_week';
export type SensorFilterOption = 'all' | 'cctv' | 'wifi' | 'turnstile';
