// backend/src/controllers/candleController.ts
import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

const ALLOWED_TIMEFRAMES = ["5s", "1m", "5m", "15m", "1h"] as const;
type Timeframe = (typeof ALLOWED_TIMEFRAMES)[number];

export const getMarketCandles = async (req: Request, res: Response) => {
  try {
    const marketId = Number(req.params.marketId || req.params.id);
    if (!Number.isFinite(marketId)) {
      return res.status(400).json({ error: "Invalid market id" });
    }

    const tfRaw = (req.query.tf as string | undefined) ?? "5s";
    const timeframe: Timeframe = ALLOWED_TIMEFRAMES.includes(
      tfRaw as Timeframe
    )
      ? (tfRaw as Timeframe)
      : "5s";

    const candles = await prisma.marketCandle.findMany({
      where: { marketId, timeframe },
      orderBy: { timestamp: "asc" },
      take: 500,
    });

    const payload = candles.map((c) => ({
      time: Math.floor(c.timestamp.getTime() / 1000), // ← FIXED: unix seconds
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    return res.json(payload);
  } catch (err) {
    console.error("GET CANDLES ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};