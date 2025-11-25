import { prisma } from "../utils/prisma.js";
import { calculateCost } from "./lmsr/calcCost.js";
import { getPrices } from "./lmsr/getPrices.js";
import { broadcast } from "../ws/server.js";

const B = 20; // LMSR liquidity parameter

export class TradeService {
    static async executeTrade(
        userId: number,
        marketId: number,
        outcome: "yes" | "no",
        side: "buy" | "sell",
        shares: number
    ) {
        if (shares <= 0) throw new Error("Invalid shares amount");

        const market = await prisma.market.findUnique({ where: { id: marketId } });
        if (!market) throw new Error("Market not found");

        // Calculate Cost/Refund
        // Buy: cost is positive. Sell: cost is negative (refund).
        // For sell, we pass negative shares to calculateCost.
        const sharesDelta = side === "buy" ? shares : -shares;
        const cost = calculateCost(market.yesShares, market.noShares, sharesDelta, outcome, B);

        // If buying: cost > 0. If selling: cost < 0.
        // For balance check/update:
        // Buy: deduct cost. Sell: add refund (abs(cost)).
        const costInt = Math.ceil(cost); // For buy, we round up to be safe. For sell, this might be negative.

        // Wait, for sell, cost is negative. Math.ceil(-50.5) is -50. 
        // If we subtract -50, we add 50. This works.
        // But previously we used Math.floor(abs(cost)) for refund.
        // Let's stick to the logic:
        // Buy: cost > 0. User pays cost.
        // Sell: cost < 0. User gets abs(cost).

        // Let's handle balance check separately for clarity.
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        if (side === "buy") {
            if (user.balance < costInt) throw new Error("Insufficient balance");
        } else {
            // Check share ownership
            const position = await prisma.position.findUnique({
                where: { userId_marketId_outcome: { userId, marketId, outcome } }
            });
            if (!position || position.totalShares < shares) throw new Error("Insufficient shares");
        }

        // Update Balance
        // If buy: balance - costInt (positive).
        // If sell: balance - costInt (negative) -> balance + abs(costInt).
        // Note: Previously sell used Math.floor(abs(cost)). 
        // Math.ceil(-50.5) is -50. Math.floor(50.5) is 50. So it matches.
        await prisma.user.update({
            where: { id: userId },
            data: { balance: { decrement: costInt } }, // decrementing a negative adds it.
        });

        // Update Market Shares
        const shareUpdate = side === "buy" ? { increment: shares } : { decrement: shares };
        await prisma.market.update({
            where: { id: marketId },
            data: {
                [outcome === "yes" ? "yesShares" : "noShares"]: shareUpdate
            }
        });

        // Record Trade
        await prisma.trade.create({
            data: {
                userId,
                marketId,
                outcome,
                shares: sharesDelta,
                cost
            },
        });

        // Log Trade History for profit/loss tracking
        const currentPrice = cost / Math.abs(sharesDelta); // Price per share
        await prisma.tradeHistory.create({
            data: {
                userId,
                marketId,
                outcome,
                action: side,
                shares: Math.abs(shares),
                price: currentPrice,
                totalCost: Math.abs(cost)
            }
        });

        // Update Position
        if (side === "buy") {
            await prisma.position.upsert({
                where: { userId_marketId_outcome: { userId, marketId, outcome } },
                update: { totalShares: { increment: shares } },
                create: {
                    userId,
                    marketId,
                    outcome,
                    totalShares: shares,
                    avgPrice: cost / shares
                }
            });

            // Fix avgPrice for existing position
            const pos = await prisma.position.findUnique({
                where: { userId_marketId_outcome: { userId, marketId, outcome } }
            });
            if (pos && pos.totalShares > shares) {
                const oldShares = pos.totalShares - shares;
                const oldCost = oldShares * pos.avgPrice;
                const newAvg = (oldCost + cost) / pos.totalShares;
                await prisma.position.update({ where: { id: pos.id }, data: { avgPrice: newAvg } });
            }
        } else {
            // Sell
            const pos = await prisma.position.findUnique({
                where: { userId_marketId_outcome: { userId, marketId, outcome } }
            });
            if (pos) {
                await prisma.position.update({
                    where: { id: pos.id },
                    data: { totalShares: { decrement: shares } }
                });
            }
        }

        // Snapshot & Broadcast
        const updated = await prisma.market.findUnique({ where: { id: marketId } });
        if (updated) {
            const prices = getPrices(updated.yesShares, updated.noShares, B);

            await prisma.marketPriceSnapshot.create({
                data: {
                    marketId,
                    priceYes: prices.yes,
                    priceNo: prices.no,
                },
            });

            broadcast({
                type: "market_update",
                marketId,
                yesShares: updated.yesShares,
                noShares: updated.noShares,
                priceYes: prices.yes,
                priceNo: prices.no,
                historyPoint: { yes: prices.yes, no: prices.no },
            });

            // Broadcast balance update to user
            const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
            if (updatedUser) {
                broadcast({
                    type: "balance_update",
                    userId,
                    balance: updatedUser.balance
                });
            }

            return {
                message: `${side.toUpperCase()} ${outcome.toUpperCase()} successful`,
                cost: costInt,
                price: outcome === "yes" ? prices.yes : prices.no
            };
        }

        return { message: "Trade successful" };
    }
}
