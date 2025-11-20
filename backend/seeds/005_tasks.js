export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('tasks').del();
  
  // Get the admin user ID
  const adminUser = await knex('users').where('email', 'admin@worksense.com').first();
  
  if (adminUser) {
    // Insert sample tasks
    await knex('tasks').insert([
      {
        user_id: adminUser.id,
        title: 'Complete Project Documentation',
        description: 'Create comprehensive documentation for the WorkSense project including API documentation, user guides, and technical specifications.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        checklist: JSON.stringify([
          { id: 1, text: 'Write API documentation', completed: true },
          { id: 2, text: 'Create user manual', completed: false },
          { id: 3, text: 'Document database schema', completed: true },
          { id: 4, text: 'Create deployment guide', completed: false },
          { id: 5, text: 'Review and finalize', completed: false }
        ]),
        category: 'Documentation',
        notes: 'This is a critical task for project completion. Focus on clarity and completeness.',
        attachments: JSON.stringify([
          { name: 'api_specs.pdf', url: '/uploads/api_specs.pdf', type: 'pdf' },
          { name: 'database_diagram.png', url: '/uploads/db_diagram.png', type: 'image' }
        ])
      },
      {
        user_id: adminUser.id,
        title: 'Employee Onboarding Process',
        description: 'Design and implement a streamlined employee onboarding process with digital forms and automated workflows.',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        checklist: JSON.stringify([
          { id: 1, text: 'Design onboarding workflow', completed: false },
          { id: 2, text: 'Create digital forms', completed: false },
          { id: 3, text: 'Set up automated emails', completed: false },
          { id: 4, text: 'Test the process', completed: false },
          { id: 5, text: 'Train HR team', completed: false }
        ]),
        category: 'HR',
        notes: 'This will improve efficiency and reduce manual work for HR department.',
        attachments: JSON.stringify([])
      },
      {
        user_id: adminUser.id,
        title: 'Security Audit',
        description: 'Conduct a comprehensive security audit of the WorkSense application to identify vulnerabilities and implement security measures.',
        status: 'pending',
        priority: 'urgent',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        checklist: JSON.stringify([
          { id: 1, text: 'Review authentication system', completed: false },
          { id: 2, text: 'Check data encryption', completed: false },
          { id: 3, text: 'Test for SQL injection', completed: false },
          { id: 4, text: 'Review API security', completed: false },
          { id: 5, text: 'Implement security patches', completed: false },
          { id: 6, text: 'Create security report', completed: false }
        ]),
        category: 'Security',
        notes: 'Critical security audit required before production deployment.',
        attachments: JSON.stringify([])
      },
      {
        user_id: adminUser.id,
        title: 'Mobile App Development',
        description: 'Develop a mobile application for WorkSense to provide on-the-go access to key features.',
        status: 'completed',
        priority: 'medium',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        checklist: JSON.stringify([
          { id: 1, text: 'Design mobile UI/UX', completed: true },
          { id: 2, text: 'Develop React Native app', completed: true },
          { id: 3, text: 'Integrate with backend API', completed: true },
          { id: 4, text: 'Test on multiple devices', completed: true },
          { id: 5, text: 'Deploy to app stores', completed: true }
        ]),
        category: 'Development',
        notes: 'Successfully completed and deployed to both iOS and Android app stores.',
        attachments: JSON.stringify([
          { name: 'mobile_app_apk', url: '/uploads/mobile_app.apk', type: 'file' },
          { name: 'app_store_screenshots', url: '/uploads/screenshots.zip', type: 'archive' }
        ])
      },
      {
        user_id: adminUser.id,
        title: 'Database Optimization',
        description: 'Optimize database performance by adding indexes, optimizing queries, and implementing caching strategies.',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        checklist: JSON.stringify([
          { id: 1, text: 'Analyze slow queries', completed: true },
          { id: 2, text: 'Add missing indexes', completed: true },
          { id: 3, text: 'Optimize complex queries', completed: false },
          { id: 4, text: 'Implement Redis caching', completed: false },
          { id: 5, text: 'Monitor performance', completed: false }
        ]),
        category: 'Performance',
        notes: 'Database performance is critical for user experience. Focus on query optimization.',
        attachments: JSON.stringify([
          { name: 'query_analysis.pdf', url: '/uploads/query_analysis.pdf', type: 'pdf' }
        ])
      }
    ]);
  }
}
