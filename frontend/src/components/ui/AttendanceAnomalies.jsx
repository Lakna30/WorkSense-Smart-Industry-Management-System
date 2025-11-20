import React, { useMemo, useState } from 'react';

// UI-only detection of attendance anomalies: late arrival, early departure, overtime
// Expects records: [{ date: 'YYYY-MM-DD', employeeId, checkIn: 'HH:MM', checkOut: 'HH:MM', hours: number, status }]
// and employees: [{ id, first_name, last_name, email }]
export default function AttendanceAnomalies({ records = [], employees = [] }) {
  const [workdayStart, setWorkdayStart] = useState('09:00');
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [workdayEnd, setWorkdayEnd] = useState('17:00');
  const [overtimeHours, setOvertimeHours] = useState(8);

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const toMinutes = (hhmm) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const startMin = toMinutes(workdayStart);
  const endMin = toMinutes(workdayEnd);

  const anomalies = useMemo(() => {
    const list = [];
    records.forEach((r) => {
      const emp = employeeMap.get(r.employeeId);
      const name = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : r.employeeId;
      const checkInMin = toMinutes(r.checkIn);
      const checkOutMin = toMinutes(r.checkOut);

      const isLate = checkInMin != null && startMin != null && checkInMin > (startMin + graceMinutes);
      const isEarlyLeave = checkOutMin != null && endMin != null && checkOutMin < endMin;
      const isOvertime = r.hours != null && r.hours > overtimeHours;

      if (isLate) list.push({ type: 'Late Arrival', date: r.date, name, detail: r.checkIn || 'N/A' });
      if (isEarlyLeave) list.push({ type: 'Early Departure', date: r.date, name, detail: r.checkOut || 'N/A' });
      if (isOvertime) list.push({ type: 'Overtime', date: r.date, name, detail: `${r.hours} h` });
    });
    return list;
  }, [records, employeeMap, startMin, endMin, graceMinutes, overtimeHours]);

  const counts = useMemo(() => {
    const c = { late: 0, early: 0, overtime: 0 };
    anomalies.forEach((a) => {
      if (a.type === 'Late Arrival') c.late += 1;
      if (a.type === 'Early Departure') c.early += 1;
      if (a.type === 'Overtime') c.overtime += 1;
    });
    return c;
  }, [anomalies]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendance Anomalies</h2>
          <p className="text-sm text-gray-600">Late arrivals, early departures, and overtime</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Late: {counts.late}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Early: {counts.early}</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Overtime: {counts.overtime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Workday Start</label>
          <input type="time" value={workdayStart} onChange={(e) => setWorkdayStart(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Grace Minutes</label>
          <input type="number" min="0" value={graceMinutes} onChange={(e) => setGraceMinutes(parseInt(e.target.value || '0', 10))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Workday End</label>
          <input type="time" value={workdayEnd} onChange={(e) => setWorkdayEnd(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Overtime Threshold (hours)</label>
          <input type="number" min="0" step="0.5" value={overtimeHours} onChange={(e) => setOvertimeHours(parseFloat(e.target.value || '0'))} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anomaly</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {anomalies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-gray-500">No anomalies detected</td>
              </tr>
            ) : (
              anomalies.slice(0, 50).map((a, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{a.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{a.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{a.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{a.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {anomalies.length > 50 && (
          <p className="text-xs text-gray-500 mt-2">Showing first 50 rows.</p>
        )}
      </div>
    </div>
  );
}


