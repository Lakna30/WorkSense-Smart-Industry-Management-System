import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function checkEmployees() {
  try {
    console.log('Checking employees with RFID UIDs...');
    
    const employees = await db('employees')
      .select('first_name', 'last_name', 'rfid_uid')
      .whereNotNull('rfid_uid');
    
    console.log('Employees with RFID UIDs:');
    employees.forEach(emp => {
      console.log(`- ${emp.first_name} ${emp.last_name}: ${emp.rfid_uid}`);
    });
    
    console.log(`\nTotal: ${employees.length} employees with RFID UIDs`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

checkEmployees();
