import { randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
}
async function register(page: Page, email: string, password: string) {
  await page.goto("/register");
  await page.getByLabel("Name", { exact: true }).fill("Portfolio Tester");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: false }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/account$/);
}

test("admin CRUD, customer checkout, order ownership, persistent login, cancellation and logout", async ({
  page,
  browser,
  baseURL,
}) => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword)
    throw new Error(
      "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD and seed an admin before running this flow.",
    );
  const suffix = randomUUID().slice(0, 8);
  const slug = `e2e-coat-${suffix}`;
  const email = `e2e-${suffix}@example.test`;
  const password = `Test-only-${randomUUID()}`;
  await login(page, adminEmail, adminPassword);
  await page.goto("/admin/products/new");
  await page.getByLabel("Name", { exact: true }).fill(`E2E Coat ${suffix}`);
  await page.getByLabel("Slug", { exact: true }).fill(slug);
  await page.getByLabel("Price (USD)", { exact: true }).fill("100.01");
  await page.getByLabel("Stock", { exact: true }).fill("3");
  await page.getByLabel("Tagline").fill("A test of the complete store flow.");
  await page
    .getByLabel("Description")
    .fill("A temporary product created by the browser acceptance suite.");
  await page
    .getByLabel("colors (comma separated)", { exact: false })
    .fill("Black, Blue");
  await page
    .getByLabel("sizes (comma separated)", { exact: false })
    .fill("M, L");
  await page
    .getByLabel("materials (comma separated)", { exact: false })
    .fill("Wool");
  await page
    .getByLabel("Images", { exact: false })
    .fill(
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    );
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  const product = await (
    await page.request.get(`/api/products/${slug}`)
  ).json();

  const customerContext = await browser.newContext({ baseURL });
  const customer = await customerContext.newPage();
  await register(customer, email, password);
  await customer.reload();
  await expect(customer.getByText("Welcome, Portfolio Tester.")).toBeVisible();
  expect(
    (
      await customer.request.patch(`/api/admin/products/${product.id}`, {
        data: {},
        headers: { Origin: baseURL! },
      })
    ).status(),
  ).toBe(403);
  await customer.goto(`/shop/${slug}`);
  await customer
    .getByRole("button", { name: "Add To Cart", exact: true })
    .first()
    .click();
  await customer.goto("/cart");
  await customer.getByRole("button", { name: "Increase quantity" }).click();
  await customer.reload();
  await expect(customer.getByText("$200.02").first()).toBeVisible();
  await customer.goto("/checkout");
  await customer
    .getByLabel("Street address", { exact: true })
    .fill("123 Test Street");
  await customer.getByLabel("City", { exact: true }).fill("New York");
  await customer.getByLabel("State", { exact: true }).fill("NY");
  await customer.getByLabel("ZIP code", { exact: true }).fill("10001");
  await customer
    .getByRole("button", { name: "Review order", exact: true })
    .click();
  await expect(
    customer.getByRole("button", { name: "Place demo order · $228.02" }),
  ).toBeVisible();
  await customer
    .getByRole("button", { name: "Place demo order", exact: false })
    .click();
  await expect(
    customer.getByRole("heading", {
      name: "Thank you. Your demo order is confirmed.",
    }),
  ).toBeVisible();
  const orderId = new URL(customer.url()).pathname.split("/").at(-1)!;
  await customer.goto("/account");
  await expect(customer.getByText("123 Test Street")).toBeVisible();
  await expect(
    customer.getByRole("link", { name: new RegExp(orderId.slice(-8), "i") }),
  ).toBeVisible();
  await customer.goto("/cart");
  await expect(
    customer.getByText("Your cart is currently empty."),
  ).toBeVisible();

  const strangerContext = await browser.newContext({ baseURL });
  const stranger = await strangerContext.newPage();
  expect(
    (
      await stranger.request.post("/api/orders", {
        data: {},
        headers: { Origin: baseURL! },
      })
    ).status(),
  ).toBe(401);
  await stranger.goto("/checkout");
  await expect(stranger).toHaveURL(/\/login\?next=/);
  await register(stranger, `e2e-other-${suffix}@example.test`, password);
  await stranger.goto(`/account/orders/${orderId}`);
  await expect(
    stranger.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await stranger.goto("/admin");
  await expect(stranger).toHaveURL(/\/account$/);
  await strangerContext.close();

  await page.goto(`/admin/orders/${orderId}`);
  await page.getByLabel("New order status").selectOption("CANCELLED");
  await page
    .getByRole("button", { name: "Update status", exact: true })
    .click();
  await expect(
    page.getByText("This order has reached its final status."),
  ).toBeVisible();
  await page.goto(`/admin/products/${product.id}`);
  await expect(page.getByLabel("Stock", { exact: true })).toHaveValue("3");
  await page.getByLabel("Active in storefront").uncheck();
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  expect((await page.request.get(`/api/products/${slug}`)).status()).toBe(404);
  await customer.goto("/account");
  await customer.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(customer).toHaveURL(/\/$/);
  await customer.goto("/account");
  await expect(customer).toHaveURL(/\/login/);
  await customerContext.close();
});

test("catalog filtering, empty/not-found states and responsive storefront", async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/", "/shop", "/cart", "/login"]) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.goto("/shop");
  await page
    .getByRole("searchbox", { name: "Search", exact: true })
    .fill("no-product-can-match-this");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", { name: "No products matched." }),
  ).toBeVisible();
  await page.goto("/shop?category=Tops&sort=price-asc");
  const prices = await page.locator("article p.text-lg").allTextContents();
  const values = prices.map((value) => Number(value.replace(/[^0-9.]/g, "")));
  expect(values.length).toBeGreaterThan(0);
  expect(values).toEqual([...values].sort((a, b) => a - b));
  await page.goto("/shop/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
