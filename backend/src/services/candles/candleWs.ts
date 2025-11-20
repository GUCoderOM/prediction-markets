// backend/src/services/candles/candleWs.ts
import { broadcast } from "../../ws/server.js";

export function broadcastCandle(marketId: number, candle: any) {
  console.log("📡 Broadcasting candle:", {
    marketId,
    timeframe: candle.timeframe,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    timestamp: candle.timestamp,
  });

  broadcast({
    type: "candle_update",
    marketId,
    timeframe: candle.timeframe,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    timestamp: candle.timestamp,
  });
}