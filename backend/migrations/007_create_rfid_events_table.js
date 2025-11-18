/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('rfid_events', function(table) {
    table.increments('id').primary();
    table.string('uid', 20).notNullable();
    table.string('employee_name', 100).notNullable();
    table.string('device_id', 50).notNullable();
    table.timestamp('event_time').notNullable();
    table.string('event_type', 20).defaultTo('rfid');
    table.json('raw_data');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('rfid_events');
};
