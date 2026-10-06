# G-Store implementation plan

The existing application uses Next.js 15 App Router, React 19, Tailwind, reusable storefront components, and a Context/reducer cart persisted to local storage. Catalog pages and API handlers import `src/lib/products.ts`; checkout currently changes only client state. There is no database, authentication, or test infrastructure.

1. Preserve the existing visual system and components. Move the twelve existing products into development seed data and add PostgreSQL/Prisma models and migrations.
2. Introduce Auth.js credentials authentication, password hashing, registration validation, account pages, and database-backed role checks.
3. Query the database from server pages and catalog APIs. Retain category, collection, search, sorting, gallery, and cart interactions; validate persisted cart data and stock limits.
4. Add server-priced order review and idempotent, transactional order placement. Snapshot purchased products and shipping information. Use explicitly simulated pay-on-delivery only.
5. Add protected admin product CRUD/deactivation and order status management, including safe stock restoration on cancellation.
6. Test pricing, validation, cart and authorization rules, then PostgreSQL transactions and browser flows. Run lint, TypeScript, migrations, and production build. Document real capabilities, setup, and limitations.

Architecture: existing UI → App Router pages/REST handlers → authorization and Zod validation → services/repositories → Prisma → PostgreSQL. Shared pure business rules serve both cart estimates and server pricing. The database is authoritative for identity, price, stock, and orders.
