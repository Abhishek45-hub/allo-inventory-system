# Allo UI

Next.js App Router frontend for Allo inventory reservation and checkout lifecycle.

## Architecture Overview
- Framework: Next.js + React + TypeScript
- State: Zustand (auth + reservation state)
- Data fetching: TanStack Query + Axios
- UI: Tailwind + reusable UI components

## Core User Flows
- Product listing with per-warehouse availability
- Reserve stock from product cards
- Open reservation checkout by reservation ID
- Countdown-based reservation expiry visibility
- Confirm purchase (reservation confirm)
- Cancel reservation (release)

## Auth and Route Protection
- Login updates auth store and sets `access_token` cookie
- Next middleware protects app routes from unauthenticated access
- Client auth guard redirects users to login after hydration if session is missing
- Axios interceptor attaches Bearer token and handles token refresh on `401`

## Setup
```bash
pnpm install
pnpm dev
```

## Environment Variables
- `NEXT_PUBLIC_API_URL` (required)
- `NEXT_PUBLIC_RESERVATION_TTL_MINUTES` (optional)

## Quality Checks
```bash
pnpm lint
pnpm format
pnpm build
pnpm test
```

## Notes
- Reservation actions surface backend `409` (conflict) and `410` (expired) scenarios through user feedback.
- Frontend expects backend reservation APIs to be authenticated and idempotent.
