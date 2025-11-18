export async function up(knex) {
  const hasGender = await knex.schema.hasColumn('employees', 'gender');
  const hasPosition = await knex.schema.hasColumn('employees', 'position');
  const hasSalary = await knex.schema.hasColumn('employees', 'salary');

  await knex.schema.alterTable('employees', (table) => {
    if (!hasGender) {
      table.string('gender');
    }
    if (!hasPosition) {
      table.string('position');
    }
    if (!hasSalary) {
      table.decimal('salary');
    }
  });
}

export async function down(knex) {
  const hasGender = await knex.schema.hasColumn('employees', 'gender');
  const hasPosition = await knex.schema.hasColumn('employees', 'position');
  const hasSalary = await knex.schema.hasColumn('employees', 'salary');

  await knex.schema.alterTable('employees', (table) => {
    if (hasGender) {
      table.dropColumn('gender');
    }
    if (hasPosition) {
      table.dropColumn('position');
    }
    if (hasSalary) {
      table.dropColumn('salary');
    }
  });
}


