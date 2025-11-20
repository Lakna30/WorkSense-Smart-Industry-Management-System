import 'dotenv/config';
import knex from 'knex';
import knexConfig from '../knexfile.js';

async function main() {
  const db = knex(knexConfig.development);
  try {
    const hasTable = await db.schema.hasTable('employees');
    if (hasTable) {
      console.log('Dropping table employees ...');
      await db.schema.dropTable('employees');
      console.log('Dropped employees table.');
    } else {
      console.log('Table employees does not exist.');
    }
  } catch (err) {
    console.error('Error dropping employees table:', err.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

main();


