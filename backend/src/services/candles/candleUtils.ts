// backend/src/services/candles/candleUtils.ts

export function computeCandleFromSnapshots(snaps: any[]) {
  const open = snaps[0].priceYes;
  const close = snaps[snaps.length - 1].priceYes;
  const high = Math.max(...snaps.map(s => s.priceYes));
  const low = Math.min(...snaps.map(s => s.priceYes));

  return { open, high, low, close };
}