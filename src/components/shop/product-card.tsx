"use client";

import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

import { Pill } from "@/components/ui/pill";
import { formatMoney } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { dispatch, state } = useCart();
  const inCart = state.lines
    .filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + line.quantity, 0);
  const unavailable = inCart >= Math.min(product.stock, 12);
  const defaultOptions = useMemo(
    () => ({
      color: product.colors[0] ?? "Default",
      size: product.sizes[0] ?? "One Size",
    }),
    [product.colors, product.sizes],
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white/85 shadow-[0_10px_45px_rgba(10,10,10,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-float">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block h-72 overflow-hidden"
      >
        <ProductImage
          src={product.gallery[0]}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.isNew ? (
            <Pill className="bg-coral text-cloud">New</Pill>
          ) : null}
          <Pill className="bg-white/90 text-ink">{product.collection}</Pill>
        </div>
      </Link>
      <div className="flex min-h-[278px] flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink/55">
              {product.category}
            </p>
            <Link
              href={`/shop/${product.slug}`}
              className="mt-1 block min-h-[3.25rem] font-display text-xl leading-[1.3] text-ink transition hover:text-accent sm:text-[1.35rem]"
            >
              {product.name}
            </Link>
            <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-ink/70">
              {product.tagline}
            </p>
          </div>
          <Link
            href={`/shop/${product.slug}`}
            className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition hover:border-accent hover:text-accent"
            aria-label={`View ${product.name}`}
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-auto pt-4">
          <div className="flex min-h-[3rem] items-start justify-between">
            <div>
              <p className="text-lg font-bold text-ink">
                {formatMoney(product.priceCents)}
              </p>
              {product.compareAtCents ? (
                <p className="mt-1 text-xs text-ink/45 line-through">
                  {formatMoney(product.compareAtCents)}
                </p>
              ) : null}
            </div>
            <p className="pt-1 text-sm text-accent">
              {product.stock > 0 ? `${product.stock} in stock` : "Sold out"}
            </p>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-xs font-semibold uppercase tracking-[0.13em] text-cloud transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            disabled={unavailable}
            onClick={() =>
              dispatch({
                type: "add",
                payload: {
                  product,
                  color: defaultOptions.color,
                  size: defaultOptions.size,
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
          </button>
          <p
            aria-live="polite"
            className="mt-3 min-h-4 text-center text-xs text-ink/60"
          >
            {inCart
              ? `${inCart} in your cart`
              : `Quick add: ${defaultOptions.color} / ${defaultOptions.size}`}
          </p>
        </div>
      </div>
    </article>
  );
}
