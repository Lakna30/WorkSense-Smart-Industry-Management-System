export function up(knex) {
  return knex.schema.createTable('schedule_checklist_items', (table) => {
    table.increments('id').primary();
    table
      .integer('schedule_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('schedules')
      .onDelete('CASCADE');
    table.string('title').notNullable();
    table.boolean('is_completed').defaultTo(false);
    table.integer('position').unsigned();
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists('schedule_checklist_items');
}
