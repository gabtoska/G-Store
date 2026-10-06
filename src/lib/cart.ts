import { z } from "zod";
import type { Product, CartLine, CartState } from "./types";
import { imageSchema } from "./validation";
import { MAX_PRODUCT_QUANTITY } from "./pricing";

export type CartAction =
  | { type: "hydrate"; payload: CartState }
  | {
      type: "add";
      payload: {
        product: Product;
        color: string;
        size: string;
        quantity?: number;
      };
    }
  | { type: "remove"; payload: { lineId: string } }
  | { type: "setQuantity"; payload: { lineId: string; quantity: number } }
  | { type: "clear" };

const storedCartSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.string().max(250),
        productId: z.string().min(1).max(64),
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(120),
        name: z.string().min(1).max(120),
        priceCents: z.number().int().min(1).max(10000000),
        image: imageSchema,
        color: z.string().min(1).max(50),
        size: z.string().min(1).max(30),
        quantity: z.number().int().min(1).max(MAX_PRODUCT_QUANTITY),
        stock: z
          .number()
          .int()
          .min(0)
          .max(1000000)
          .default(MAX_PRODUCT_QUANTITY),
      }),
    )
    .max(50),
});

export function parseStoredCart(input: unknown): CartState {
  const parsed = storedCartSchema.safeParse(input);
  if (!parsed.success) return { lines: [] };
  const seen = new Set<string>();
  const counts = new Map<string, number>();
  const lines = parsed.data.lines
    .filter((line) => {
      const key = JSON.stringify([line.productId, line.color, line.size]);
      if (seen.has(key)) return false;
      seen.add(key);
      const quantity = (counts.get(line.productId) ?? 0) + line.quantity;
      counts.set(line.productId, quantity);
      return quantity <= Math.min(line.stock, MAX_PRODUCT_QUANTITY);
    })
    .map((line) => ({
      ...line,
      id: JSON.stringify([line.productId, line.color, line.size]),
    }));
  return { lines };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return parseStoredCart(action.payload);
    case "clear":
      return { lines: [] };
    case "remove":
      return {
        lines: state.lines.filter((line) => line.id !== action.payload.lineId),
      };
    case "add": {
      const { product, color, size, quantity = 1 } = action.payload;
      if (
        !product.isActive ||
        !product.colors.includes(color) ||
        !product.sizes.includes(size) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      )
        return state;
      const used = state.lines
        .filter((line) => line.productId === product.id)
        .reduce((sum, line) => sum + line.quantity, 0);
      const added = Math.min(
        quantity,
        product.stock - used,
        MAX_PRODUCT_QUANTITY - used,
      );
      if (added <= 0) return state;
      const id = JSON.stringify([product.id, color, size]);
      const existing = state.lines.find((line) => line.id === id);
      const line: CartLine = {
        id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        priceCents: product.priceCents,
        color,
        size,
        quantity: (existing?.quantity ?? 0) + added,
        stock: product.stock,
      };
      return {
        lines: existing
          ? state.lines.map((old) => (old.id === id ? line : old))
          : state.lines.length < 50
            ? [...state.lines, line]
            : state.lines,
      };
    }
    case "setQuantity": {
      const { lineId, quantity } = action.payload;
      if (!Number.isInteger(quantity) || quantity < 0) return state;
      if (quantity === 0)
        return { lines: state.lines.filter((line) => line.id !== lineId) };
      const current = state.lines.find((line) => line.id === lineId);
      if (!current) return state;
      const other = state.lines
        .filter(
          (line) => line.productId === current.productId && line.id !== lineId,
        )
        .reduce((sum, line) => sum + line.quantity, 0);
      const allowed = Math.max(
        1,
        Math.min(quantity, current.stock - other, MAX_PRODUCT_QUANTITY - other),
      );
      return {
        lines: state.lines.map((line) =>
          line.id === lineId ? { ...line, quantity: allowed } : line,
        ),
      };
    }
  }
}

export function availableForLine(lines: CartLine[], current: CartLine) {
  const others = lines
    .filter(
      (line) => line.productId === current.productId && line.id !== current.id,
    )
    .reduce((total, line) => total + line.quantity, 0);
  return Math.max(1, Math.min(MAX_PRODUCT_QUANTITY, current.stock) - others);
}
