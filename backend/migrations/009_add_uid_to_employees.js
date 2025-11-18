export function up(knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.string('rfid_uid', 20).unique().comment('RFID UID for attendance tracking');
  });
}

export function down(knex) {
  return knex.schema.alterTable('employees', (table) => {
    table.dropColumn('rfid_uid');
  });
}
