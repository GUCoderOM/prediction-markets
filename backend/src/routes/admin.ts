import { Router } from 'express';
import { startBots, stopBots, getBotStatus } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/bots/start', startBots);
router.post('/bots/stop', stopBots);
router.get('/bots/status', getBotStatus);

export default router;