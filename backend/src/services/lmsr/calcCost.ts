export const calculateCost = (
  yesShares: number,
  noShares: number,
  buyAmount: number,
  outcome: "yes" | "no",
  B: number
) => {
  const prev = B * Math.log(Math.exp(yesShares / B) + Math.exp(noShares / B));

  let newYes = yesShares;
  let newNo = noShares;

  if (outcome === "yes") newYes += buyAmount;
  else newNo += buyAmount;

  const next = B * Math.log(Math.exp(newYes / B) + Math.exp(newNo / B));

  return next - prev;
};