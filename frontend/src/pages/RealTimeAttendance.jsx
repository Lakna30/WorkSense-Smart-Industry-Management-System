import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineXCircle, 
         HiOutlineClock, HiOutlineUsers, HiOutlineWifi, HiOutlineX,
         HiOutlineArrowLeft, HiOutlineTrash, HiOutlineExclamation } from 'react-icons/hi';
import { useMqttAttendance } from './useMqttAttendance.js';

export default function RealTimeAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [confirmDialog, setConfirmDialog] = useState({ open: false, employee: null });
  const [clearing, setClearing] = useState(false);
  
  // MQTT Attendance
  const { connected: mqttConnected, attendanceEvents, lastEvent } = useMqttAttendance({});

  // Fetch real-time attendance data
  const fetchRealTimeAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/attendance/realtime');
      const result = await response.json();
      
      if (result.success) {
        setAttendanceData(result.data.attendance || []);
        setLastRefresh(new Date());
        console.log('📊 Fetched real-time attendance:', result.data);
      }
    } catch (err) {
      console.error('❌ Error fetching real-time attendance:', err);
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchRealTimeAttendance();
    const interval = setInterval(fetchRealTimeAttendance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when new MQTT events arrive
  useEffect(() => {
    if (lastEvent && lastEvent.processed) {
      fetchRealTimeAttendance();
    }
  }, [lastEvent]);

  // Clear attendance data for a specific employee
  const clearEmployeeAttendance = async (employee) => {
    try {
      setClearing(true);
      const response = await fetch(`http://localhost:4000/api/attendance/clear/${employee.uid}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh the attendance data
        await fetchRealTimeAttendance();
        setError(null);
        console.log(`✅ Cleared attendance for ${employee.first_name} ${employee.last_name}`);
      } else {
        setError(result.message || 'Failed to clear attendance data');
      }
    } catch (err) {
      setError('Failed to clear attendance data');
      console.error('Error clearing attendance:', err);
    } finally {
      setClearing(false);
      setConfirmDialog({ open: false, employee: null });
    }
  };

  // Handle clear button click
  const handleClearClick = (employee) => {
    setConfirmDialog({ open: true, employee });
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalEmployees = attendanceData.length;
    const checkedIn = attendanceData.filter(record => record.is_checked_in).length;
    const checkedOut = attendanceData.filter(record => !record.is_checked_in).length;
    const pendingCheckout = attendanceData.filter(record => record.is_checked_in && !record.check_out_time).length;
    
    return { totalEmployees, checkedIn, checkedOut, pendingCheckout };
  }, [attendanceData]);

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get employee display name
  const getEmployeeName = (record) => {
    if (record.first_name && record.last_name) {
      return `${record.first_name} ${record.last_name}`;
    }
    return record.employee_name || 'Unknown Employee';
  };

  // Get employee position
  const getEmployeePosition = (record) => {
    return record.job_title || record.position || record.department || '—';
  };

  // Get status badge
  const getStatusBadge = (record) => {
    if (record.is_checked_in && !record.check_out_time) {
      return {
        text: 'Checked In',
        color: 'bg-green-100 text-green-800',
        icon: <HiOutlineCheckCircle className="w-4 h-4" />
      };
    } else if (record.check_out_time) {
      return {
        text: 'Checked Out',
        color: 'bg-red-100 text-red-800',
        icon: <HiOutlineXCircle className="w-4 h-4" />
      };
    } else {
      return {
        text: 'Not Present',
        color: 'bg-gray-100 text-gray-800',
        icon: <HiOutlineClock className="w-4 h-4" />
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Real-Time Attendance</h1>
                <p className="text-sm text-gray-600">Live RFID attendance monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* MQTT Status */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${mqttConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {mqttConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={fetchRealTimeAttendance}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <HiOutlineRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalEmployees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiOutlineUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Checked In</p>
                <p className="text-2xl font-bold text-green-600">{summary.checkedIn}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HiOutlineCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Checked Out</p>
                <p className="text-2xl font-bold text-red-600">{summary.checkedOut}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <HiOutlineXCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Checkout</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.pendingCheckout}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HiOutlineClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Last Refresh Info */}
        <div className="mb-6 text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Recent MQTT Event */}
        {lastEvent && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest RFID Event</h3>
            <div className="flex items-center gap-4">
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
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Attendance List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance Records</h3>
            <p className="text-sm text-gray-500">RFID holders and their current status</p>
          </div>

          {attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <HiOutlineUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-sm font-medium text-gray-900">No attendance records</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No RFID cards have been scanned today
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      RFID UID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((record, index) => {
                    const status = getStatusBadge(record);
                    return (
                      <tr key={record.uid || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                              {record.photo_url ? (
                                <img 
                                  src={record.photo_url} 
                                  alt="" 
                                  className="w-10 h-10 object-cover" 
                                />
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center text-sm text-gray-500">
                                  {getEmployeeName(record).split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {getEmployeeName(record)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {record.email || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {getEmployeePosition(record)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {record.department || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatTime(record.check_in_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {formatTime(record.check_out_time)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.icon}
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {record.uid}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleClearClick(record)}
                            disabled={clearing}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <HiOutlineTrash className="w-3 h-3" />
                            Clear
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <HiOutlineExclamation className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Clear Attendance Data</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to clear all attendance data for{' '}
                  <span className="font-semibold">
                    {confirmDialog.employee?.first_name} {confirmDialog.employee?.last_name}
                  </span>?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  This will remove all check-in/check-out records for today.
                </p>
                
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDialog({ open: false, employee: null })}
                    disabled={clearing}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => clearEmployeeAttendance(confirmDialog.employee)}
                    disabled={clearing}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {clearing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <HiOutlineTrash className="w-4 h-4" />
                        Clear Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
