import { Router } from 'express';
import authRouter from './auth.routes.js';
import employeeRouter from './employee.routes.js';
import assetRouter from './asset.routes.js';
import notificationRouter from './notification.routes.js';
import taskRouter from './task.routes.js';
import scheduleRouter from './schedule.routes.js';
import attendanceRouter from './attendance.routes.js';
import payrollRouter from './payroll.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/employees', employeeRouter);
router.use('/assets', assetRouter);
router.use('/notifications', notificationRouter);
router.use('/tasks', taskRouter);
router.use('/schedules', scheduleRouter);
router.use('/attendance', attendanceRouter);
router.use('/payroll', payrollRouter);


export default router;


