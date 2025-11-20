import { Router } from 'express';
import multer from 'multer';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  getJobTitles
} from '../controllers/employee.controller.js';

const router = Router();

// Multer setup (store image file in memory for now)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', upload.single('photo_url'), createEmployee);
router.put('/:id', upload.single('photo_url'), updateEmployee);
router.delete('/:id', deleteEmployee);
router.get('/departments/list', getDepartments);
router.get('/job-titles/list', getJobTitles);

export default router;
