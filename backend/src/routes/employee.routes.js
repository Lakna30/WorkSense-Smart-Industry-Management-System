import { Router } from 'express';
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

// Get all employees with search and filters
router.get('/', getAllEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Create new employee
router.post('/', createEmployee);

// Update employee
router.put('/:id', updateEmployee);

// Delete employee (soft delete)
router.delete('/:id', deleteEmployee);

// Get all departments
router.get('/departments/list', getDepartments);

// Get all job titles
router.get('/job-titles/list', getJobTitles);

export default router;
