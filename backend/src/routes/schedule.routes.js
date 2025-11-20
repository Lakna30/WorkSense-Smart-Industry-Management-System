import { Router } from 'express';
import {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getEmployeeList,
  getChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} from '../controllers/schedule.controller.js';

const router = Router();

// Routes
router.get('/', getAllSchedules);
router.post('/', createSchedule);
router.put('/:id', updateSchedule);
router.delete('/:id', deleteSchedule);
router.get('/employees/list', getEmployeeList);
router.get('/:id/checklist', getChecklist);
router.post('/:id/checklist', addChecklistItem);
router.patch('/:id/checklist/:itemId', updateChecklistItem);
router.delete('/:id/checklist/:itemId', deleteChecklistItem);

export default router;
