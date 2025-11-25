import type { Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';

export const createMarket = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    const market = await prisma.market.create({
      data: { title, description, status: "open" }
    });

    res.json(market);

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const listMarkets = async (req: Request, res: Response) => {
  const markets = await prisma.market.findMany({
    where: { status: "open" },
    include: {
      priceHistory: {
        orderBy: { createdAt: "desc" },
        take: 50,
      }
    }
  });

  // Reverse history to be ascending for the chart
  const marketsWithHistory = markets.map(m => ({
    ...m,
    priceHistory: m.priceHistory.reverse()
  }));

  res.json(marketsWithHistory);
};

export const getMarketById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!market) {
      return res.status(404).json({ message: "Market not found" });
    }

    // Convert snapshots → numeric array
    const history = market.priceHistory.map((p) => p.priceYes);

    // Return unified structure for the frontend
    return res.json({
      market,
      history
    });

  } catch (err) {
    console.error("GET MARKET ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const resolveMarket = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { outcome, description } = req.body; // outcome: "yes", "no", "testing_done"

    const market = await prisma.market.findUnique({ where: { id } });
    if (!market) return res.status(404).json({ message: "Market not found" });

    let finalOutcome: "yes" | "no" | null = null;
    if (outcome === "yes") finalOutcome = "yes";
    if (outcome === "no") finalOutcome = "no";
    // if "testing_done", finalOutcome remains null

    // Resolve market
    const resolved = await prisma.market.update({
      where: { id },
      data: {
        status: "resolved",
        resolution: finalOutcome,
        resolutionDescription: description
      }
    });

    // Pay out winners if there's a resolution (not testing_done)
    if (finalOutcome) {
      const positions = await prisma.position.findMany({
        where: { marketId: id }
      });

      for (const position of positions) {
        if (position.outcome === finalOutcome) {
          // Winner: Pay $1 per share
          const payout = position.totalShares;
          await prisma.user.update({
            where: { id: position.userId },
            data: { balance: { increment: payout } }
          });
        }
        // Losers get nothing (shares become worthless)
      }
    }

    res.json(resolved);

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};