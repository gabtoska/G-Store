import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/ui/container";
import { Product } from "@/lib/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-10 sm:py-14">
      <Container className="space-y-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Selected products
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
              Shop the current edit.
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 border-b border-ink pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink sm:inline-flex"
          >
            Shop all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white/70 px-7 text-sm font-semibold uppercase tracking-[0.13em] text-ink transition hover:border-ink"
          >
            View all products
          </Link>
        </div>
      </Container>
    </section>
  );
}
