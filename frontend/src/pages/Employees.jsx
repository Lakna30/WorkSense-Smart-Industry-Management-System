import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineAdjustments, HiOutlineUsers, 
         HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineX, HiOutlineClock,
         HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { employeeAPI } from '../lib/api.js';
import EmployeeCard from '../components/ui/EmployeeCard.jsx';
import EmployeeModal from '../components/ui/EmployeeModal.jsx';
import EmployeeForm from '../components/ui/EmployeeForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmployeeOverview from '../components/ui/EmployeeOverview.jsx';
import { useMqttAttendance } from './useMqttAttendance.js';
import testSharedMqtt from './testSharedMqtt.js';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // Filter options
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  // Toast and confirm
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState({ open: false, employeeId: null });
  
  // Admin state (for demo purposes, you can implement proper auth later)
  const [isAdmin] = useState(true);
  const [now, setNow] = useState(new Date());
  
  // MQTT Attendance
  const { connected: mqttConnected, attendanceEvents, lastEvent } = useMqttAttendance({});
  
  // Attendance data state
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Attendance helpers (shared convention with Attendance page)
  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const getStorageKey = (date) => `worksense_attendance_${date}`;
  const readAttendanceForDate = (date) => {
    try {
      const raw = localStorage.getItem(getStorageKey(date));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  // (payroll helpers removed; handled in EmployeesPayroll)

  // Normalize employee status coming from backend to 'active' | 'inactive'
  const getEmployeeStatus = (emp) => {
    const raw = emp?.status ?? emp?.employment_status ?? emp?.is_active ?? emp?.active;
    if (typeof raw === 'boolean') return raw ? 'active' : 'inactive';
    if (raw === undefined || raw === null) return 'inactive';
    const s = String(raw).toLowerCase().trim();
    if (s === 'active' || s === 'enabled' || s === 'current' || s === 'true' || s === '1') return 'active';
    return 'inactive';
  };
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) return null;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  const isActiveNow = (attendanceRec) => {
    if (!attendanceRec) return false;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const inMin = parseTimeToMinutes(attendanceRec.checkIn);
    const outMin = parseTimeToMinutes(attendanceRec.checkOut);
    if (inMin === null) return false; // no check-in means inactive
    if (outMin !== null && nowMins >= outMin) return false; // checked out already
    return nowMins >= inMin; // after check-in and before checkout
  };

  // Real-time attendance counts from MQTT data
  const attendanceCounts = useMemo(() => {
    const checkedIn = attendanceData.filter(record => record.is_checked_in).length;
    const checkedOut = attendanceData.filter(record => !record.is_checked_in).length;
    const pendingCheckout = attendanceData.filter(record => record.is_checked_in && !record.check_out_time).length;
    
    return { 
      active: checkedIn, 
      inactive: checkedOut,
      pendingCheckout,
      total: attendanceData.length
    };
  }, [attendanceData]);

  // Get employee attendance status by name
  const getEmployeeAttendanceStatus = (employeeName) => {
    const record = attendanceData.find(record => 
      record.employee_name.toLowerCase().includes(employeeName.toLowerCase())
    );
    
    if (!record) return { status: 'not_present', record: null };
    
    if (record.is_checked_in && !record.check_out_time) {
      return { status: 'checked_in', record };
    } else if (record.check_out_time) {
      return { status: 'checked_out', record };
    } else {
      return { status: 'unknown', record };
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchFilterOptions();
    fetchTodayAttendance();
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Refresh attendance data when new MQTT events arrive
  useEffect(() => {
    if (lastEvent && lastEvent.processed) {
      fetchTodayAttendance();
    }
  }, [lastEvent]);

  // Fetch today's attendance data
  const fetchTodayAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const response = await fetch('http://localhost:4000/api/attendance/today');
      const result = await response.json();
      
      if (result.success) {
        setAttendanceData(result.data.attendance || []);
        console.log('📊 Fetched attendance data:', result.data);
      }
    } catch (err) {
      console.error('❌ Error fetching attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedDepartment) params.department = selectedDepartment;
      if (selectedRole) params.role = selectedRole;
      
      const response = await employeeAPI.getAll(params);
      setEmployees(response.data.data);
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Enforce fixed departments per spec
      setDepartments(['HR', 'IT', 'Sales', 'Marketing', 'Finance']);
      // Try to fetch job titles, fallback to empty
      const titleResponse = await employeeAPI.getJobTitles().catch(() => null);
      setJobTitles(titleResponse?.data?.data || []);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const handleSearch = () => {
    fetchEmployees();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedRole('');
    fetchEmployees();
  };

  const handleViewMore = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
    setIsModalOpen(false);
  };

  const handleDelete = async (employeeId) => {
    setConfirmState({ open: true, employeeId });
  };

  const confirmDelete = async () => {
    try {
      await employeeAPI.delete(confirmState.employeeId);
      setConfirmState({ open: false, employeeId: null });
      fetchEmployees();
      setToast({ type: 'success', message: 'Employee deleted successfully' });
      setTimeout(() => setToast(null), 2500);
      setError(null);
    } catch (err) {
      setConfirmState({ open: false, employeeId: null });
      setToast({ type: 'error', message: 'Failed to delete employee' });
      setTimeout(() => setToast(null), 3000);
      console.error('Error deleting employee:', err);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, formData);
      } else {
        await employeeAPI.create(formData);
      }
      
      setIsFormOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
      setError(null);
      setToast({ type: 'success', message: editingEmployee ? 'Employee updated' : 'Employee added' });
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save employee');
      console.error('Error saving employee:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Failed to save employee' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const exportEmployeeInsightsPDF = () => {
    const styles = `
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"; padding: 24px; color: #111827; }
        h1 { font-size: 18px; margin: 0 0 8px 0; }
        .meta { font-size: 12px; color: #6B7280; margin-bottom: 16px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 14px; margin: 0 0 8px 0; color: #374151; }
        .insight-item { margin-bottom: 8px; font-size: 12px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .stat-item { padding: 8px; border: 1px solid #E5E7EB; border-radius: 4px; }
        .stat-label { font-size: 10px; color: #6B7280; margin-bottom: 2px; }
        .stat-value { font-size: 12px; font-weight: 600; }
      </style>
    `;

    const attendanceTrend = [80, 82, 78, 85, 83];
    const attendanceTrendHTML = attendanceTrend.map((val, idx) => 
      `<div class="insight-item">Week ${idx + 1}: ${val}%</div>`
    ).join('');


    // Updated AI suggestions
    const aiSuggestions = [
      'OT costs trending high - consider optimizing shift distributions.',
      'Strong attendance trend - implement reward system.',
      'Employee satisfaction scores are above industry average.',
      'Consider implementing flexible work arrangements.'
    ];
    const aiSuggestionsHTML = aiSuggestions.map(suggestion => 
      `<div class="insight-item">• ${suggestion}</div>`
    ).join('');

    const activeCount = employees.filter(e => getEmployeeStatus(e) === 'active').length;
    const inactiveCount = employees.filter(e => getEmployeeStatus(e) === 'inactive').length;

    const statsHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Employees</div>
          <div class="stat-value">${employees.length}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Active</div>
          <div class="stat-value">${activeCount}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Inactive</div>
          <div class="stat-value">${inactiveCount}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Departments</div>
          <div class="stat-value">${departments.length}</div>
        </div>
      </div>
    `;

    const html = `
      <html>
        <head>
          <title>Employee Insights Report</title>
          ${styles}
        </head>
        <body>
          <h1>Employee Insights Report</h1>
          <div class="meta">${new Date().toLocaleString()}</div>
          
          <div class="section">
            <h2>Employee Statistics</h2>
            ${statsHTML}
          </div>
          
          <div class="section">
            <h2>Attendance Trend (30 days)</h2>
            ${attendanceTrendHTML}
          </div>

          
          <div class="section">
            <h2>AI-Based Insights</h2>
            ${aiSuggestionsHTML}
          </div>
          
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

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Directory</h1>
          <p className="text-gray-600">Manage and view employee profiles</p>
        </div>

        {/* Employee Overview dashboard */}
        <EmployeeOverview employees={employees} />

        {/* Reports & Analytics */}
        <div className="mt-6 mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6"> {/* Added mb-12 class */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Employee Insights</h2>
            <button 
              onClick={exportEmployeeInsightsPDF}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
            >
              Export PDF
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Trend */}
            <div className="col-span-1 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-800 mb-3">Attendance % (30 days)</p>
              <div className="space-y-2">
                {[80, 82, 78, 85, 83].map((val, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Week {idx + 1}</span>
                      <span>{val}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                      <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payroll Snapshot (static demo values) */}
            <div className="col-span-1 p-4 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-800 mb-3">Payroll Snapshot</p>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between"><span>Total Employees</span><span>{employees.length}</span></div>
                <div className="flex justify-between"><span>Avg Salary</span><span>LKR 45,000</span></div>
                <div className="flex justify-between"><span>OT Hours</span><span>124h</span></div>
                <div className="flex justify-between"><span>OT Cost</span><span>LKR 186,000</span></div>
              </div>
            </div>


            {/* AI Suggestions - Updated based on all metrics */}
            <div className="col-span-1 p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="font-medium text-gray-800 mb-3">AI Suggestions</p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li>• OT costs trending high - consider optimizing work distributions.</li>
                <li>• Strong attendance trend - implement reward system.</li>
                <li>• Employee satisfaction scores are above industry average.</li>
                <li>• Consider implementing flexible work arrangements.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Real-time Attendance Status */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Real-time Attendance</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchTodayAttendance}
                disabled={attendanceLoading}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {attendanceLoading ? 'Refreshing...' : 'Refresh'}
              </button>
                <button
                  onClick={testSharedMqtt}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Test Shared MQTT
                </button>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${mqttConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {mqttConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          {lastEvent ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {lastEvent.action === 'check_in' ? (
                    <HiOutlineCheckCircle className="text-green-500" />
                  ) : lastEvent.action === 'check_out' ? (
                    <HiOutlineXCircle className="text-red-500" />
                  ) : (
                    <HiOutlineClock className="text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {lastEvent.employee} - {lastEvent.action === 'check_in' ? 'Checked In' : 
                     lastEvent.action === 'check_out' ? 'Checked Out' : 'Event Processed'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(lastEvent.ts).toLocaleString()} • UID: {lastEvent.uid}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-500">Waiting for MQTT events...</p>
              <p className="text-sm text-gray-400 mt-1">
                Make sure your ESP32 is sending data to esp32c3/events topic
              </p>
            </div>
          )}
          
          {/* Debug: Show recent events */}
          {attendanceEvents.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Events ({attendanceEvents.length})</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {attendanceEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <span className="font-medium">{event.employee}</span> - 
                    <span className={`ml-1 ${event.processed ? 'text-green-600' : 'text-red-600'}`}>
                      {event.action || 'Processing...'}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {new Date(event.ts).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              label: 'Checked In', 
              value: attendanceCounts.active, 
              icon: HiOutlineCheckCircle, 
              color: 'text-green-600 bg-green-100',
              borderColor: 'border-green-200'
            },
            { 
              label: 'Checked Out', 
              value: attendanceCounts.inactive, 
              icon: HiOutlineXCircle, 
              color: 'text-red-600 bg-red-100',
              borderColor: 'border-red-200'
            },
            { 
              label: 'Pending Checkout', 
              value: attendanceCounts.pendingCheckout, 
              icon: HiOutlineClock, 
              color: 'text-yellow-600 bg-yellow-100',
              borderColor: 'border-yellow-200'
            },
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

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {jobTitles.map((title, index) => (
              <option key={index} value={title}>{title}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
            >
              <HiOutlineSearch className="w-4 h-4 mr-2" />
              Search
            </button>
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
            >
              <HiOutlineX className="w-4 h-4 mr-2" />
              Clear
            </button>
            {isAdmin && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <HiOutlinePlus className="w-4 h-4 mr-2" />
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Employee Table */}
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedDepartment || selectedRole 
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding your first employee.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {isAdmin && <th className="px-6 py-3" />}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          {e.photo_url ? (
                            <img src={e.photo_url} alt="" className="w-8 h-8 object-cover" />
                          ) : (
                            <div className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">{(e.first_name?.[0] || '?')}{(e.last_name?.[0] || '')}</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{e.first_name} {e.last_name}</div>
                          <div className="text-sm text-gray-500">{e.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{e.position || e.job_title || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{e.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{e.hire_date ? new Date(e.hire_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const attendanceStatus = getEmployeeAttendanceStatus(`${e.first_name} ${e.last_name}`);
                        const { status, record } = attendanceStatus;
                        
                        if (status === 'checked_in') {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <HiOutlineCheckCircle className="w-3 h-3 mr-1" />
                                Checked In
                              </span>
                              <span className="text-xs text-gray-500">
                                {record.check_in_time}
                              </span>
                            </div>
                          );
                        } else if (status === 'checked_out') {
                          return (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <HiOutlineXCircle className="w-3 h-3 mr-1" />
                                Checked Out
                              </span>
                              <span className="text-xs text-gray-500">
                                {record.check_out_time}
                              </span>
                            </div>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              <HiOutlineClock className="w-3 h-3 mr-1" />
                              Not Present
                            </span>
                          );
                        }
                      })()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button onClick={() => handleEdit(e)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Edit</button>
                        <button onClick={() => handleDelete(e.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Employee Detail Modal */}
        <EmployeeModal
          employee={selectedEmployee}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onEdit={handleEdit}
          isAdmin={isAdmin}
        />

        {/* Employee Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h2>
              </div>
              <div className="p-6">
                <EmployeeForm
                  employee={editingEmployee}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  departments={departments}
                  jobTitles={jobTitles}
                />
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmState.open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Delete employee?</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
              </div>
              <div className="p-6 flex justify-end gap-3">
                <button onClick={() => setConfirmState({ open: false, employeeId: null })} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
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


