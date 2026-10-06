export const MAX_PRODUCT_QUANTITY = 12;

// Demo USD policy, deliberately shared by estimates and authoritative checkout.
export function calculateTotals(
  lines: { priceCents: number; quantity: number }[],
) {
  const subtotalCents = lines.reduce((sum, line) => {
    if (
      !Number.isSafeInteger(line.priceCents) ||
      line.priceCents < 0 ||
      !Number.isSafeInteger(line.quantity) ||
      line.quantity < 1
    ) {
      throw new Error(
        "Prices and quantities must be non-negative integer cents and positive integers.",
      );
    }
    return sum + line.priceCents * line.quantity;
  }, 0);
  if (!Number.isSafeInteger(subtotalCents))
    throw new Error("Total exceeds supported range.");
  const shippingCents = subtotalCents === 0 || subtotalCents > 25000 ? 0 : 1200;
  const taxCents = Math.round(subtotalCents * 0.08);
  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
  };
}
