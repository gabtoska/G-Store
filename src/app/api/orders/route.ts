import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validation";
import { requireUser } from "@/server/authorization";
import { errorResponse, readJson } from "@/server/http";
import { createOrder } from "@/server/orders";
import { rateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = await readJson(request, checkoutSchema);
    await rateLimit("checkout", user.id, 30, 15 * 60 * 1000);
    const order = await createOrder(db, user.id, input);
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
