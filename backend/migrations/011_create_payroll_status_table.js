/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('payroll_status', (table) => {
    table.increments('id').primary();
    table.integer('employee_id').unsigned().notNullable();
    table.string('month', 7).notNullable().comment('YYYY-MM format');
    table.enum('status', ['Pending', 'Paid']).defaultTo('Pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Foreign key constraint
    table.foreign('employee_id').references('id').inTable('employees').onDelete('CASCADE');
    
    // Unique constraint to prevent duplicate statuses for same employee/month
    table.unique(['employee_id', 'month'], 'unique_employee_month');
    
    // Indexes for better performance
    table.index(['employee_id']);
    table.index(['month']);
    table.index(['status']);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('payroll_status');
}
