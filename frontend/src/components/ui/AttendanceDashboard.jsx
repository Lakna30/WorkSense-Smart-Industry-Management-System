import React, { useMemo, useState } from 'react';

export default function AttendanceDashboard({ employees = [] }) {
  const [checkedInIds, setCheckedInIds] = useState(new Set());

  const handleCheckIn = (employeeId) => {
    setCheckedInIds((prev) => new Set(prev).add(employeeId));
  };

  const handleCheckOut = (employeeId) => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      next.delete(employeeId);
      return next;
    });
  };

  const summary = useMemo(() => {
    const total = employees.length;
    const inCount = employees.filter((e) => checkedInIds.has(e.id)).length;
    const outCount = total - inCount;
    return { total, inCount, outCount };
  }, [employees, checkedInIds]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendance - Today</h2>
          <p className="text-sm text-gray-600">Manual check-in/out and who’s in/out now</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Total: {summary.total}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">In: {summary.inCount}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Out: {summary.outCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.slice(0, 9).map((emp) => {
          const isIn = checkedInIds.has(emp.id);
          return (
            <div key={emp.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <img
                  src={emp.photo_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                  alt={`${emp.first_name} ${emp.last_name}`}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{emp.first_name} {emp.last_name}</p>
                  <p className="text-xs text-gray-600 truncate">{emp.job_title || '—'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isIn ? (
                  <>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">In</span>
                    <button
                      onClick={() => handleCheckOut(emp.id)}
                      className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                    >
                      Check Out
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Out</span>
                    <button
                      onClick={() => handleCheckIn(emp.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Check In
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {employees.length > 9 && (
        <p className="text-xs text-gray-500 mt-3">Showing first 9 employees.</p>
      )}
    </div>
  );
}


