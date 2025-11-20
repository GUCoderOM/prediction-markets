// backend/src/routes/candle.ts
import { Router } from "express";
import { prisma } from "../utils/prisma.js";

const router = Router();

/**
 * GET /market/:id/candles?tf=5s|1m|5m|15m|1h
 */
router.get("/:id/candles", async (req, res) => {
  try {
    const marketId = Number(req.params.id);
    const tf = (req.query.tf as string) || "5s";

    if (!marketId || Number.isNaN(marketId)) {
      return res.status(400).json({ error: "Invalid marketId" });
    }

    const candles = await prisma.marketCandle.findMany({
      where: { marketId, timeframe: tf },
      orderBy: { timestamp: "asc" },
    });

    res.json(candles);
  } catch (err) {
    console.error("CANDLES API ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;