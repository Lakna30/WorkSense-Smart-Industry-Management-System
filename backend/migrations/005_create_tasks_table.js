export async function up(knex) {
  return knex.schema.createTable('tasks', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('title').notNullable();
    table.text('description').nullable();
    table.enum('status', ['pending', 'in_progress', 'completed', 'cancelled']).defaultTo('pending');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.date('due_date').nullable();
    table.timestamp('completed_at').nullable();
    table.json('checklist').nullable(); // Array of checklist items
    table.json('attachments').nullable(); // Array of file attachments
    table.string('category').nullable();
    table.text('notes').nullable();
    table.boolean('is_archived').defaultTo(false);
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index(['user_id', 'status']);
    table.index(['user_id', 'due_date']);
    table.index(['status', 'priority']);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('tasks');
}
