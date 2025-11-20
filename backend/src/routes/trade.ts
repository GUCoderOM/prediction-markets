import { Router } from 'express';
import { buyYes, buyNo } from '../controllers/tradeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// BUY YES
router.post('/:marketId/yes', authMiddleware, buyYes);

// BUY NO
router.post('/:marketId/no', authMiddleware, buyNo);

export default router;