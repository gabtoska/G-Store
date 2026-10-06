# Verification notes

Environment: Windows, Node.js 22.19, local PostgreSQL 13 in an isolated loopback-only cluster; application setup also includes a PostgreSQL 17 Docker Compose configuration. Checks are performed against the implementation, not mocked order storage.

## Automated checks

- Unit tests: pricing/free-shipping boundary, rounding, cart merging and aggregate stock, old-cart migration, malformed storage, injected prices/roles, validation, authorization, status transitions, safe redirects, password hashing, and the HTTP mutation boundary.
- PostgreSQL integration tests: idempotent concurrent submissions, last-unit contention, stale price rejection, option stock aggregation, address ownership/snapshots, exactly-once cancellation restocking, CHECK constraints, and rollback after stock mutation.
- Playwright: admin create/edit/deactivate, customer registration/login persistence, protected pages and APIs, persistent cart, checkout review and confirmation, saved addresses/order history, cross-account order denial, cancellation/restocking, logout, catalog filters, empty/not-found states, and viewport overflow at 390/768/1440 pixels.
- TypeScript, ESLint, committed migrations, repeatable seed, Prisma client generation, and Next.js production build.

## Dependency review

Compatible patches were installed. The lockfile is committed. `npm audit --omit=dev` reports **zero vulnerabilities** in this verification environment.

The full audit still reports **seven high-severity entries** from `braces` through `micromatch`, `fast-glob`, `chokidar`, Tailwind 3, and the Next ESLint tooling. These are development/build dependency paths, not application HTTP endpoints. Avoid compiling untrusted third-party source or glob patterns. The registry currently reports no patched `braces` release in the installed major; the automated proposed fix includes a Tailwind major upgrade. A deliberate build-tool migration remains future work rather than claiming the full audit is clean.

Overrides in package.json:

- `postcss`: use the patched direct dependency throughout the tree, including Next.js.
- `postcss-selector-parser` 7.1.6: patched selector parser; validated by the Tailwind/Next production build.
- `deepmerge-ts` 8.0.2: patched Prisma configuration merger. The v8 changes concern Map merging/type helpers; this repository's Prisma configuration uses plain objects. Prisma generation and migrations were exercised after the override. Revisit this override when Prisma updates its dependency.

See the upstream [deepmerge-ts v8 notes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0) and [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Audit counts can change as advisories are published; re-run the commands before deployment.

## Manual/browser inspection

Two pre-existing Unsplash URLs returned 404 and were removed from seed galleries. Product images now have a branded fallback for network failures. The remaining 32 unique seed image URLs returned successful responses during this run.

The Playwright Chromium download timed out in this environment, so acceptance checks use installed Google Chrome via `E2E_BROWSER_CHANNEL=chrome`. The standard Chromium option remains supported by the test configuration. Browser tests create test records in the configured app database; this run's test products are deactivated after use.

## Limits of verification

No public deployment, real payment, email delivery, carrier integration, accessibility audit, penetration test, or high-volume load test was performed. Automated responsive checks cover selected viewports and page layouts, not every browser/device. The PostgreSQL 17 Compose path is supplied for setup but was not executed here because Docker is not installed.
