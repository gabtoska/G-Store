import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { AppError } from "@/lib/errors";
import { requireAdmin } from "@/server/authorization";
import { errorResponse, readJson } from "@/server/http";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = await readJson(request, productSchema);
    if (!(await db.category.findUnique({ where: { id: input.categoryId } })))
      throw new AppError(400, "Choose an existing category.");
    const product = await db.product.create({
      data: { ...input, image: input.gallery[0] },
    });
    return NextResponse.json({ id: product.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
