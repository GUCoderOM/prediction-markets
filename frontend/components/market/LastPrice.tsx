"use client";

export default function LastPrice({ candles }: { candles: any[] }) {
  if (!candles || candles.length < 2) return null;

  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const diff = last.close - prev.close;
  const pct = ((diff / prev.close) * 100).toFixed(2);

  const color =
    diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="text-right mb-2 text-sm">
      <span className="font-semibold">{(last.close * 100).toFixed(1)}%</span>
      <span className={`ml-2 ${color}`}>
        {diff >= 0 ? "+" : ""}
        {pct}%
      </span>
    </div>
  );
}