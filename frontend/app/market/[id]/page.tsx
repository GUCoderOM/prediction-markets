"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CandleChart from "@/components/market/CandleChart";
import toast from "react-hot-toast";

type PricePoint = {
  priceYes: number;
  priceNo: number;
  createdAt: string;
};

type Market = {
  id: number | string;
  title: string;
  description: string;
  priceHistory: PricePoint[];
};

export default function MarketPage() {
  const { id } = useParams();

  const [market, setMarket] = useState<Market | null>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shares, setShares] = useState<number>(1); // ✅ Allow custom share amount

  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const token = process.env.NEXT_PUBLIC_DEV_TOKEN || "";

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
        setMarket(data.market);

        if (data.market && data.market.priceHistory) {
          let lastClose =
            data.market.priceHistory.length > 0
              ? data.market.priceHistory[0].priceYes
              : 0.5;

          const formatted = data.market.priceHistory.map((p: PricePoint) => {
            const open = lastClose;
            const close = p.priceYes;

            const candle = {
              time: new Date(p.createdAt).getTime() / 1000,
              open,
              high: Math.max(open, close),
              low: Math.min(open, close),
              close,
            };

            lastClose = close;
            return candle;
          });

          setCandles(formatted);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, base, token]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!market) return <div style={{ padding: 20 }}>Market not found.</div>;

  const latest = market.priceHistory.at(-1);

  // ============================
  // BUY FUNCTION (with toast)
  // ============================
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
        body: JSON.stringify({ shares }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Trade failed");
        return;
      }

      toast.success(`Bought ${shares} share(s) of ${position.toUpperCase()}`);
    } catch (err) {
      toast.error("Trade failed");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>{market.title}</h1>
      <p style={{ opacity: 0.7, marginBottom: 20 }}>{market.description}</p>

      <CandleChart candles={candles} />

      {latest && (
        <div style={{ marginTop: 20 }}>
          <strong>YES:</strong> {(latest.priceYes * 100).toFixed(1)}% &nbsp; | &nbsp;
          <strong>NO:</strong> {(latest.priceNo * 100).toFixed(1)}%
        </div>
      )}

      {/* =======================
          SHARE INPUT
      ======================== */}
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

      {/* =======================
          BUY BUTTONS
      ======================== */}
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