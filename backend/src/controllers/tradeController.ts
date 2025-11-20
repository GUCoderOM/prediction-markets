import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";
import { calculateCost } from "../services/lmsr/calcCost.js";
import { getPrices } from "../services/lmsr/getPrices.js";
import { broadcast } from "../ws/server.js";

const B = 20; // LMSR liquidity parameter

// -----------------------------
// BUY YES
// -----------------------------
export const buyYes = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId!;
    const marketId = Number(req.params.marketId);
    const { shares } = req.body;

    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market) return res.status(404).json({ message: "Market not found" });

    const cost = calculateCost(market.yesShares, market.noShares, shares, "yes", B);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.balance < cost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance - cost },
    });

    await prisma.market.update({
      where: { id: marketId },
      data: { yesShares: market.yesShares + shares },
    });

    await prisma.trade.create({
      data: { userId, marketId, outcome: "yes", shares, cost },
    });

    const updated = await prisma.market.findUnique({ where: { id: marketId } });
    if (!updated) return res.json({ message: "YES bought", cost });

    const prices = getPrices(updated.yesShares, updated.noShares, B);

    const snapshot = await prisma.marketPriceSnapshot.create({
      data: {
        marketId,
        priceYes: prices.yes,
        priceNo: prices.no,
      },
    });

    // --- WEBSOCKET EVENT ---
    broadcast({
      type: "market_update",
      marketId,
      yesShares: updated.yesShares,
      noShares: updated.noShares,
      priceYes: prices.yes,
      priceNo: prices.no,
      historyPoint: {
      yes: prices.yes,
      no: prices.no,
      },
    });

    res.json({
      message: "YES bought",
      cost,
      price: prices.yes,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// BUY NO
// -----------------------------
export const buyNo = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const userId = req.userId!;
    const marketId = Number(req.params.marketId);
    const { shares } = req.body;

    const market = await prisma.market.findUnique({ where: { id: marketId } });
    if (!market) return res.status(404).json({ message: "Market not found" });

    const cost = calculateCost(market.yesShares, market.noShares, shares, "no", B);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.balance < cost) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { balance: user.balance - cost },
    });

    await prisma.market.update({
      where: { id: marketId },
      data: { noShares: market.noShares + shares },
    });

    await prisma.trade.create({
      data: { userId, marketId, outcome: "no", shares, cost },
    });

    const updated = await prisma.market.findUnique({ where: { id: marketId } });
    if (!updated) return res.json({ message: "NO bought", cost });

    const prices = getPrices(updated.yesShares, updated.noShares, B);

    const snapshot = await prisma.marketPriceSnapshot.create({
      data: {
        marketId,
        priceYes: prices.yes,
        priceNo: prices.no,
      },
    });

    // --- WEBSOCKET EVENT ---
    broadcast({
      type: "market_update",
      marketId,
      yesShares: updated.yesShares,
      noShares: updated.noShares,
      priceYes: prices.yes,
      priceNo: prices.no,
      historyPoint: {
      yes: prices.yes,
      no: prices.no,
      },
    });

    res.json({
      message: "NO bought",
      cost,
      price: prices.no,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};