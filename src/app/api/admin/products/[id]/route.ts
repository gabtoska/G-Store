import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { productUpdateSchema } from "@/lib/validation";
import { AppError } from "@/lib/errors";
import { requireAdmin } from "@/server/authorization";
import { errorResponse, readJson } from "@/server/http";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { product, version } = await readJson(request, productUpdateSchema);
    if (!(await db.category.findUnique({ where: { id: product.categoryId } })))
      throw new AppError(400, "Choose an existing category.");
    const updated = await db.product.updateMany({
      where: { id, version },
      data: {
        ...product,
        image: product.gallery[0],
        version: { increment: 1 },
      },
    });
    if (updated.count !== 1)
      throw new AppError(
        409,
        "Product or stock changed elsewhere. Reload before saving.",
      );
    return NextResponse.json({ id });
  } catch (error) {
    return errorResponse(error);
  }
}
