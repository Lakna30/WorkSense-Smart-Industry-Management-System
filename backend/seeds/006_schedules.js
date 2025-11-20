export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('schedules').del();
  
  // Get some employees to assign schedules to
  const employees = await knex('employees').select('id', 'first_name', 'last_name').limit(3);
  
  if (employees.length > 0) {
    // Insert sample schedules
    await knex('schedules').insert([
      {
        title: 'Complete Project Documentation',
        description: 'Create comprehensive documentation for the WorkSense project including API documentation, user guides, and technical specifications.',
        employee_id: employees[0].id,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'High',
        status: 'Pending'
      },
      {
        title: 'Code Review Session',
        description: 'Conduct code review for the new notification system implementation and provide feedback to the development team.',
        employee_id: employees[1]?.id || employees[0].id,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'Normal',
        status: 'In Progress'
      },
      {
        title: 'Database Optimization',
        description: 'Optimize database performance by adding indexes, optimizing queries, and implementing caching strategies.',
        employee_id: employees[2]?.id || employees[0].id,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        priority: 'Urgent',
        status: 'Pending'
      },
      {
        title: 'Team Meeting Preparation',
        description: 'Prepare agenda and materials for the weekly team meeting including project updates and upcoming milestones.',
        employee_id: employees[0].id,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        priority: 'Low',
        status: 'Completed'
      },
      {
        title: 'Security Audit',
        description: 'Conduct a comprehensive security audit of the WorkSense application to identify vulnerabilities and implement security measures.',
        employee_id: employees[1]?.id || employees[0].id,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        priority: 'High',
        status: 'Pending'
      }
    ]);
  }
}
