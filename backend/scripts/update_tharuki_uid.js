import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function updateTharukiUID() {
  try {
    console.log('Updating Tharuki\'s RFID UID...');
    
    // Update Tharuki's UID to match the scanned card
    const result = await db('employees')
      .where('first_name', 'tharuki')
      .where('last_name', 'erathna')
      .update({ rfid_uid: '57664B63' });
    
    console.log(`Updated ${result} employee record`);
    
    // Verify the update
    const employee = await db('employees')
      .select('first_name', 'last_name', 'rfid_uid')
      .where('rfid_uid', '57664B63')
      .first();
    
    console.log('Updated employee:', employee);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

updateTharukiUID();
