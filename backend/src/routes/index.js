import { Router } from 'express';
import authRouter from './auth.routes.js';
import employeeRouter from './employee.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/employees', employeeRouter);

export default router;


