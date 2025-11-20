// backend/src/services/lmsr/getPrices.ts
export function getPrices(yesShares: number, noShares: number, B: number) {
  const yesExp = Math.exp(yesShares / B);
  const noExp = Math.exp(noShares / B);

  const yes = yesExp / (yesExp + noExp);
  const no = 1 - yes;

  return { yes, no };
}