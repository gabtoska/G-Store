"use client";

import { ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { dispatch, state } = useCart();
  const inCart = state.lines
    .filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + line.quantity, 0);
  const unavailable = inCart >= Math.min(product.stock, 12);
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] ?? "Default",
  );
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[0] ?? "One Size",
  );

  return (
    <div className="space-y-7 rounded-[34px] border border-black/10 bg-white/85 p-6 shadow-float sm:p-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {product.isNew ? (
            <Pill className="bg-coral text-cloud">New Season</Pill>
          ) : null}
          <Pill>{product.collection}</Pill>
        </div>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          {product.name}
        </h1>
        <p className="text-sm leading-relaxed text-ink/70">
          {product.description}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-cloud/80 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink/60">
            Price
          </p>
          <p className="font-display text-3xl text-ink">
            {formatMoney(product.priceCents)}
          </p>
          {product.compareAtCents ? (
            <p className="text-xs text-ink/45 line-through">
              {formatMoney(product.compareAtCents)}
            </p>
          ) : null}
        </div>
        <p className="text-sm text-accent">
          {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-ink/60">Color</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              aria-pressed={color === selectedColor}
              onClick={() => setSelectedColor(color)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                color === selectedColor
                  ? "border-accent bg-accent text-cloud"
                  : "border-black/15 bg-cloud/70 text-ink hover:border-black/35",
              )}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-ink/60">Size</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              aria-pressed={size === selectedSize}
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                size === selectedSize
                  ? "border-accent bg-accent text-cloud"
                  : "border-black/15 bg-cloud/70 text-ink hover:border-black/35",
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={unavailable}
          onClick={() =>
            dispatch({
              type: "add",
              payload: {
                product,
                color: selectedColor,
                size: selectedSize,
              },
            })
          }
        >
          <ShoppingBag className="h-4 w-4" />
          {product.stock === 0
            ? "Sold out"
            : unavailable
              ? "Cart limit reached"
              : "Add To Cart"}
        </Button>
        <p aria-live="polite" className="text-center text-sm text-accent">
          {inCart > 0 ? `${inCart} in your cart` : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-black/15 bg-cloud/70 p-4 text-sm text-ink/70">
        <p className="inline-flex items-center gap-2 font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-accent" />
          Your next signature piece
        </p>
        <p className="mt-2">
          Choose your size and color. Your cart is saved on this device; current
          prices and stock are checked at checkout.
        </p>
      </div>
    </div>
  );
}
