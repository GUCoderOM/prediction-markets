"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { subscribeToCandleUpdates, type CandleUpdate } from "@/lib/ws";

export type Candle = {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

/* --------------------------------------------------------
   NORMALIZER (backend or WS event → clean Candle object)
--------------------------------------------------------- */
function normalizeRawCandle(raw: any): Candle | null {
  if (!raw) return null;

  const open = Number(raw.open);
  const high = Number(raw.high);
  const low = Number(raw.low);
  const close = Number(raw.close);

  if ([open, high, low, close].some((v) => Number.isNaN(v))) {
    console.warn("🔥 Invalid OHLC values:", raw);
    return null;
  }

  const t = raw.timestamp ?? raw.time ?? raw.createdAt;
  if (!t) {
    console.warn("🔥 Missing timestamp:", raw);
    return null;
  }

  let time: number;

  // number timestamps
  if (typeof t === "number") {
    // If it's in ms, convert → seconds
    time = t > 1_000_000_000_000 ? Math.floor(t / 1000) : t;
  } else {
    const ms = Date.parse(t);
    if (Number.isNaN(ms)) {
      console.warn("🔥 Unparseable timestamp:", t);
      return null;
    }
    time = Math.floor(ms / 1000);
  }

  return { time, open, high, low, close };
}

/* --------------------------------------------------------
   MAIN HOOK
--------------------------------------------------------- */
export function useCandles(marketId: number | null, timeframe: string = "5s") {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ❗ Important: ignore NaN, undefined, null
    if (marketId === null || !Number.isFinite(marketId)) {
      console.warn("❗ useCandles skipped: invalid marketId =", marketId);
      return;
    }

    let cancelled = false;

    setCandles([]);
    setLoading(true);

    /* --------------------------------------------------------
       1️⃣ INITIAL LOAD (REST)
    --------------------------------------------------------- */
    async function loadInitial() {
      try {
        const res = await api.get(`/market/${marketId}/candles`, {
          params: { tf: timeframe },
        });

        console.log("🔥 RAW initial candles:", res.data);

        const arr = Array.isArray(res.data) ? res.data : [];

        const parsed = arr
          .map((x) => normalizeRawCandle(x))
          .filter(Boolean) as Candle[];

        parsed.sort((a, b) => a.time - b.time);

        console.log("🔥 Parsed initial candles:", parsed);

        if (!cancelled) setCandles(parsed);
      } catch (err) {
        console.error("❌ Failed to load initial candles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitial();

    /* --------------------------------------------------------
       2️⃣ REAL-TIME UPDATES (WS)
    --------------------------------------------------------- */
    const unsub = subscribeToCandleUpdates((evt: CandleUpdate) => {
      console.log("🔥 WS candle update received:", evt);

      if (evt.marketId !== marketId) return;

      // Map WS format into raw candle shape
      const raw = {
        open: evt.open,
        high: evt.high,
        low: evt.low,
        close: evt.close,
        timestamp: evt.timestamp,
      };

      const c = normalizeRawCandle(raw);
      if (!c) return;

      setCandles((prev) => {
        if (prev.length === 0) return [c];

        const last = prev[prev.length - 1];

        // Same timeframe → update last candle
        if (last.time === c.time) {
          const updated = [...prev];
          updated[updated.length - 1] = c;
          return updated;
        }

        // Append new candle
        const next = [...prev, c];
        const MAX = 500;

        return next.length > MAX ? next.slice(next.length - MAX) : next;
      });
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [marketId, timeframe]);

  return { candles, loading };
}