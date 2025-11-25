"use client";

import { useRef, useState, useEffect } from "react";
import { init, dispose } from "klinecharts";
import type { KLineData, Chart } from "klinecharts";
import { CandlePoint } from "@/hooks/useMarketData";
import { BarChart2, LineChart } from "lucide-react";

export default function CandleChart({ candles }: { candles: CandlePoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<"candle_solid" | "area">("candle_solid");

  // Helper to process and validate data
  const processData = (rawCandles: CandlePoint[]): KLineData[] => {
    return rawCandles
      .map((c) => {
        // Validate all values are finite numbers
        if (!Number.isFinite(c.open) || !Number.isFinite(c.high) ||
          !Number.isFinite(c.low) || !Number.isFinite(c.close)) {
          console.warn("Invalid candle (NaN/Infinity):", c);
          return null;
        }

        // Validate all values are in reasonable range (0-1 for probabilities)
        if (c.open < 0 || c.open > 1 || c.high < 0 || c.high > 1 ||
          c.low < 0 || c.low > 1 || c.close < 0 || c.close > 1) {
          console.warn("Candle values out of range (0-1):", c);
          return null;
        }

        // Ensure high >= low
        const actualHigh = Math.max(c.open, c.close, c.high, c.low);
        const actualLow = Math.min(c.open, c.close, c.high, c.low);

        return {
          timestamp: c.time * 1000,
          open: c.open,
          high: actualHigh,
          low: actualLow,
          close: c.close,
        };
      })
      .filter((c): c is KLineData => c !== null && c.close > 0.0001); // Filter out 0 or extremely small values that break log scale or rendering
  };

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Dispose existing chart if any to prevent duplicates
    if (chartRef.current) {
      dispose(containerRef.current);
    }
    // Double check: Clear container content to ensure no duplicate canvases
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const chart = init(containerRef.current);
    chartRef.current = chart;

    chart?.setStyles({
      grid: {
        horizontal: { color: "#F3F4F6", show: false },
        vertical: { color: "#F3F4F6", show: false }
      },
      candle: {
        type: chartType as any,
        tooltip: {
          custom: (data: any) => {
            if (!data?.current) return [];
            const price = data.current.close;
            return [
              { title: "Price", value: `${(price * 100).toFixed(1)}%` },
              { title: "Date", value: new Date(data.current.timestamp).toLocaleTimeString() }
            ];
          }
        },
        area: {
          lineColor: '#2563eb',
          backgroundColor: [{ offset: 0, color: 'rgba(37, 99, 235, 0.5)' }, { offset: 1, color: 'rgba(37, 99, 235, 0.01)' }]
        }
      }
    });

    // Apply data immediately if available
    if (candles.length > 0) {
      const formatted = processData(candles);
      chart?.applyNewData(formatted);
    }

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        chart?.resize();
      });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      dispose(containerRef.current!);
      chartRef.current = null;
    };
  }, [chartType]); // Re-run on chartType change

  // Update Data - use updateData for real-time updates
  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return;

    const formatted = processData(candles);

    // For initial load or when candles array is replaced, use applyNewData
    // For real-time updates (new candle appended), use updateData
    if (formatted.length === 1) {
      chartRef.current.updateData(formatted[0]);
    } else {
      chartRef.current.applyNewData(formatted);
    }
  }, [candles]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price History</h3>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setChartType("candle_solid")}
            className={`p-1.5 rounded-md transition-all ${chartType === "candle_solid"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            title="Candlestick View"
          >
            <BarChart2 size={16} />
          </button>
          <button
            onClick={() => setChartType("area")}
            className={`p-1.5 rounded-md transition-all ${chartType === "area"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            title="Line View"
          >
            <LineChart size={16} />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="w-full flex-1" />
    </div>
  );
}