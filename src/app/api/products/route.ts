import { NextRequest, NextResponse } from "next/server";

import { PRODUCTS } from "@/lib/products";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const collection = searchParams.get("collection");
  const q = searchParams.get("q")?.toLowerCase();
  const limit = Number(searchParams.get("limit") ?? PRODUCTS.length);

  const items = PRODUCTS.filter((product) => {
    const categoryMatch = !category || category === "All" || product.category === category;
    const collectionMatch = !collection || collection === "All" || product.collection === collection;
    const queryMatch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.tagline.toLowerCase().includes(q) ||
      product.materials.some((material) => material.toLowerCase().includes(q));

    return categoryMatch && collectionMatch && queryMatch;
  }).slice(0, Number.isFinite(limit) ? limit : PRODUCTS.length);

  return NextResponse.json({
    count: items.length,
    items
  });
}
