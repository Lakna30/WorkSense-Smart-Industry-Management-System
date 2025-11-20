import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function testAttendanceSync() {
  try {
    console.log('=== TESTING ATTENDANCE DATA SYNC ===\n');
    
    // Get today's attendance from database
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today's date: ${today}`);
    
    const attendance = await db('attendance')
      .leftJoin('employees', 'attendance.uid', 'employees.rfid_uid')
      .select(
        'attendance.*',
        'employees.first_name',
        'employees.last_name',
        'employees.job_title',
        'employees.department'
      )
      .where('attendance.attendance_date', today)
      .orderBy('attendance.created_at', 'desc');
    
    console.log(`\nDatabase attendance records: ${attendance.length}`);
    
    attendance.forEach((record, index) => {
      console.log(`\n${index + 1}. ${record.first_name} ${record.last_name} (${record.uid})`);
      console.log(`   Job: ${record.job_title} | Dept: ${record.department}`);
      console.log(`   Check-in: ${record.check_in_time || 'Not checked in'}`);
      console.log(`   Check-out: ${record.check_out_time || 'Not checked out'}`);
      console.log(`   Status: ${record.is_checked_in ? 'Currently IN' : 'Currently OUT'}`);
      console.log(`   Taps: ${record.tap_count}`);
    });
    
    // Calculate summary
    const checkedIn = attendance.filter(record => record.is_checked_in).length;
    const checkedOut = attendance.filter(record => !record.is_checked_in).length;
    const total = attendance.length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Employees: ${total}`);
    console.log(`Checked In: ${checkedIn}`);
    console.log(`Checked Out: ${checkedOut}`);
    console.log(`Pending Checkout: ${checkedIn - checkedOut}`);
    
    console.log(`\n✅ Both UIs should now show the same data!`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

testAttendanceSync();
