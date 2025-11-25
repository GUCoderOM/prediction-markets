import { Router } from 'express';
import { buyYes, buyNo, sellYes, sellNo } from '../controllers/tradeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// BUY YES
router.post('/:marketId/yes', authMiddleware, buyYes);

// BUY NO
router.post('/:marketId/no', authMiddleware, buyNo);

// SELL YES
router.post('/:marketId/sell/yes', authMiddleware, sellYes);

// SELL NO
router.post('/:marketId/sell/no', authMiddleware, sellNo);

export default router;