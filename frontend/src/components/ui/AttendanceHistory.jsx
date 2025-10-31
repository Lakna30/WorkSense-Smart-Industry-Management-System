import React, { useMemo, useState } from 'react';

// UI-only attendance history with simple filters and CSV export
export default function AttendanceHistory({ records = [], employees = [] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const employeeMap = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => map.set(e.id, e));
    return map;
  }, [employees]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      if (search) {
        const emp = employeeMap.get(r.employeeId);
        const text = [emp?.first_name, emp?.last_name, emp?.email, emp?.job_title].filter(Boolean).join(' ').toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [records, statusFilter, fromDate, toDate, search, employeeMap]);

  

  const downloadPdf = () => {
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px 0; }
        .meta { font-size: 12px; color: #6B7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #E5E7EB; padding: 8px; font-size: 12px; }
        th { background: #F9FAFB; text-align: left; }
        .right { text-align: right; }
      </style>
    `;

    const header = ['Date', 'Employee', 'Status', 'Check In', 'Check Out', 'Hours'];
    const rows = filtered.map((r) => {
      const emp = employeeMap.get(r.employeeId);
      const name = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : r.employeeId;
      return [r.date, name, r.status || '', r.checkIn || '', r.checkOut || '', r.hours != null ? String(r.hours) : ''];
    });

    const tableHead = `<tr>${header.map((h) => `<th>${h}</th>`).join('')}</tr>`;
    const tableBody = rows.map((row) => `<tr>${row.map((c, i) => `<td${i === 5 ? ' class=\"right\"' : ''}>${c || ''}</td>`).join('')}</tr>`).join('');

    const meta = `Filters: ${statusFilter || 'All'} | ${fromDate || '—'} to ${toDate || '—'} | Search: ${search || '—'}`;

    const html = `
      <html>
        <head>
          <title>Attendance History Report</title>
          ${styles}
        </head>
        <body>
          <h1>Attendance History Report</h1>
          <div class=\"meta\">${new Date().toLocaleString()} • ${meta}</div>
          <table>
            <thead>${tableHead}</thead>
            <tbody>${tableBody || '<tr><td colspan=\"6\">No records</td></tr>'}</tbody>
          </table>
          <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 300); };</script>
        </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
          <p className="text-sm text-gray-600">Filter and export records</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={downloadPdf} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">Download PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employee..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="leave">Leave</option>
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        <button onClick={() => { setSearch(''); setStatusFilter(''); setFromDate(''); setToDate(''); }} className="bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-300">Clear</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-gray-500">No records found</td>
              </tr>
            ) : (
              filtered.slice(0, 50).map((r, idx) => {
                const emp = employeeMap.get(r.employeeId);
                const name = emp ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim() : r.employeeId;
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{r.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{name}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm capitalize text-gray-900">{r.status || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{r.checkIn || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{r.checkOut || '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{r.hours != null ? r.hours : '—'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filtered.length > 50 && (
          <p className="text-xs text-gray-500 mt-2">Showing first 50 rows.</p>
        )}
      </div>
    </div>
  );
}


