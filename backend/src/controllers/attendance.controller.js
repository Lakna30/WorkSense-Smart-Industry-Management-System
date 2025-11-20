import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// Process MQTT attendance event
export const processAttendanceEvent = async (attendanceData) => {
  try {
    const { deviceId, ts, type, employee, uid } = attendanceData;
    
    // Parse timestamp and extract date/time
    const eventTime = new Date(ts);
    const attendanceDate = eventTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const eventTimeStr = eventTime.toTimeString().split(' ')[0]; // HH:MM:SS
    
    console.log(`Processing attendance event for ${employee} (${uid}) at ${eventTimeStr}`);
    
    // Look up employee by RFID UID to get proper employee details
    let employeeRecord = null;
    if (uid) {
      employeeRecord = await db('employees')
        .select('*')
        .where('rfid_uid', uid)
        .where('is_active', true)
        .first();
    }
    
    // Use employee name from database if found, otherwise use the name from MQTT
    const employeeName = employeeRecord ? 
      `${employeeRecord.first_name} ${employeeRecord.last_name}`.trim() : 
      employee;
    
    console.log(`Employee lookup: ${employeeName} (${uid})`);
    
    // Check if this UID already has attendance record for today
    const existingRecord = await db('attendance')
      .where('uid', uid)
      .where('attendance_date', attendanceDate)
      .first();
    
    if (existingRecord) {
      // Update existing record
      const tapCount = existingRecord.tap_count + 1;
      
      if (tapCount === 1) {
        // First tap - check in
        await db('attendance')
          .where('uid', uid)
          .where('attendance_date', attendanceDate)
          .update({
            check_in_time: eventTimeStr,
            first_tap_at: eventTime,
            last_tap_at: eventTime,
            tap_count: tapCount,
            is_checked_in: true,
            updated_at: new Date()
          });
        
        console.log(`Check-in recorded for ${employeeName} at ${eventTimeStr}`);
        return { action: 'check_in', employee: employeeName, time: eventTimeStr };
        
      } else if (tapCount === 2) {
        // Second tap - check out
        await db('attendance')
          .where('uid', uid)
          .where('attendance_date', attendanceDate)
          .update({
            check_out_time: eventTimeStr,
            last_tap_at: eventTime,
            tap_count: tapCount,
            is_checked_in: false,
            updated_at: new Date()
          });
        
        console.log(`Check-out recorded for ${employeeName} at ${eventTimeStr}`);
        return { action: 'check_out', employee: employeeName, time: eventTimeStr };
        
      } else {
        // More than 2 taps - ignore additional taps
        console.log(`Ignoring additional tap for ${employeeName} (tap #${tapCount})`);
        return { action: 'ignored', employee: employeeName, tapCount };
      }
      
    } else {
      // Create new record - first tap of the day
      await db('attendance').insert({
        uid,
        employee_name: employeeName,
        device_id: deviceId,
        event_type: type,
        attendance_date: attendanceDate,
        check_in_time: eventTimeStr,
        first_tap_at: eventTime,
        last_tap_at: eventTime,
        tap_count: 1,
        is_checked_in: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log(`New check-in recorded for ${employeeName} at ${eventTimeStr}`);
      return { action: 'check_in', employee: employeeName, time: eventTimeStr };
    }
    
  } catch (error) {
    console.error('Error processing attendance event:', error);
    throw error;
  }
};

// Get attendance records for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const attendance = await db('attendance')
      .where('attendance_date', date)
      .orderBy('check_in_time', 'asc');
    
    res.json({
      success: true,
      data: attendance,
      count: attendance.length
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance records',
      error: error.message
    });
  }
};

// Get attendance records for a specific employee (by UID)
export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { uid } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = db('attendance').where('uid', uid);
    
    if (startDate) {
      query = query.where('attendance_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance_date', '<=', endDate);
    }
    
    const attendance = await query
      .orderBy('attendance_date', 'desc')
      .orderBy('check_in_time', 'desc');
    
    res.json({
      success: true,
      data: attendance,
      count: attendance.length
    });
  } catch (error) {
    console.error('Error fetching employee attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee attendance',
      error: error.message
    });
  }
};

// Get today's attendance summary
export const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const attendance = await db('attendance')
      .where('attendance_date', today)
      .orderBy('check_in_time', 'asc');
    
    // Calculate summary statistics
    const totalEmployees = attendance.length;
    const checkedIn = attendance.filter(record => record.is_checked_in).length;
    const checkedOut = attendance.filter(record => !record.is_checked_in).length;
    const pendingCheckout = attendance.filter(record => record.is_checked_in && !record.check_out_time).length;
    
    res.json({
      success: true,
      data: {
        attendance,
        summary: {
          totalEmployees,
          checkedIn,
          checkedOut,
          pendingCheckout
        }
      }
    });
  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s attendance',
      error: error.message
    });
  }
};

// Get attendance statistics for a date range
export const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('attendance');
    
    if (startDate) {
      query = query.where('attendance_date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance_date', '<=', endDate);
    }
    
    const attendance = await query.orderBy('attendance_date', 'asc');
    
    // Group by date and calculate daily stats
    const dailyStats = {};
    attendance.forEach(record => {
      const date = record.attendance_date;
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          totalEmployees: 0,
          checkedIn: 0,
          checkedOut: 0,
          pendingCheckout: 0
        };
      }
      
      dailyStats[date].totalEmployees++;
      if (record.is_checked_in) {
        dailyStats[date].checkedIn++;
      } else {
        dailyStats[date].checkedOut++;
      }
      if (record.is_checked_in && !record.check_out_time) {
        dailyStats[date].pendingCheckout++;
      }
    });
    
    const statsArray = Object.values(dailyStats);
    
    res.json({
      success: true,
      data: statsArray,
      count: statsArray.length
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance statistics',
      error: error.message
    });
  }
};

// Get employee details by RFID UID
export const getEmployeeByUID = async (req, res) => {
  try {
    const { uid } = req.params;
    
    const employee = await db('employees')
      .select('*')
      .where('rfid_uid', uid)
      .where('is_active', true)
      .first();
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found for this RFID UID'
      });
    }
    
    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Error fetching employee by UID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details',
      error: error.message
    });
  }
};

// Get real-time attendance with employee details
export const getRealTimeAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's attendance with employee details
    const attendance = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.*',
        'employees.first_name',
        'employees.last_name',
        'employees.email',
        'employees.job_title',
        'employees.department',
        'employees.photo_url',
        'employees.position'
      )
      .where('attendance.attendance_date', today)
      .orderBy('attendance.last_tap_at', 'desc');
    
    // Calculate summary statistics
    const totalEmployees = attendance.length;
    const checkedIn = attendance.filter(record => record.is_checked_in).length;
    const checkedOut = attendance.filter(record => !record.is_checked_in).length;
    const pendingCheckout = attendance.filter(record => record.is_checked_in && !record.check_out_time).length;
    
    res.json({
      success: true,
      data: {
        attendance,
        summary: {
          totalEmployees,
          checkedIn,
          checkedOut,
          pendingCheckout
        }
      }
    });
  } catch (error) {
    console.error('Error fetching real-time attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time attendance',
      error: error.message
    });
  }
};

// Clear attendance data for a specific employee
export const clearEmployeeAttendance = async (req, res) => {
  try {
    const { uid } = req.params;
    const { date } = req.query;
    
    // Use today's date if not specified
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`Clearing attendance for UID ${uid} on date ${targetDate}`);
    
    // Check if employee exists
    const employee = await db('employees')
      .select('first_name', 'last_name', 'rfid_uid')
      .where('rfid_uid', uid)
      .where('is_active', true)
      .first();
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found for this RFID UID'
      });
    }
    
    // Delete attendance records for this employee on the specified date
    const deletedCount = await db('attendance')
      .where('uid', uid)
      .where('attendance_date', targetDate)
      .del();
    
    console.log(`Deleted ${deletedCount} attendance records for ${employee.first_name} ${employee.last_name}`);
    
    res.json({
      success: true,
      message: `Cleared ${deletedCount} attendance record(s) for ${employee.first_name} ${employee.last_name}`,
      data: {
        employee: `${employee.first_name} ${employee.last_name}`,
        uid,
        date: targetDate,
        deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing employee attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear employee attendance',
      error: error.message
    });
  }
};