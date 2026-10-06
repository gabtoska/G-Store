import type { OrderStatus } from "@prisma/client";
import { AppError } from "./errors";

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};
export function assertTransition(from: OrderStatus, to: OrderStatus) {
  if (!ORDER_TRANSITIONS[from].includes(to))
    throw new AppError(
      409,
      `Cannot change ${from.toLowerCase()} to ${to.toLowerCase()}.`,
    );
}
export function assertAdmin(user: { role: string } | null) {
  if (!user) throw new AppError(401, "Please log in.");
  if (user.role !== "ADMIN")
    throw new AppError(403, "Administrator access required.");
}
