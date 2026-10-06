import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { MembersClub } from "@/components/home/members-club";
import { StorySection } from "@/components/home/story-section";
import { StoreNotes } from "@/components/home/testimonial-strip";
import { listProducts, getCatalogFilters } from "@/server/catalog";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ items: products }, { categories }] = await Promise.all([
    listProducts({ limit: 9 }),
    getCatalogFilters(),
  ]);
  return (
    <>
      <Hero spotlight={products[0]} />
      <CategoryShowcase categories={categories} />
      <FeaturedProducts products={products.slice(0, 6)} />
      <StorySection />
      <StoreNotes />
      <FeaturedProducts products={products.slice(6, 9)} />
      <MembersClub />
    </>
  );
}
