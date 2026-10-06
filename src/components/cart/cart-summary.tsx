import Link from "next/link";

import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CartSummaryProps {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  checkoutHref?: string;
}

export function CartSummary({
  subtotalCents,
  shippingCents,
  taxCents,
  totalCents,
  checkoutHref = "/checkout",
}: CartSummaryProps) {
  return (
    <aside className="rounded-3xl border border-black/10 bg-white/85 p-6 shadow-float backdrop-blur">
      <h2 className="font-display text-2xl text-ink">Summary</h2>
      <div className="mt-6 space-y-4 text-sm text-ink/70">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-ink">
            {formatMoney(subtotalCents)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span className="font-semibold text-ink">
            {shippingCents === 0 ? "Free" : formatMoney(shippingCents)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Demo tax (8%)</span>
          <span className="font-semibold text-ink">
            {formatMoney(taxCents)}
          </span>
        </div>
        <div className="h-px bg-black/10" />
        <div className="flex items-center justify-between text-base">
          <span className="font-semibold text-ink">Estimated total</span>
          <span className="font-bold text-ink">{formatMoney(totalCents)}</span>
        </div>
      </div>
      <Link
        href={checkoutHref}
        className={cn(
          "mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-7 text-sm font-semibold uppercase tracking-[0.13em] text-cloud shadow-float transition",
          "hover:-translate-y-0.5 hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        Proceed To Checkout
      </Link>
    </aside>
  );
}
