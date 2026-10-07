import { ShopCatalog } from "@/components/shop/shop-catalog";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCatalogFilters, listProducts } from "@/server/catalog";
import { catalogQuerySchema } from "@/lib/validation";
export const dynamic = "force-dynamic";
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const single = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );
  if (single.search && !single.q) single.q = single.search;
  const parsed = catalogQuerySchema.safeParse(single);
  const query = parsed.success ? parsed.data : catalogQuerySchema.parse({});
  const [catalog, filters] = await Promise.all([
    listProducts(query),
    getCatalogFilters(),
  ]);
  return (
    <Container className="space-y-10 py-12 sm:py-16">
      <SectionHeading
        eyebrow="Demo catalog"
        title="Browse the current product inventory."
        subtitle="Search, filter, and sort products loaded from PostgreSQL. Images and products are sample catalog content."
      />
      {!parsed.success && (
        <p role="status">
          Those filters were invalid. Showing the full collection.
        </p>
      )}
      <ShopCatalog catalog={catalog} filters={filters} query={query} />
    </Container>
  );
}
