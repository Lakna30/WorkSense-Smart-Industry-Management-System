export function up(knex) {
  return knex.schema.createTable('employees', (table) => {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').unique().notNullable();
    table.string('phone');
    table.string('photo_url');
    table.string('job_title').notNullable();
    table.string('department').notNullable();
    table.text('skills');
    table.text('certifications');
    table.string('emergency_contact_name');
    table.string('emergency_contact_phone');
    table.string('emergency_contact_relationship');
    table.string('employee_id').unique();
    table.date('hire_date');
    table.date('birth_date');
    table.string('address');
    table.string('city');
    table.string('state');
    table.string('zip_code');
    table.string('country');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTable('employees');
}
