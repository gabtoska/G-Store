import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { listProducts, getCatalogFilters } from "@/server/catalog";
export const dynamic = "force-dynamic";

const homepageProductSlugs = [
  "monaco-knit-polo",
  "district-tapered-trouser",
  "atlas-leather-weekender",
];

export default async function HomePage() {
  const [{ items: products }, { categories }] = await Promise.all([
    listProducts({ limit: 12 }),
    getCatalogFilters(),
  ]);
  const selectedProducts = homepageProductSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product) => product !== undefined);
  const remainingProducts = products.filter(
    (product) => !homepageProductSlugs.includes(product.slug),
  );
  const homepageProducts = [...selectedProducts, ...remainingProducts].slice(
    0,
    3,
  );

  return (
    <>
      <Hero products={homepageProducts} />
      <FeaturedProducts products={homepageProducts} />
      <CategoryShowcase categories={categories} products={products} />
    </>
  );
}
