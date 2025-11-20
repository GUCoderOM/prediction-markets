"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function MarketRow({ market }: { market: any }) {
  const yes = market.yesShares;
  const no = market.noShares;
  const total = yes + no || 1;

  const yesPct = Math.round((yes / total) * 100);
  const noPct = 100 - yesPct;

  return (
    <Link href={`/market/${market.id}`}>
      <Card className="p-4 hover:bg-muted transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">{market.title}</span>
            <span className="text-sm text-muted-foreground">
              {market.description}
            </span>
          </div>

          <ArrowRight className="text-muted-foreground" />
        </div>

        <div className="mt-3 h-2 w-full bg-border rounded-full overflow-hidden flex">
          <div className="bg-primary" style={{ width: `${yesPct}%` }} />
          <div className="bg-secondary" style={{ width: `${noPct}%` }} />
        </div>

        <div className="mt-2 text-xs text-muted-foreground flex justify-between">
          <span>YES: {yes}%</span>
          <span>NO: {noPct}%</span>
        </div>
      </Card>
    </Link>
  );
}