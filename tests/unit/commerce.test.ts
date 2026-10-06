import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateTotals } from "../../src/lib/pricing";
import { cartReducer, parseStoredCart } from "../../src/lib/cart";
import {
  cartItemsSchema,
  checkoutSchema,
  registerSchema,
  productSchema,
  imageSchema,
} from "../../src/lib/validation";
import { assertAdmin, assertTransition } from "../../src/lib/order-rules";
import { hashPassword, verifyPassword } from "../../src/lib/password";
import { safeReturnPath } from "../../src/lib/navigation";
import type { Product } from "../../src/lib/types";

const product: Product = {
  id: "test",
  name: "Coat",
  slug: "test-coat",
  tagline: "Warm coat",
  description: "A warm coat",
  category: "Outerwear",
  categoryId: "coats",
  collection: "Runway",
  image: "https://images.unsplash.com/photo-test",
  gallery: ["https://images.unsplash.com/photo-test"],
  priceCents: 10000,
  stock: 3,
  colors: ["Black", "Blue"],
  sizes: ["M"],
  materials: ["Wool"],
  isActive: true,
  isFeatured: true,
  isNew: false,
  version: 0,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};
const line = { productId: product.id, color: "Black", size: "M", quantity: 1 };

test("integer-cent totals preserve the exact free-shipping boundary and rounding", () => {
  assert.deepEqual(calculateTotals([]), {
    subtotalCents: 0,
    taxCents: 0,
    shippingCents: 0,
    totalCents: 0,
  });
  assert.deepEqual(calculateTotals([{ priceCents: 25000, quantity: 1 }]), {
    subtotalCents: 25000,
    taxCents: 2000,
    shippingCents: 1200,
    totalCents: 28200,
  });
  assert.equal(
    calculateTotals([{ priceCents: 25001, quantity: 1 }]).shippingCents,
    0,
  );
  assert.equal(
    calculateTotals([{ priceCents: 1999, quantity: 3 }]).taxCents,
    480,
  );
  assert.throws(() => calculateTotals([{ priceCents: -1, quantity: 1 }]));
  assert.throws(() => calculateTotals([{ priceCents: 1999, quantity: 1.5 }]));
});

test("cart merges matching options and caps stock across different options", () => {
  let cart = cartReducer(
    { lines: [] },
    {
      type: "add",
      payload: { product, color: "Black", size: "M", quantity: 2 },
    },
  );
  cart = cartReducer(cart, {
    type: "add",
    payload: { product, color: "Blue", size: "M", quantity: 2 },
  });
  assert.deepEqual(
    cart.lines.map((line) => line.quantity),
    [2, 1],
  );
  cart = cartReducer(cart, {
    type: "setQuantity",
    payload: { lineId: cart.lines[0].id, quantity: 99 },
  });
  assert.equal(cart.lines[0].quantity, 2);
  assert.deepEqual(
    cartReducer(cart, {
      type: "add",
      payload: { product, color: "Black", size: "M" },
    }),
    cart,
  );
  cart = cartReducer(cart, {
    type: "remove",
    payload: { lineId: cart.lines[1].id },
  });
  cart = cartReducer(cart, {
    type: "add",
    payload: { product, color: "Black", size: "M" },
  });
  assert.equal(cart.lines.length, 1);
  assert.equal(cart.lines[0].quantity, 3);
  assert.equal(cartReducer(cart, { type: "clear" }).lines.length, 0);
});

test("persisted cart rejects malformed values and duplicate options", () => {
  assert.deepEqual(parseStoredCart({ lines: [{ priceCents: -1 }] }), {
    lines: [],
  });
  const cart = cartReducer(
    { lines: [] },
    { type: "add", payload: { product, color: "Black", size: "M" } },
  );
  assert.equal(
    parseStoredCart({ lines: [...cart.lines, ...cart.lines] }).lines.length,
    1,
  );
  const legacyLine = { ...cart.lines[0], stock: undefined };
  assert.equal(parseStoredCart({ lines: [legacyLine] }).lines[0].stock, 12);
  assert.equal(
    parseStoredCart({ lines: [{ ...cart.lines[0], quantity: 0.5 }] }).lines
      .length,
    0,
  );
});

test("checkout rejects injected prices, duplicate variants, invalid quantities and excessive aggregate quantities", () => {
  assert.equal(
    cartItemsSchema.safeParse([{ ...line, priceCents: 1 }]).success,
    false,
  );
  assert.equal(cartItemsSchema.safeParse([line, line]).success, false);
  assert.equal(
    cartItemsSchema.safeParse([{ ...line, quantity: -1 }]).success,
    false,
  );
  assert.equal(
    cartItemsSchema.safeParse([{ ...line, quantity: 0.5 }]).success,
    false,
  );
  assert.equal(
    cartItemsSchema.safeParse([
      { ...line, quantity: 7 },
      { ...line, color: "Blue", quantity: 6 },
    ]).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({ items: [line], userId: "somebody-else" })
      .success,
    false,
  );
});

test("registration cannot select an admin role, images are allowlisted, and product prices validate", () => {
  const user = {
    name: "Ada",
    email: "ADA@example.com",
    password: "a-long-unique-password",
  };
  assert.equal(registerSchema.parse(user).email, "ada@example.com");
  assert.equal(
    registerSchema.safeParse({ ...user, role: "ADMIN" }).success,
    false,
  );
  assert.equal(
    imageSchema.safeParse("https://localhost/private").success,
    false,
  );
  assert.equal(
    imageSchema.safeParse("https://images.unsplash.com@evil.example/image")
      .success,
    false,
  );
  const input = {
    name: product.name,
    slug: product.slug,
    tagline: product.tagline,
    description: product.description,
    categoryId: product.categoryId,
    collection: product.collection,
    priceCents: 1000,
    compareAtCents: 900,
    stock: 0,
    gallery: product.gallery,
    colors: product.colors,
    sizes: product.sizes,
    materials: product.materials,
    isActive: true,
    isNew: false,
    isFeatured: false,
  };
  assert.equal(productSchema.safeParse(input).success, false);
  assert.equal(
    productSchema.safeParse({ ...input, compareAtCents: 2000 }).success,
    true,
  );
});

test("authorization, status transitions, and redirect rules reject invalid access", () => {
  assert.throws(() => assertAdmin(null), { status: 401 });
  assert.throws(() => assertAdmin({ role: "CUSTOMER" }), { status: 403 });
  assert.doesNotThrow(() => assertAdmin({ role: "ADMIN" }));
  assert.doesNotThrow(() => assertTransition("PENDING", "CANCELLED"));
  assert.throws(() => assertTransition("SHIPPED", "CANCELLED"));
  assert.throws(() => assertTransition("CANCELLED", "PROCESSING"));
  assert.equal(safeReturnPath("//evil.example"), "/account");
  assert.equal(safeReturnPath("/checkout"), "/checkout");
});

test("passwords use unique salts and reject incorrect credentials", async () => {
  const password = "a-long-unique-password";
  const [first, second] = await Promise.all([
    hashPassword(password),
    hashPassword(password),
  ]);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("incorrect-password", first), false);
  assert.equal(await verifyPassword(password, "broken"), false);
});
