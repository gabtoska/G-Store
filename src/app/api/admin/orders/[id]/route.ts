import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { statusSchema } from "@/lib/validation";
import { requireAdmin } from "@/server/authorization";
import { errorResponse, readJson } from "@/server/http";
import { updateOrderStatus } from "@/server/orders";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const input = await readJson(request, statusSchema);
    return NextResponse.json(
      await updateOrderStatus(db, (await params).id, input),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
