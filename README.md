# G Store — Dress like a G

A full-stack fashion storefront built on the original G Store visual identity. Browse a PostgreSQL-backed catalog, register an account, build a persistent cart, place a **simulated pay-on-delivery order**, and manage the store through a protected admin area.

**Portfolio demo:** no payment provider, card collection, real shipment, or confirmation email. USD prices and an illustrative 8% tax rule are used throughout.

## Implemented features

- Database catalog with product details, galleries, categories, collections, search, sorting, and pagination.
- Auth.js credentials registration, login, logout, and persistent sessions; passwords stored as salted scrypt hashes.
- React Context/reducer cart with local-storage persistence, migration from the original cart format, option selection, quantity controls, stock limits, and shared integer-cent pricing rules.
- Authenticated checkout with new/saved US shipping addresses and an explicit server-priced review before submission.
- Idempotent order creation; purchase-time product and address snapshots; server-side price, variant, and quantity validation.
- Serializable PostgreSQL transactions, conditional stock decrements, conflict retries, and exactly-once restocking when orders are cancelled.
- Account order history and order details scoped to their owner.
- Admin product creation/editing/deactivation, stock editing, order listing/details, and validated status transitions. Concurrent stock changes invalidate stale admin forms.
- Loading, empty, not-found, error, pending, and disabled states; responsive layouts; keyboard-accessible cart drawer.

## Screenshots

Screenshot placeholders for the portfolio: desktop storefront, mobile catalog, checkout review, and admin product editor. Capture these from the running seeded app before publishing the portfolio.

## Stack and architecture

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, PostgreSQL, Prisma ORM 6, Auth.js (next-auth 5 beta), Zod 4. Node's test runner with tsx handles unit/integration tests; Playwright handles browser acceptance tests.

```text
src/app/                  Server-rendered routes and REST handlers
src/components/           Existing storefront plus auth, checkout, account/admin UI
src/auth.ts               Auth.js credentials and JWT/session callbacks
src/lib/                  Prisma singleton, validation, pure pricing/cart/order rules
src/server/               Catalog queries, authorization, transactional orders, HTTP errors
prisma/schema.prisma      Relational schema
prisma/migrations/        Committed SQL migration and database CHECK constraints
prisma/catalog-data.ts    Development seed input only; never imported by the storefront
prisma/seed.ts            Repeatable, non-destructive seed and optional first admin
scripts/                  Test database migration helper
tests/unit/               Pure commerce, validation, authorization, password tests
tests/integration/        Real PostgreSQL transaction/concurrency tests
tests/e2e/                Browser user/admin flows and responsive checks
```

Server pages read through Prisma; browser mutations call REST handlers. Handlers authenticate and authorize, enforce same-origin JSON requests and a 32 KiB body limit, validate with Zod, then call the business layer. Client cart values are estimates: submitted orders never accept client prices, totals, user IDs, or roles.

### Database models

| Model     | Responsibility                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User      | Unique normalized email, password hash, CUSTOMER/ADMIN role, timestamps                                                                                  |
| Category  | Unique name/slug, description, product relation                                                                                                          |
| Product   | Slug, copy, integer-cent prices, cover/gallery, category/collection, options, aggregate stock, active/featured/new flags, optimistic version, timestamps |
| Address   | Shipping details owned by a user; optional reuse at checkout                                                                                             |
| Order     | Owner, status, totals/currency, demo payment method, address snapshot, idempotency key/hash, timestamps                                                  |
| OrderItem | Product relation plus immutable purchase-time name, slug, image, size/color, quantity, and unit price                                                    |
| RateLimit | Expiring database-backed counters shared across app instances                                                                                            |

Products are deactivated rather than deleted so past orders remain readable. PostgreSQL constraints reject negative stock, invalid item quantities/prices, inconsistent totals, and non-demo payment methods. Inventory is shared across all colors/sizes of a product.

### Authentication and authorization

Auth.js Credentials verifies passwords against PostgreSQL users. Encrypted JWT sessions use HTTP-only cookies with a seven-day maximum age; Auth.js manages CSRF for its authentication endpoints. No adapter is required for this credentials/JWT design. Registration creates only CUSTOMER users. Optional seed environment variables create the first administrator; seeding refuses to elevate an existing customer.

Protected server pages and **every admin mutation** check the current database user and role. Roles are never trusted from browser state or a JWT. Customer order and saved-address lookups include the authenticated user ID. Account deletion invalidates access on the next protected request. Sign-out clears the browser session; global session revocation is not implemented.

Login is throttled per normalized email, registration per normalized email, and checkout per authenticated user using PostgreSQL counters. Put public deployments behind network-level rate limiting as well: account-based throttles do not stop distributed account creation. API error responses do not expose database details or stack traces.

### Order workflow

1. The browser sends product IDs, chosen options, and quantities to the quote endpoint.
2. The server reads current active products, checks combined quantities across variants, and returns canonical lines, totals, and a quote fingerprint.
3. The user reviews shipping details and the server total, then submits with a random idempotency key.
4. Inside a serializable transaction, the server checks address ownership, recalculates the quote, rejects changed prices/options, conditionally reduces stock, and saves the order/items/address.
5. Retrying the same request returns the existing order; reusing its key for different data is rejected. Client retries retain the key while the current review stays open.

Status flow: PENDING → PROCESSING → SHIPPED → DELIVERED. PENDING and PROCESSING can transition to CANCELLED, restoring stock in the same transaction. Terminal orders cannot reopen. Status labels model a demo workflow, not carrier integration.

Pricing: USD integer cents; $12 shipping unless subtotal is **strictly greater than $250**; illustrative tax rounded once at 8% of subtotal. The cart and server use the same pure calculator.

## Local development

Prerequisites: Node.js 22 LTS, npm, and PostgreSQL (Docker Compose example uses PostgreSQL 17). Use a dedicated development database.

On PowerShell, use `npm.cmd` and `npx.cmd` if execution policy blocks npm.ps1. Other shells can use npm/npx.

```powershell
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Edit .env: set DATABASE_URL and paste the generated AUTH_SECRET. Set AUTH_URL and NEXT_PUBLIC_APP_URL to the same origin (default http://localhost:3000). Optional SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD create an admin; use a unique password of 12–128 characters. There are no committed default admin credentials.

For Docker, also set POSTGRES_PASSWORD to the password used in DATABASE_URL, then:

```powershell
docker compose up -d db
npm.cmd ci
npm.cmd run db:deploy
npm.cmd run db:seed
npm.cmd run dev
```

For an existing PostgreSQL installation, create the database and configure DATABASE_URL, then run the npm commands above. Open http://localhost:3000; create a customer at /register, or log in with your seeded admin and visit /admin.

If a local .env already exists, preserve it rather than copying the example over it. This implementation session prepared an ignored .env and an isolated cluster under .local/pgdata on port 55432. Its generated admin credentials are in that local .env only. The machine's original PostgreSQL service/database was not modified.

On this prepared Windows workspace, start it again after a reboot with `npm.cmd run db:local:start`, then `npm.cmd run dev`. Stop the isolated database with `npm.cmd run db:local:stop`. These helpers only control the prepared `.local/pgdata` cluster; fresh clones should use either database setup above.

### Environment variables

| Variable                               | Purpose                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| DATABASE_URL                           | Server-only PostgreSQL connection URL; URL-encode special characters                   |
| AUTH_SECRET                            | Random secret with at least 32 bytes of entropy; keep stable across instances          |
| AUTH_URL                               | Canonical application origin for Auth.js and mutation-origin validation                |
| NEXT_PUBLIC_APP_URL                    | Public canonical origin for metadata, sitemap, robots; match AUTH_URL                  |
| POSTGRES_PASSWORD                      | Required only by the optional Docker Compose database                                  |
| SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD | Optional, paired values for first admin creation; remove from deployment after seeding |
| TEST_DATABASE_URL                      | Separate integration-test database whose name ends in _test                            |
| E2E_BASE_URL                           | Already-running app for Playwright, default http://localhost:3000                      |
| E2E_BROWSER_CHANNEL                    | Optional chrome or msedge to use a locally installed browser                           |

Prisma CLI and test scripts load .env. Next.js also supports .env.local; keep the database/auth values consistent if using both. Never commit .env files, passwords, session secrets, or test traces containing credentials.

### Migrations and seed

```powershell
npm.cmd run db:generate
npm.cmd run db:deploy
npm.cmd run db:seed
# After editing schema.prisma during development:
npm.cmd run db:migrate -- --name describe_your_change
npm.cmd run db:studio
```

The seed creates five categories and the twelve original catalog products. Re-running it does not reset sold stock, overwrite product edits, change existing admin passwords, or create fake orders/reviews. Product imagery is inherited illustrative Unsplash content, not a verified commercial product catalog.

## Verification

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
```

Unit tests cover pricing boundaries and rounding, cart merging/stock limits/storage validation, injected prices/roles, invalid variants and quantities, authorization rules, order transitions, redirect safety, and password hashing.

Create a **separate** PostgreSQL database (for example gstore_test), put its URL in TEST_DATABASE_URL, then:

```powershell
npm.cmd run db:test:migrate
npm.cmd run test:integration
```

Integration tests use real PostgreSQL, including competing buyers, duplicate submissions, stale quotes, address ownership, purchase snapshots, cancellation races, and database constraints. They create uniquely named fixtures and delete only their own records. They refuse the application database URL or a database without the _test suffix.

For browser tests, start the seeded app in another terminal. Configure a seeded admin via SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD; the suite fails clearly if these are absent.

```powershell
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Alternatively set E2E_BROWSER_CHANNEL=chrome or msedge to use an installed browser. The suite covers admin product CRUD/deactivation, customer registration and session persistence, cart persistence, checkout, order ownership, admin API denial, saved addresses, cancellation/restocking, logout, filters, and mobile/tablet/desktop overflow. Run against a disposable development app: it leaves identifiable e2e users/orders and deactivated e2e products for inspection. It never deletes existing business data.

## Deployment

Use a Node.js-capable Next.js host with persistent PostgreSQL, not a static export. Configure a production DATABASE_URL, AUTH_SECRET, and matching HTTPS origins. Use TLS for PostgreSQL, a least-privilege application role, backups, and an appropriate connection limit/pool for the host. Build with development dependencies installed so Prisma CLI and TypeScript are available.

```sh
npm ci
npm run db:deploy
npm run build
npm start
```

Run migrations once per release. Seed intentionally, not on every application boot. Prisma's generated client is produced by postinstall. Database-backed catalog routes are dynamic and do not require database content during prerendering. Google fonts are downloaded during builds; product images require access to images.unsplash.com.

Behind a reverse proxy, preserve the canonical origin and only trust proxy headers from your infrastructure. Do not blanket-enable AUTH_TRUST_HOST for untrusted incoming hosts. Align origin configuration before testing cookies and checkout. Configure perimeter abuse protection, monitoring, backups, and secret rotation before exposing a public demo.

## Deliberate limits and future work

- Simulated pay on delivery only. No payment processing, refunds, email, fulfillment, or real tax engine.
- US addresses, USD currency, and product-level stock; size/color inventory is a future extension.
- Local-device cart; no cross-device synchronization or stock reservation before placing an order. Prices can change between cart and review, and stale reviews are rejected.
- Email verification, password reset, OAuth, MFA, account deletion UI, and global session revocation are not implemented.
- Admin uses seeded categories; category CRUD, bulk imports, image uploads, and audit logs are future work. Image URLs are restricted to Unsplash.
- No customer reviews, wishlist, or newsletter backend. Decorative sample reviews and inactive controls were removed.
- Auth.js v5 is a pinned beta integration. Review upstream changes before upgrading.
- Run npm audit as part of maintenance. Remaining transitive tooling advisories and the exact verified checks are recorded in [docs/verification.md](docs/verification.md).

## Implementation references

The authentication follows [Auth.js Credentials](https://authjs.dev/getting-started/authentication/credentials). Transaction retry behavior follows [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions). See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for the repository-based plan written before implementation.
