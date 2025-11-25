import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create test user (admin)
    const testUser = await prisma.user.upsert({
        where: { email: 'test@gmail.com' },
        update: {},
        create: {
            email: 'test@gmail.com',
            password: await bcrypt.hash('testtest123', 10),
            balance: 1000,
            isAdmin: true
        }
    });
    console.log('✅ Created test user (admin): test@gmail.com');

    // 2. Create bot user
    const botUser = await prisma.user.upsert({
        where: { email: 'bot@bot.com' },
        update: {},
        create: {
            email: 'bot@bot.com',
            password: await bcrypt.hash('bot123', 10),
            balance: 10000,
            isAdmin: false
        }
    });
    console.log('✅ Created bot user: bot@bot.com');

    // 3. Create markets
    const markets = [
        {
            title: "Will BTC hit 150K before 2026?",
            description: "Bitcoin must reach $150,000 USD on any major exchange (Coinbase, Binance, Kraken) before January 1, 2026 00:00 UTC for YES outcome. Price must be sustained for at least 1 hour."
        },
        {
            title: "Will AI achieve AGI by 2025?",
            description: "Artificial General Intelligence (AGI) - defined as AI that can perform any intellectual task a human can - must be publicly demonstrated and verified by at least 3 major AI research institutions before December 31, 2025 23:59 UTC for YES outcome."
        },
        {
            title: "Will SpaceX land humans on Mars by 2030?",
            description: "SpaceX must successfully land at least one human on the surface of Mars and have them survive for at least 24 hours before January 1, 2030 00:00 UTC for YES outcome. Mission must be confirmed by NASA or ESA."
        }
    ];

    for (const marketData of markets) {
        const market = await prisma.market.create({
            data: {
                ...marketData,
                status: 'open',
                yesShares: 0,
                noShares: 0
            }
        });

        // Create initial price snapshot
        await prisma.marketPriceSnapshot.create({
            data: {
                marketId: market.id,
                priceYes: 0.5,
                priceNo: 0.5
            }
        });

        console.log(`✅ Created market: ${market.title}`);
    }

    console.log('✨ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: test@gmail.com / testtest123');
    console.log('   Bot: bot@bot.com / bot123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
