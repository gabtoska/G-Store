import { NextResponse } from "next/server";

import { getProductBySlug } from "@/lib/products";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  const resolvedParams = await params;
  const product = getProductBySlug(resolvedParams.slug);

  if (!product) {
    return NextResponse.json(
      {
        error: "Product not found"
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json(product);
}
