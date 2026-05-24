# Allo Inventory System

A small monorepo containing an inventory & reservation API and a Next.js UI.

- Backend: `allo_api` (TypeScript, Express, Prisma)
- Frontend: `allo_ui` (Next.js, TypeScript, Tailwind)
- DB: PostgreSQL (Prisma schema in `prisma/`), optional Docker Compose for local dev

## Prerequisites

- Node.js 18+ (or LTS)
- pnpm (or npm/yarn)
- Docker & Docker Compose (recommended for local DB)

## Quick start (local)

1. Bring up services (database)
```bash
# from repo root (starts postgres if docker-compose is configured)
docker-compose up -d
```

2. Backend
```bash
cd allo_api
pnpm install
# run migrations (adjust if you use npm/yarn)
pnpm prisma migrate dev --name init
pnpm run dev
```

3. Frontend
```bash
cd ../allo_ui
pnpm install
pnpm run dev
```

4. Tests
```bash
# run tests from the relevant package
cd allo_api
pnpm test

cd ../allo_ui
pnpm test
```

## Useful scripts

- `pnpm run dev` — start development server
- `pnpm test` — run tests
- `pnpm prisma migrate dev` — create/apply migrations (backend)
- `docker-compose up -d` — start DB and required services

## Prisma / Database

- Schema is in `prisma/schema.prisma`.
- Seeders / migrations are in `prisma/migrations/`.
- If you need to reset locally:
```bash
cd allo_api
pnpm prisma migrate reset
pnpm prisma db seed
```

## Contributing

1. Create a branch: `git checkout -b feat/your-change`
2. Stage & commit:
```bash
git add .
git commit -m "feat: short description of change"
```
3. Push and open a PR:
```bash
git push origin feat/your-change
```

If you need to amend the top commit message before pushing, use:
```bash
git commit --amend -m "docs: add README"
git push --force-with-lease origin main
```

## Contact

If anything is unclear, open an issue or message the repo owner.
