import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/ui/container";
import { ProductImage } from "@/components/ui/product-image";
import { Product } from "@/lib/types";

const categoryProductSlugs: Record<string, string> = {
  Accessories: "atlas-leather-weekender",
  Bottoms: "district-tapered-trouser",
  Footwear: "vanguard-tech-runner",
  Outerwear: "soho-oversized-blazer",
  Tops: "monaco-knit-polo",
};

const cardLayouts = [
  "sm:col-span-2 lg:col-span-7 lg:h-[520px]",
  "lg:col-span-5 lg:h-[520px]",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

export function CategoryShowcase({
  categories,
  products,
}: {
  categories: {
    id: string;
    name: string;
    description: string;
    productCount: number;
  }[];
  products: Product[];
}) {
  const categoryCards = categories.map((category) => ({
    ...category,
    product:
      products.find(
        (product) => product.slug === categoryProductSlugs[category.name],
      ) ?? products.find((product) => product.category === category.name),
  }));

  return (
    <section className="border-y border-black/10 bg-[#dfe8e1] py-14 sm:py-20">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Shop by category
            </p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              Browse the wardrobe.
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden items-center gap-2 border-b border-ink pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink sm:inline-flex"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {categoryCards.map((category, index) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.name)}`}
              className={`group relative h-[320px] overflow-hidden rounded-[26px] border border-black/10 bg-ink shadow-[0_18px_45px_rgba(21,21,21,0.12)] ${cardLayouts[index] ?? "lg:col-span-4"}`}
            >
              {category.product ? (
                <ProductImage
                  src={category.product.gallery[0]}
                  alt={`${category.name} category`}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-cloud sm:p-7">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.17em] text-cloud/60">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "product" : "products"}
                  </p>
                  <h3 className="mt-1 font-display text-3xl sm:text-4xl">
                    {category.name}
                  </h3>
                </div>
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/15 transition group-hover:bg-cloud group-hover:text-ink">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
