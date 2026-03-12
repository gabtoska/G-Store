"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/shop/product-card";
import { categories, collections } from "@/lib/products";
import { Product } from "@/lib/types";

type SortMode = "featured" | "price-asc" | "price-desc" | "rating";

interface ShopCatalogProps {
  products: Product[];
  initialCategory?: string;
  initialCollection?: string;
  initialSearch?: string;
}

export function ShopCatalog({
  products,
  initialCategory = "All",
  initialCollection = "All",
  initialSearch = ""
}: ShopCatalogProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [sort, setSort] = useState<SortMode>("featured");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = products.filter((product) => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const collectionMatch = selectedCollection === "All" || product.collection === selectedCollection;
      const searchMatch =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.tagline.toLowerCase().includes(query) ||
        product.materials.some((material) => material.toLowerCase().includes(query));

      return categoryMatch && collectionMatch && searchMatch;
    });

    switch (sort) {
      case "price-asc":
        return [...result].sort((a, b) => a.priceCents - b.priceCents);
      case "price-desc":
        return [...result].sort((a, b) => b.priceCents - a.priceCents);
      case "rating":
        return [...result].sort((a, b) => b.rating - a.rating);
      default:
        return [...result].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
  }, [products, search, selectedCategory, selectedCollection, sort]);

  return (
    <section className="space-y-8">
      <div className="grid gap-4 rounded-[28px] border border-black/10 bg-white/85 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative block lg:col-span-2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-11 w-full rounded-full border border-black/10 bg-cloud pl-11 pr-4 text-sm text-ink outline-none transition focus:border-accent"
            placeholder="Search products, textures, silhouettes..."
          />
        </label>
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="h-11 rounded-full border border-black/10 bg-cloud px-4 text-sm text-ink outline-none transition focus:border-accent"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={selectedCollection}
          onChange={(event) => setSelectedCollection(event.target.value)}
          className="h-11 rounded-full border border-black/10 bg-cloud px-4 text-sm text-ink outline-none transition focus:border-accent"
        >
          {collections.map((collection) => (
            <option key={collection} value={collection}>
              {collection}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortMode)}
          className="h-11 rounded-full border border-black/10 bg-cloud px-4 text-sm text-ink outline-none transition focus:border-accent sm:col-span-2 lg:col-span-4"
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Sort: Price Low To High</option>
          <option value="price-desc">Sort: Price High To Low</option>
          <option value="rating">Sort: Best Rated</option>
        </select>
      </div>

      <p className="text-xs uppercase tracking-[0.14em] text-ink/55">{filtered.length} pieces available</p>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/20 bg-white/70 px-8 py-14 text-center">
          <h3 className="font-display text-3xl text-ink">No products matched.</h3>
          <p className="mt-3 text-sm text-ink/65">Try a different keyword, category, or collection filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
