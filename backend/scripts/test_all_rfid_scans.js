import knex from 'knex';
import knexConfig from '../knexfile.js';
import { processAttendanceEvent } from '../src/controllers/attendance.controller.js';

const db = knex(knexConfig.development);

async function testAllRFIDScans() {
  try {
    console.log('Testing RFID scans for all employees...\n');
    
    // Test events for all three employees
    const testEvents = [
      {
        deviceId: 'ESP32-001',
        ts: new Date().toISOString(),
        type: 'rfid',
        employee: 'Tharuki',
        uid: '57664B63'
      },
      {
        deviceId: 'ESP32-001',
        ts: new Date(Date.now() + 1000).toISOString(), // 1 second later
        type: 'rfid',
        employee: 'Heyli',
        uid: '3211641E'
      },
      {
        deviceId: 'ESP32-001',
        ts: new Date(Date.now() + 2000).toISOString(), // 2 seconds later
        type: 'rfid',
        employee: 'Venura',
        uid: '22138F1E'
      }
    ];
    
    // Process each event
    for (const event of testEvents) {
      console.log(`Processing: ${event.employee} (${event.uid})`);
      const result = await processAttendanceEvent(event);
      console.log(`Result: ${result.action} for ${result.employee}`);
      console.log('---');
    }
    
    // Check all attendance records
    console.log('\nAll attendance records:');
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
      .orderBy('attendance.created_at', 'desc');
    
    attendance.forEach(record => {
      console.log(`- ${record.first_name} ${record.last_name} (${record.uid}): ${record.is_checked_in ? 'Checked In' : 'Checked Out'} at ${record.check_in_time}`);
    });
    
    console.log(`\nTotal attendance records: ${attendance.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

testAllRFIDScans();
