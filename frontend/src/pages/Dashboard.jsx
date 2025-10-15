"use client";
import { useEffect, useMemo, useState } from "react";
import { FiWifi, FiWifiOff, FiThermometer, FiDroplet, FiAlertTriangle } from "react-icons/fi";

// --- Radial Gauge Component ---
// --- FIXED: correctly oriented semicircle (top half, 0° at right) ---
function RadialGauge({
  value = 0, min = 0, max = 100,
  size = 200, thickness = 18,
  label = "", unit = "",
  zones = [
    { to: 60, color: "#22c55e" }, 
    { to: 85, color: "#f59e0b" }, // amber
    { to: 100, color: "#ef4444" }, // red
  ],
  showTicks = true,
  icon,
}) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = (clamped - min) / (max - min);

  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // angles in degrees where 0° is RIGHT, 90° is UP, 180° is LEFT
  const START = 180; // left
  const END = 0;     // right
  const angle = START + (END - START) * pct; // 180 -> 0 as value increases

  const polar = (deg) => {
    const a = (deg) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
    // note the minus on sin(...) because SVG Y grows downward
  };

  const arcPath = (fromDeg, toDeg) => {
    const p1 = polar(fromDeg);
    const p2 = polar(toDeg);
    const largeArcFlag = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
    const sweepFlag = 1; // go the short way counterclockwise on the top
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${p2.x} ${p2.y}`;
  };

  // zones: 0..100% mapped from RIGHT(0°) to LEFT(180°), so we still
  // build from 180° (left) down to 0° (right) but with the fixed arc
  const zonePaths = useMemo(() => {
    const paths = [];
    let prevPct = 0;
    for (const z of zones) {
      const fromDeg = START - (180 * prevPct) / 100;
      const toDeg   = START - (180 * Math.min(z.to, 100)) / 100;
      paths.push({ d: arcPath(fromDeg, toDeg), color: z.color });
      prevPct = Math.min(z.to, 100);
    }
    return paths;
  }, [zones, r, size]);

  // ticks on the same top semicircle (left→right)
  const ticks = useMemo(() => {
    if (!showTicks) return null;
    const list = [];
    for (let i = 0; i <= 10; i++) {
      const a = START - i * 18; // 180..0
      const outer = polar(a);
      const inner = {
        x: cx + (r - thickness * 0.6) * Math.cos(a * Math.PI / 180),
        y: cy - (r - thickness * 0.6) * Math.sin(a * Math.PI / 180),
      };
      list.push(
        <line
          key={i}
          x1={inner.x} y1={inner.y}
          x2={outer.x} y2={outer.y}
          stroke="#9ca3af"
          strokeWidth={i % 5 === 0 ? 2 : 1}
          strokeLinecap="round"
        />
      );
    }
    return list;
  }, [r, size, thickness]);

  const needle = polar(angle);

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-base font-semibold text-gray-800">{label}</h3>
        <span className="ml-auto text-xs text-gray-500">{min}{unit} – {max}{unit}</span>
      </div>

      <svg width={size} height={size/2} viewBox={`0 0 ${size} ${size/2}`} className="mx-auto">
        {/* background track */}
        <path
          d={arcPath(START, END)}
          fill="none"
          stroke="#eef2f7"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        {/* colored zones */}
        {zonePaths.map((zp, i) => (
          <path key={i} d={zp.d} fill="none" stroke={zp.color} strokeWidth={thickness} strokeLinecap="round" />
        ))}
        {/* ticks */}
        {ticks}
        {/* needle */}
        <line
          x1={cx} y1={cy}
          x2={needle.x} y2={needle.y}
          stroke="#111827" strokeWidth={3} strokeLinecap="round"
          style={{ transition: "x2 220ms ease, y2 220ms ease" }}
        />
        <circle cx={cx} cy={cy} r={5} fill="#111827" />
      </svg>

      <div className="flex items-end justify-center gap-2 mt-2">
        <div className="text-4xl font-bold text-gray-900">{Number(value).toFixed(1)}</div>
        <div className="text-gray-500 mb-1">{unit}</div>
      </div>
    </div>
  );
}

// --- Card wrapper ---
function SensorCard({ title, children, connected }) {
  return (
    <div className="rounded-2xl bg-white shadow-xl border border-gray-200 p-5 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-2 mb-4">
        {connected ? (
          <FiWifi className="h-4 w-4 text-emerald-500" />
        ) : (
          <FiWifiOff className="h-4 w-4 text-rose-500" />
        )}
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// --- Mock Data (replace with MQTT/WebSocket later) ---
function useMockTelemetry() {
  const [data, setData] = useState({
    temp: 27,
    humidity: 65,
    toxic: 22,
    ts: new Date().toISOString(),
  });

  useEffect(() => {
    const id = setInterval(() => {
      setData((d) => ({
        temp: Math.max(18, Math.min(40, d.temp + (Math.random() * 2 - 1))),
        humidity: Math.max(30, Math.min(90, d.humidity + (Math.random() * 4 - 2))),
        toxic: Math.max(0, Math.min(100, d.toxic + (Math.random() * 6 - 3))),
        ts: new Date().toISOString(),
      }));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return { data, connected: true };
}

// --- Dashboard Page ---
export default function Dashboard() {
  const { data, connected } = useMockTelemetry();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Industrial Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time environmental data from ESP32 sensors
          </p>
        </div>

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SensorCard title="Temperature" connected={connected}>
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
              icon={<FiThermometer className="h-5 w-5 text-gray-500" />}
            />
          </SensorCard>

          <SensorCard title="Humidity" connected={connected}>
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
              icon={<FiDroplet className="h-5 w-5 text-gray-500" />}
            />
          </SensorCard>

          <SensorCard title="Toxic Gas Index" connected={connected}>
            <RadialGauge
              value={data.toxic}
              min={0}
              max={100}
              unit="Idx"
              label="Toxic Gas"
              zones={[
                { to: 30, color: "#22c55e" },
                { to: 60, color: "#f59e0b" },
                { to: 100, color: "#ef4444" },
              ]}
              icon={<FiAlertTriangle className="h-5 w-5 text-gray-500" />}
            />
          </SensorCard>
        </div>

        {/* Connection Status */}
        <div className="mt-10 rounded-xl bg-white shadow-md border border-gray-200 p-5 text-center">
          <h3 className="text-sm font-semibold text-gray-700">Connection Status</h3>
          <p className="text-sm text-gray-600 mt-1">
            Status:{" "}
            {connected ? (
              <span className="text-emerald-600 font-medium">Connected</span>
            ) : (
              <span className="text-rose-600 font-medium">Disconnected</span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Last update: {new Date(data.ts).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
