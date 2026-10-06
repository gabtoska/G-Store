import { z } from "zod";
import { MAX_PRODUCT_QUANTITY } from "./pricing";

const text = (max: number) =>
  z.string().trim().min(1, "This field is required.").max(max);
export const emailSchema = z.email().trim().toLowerCase().max(254);
export const passwordSchema = z
  .string()
  .min(12, "Use at least 12 characters.")
  .max(128);
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});
export const registerSchema = z
  .object({ name: text(80), email: emailSchema, password: passwordSchema })
  .strict();
export const addressSchema = z
  .object({
    fullName: text(100),
    line1: text(150),
    line2: z.string().trim().max(150).default(""),
    city: text(80),
    region: text(80),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}(-\d{4})?$/, "Enter a US ZIP code."),
    country: z.literal("US"),
  })
  .strict();
export type ShippingAddress = z.infer<typeof addressSchema>;
export const cartItemSchema = z
  .object({
    productId: text(64),
    color: text(50),
    size: text(30),
    quantity: z.number().int().min(1).max(MAX_PRODUCT_QUANTITY),
  })
  .strict();
export const cartItemsSchema = z
  .array(cartItemSchema)
  .min(1, "Your cart is empty.")
  .max(50)
  .superRefine((lines, ctx) => {
    const variants = new Set<string>();
    const counts = new Map<string, number>();
    for (const line of lines) {
      const key = JSON.stringify([line.productId, line.color, line.size]);
      if (variants.has(key))
        ctx.addIssue({ code: "custom", message: "Duplicate product options." });
      variants.add(key);
      const quantity = (counts.get(line.productId) ?? 0) + line.quantity;
      if (quantity > MAX_PRODUCT_QUANTITY)
        ctx.addIssue({
          code: "custom",
          message: "Maximum 12 units per product.",
        });
      counts.set(line.productId, quantity);
    }
  });
export const quoteSchema = z.object({ items: cartItemsSchema }).strict();
export const checkoutSchema = z
  .object({
    items: cartItemsSchema,
    addressId: text(64).optional(),
    address: addressSchema.optional(),
    saveAddress: z.boolean().default(false),
    requestKey: z.uuid(),
    quoteHash: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict()
  .refine((v) => Boolean(v.addressId) !== Boolean(v.address), {
    message: "Select a saved address or enter a new one.",
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const imageSchema = z
  .url()
  .max(1000)
  .refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "images.unsplash.com" &&
      !url.username &&
      !url.password &&
      !url.port
    );
  }, "Use an HTTPS images.unsplash.com URL.");
const options = (max: number) =>
  z
    .array(text(max))
    .min(1)
    .max(20)
    .refine((v) => new Set(v).size === v.length, "Remove duplicate options.");
export const productSchema = z
  .object({
    name: text(120),
    slug: z
      .string()
      .min(2)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    tagline: text(200),
    description: text(5000),
    categoryId: text(64),
    collection: text(60),
    priceCents: z.number().int().min(1).max(10000000),
    compareAtCents: z.number().int().min(1).max(10000000).nullable(),
    gallery: z.array(imageSchema).min(1).max(6),
    colors: options(50),
    sizes: options(30),
    materials: options(80),
    stock: z.number().int().min(0).max(1000000),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    isNew: z.boolean(),
  })
  .strict()
  .refine((v) => !v.compareAtCents || v.compareAtCents > v.priceCents, {
    message: "Compare-at price must be higher than the price.",
    path: ["compareAtCents"],
  });
export const productUpdateSchema = z
  .object({ product: productSchema, version: z.number().int().min(0) })
  .strict();
export const statusSchema = z
  .object({
    status: z.enum([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
    expectedStatus: z.enum([
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ]),
  })
  .strict();
export const catalogQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  category: z.string().max(80).default("All"),
  collection: z.string().max(60).default("All"),
  sort: z
    .enum(["featured", "price-asc", "price-desc", "newest"])
    .default("featured"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
