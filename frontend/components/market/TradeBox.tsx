"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function TradeBox({
  marketId,
  outcome,
}: {
  marketId: number;
  outcome: "yes" | "no";
}) {
  const queryClient = useQueryClient();
  const [shares, setShares] = useState("1");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function buy() {
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post(`/trade/${marketId}/${outcome}`, {
        shares: Number(shares),
      });

      setMessage(
        `${outcome.toUpperCase()} bought for ${res.data.cost.toFixed(2)} credits`
      );

      queryClient.invalidateQueries({ queryKey: ["market", marketId] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Error buying shares");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-card">
      <h3 className="font-semibold">Buy {outcome.toUpperCase()}</h3>

      <Input
        type="number"
        min={1}
        value={shares}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setShares(e.target.value)
        }
      />

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <Button onClick={buy} disabled={loading} className="w-full">
        {loading ? "Processing..." : `Buy ${outcome.toUpperCase()}`}
      </Button>
    </div>
  );
}