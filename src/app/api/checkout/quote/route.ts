import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quoteSchema } from "@/lib/validation";
import { requireUser } from "@/server/authorization";
import { errorResponse, readJson } from "@/server/http";
import { quoteOrder } from "@/server/orders";

export async function POST(request: Request) {
  try {
    await requireUser();
    const input = await readJson(request, quoteSchema);
    return NextResponse.json(await quoteOrder(db, input.items));
  } catch (error) {
    return errorResponse(error);
  }
}
