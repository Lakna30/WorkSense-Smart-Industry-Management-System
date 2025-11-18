export function up(knex) {
  return knex.schema.alterTable('attendance', (table) => {
    // Drop the existing primary key
    table.dropPrimary();
  }).then(() => {
    return knex.schema.alterTable('attendance', (table) => {
      // Add a new auto-incrementing ID as primary key
      table.increments('id').primary().first();
    });
  }).then(() => {
    return knex.schema.alterTable('attendance', (table) => {
      // Add a unique constraint on uid + attendance_date combination
      table.unique(['uid', 'attendance_date'], 'unique_uid_date');
    });
  });
}

export function down(knex) {
  return knex.schema.alterTable('attendance', (table) => {
    // Drop the unique constraint
    table.dropUnique(['uid', 'attendance_date'], 'unique_uid_date');
    
    // Drop the auto-incrementing ID
    table.dropColumn('id');
    
    // Restore the original primary key
    table.primary('uid');
  });
}
