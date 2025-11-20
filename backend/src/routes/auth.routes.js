import { Router } from 'express';
import { login, register, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateUser } from '../middleware/validation.js';

const router = Router();

router.post('/login', login);
router.post('/register', validateUser, register);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;


