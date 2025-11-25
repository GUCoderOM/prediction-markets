import { PrismaClient } from '@prisma/client';
import { TradeService } from '../src/services/tradeService.js';

const prisma = new PrismaClient();

let isRunning = true;

async function botTrade() {
    if (!isRunning) return;

    try {
        const bot = await prisma.user.findUnique({
            where: { email: 'bot@bot.com' }
        });

        if (!bot) {
            console.error('❌ Bot user not found. Please run: npm run seed');
            process.exit(1);
        }

        const markets = await prisma.market.findMany({
            where: { status: 'open' }
        });

        if (markets.length === 0) {
            console.log('⏸️  No open markets found');
            return;
        }

        // Random market
        const market = markets[Math.floor(Math.random() * markets.length)];

        // Random outcome and side
        const outcome = Math.random() > 0.5 ? 'yes' : 'no';
        const side = Math.random() > 0.3 ? 'buy' : 'sell'; // 70% buy, 30% sell

        // Random shares (1-10)
        const shares = Math.floor(Math.random() * 10) + 1;

        try {
            await TradeService.executeTrade(bot.id, market.id, outcome, side, shares);
            console.log(`🤖 Bot ${side.toUpperCase()} ${shares} ${outcome.toUpperCase()} shares in "${market.title.substring(0, 40)}..."`);
        } catch (e: any) {
            console.log(`⚠️  Bot trade failed: ${e.message}`);
        }
    } catch (e) {
        console.error('❌ Error in bot trader:', e);
    }
}

// Trade every 5-15 seconds
function scheduleTrade() {
    if (!isRunning) return;

    const delay = Math.random() * 10000 + 5000; // 5-15 seconds
    setTimeout(async () => {
        await botTrade();
        scheduleTrade();
    }, delay);
}

console.log('🤖 Bot trader started');
console.log('📊 Trading every 5-15 seconds');
console.log('Press Ctrl+C to stop\n');

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping bot trader...');
    isRunning = false;
    await prisma.$disconnect();
    process.exit(0);
});

// Start trading
scheduleTrade();
