export function up(knex) {
  return knex.schema.createTable('assets', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('type').notNullable();
    table.string('location').notNullable();
    table.string('status').notNullable().defaultTo('available'); // available, rented, maintenance
    table.text('description');
    table.decimal('purchase_price', 10, 2);
    table.date('purchase_date');
    table.string('serial_number');
    table.string('model');
    table.string('manufacturer');
    table.string('rented_to');
    table.date('rented_until');
    table.date('next_maintenance');
    table.text('maintenance_notes');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('assets');
}
