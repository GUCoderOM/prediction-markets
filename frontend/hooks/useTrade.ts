import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export type Position = {
  yesShares: number;
  noShares: number;
  avgPriceYes: number;
  avgPriceNo: number;
};

export function useTrade(marketId: string | undefined) {
  const [position, setPosition] = useState<Position>({ yesShares: 0, noShares: 0, avgPriceYes: 0, avgPriceNo: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch initial position
  useEffect(() => {
    if (!marketId) return;

    async function fetchPosition() {
      try {
        const res = await api.get("/auth/me/portfolio");
        const portfolio = res.data;
        const myPos = portfolio.filter((p: any) => p.marketId === Number(marketId));

        const newPos: Position = { yesShares: 0, noShares: 0, avgPriceYes: 0, avgPriceNo: 0 };
        myPos.forEach((p: any) => {
          if (p.outcome === "yes") {
            newPos.yesShares = p.totalShares;
            newPos.avgPriceYes = p.avgPrice;
          } else if (p.outcome === "no") {
            newPos.noShares = p.totalShares;
            newPos.avgPriceNo = p.avgPrice;
          }
        });
        setPosition(newPos);
      } catch (e) {
        console.error("Failed to fetch position", e);
      }
    }

    fetchPosition();
  }, [marketId]);

  const trade = async (type: "yes" | "no", mode: "buy" | "sell", shares: number) => {
    if (!marketId) return;
    if (shares <= 0) {
      toast.error("Shares must be at least 1");
      return;
    }

    setLoading(true);
    const endpoint = mode === "buy"
      ? `/trade/${marketId}/${type}`
      : `/trade/${marketId}/sell/${type}`;

    try {
      await api.post(endpoint, { shares });
      toast.success(`${mode === "buy" ? "Bought" : "Sold"} ${shares} share(s) of ${type.toUpperCase()}`);

      // Optimistic update or re-fetch could happen here. 
      // For simplicity, we update local state based on success.
      setPosition(prev => {
        const isYes = type === "yes";
        const currentShares = isYes ? prev.yesShares : prev.noShares;
        const newShares = mode === "buy" ? currentShares + shares : currentShares - shares;
        return {
          ...prev,
          [isYes ? "yesShares" : "noShares"]: newShares
        };
      });

    } catch (e: any) {
      toast.error(e.response?.data?.message || "Trade failed");
    } finally {
      setLoading(false);
    }
  };

  return { position, trade, loading };
}