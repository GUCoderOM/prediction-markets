// backend/src/services/candles/candleJob.ts
import { prisma } from "../../utils/prisma.js";
import { computeCandleFromSnapshots } from "./candleUtils.js";
import { broadcastCandle } from "./candleWs.js";
import { aggregateHigherTimeframes } from "./candleAggregator.js";

const INTERVAL_MS = 5000;

export function startCandleJob() {
  console.log("🕒 Candle job started (5s intervals)");

  setInterval(async () => {
    console.log("🕒 Candle job tick:", new Date().toISOString());

    try {
      const markets = await prisma.market.findMany({
        select: { id: true },
      });

      const now = new Date();
      const windowStart = new Date(now.getTime() - INTERVAL_MS);

      for (const m of markets) {
        const snapshots = await prisma.marketPriceSnapshot.findMany({
          where: {
            marketId: m.id,
            createdAt: {
              gte: windowStart,
              lte: now,
            },
          },
          orderBy: { createdAt: "asc" },
        });

        if (snapshots.length === 0) continue;

        const candle = computeCandleFromSnapshots(snapshots);

        const saved = await prisma.marketCandle.create({
          data: {
            marketId: m.id,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            timeframe: "5s",
            timestamp: windowStart,
          },
        });

        console.log(
          "🟩 Saved 5s candle:",
          "market", m.id,
          "ts", saved.timestamp.toISOString(),
          "O/H/L/C", saved.open, saved.high, saved.low, saved.close
        );

        broadcastCandle(m.id, saved);

        await aggregateHigherTimeframes(m.id);
      }
    } catch (err) {
      console.error("CANDLE JOB ERROR:", err);
    }
  }, INTERVAL_MS);
}