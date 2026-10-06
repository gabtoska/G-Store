import "server-only";
import { Prisma } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";
import { catalogQuerySchema } from "@/lib/validation";
import type { Product } from "@/lib/types";

type ProductRow = Prisma.ProductGetPayload<{ include: { category: true } }>;
export function serializeProduct(row: ProductRow): Product {
  return {
    ...row,
    category: row.category.name,
    compareAtCents: row.compareAtCents ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
export async function listProducts(input: unknown = {}) {
  const query = catalogQuerySchema.parse(input);
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query.category !== "All" ? { category: { name: query.category } } : {}),
    ...(query.collection !== "All" ? { collection: query.collection } : {}),
    ...(query.q
      ? {
          OR: ["name", "tagline", "description"].map((field) => ({
            [field]: { contains: query.q, mode: "insensitive" },
          })),
        }
      : {}),
  };
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "price-asc"
      ? [{ priceCents: "asc" }]
      : query.sort === "price-desc"
        ? [{ priceCents: "desc" }]
        : query.sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ isFeatured: "desc" }, { createdAt: "desc" }];
  const [rows, count] = await db.$transaction([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy: [...orderBy, { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    db.product.count({ where }),
  ]);
  return {
    items: rows.map(serializeProduct),
    count,
    page: query.page,
    pages: Math.max(1, Math.ceil(count / query.limit)),
  };
}
export const getProductBySlug = cache(async (slug: string) => {
  const row = await db.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });
  return row ? serializeProduct(row) : null;
});
export async function getRelatedProducts(product: Product, take = 3) {
  const rows = await db.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: true },
    take,
    orderBy: { isFeatured: "desc" },
  });
  return rows.map(serializeProduct);
}
export async function getCatalogFilters() {
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.product.findMany({
      where: { isActive: true },
      distinct: ["collection"],
      select: { collection: true },
      orderBy: { collection: "asc" },
    }),
  ]);
  return {
    categories,
    collections: collections.map((item) => item.collection),
  };
}
