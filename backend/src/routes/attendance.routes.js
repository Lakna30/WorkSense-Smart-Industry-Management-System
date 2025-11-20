import { Router } from 'express';
import {
  getAttendanceByDate,
  getAttendanceByEmployee,
  getTodayAttendance,
  getAttendanceStats,
  processAttendanceEvent,
  getEmployeeByUID,
  getRealTimeAttendance,
  clearEmployeeAttendance
} from '../controllers/attendance.controller.js';

const router = Router();

// Get attendance records for a specific date
router.get('/date/:date', getAttendanceByDate);

// Get attendance records for a specific employee (by UID)
router.get('/employee/:uid', getAttendanceByEmployee);

// Get today's attendance summary
router.get('/today', getTodayAttendance);

// Get attendance statistics for a date range
router.get('/stats', getAttendanceStats);

// Process MQTT attendance event (internal API)
router.post('/process-event', async (req, res) => {
  try {
    const result = await processAttendanceEvent(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing attendance event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process attendance event',
      error: error.message
    });
  }
});

// Get employee details by RFID UID
router.get('/employee-by-uid/:uid', getEmployeeByUID);

// Get real-time attendance with employee details
router.get('/realtime', getRealTimeAttendance);

// Clear attendance data for a specific employee
router.delete('/clear/:uid', clearEmployeeAttendance);

export default router;
