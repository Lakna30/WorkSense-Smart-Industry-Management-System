export function up(knex) {
  return knex.schema.createTable('schedules', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table
      .integer('employee_id')
      .unsigned()
      .references('id')
      .inTable('employees')
      .onDelete('CASCADE');
    table.date('deadline').notNullable();
    table.string('priority').defaultTo('Normal');
    table.string('status').defaultTo('Pending');
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('schedules');
}