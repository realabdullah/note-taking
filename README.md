# Fieldnote

Fieldnote is a local-first, cross-device notebook built for fast capture during meetings, demos, and courses.

## Stack

- Nuxt 4 and Vue 3
- Neon PostgreSQL and Drizzle ORM
- Better Auth
- Dexie for offline storage and synchronization
- Vite PWA
- Vitest and Playwright

## Setup

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm dev
```

Create a Neon database and add its pooled connection string to `NUXT_DATABASE_URL`.

Authentication email delivery uses Resend's HTTP API. In development, verification and password-reset links are logged when no Resend key is configured.

Google login is enabled when both Google OAuth environment variables are present.

## Commands

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm db:generate
pnpm db:migrate
```

## Sync model

PostgreSQL is the durable source of truth. Notes are mirrored to IndexedDB and edits are queued locally before being synchronized. API responses are never cached by the service worker; offline note access is owned by Dexie.
