import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import type { listProducts, getCatalogFilters } from "@/server/catalog";
import type { z } from "zod";
import type { catalogQuerySchema } from "@/lib/validation";

type Query = z.infer<typeof catalogQuerySchema>;
export function ShopCatalog({
  catalog,
  filters,
  query,
}: {
  catalog: Awaited<ReturnType<typeof listProducts>>;
  filters: Awaited<ReturnType<typeof getCatalogFilters>>;
  query: Query;
}) {
  function pageLink(page: number) {
    return (
      "/shop?" +
      new URLSearchParams({
        q: query.q,
        category: query.category,
        collection: query.collection,
        sort: query.sort,
        page: String(page),
      })
    );
  }
  return (
    <section className="space-y-8">
      <form
        action="/shop"
        className="panel grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="field-label sm:col-span-2">
          Search
          <input
            name="q"
            type="search"
            defaultValue={query.q}
            maxLength={100}
            placeholder="Search products, textures, silhouettes..."
            className="field"
          />
        </label>
        <label className="field-label">
          Category
          <select
            name="category"
            defaultValue={query.category}
            className="field"
          >
            <option>All</option>
            {filters.categories.map((category) => (
              <option key={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Collection
          <select
            name="collection"
            defaultValue={query.collection}
            className="field"
          >
            <option>All</option>
            {filters.collections.map((collection) => (
              <option key={collection}>{collection}</option>
            ))}
          </select>
        </label>
        <label className="field-label sm:col-span-2">
          Sort
          <select name="sort" defaultValue={query.sort} className="field">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="newest">Newest</option>
          </select>
        </label>
        <div className="flex items-end gap-4 sm:col-span-2">
          <button className="action-link" type="submit">
            Apply filters
          </button>
          <Link href="/shop" className="py-3 text-sm underline">
            Reset
          </Link>
        </div>
      </form>
      <p className="text-xs uppercase tracking-wider text-ink/60">
        {catalog.count} pieces found
      </p>
      {catalog.items.length === 0 ? (
        <div className="panel text-center">
          <h2 className="font-display text-3xl">No products matched.</h2>
          <p className="mt-3">
            Try another filter or{" "}
            <Link href="/shop" className="underline">
              browse all products
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {catalog.pages > 1 && (
        <nav
          aria-label="Product pages"
          className="flex items-center justify-center gap-5"
        >
          {query.page > 1 && (
            <Link className="underline" href={pageLink(query.page - 1)}>
              Previous
            </Link>
          )}
          <span>
            Page {query.page} of {catalog.pages}
          </span>
          {query.page < catalog.pages && (
            <Link className="underline" href={pageLink(query.page + 1)}>
              Next
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}
