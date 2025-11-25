"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { PortfolioSummary } from "@/components/PortfolioSummary";
import { PortfolioTable } from "@/components/PortfolioTable";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function PortfolioPage() {
    const { user, loading: authLoading } = useUser();
    const router = useRouter();
    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // LMSR Cost Function
    const B = 20;
    const getPrice = (yesShares: number, noShares: number, outcome: "yes" | "no") => {
        const expYes = Math.exp(yesShares / B);
        const expNo = Math.exp(noShares / B);
        const sum = expYes + expNo;
        return (outcome === "yes" ? expYes : expNo) / sum;
    };

    const handleMarketUpdate = useCallback((update: any) => {
        setPositions((prev) => {
            return prev.map((p) => {
                if (p.marketId === update.marketId) {
                    return {
                        ...p,
                        market: {
                            ...p.market,
                            yesShares: update.yesShares,
                            noShares: update.noShares,
                        },
                    };
                }
                return p;
            });
        });
    }, []);

    const fetchPortfolio = async () => {
        try {
            const res = await api.get("/auth/me/portfolio");
            setPositions(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load portfolio data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) {
            fetchPortfolio();
        }
    }, [user]);

    // WebSocket for real-time updates
    useEffect(() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        const ws = new WebSocket(`${protocol}//${host}:8081`);

        ws.onopen = () => {
            console.log("Connected to WS");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "market_update") {
                handleMarketUpdate(data);
            }
        };

        return () => {
            ws.close();
        };
    }, [handleMarketUpdate]);

    // Calculate portfolio metrics
    const { portfolioValue, totalInvested, totalProfit } = useMemo(() => {
        let val = 0;
        let invested = 0;

        positions.forEach((p) => {
            // Safety check for market data
            if (p.market) {
                const currentPrice = getPrice(p.market.yesShares || 0, p.market.noShares || 0, p.outcome);
                val += p.totalShares * currentPrice;
                invested += p.totalShares * p.avgPrice;
            }
        });

        return {
            portfolioValue: val,
            totalInvested: invested,
            totalProfit: val - invested
        };
    }, [positions]);

    const totalBalance = (user?.balance || 0) + portfolioValue;

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <PortfolioSummary
                balance={totalBalance}
                invested={totalInvested}
                profit={totalProfit}
            />

            <div className="mt-8">
                <PortfolioTable positions={positions} />
            </div>

            <div className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg w-full">
                <h3 className="text-lg font-semibold mb-2">Pro Tip</h3>
                <p className="text-blue-100 text-sm">
                    Diversify your positions across different markets to minimize risk and maximize potential returns.
                </p>
            </div>
        </div>
    );
}
