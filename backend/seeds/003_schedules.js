export function seed(knex) {
  return knex('schedules').del()
    .then(() => {
      return knex('schedules').insert([
        {
          title: 'Factory Equipment Maintenance',
          description: 'Monthly inspection of conveyor systems.',
          employee_id: 1,
          deadline: '2025-10-15',
          priority: 'High',
          status: 'Pending'
        },
        {
          title: 'Inventory Stock Check',
          description: 'Verify warehouse inventory against system records.',
          employee_id: 2,
          deadline: '2025-10-20',
          priority: 'Medium',
          status: 'Pending'
        }
      ]);
    });
}