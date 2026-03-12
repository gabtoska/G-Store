"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export default function CheckoutPage() {
  const { state, subtotalCents, shippingCents, taxCents, totalCents, dispatch } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.lines.length === 0) {
      return;
    }
    setOrderPlaced(true);
    dispatch({ type: "clear" });
  }

  return (
    <div className="py-12 sm:py-16">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Checkout"
          title="Complete your purchase securely."
          subtitle="Enter delivery details and confirm your premium order."
        />

        {orderPlaced ? (
          <div className="rounded-[30px] border border-black/10 bg-white/85 p-10 text-center shadow-float">
            <p className="text-xs uppercase tracking-[0.15em] text-ink/60">Order Confirmed</p>
            <h2 className="mt-2 font-display text-5xl text-ink">Thank you for your order.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
              Your G Store pieces are now in motion. A confirmation email has been sent with tracking updates.
            </p>
            <Link
              href="/shop"
              className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.13em] text-cloud transition hover:-translate-y-0.5 hover:bg-black"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_370px] lg:items-start">
            <form onSubmit={handleSubmit} className="space-y-6 rounded-[30px] border border-black/10 bg-white/85 p-7">
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-ink/60">Contact</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    placeholder="First name"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                  />
                  <input
                    required
                    placeholder="Last name"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent sm:col-span-2"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-ink/60">Shipping</p>
                <div className="mt-3 grid gap-3">
                  <input
                    required
                    placeholder="Street address"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      required
                      placeholder="City"
                      className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent sm:col-span-2"
                    />
                    <input
                      required
                      placeholder="ZIP"
                      className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-ink/60">Payment</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Card number"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent sm:col-span-2"
                  />
                  <input
                    required
                    placeholder="MM / YY"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                  />
                  <input
                    required
                    placeholder="CVC"
                    className="h-11 rounded-xl border border-black/15 bg-cloud/75 px-4 text-sm outline-none transition focus:border-accent"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Place Order
              </Button>
            </form>

            <aside className="space-y-4 rounded-[30px] border border-black/10 bg-white/85 p-6 shadow-float">
              <h2 className="font-display text-3xl text-ink">Order summary</h2>
              {state.lines.length === 0 ? (
                <p className="text-sm text-ink/65">Your cart is empty. Add products before checkout.</p>
              ) : (
                <ul className="space-y-2">
                  {state.lines.map((line) => (
                    <li key={line.id} className="flex items-center justify-between text-sm text-ink/70">
                      <span>
                        {line.name} x{line.quantity}
                      </span>
                      <span className="font-semibold text-ink">{formatMoney(line.priceCents * line.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="h-px bg-black/10" />
              <div className="space-y-2 text-sm text-ink/70">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink">{formatMoney(subtotalCents)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-ink">{shippingCents === 0 ? "Free" : formatMoney(shippingCents)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Tax</span>
                  <span className="font-semibold text-ink">{formatMoney(taxCents)}</span>
                </p>
                <p className="flex justify-between text-base">
                  <span className="font-semibold text-ink">Total</span>
                  <span className="font-bold text-ink">{formatMoney(totalCents)}</span>
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
