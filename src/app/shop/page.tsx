import { ShopCatalog } from "@/components/shop/shop-catalog";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories, collections, PRODUCTS } from "@/lib/products";

interface ShopPageProps {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

async function resolveSearchParams(searchParams: ShopPageProps["searchParams"]) {
  if (!searchParams) {
    return {};
  }

  const resolved = await searchParams;
  return resolved;
}

function getSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedSearchParams = await resolveSearchParams(searchParams);
  const rawCategory = getSingleValue(resolvedSearchParams.category);
  const rawCollection = getSingleValue(resolvedSearchParams.collection);
  const rawSearch = getSingleValue(resolvedSearchParams.search);

  const initialCategory =
    rawCategory && categories.includes(rawCategory as (typeof categories)[number]) ? rawCategory : "All";
  const initialCollection =
    rawCollection && collections.includes(rawCollection as (typeof collections)[number]) ? rawCollection : "All";

  return (
    <div className="py-12 sm:py-16">
      <Container className="space-y-10">
        <SectionHeading
          eyebrow="Shop"
          title="Curated luxury for bold everyday style."
          subtitle="Explore premium silhouettes and signature essentials designed to elevate your wardrobe."
        />
        <ShopCatalog
          products={PRODUCTS}
          initialCategory={initialCategory}
          initialCollection={initialCollection}
          initialSearch={rawSearch ?? ""}
        />
      </Container>
    </div>
  );
}
