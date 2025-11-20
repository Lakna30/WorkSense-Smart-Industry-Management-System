import 'dotenv/config';
import knex from 'knex';
import knexConfig from '../knexfile.js';

async function reset() {
  const db = knex(knexConfig.development);
  try {
    // Ensure migrations tables exist info
    const hasEmployees = await db.schema.hasTable('employees');
    const hasUsers = await db.schema.hasTable('users');

    if (hasEmployees) {
      console.log('Dropping table employees ...');
      await db.schema.dropTable('employees');
    }

    if (hasUsers) {
      console.log('Dropping table users ...');
      await db.schema.dropTable('users');
    }

    // Clean knex migration tables so migrations can run fresh
    const hasMigrations = await db.schema.hasTable('knex_migrations');
    if (hasMigrations) {
      console.log('Clearing knex_migrations ...');
      await db('knex_migrations').del();
    }
    const hasMigrationsLock = await db.schema.hasTable('knex_migrations_lock');
    if (hasMigrationsLock) {
      console.log('Resetting knex_migrations_lock ...');
      await db('knex_migrations_lock').update({ is_locked: 0 }).catch(async () => {
        try {
          await db('knex_migrations_lock').del();
        } catch (_) {}
      });
    }

    console.log('Database reset complete.');
  } catch (err) {
    console.error('Reset error:', err.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

reset();


