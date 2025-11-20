"use client";

export default function Sparkline({
  history,
}: {
  history?: { yes: number; no: number }[];
}) {
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="h-12 flex items-center text-xs text-muted-foreground">
        No price data yet
      </div>
    );
  }

  // Extract the YES values only (chart is for YES)
  const points = history.map((h) => h.yes);

  const max = Math.max(...points);
  const min = Math.min(...points);
  const height = 40;

  const normalized = points.map((v, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = height - ((v - min) / (max - min || 1)) * height;
    return { x, y };
  });

  const path = normalized
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`)
    .join(" ");

  return (
    <div className="w-full h-20">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="sparklineGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--primary)" />
          </linearGradient>
        </defs>

        <path
          d={path}
          stroke="url(#sparklineGradient)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Last point */}
        <circle
          cx={normalized[normalized.length - 1].x}
          cy={normalized[normalized.length - 1].y}
          r="1.8"
          fill="var(--primary)"
        />
      </svg>
    </div>
  );
}