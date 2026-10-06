import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SEED_PRODUCTS } from "./catalog-data";
import { hashPassword } from "../src/lib/password";
import { emailSchema, passwordSchema } from "../src/lib/validation";

const db = new PrismaClient();
async function main() {
  if (process.env.SEED_ADMIN_EMAIL || process.env.SEED_ADMIN_PASSWORD) {
    const email = emailSchema.parse(process.env.SEED_ADMIN_EMAIL);
    const password = passwordSchema.parse(process.env.SEED_ADMIN_PASSWORD);
    const existing = await db.user.findUnique({ where: { email } });
    if (existing && existing.role !== "ADMIN")
      throw new Error(
        "Seed refuses to promote an existing customer. Choose a new admin email.",
      );
    if (!existing)
      await db.user.create({
        data: {
          email,
          name: "Store Administrator",
          role: "ADMIN",
          passwordHash: await hashPassword(password),
        },
      });
  }
  for (const name of [...new Set(SEED_PRODUCTS.map((p) => p.category))]) {
    await db.category.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase(),
        description: `Discover the G Store ${name.toLowerCase()} edit.`,
      },
    });
  }
  for (const { category, ...product } of SEED_PRODUCTS) {
    const row = await db.category.findUniqueOrThrow({
      where: { name: category },
    });
    // Repeatable and non-destructive: never reset sold stock or overwrite admin edits.
    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, image: product.gallery[0], categoryId: row.id },
    });
  }
  console.log(
    "Seed complete: catalog created; existing records left unchanged.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
