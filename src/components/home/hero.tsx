import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { ProductImage } from "@/components/ui/product-image";
import { formatMoney } from "@/lib/format";
import { Product } from "@/lib/types";

export function Hero({ products }: { products: Product[] }) {
  const spotlight = products[0];

  return (
    <section className="py-6 sm:py-10">
      <Container>
        <div className="grid overflow-hidden rounded-[30px] border border-black/10 bg-[#eee5da] shadow-[0_20px_60px_rgba(21,21,21,0.1)] lg:grid-cols-[0.88fr_1.12fr]">
          <div className="flex min-h-[480px] flex-col justify-center p-7 sm:p-10 lg:min-h-[590px] lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Current edit
            </p>
            <h1 className="mt-5 max-w-lg font-display text-5xl leading-[0.95] text-ink sm:text-6xl lg:text-7xl">
              Shop the catalog.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink/65 sm:text-base">
              Browse clothing, footwear, and accessories. Choose a color and
              size, then add the product to your cart.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-xs font-semibold uppercase tracking-[0.14em] text-cloud transition hover:-translate-y-0.5 hover:bg-black"
              >
                Shop all products
                <ArrowRight className="h-4 w-4" />
              </Link>
              {spotlight ? (
                <Link
                  href={`/shop/${spotlight.slug}`}
                  className="inline-flex h-12 items-center rounded-full border border-black/20 px-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink"
                >
                  View featured item
                </Link>
              ) : null}
            </div>
          </div>

          {spotlight ? (
            <Link
              href={`/shop/${spotlight.slug}`}
              className="group relative min-h-[440px] overflow-hidden lg:min-h-[590px]"
            >
              <ProductImage
                src={spotlight.gallery[0]}
                alt={spotlight.name}
                fill
                priority
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 56vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 text-cloud sm:p-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.17em] text-cloud/65">
                    {spotlight.category} / {spotlight.collection}
                  </p>
                  <h2 className="mt-1 font-display text-3xl sm:text-4xl">
                    {spotlight.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold">
                    {formatMoney(spotlight.priceCents)}
                  </p>
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/15 transition group-hover:bg-cloud group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
