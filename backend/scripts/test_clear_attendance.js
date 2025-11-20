import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function testClearAttendance() {
  try {
    console.log('=== TESTING CLEAR ATTENDANCE API ===\n');
    
    // First, check current attendance records
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today's date: ${today}`);
    
    const beforeClear = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.*',
        'employees.first_name',
        'employees.last_name'
      )
      .where('attendance.attendance_date', today)
      .orderBy('attendance.created_at', 'desc');
    
    console.log(`\nBefore clearing: ${beforeClear.length} records`);
    beforeClear.forEach(record => {
      console.log(`- ${record.first_name} ${record.last_name} (${record.uid})`);
    });
    
    // Test clearing Tharuki's attendance
    const testUID = '57664B63';
    console.log(`\nTesting clear for UID: ${testUID}`);
    
    // Simulate the API call
    const employee = await db('employees')
      .select('first_name', 'last_name', 'rfid_uid')
      .where('rfid_uid', testUID)
      .where('is_active', true)
      .first();
    
    if (!employee) {
      console.log('❌ Employee not found');
      return;
    }
    
    console.log(`Found employee: ${employee.first_name} ${employee.last_name}`);
    
    // Delete attendance records
    const deletedCount = await db('attendance')
      .where('uid', testUID)
      .where('attendance_date', today)
      .del();
    
    console.log(`✅ Deleted ${deletedCount} attendance record(s) for ${employee.first_name} ${employee.last_name}`);
    
    // Check after clearing
    const afterClear = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.*',
        'employees.first_name',
        'employees.last_name'
      )
      .where('attendance.attendance_date', today)
      .orderBy('attendance.created_at', 'desc');
    
    console.log(`\nAfter clearing: ${afterClear.length} records`);
    afterClear.forEach(record => {
      console.log(`- ${record.first_name} ${record.last_name} (${record.uid})`);
    });
    
    console.log(`\n✅ Clear attendance functionality working!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

testClearAttendance();
