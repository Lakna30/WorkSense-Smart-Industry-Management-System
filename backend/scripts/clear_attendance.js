import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function clearAttendance() {
  try {
    console.log('Clearing existing attendance records...');
    
    // Clear all attendance records
    const result = await db('attendance').del();
    
    console.log(`Deleted ${result} attendance records`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

clearAttendance();
