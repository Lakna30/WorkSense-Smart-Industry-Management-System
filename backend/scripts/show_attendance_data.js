import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function showAttendanceData() {
  try {
    console.log('=== ATTENDANCE DATA STORAGE ===\n');
    
    // Show employees table structure
    console.log('1. EMPLOYEES TABLE (Static Info):');
    const employees = await db('employees')
      .select('id', 'first_name', 'last_name', 'rfid_uid', 'job_title', 'department')
      .whereNotNull('rfid_uid');
    
    employees.forEach(emp => {
      console.log(`   - ${emp.first_name} ${emp.last_name} (ID: ${emp.id})`);
      console.log(`     RFID UID: ${emp.rfid_uid}`);
      console.log(`     Job: ${emp.job_title} | Dept: ${emp.department}`);
    });
    
    console.log('\n2. ATTENDANCE TABLE (Check-in/Checkout Data):');
    const attendance = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.id',
        'attendance.uid',
        'attendance.employee_name',
        'attendance.attendance_date',
        'attendance.check_in_time',
        'attendance.check_out_time',
        'attendance.is_checked_in',
        'attendance.tap_count',
        'attendance.first_tap_at',
        'attendance.last_tap_at',
        'employees.first_name',
        'employees.last_name'
      )
      .orderBy('attendance.created_at', 'desc');
    
    if (attendance.length === 0) {
      console.log('   No attendance records found.');
    } else {
      attendance.forEach(record => {
        console.log(`   - Record ID: ${record.id}`);
        console.log(`     Employee: ${record.first_name} ${record.last_name} (${record.uid})`);
        console.log(`     Date: ${record.attendance_date}`);
        console.log(`     Check-in: ${record.check_in_time || 'Not checked in'}`);
        console.log(`     Check-out: ${record.check_out_time || 'Not checked out'}`);
        console.log(`     Status: ${record.is_checked_in ? 'Currently IN' : 'Currently OUT'}`);
        console.log(`     Taps today: ${record.tap_count}`);
        console.log(`     First tap: ${record.first_tap_at}`);
        console.log(`     Last tap: ${record.last_tap_at}`);
        console.log('     ---');
      });
    }
    
    console.log(`\nTotal attendance records: ${attendance.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

showAttendanceData();
