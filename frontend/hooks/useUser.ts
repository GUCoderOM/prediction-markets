"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useClientAuth } from "./useClientAuth";
import { useEffect } from "react";

export function useUser() {
  const { token, ready } = useClientAuth();
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ["me"],
    enabled: ready && !!token, // 🔥 wait for both
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
    retry: false,
    staleTime: 0,
  });

  // Listen for balance updates via WebSocket
  useEffect(() => {
    if (!q.data?.id) return;

    const ws = new WebSocket("ws://localhost:8081");

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "balance_update" && msg.userId === q.data.id) {
          // Update user balance in cache
          queryClient.setQueryData(["me"], (old: any) => ({
            ...old,
            balance: msg.balance
          }));
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [q.data?.id, queryClient]);

  return {
    user: q.error ? null : q.data,
    loading: !ready || q.isLoading,
  };
}