// backend/src/services/candles/candleWs.ts
import { broadcast } from "../../ws/server.js";

export function broadcastCandle(marketId: number, candle: any) {
  // Convert timestamp → seconds
  const seconds = Math.floor(new Date(candle.timestamp).getTime() / 1000);

  console.log("📡 Broadcasting candle:", {
    marketId,
    timeframe: candle.timeframe,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    timestamp: seconds,
  });

  broadcast({
    type: "candle_update",
    marketId,
    timeframe: candle.timeframe,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    timestamp: seconds, // ✔ seconds, not ms
  });
}