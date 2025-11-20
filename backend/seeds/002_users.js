import bcrypt from 'bcryptjs';

export async function seed(knex) {
  // Delete existing entries
  await knex('users').del();
  
  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  
  // Insert seed entries
  return knex('users').insert([
    {
      email: 'admin@worksense.com',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true
    },
    {
      email: 'john.doe@worksense.com',
      password_hash: userPassword,
      first_name: 'John',
      last_name: 'Doe',
      role: 'user',
      is_active: true
    }
  ]);
}
