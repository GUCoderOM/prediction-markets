import type { Request, Response } from "express";
import { TradeService } from "../services/tradeService.js";

export const buyYes = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const result = await TradeService.executeTrade(
      req.userId!,
      Number(req.params.marketId),
      "yes",
      "buy",
      Number(req.body.shares)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Trade failed" });
  }
};

export const buyNo = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const result = await TradeService.executeTrade(
      req.userId!,
      Number(req.params.marketId),
      "no",
      "buy",
      Number(req.body.shares)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Trade failed" });
  }
};

export const sellYes = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const result = await TradeService.executeTrade(
      req.userId!,
      Number(req.params.marketId),
      "yes",
      "sell",
      Number(req.body.shares)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Trade failed" });
  }
};

export const sellNo = async (req: Request & { userId?: number }, res: Response) => {
  try {
    const result = await TradeService.executeTrade(
      req.userId!,
      Number(req.params.marketId),
      "no",
      "sell",
      Number(req.body.shares)
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Trade failed" });
  }
};