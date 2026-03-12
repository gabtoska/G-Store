import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { Newsletter } from "@/components/home/newsletter";
import { StorySection } from "@/components/home/story-section";
import { TestimonialStrip } from "@/components/home/testimonial-strip";
import { featuredProducts, PRODUCTS } from "@/lib/products";

export default function HomePage() {
  return (
    <>
      <Hero spotlight={PRODUCTS[0]} />
      <CategoryShowcase />
      <FeaturedProducts products={featuredProducts.slice(0, 6)} />
      <StorySection />
      <TestimonialStrip />
      <FeaturedProducts products={PRODUCTS.slice(6, 9)} />
      <Newsletter />
    </>
  );
}
