import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig.development);

async function createPayrollStatusTable() {
  try {
    // Check if table already exists
    const hasTable = await db.schema.hasTable('payroll_status');
    if (hasTable) {
      console.log('payroll_status table already exists');
      return;
    }

    // Create the table
    await db.schema.createTable('payroll_status', (table) => {
      table.increments('id').primary();
      table.integer('employee_id').unsigned().notNullable();
      table.string('month', 7).notNullable().comment('YYYY-MM format');
      table.enum('status', ['Pending', 'Paid']).defaultTo('Pending');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      
      // Foreign key constraint
      table.foreign('employee_id').references('id').inTable('employees').onDelete('CASCADE');
      
      // Unique constraint to prevent duplicate statuses for same employee/month
      table.unique(['employee_id', 'month'], 'unique_employee_month');
      
      // Indexes for better performance
      table.index(['employee_id']);
      table.index(['month']);
      table.index(['status']);
    });

    console.log('payroll_status table created successfully');
  } catch (error) {
    console.error('Error creating payroll_status table:', error);
  } finally {
    await db.destroy();
  }
}

createPayrollStatusTable();
