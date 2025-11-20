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
  const markets = await prisma.market.findMany();
  res.json(markets);
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
    const { outcome } = req.body; // "yes" or "no"

    const market = await prisma.market.findUnique({ where: { id } });
    if (!market) return res.status(404).json({ message: "Market not found" });

    // Resolve
    const resolved = await prisma.market.update({
      where: { id },
      data: { status: "resolved", resolution: outcome }
    });

    res.json(resolved);

  } catch {
    res.status(500).json({ error: "Server error" });
  }
};