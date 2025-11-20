import React, { useMemo, useState } from 'react';

// Color legend:
// Present: green, Absent: red, Late: yellow, Leave: blue, Empty: gray

const LEGEND = [
  { key: 'present', label: 'Present', className: 'bg-green-100 text-green-800 border-green-200' },
  { key: 'absent', label: 'Absent', className: 'bg-red-100 text-red-800 border-red-200' },
  { key: 'late', label: 'Late', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { key: 'leave', label: 'Leave', className: 'bg-blue-100 text-blue-800 border-blue-200' },
];

function startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getMonthMatrix(current) {
  const start = startOfMonth(current);
  const end = endOfMonth(current);
  const startDay = start.getDay(); // 0: Sun
  const daysInMonth = end.getDate();

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(current.getFullYear(), current.getMonth(), d));

  // pad to complete weeks (multiples of 7)
  while (days.length % 7 !== 0) days.push(null);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export default function AttendanceCalendar({ attendanceByDate = {}, title = 'Attendance Calendar' }) {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()));

  const monthLabel = useMemo(() => monthDate.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [monthDate]);
  const weeks = useMemo(() => getMonthMatrix(monthDate), [monthDate]);

  const goPrev = () => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setMonthDate(startOfMonth(new Date()));

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusForDate = (date) => {
    if (!date) return null;
    const key = date.toISOString().slice(0, 10); // YYYY-MM-DD
    return attendanceByDate[key] || null; // expected values: 'present' | 'absent' | 'late' | 'leave'
  };

  const badgeClassForStatus = (status) => {
    const found = LEGEND.find((l) => l.key === status);
    if (!found) return 'bg-gray-50 text-gray-500 border-gray-200';
    return found.className;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">Color codes to visualize presence and exceptions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={goPrev} className="px-2 py-1 text-sm rounded border bg-gray-50 hover:bg-gray-100">Prev</button>
          <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">{monthLabel}</span>
          <button onClick={goNext} className="px-2 py-1 text-sm rounded border bg-gray-50 hover:bg-gray-100">Next</button>
          <button onClick={goToday} className="ml-2 px-2 py-1 text-sm rounded border bg-blue-50 text-blue-700 hover:bg-blue-100">Today</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {LEGEND.map((item) => (
          <span key={item.key} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${item.className}`}>
            {item.label}
          </span>
        ))}
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200">No Data</span>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekdayLabels.map((w) => (
          <div key={w} className="text-xs text-gray-500 text-center uppercase tracking-wide">{w}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {weeks.map((week, wi) => (
          <React.Fragment key={wi}>
            {week.map((date, di) => {
              if (!date) return <div key={`${wi}-${di}`} className="h-20 rounded border bg-gray-50" />;
              const status = getStatusForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div key={`${wi}-${di}`} className={`h-20 rounded border p-1 flex flex-col ${isToday ? 'ring-1 ring-blue-400' : ''} ${status ? badgeClassForStatus(status) : 'bg-white'}`}>
                  <div className="text-xs font-medium text-gray-700">{date.getDate()}</div>
                  {status && (
                    <div className="mt-auto text-[10px] font-medium opacity-80">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


