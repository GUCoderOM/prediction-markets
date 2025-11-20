"use client";

import { api } from "@/lib/api";

export type TradePayload = {
  marketId: number;
  shares: number;
};

export async function buyYes(payload: TradePayload) {
  const { marketId, shares } = payload;

  const res = await api.post(`/trade/${marketId}/yes`, {
    shares,
  });

  return res.data;
}

export async function buyNo(payload: TradePayload) {
  const { marketId, shares } = payload;

  const res = await api.post(`/trade/${marketId}/no`, {
    shares,
  });

  return res.data;
}