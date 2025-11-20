import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function updateHeyliVenuraUIDs() {
  try {
    console.log('Updating Heyli and Venura RFID UIDs...');
    
    // Update Heyli's UID
    const heyliResult = await db('employees')
      .where('first_name', 'heyli')
      .where('last_name', 'bandara')
      .update({ rfid_uid: '3211641E' });
    
    console.log(`Updated Heyli: ${heyliResult} record`);
    
    // Update Venura's UID
    const venuraResult = await db('employees')
      .where('first_name', 'venura')
      .where('last_name', 'jayasinha')
      .update({ rfid_uid: '22138F1E' });
    
    console.log(`Updated Venura: ${venuraResult} record`);
    
    // Verify the updates
    const employees = await db('employees')
      .select('first_name', 'last_name', 'rfid_uid')
      .whereIn('rfid_uid', ['3211641E', '22138F1E', '57664B63'])
      .orderBy('first_name');
    
    console.log('\nUpdated employees with RFID UIDs:');
    employees.forEach(emp => {
      console.log(`- ${emp.first_name} ${emp.last_name}: ${emp.rfid_uid}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

updateHeyliVenuraUIDs();
