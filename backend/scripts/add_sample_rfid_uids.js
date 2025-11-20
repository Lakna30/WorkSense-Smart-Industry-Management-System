import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function addSampleRFIDUIDs() {
  try {
    console.log('Adding sample RFID UIDs to employees...');
    
    // Get all employees without RFID UIDs
    const employees = await db('employees')
      .select('id', 'first_name', 'last_name')
      .whereNull('rfid_uid')
      .where('is_active', true);
    
    console.log(`Found ${employees.length} employees without RFID UIDs`);
    
    // Generate sample RFID UIDs
    const sampleUIDs = [
      '1234567890ABCD',
      '2345678901BCDE', 
      '3456789012CDEF',
      '4567890123DEFG',
      '5678901234EFGH',
      '6789012345FGHI',
      '7890123456GHIJ',
      '8901234567HIJK',
      '9012345678IJKL',
      '0123456789JKLM'
    ];
    
    for (let i = 0; i < employees.length && i < sampleUIDs.length; i++) {
      const employee = employees[i];
      const uid = sampleUIDs[i];
      
      await db('employees')
        .where('id', employee.id)
        .update({ rfid_uid: uid });
      
      console.log(`Assigned UID ${uid} to ${employee.first_name} ${employee.last_name}`);
    }
    
    console.log('✅ Sample RFID UIDs added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample RFID UIDs:', error);
  } finally {
    await db.destroy();
  }
}

addSampleRFIDUIDs();
