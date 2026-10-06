import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AppError } from "@/lib/errors";

export function errorResponse(error: unknown) {
  if (error instanceof AppError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof z.ZodError)
    return NextResponse.json(
      {
        error: error.issues[0]?.message ?? "Invalid input.",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return NextResponse.json(
      { error: "That value is already in use. Please use a different one." },
      { status: 409 },
    );
  }
  console.error(
    "Request failed",
    error instanceof Error ? error.name : "Unknown error",
  );
  return NextResponse.json(
    { error: "We could not complete the request. Please try again." },
    { status: 500 },
  );
}
export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<T> {
  const configuredOrigin = new URL(
    process.env.AUTH_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "http://localhost:3000",
  ).origin;
  if (request.headers.get("origin") !== configuredOrigin)
    throw new AppError(403, "Request origin is not allowed.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AppError(415, "Send application/json.");
  const reader = request.body?.getReader();
  if (!reader) throw new AppError(400, "Request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 32768) {
      await reader.cancel();
      throw new AppError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  let input: unknown;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AppError(400, "Invalid JSON.");
  }
  return schema.parse(input);
}
