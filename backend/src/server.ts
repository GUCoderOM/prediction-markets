// backend/src/server.ts
import app from "./app.js";
import { startCandleJob } from "./services/candles/candleJob.js";
import { startWebSocketServer } from "./ws/server.js";

const PORT = process.env.PORT || 3001;

// -------------------------------
// START EXPRESS SERVER
// -------------------------------
const server = app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

// -------------------------------
// START WEBSOCKET SERVER
// -------------------------------
startWebSocketServer();

// -------------------------------
// START CANDLE AGGREGATION JOB
// -------------------------------
startCandleJob();

export default server;