import Link from "next/link";

import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Product } from "@/lib/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Featured Drop"
          title="Premium pieces stealing the spotlight."
          subtitle="Curated by our style editors for impact, confidence, and all-day versatility."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white/70 px-7 text-sm font-semibold uppercase tracking-[0.13em] text-ink transition hover:border-ink"
          >
            View Full Collection
          </Link>
        </div>
      </Container>
    </section>
  );
}
