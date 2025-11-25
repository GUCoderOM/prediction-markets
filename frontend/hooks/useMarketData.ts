import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";

export type PricePoint = {
    priceYes: number;
    priceNo: number;
    createdAt: string;
};

export type CandlePoint = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

export type Market = {
    id: number;
    title: string;
    description: string;
    status: string;
    priceHistory: PricePoint[];
};

type WSMessage =
    | {
        type: "market_update";
        marketId: number;
        yesShares: number;
        noShares: number;
        priceYes: number;
        priceNo: number;
        historyPoint: { yes: number; no: number };
    }
    | {
        type: "candle_update";
        marketId: number;
        timestamp: number;
        open: number;
        high: number;
        low: number;
        close: number;
    };

export function useMarketData(id: string | undefined) {
    const [market, setMarket] = useState<Market | null>(null);
    const [candles, setCandles] = useState<CandlePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!id) return;

        async function load() {
            try {
                // Load market data
                const res = await api.get(`/market/${id}`);
                const m: Market = res.data.market;
                setMarket(m);

                // Load candles data
                const candlesRes = await api.get(`/market/${id}/candles?tf=5s`);
                const loadedCandles = candlesRes.data.map((c: any) => ({
                    time: new Date(c.timestamp).getTime() / 1000,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                }));

                // Sort candles by time just in case
                loadedCandles.sort((a: CandlePoint, b: CandlePoint) => a.time - b.time);

                setCandles(loadedCandles);
            } catch (e) {
                console.error("Failed to load market data", e);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        const ws = new WebSocket(`${protocol}//${host}:8081`);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ type: "subscribe", marketId: Number(id) }));
        };

        ws.onmessage = (event) => {
            const msg: WSMessage = JSON.parse(event.data);
            // console.log("WS Message:", msg.type, msg);

            if (msg.type === "market_update") {
                console.log("Market Update received:", msg);
                setMarket((prev) =>
                    prev
                        ? {
                            ...prev,
                            priceHistory: [
                                ...prev.priceHistory,
                                {
                                    priceYes: msg.priceYes,
                                    priceNo: msg.priceNo,
                                    createdAt: new Date().toISOString(),
                                },
                            ],
                        }
                        : prev
                );

                // Also update candles for real-time chart
                setCandles((prev) => {
                    if (prev.length === 0) return prev;

                    const lastCandle = prev[prev.length - 1];
                    const now = Date.now() / 1000;
                    const candleTime = Math.floor(now / 5) * 5; // 5s candles
                    const price = msg.priceYes; // Using YES price for chart

                    if (lastCandle.time === candleTime) {
                        // Update existing candle
                        return [
                            ...prev.slice(0, -1),
                            {
                                ...lastCandle,
                                high: Math.max(lastCandle.high, price),
                                low: Math.min(lastCandle.low, price),
                                close: price
                            }
                        ];
                    } else {
                        // Create new candle
                        return [
                            ...prev,
                            {
                                time: candleTime,
                                open: price,
                                high: price,
                                low: price,
                                close: price
                            }
                        ];
                    }
                });
            }

            if (msg.type === "candle_update") {
                setCandles((prev) => [
                    ...prev,
                    {
                        time: msg.timestamp / 1000,
                        open: msg.open,
                        high: msg.high,
                        low: msg.low,
                        close: msg.close,
                    },
                ]);
            }
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [id]);

    return { market, candles, loading };
}
