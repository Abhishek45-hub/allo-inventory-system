# allo_api

Production-grade API for Allo inventory reservation.

## Tech Stack
- Node.js + Express + TypeScript
- PostgreSQL with Prisma
- Redis (idempotency and cache-ready)
- JWT + refresh token flow + RBAC
- Zod validation, pino logging, rate limit, helmet, compression, CORS

## Setup
1. Copy `.env.example` to `.env`
2. Install dependencies:
   - `pnpm install`
3. Generate Prisma client:
   - `pnpm prisma:generate`
4. Run migrations:
   - `pnpm prisma:migrate`
5. Seed base data:
   - `pnpm prisma:seed`
6. Start API:
   - `pnpm dev`

## Concurrency Safety
Reservation creation uses:
- PostgreSQL transaction with `Serializable` isolation
- `SELECT ... FOR UPDATE` row lock for inventory tuple `(productId, warehouseId)`
- Atomic increment of `reservedQuantity` and reservation insert in one transaction

Guarantee: if two clients race for last unit, only one transaction commits and the other receives `409`.

## Endpoints
- `GET /api/products`
- `GET /api/warehouses`
- `POST /api/reservations`
- `POST /api/reservations/:id/confirm`
- `POST /api/reservations/:id/release`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

## Expiry Strategy
- `node-cron` job executes every minute
- Releases all expired pending reservations using transaction-protected logic

Tradeoff:
- Simple ops model, eventual release within minute granularity
- For high throughput, move to queue workers and partition expiry scans

## Tests
- `pnpm test`
- `pnpm test:concurrency`

## CI/CD
- Workflow: `.github/workflows/ci.yml`
- Semantic release config: `.releaserc.json`
