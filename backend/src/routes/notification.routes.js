import { Router } from 'express';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  archiveNotification, 
  deleteNotification, 
  createNotification 
} from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get notifications with pagination and filters
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Archive notification
router.patch('/:notificationId/archive', archiveNotification);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Create notification (for system use)
router.post('/', createNotification);

export default router;
