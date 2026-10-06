"use client";

import { ProductImage } from "@/components/ui/product-image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { formatMoney } from "@/lib/format";
import { CartLine } from "@/lib/types";

interface CartLineItemProps {
  line: CartLine;
  maxQuantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLineItem({
  line,
  maxQuantity,
  onQuantityChange,
  onRemove,
}: CartLineItemProps) {
  return (
    <article className="grid grid-cols-[96px_1fr] gap-4 rounded-3xl border border-black/10 bg-white/80 p-4 backdrop-blur">
      <div className="relative h-28 overflow-hidden rounded-2xl">
        <ProductImage
          src={line.image}
          alt={line.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href={`/shop/${line.slug}`}
              className="font-display text-lg text-ink transition hover:text-accent"
            >
              {line.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/65">
              {line.color} / {line.size}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink/55 transition hover:bg-black/5 hover:text-coral"
            onClick={onRemove}
            aria-label="Remove line item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            max={maxQuantity}
            value={line.quantity}
            onChange={onQuantityChange}
          />
          <p className="text-sm font-semibold text-ink">
            {formatMoney(line.priceCents * line.quantity)}
          </p>
        </div>
      </div>
    </article>
  );
}
