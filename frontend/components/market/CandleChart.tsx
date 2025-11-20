"use client";

import { useEffect, useRef } from "react";
import { init, dispose, type KLineData, type Chart } from "klinecharts";

export type CandlePoint = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export default function CandleChart({ candles }: { candles: CandlePoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Explicitly typed chart instance that may start null
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const chart = init(el);
    chartRef.current = chart; // now definitely not null

    if (candles.length > 0) {
      const formatted: KLineData[] = candles.map((c) => ({
        timestamp: c.time * 1000,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      // ---- FIX: TypeScript-safe no-null assertion ----
      chartRef.current!.applyNewData(formatted);
    }

    return () => {
      dispose(el);
      chartRef.current = null; // cleanup
    };
  }, [candles]);

  return <div ref={containerRef} style={{ width: "100%", height: 300 }} />;
}