"use client";

import Link from "next/link";
import { useMarkets } from "@/hooks/useMarkets";

interface Market {
  id: number;
  title: string;
  description: string;
}

export default function MarketList() {
  const { markets, loading } = useMarkets();

  if (loading) {
    return <p className="text-muted-foreground">Loading markets…</p>;
  }

  if (!markets.length) {
    return <p className="text-muted-foreground">No markets yet.</p>;
  }

  return (
    <div className="space-y-4">
      {markets.map((m: Market) => (
        <Link
          key={m.id}
          href={`/market/${m.id}`}
          className="block border border-border rounded-lg p-4 hover:bg-muted transition"
        >
          <h3 className="font-medium text-lg">{m.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {m.description}
          </p>
        </Link>
      ))}
    </div>
  );
}