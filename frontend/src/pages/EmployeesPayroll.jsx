import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineCurrencyDollar, HiOutlineUsers, HiOutlineChartBar, HiOutlineClock, HiChevronLeft } from 'react-icons/hi';
import PayrollPanel from '../components/ui/PayrollPanel.jsx';
import { employeeAPI } from '../lib/api.js';

export default function EmployeesPayroll() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalPayroll: 0, averageSalary: 0, hoursWorked: 0 });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    employeeAPI
      .getAll()
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        setEmployees(list);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || 'Failed to load employees');
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Payroll calculation helpers (current month)
  const WORK_HOURS_PER_DAY = 8;
  const WORK_DAYS_PER_MONTH = 22;
  const monthKey = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
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
    // Accept HH:MM or HH:MM:SS
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

  const [attendanceVersion, setAttendanceVersion] = useState(0);
  useEffect(() => {
    const onStorage = (e) => {
      if (typeof e.key === 'string' && e.key.startsWith('worksense_attendance_')) {
        setAttendanceVersion((v) => v + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    const t = setInterval(() => setAttendanceVersion((v) => v + 1), 30000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(t); };
  }, []);

  useEffect(() => {
    // Derive totals whenever employees change
    const dates = getMonthDateStrings(monthKey);
    const monthlyMaps = dates.map(readAttendanceForDate);
    const storedBase = JSON.parse(localStorage.getItem('payroll.baseSalaries') || '{}');
    const storedAdj = JSON.parse(localStorage.getItem('payroll.adjustments') || '{}');

    let totalNet = 0;
    let totalBase = 0;
    let totalHours = 0;

    for (const e of employees) {
      const base = Number(storedBase?.[e.id] ?? e.salary ?? 0);
      totalBase += base;
      let workedMinutes = 0;
      for (const map of monthlyMaps) {
        const rec = map[e.id];
        if (!rec) continue;
        if (rec.checkIn && rec.checkOut) {
          workedMinutes += diffMinutes(rec.checkIn, rec.checkOut);
        } else if (rec.workHours) {
          // support stored HH:MM workHours
          const mins = (() => {
            const [hh, mm] = String(rec.workHours).split(':').map(Number);
            return Number.isFinite(hh) && Number.isFinite(mm) ? (hh * 60 + mm) : 0;
          })();
          workedMinutes += mins;
        }
      }
      const hours = workedMinutes / 60;
      totalHours += hours;
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

    const avgSalary = employees.length ? totalBase / employees.length : 0;
    setStats({ totalPayroll: Math.round(totalNet * 100) / 100, averageSalary: Math.round(avgSalary * 100) / 100, hoursWorked: Math.round(totalHours * 100) / 100 });
  }, [employees, attendanceVersion]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
           <button
             onClick={() => navigate('/employees')}
             className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
           >
             <HiChevronLeft className="w-5 h-5 mr-2" />
             <span className="text-sm font-medium">Back to Employees</span>
           </button>
        </div>
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Payroll</h1>
          <p className="text-gray-600">Manage employee payroll and compensation</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Employees', 
              value: employees.length, 
              icon: HiOutlineUsers, 
              color: 'text-blue-600 bg-blue-100',
              borderColor: 'border-blue-200'
            },
            { 
              label: 'Total Payroll', 
              value: `LKR ${stats.totalPayroll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
              icon: HiOutlineCurrencyDollar, 
              color: 'text-green-600 bg-green-100',
              borderColor: 'border-green-200'
            },
            { 
              label: 'Average Salary', 
              value: `LKR ${stats.averageSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
              icon: HiOutlineChartBar, 
              color: 'text-purple-600 bg-purple-100',
              borderColor: 'border-purple-200'
            },
            { 
              label: 'Hours Worked', 
              value: `${stats.hoursWorked.toLocaleString()}`, 
              icon: HiOutlineClock, 
              color: 'text-yellow-600 bg-yellow-100',
              borderColor: 'border-yellow-200'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-white rounded-xl shadow-sm border ${stat.borderColor} p-6 hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Payroll Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payroll Management</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-600">Loading employees…</div>
            </div>
          ) : (
            <PayrollPanel employees={employees} baseSalaries={{}} records={[]} />
          )}
        </div>

        {/* Reports & Analytics */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Payroll Summary</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Salary Cost Breakdown */}
            <div className="col-span-1 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-800 mb-3">Salary Cost Breakdown (Departments)</p>
              <div className="space-y-3">
                {[['Production', 45], ['Quality', 20], ['Maintenance', 18], ['Admin', 17]].map(([label, val], idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{label}</span>
                      <span>{val}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                      <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}


