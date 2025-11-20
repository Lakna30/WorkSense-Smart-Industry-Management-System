import React, { useEffect, useMemo, useState } from 'react';

// Enhanced UI-only payroll panel with editable salaries, adjustments, history, graph, and CSV export
export default function PayrollPanel({ employees = [], baseSalaries = {}, month = undefined, records = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = month ? new Date(month) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  });

  const [editableBase, setEditableBase] = useState({});
  const [adjustments, setAdjustments] = useState({}); // { [empId]: { allowance, bonus, deduction } }
  const [history, setHistory] = useState([]); // payslip snapshots
  const [statuses, setStatuses] = useState({}); // { [YYYY-MM]: { [empId]: 'Paid' | 'Pending' } }
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when status changes

  const monthLabel = useMemo(() => {
    const [yy, mm] = selectedMonth.split('-');
    const d = new Date(parseInt(yy, 10), parseInt(mm, 10) - 1, 1);
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [selectedMonth]);

  // helpers
  const WORK_HOURS_PER_DAY = 8;
  const WORK_DAYS_PER_MONTH = 22;
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  const diffMinutes = (checkIn, checkOut) => {
    const inMin = parseTimeToMinutes(checkIn);
    const outMin = parseTimeToMinutes(checkOut);
    if (inMin === null || outMin === null) return 0;
    const d = outMin - inMin;
    return d > 0 ? d : 0;
  };
  const getMonthDateStrings = (ym) => {
    const [yy, mm] = ym.split('-').map((v) => parseInt(v, 10));
    const daysInMonth = new Date(yy, mm, 0).getDate();
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const m2 = String(mm).padStart(2, '0');
      const d2 = String(d).padStart(2, '0');
      arr.push(`${yy}-${m2}-${d2}`);
    }
    return arr;
  };
  const readAttendanceForDate = (date) => {
    try {
      const raw = localStorage.getItem(`worksense_attendance_${date}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // Load payroll statuses from database
  const loadPayrollStatuses = async (month) => {
    try {
      const response = await fetch(`http://localhost:4000/api/payroll/statuses/${month}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Convert array to object format expected by component
          const statusesByEmployee = {};
          result.data.forEach(item => {
            statusesByEmployee[item.employee_id] = item.status;
          });
          
          setStatuses(prev => ({
            ...prev,
            [month]: statusesByEmployee
          }));
        }
      }
    } catch (error) {
      console.error('Error loading payroll statuses from database:', error);
      // Fallback to localStorage
      try {
        const storedStatuses = JSON.parse(localStorage.getItem('payroll.statuses') || '{}');
        setStatuses(storedStatuses && typeof storedStatuses === 'object' ? storedStatuses : {});
      } catch (localError) {
        console.error('Error loading statuses from localStorage:', localError);
      }
    }
  };

  // Load statuses from database when component mounts or month changes
  useEffect(() => {
    loadPayrollStatuses(selectedMonth);
  }, [selectedMonth]);

  // hydrate other data from localStorage
  useEffect(() => {
    try {
      const storedBase = JSON.parse(localStorage.getItem('payroll.baseSalaries') || '{}');
      const storedAdj = JSON.parse(localStorage.getItem('payroll.adjustments') || '{}');
      const storedHistory = JSON.parse(localStorage.getItem('payroll.history') || '[]');
      // seed base from API employees.salary where missing
      const seededFromEmployees = employees.reduce((acc, emp) => {
        if (emp && emp.id != null) acc[emp.id] = Number(emp.salary || 0);
        return acc;
      }, {});
      setEditableBase((prev) => ({ ...prev, ...seededFromEmployees, ...storedBase, ...baseSalaries }));
      setAdjustments((prev) => ({ ...prev, ...storedAdj }));
      setHistory(Array.isArray(storedHistory) ? storedHistory : []);
    } catch {}
  }, [employees]);

  // persist
  useEffect(() => {
    try { localStorage.setItem('payroll.baseSalaries', JSON.stringify(editableBase)); } catch {}
  }, [editableBase]);
  useEffect(() => {
    try { localStorage.setItem('payroll.adjustments', JSON.stringify(adjustments)); } catch {}
  }, [adjustments]);
  useEffect(() => {
    try { localStorage.setItem('payroll.history', JSON.stringify(history)); } catch {}
  }, [history]);
  useEffect(() => {
    try { localStorage.setItem('payroll.statuses', JSON.stringify(statuses)); } catch {}
  }, [statuses]);

  const monthRecords = useMemo(() => {
    const [yy, mm] = selectedMonth.split('-');
    const prefix = `${yy}-${mm}`; // YYYY-MM
    return records.filter((r) => r.date && r.date.startsWith(prefix));
  }, [records, selectedMonth]);

  const byEmployee = useMemo(() => {
    const map = new Map();
    monthRecords.forEach((r) => {
      if (!map.has(r.employeeId)) map.set(r.employeeId, []);
      map.get(r.employeeId).push(r);
    });
    return map;
  }, [monthRecords]);

  const calcForEmployee = (empId, forMonth = selectedMonth) => {
    const base = Number((editableBase && editableBase[empId]) ?? (baseSalaries && baseSalaries[empId]) ?? 0);
    // Derive attendance-based hours for the selected month from localStorage
    const dateKeys = getMonthDateStrings(forMonth);
    let workedMinutes = 0;
    for (const d of dateKeys) {
      const map = readAttendanceForDate(d);
      const rec = map[empId];
      if (rec && rec.checkIn && rec.checkOut) {
        workedMinutes += diffMinutes(rec.checkIn, rec.checkOut);
      }
    }
    const totalHours = workedMinutes / 60;
    const normalMinutes = WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY * 60;
    const overtimeMinutes = Math.max(0, workedMinutes - normalMinutes);
    const overtimeHours = overtimeMinutes / 60;

    const empAdj = adjustments[empId] || { allowance: 0, bonus: 0, deduction: 0 };
    const allowance = Number(empAdj.allowance || 0);
    const bonus = Number(empAdj.bonus || 0);
    const manualDeduction = Number(empAdj.deduction || 0);

    const normalHourlyRate = (WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY) > 0 ? (base / (WORK_DAYS_PER_MONTH * WORK_HOURS_PER_DAY)) : 0;
    const overtimeHourlyRate = normalHourlyRate * 1.5;
    const overtimePay = overtimeHours * overtimeHourlyRate;

    const gross = base + allowance + bonus + overtimePay;
    const deductions = manualDeduction;
    const net = Math.max(0, Math.round((gross - deductions) * 100) / 100);
    return {
      base,
      hours: Math.round(totalHours * 100) / 100,
      overtime: Math.round(overtimeHours * 100) / 100,
      allowance: Math.round(allowance * 100) / 100,
      bonus: Math.round(bonus * 100) / 100,
      overtimePay: Math.round(overtimePay * 100) / 100,
      deductions: Math.round(deductions * 100) / 100,
      gross: Math.round(gross * 100) / 100,
      net
    };
  };

  const snapshotForEmployee = (emp) => {
    const calc = calcForEmployee(emp.id);
    return {
      employeeId: emp.id,
      employeeName: `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
      employeeEmail: emp.email || '',
      employeeCode: emp.employee_id || emp.id,
      month: selectedMonth,
      ...calc,
      generatedAt: new Date().toISOString()
    };
  };

  const renderPayslipHTML = (emp, calc, monthLabelStr) => {
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px 0; }
        h2 { font-size: 14px; margin: 12px 0 6px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #E5E7EB; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #F9FAFB; }
        .meta { font-size: 12px; color: #6B7280; margin-bottom: 12px; }
      </style>
    `;
    const html = `
      <html>
        <head>
          <title>Payslip - ${(emp.first_name || '') + ' ' + (emp.last_name || '')} - ${monthLabelStr}</title>
          ${styles}
        </head>
        <body>
          <h1>Payslip</h1>
          <div class="meta">${monthLabelStr} • Generated ${new Date().toLocaleString()}</div>
          <h2>Employee</h2>
          <table>
            <tbody>
              <tr><th>Name</th><td>${(emp.first_name || '') + ' ' + (emp.last_name || '')}</td></tr>
              <tr><th>Email</th><td>${emp.email || '—'}</td></tr>
              <tr><th>Employee ID</th><td>${emp.employee_id || emp.id}</td></tr>
            </tbody>
          </table>
          <h2>Summary</h2>
          <table>
            <tbody>
              <tr><th>Base Salary</th><td>LKR ${calc.base.toFixed(2)}</td></tr>
              <tr><th>Allowance</th><td>LKR ${(calc.allowance || 0).toFixed(2)}</td></tr>
              <tr><th>Bonus</th><td>LKR ${(calc.bonus || 0).toFixed(2)}</td></tr>
              <tr><th>Overtime Hours</th><td>${calc.overtime}</td></tr>
              <tr><th>Overtime Pay</th><td>LKR ${calc.overtimePay.toFixed(2)}</td></tr>
              <tr><th>Deductions</th><td>LKR ${calc.deductions.toFixed(2)}</td></tr>
              <tr><th>Gross Pay</th><td>LKR ${calc.gross.toFixed(2)}</td></tr>
              <tr><th>Net Pay</th><td><strong>LKR ${calc.net.toFixed(2)}</strong></td></tr>
            </tbody>
          </table>
          <script>window.onload = function(){ window.print(); setTimeout(()=>window.close(), 300); };</script>
        </body>
      </html>
    `;
    return html;
  };

  const downloadPayslip = (emp) => {
    const calc = calcForEmployee(emp.id);
    const html = renderPayslipHTML(emp, calc, monthLabel);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();

    // store history snapshot
    const snap = snapshotForEmployee(emp);
    setHistory((prev) => [{ ...snap }, ...prev].slice(0, 500));
  };

  const redownloadFromSnapshot = (snap) => {
    const emp = {
      id: snap.employeeId,
      first_name: (snap.employeeName || '').split(' ')[0] || '',
      last_name: (snap.employeeName || '').split(' ').slice(1).join(' ') || '',
      email: snap.employeeEmail || '',
      employee_id: snap.employeeCode || snap.employeeId
    };
    const [yy, mm] = (snap.month || selectedMonth).split('-');
    const d = new Date(parseInt(yy, 10), parseInt(mm, 10) - 1, 1);
    const monthLbl = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    const calc = {
      base: Number(snap.base || 0),
      allowance: Number(snap.allowance || 0),
      bonus: Number(snap.bonus || 0),
      overtime: Number(snap.overtime || 0),
      overtimePay: Number(snap.overtimePay || 0),
      deductions: Number(snap.deductions || 0),
      gross: Number(snap.gross || 0),
      net: Number(snap.net || 0)
    };
    const html = renderPayslipHTML(emp, calc, monthLbl);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const updateBase = (empId, value) => {
    setEditableBase((prev) => ({ ...prev, [empId]: value }));
  };

  const updateAdjustment = (empId, key, value) => {
    setAdjustments((prev) => ({
      ...prev,
      [empId]: { allowance: 0, bonus: 0, deduction: 0, ...(prev[empId] || {}), [key]: value }
    }));
  };

  const getStatusForEmployee = (empId) => {
    const byMonth = statuses[selectedMonth] || {};
    return byMonth[empId] || 'Pending';
  };
  const setStatusForEmployee = async (empId, value) => {
    try {
      // Update in database
      const response = await fetch(`http://localhost:4000/api/payroll/status/${empId}/${selectedMonth}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: value })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payroll status');
      }
      
      // Update local state
      setStatuses((prev) => {
        const byMonth = prev[selectedMonth] ? { ...prev[selectedMonth] } : {};
        byMonth[empId] = value;
        const next = { ...prev, [selectedMonth]: byMonth };
        // Also persist to localStorage as backup
        try { localStorage.setItem('payroll.statuses', JSON.stringify(next)); } catch {}
        return next;
      });
      setRefreshKey(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('Error updating payroll status:', error);
      // Fallback to localStorage only
      setStatuses((prev) => {
        const byMonth = prev[selectedMonth] ? { ...prev[selectedMonth] } : {};
        byMonth[empId] = value;
        const next = { ...prev, [selectedMonth]: byMonth };
        try { localStorage.setItem('payroll.statuses', JSON.stringify(next)); } catch {}
        return next;
      });
      setRefreshKey(prev => prev + 1);
    }
  };
  const toggleStatusForEmployee = (empId) => {
    const current = getStatusForEmployee(empId);
    setStatusForEmployee(empId, current === 'Paid' ? 'Pending' : 'Paid');
  };

  const exportPDF = () => {
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 24px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px 0; }
        .meta { font-size: 12px; color: #6B7280; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #E5E7EB; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #F9FAFB; }
        .totals { margin: 12px 0; display: flex; gap: 16px; font-size: 12px; }
        .totals div { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 8px 10px; border-radius: 6px; }
      </style>
    `;
    const rowsHTML = employees.map((emp) => {
      const c = calcForEmployee(emp.id);
      const name = `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
      const code = emp.employee_id || emp.id;
      return `
        <tr>
          <td>${code}</td>
          <td>${name}</td>
          <td>${emp.email || ''}</td>
          <td>LKR ${c.base.toFixed(2)}</td>
          <td>LKR ${(c.allowance || 0).toFixed(2)}</td>
          <td>LKR ${(c.bonus || 0).toFixed(2)}</td>
          <td>${c.overtime}</td>
          <td>LKR ${c.overtimePay.toFixed(2)}</td>
          <td>LKR ${c.deductions.toFixed(2)}</td>
          <td>LKR ${c.gross.toFixed(2)}</td>
          <td><strong>LKR ${c.net.toFixed(2)}</strong></td>
        </tr>
      `;
    }).join('');

    const totals = employees.reduce((acc, emp) => {
      const c = calcForEmployee(emp.id);
      acc.gross += c.base + (c.allowance || 0) + (c.bonus || 0) + c.overtimePay;
      acc.deductions += c.deductions;
      acc.net += c.net;
      return acc;
    }, { gross: 0, deductions: 0, net: 0 });

    const html = `
      <html>
        <head>
          <title>Payroll Summary - ${monthLabel}</title>
          ${styles}
        </head>
        <body>
          <h1>Payroll Summary</h1>
          <div class="meta">${monthLabel} • Generated ${new Date().toLocaleString()}</div>
          <div class="totals">
            <div>Gross: <strong>LKR ${(Math.round(totals.gross * 100) / 100).toFixed(2)}</strong></div>
            <div>Deductions: <strong>LKR ${(Math.round(totals.deductions * 100) / 100).toFixed(2)}</strong></div>
            <div>Net: <strong>LKR ${(Math.round(totals.net * 100) / 100).toFixed(2)}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Base</th>
                <th>Allowance</th>
                <th>Bonus</th>
                <th>Overtime (h)</th>
                <th>Overtime Pay</th>
                <th>Deductions</th>
                <th>Gross</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
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

  const totalsForSelectedMonth = useMemo(() => {
    const totals = employees.reduce((acc, emp) => {
      const c = calcForEmployee(emp.id, selectedMonth);
      acc.gross += c.base + (c.allowance || 0) + (c.bonus || 0) + c.overtimePay;
      acc.deductions += c.deductions;
      acc.net += c.net;
      return acc;
    }, { gross: 0, deductions: 0, net: 0 });
    return {
      gross: Math.round(totals.gross * 100) / 100,
      deductions: Math.round(totals.deductions * 100) / 100,
      net: Math.round(totals.net * 100) / 100
    };
  }, [employees, editableBase, adjustments, selectedMonth]);

  const monthKeyFromDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const formatLKR = (n) => `LKR ${Math.round(n).toLocaleString()}`;

  const monthlyNetSeries = useMemo(() => {
    // Build last 6 months including selectedMonth, using current employees and settings
    const [yy, mm] = selectedMonth.split('-').map((x) => parseInt(x, 10));
    const baseDate = new Date(yy, mm - 1, 1);
    const out = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const key = monthKeyFromDate(d);
      const totalNet = employees.reduce((sum, emp) => sum + calcForEmployee(emp.id, key).net, 0);
      out.push({ key, label: d.toLocaleString(undefined, { month: 'short' }), value: Math.round(totalNet * 100) / 100 });
    }
    return out;
  }, [employees, editableBase, adjustments, selectedMonth]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Payroll</h2>
          <p className="text-sm text-gray-600">Generate monthly payslips, track history, and export PDF</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <button onClick={exportPDF} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">Download PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500">Gross</div>
          <div className="text-base font-semibold text-gray-900">LKR {totalsForSelectedMonth.gross.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500">Deductions</div>
          <div className="text-base font-semibold text-gray-900">LKR {totalsForSelectedMonth.deductions.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <div className="text-xs text-gray-500">Net</div>
          <div className="text-base font-semibold text-gray-900">LKR {totalsForSelectedMonth.net.toFixed(2)}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">Monthly Expenses (Net, last 6 months)</div>
        <div className="bg-white rounded-md border border-gray-200 p-3">
          <svg className="w-full h-44 sm:h-48" viewBox="0 0 680 180" preserveAspectRatio="none" role="img" aria-label="Monthly net chart">
            {(() => {
              const padding = { top: 22, right: 24, bottom: 26, left: 40 };
              const W = 680, H = 180;
              const width = W - padding.left - padding.right;
              const height = H - padding.top - padding.bottom;
              const values = monthlyNetSeries.map((d) => d.value);
              const maxVal = Math.max(1, ...values);
              const minVal = Math.min(0, ...values);
              const yScale = (v) => height - ((v - minVal) / (maxVal - minVal || 1)) * height;
              const xStep = width / Math.max(1, monthlyNetSeries.length - 1);
              const points = monthlyNetSeries.map((d, i) => ({
                x: padding.left + i * xStep,
                y: padding.top + yScale(d.value),
                label: d.label,
                value: d.value
              }));
              const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + height} L ${points[0].x} ${padding.top + height} Z`;
              const yTicks = 4;
              const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
                const t = minVal + (i / yTicks) * (maxVal - minVal);
                return { y: padding.top + yScale(t), v: t };
              });
              return (
                <g>
                  <defs>
                    <linearGradient id="netArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* grid */}
                  {ticks.map((t, idx) => (
                    <g key={idx}>
                      <line x1={padding.left} x2={W - padding.right} y1={t.y} y2={t.y} stroke="#e5e7eb" strokeWidth="1" />
                      <text x={padding.left - 8} y={t.y + 4} fontSize="10" fill="#6b7280" textAnchor="end">{`LKR ${Math.round(t.v).toLocaleString()}`}</text>
                    </g>
                  ))}
                  {/* x labels */}
                  {points.map((p, idx) => (
                    <text key={`x-${idx}`} x={p.x} y={H - 6} fontSize="10" fill="#6b7280" textAnchor="middle">{p.label}</text>
                  ))}
                  {/* area */}
                  <path d={areaD} fill="url(#netArea)" />
                  {/* line */}
                  <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" />
                  {/* points */}
                  {points.map((p, idx) => (
                    <g key={`p-${idx}`}> 
                      <circle cx={p.x} cy={p.y} r={3} fill="#ef4444" />
                    </g>
                  ))}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table key={refreshKey} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime (h)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OT (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net (LKR)</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-sm text-gray-500">No employees</td>
              </tr>
            ) : (
              employees.slice(0, 50).map((emp) => {
                const c = calcForEmployee(emp.id);
                const status = getStatusForEmployee(emp.id);
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{(emp.first_name || '') + ' ' + (emp.last_name || '')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700"></span>
                        <input
                          type="number"
                          className="w-24 rounded border-gray-300 text-sm"
                          value={Number.isFinite(c.base) ? c.base : 0}
                          onChange={(e) => updateBase(emp.id, Number(e.target.value || 0))}
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{c.overtime}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{c.overtimePay.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700"></span>
                        <input
                          type="number"
                          className="w-20 rounded border-gray-300 text-sm"
                          value={adjustments[emp.id]?.allowance ?? 0}
                          onChange={(e) => updateAdjustment(emp.id, 'allowance', Number(e.target.value || 0))}
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700"></span>
                        <input
                          type="number"
                          className="w-20 rounded border-gray-300 text-sm"
                          value={adjustments[emp.id]?.bonus ?? 0}
                          onChange={(e) => updateAdjustment(emp.id, 'bonus', Number(e.target.value || 0))}
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-700"></span>
                        <input
                          type="number"
                          className="w-20 rounded border-gray-300 text-sm"
                          value={adjustments[emp.id]?.deduction ?? 0}
                          onChange={(e) => updateAdjustment(emp.id, 'deduction', Number(e.target.value || 0))}
                          min={0}
                          step="0.01"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{c.gross.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">{c.net.toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleStatusForEmployee(emp.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        title="Toggle Paid/Pending"
                      >
                        {status}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {employees.length > 50 && (
          <p className="text-xs text-gray-500 mt-2">Showing first 50 employees.</p>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-gray-900">Payslip History</h3>
        <button className="text-xs text-gray-600 hover:text-red-600" onClick={() => setHistory([])}>Clear</button>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No payslips generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allowance</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.slice(0, 100).map((h, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{h.month}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{h.employeeName}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">LKR {Number(h.base || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">LKR {Number(h.allowance || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">LKR {Number(h.bonus || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">LKR {Number(h.deductions || 0).toFixed(2)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">LKR {Number(h.net || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length > 100 && (
              <p className="text-xs text-gray-500 mt-2">Showing first 100 records.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


