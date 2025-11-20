"use client";

type Props = {
  value: string;
  onChange: (tf: string) => void;
};

const TF_OPTIONS = ["5s", "1m", "5m", "15m", "1h"];

export default function TimeframeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 mb-2">
      {TF_OPTIONS.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          className={`px-3 py-1 text-sm rounded border ${
            value === tf
              ? "bg-primary text-white border-primary"
              : "bg-card text-muted-foreground border-border"
          }`}
        >
          {tf}
        </button>
      ))}
    </div>
  );
}