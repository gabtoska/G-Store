# G Store

High-end, modern fashion e-commerce built with Next.js, TypeScript, and Tailwind CSS.

Tagline: **Dress like a G**.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Local state cart engine with persistence
- API routes for product catalog

## Experience Included

- Premium homepage with strong visual identity and motion
- Fully responsive storefront design
- Shop catalog with search, category/collection filters, and sorting
- Product detail pages with gallery, options, and related products
- Cart drawer + cart page with quantity controls and pricing calculations
- Checkout flow with order summary and confirmation state
- Structured component system for scalable UI development

## Run Locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` - start local development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - lint with Next.js rules
- `npm run typecheck` - run TypeScript checks

## Project Structure

```text
src/
  app/
    api/products/
    cart/
    checkout/
    shop/
  components/
    cart/
    home/
    layout/
    shop/
    ui/
  lib/
```

## Notes

- Product data is currently seeded in `src/lib/products.ts`.
- Cart state persists in browser local storage.
- API endpoints:
  - `GET /api/products`
  - `GET /api/products/[slug]`

## Next Production Steps

1. Connect real database (PostgreSQL + Prisma).
2. Add authentication (NextAuth/Auth.js).
3. Integrate payments (Stripe Checkout or custom Payment Intents).
4. Add CMS integration for collections/editorial content.
5. Add test suite (unit + integration + e2e).
