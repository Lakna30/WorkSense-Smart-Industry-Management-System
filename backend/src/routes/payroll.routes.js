import express from 'express';
import { 
  getPayrollStatus, 
  updatePayrollStatus, 
  getPayrollStatusesForMonth 
} from '../controllers/payroll.controller.js';

const router = express.Router();

// Get payroll status for specific employee and month
router.get('/status/:employeeId/:month', getPayrollStatus);

// Update payroll status for specific employee and month
router.put('/status/:employeeId/:month', updatePayrollStatus);

// Get all payroll statuses for a specific month
router.get('/statuses/:month', getPayrollStatusesForMonth);

export default router;
