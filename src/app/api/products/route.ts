import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/server/catalog";
import { errorResponse } from "@/server/http";
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      await listProducts(Object.fromEntries(request.nextUrl.searchParams)),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
