"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMarket(marketId: number | null) {
  const [tokenReady, setTokenReady] = useState(false);
  const [wsClient, setWsClient] = useState<WebSocket | null>(null);

  const queryClient = useQueryClient();

  // Ready when browser is available
  useEffect(() => {
    if (typeof window !== "undefined") {
      setTokenReady(true);
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["market", marketId],
    queryFn: async () => {
      const res = await api.get(`/market/${marketId}`);
      const raw = res.data;

      // Market object (depending on format)
      const market = raw.market ?? raw;

      // Normalize into {yes, no} history array
      let history: { yes: number; no: number }[] = [];

      if (Array.isArray(raw.history)) {
        // Format A: backend returned simple array of YES prices
        history = raw.history.map((yes: number) => ({
          yes,
          no: 1 - yes,
        }));
      } else if (Array.isArray(market.priceHistory)) {
        // Format B: backend returned snapshots
        history = market.priceHistory.map((snap: any) => ({
          yes: snap.priceYes,
          no: snap.priceNo,
        }));
      }

      return { market, history };
    },
    enabled: tokenReady && typeof marketId === "number",
    retry: false,
  });

  // ----------------------------------------
  // WEBSOCKET REAL-TIME MARKET UPDATE
  // ----------------------------------------
  useEffect(() => {
    if (!tokenReady || !marketId) return;

    const ws = new WebSocket("ws://localhost:8081");

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "subscribe", marketId }));
    };

    ws.onmessage = (msg) => {
      try {
        const event = JSON.parse(msg.data);

        if (event.type === "market_update" && event.marketId === marketId) {
          queryClient.setQueryData(["market", marketId], (prev: any) => {
            if (!prev) return prev;

            const updatedHistory = [
              ...prev.history,
              {
                yes: event.historyPoint.yes,
                no: event.historyPoint.no,
              },
            ];

            return {
              ...prev,
              market: {
                ...prev.market,
                yesShares: event.yesShares,
                noShares: event.noShares,
                priceYes: event.priceYes,
                priceNo: event.priceNo,
              },
              history: updatedHistory,
            };
          });
        }
      } catch (e) {
        console.error("WebSocket error:", e);
      }
    };

    ws.onclose = () => {
      console.log("WS Disconnected");
    };

    setWsClient(ws);

    return () => {
      ws.close();
    };
  }, [tokenReady, marketId, queryClient]);

  return {
    market: data?.market || null,
    history: data?.history || [],
    loading: isLoading || !tokenReady || marketId === null,
  };
}