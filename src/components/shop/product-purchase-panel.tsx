"use client";

import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatMoney, ratingLabel } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "Default");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "One Size");

  return (
    <div className="space-y-7 rounded-[34px] border border-black/10 bg-white/85 p-6 shadow-float sm:p-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {product.isNew ? <Pill className="bg-coral text-cloud">New Season</Pill> : null}
          <Pill>{product.collection}</Pill>
        </div>
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{product.name}</h1>
        <p className="text-sm leading-relaxed text-ink/70">{product.description}</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-cloud/80 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink/60">Price</p>
          <p className="font-display text-3xl text-ink">{formatMoney(product.priceCents)}</p>
          {product.compareAtCents ? (
            <p className="text-xs text-ink/45 line-through">{formatMoney(product.compareAtCents)}</p>
          ) : null}
        </div>
        <div className="text-right">
          <RatingStars rating={product.rating} />
          <p className="mt-1 text-xs text-ink/65">
            {ratingLabel(product.rating)} from {product.reviewCount} reviews
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.14em] text-ink/60">Color</p>
        <div className="flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={cn(
                "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                color === selectedColor
                  ? "border-accent bg-accent text-cloud"
                  : "border-black/15 bg-cloud/70 text-ink hover:border-black/35"
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
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition",
                size === selectedSize
                  ? "border-accent bg-accent text-cloud"
                  : "border-black/15 bg-cloud/70 text-ink hover:border-black/35"
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
          onClick={() =>
            dispatch({
              type: "add",
              payload: {
                product,
                color: selectedColor,
                size: selectedSize
              }
            })
          }
        >
          <ShoppingBag className="h-4 w-4" />
          Add To Cart
        </Button>
        <Button variant="outline" size="lg" className="w-full gap-2">
          <Heart className="h-4 w-4" />
          Save To Wishlist
        </Button>
      </div>

      <div className="rounded-2xl border border-dashed border-black/15 bg-cloud/70 p-4 text-sm text-ink/70">
        <p className="inline-flex items-center gap-2 font-semibold text-ink">
          <Sparkles className="h-4 w-4 text-accent" />
          Fit Concierge
        </p>
        <p className="mt-2">
          Secure checkout, easy returns in 30 days, and complimentary styling support from our G Store team.
        </p>
      </div>
    </div>
  );
}
