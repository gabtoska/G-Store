import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation";
import { errorResponse, readJson } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";

export async function POST(request: Request) {
  try {
    const input = await readJson(request, registerSchema);
    await rateLimit("register", input.email, 5, 60 * 60 * 1000);
    await db.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      },
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
