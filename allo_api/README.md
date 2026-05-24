# allo_api

Concurrency-safe inventory reservation API for Allo order fulfillment.

## Architecture Overview
- Framework: Express + TypeScript
- Database: PostgreSQL via Prisma
- Cache/Idempotency accelerator: Redis (optional, DB fallback enabled)
- Auth: JWT access + refresh tokens
- Validation: Zod request schemas
- Observability and hardening: pino logging, helmet, rate limiting, CORS

Core layers:
- Controllers: HTTP contract and status codes
- Services: business rules and transaction orchestration
- Repositories: database access and row-level lock primitives
- Middleware: auth, validation, idempotency, error handling

## Data Model
Primary entities:
- `Product`
- `Warehouse`
- `Inventory` (warehouse-scoped stock)
- `Reservation`
- `IdempotencyKey`

Reservation statuses:
- `PENDING`
- `CONFIRMED`
- `RELEASED`

Inventory safety constraints are enforced at DB level:
- `totalQuantity >= 0`
- `reservedQuantity >= 0`
- `reservedQuantity <= totalQuantity`
- `Reservation.quantity > 0`

## Concurrency Strategy
Reservation creation and lifecycle updates run in PostgreSQL `SERIALIZABLE` transactions with retry on serialization conflicts.

Critical guarantees:
- Reservation uses `SELECT ... FOR UPDATE` on inventory row (`productId`, `warehouseId`)
- Stock mutation and reservation row write occur atomically in one transaction
- Expired pending reservations for the target inventory are released lazily inside the same transaction before availability check
- Final conflict returns `409` after retry budget if concurrent write conflict persists

Result:
- No overselling
- Last-unit race yields exactly one success and one `409`

## Expiry Strategy
Dual strategy:
- Background cron (`*/1 * * * *`) releases expired pending reservations in batches
- Lazy expiry release runs during new reservation flow for the same inventory tuple

Why both:
- Cron ensures eventual cleanup globally
- Lazy release minimizes false stock exhaustion between cron ticks

## Idempotency
`Idempotency-Key` is supported for:
- `POST /api/reservations`
- `POST /api/reservations/:id/confirm`

Behavior:
- Duplicate retry with same key + same payload returns original response
- Reuse of same key with different payload returns `409`
- Redis is used for fast replay cache when available
- Database `IdempotencyKey` table provides durable fallback

## API Endpoints
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/products`
- `GET /api/warehouses`
- `GET /api/reservations/:id` (auth required)
- `POST /api/reservations` (auth + idempotency)
- `POST /api/reservations/:id/confirm` (auth + idempotency)
- `POST /api/reservations/:id/release` (auth)

## Setup
```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

## Environment Variables
Required:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Optional:
- `REDIS_URL` (if omitted, DB-backed idempotency fallback is used)
- `CORS_ORIGIN`
- `RESERVATION_TTL_MINUTES`

## Testing
```bash
pnpm test
pnpm test:concurrency
```

Coverage includes:
- health endpoint
- authenticated reservation flows
- idempotent replay
- expired confirm returns `410`
- last-unit race conflict (`201` + `409`)

## Production Deployment Notes (Vercel)
- `postinstall` runs `prisma generate` for Linux build artifacts
- Apply migrations before traffic:
```bash
pnpm prisma:deploy
```
- Prisma `P1000` indicates invalid DB credentials in `DATABASE_URL`

### Deploying to Vercel (important caveats)

- Vercel does not run long-lived Node servers that listen on a port. This Express app expects a persistent process and therefore is not directly compatible with Vercel Serverless Functions without refactoring into serverless handlers.
- Recommended approaches:
	1. Deploy the API to a platform that supports long-running Node processes or Docker (Render, Railway, Fly, or a VPS). Deploy the UI to Vercel as usual.
	2. If you must use Vercel for the API, refactor the app into serverless functions (significant work): export individual route handlers as Vercel Serverless Functions and remove the Express listen loop.

	### Recommended: deploy the API to a Docker-friendly PaaS (Render / Railway / Fly)

	This repository is an Express app that expects a long‑running Node process (it calls `app.listen`). Vercel's serverless model returns `404` for that approach. To run the API unchanged, deploy it as a container or to a service that supports long‑running Node processes.

	Option A — Deploy with Docker (Render/Railway/Fly):

	1. I added a `Dockerfile` that builds the project and starts `dist/server.js`.
	2. Create a new Web Service on Render (or similar) and connect the Git repo. Use the Docker option and point to the repo root or `allo_api` folder if you deploy just the API.
	3. Configure environment variables in the PaaS dashboard (required): `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, optional: `REDIS_URL`.
	4. After deployment, run Prisma migrations against your production DB (from a machine that can reach the DB):
	```bash
	npx prisma migrate deploy --schema=prisma/schema.prisma
	```

	Option B — Refactor for Vercel (advanced):

	- Convert Express routes into Vercel Serverless Functions or use a framework that supports serverless deployments. This requires non-trivial refactoring; I can help with a plan if you want to pursue this.

	If you want, I can prepare a `render.yaml` for automatic Render deployments or help you deploy the current project to Render now — tell me which provider you prefer and I will prepare the exact steps and CI commands.

## Operational Recommendations
- Move expiry processing to queue workers for very high throughput
- Add metrics/alerts for conflict rate, release lag, and idempotency table growth
- Periodically prune expired `IdempotencyKey` rows
