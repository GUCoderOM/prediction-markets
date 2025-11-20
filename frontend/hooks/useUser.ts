"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useClientAuth } from "./useClientAuth";

export function useUser() {
  const { token, ready } = useClientAuth();

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

  return {
    user: q.error ? null : q.data,
    loading: !ready || q.isLoading,
  };
}