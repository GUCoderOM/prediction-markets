import type { Request, Response } from 'express';
import { BotManager } from '../services/BotManager.js';

export const startBots = async (req: Request, res: Response) => {
    try {
        const { count } = req.body;
        const botCount = Number(count) || 1;

        await BotManager.getInstance().start(botCount);

        res.json({ message: `Started ${botCount} bots`, status: BotManager.getInstance().getStatus() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const stopBots = async (req: Request, res: Response) => {
    try {
        BotManager.getInstance().stop();
        res.json({ message: "Bots stopped", status: BotManager.getInstance().getStatus() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
};

export const getBotStatus = async (req: Request, res: Response) => {
    res.json(BotManager.getInstance().getStatus());
};