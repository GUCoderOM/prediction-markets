import { Router } from "express";
import {
  createMarket,
  listMarkets,
  getMarketById,
  resolveMarket
} from "../controllers/marketController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create", authMiddleware, createMarket);
router.get("/", authMiddleware, listMarkets);
router.get("/:id", authMiddleware, getMarketById);
router.post("/:id/resolve", authMiddleware, resolveMarket);

export default router;