export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('notifications').del();
  
  // Get the admin user ID
  const adminUser = await knex('users').where('email', 'admin@worksense.com').first();
  
  if (adminUser) {
    // Insert sample notifications
    await knex('notifications').insert([
      {
        user_id: adminUser.id,
        title: 'Welcome to WorkSense!',
        message: 'Your account has been successfully created. Start exploring the dashboard to manage your workplace efficiently.',
        type: 'success',
        priority: 'high',
        is_read: false,
        metadata: JSON.stringify({
          action: 'view_dashboard',
          link: '/dashboard'
        })
      },
      {
        user_id: adminUser.id,
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM. Some features may be temporarily unavailable.',
        type: 'warning',
        priority: 'medium',
        is_read: false,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        metadata: JSON.stringify({
          action: 'view_schedule',
          link: '/schedule'
        })
      },
      {
        user_id: adminUser.id,
        title: 'New Asset Added',
        message: 'A new laptop (Dell XPS 15) has been added to your asset inventory. Click to view details.',
        type: 'info',
        priority: 'low',
        is_read: true,
        read_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: JSON.stringify({
          action: 'view_asset',
          link: '/assets',
          asset_id: 1
        })
      },
      {
        user_id: adminUser.id,
        title: 'Task Assignment',
        message: 'You have been assigned a new task: "Update employee records". Due date: Tomorrow, 5:00 PM.',
        type: 'info',
        priority: 'high',
        is_read: false,
        metadata: JSON.stringify({
          action: 'view_task',
          link: '/tasks',
          task_id: 1
        })
      },
      {
        user_id: adminUser.id,
        title: 'Security Alert',
        message: 'Unusual login activity detected from a new device. If this was not you, please secure your account immediately.',
        type: 'error',
        priority: 'urgent',
        is_read: false,
        metadata: JSON.stringify({
          action: 'security_settings',
          link: '/profile'
        })
      },
      {
        user_id: adminUser.id,
        title: 'Weekly Report Ready',
        message: 'Your weekly productivity report is now available. View insights and analytics for the past week.',
        type: 'info',
        priority: 'low',
        is_read: true,
        read_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: JSON.stringify({
          action: 'view_report',
          link: '/dashboard'
        })
      }
    ]);
  }
};
