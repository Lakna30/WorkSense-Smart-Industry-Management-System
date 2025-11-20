import { Router } from 'express';
import { 
  getTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask, 
  archiveTask,
  updateChecklistItem,
  getTaskStats
} from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get tasks with pagination and filters
router.get('/', getTasks);

// Get task statistics
router.get('/stats', getTaskStats);

// Get specific task by ID
router.get('/:taskId', getTaskById);

// Create new task
router.post('/', createTask);

// Update task
router.put('/:taskId', updateTask);

// Delete task
router.delete('/:taskId', deleteTask);

// Archive task
router.patch('/:taskId/archive', archiveTask);

// Update checklist item
router.patch('/:taskId/checklist', updateChecklistItem);

export default router;
