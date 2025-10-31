import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineChartBar, HiOutlineExclamation, HiChevronLeft, 
        HiOutlineUsers, HiOutlineCheckCircle, HiOutlineXCircle, 
        HiOutlineMoon, HiOutlineOfficeBuilding, HiOutlineSearch, HiOutlineFilter, HiOutlineRefresh } from 'react-icons/hi';
import { employeeAPI } from '../lib/api.js';
import Spinner from '../components/ui/Spinner.jsx';

export default function EmployeesAttendance() {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const overviewRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup on component unmount
    return () => clearInterval(timer);
  }, []);

  // Helpers for time + status calculations
  const WORK_START = '09:00';
  const WORK_END = '17:00';

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToHM = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const computeStatus = (checkIn, checkOut) => {
    const inMin = parseTimeToMinutes(checkIn);
    const outMin = parseTimeToMinutes(checkOut);
    const startMin = parseTimeToMinutes(WORK_START);
    const endMin = parseTimeToMinutes(WORK_END);

    // If no check-in at all, they're absent
    if (inMin === null && outMin === null) return { label: 'Absent', type: 'absent' };
    
    // If checked in but not checked out, determine if they're on time or late
    if (inMin !== null && outMin === null) {
      if (inMin > startMin) return { label: 'Late', type: 'late' };
      return { label: 'On time', type: 'on_time' };
    }
    
    // If both checked in and out, determine their status
    if (inMin !== null && outMin !== null) {
      if (inMin > startMin) return { label: 'Late', type: 'late' };
      if (outMin > endMin) return { label: 'Over time', type: 'overtime' };
      return { label: 'On time', type: 'on_time' };
    }
    
    return { label: 'On time', type: 'on_time' };
  };

  const computeWorkHours = (checkIn, checkOut) => {
    const inMin = parseTimeToMinutes(checkIn);
    const outMin = parseTimeToMinutes(checkOut);
    if (inMin === null || outMin === null || outMin < inMin) return '—';
    return `${minutesToHM(outMin - inMin)}`;
  };

  // Load employees and attendance data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await employeeAPI.getAll({});
        setEmployees(res.data.data || []);
        
        // Also load today's attendance data from database
        await loadTodayAttendance();
      } catch (e) {
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Auto-refresh attendance data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadTodayAttendance();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [employees]);

  // Refresh when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTodayAttendance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [employees]);

  // Load today's attendance data from database
  const loadTodayAttendance = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/attendance/today');
      const result = await response.json();
      
      if (result.success) {
        const attendanceData = result.data.attendance || [];
        
        // Convert database attendance to localStorage format for compatibility
        const today = new Date().toISOString().split('T')[0];
        const attendanceMap = {};
        
        attendanceData.forEach(record => {
          // Find employee by RFID UID
          const employee = employees.find(emp => emp.rfid_uid === record.uid);
          if (employee) {
            attendanceMap[employee.id] = {
              checkIn: record.check_in_time,
              checkOut: record.check_out_time,
              status: record.is_checked_in ? 'checked_in' : 'checked_out'
            };
          }
        });
        
        // Update localStorage with database data
        writeAttendanceForDate(today, attendanceMap);
        setAttendanceMap(attendanceMap);
        setAttendanceVersion(prev => prev + 1);
        setLastSync(new Date()); // Update last sync time
      }
    } catch (error) {
      console.error('Error loading today\'s attendance:', error);
    }
  };

  // Refresh attendance data from database
  const refreshAttendanceData = async () => {
    await loadTodayAttendance();
  };

  // State for attendance version to trigger chart refreshes
  const [attendanceVersion, setAttendanceVersion] = useState(0);

  // Local storage attendance by date and employee id
  const getStorageKey = (date) => `worksense_attendance_${date}`;
  const readAttendanceForDate = (date) => {
    try {
      const raw = localStorage.getItem(getStorageKey(date));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };
  const writeAttendanceForDate = (date, data) => {
    localStorage.setItem(getStorageKey(date), JSON.stringify(data));
  };

  // Helper functions for attendance calculations
  const isPresent = (checkIn, checkOut) => {
    const inMin = parseTimeToMinutes(checkIn);
    const outMin = parseTimeToMinutes(checkOut);
    return inMin !== null && outMin !== null && outMin > inMin;
  };

  // Calculate real attendance data for charts
  const chartData = useMemo(() => {
    // Generate daily data for last 16 days
    const daily = [];
    for (let i = 15; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const attendanceMap = readAttendanceForDate(dateStr);
      
      let presentCount = 0;
      let totalCount = employees.length;
      
      employees.forEach(emp => {
        const rec = attendanceMap[emp.id];
        if (rec && isPresent(rec.checkIn, rec.checkOut)) {
          presentCount++;
        }
      });
      
      const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
      daily.push({
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        value: percentage
      });
    }

    // Generate weekly data for last 12 weeks
    const weekly = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (i * 7)));
      
      let totalPresent = 0;
      let totalDays = 0;
      
      // Calculate for 5 working days of the week
      for (let d = 0; d < 5; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const attendanceMap = readAttendanceForDate(dateStr);
        
        employees.forEach(emp => {
          const rec = attendanceMap[emp.id];
          if (rec && isPresent(rec.checkIn, rec.checkOut)) {
            totalPresent++;
          }
          totalDays++;
        });
      }
      
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      weekly.push({
        label: `Wk ${12 - i}`,
        value: percentage
      });
    }

    // Generate monthly data for last 12 months
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      
      let totalPresent = 0;
      let totalDays = 0;
      
      // Calculate for all days in the month
      const daysInMonth = new Date(year, monthNum, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const attendanceMap = readAttendanceForDate(dateStr);
        
        employees.forEach(emp => {
          const rec = attendanceMap[emp.id];
          if (rec && isPresent(rec.checkIn, rec.checkOut)) {
            totalPresent++;
          }
          totalDays++;
        });
      }
      
      const percentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      monthly.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        value: percentage
      });
    }

    return { daily, weekly, monthly };
  }, [employees, attendanceVersion]);

  const [attendanceMap, setAttendanceMap] = useState(() => readAttendanceForDate(selectedDate));
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    setAttendanceMap(readAttendanceForDate(selectedDate));
  }, [selectedDate]);

  const updateAttendance = (employeeId, field, value) => {
    setAttendanceMap((prev) => {
      const next = { ...prev, [employeeId]: { ...(prev[employeeId] || {}), [field]: value } };
      writeAttendanceForDate(selectedDate, next);
      setAttendanceVersion(prev => prev + 1); // Trigger chart refresh
      return next;
    });
  };

  const attendanceRecords = useMemo(() => {
    const friendlyDate = new Date(selectedDate).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    return employees
      .filter((e) => {
        const fullName = `${e.first_name || ''} ${e.last_name || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      })
      .map((e) => {
        const rec = attendanceMap[e.id] || {};
        const checkIn = rec.checkIn || '';
        const checkOut = rec.checkOut || '';
        const s = computeStatus(checkIn, checkOut);
        return {
          id: e.id,
          name: `${e.first_name || ''} ${e.last_name || ''}`.trim() || e.email,
          role: e.position || e.job_title || '-',
          department: e.department || '-',
          date: friendlyDate,
          status: s.label,
          statusType: s.type,
          checkIn,
          checkOut,
          workHours: computeWorkHours(checkIn, checkOut),
          photo: e.photo_url || ''
        };
      });
  }, [employees, attendanceMap, searchTerm, selectedDate]);

  const getStatusBadgeColor = (statusType) => {
    switch (statusType) {
      case 'on_time': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'overtime': return 'bg-purple-100 text-purple-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totals = useMemo(() => {
    const base = { totalEmployees: employees.length, onTime: 0, absent: 0, late: 0, overtime: 0 };
    for (const r of attendanceRecords) {
      if (r.statusType === 'on_time') base.onTime += 1;
      else if (r.statusType === 'late') base.late += 1;
      else if (r.statusType === 'overtime') base.overtime += 1;
      else if (r.statusType === 'absent') base.absent += 1;
    }
    return base;
  }, [attendanceRecords, employees.length]);

  // Find the index of the highest value in weekly
  const maxWeekly = Math.max(...chartData.weekly.map(item => item.value));

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Attendance</h1>
              <p className="text-gray-600">Track and monitor employee attendance patterns</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-syncing with RFID data</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Current Time & Date Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-gray-600 mb-2">Realtime Insight</div>
              <div className="text-lg font-semibold text-gray-800">
                Today: {currentTime.toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            <button onClick={() => overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl">
              View Attendance
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {[
            { 
              label: 'Total Employees', 
              value: totals.totalEmployees, 
              icon: HiOutlineUsers, 
              color: 'text-blue-600 bg-blue-100',
              borderColor: 'border-blue-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            },
            { 
              label: 'On Time', 
              value: totals.onTime, 
              icon: HiOutlineCheckCircle, 
              color: 'text-green-600 bg-green-100',
              borderColor: 'border-green-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            },
            { 
              label: 'Late', 
              value: totals.late, 
              icon: HiOutlineExclamation, 
              color: 'text-yellow-600 bg-yellow-100',
              borderColor: 'border-yellow-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            },
            { 
              label: 'Over Time', 
              value: totals.overtime, 
              icon: HiOutlineMoon, 
              color: 'text-purple-600 bg-purple-100',
              borderColor: 'border-purple-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            },
            { 
              label: 'Absent', 
              value: totals.absent, 
              icon: HiOutlineXCircle, 
              color: 'text-red-600 bg-red-100',
              borderColor: 'border-red-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            },
            { 
              label: 'Working Hours', 
              value: `${WORK_START} - ${WORK_END}`, 
              icon: HiOutlineOfficeBuilding, 
              color: 'text-indigo-600 bg-indigo-100',
              borderColor: 'border-indigo-200',
              detail: '', 
              detailColor: 'text-gray-400' 
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`bg-white rounded-xl shadow-sm border ${stat.borderColor} p-6 hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                  {stat.detail !== '' && <p className={`text-xs ${stat.detailColor}`}>{stat.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  {/* Line Chart - Attendance Comparison */}
  <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">Attendance Comparison Chart</h2>
      <div className="flex items-center space-x-4">
        <span
          title="View daily attendance trend"
          onClick={() => setSelectedPeriod('daily')}
          className={`flex items-center text-xs font-medium ml-3 cursor-pointer ${selectedPeriod==='daily' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span className="rounded-full mr-1 w-2 h-2 inline-block" style={{ backgroundColor: selectedPeriod==='daily' ? '#2563eb' : '#CBD5E1' }}></span>
          Daily
        </span>
        <span
          title="View weekly attendance trend"
          onClick={() => setSelectedPeriod('weekly')}
          className={`text-xs font-medium cursor-pointer ${selectedPeriod==='weekly' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Weekly
        </span>
        <span
          title="View monthly attendance average"
          onClick={() => setSelectedPeriod('monthly')}
          className={`text-xs font-medium cursor-pointer ${selectedPeriod==='monthly' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Monthly
        </span>
      </div>
    </div>
    <div className="relative h-48">
      {(() => {
        const series = selectedPeriod === 'daily'
          ? chartData.daily.map(d => ({ label: d.date, value: d.value }))
          : selectedPeriod === 'weekly'
            ? chartData.weekly.map(w => ({ label: w.department || w.label, value: w.value }))
            : chartData.monthly.map(m => ({ label: m.month, value: m.value }));
        const maxVal = Math.max(...series.map(s => s.value));
        return (
          <svg className="absolute inset-0 w-full h-full">
            {/* Grid Lines */}
            {[0,20,40,60,80,100].map((val) => (
              <line key={val} x1="40" y1={`${40+((100-val)/100)*150}`} x2="520" y2={`${40+((100-val)/100)*150}`} stroke="#EEF1F6" strokeWidth="1"/>
            ))}
            {/* Area fill */}
            <defs>
              <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12"/>
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={
                `M40,${190-(series[0].value/100)*150}` +
                series.map((item, index) => {
                  const x = 40 + (index/(series.length-1)) * 480;
                  const y = 190 - (item.value/100)*150;
                  return ` L${x},${y}`;
                }).join('') +
                ` L520,190 L40,190 Z`
              }
              fill="url(#areaBlue)"
            />
            {/* Main Line */}
            <polyline 
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              points={
                series.map((item,index)=>{
                  const x = 40 + (index/(series.length-1))*480;
                  const y = 190 - (item.value/100)*150;
                  return `${x},${y}`;
                }).join(' ')
              }
            />
            {/* Points */}
            {series.map((item,index)=>{
              const x = 40 + (index/(series.length-1))*480;
              const y = 190 - (item.value/100)*150;
              const isPeak = item.value === maxVal;
              return (
                <g key={index}>
                  {isPeak &&
                    <rect x={x-15} y={40} width="30" height="150" fill="#3B82F6" opacity="0.12"/>
                  }
                  <circle cx={x} cy={y} r={isPeak?5:3} fill="#fff" stroke="#2563eb" strokeWidth={isPeak?3:2}/>
                  {isPeak && 
                    <text x={x} y={y-15} fontSize="13" fontWeight="600" textAnchor="middle" fill="#2563eb">{item.value}%</text>
                  }
                </g>
              );
            })}
            {/* Y Axis labels */}
            {[0,20,40,60,80,100].map((val) => (
              <text key={val} x="20" y={`${44+((100-val)/100)*150}`} fontSize="11" fill="#CBD5E1">{val}%</text>
            ))}
            {/* X Axis labels */}
            {series.map((item,index)=>{
              const x = 40 + (index/(series.length-1))*480;
              const text = item.label;
              return (
                <text key={`${text}-${index}`} x={x} y={208} fontSize="12" fill="#A1A6B5" textAnchor="middle" transform={`rotate(-40,${x},208)`}>{text}</text>
              );
            })}
          </svg>
        );
      })()}
    </div>
  </div>

  {/* Bar Chart - Daily Attendance by Department */}
  <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">Daily Attendance by Department</h2>
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </div>
    <div className="flex items-end justify-between h-48 px-2">
      {(() => {
        // Calculate real department attendance data
        const departmentStats = {};
        const today = new Date().toISOString().split('T')[0];
        const attendanceMap = readAttendanceForDate(today);
        
        employees.forEach(emp => {
          const dept = emp.department || 'Unknown';
          if (!departmentStats[dept]) {
            departmentStats[dept] = { total: 0, present: 0 };
          }
          departmentStats[dept].total++;
          
          const rec = attendanceMap[emp.id];
          if (rec && isPresent(rec.checkIn, rec.checkOut)) {
            departmentStats[dept].present++;
          }
        });
        
        const departmentData = Object.entries(departmentStats).map(([dept, stats]) => ({
          department: dept,
          value: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        
        const maxValue = Math.max(...departmentData.map(x=>x.value));
        
        return departmentData.map((item, i) => {
          const maxHeight = 140;
          const height = (item.value/100)*maxHeight;
          const isMax = item.value === maxValue;
          return (
            <div key={item.department} className="flex flex-col items-center w-1/5">
              <span className="mb-1 text-xs font-semibold" style={{
                color: isMax?"#2563eb":"#A1A6B5"
              }}>{item.value}%</span>
              <div className={`mb-1 w-9 rounded-t`} style={{
                height: `${height}px`,
                background: isMax ? "#2563eb":"#F1F3F6"
              }}/>
              <span 
                className="text-xs font-medium mt-2"
                style={{color:"#94A3B8"}}
              >{item.department}</span>
            </div>
          );
        });
      })()}
    </div>
  </div>
</div>


        {/* Attendance Overview Table */}
        <div ref={overviewRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Attendance Overview</h2>
              <div className="text-sm text-gray-500">
                Showing {attendanceRecords.length} of {employees.length}
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <HiOutlineCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              {/* View Attendance button removed as requested */}
            </div>
            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['ID', 'Employee', 'Role', 'Department', 'Date', 'Status', 'Check-in', 'Check-out', 'Work hours'].map((header) => (
                      <th key={header} className="text-left py-3 px-4 font-medium text-gray-700">
                        <div className="flex items-center">{header}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{record.id}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs text-gray-500">
                            {record.photo ? (
                              <img src={record.photo} alt="" className="w-8 h-8 object-cover" />
                            ) : (
                              (record.name?.[0] || '?')
                            )}
                          </div>
                          <span>{record.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.department}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(record.statusType)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <input
                          type="time"
                          value={record.checkIn}
                          onChange={(e) => updateAttendance(record.id, 'checkIn', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-md"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <input
                          type="time"
                          value={record.checkOut}
                          onChange={(e) => updateAttendance(record.id, 'checkOut', e.target.value)}
                          className="px-2 py-1 border border-gray-200 rounded-md"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.workHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Animations */}
        <style jsx={true}>{`
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
    </div>
  );
}
