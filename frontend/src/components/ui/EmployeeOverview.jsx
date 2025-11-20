import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaMoneyBill,
  FaCalendarAlt,
  FaMars,
  FaVenus
} from 'react-icons/fa'; // Font Awesome icons

export default function EmployeeOverview({ employees = [], recentPayroll = [] }) {
  const totalEmployees = employees.length;
  const navigate = useNavigate();

  // Calculate real payroll processed data
  const payrollProcessed = useMemo(() => {
    const WORK_HOURS_PER_DAY = 8;
    const WORK_DAYS_PER_MONTH = 22;
    const monthKey = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    
    const getMonthDateStrings = (ym) => {
      const [yy, mm] = ym.split('-').map((v) => parseInt(v, 10));
      const daysInMonth = new Date(yy, mm, 0).getDate();
      const arr = [];
      for (let d = 1; d <= daysInMonth; d++) {
        arr.push(`${yy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      }
      return arr;
    };
    
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr) return null;
      const parts = String(timeStr).split(':').map(Number);
      if (parts.length < 2) return null;
      const [h, m] = parts;
      if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
      return h * 60 + m;
    };
    
    const diffMinutes = (checkIn, checkOut) => {
      const inMin = parseTimeToMinutes(checkIn);
      const outMin = parseTimeToMinutes(checkOut);
      if (inMin === null || outMin === null) return 0;
      const d = outMin - inMin;
      return d > 0 ? d : 0;
    };
    
    const readAttendanceForDate = (date) => {
      try {
        const raw = localStorage.getItem(`worksense_attendance_${date}`);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };
    
    const dates = getMonthDateStrings(monthKey);
    const monthlyMaps = dates.map(readAttendanceForDate);
    const storedBase = JSON.parse(localStorage.getItem('payroll.baseSalaries') || '{}');
    const storedAdj = JSON.parse(localStorage.getItem('payroll.adjustments') || '{}');
    
    let totalNet = 0;
    
    for (const e of employees) {
      const base = Number(storedBase?.[e.id] ?? e.salary ?? 0);
      let workedMinutes = 0;
      for (const map of monthlyMaps) {
        const rec = map[e.id];
        if (!rec) continue;
        if (rec.checkIn && rec.checkOut) {
          workedMinutes += diffMinutes(rec.checkIn, rec.checkOut);
        } else if (rec.workHours) {
          const mins = (() => {
            const [hh, mm] = String(rec.workHours).split(':').map(Number);
            return Number.isFinite(hh) && Number.isFinite(mm) ? (hh * 60 + mm) : 0;
          })();
          workedMinutes += mins;
        }
      }
      const hours = workedMinutes / 60;
      const normalMinutes = WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY * 60;
      const otMinutes = Math.max(0, workedMinutes - normalMinutes);
      const otHours = otMinutes / 60;
      const normalHourlyRate = (WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY) > 0 ? base / (WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY) : 0;
      const otPay = otHours * (normalHourlyRate * 1.5);
      const adj = storedAdj?.[e.id] || {};
      const allowance = Number(adj.allowance || 0);
      const bonus = Number(adj.bonus || 0);
      const deduction = Number(adj.deduction || 0);
      const gross = base + otPay + allowance + bonus;
      const net = gross - deduction;
      totalNet += net;
    }
    
    return Math.round(totalNet * 100) / 100;
  }, [employees]);

  // Calculate real attendance data for current date
  const attendanceTotal = useMemo(() => {
    const getTodayDateString = () => {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    
    const readAttendanceForDate = (date) => {
      try {
        const raw = localStorage.getItem(`worksense_attendance_${date}`);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };
    
    const parseTimeToMinutes = (timeStr) => {
      if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };
    
    const isPresent = (checkIn, checkOut) => {
      const inMin = parseTimeToMinutes(checkIn);
      const outMin = parseTimeToMinutes(checkOut);
      return inMin !== null && outMin !== null && outMin > inMin;
    };
    
    const todayMap = readAttendanceForDate(getTodayDateString());
    let presentCount = 0;
    for (const e of employees) {
      const rec = todayMap[e.id];
      if (rec && isPresent(rec.checkIn, rec.checkOut)) {
        presentCount += 1;
      }
    }
    return presentCount;
  }, [employees]);

  // Job statistics: hires over last 12 months
  const { months, jobStats, maxJobStat } = useMemo(() => {
    const now = new Date();
    const labels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const counts = Object.fromEntries(labels.map(l => [l.key, 0]));
    employees.forEach((e) => {
      if (!e.hire_date) return;
      const d = new Date(e.hire_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (counts[key] !== undefined) counts[key] += 1;
    });
    const stats = labels.map(l => ({ label: l.label, value: counts[l.key] || 0 }));
    const maxVal = Math.max(...stats.map(s => s.value), 1);
    return { months: labels.map(l => l.label), jobStats: stats, maxJobStat: maxVal };
  }, [employees]);

  // Performance list (mock UI-only)
  const performance = useMemo(() => {
    const names = employees.slice(0, 5).map((e) => `${e.first_name || ''} ${e.last_name || ''}`.trim())
      .filter(Boolean);
    while (names.length < 5) names.push('—');
    return names.map((n, idx) => ({ name: n, a: (idx * 17 + 40) % 100, b: (idx * 23 + 30) % 100 }));
  }, [employees]);

  // Gender distribution (male/female/other)
  const genderStats = useMemo(() => {
    const norm = (g) => (g || '').toString().trim().toLowerCase();
    const isMale = (g) => {
      const v = norm(g);
      return v === 'male' || v === 'm' || v === 'man' || v === 'masculine';
    };
    const isFemale = (g) => {
      const v = norm(g);
      return v === 'female' || v === 'f' || v === 'woman' || v === 'feminine';
    };
    const male = employees.filter(emp => isMale(emp.gender)).length;
    const female = employees.filter(emp => isFemale(emp.gender)).length;
    const other = employees.filter(emp => !(isMale(emp.gender) || isFemale(emp.gender))).length;
    const total = male + female + other;
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    return {
      male: { count: male, percentage: pct(male) },
      female: { count: female, percentage: pct(female) },
      other: { count: other, percentage: pct(other) }
    };
  }, [employees]);

  // Function to create pie chart path
  const createPieSlice = (percentage, startAngle) => {
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="mb-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Total Employees */}
        <button
          onClick={() => navigate('/employees#employee-profiles')}
          className="rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-200 
                     bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg hover:scale-105 
                     cursor-pointer transition-all duration-300 text-left"
        >
          <div>
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
            <p className="text-xs text-gray-500 mt-1">Employee count</p>
          </div>
          <FaUsers className="w-8 h-8 text-blue-500" />
        </button>

        {/* Payroll Processed */}
        <button
          onClick={() => navigate('/employees/payroll')}
          className="rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-200 
                     bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg hover:scale-105 
                     cursor-pointer transition-all duration-300 text-left"
        >
          <div>
            <p className="text-sm text-gray-500">Payroll Processed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">LKR {payrollProcessed.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>
          <FaMoneyBill className="w-8 h-8 text-green-500" />
        </button>


        {/* Attendance */}
        <button
          onClick={() => navigate('/employees/attendance')}
          className="rounded-xl shadow-md p-4 flex items-center justify-between border border-gray-200 
                     bg-gradient-to-br from-red-50 to-red-100 hover:shadow-lg hover:scale-105 
                     cursor-pointer transition-all duration-300 text-left"
        >
          <div>
            <p className="text-sm text-gray-500">Attendance</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{attendanceTotal.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Go to attendance</p>
          </div>
          <FaCalendarAlt className="w-8 h-8 text-red-500" />
        </button>

      </div>

      {/* Middle: Chart + Gender Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Job Statistics</h3>
          </div>
          <div className="h-40">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {(() => {
                const points = jobStats.map((s, i) => {
                  const x = (i / (jobStats.length - 1)) * 100;
                  const y = 40 - (s.value / maxJobStat) * 36 - 2;
                  return `${x},${y}`;
                });
                const areaPath = `M 0,40 L ${points.join(' L ')} L 100,40 Z`;
                const linePath = `M ${points[0]} L ${points.join(' L ')}`;
                return (
                  <g>
                    <path d={areaPath} fill="url(#areaGrad)" />
                    <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="0.8" />
                  </g>
                );
              })()}
            </svg>
            <div className="flex justify-between mt-1">
              {months.map((m, i) => (
                <span key={i} className="text-[10px] text-gray-500">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Gender Distribution</h3>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-[150px] h-[150px]">
              <svg viewBox="0 0 100 100">
                {/* Female slice */}
                <path
                  d={createPieSlice(genderStats.female.percentage, 0)}
                  fill="#f799ee"
                  className="hover:opacity-90 transition-opacity"
                />
                {/* Male slice */}
                <path
                  d={createPieSlice(genderStats.male.percentage, genderStats.female.percentage * 3.6)}
                  fill="#818cf8"
                  className="hover:opacity-90 transition-opacity"
                />
              </svg>
            </div>
            
            <div className="ml-4 space-y-2">
              <div className="flex items-center">
                <FaMars className="w-4 h-4 text-blue-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Male ({genderStats.male.percentage}%)
                </span>
              </div>
              <div className="flex items-center">
                <FaVenus className="w-4 h-4 text-pink-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Female ({genderStats.female.percentage}%)
                </span>
              </div>
              {genderStats.other.count > 0 && (
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-slate-400 mr-2" />
                  <span className="text-sm text-gray-600">Other ({genderStats.other.percentage}%)</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            Total Employees: {employees.length}
          </div>
        </div>
      </div>
    </div>
  );
}
