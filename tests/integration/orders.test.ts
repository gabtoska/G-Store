import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  createOrder,
  quoteOrder,
  updateOrderStatus,
} from "../../src/server/orders";
import type { ShippingAddress } from "../../src/lib/validation";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  url === process.env.DATABASE_URL ||
  !new URL(url).pathname.endsWith("_test")
) {
  throw new Error(
    "Set TEST_DATABASE_URL to a separate migrated database whose name ends in _test.",
  );
}
const db = new PrismaClient({ datasourceUrl: url });
const prefix = `test-${randomUUID()}`;
let userId: string;
let otherUserId: string;
let categoryId: string;
const address: ShippingAddress = {
  fullName: "Test Customer",
  line1: "123 Test Street",
  line2: "",
  city: "New York",
  region: "NY",
  postalCode: "10001",
  country: "US",
};
before(async () => {
  const user = await db.user.create({
    data: {
      email: `${prefix}@example.test`,
      name: "Test",
      passwordHash: "unused-in-service-tests",
    },
  });
  const other = await db.user.create({
    data: {
      email: `${prefix}-other@example.test`,
      name: "Other",
      passwordHash: "unused-in-service-tests",
    },
  });
  userId = user.id;
  otherUserId = other.id;
  categoryId = (
    await db.category.create({
      data: { name: prefix, slug: prefix, description: "Test category" },
    })
  ).id;
});
after(async () => {
  // Only remove records created by this run; never truncate the database.
  await db.order.deleteMany({
    where: { userId: { in: [userId, otherUserId].filter(Boolean) } },
  });
  if (categoryId) {
    await db.product.deleteMany({ where: { categoryId } });
    await db.category.delete({ where: { id: categoryId } });
  }
  await db.user.deleteMany({
    where: { id: { in: [userId, otherUserId].filter(Boolean) } },
  });
  await db.$disconnect();
});
async function fixture(stock = 10) {
  const product = await db.product.create({
    data: {
      categoryId,
      name: "Test coat",
      slug: `${prefix}-${randomUUID()}`,
      tagline: "Test",
      description: "Test coat",
      priceCents: 10001,
      stock,
      image: "https://images.unsplash.com/photo-test",
      gallery: ["https://images.unsplash.com/photo-test"],
      colors: ["Black", "Blue"],
      sizes: ["M"],
      materials: ["Wool"],
      collection: "Test",
    },
  });
  const items = [
    { productId: product.id, color: "Black", size: "M", quantity: 1 },
  ];
  const quote = await quoteOrder(db, items);
  return {
    product,
    input: {
      items,
      address,
      saveAddress: false,
      requestKey: randomUUID(),
      quoteHash: quote.quoteHash,
    },
  };
}
test("real PostgreSQL: saves purchase snapshots, computes totals, decrements stock and deduplicates retries", async () => {
  const { product, input } = await fixture();
  const [first, retry] = await Promise.all([
    createOrder(db, userId, input),
    createOrder(db, userId, input),
  ]);
  assert.equal(first.id, retry.id);
  assert.equal(first.totalCents, 12001);
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    9,
  );
  await db.product.update({
    where: { id: product.id },
    data: { priceCents: 1, name: "Changed" },
  });
  const item = await db.orderItem.findFirstOrThrow({
    where: { orderId: first.id },
  });
  assert.equal(item.unitPriceCents, 10001);
  assert.equal(item.name, "Test coat");
  await assert.rejects(
    createOrder(db, userId, {
      ...input,
      address: { ...address, city: "Boston" },
    }),
    { status: 409 },
  );
});
test("concurrent buyers cannot oversell the final unit", async () => {
  const { product, input } = await fixture(1);
  const results = await Promise.allSettled([
    createOrder(db, userId, input),
    createOrder(db, otherUserId, { ...input, requestKey: randomUUID() }),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    0,
  );
  assert.equal(
    await db.orderItem.count({ where: { productId: product.id } }),
    1,
  );
});
test("stale prices, unavailable products and combined option quantities are rejected", async () => {
  const { product, input } = await fixture(2);
  await db.product.update({
    where: { id: product.id },
    data: { priceCents: 20000 },
  });
  await assert.rejects(createOrder(db, userId, input), { status: 409 });
  await assert.rejects(
    quoteOrder(db, [
      { ...input.items[0], quantity: 2 },
      { ...input.items[0], color: "Blue", quantity: 1 },
    ]),
    { status: 409 },
  );
  await db.product.update({
    where: { id: product.id },
    data: { isActive: false },
  });
  await assert.rejects(quoteOrder(db, input.items), { status: 409 });
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    2,
  );
});
test("saved addresses are owned by the buyer, and failed checkout rolls back stock", async () => {
  const { product, input } = await fixture();
  const foreignAddress = await db.address.create({
    data: { userId: otherUserId, ...address },
  });
  const savedInput = {
    items: input.items,
    requestKey: input.requestKey,
    quoteHash: input.quoteHash,
    addressId: foreignAddress.id,
    saveAddress: false,
  };
  await assert.rejects(createOrder(db, userId, savedInput), { status: 404 });
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    10,
  );
  const order = await createOrder(db, userId, { ...input, saveAddress: true });
  const saved = await db.address.findFirstOrThrow({ where: { userId } });
  await db.address.update({
    where: { id: saved.id },
    data: { city: "Changed later" },
  });
  assert.equal((order.shippingAddress as ShippingAddress).city, "New York");
});
test("concurrent cancellation restores stock once and terminal states cannot reopen", async () => {
  const { product, input } = await fixture();
  const order = await createOrder(db, userId, input);
  const results = await Promise.allSettled([
    updateOrderStatus(db, order.id, {
      expectedStatus: "PENDING",
      status: "CANCELLED",
    }),
    updateOrderStatus(db, order.id, {
      expectedStatus: "PENDING",
      status: "CANCELLED",
    }),
  ]);
  assert.equal(
    results.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
    10,
  );
  await assert.rejects(
    updateOrderStatus(db, order.id, {
      expectedStatus: "CANCELLED",
      status: "PROCESSING",
    }),
    { status: 409 },
  );
});
test("database constraints reject negative stock even when validation is bypassed", async () => {
  const { product } = await fixture();
  await assert.rejects(
    db.product.update({ where: { id: product.id }, data: { stock: -1 } }),
  );
});

test("a failure after reserving stock rolls the entire transaction back", async () => {
  const { product, input } = await fixture();
  const temporaryAddresses = await Promise.all(
    Array.from({ length: 20 }, (_, index) =>
      db.address.create({
        data: {
          ...address,
          userId: otherUserId,
          line1: `Rollback fixture ${index}`,
        },
      }),
    ),
  );
  try {
    await assert.rejects(
      createOrder(db, otherUserId, { ...input, saveAddress: true }),
      { status: 400 },
    );
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id: product.id } })).stock,
      10,
    );
    assert.equal(
      await db.order.count({
        where: { userId: otherUserId, requestKey: input.requestKey },
      }),
      0,
    );
  } finally {
    await db.address.deleteMany({
      where: { id: { in: temporaryAddresses.map((row) => row.id) } },
    });
  }
});
