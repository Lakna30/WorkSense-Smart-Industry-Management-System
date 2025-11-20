"use client";
import { useEffect, useMemo, useState } from "react";
import {
  FiWifi,
  FiWifiOff,
  FiThermometer,
  FiDroplet,
  FiAlertTriangle,
  FiActivity,
  FiClock,
  FiCloud,
  FiServer,
} from "react-icons/fi";
import { useMqttTelemetry } from "./useMqttTelemetry";
/* ------------------ Reusable Radial Gauge ------------------ */
function RadialGauge({
  value = 0,
  min = 0,
  max = 100,
  size = 200,
  thickness = 16,
  label = "",
  unit = "",
  zones = [
    { to: 60, color: "#22c55e" },
    { to: 85, color: "#f59e0b" },
    { to: 100, color: "#ef4444" },
  ],
  icon,
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const START = 180;
  const END = 0;
  const angle = START + (END - START) * pct;

  const polar = (deg) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };

  const arcPath = (fromDeg, toDeg) => {
    const p1 = polar(fromDeg);
    const p2 = polar(toDeg);
    const largeArcFlag = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    const sweepFlag = 1;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${p2.x} ${p2.y}`;
  };

  const zonePaths = useMemo(() => {
    const paths = [];
    let prev = 0;
    for (const z of zones) {
      const from = START - (180 * prev) / 100;
      const to = START - (180 * Math.min(z.to, 100)) / 100;
      paths.push({ d: arcPath(from, to), color: z.color });
      prev = Math.min(z.to, 100);
    }
    return paths;
  }, [zones]);

  const needle = polar(angle);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
      </div>

      <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`} className="mx-auto">
        <path
          d={arcPath(START, END)}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {zonePaths.map((zp, i) => (
          <path
            key={i}
            d={zp.d}
            fill="none"
            stroke={zp.color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        ))}
        <line
          x1={cx}
          y1={cy}
          x2={needle.x}
          y2={needle.y}
          stroke="#ef4444"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#ef4444" />
      </svg>

      <div className="text-center mt-3">
        <div className="text-3xl font-bold text-gray-900">
          {Number(value).toFixed(1)}
          <span className="text-lg text-gray-400 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------ Mock Sensor Data ------------------ */
function useMockTelemetry() {
  const [data, setData] = useState({
    temp: 28,
    humidity: 64,
    toxic: 35,
    vibration: 10,
    uptime: 99.7,
    ts: new Date().toISOString(),
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => ({
        ...d,
        temp: Math.max(18, Math.min(40, d.temp + (Math.random() * 2 - 1))),
        humidity: Math.max(30, Math.min(90, d.humidity + (Math.random() * 3 - 1.5))),
        toxic: Math.max(0, Math.min(100, d.toxic + (Math.random() * 6 - 3))),
        vibration: Math.max(0, Math.min(20, d.vibration + (Math.random() * 4 - 2))),
        uptime: Math.max(80, Math.min(100, d.uptime + (Math.random() * 0.5 - 0.25))),
        ts: new Date().toISOString(),
      }));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return { data, connected: true };
}

/* ------------------ Summary Card ------------------ */
function SummaryCard({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="text-red-500">{icon}</div>
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

/* ------------------ Dashboard ------------------ */
export default function Dashboard() {
  const { data, connected } = useMqttTelemetry({});

  const getAlertLevel = () => {
    if (data.toxic > 80 || data.temp > 38 || data.gasCat > 0) return "critical";
    if (data.toxic > 60 || data.temp > 35 || data.lightPct < 20) return "warning";
    return "normal";
  };
  const alert = getAlertLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* ---- Header ---- */}
      <div className="w-full px-8 py-4 flex justify-between items-center bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {connected ? (
            <FiWifi className="text-red-500" />
          ) : (
            <FiWifiOff className="text-gray-400" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-500">
          <FiClock className="w-4 h-4" />
          <span className="text-sm">{new Date(data.ts).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ---- Main ---- */}
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            WorkSense – Industrial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time factory environment monitoring system
          </p>
        </div>

        {/* ---- Summary Cards ---- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <SummaryCard icon={<FiServer />} label="Device ID" value={data.deviceId || "Unknown"} />
          <SummaryCard icon={<FiActivity />} label="Light Level" value={`${data.lightPct.toFixed(1)}%`} />
          <SummaryCard icon={<FiCloud />} label="Air Quality" value={data.toxic < 40 ? "Good" : data.toxic < 70 ? "Moderate" : "Poor"} />
          <SummaryCard icon={<FiThermometer />} label="Temperature" value={`${data.temp.toFixed(1)} °C`} />
        </div>

        {/* ---- Gauges ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <RadialGauge
            value={data.temp}
            min={0}
            max={50}
            unit="°C"
            label="Temperature"
            zones={[
              { to: 25, color: "#22c55e" },
              { to: 35, color: "#f59e0b" },
              { to: 100, color: "#ef4444" },
            ]}
            icon={<FiThermometer className="text-red-500" />}
          />

          <RadialGauge
            value={data.humidity}
            min={0}
            max={100}
            unit="%RH"
            label="Humidity"
            zones={[
              { to: 40, color: "#f59e0b" },
              { to: 70, color: "#22c55e" },
              { to: 100, color: "#f59e0b" },
            ]}
            icon={<FiDroplet className="text-red-500" />}
          />

          <RadialGauge
            value={data.toxic}
            min={0}
            max={100}
            unit="Idx"
            label="Toxic Gas Index"
            zones={[
              { to: 30, color: "#22c55e" },
              { to: 60, color: "#f59e0b" },
              { to: 100, color: "#ef4444" },
            ]}
            icon={<FiAlertTriangle className="text-red-500" />}
          />

          <RadialGauge
            value={data.lightPct}
            min={0}
            max={100}
            unit="%"
            label="Light Level"
            zones={[
              { to: 30, color: "#f59e0b" },
              { to: 70, color: "#22c55e" },
              { to: 100, color: "#f59e0b" },
            ]}
            icon={<FiActivity className="text-yellow-500" />}
          />
        </div>

        {/* ---- Additional Data Info ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Categories</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Light Category:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.lightCat === 0 ? "Dark" : data.lightCat === 1 ? "Normal" : "Bright"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gas Category:</span>
                <span className="text-sm font-medium text-gray-900">
                  {data.gasCat === 0 ? "Safe" : data.gasCat === 1 ? "Warning" : "Danger"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Update:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(data.ts).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${connected ? "text-green-600" : "text-red-600"}`}>
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Device ID:</span>
                <span className="text-sm font-medium text-gray-900">{data.deviceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">MQTT Broker:</span>
                <span className="text-sm font-medium text-gray-900">mqtt-dashboard.com:8884</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Real-Time Attendance Button ---- */}
        <div className="mt-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Employee Attendance</h3>
              <p className="text-sm text-gray-600">Monitor real-time RFID attendance tracking</p>
            </div>
            <a
              href="/attendance/realtime"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl"
            >
              <FiActivity className="w-5 h-5" />
              View Real-Time Attendance
            </a>
          </div>
        </div>

        {/* ---- Alerts ---- */}
        {alert !== "normal" && (
          <div
            className={`mt-10 rounded-xl px-6 py-4 flex items-center gap-3 border-l-4 ${
              alert === "critical"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-amber-50 border-amber-400 text-amber-700"
            }`}
          >
            <FiAlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              {alert === "critical"
                ? "⚠️ Critical condition detected! High toxic gas levels, temperature, or gas detection requires immediate attention."
                : "⚠️ Warning: Parameters approaching critical thresholds. Check temperature, toxic gas levels, or lighting conditions."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
