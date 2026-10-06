"use client";

import Link from "next/link";

import { CartLineItem } from "@/components/cart/cart-line-item";
import { CartSummary } from "@/components/cart/cart-summary";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { availableForLine } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";

export default function CartPage() {
  const {
    state,
    dispatch,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    isHydrated,
  } = useCart();

  if (!isHydrated)
    return (
      <Container className="py-16">
        <p role="status">Loading your saved cart?</p>
      </Container>
    );
  return (
    <div className="py-12 sm:py-16">
      <Container className="space-y-9">
        <SectionHeading
          eyebrow="Cart"
          title="Refine your look before checkout."
          subtitle="Adjust quantities before checkout. Current prices and stock are confirmed during order review."
        />
        {state.lines.length === 0 ? (
          <div className="rounded-[30px] border border-dashed border-black/20 bg-white/75 px-8 py-14 text-center">
            <h2 className="font-display text-4xl text-ink">
              Your cart is currently empty.
            </h2>
            <p className="mt-4 text-sm text-ink/65">
              Explore new arrivals and build your G Store wardrobe.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-xs font-semibold uppercase tracking-[0.14em] text-cloud transition hover:-translate-y-0.5 hover:bg-black"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-4">
              {state.lines.map((line) => (
                <CartLineItem
                  key={line.id}
                  line={line}
                  maxQuantity={availableForLine(state.lines, line)}
                  onQuantityChange={(quantity) =>
                    dispatch({
                      type: "setQuantity",
                      payload: {
                        lineId: line.id,
                        quantity,
                      },
                    })
                  }
                  onRemove={() =>
                    dispatch({
                      type: "remove",
                      payload: { lineId: line.id },
                    })
                  }
                />
              ))}
            </div>
            <CartSummary
              subtotalCents={subtotalCents}
              shippingCents={shippingCents}
              taxCents={taxCents}
              totalCents={totalCents}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
