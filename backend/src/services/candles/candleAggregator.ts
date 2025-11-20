// backend/src/services/candles/candleAggregator.ts
import { prisma } from "../../utils/prisma.js";
import { broadcastCandle } from "./candleWs.js";

export const TF_SECONDS = {
  "5s": 5,
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
} as const;

type Timeframe = keyof typeof TF_SECONDS;

function floorToBucket(date: Date, bucketSeconds: number): Date {
  const unix = Math.floor(date.getTime() / 1000);
  const bucket = Math.floor(unix / bucketSeconds) * bucketSeconds;
  return new Date(bucket * 1000);
}

async function aggregateFromTo(
  marketId: number,
  fromTf: Timeframe,
  toTf: Timeframe
) {
  const fromSeconds = TF_SECONDS[fromTf];
  const toSeconds = TF_SECONDS[toTf];

  if (!fromSeconds || !toSeconds) return;

  const since = new Date(Date.now() - toSeconds * 20 * 1000);

  const fromCandles = await prisma.marketCandle.findMany({
    where: {
      marketId,
      timeframe: fromTf,
      timestamp: { gte: since },
    },
    orderBy: { timestamp: "asc" },
  });

  if (fromCandles.length === 0) return;

  const groups = new Map<string, typeof fromCandles>();

  for (const c of fromCandles) {
    const bucketStart = floorToBucket(c.timestamp, toSeconds);
    const key = bucketStart.toISOString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  const bucketKeys = Array.from(groups.keys());
  if (bucketKeys.length === 0) return;

  const existing = await prisma.marketCandle.findMany({
    where: {
      marketId,
      timeframe: toTf,
      timestamp: {
        in: bucketKeys.map((iso) => new Date(iso)),
      },
    },
    select: { timestamp: true },
  });

  const existingSet = new Set(existing.map((e) => e.timestamp.toISOString()));

  for (const [key, list] of groups.entries()) {
    if (!list || list.length === 0) continue;
    if (existingSet.has(key)) continue;

    list.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const first = list[0]!;
    const last = list[list.length - 1]!;

    const open = first.open;
    const close = last.close;
    let high = first.high;
    let low = first.low;

    for (const c of list) {
      if (c.high > high) high = c.high;
      if (c.low < low) low = c.low;
    }

    const timestamp = new Date(key);

    const saved = await prisma.marketCandle.create({
      data: {
        marketId,
        timeframe: toTf,
        timestamp,
        open,
        high,
        low,
        close,
      },
    });

    // FIX: ensure timeframe is included in broadcast
    broadcastCandle(marketId, {
      ...saved,
      timeframe: toTf,
    });
  }
}

export async function aggregateHigherTimeframes(marketId: number) {
  await aggregateFromTo(marketId, "5s", "1m");
  await aggregateFromTo(marketId, "1m", "5m");
  await aggregateFromTo(marketId, "5m", "15m");
  await aggregateFromTo(marketId, "15m", "1h");
}