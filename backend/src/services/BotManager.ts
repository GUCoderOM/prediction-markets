import { PrismaClient } from '@prisma/client';
import { TradeService } from './tradeService.js';
import { prisma } from '../utils/prisma.js';

export class BotManager {
    private static instance: BotManager;
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private botCount: number = 0;
    private minBalance: number = 10000;
    private refillAmount: number = 20000;

    private constructor() { }

    public static getInstance(): BotManager {
        if (!BotManager.instance) {
            BotManager.instance = new BotManager();
        }
        return BotManager.instance;
    }

    public async start(count: number) {
        if (this.isRunning) {
            this.stop();
        }

        this.botCount = count;
        this.isRunning = true;
        console.log(`🤖 Starting ${count} bots...`);

        // Ensure we have enough bot users
        await this.ensureBotUsers(count);

        // Start the trading loop
        // We'll run a loop every 2 seconds, and in each loop, we'll pick random bots to trade.
        // To simulate N bots running "at each time", we can distribute their trades.
        // Let's say each bot trades once every 10-20 seconds on average.
        // So in each 2s interval, roughly N/5 to N/10 bots should trade.

        this.intervalId = setInterval(() => {
            this.runBotCycle();
        }, 2000);
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🤖 Bots stopped.');
    }

    public getStatus() {
        return {
            isRunning: this.isRunning,
            botCount: this.botCount
        };
    }

    private async ensureBotUsers(count: number) {
        const existingBots = await prisma.user.count({
            where: { email: { startsWith: 'bot_' } }
        });

        if (existingBots < count) {
            const needed = count - existingBots;
            console.log(`Creating ${needed} new bot users...`);
            for (let i = 0; i < needed; i++) {
                const id = existingBots + i + 1;
                await prisma.user.upsert({
                    where: { email: `bot_${id}@bot.com` },
                    update: {},
                    create: {
                        email: `bot_${id}@bot.com`,
                        password: 'botpassword', // In production, hash this
                        balance: 50000,
                        isAdmin: false
                    }
                });
            }
        }
    }

    private async runBotCycle() {
        if (!this.isRunning) return;

        try {
            // Fetch all bot users (or a subset if too many)
            // For now, fetch all that match our pattern
            const bots = await prisma.user.findMany({
                where: {
                    OR: [
                        { email: 'bot@bot.com' },
                        { email: { startsWith: 'bot_' } }
                    ]
                },
                take: this.botCount
            });

            if (bots.length === 0) return;

            const markets = await prisma.market.findMany({ where: { status: 'open' } });
            if (markets.length === 0) return;

            // Determine how many bots trade this cycle
            // Let's say 20% of active bots trade every 2 seconds
            const activeCount = Math.max(1, Math.floor(this.botCount * 0.2));

            // Shuffle bots to pick random ones
            const shuffledBots = bots.sort(() => 0.5 - Math.random()).slice(0, activeCount);

            for (const bot of shuffledBots) {
                // Check Balance
                if (bot.balance < this.minBalance) {
                    await prisma.user.update({
                        where: { id: bot.id },
                        data: { balance: { increment: this.refillAmount } }
                    });
                    console.log(`💰 Refilled bot ${bot.email} balance`);
                }

                // Pick random market
                const market = markets[Math.floor(Math.random() * markets.length)];
                if (!market) continue;

                // Strategy: Vary trends
                // We can use a simple random walk or mean reversion, or just pure random.
                // User asked: "some should vary. Let your bot vary in the trends they make"
                // We can assign a "personality" to each bot based on ID, or just randomize.
                // Let's randomize side and outcome.

                // 60% chance to buy, 40% to sell (slight buy bias to keep activity up)
                const side = Math.random() > 0.4 ? 'buy' : 'sell';
                const outcome = Math.random() > 0.5 ? 'yes' : 'no';
                const shares = Math.floor(Math.random() * 10) + 1;

                try {
                    await TradeService.executeTrade(bot.id, market.id, outcome, side, shares);
                    // console.log(`🤖 ${bot.email} ${side} ${shares} ${outcome} on ${market.id}`);
                } catch (e) {
                    // Ignore trade errors (insufficient funds/shares)
                }
            }

        } catch (e) {
            console.error("Error in bot cycle:", e);
        }
    }
}
