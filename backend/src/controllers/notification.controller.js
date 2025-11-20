import knex from 'knex';
import knexConfig from '../../knexfile.js';

const db = knex(knexConfig.development);

// Get all notifications for a user
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.sub;
    const { page = 1, limit = 20, type, priority, is_read } = req.query;
    console.log('Fetching notifications for user:', userId, 'with params:', { page, limit, type, priority, is_read });
    
    let query = db('notifications')
      .where('user_id', userId)
      .where('is_archived', false);
    
    // Apply filters
    if (type) query = query.where('type', type);
    if (priority) query = query.where('priority', priority);
    if (is_read !== undefined) query = query.where('is_read', is_read === 'true');
    
    // Get total count for pagination
    const totalCountResult = await query.clone().count('* as count').first();
    const totalCount = parseInt(totalCountResult.count) || 0;
    
    // Apply pagination and ordering
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));
    
    // Parse metadata JSON
    const notificationsWithParsedMetadata = notifications.map(notification => {
      let parsedMetadata = null;
      if (notification.metadata) {
        try {
          parsedMetadata = typeof notification.metadata === 'string' 
            ? JSON.parse(notification.metadata) 
            : notification.metadata;
        } catch (error) {
          console.error('Error parsing metadata for notification', notification.id, ':', error);
          parsedMetadata = null;
        }
      }
      return {
        ...notification,
        metadata: parsedMetadata
      };
    });
    
    res.json({
      notifications: notificationsWithParsedMetadata,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Get unread notification count
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.sub;
    console.log('Fetching unread count for user:', userId);
    
    const countResult = await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .where('is_archived', false)
      .count('* as count')
      .first();
    
    console.log('Count result:', countResult);
    const unreadCount = parseInt(countResult.count) || 0;
    console.log('Parsed unread count:', unreadCount);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Mark notification as read
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.sub;
    const { notificationId } = req.params;
    
    const updated = await db('notifications')
      .where('id', notificationId)
      .where('user_id', userId)
      .update({
        is_read: true,
        read_at: new Date()
      });
    
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Mark all notifications as read
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.sub;
    
    await db('notifications')
      .where('user_id', userId)
      .where('is_read', false)
      .update({
        is_read: true,
        read_at: new Date()
      });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Archive notification
export async function archiveNotification(req, res, next) {
  try {
    const userId = req.user.sub;
    const { notificationId } = req.params;
    
    const updated = await db('notifications')
      .where('id', notificationId)
      .where('user_id', userId)
      .update({
        is_archived: true
      });
    
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification archived' });
  } catch (error) {
    console.error('Error archiving notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Delete notification
export async function deleteNotification(req, res, next) {
  try {
    const userId = req.user.sub;
    const { notificationId } = req.params;
    
    const deleted = await db('notifications')
      .where('id', notificationId)
      .where('user_id', userId)
      .del();
    
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Create notification (for system use)
export async function createNotification(req, res, next) {
  try {
    const { user_id, title, message, type = 'info', priority = 'medium', metadata = null, expires_at = null } = req.body;
    
    const notification = await db('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        priority,
        metadata: metadata ? JSON.stringify(metadata) : null,
        expires_at
      })
      .returning('*');
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification: {
        ...notification[0],
        metadata: notification[0].metadata ? JSON.parse(notification[0].metadata) : null
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
