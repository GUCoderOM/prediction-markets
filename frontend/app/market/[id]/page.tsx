"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import CandleChart from "@/components/market/CandleChart";
import toast from "react-hot-toast";

// TYPES
type PricePoint = {
  priceYes: number;
  priceNo: number;
  createdAt: string;
};

type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

type Market = {
  id: number;
  title: string;
  description: string;
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

export default function MarketPage() {
  const { id } = useParams();

  const [market, setMarket] = useState<Market | null>(null);
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [shares, setShares] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const token = process.env.NEXT_PUBLIC_DEV_TOKEN || "";

  // ==============================
  // INITIAL DATA FETCH
  // ==============================
  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const res = await fetch(`${base}/market/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const m: Market = data.market;

        setMarket(m);

        // Build initial candles
        let lastClose =
          m.priceHistory.length > 0 ? m.priceHistory[0].priceYes : 0.5;

        const initialCandles = m.priceHistory.map((p) => {
          const open = lastClose;
          const close = p.priceYes;

          const c: CandlePoint = {
            time: new Date(p.createdAt).getTime() / 1000,
            open,
            high: Math.max(open, close),
            low: Math.min(open, close),
            close,
          };

          lastClose = close;
          return c;
        });

        setCandles(initialCandles);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, base, token]);

  // ==============================
  // WEBSOCKET LIVE UPDATES
  // ==============================
  useEffect(() => {
    if (!id) return;

    const ws = new WebSocket("ws://localhost:8081");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "subscribe",
          marketId: Number(id),
        })
      );
    };

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);

      // MARKET UPDATES (YES/NO prices)
      if (msg.type === "market_update") {
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
      }

      // CANDLE UPDATES
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

  // ==============================
  // BUY FUNCTION
  // ==============================
  async function buy(position: "yes" | "no") {
    if (shares <= 0) {
      toast.error("Shares must be at least 1");
      return;
    }

    try {
      const res = await fetch(`${base}/trade/${id}/${position}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shares: Number(shares) }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message || "Trade failed");
        return;
      }

      toast.success(`Bought ${shares} share(s) of ${position.toUpperCase()}`);
    } catch {
      toast.error("Trade failed");
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!market) return <div style={{ padding: 20 }}>Market not found.</div>;

  const latest = market.priceHistory.at(-1);

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{market.title}</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>{market.description}</p>

      <CandleChart candles={candles} />

      {latest && (
        <div style={{ marginTop: 20 }}>
          <strong>YES:</strong> {(latest.priceYes * 100).toFixed(1)}% &nbsp;|&nbsp;
          <strong>NO:</strong> {(latest.priceNo * 100).toFixed(1)}%
        </div>
      )}

      {/* SHARE INPUT */}
      <div style={{ marginTop: 25 }}>
        <label style={{ fontWeight: 600 }}>Shares:</label>
        <input
          type="number"
          min={1}
          value={shares}
          onChange={(e) => setShares(Number(e.target.value))}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "10px 12px",
            fontSize: 16,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* BUY BUTTONS */}
      <div style={{ marginTop: 30, display: "flex", gap: 15 }}>
        <button
          onClick={() => buy("yes")}
          style={{
            flex: 1,
            padding: "14px 16px",
            background: "#16a34a",
            color: "white",
            border: "none",
            fontSize: 18,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Buy YES
        </button>

        <button
          onClick={() => buy("no")}
          style={{
            flex: 1,
            padding: "14px 16px",
            background: "#dc2626",
            color: "white",
            border: "none",
            fontSize: 18,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Buy NO
        </button>
      </div>
    </div>
  );
}