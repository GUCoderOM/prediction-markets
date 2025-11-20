import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  adminSetOwnBalance,
  adminSetUserBalance
} from "../controllers/adminController.js";

const router = Router();

router.post("/balance/self", authMiddleware, adminMiddleware, adminSetOwnBalance);

router.post("/balance/user", authMiddleware, adminMiddleware, adminSetUserBalance);

export default router;