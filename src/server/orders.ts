import { createHash } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { z } from "zod";
import { AppError } from "@/lib/errors";
import { calculateTotals } from "@/lib/pricing";
import { assertTransition } from "@/lib/order-rules";
import {
  addressSchema,
  cartItemsSchema,
  checkoutSchema,
  statusSchema,
} from "@/lib/validation";

type Database = PrismaClient | Prisma.TransactionClient;
const digest = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

export async function quoteOrder(db: Database, rawItems: unknown) {
  const input = cartItemsSchema.parse(rawItems);
  const products = await db.product.findMany({
    where: { id: { in: input.map((line) => line.productId) } },
  });
  const quantities = new Map<string, number>();
  const items = input
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product?.isActive)
        throw new AppError(
          409,
          "A product is no longer available. Update your cart.",
        );
      if (
        !product.colors.includes(line.color) ||
        !product.sizes.includes(line.size)
      )
        throw new AppError(
          409,
          `Please choose available options for ${product.name}.`,
        );
      const count = (quantities.get(product.id) ?? 0) + line.quantity;
      quantities.set(product.id, count);
      if (count > product.stock)
        throw new AppError(
          409,
          `Only ${product.stock} units of ${product.name} remain. Update your cart.`,
        );
      return {
        ...line,
        name: product.name,
        slug: product.slug,
        image: product.image,
        priceCents: product.priceCents,
      };
    })
    .sort((a, b) =>
      JSON.stringify([a.productId, a.color, a.size]).localeCompare(
        JSON.stringify([b.productId, b.color, b.size]),
      ),
    );
  const totals = calculateTotals(items);
  return { items, ...totals, quoteHash: digest({ items, totals }) };
}

async function serializable<T>(
  db: PrismaClient,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await db.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      });
    } catch (error) {
      const retryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ["P2034", "P2002"].includes(error.code);
      if (!retryable) throw error;
      if (attempt === 3)
        throw new AppError(
          409,
          "This order changed while you were checking out. Please review and retry.",
        );
    }
  }
  throw new Error("Unreachable transaction state");
}

export async function createOrder(
  db: PrismaClient,
  userId: string,
  rawInput: unknown,
) {
  const input = checkoutSchema.parse(rawInput);
  const requestHash = digest(input);
  return serializable(db, async (tx) => {
    const existing = await tx.order.findUnique({
      where: { userId_requestKey: { userId, requestKey: input.requestKey } },
    });
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new AppError(
          409,
          "That checkout was already submitted with different details. Start a new review.",
        );
      return existing;
    }
    const quote = await quoteOrder(tx, input.items);
    if (quote.quoteHash !== input.quoteHash)
      throw new AppError(
        409,
        "Your cart details or prices have changed. Review your order again.",
      );
    let address = input.address;
    if (input.addressId) {
      const saved = await tx.address.findFirst({
        where: { id: input.addressId, userId },
      });
      if (!saved) throw new AppError(404, "Shipping address not found.");
      address = addressSchema.parse({
        fullName: saved.fullName,
        line1: saved.line1,
        line2: saved.line2,
        city: saved.city,
        region: saved.region,
        postalCode: saved.postalCode,
        country: saved.country,
      });
    }
    if (!address) throw new AppError(400, "Shipping address is required.");
    const quantities = new Map<string, number>();
    for (const item of input.items)
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity,
      );
    // Deterministic lock order, plus a conditional decrement for every product.
    for (const [productId, quantity] of [...quantities].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const result = await tx.product.updateMany({
        where: { id: productId, isActive: true, stock: { gte: quantity } },
        data: { stock: { decrement: quantity }, version: { increment: 1 } },
      });
      if (result.count !== 1)
        throw new AppError(
          409,
          "Stock changed. Please review your cart again.",
        );
    }
    if (input.saveAddress && !input.addressId) {
      const count = await tx.address.count({ where: { userId } });
      if (count >= 20)
        throw new AppError(
          400,
          "You have 20 saved addresses. Uncheck save address to continue.",
        );
      const duplicate = await tx.address.findFirst({
        where: { userId, ...address },
      });
      if (!duplicate) await tx.address.create({ data: { userId, ...address } });
    }
    return tx.order.create({
      data: {
        userId,
        requestKey: input.requestKey,
        requestHash,
        shippingAddress: address,
        subtotalCents: quote.subtotalCents,
        shippingCents: quote.shippingCents,
        taxCents: quote.taxCents,
        totalCents: quote.totalCents,
        items: {
          create: quote.items.map(({ priceCents, ...line }) => ({
            ...line,
            unitPriceCents: priceCents,
          })),
        },
      },
    });
  });
}

export async function updateOrderStatus(
  db: PrismaClient,
  orderId: string,
  rawInput: unknown,
) {
  const { status, expectedStatus } = statusSchema.parse(rawInput);
  assertTransition(expectedStatus, status);
  return serializable(db, async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new AppError(404, "Order not found.");
    if (order.status !== expectedStatus)
      throw new AppError(
        409,
        "This order was updated elsewhere. Refresh to continue.",
      );
    const changed = await tx.order.updateMany({
      where: { id: orderId, status: expectedStatus },
      data: { status },
    });
    if (changed.count !== 1)
      throw new AppError(409, "This order was updated elsewhere.");
    if (status === "CANCELLED") {
      const quantities = new Map<string, number>();
      for (const item of order.items)
        quantities.set(
          item.productId,
          (quantities.get(item.productId) ?? 0) + item.quantity,
        );
      for (const [id, quantity] of [...quantities].sort(([a], [b]) =>
        a.localeCompare(b),
      )) {
        await tx.product.update({
          where: { id },
          data: { stock: { increment: quantity }, version: { increment: 1 } },
        });
      }
    }
    return { id: orderId, status };
  });
}

export type OrderQuote = Awaited<ReturnType<typeof quoteOrder>>;
export type OrderItemsInput = z.infer<typeof cartItemsSchema>;
