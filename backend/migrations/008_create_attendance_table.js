/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function(knex) {
  return knex.schema.createTable('attendance', function(table) {
    table.string('uid', 20).primary().comment('RFID UID - Primary key');
    table.string('employee_name', 100).notNullable().comment('Employee name from RFID event');
    table.string('device_id', 50).notNullable().comment('Device ID from MQTT event');
    table.string('event_type', 20).notNullable().defaultTo('rfid').comment('Type of event (rfid, manual, etc.)');
    table.date('attendance_date').notNullable().comment('Date of attendance (YYYY-MM-DD)');
    table.time('check_in_time').nullable().comment('Check-in time (HH:MM:SS)');
    table.time('check_out_time').nullable().comment('Check-out time (HH:MM:SS)');
    table.timestamp('first_tap_at').notNullable().comment('First tap timestamp of the day');
    table.timestamp('last_tap_at').notNullable().comment('Last tap timestamp');
    table.integer('tap_count').notNullable().defaultTo(1).comment('Number of taps today');
    table.boolean('is_checked_in').notNullable().defaultTo(true).comment('Current check-in status');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes for better performance
    table.index(['attendance_date'], 'idx_attendance_date');
    table.index(['uid', 'attendance_date'], 'idx_uid_date');
    table.index(['employee_name'], 'idx_employee_name');
    table.index(['is_checked_in'], 'idx_check_status');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = function(knex) {
  return knex.schema.dropTable('attendance');
};
