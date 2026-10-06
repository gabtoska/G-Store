"use client";

import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatMoney } from "@/lib/format";
import { availableForLine } from "@/lib/cart";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const { state, dispatch, subtotalCents, totalCents, itemCount } = useCart();

  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], [tabindex="0"]',
        ) ?? [],
      );
    focusable()[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  return (
    <>
      <button
        tabIndex={open ? 0 : -1}
        type="button"
        aria-label="Close cart overlay"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/45 transition duration-300",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal={open}
        inert={!open}
        aria-hidden={!open}
        aria-label="Shopping cart"
        className={cn(
          "fixed right-0 top-0 z-50 h-dvh w-full max-w-md border-l border-black/10 bg-cloud p-5 shadow-2xl transition-transform duration-500",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-ink/55">
              Your edit
            </p>
            <h2 className="font-display text-3xl text-ink">
              Cart ({itemCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 transition hover:bg-white"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {state.lines.length === 0 ? (
          <div className="mt-14 space-y-5 rounded-3xl border border-dashed border-black/15 bg-white/70 p-8 text-center">
            <p className="font-display text-2xl text-ink">
              Your cart is empty.
            </p>
            <p className="text-sm text-ink/65">
              Curate your fit with premium pieces from the latest drop.
            </p>
            <Link
              href="/shop"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.13em] text-cloud shadow-float transition hover:-translate-y-0.5 hover:bg-black"
            >
              Explore The Shop
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 max-h-[calc(100dvh-300px)] space-y-4 overflow-y-auto pb-6">
              {state.lines.map((line) => (
                <article
                  key={line.id}
                  className="rounded-3xl border border-black/10 bg-white/85 p-3"
                >
                  <div className="flex gap-3">
                    <div className="relative h-24 w-20 overflow-hidden rounded-2xl">
                      <ProductImage
                        src={line.image}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {line.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.14em] text-ink/60">
                        {line.color} / {line.size}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <QuantityStepper
                          max={availableForLine(state.lines, line)}
                          value={line.quantity}
                          onChange={(quantity) =>
                            dispatch({
                              type: "setQuantity",
                              payload: { lineId: line.id, quantity },
                            })
                          }
                        />
                        <p className="text-sm font-semibold text-ink">
                          {formatMoney(line.priceCents * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-coral"
                    onClick={() =>
                      dispatch({ type: "remove", payload: { lineId: line.id } })
                    }
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-black/10 bg-white/90 p-5">
              <div className="flex items-center justify-between text-sm text-ink/70">
                <span>Subtotal</span>
                <span className="font-semibold text-ink">
                  {formatMoney(subtotalCents)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base">
                <span className="font-semibold text-ink">Estimated Total</span>
                <span className="font-bold text-ink">
                  {formatMoney(totalCents)}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={onClose}>
                  Continue
                </Button>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.13em] text-cloud shadow-float transition hover:-translate-y-0.5 hover:bg-black"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
