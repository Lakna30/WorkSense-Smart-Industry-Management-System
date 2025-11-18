export async function up(knex) {
  return knex.schema.createTable('notifications', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.enum('type', ['info', 'success', 'warning', 'error', 'system']).defaultTo('info');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.boolean('is_read').defaultTo(false);
    table.boolean('is_archived').defaultTo(false);
    table.json('metadata').nullable(); // For additional data like links, actions, etc.
    table.timestamp('read_at').nullable();
    table.timestamp('expires_at').nullable();
    table.timestamps(true, true);
    
    // Foreign key constraint
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Indexes for better performance
    table.index(['user_id', 'is_read']);
    table.index(['user_id', 'created_at']);
    table.index(['type', 'priority']);
  });
}

export async function down(knex) {
  return knex.schema.dropTable('notifications');
}
