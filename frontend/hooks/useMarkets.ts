"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useMarkets() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await api.get("/market");
      console.log("Fetched markets:", res.data);
      // ensure backend always returns an array
      return Array.isArray(res.data) ? res.data : [];
    },
    retry: false,
  });

  return {
    markets: Array.isArray(data) ? data : [],
    loading: isLoading,
    error,
  };
}