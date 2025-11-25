import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import marketRoutes from "./routes/market.js";
import tradeRoutes from "./routes/trade.js";
import adminRoutes from "./routes/admin.js";
import candleRoutes from "./routes/candle.js";

dotenv.config();

const app = express();

// --------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/admin", adminRoutes);

// --------------------------------------------------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["ETag"],
  })
);

// --------------------------------------------------
// ROUTES (IMPORTANT — FIXED ORDER)
// --------------------------------------------------
app.use("/auth", authRoutes);

// ⬅️ marketRoutes MUST come first
app.use("/market", marketRoutes);

// ⬅️ candle routes AFTER market routes
app.use("/market", candleRoutes);

app.use("/trade", tradeRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true });
});

export default app;