import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// REGISTER
router.post('/register', registerUser);

// LOGIN
router.post('/login', loginUser);

// GET LOGGED IN USER
router.get('/me', authMiddleware, getMe);

export default router;