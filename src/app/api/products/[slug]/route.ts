import { errorResponse } from "@/server/http";
import { NextResponse } from "next/server";

import { getProductBySlug } from "@/server/catalog";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_: Request, { params }: RouteContext) {
  try {
    const resolvedParams = await params;
    const product = await getProductBySlug(resolvedParams.slug);

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    return errorResponse(error);
  }
}
