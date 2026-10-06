import { createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export async function rateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowMs: number,
) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required.");
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const digest = createHmac("sha256", secret).update(identity).digest("hex");
  const key = `${scope}:${digest}:${bucket}`;
  const row = await db.rateLimit.upsert({
    where: { key },
    create: { key, expiresAt: new Date((bucket + 1) * windowMs) },
    update: { hits: { increment: 1 } },
  });
  // Bound retention without keeping email addresses or network identifiers.
  await db.rateLimit.deleteMany({
    where: { expiresAt: { lt: new Date(now - 86400000) } },
  });
  if (row.hits > limit)
    throw new AppError(429, "Too many attempts. Please try again later.");
}
