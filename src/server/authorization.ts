import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { assertAdmin } from "@/lib/order-rules";

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  // Roles come from the DB on every protected request, never a client claim or stale JWT.
  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new AppError(401, "Please log in to continue.");
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  assertAdmin(user);
  return user;
}
export async function requirePageUser(next = "/account") {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
export async function requirePageAdmin() {
  const user = await requirePageUser("/admin");
  if (user.role !== "ADMIN") redirect("/account");
  return user;
}
