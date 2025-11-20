import knex from 'knex';
import knexConfig from '../knexfile.js';
import { processAttendanceEvent } from '../src/controllers/attendance.controller.js';

const db = knex(knexConfig.development);

async function testRFIDScan() {
  try {
    console.log('Testing RFID scan for Tharuki...');
    
    // Simulate an RFID scan event
    const testEvent = {
      deviceId: 'ESP32-001',
      ts: new Date().toISOString(),
      type: 'rfid',
      employee: 'Tharuki', // This will be overridden by database lookup
      uid: '57664B63'
    };
    
    console.log('Test event:', testEvent);
    
    // Process the attendance event
    const result = await processAttendanceEvent(testEvent);
    
    console.log('Processing result:', result);
    
    // Check the attendance record
    const attendance = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.*',
        'employees.first_name',
        'employees.last_name',
        'employees.email',
        'employees.job_title',
        'employees.department',
        'employees.photo_url'
      )
      .where('attendance.uid', '57664B63')
      .first();
    
    console.log('Attendance record:', attendance);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

testRFIDScan();
