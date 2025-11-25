import { Router } from 'express';
import { registerUser, loginUser, getMe, getPortfolio } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// REGISTER
router.post('/register', registerUser);

// LOGIN
router.post('/login', loginUser);

// GET LOGGED IN USER
router.get('/me', authMiddleware, getMe);

// GET USER PORTFOLIO
router.get('/me/portfolio', authMiddleware, getPortfolio);

export default router;