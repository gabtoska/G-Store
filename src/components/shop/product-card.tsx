"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { Pill } from "@/components/ui/pill";
import { RatingStars } from "@/components/ui/rating-stars";
import { formatMoney, ratingLabel } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const defaultOptions = useMemo(
    () => ({
      color: product.colors[0] ?? "Default",
      size: product.sizes[0] ?? "One Size"
    }),
    [product.colors, product.sizes]
  );

  return (
    <article className="group overflow-hidden rounded-[28px] border border-black/10 bg-white/85 shadow-[0_10px_45px_rgba(10,10,10,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <Link href={`/shop/${product.slug}`} className="relative block h-72 overflow-hidden">
        <Image
          src={product.gallery[0]}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isNew ? <Pill className="bg-coral text-cloud">New</Pill> : null}
          <Pill className="bg-white/90 text-ink">{product.collection}</Pill>
        </div>
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink/55">{product.category}</p>
            <Link
              href={`/shop/${product.slug}`}
              className="mt-1 block font-display text-2xl leading-tight text-ink transition hover:text-accent"
            >
              {product.name}
            </Link>
            <p className="mt-2 text-sm text-ink/70">{product.tagline}</p>
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition hover:border-accent hover:text-accent"
            aria-label={`View ${product.name}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-lg font-bold text-ink">{formatMoney(product.priceCents)}</p>
            {product.compareAtCents ? (
              <p className="text-xs text-ink/45 line-through">{formatMoney(product.compareAtCents)}</p>
            ) : null}
          </div>
          <div className="text-right">
            <RatingStars rating={product.rating} />
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-ink/60">
              {ratingLabel(product.rating)} ({product.reviewCount})
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold uppercase tracking-[0.12em] text-cloud transition hover:-translate-y-0.5 hover:bg-black"
          onClick={() =>
            dispatch({
              type: "add",
              payload: {
                product,
                color: defaultOptions.color,
                size: defaultOptions.size
              }
            })
          }
        >
          <ShoppingBag className="h-4 w-4" />
          Add To Cart
        </button>
      </div>
    </article>
  );
}
