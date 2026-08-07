# Fieldnote — Complete Application Documentation

**Fieldnote** is a local-first, cross-device notebook for fast capture during meetings, demos, and courses. It is a quiet, focused writing tool that saves notes locally as you type and syncs them to a server whenever a connection is available — no save button required.

This document describes what the application does end to end: its product goals, architecture, data model, synchronization engine, authentication, API surface, pages and flows, PWA behavior, design system, testing strategy, and deployment configuration.

---

## Table of Contents

1. [Product overview](#1-product-overview)
2. [Technology stack](#2-technology-stack)
3. [High-level architecture](#3-high-level-architecture)
4. [Data model](#4-data-model)
5. [Authentication & authorization](#5-authentication--authorization)
6. [The sync engine](#6-the-sync-engine)
7. [Save behavior](#7-save-behavior)
8. [API reference](#8-api-reference)
9. [Pages & user flows](#9-pages--user-flows)
10. [Public note sharing](#10-public-note-sharing)
11. [PWA & offline behavior](#11-pwa--offline-behavior)
12. [Theming & design system](#12-theming--design-system)
13. [Testing](#13-testing)
14. [Configuration & deployment](#14-configuration--deployment)
15. [Directory reference](#15-directory-reference)

---

## 1. Product overview

Fieldnote is positioned as a **digital field notebook**. The core workflow is:

> Capture a thought immediately (in a meeting, demo, or class), let it autosave, keep it organized with tags, find it later by search, and access the same notes from any device — with or without a connection.

Key product behaviors:

- **Instant capture**: The home page is a large quick-capture textarea. Typing creates and autosaves a note without pressing save (450 ms debounce).
- **Local-first**: All edits are written to an IndexedDB cache in the browser first and rendered immediately (optimistic UI). The server is only reached when online.
- **Offline capable**: The app is a PWA. Notes are readable offline from the local cache; edits made offline are queued and synced when connectivity returns.
- **Cross-device**: The same account sees the same notes on multiple devices/browsers through the server, which is the durable source of truth.
- **Last-write-wins**: A newer save replaces an earlier save for the same note. This keeps editing frictionless across devices.
- **Private sharing**: Any note can be published as a read-only, unlisted snapshot with a random unguessable link. Readers cannot browse the owner's other notes.

---

## 2. Technology stack

| Concern | Technology |
|---|---|
| Application framework | Nuxt 4 (Vue 3) — full-stack, file-based routing + Nitro server |
| Server runtime / API | Nitro (server routes in `server/api/**`) |
| Deploy target | Vercel (`nitro.preset: "vercel"`) |
| Server database | PostgreSQL via Neon (serverless) |
| ORM / query builder | Drizzle ORM + Drizzle Kit (migrations) |
| Offline storage | Dexie (IndexedDB wrapper) |
| Authentication | Better Auth (email/password + optional Google OAuth) |
| Validation | Zod (shared schemas) |
| Email delivery | Resend HTTP API (verification + password reset) |
| PWA | `@vite-pwa/nuxt` with Workbox |
| Icons | `@lucide/vue` |
| Testing | Vitest (unit) + Playwright (E2E) |
| Package manager / tooling | pnpm, ESLint, Prettier, TypeScript |

---

## 3. High-level architecture

The project is a single Nuxt application split into clear layers:

```
┌─────────────────────────── Client (browser) ───────────────────────────┐
│                                                                        │
│  Pages (app/pages)  ──>  Components (app/components)                   │
│         │                      │                                       │
│         └──────  Composables (app/composables)                         │
│                         │  │  │                                        │
│          ┌──────────────┘  │  └──────────────────┐                     │
│          │                 │                     │                    │
│  useNotes (state)    useConnection          Dexie local DB             │
│   │     │                (navigator.onLine)   (app/lib/local-db)       │
│   │     └── sync plugin (app/plugins/sync)   cachedNotes               │
│   └────────  $fetch API            pendingMutations                    │
│                 │                   syncMetadata                       │
└─────────────────┼──────────────────────────────────────────────────────┘
                  │ HTTP /api/*
┌─────────────────┼──────────────── Server (Nitro) ─────────────────────┐
│                 ▼                                                      │
│  middleware: request-context → security → auth-redirect               │
│                                                                        │
│  API routes (server/api)  ──>  services (server/services)             │
│                                   │                                    │
│                            repositories (server/repositories)         │
│                                   │                                    │
│                    Drizzle ORM → Neon PostgreSQL (server/database)     │
│                                                                        │
│  Auth: Better Auth handler at /api/auth/[...]                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Client layer

- **Pages** render and wire up components; they hold page-specific UI state.
- **Components** are mostly presentational. The two richest are `NoteEditor.vue` (autosaving markdown editor) and `AppShell.vue` (sidebar navigation shell).
- **Composables** encapsulate cross-cutting behavior:
  - `useNotes` — the heart of the client: in-memory note state, IndexedDB persistence, mutation queueing, and the sync loop.
  - `useConnection` — reactive online/offline state.
  - `useTheme` — light/dark/system theming with a cookie.
  - `usePwaInstall` — install prompt lifecycle.
  - `useQuickCapture` — global quick-capture summoning (⌘N) with request coordination across pages.
- **Plugins** start on the client:
  - `sync.client.ts` — initializes the sync engine on login and installs sync triggers (online, focus, visibility change, 30 s interval).
  - `pwa-install.client.ts` — captures the browser's install prompt.
- **Shared code** (`shared/`) is used by both client and server: Zod schemas, note/share types, and small pure utilities.

### Server layer

- **Middleware** runs on every request in order:
  1. `request-context` — assigns an `x-request-id`, logs one JSON line per request (method, path, status, duration).
  2. `security` — sets `Referrer-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and a restrictive `Permissions-Policy`.
  3. `auth-redirect` — for HTML document requests to protected pages, redirects unauthenticated users to `/login?redirect=...`.
- **API routes** are thin: validate input, call a service, return JSON.
- **Services** hold business logic (e.g., sanitizing tags, constructing share URLs).
- **Repositories** own database access via Drizzle.
- **Auth** is handled by the Better Auth handler mounted at `/api/auth/[...]`.

---

## 4. Data model

### 4.1 Server (PostgreSQL via Drizzle)

Schema defined in `server/database/schema.ts`; migrations in `drizzle/`.

#### Auth tables (managed by Better Auth)

| Table | Purpose |
|---|---|
| `user` | id, name, email (unique), `emailVerified`, image, timestamps |
| `session` | session id, `expiresAt`, unique `token`, `ipAddress`, `userAgent`, `userId` |
| `account` | linked OAuth/password accounts per provider (`providerId`, `accountId`, tokens, password hash) |
| `verification` | one-time verification tokens (email verification, password reset) with expiry |

#### Domain tables

**`notes`** — the core entity.

| Column | Notes |
|---|---|
| `id` | UUID, PK (client-generated so offline creates are idempotent) |
| `userId` | FK → user, cascade delete |
| `title` | text, default `""`, max 240 chars |
| `content` | text, markdown, max 250,000 chars |
| `createdAt` / `updatedAt` | timestamptz; `updatedAt` is server- or client-provided |
| `archivedAt` | nullable — set when archived |
| `deletedAt` | nullable — soft delete marker |
| `version` | integer, starts at 1, incremented on every mutation (optimistic concurrency) |

Indexes: `(userId, updatedAt)`, `(userId, archivedAt)`, `(userId, deletedAt)`.

**`tags`** — user-scoped tags deduplicated by a normalized key.

| Column | Notes |
|---|---|
| `id` | UUID, `gen_random_uuid()` |
| `userId` | FK → user |
| `name` | display name (case preserved) |
| `normalizedName` | lowercase, whitespace-collapsed, unique per `(userId, normalizedName)` |

**`note_tags`** — join table between notes and tags (composite PK).

**`note_shares`** — a read-only snapshot per shared note.

| Column | Notes |
|---|---|
| `noteId` | PK, FK → notes (one share per note) |
| `token` | 256-bit base64url random token, unique — the share link secret |
| `title`, `content`, `tags` | snapshot taken at creation time |
| `noteCreatedAt`, `noteUpdatedAt` | snapshot timestamps |

### 4.2 Local (Dexie / IndexedDB)

Database name: `fieldnote`. Four object stores defined in `app/lib/local-db.client.ts`:

| Store | Key | Contents |
|---|---|---|
| `cachedNotes` | `&id` (+ indexes on `userId`, `updatedAt`, `archivedAt`, `deletedAt`, `[userId+updatedAt]`) | full `Note` objects incl. `syncState` |
| `pendingMutations` | `&id` (+ indexes on `userId`, `entityId`, `createdAt`, `nextAttemptAt`, `[userId+createdAt]`) | queued writes to send to the server |
| `syncMetadata` | `&userId` | `{ userId, lastPulledAt, lastSyncedAt }` |

`clearLocalUserData(userId)` wipes all four stores for a user (used on sign-out so one browser can be reused by another account).

### 4.3 Shared types (`shared/types/note.ts`)

```ts
type SyncState = "local" | "pending" | "syncing" | "synced" | "error"
```

A `Note` carries `tags: string[]`, timestamps, `version`, and an optional `syncState` used only by the client UI. A `SyncMutation` describes one queued operation (`create | update | archive | restore | delete`) with its payload, attempt count, and `nextAttemptAt` backoff.

---

## 5. Authentication & authorization

Auth is powered by **Better Auth** configured in `server/utils/auth.ts`.

### Methods

- **Email + password** (always enabled). Requires email verification (`requireEmailVerification: true`).
- **Google OAuth** — only enabled when both `NUXT_GOOGLE_CLIENT_ID` and `NUXT_GOOGLE_CLIENT_SECRET` are set. The login/signup pages conditionally render "Continue with Google" based on `config.public.googleAuthEnabled`.

### Session behavior

- Sessions last 30 days, refreshed on activity each day (`updateAge`).
- Cookie caching enabled (5-minute cache) for performance.
- Password reset revokes existing sessions.

### Email delivery

Verification and reset emails go through `server/utils/email.ts` using **Resend** (`POST https://api.resend.com/emails`). In development, if `NUXT_RESEND_API_KEY` is absent, the email text is logged to the console instead of sent.

### Email flows

- **Sign up** → verification email → `autoSignInAfterVerification: true`.
- **Forgot password** → request-reset email with a time-limited link → `/reset-password?token=...` → choose a new password.

### Rate limiting

Better Auth rate limiting is enabled: 100 requests/60 s default, with stricter custom rules for `sign-in/email` (5/60 s), `sign-up/email` (5/60 s), and `request-password-reset` (3/300 s).

### Route protection

Two layers:

1. **Server middleware** (`server/middleware/auth-redirect.ts`) — for `GET`/`HEAD` HTML requests, redirects to `/login?redirect=<path>` when the path is protected and there is no session. Protected paths (from `shared/utils/auth.ts`): `/`, `/notes` and `/notes/*`, `/search`, `/archive`, `/settings`.
2. **Client middleware** — `app/middleware/auth.ts` protects the same pages for client-side navigation; `app/middleware/guest.ts` redirects authenticated users away from `/login`, `/signup`, `/forgot-password`, `/reset-password`.

API routes enforce auth via `requireUser(event)` (`server/utils/session.ts`), which reads the session from request headers and throws `401 Authentication required` when absent.

---

## 6. The sync engine

The sync engine (`app/composables/useNotes.ts`) implements the local-first model. The server is the durable source of truth; IndexedDB provides fast reads and offline writes.

### State machine of a note

```
local ──> pending ──> syncing ──> synced
   │                   │            │
   │                   └──> error ──┘   (transient failures, retried with backoff)
```

- `local` — created/edited while offline (or before the first sync).
- `pending` — awaiting upload.
- `synced` — in agreement with the server.

### Writes (optimistic)

Every mutation (`createNote`, `updateNote`, `changeArchiveState`, `deleteNote`) does the following:

1. Computes a new note locally (new UUID for creates, `version` preserved from the cached copy).
2. Writes it to `cachedNotes` and updates in-memory state immediately.
3. Queues a `SyncMutation` in `pendingMutations`. For `update` operations, any *previous* queued update for the same note is replaced (last-write-wins within a device).
4. Kicks off `sync()` (fire-and-forget).

This makes the UI feel instant regardless of connectivity.

### Reads

Notes in memory come from `cachedNotes`, hydrated on login via `loadFromCache`. `activeNotes` / `archivedNotes` are computed filters (non-deleted, non-archived / archived).

### The sync loop

`sync()` runs when triggered by the sync plugin:

- Triggered on: login, the `online` event, and after a changed note has been debounced and queued.
- Steps:
  1. Guard: must be client-side, have an active user, be online, and not already syncing.
  2. Load pending mutations ordered by `createdAt`.
  3. For each due mutation (respecting `nextAttemptAt` backoff), call `applyMutation`:
     - `create` → `POST /api/notes`
     - `update` → `PATCH /api/notes/:id`
     - `archive` / `restore` → `POST /api/notes/:id/archive|restore`
     - `delete` → `DELETE /api/notes/:id`
  4. On success: remove the mutation from the queue and update the cached note with the server's response (`version` and timestamps), setting `syncState: "synced"`.
  5. On errors: increment `attempts`, set `nextAttemptAt` with exponential backoff (`2s → 5s → 15s → 60s → 5m`), set a sync error message, and stop this pass.
  6. A note save does not fetch the full collection: the mutation response updates only that cached note. Full pulls run on initial load and when connectivity returns.
  7. If mutations remain, schedule another pass in 250 ms.

### Pull details

`pullRemoteNotes` pages through `GET /api/notes?limit=100&cursor=...` until `nextCursor` is null. Remote notes are written into `cachedNotes` with `syncState: "synced"` only when the note is not in the pending set. It updates `lastSyncedAt` / `lastPulledAt` in `syncMetadata`.

---

## 7. Save behavior

The editor is rich text and only emits a save after typing has paused for 700 ms. Title and tag changes follow the same debounce. A blur, navigation, or hidden tab flushes a real pending edit, but idle notes do not create sync traffic.

The server does not reject stale versions: writes are applied in the order it receives them, so the latest completed save is the durable version.

---

## 8. API reference

All endpoints live under `/api`. Mutating endpoints require a session; they return `401` otherwise. Shared Zod schemas validate all inputs (`shared/schemas/note.ts`).

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | `{ status: "ok", service: "fieldnote", timestamp }` |

### Session / user

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/me` | ✓ | Current user `{ id, name, email, image, emailVerified }` |
| ALL | `/api/auth/[...]` | varies | Better Auth handler (sign-in, sign-up, sessions, verification, reset) |

### Notes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notes` | ✓ | Cursor-paginated list. Query: `cursor?`, `limit` (1–100, default 40), `archived` (`true`/`false`), `tag?`. Returns `{ notes, nextCursor }` ordered by `updatedAt desc`. |
| POST | `/api/notes` | ✓ | Create. Body: `{ id?, title?, content?, tagNames?, clientUpdatedAt? }`. Idempotent via `ON CONFLICT DO NOTHING` (safe for offline retries). Returns `201 { note }`. |
| GET | `/api/notes/:id` | ✓ | Single note or `404`. |
| PATCH | `/api/notes/:id` | ✓ | Update title/content/tags. Body requires at least one field. Returns `{ note }`. |
| DELETE | `/api/notes/:id` | ✓ | Soft delete (sets `deletedAt`). Returns `204`. |
| POST | `/api/notes/:id/archive` | ✓ | Archive. Returns `{ note }`. |
| POST | `/api/notes/:id/restore` | ✓ | Restore from archive. Same contract as archive. |
| GET | `/api/search` | ✓ | Query `q` (1–200 chars), `limit`. Searches title + content (ILIKE) and tags. Returns `{ notes }`. |
| GET | `/api/tags` | ✓ | Tag list for the user with usage counts: `{ tags: [{ id, name, count }] }`. |

### Sharing

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notes/:id/share` | ✓ | Fetch existing share for the note (`{ share }` or `{ share: null }`). Cache-Control: `private, no-store`. |
| POST | `/api/notes/:id/share` | ✓ | Create share link. Returns `{ share: { url, createdAt, noteUpdatedAt, isStale } }`. Idempotent. |
| PATCH | `/api/notes/:id/share` | ✓ | Refresh the existing public snapshot from the current note while preserving its URL. Returns the refreshed share. |
| DELETE | `/api/notes/:id/share` | ✓ | Revoke the share. Returns `204`. |
| GET | `/api/public/notes/:token` | — | Read the public snapshot. Returns `{ note: PublicNote }` or `404`. Sets `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex, nofollow, noarchive`. |

### Notes on server-side mutations

- **Creates** accept a client-generated UUID and honor `clientUpdatedAt` (so offline-created notes keep their local ordering/timestamps). The insert uses `onConflictDoNothing`; if the row already exists the existing note is returned (idempotent retry).
- **Updates** use the server receipt time for `updatedAt` and always bump `version` via `version + 1`; there is no version gate, so the latest save wins.
- **Tags** are replaced wholesale on each update via `replaceTags` (delete joins, upsert tag rows by `(userId, normalizedName)`, re-insert joins).

---

## 9. Pages & user flows

### 9.1 `/` — Quick Capture (home)

Protected. Greets the user by first name (time-of-day greeting), then offers:

- A **quick-capture textarea** with a 450 ms autosave debounce. The first keystroke creates a note (via `createNote`), subsequent edits update it. `⌘/Ctrl+Enter` or "Open full page" opens it in the editor. Blur also saves.
- **Recently touched** — the 5 most recently updated active notes.
- **Notebook glance** — active note count and unique tag ("threads") count.
- Empty state prompting the first note.
- `?capture=1` (PWA shortcut "Capture a note") or ⌘N summons and focuses the capture field.

### 9.2 `/notes` — All notes

Protected. Lists all active notes (newest first) with derived titles, previews, tags, and relative timestamps. Supports:

- **Tag filter chips** derived from the notes in memory.
- **New note** button → creates and navigates into the editor.
- Empty states for the notebook and for a tag with no matches.

### 9.3 `/notes/:id` — Note editor

Protected. Renders `NoteEditor`:

- **Autosave** — title, content, and tags (comma-separated input) are saved after a 700 ms debounce, on blur, on `Escape`, on visibility hidden, and on unmount. A local draft is kept while a sync response is in flight so typing is never clobbered.
- **Markdown toolbar + shortcuts** — heading, bold (also `⌘B`), bullet list, checklist, inline code. Bold wraps the selection.
- **Focus mode** (`⌘⇧F`) — full-screen distraction-free writing; `Escape` exits.
- **Editor actions** — back to list, share (opens share dialog), archive/restore, and delete (confirm dialog → soft delete → navigates away).
- **Sync status label** — "Saved on this device" / "Autosaved".
- The page redirects to `/notes` if the note is not found after ready.

### 9.4 `/search` — Search

Protected. A large centered search input with instant client-side filtering across **title, content, and tags** (case-insensitive substring). Query is mirrored into the URL (`?q=`) so searches are shareable/bookmarkable. Shows match count, a decorative result-index, `Esc` clears, and empty states.

> Note: search is instant over the locally cached notes; there is also a server-side `/api/search` for the same purpose.

### 9.5 `/archive` — Archive

Protected. Lists archived (non-deleted) notes, newest first, with an empty state. Notes can be restored from the editor.

### 9.6 `/settings` — Settings

Protected. Three sections:

1. **Appearance** — theme picker: Light / Dark / System (persisted in the `fieldnote-theme` cookie, applied with a View Transition where supported).
2. **Account** — change password (requires current password, new password 8–128 chars; revokes other sessions on success). Shows the account email.
3. **Install** — PWA install button/instructions (see §11).

### 9.7 Auth pages

- `/login` — email+password sign-in (with `rememberMe`), forgot-password link, optional Google. Respects `?redirect=` and returns the user there after sign-in.
- `/signup` — name/email/password, email verification message, optional Google.
- `/forgot-password` — request a reset link (does not leak account existence).
- `/reset-password` — set a new password from `?token=`; success redirects to `/login?reset=1`.

### 9.8 `/share/:token` — Public shared note

Public (no auth, no app layout). Renders the read-only snapshot from `/api/public/notes/:token`: title, creation date, tags, and content (preserved whitespace). Branded header marks it "READ ONLY". If the token is invalid/revoked, shows a "This note is no longer shared" state. Fully `noindex`.

---

## 10. Public note sharing

Sharing is **snapshot-based and unlisted**:

- The owner opens the share dialog from the editor. The dialog explains the note must be synced first (shares are created from the server copy), then `POST /api/notes/:id/share`.
- The server stores a one-time snapshot (title/content/tags + timestamps) in `note_shares` with a 256-bit base64url random token — effectively unguessable. A note can have at most one share.
- The dialog shows the full URL (`<origin>/share/<token>`), copy button, snapshot status, and a **Revoke link** action that deletes the snapshot. If the note is newer than the snapshot, it offers **Update shared note**; refreshing keeps the same URL and publishes the latest title, content, and tags. Revoking makes the token 404 immediately.
- Readers see only that note's snapshot — no navigation to the rest of the notebook.
- Security headers on the public page: `no-referrer`, `noindex/nofollow/noarchive`, and a restrictive `Permissions-Policy`.

---

## 11. PWA & offline behavior

Configured via `@vite-pwa/nuxt` in `nuxt.config.ts`.

### Manifest

- Name/description: "Fieldnote", "A quiet, local-first notebook that follows you across devices."
- `display: standalone`, `theme_color: #1d4ed8`, `background_color: #f4efe5`.
- Icons (192 & 512, `any` and `maskable` purposes).
- **Shortcut**: "Capture a note" → `/?capture=1` (deep-links into quick capture).

### Service worker (Workbox)

- `registerType: "prompt"` — the app controls install prompting via `usePwaInstall`.
- Pre-caches JS/CSS/HTML/ico/png/svg/ttf/woff2.
- `navigateFallback: "/"` for app shell navigation, but a **denylist on `/api/*`** — API responses are never cached by the service worker; all offline data comes from Dexie.
- `cleanupOutdatedCaches: true`.

### Install experience

- `InstallButton` in the sidebar and Settings; `InstallPromptBanner` in the shell.
- On iOS/Safari (no install prompt API), the UI shows manual instructions ("Share → Add to Home Screen", "File → Add to Dock").
- State tracked via `usePwaInstall`: installed detection (`display-mode: standalone`), deferred prompt capture, install outcome, banner dismissal (sessionStorage).

### Offline behavior summary

- Service worker serves the app shell offline.
- Notes read from IndexedDB.
- Edits queue as `pendingMutations`; `sync()` runs on reconnect (online event / focus / visibility / interval), then pulls server state.
- The `SyncIndicator` surfaces "Offline · saved locally", "Syncing changes", "All changes saved", or an error state.

---

## 12. Theming & design system

Design language: a calm, paper-and-ink aesthetic ("a quiet notebook").

### Visual identity

- **Warm paper backgrounds** (`#f4efe5` light, `#151815` dark), serif body type (Noto Serif), mono accents (Source Code Pro) for eyebrows, timestamps, and metadata.
- Accent blue `#1d4ed8` (light) / `#85a7ff` (dark); olive secondary; semantic `danger`/`success` tokens.
- "Paper" cards with soft shadows and organic mark elements (rotated circular logos, quill marks).
- Design tokens defined as CSS custom properties in `app/assets/css/main.css`; dark mode flips the tokens under `:root[data-theme="dark"]`.

### Theming behavior

- `useTheme` reads a `fieldnote-theme` cookie (`light | dark | system`). System resolves via `prefers-color-scheme`.
- An inline critical script in `app.vue` applies the theme before first paint to avoid flash.
- Theme changes use the View Transitions API (with a `theme-selection` view-transition name on the selected check) when available and `prefers-reduced-motion` is respected.

### Motion & accessibility

- Route transitions are directional (forward/back based on a route "rank").
- Note list rows enter/leave/move with staggered transitions.
- `prefers-reduced-motion` globally disables animation and transitions.
- Focus-visible outlines, `sr-only` labels, aria-live sync status, semantic headings, and labeled icon buttons throughout.

---

## 13. Testing

### Unit tests (Vitest, `tests/unit`)

- `note-utils.test.ts` — title derivation, tag normalization/dedup, note preview.
- `note-schema.test.ts` — Zod schemas: defaults, required-field rules, limits, share-token format.
- `auth-routing.test.ts` — which paths are protected vs. public.
- `password-input.test.ts`, `tag-chip.test.ts` — component behavior (happy-dom).

Run: `pnpm test` (`vitest run`).

### E2E tests (Playwright, `tests/e2e`)

- `auth.spec.ts` — protected pages redirect pre-render; sign-in page renders; password visibility toggle; mobile sign-up.
- `sync.spec.ts` — two browser contexts sign into the same seeded account; a note captured on the first appears on the second after reload (skipped unless `E2E_TEST_EMAIL`/`E2E_TEST_PASSWORD` are set).

Runs against Chromium and iPhone-14 projects; the dev server is bootstrapped automatically (`pnpm dev --host 127.0.0.1`) unless `E2E_BASE_URL` is provided.

Run: `pnpm test:e2e` (`playwright test`).

### Quality commands

```bash
pnpm typecheck    # nuxt typecheck
pnpm lint         # eslint .
pnpm format       # prettier --write .
pnpm format:check # prettier --check .
```

---

## 14. Configuration & deployment

### Environment variables (see `.env.example`)

| Variable | Purpose |
|---|---|
| `NUXT_DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `NUXT_BETTER_AUTH_SECRET` | Better Auth secret (≥32 random chars) |
| `NUXT_BETTER_AUTH_URL` | Public base URL (default `http://localhost:3000`) |
| `NUXT_GOOGLE_CLIENT_ID` | Google OAuth client id (optional) |
| `NUXT_GOOGLE_CLIENT_SECRET` | Google OAuth secret (optional) |
| `NUXT_RESEND_API_KEY` | Resend API key for auth email (optional in dev) |
| `NUXT_EMAIL_FROM` | From address for auth email |

### Database

- Local/CI default connection: `postgresql://fieldnote:fieldnote@127.0.0.1:5432/fieldnote`.
- Migrations via Drizzle Kit: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`.

### Deployment

- Nitro preset is **Vercel**; `.vercel/` contains the output config.
- `NUXT_BETTER_AUTH_URL` must match the deployed origin (it is also used as a trusted origin).

### Local development

```bash
pnpm install
cp .env.example .env   # then fill in NUXT_DATABASE_URL and secrets
pnpm db:migrate
pnpm dev
```

---

## 15. Directory reference

```
app/
  app.vue                  Root component: theme init script, page transitions
  app.config.ts            App name/description config
  assets/css/main.css      Design tokens, base styles, shared components
  components/              UI components (AppShell, NoteEditor, NoteList, SyncIndicator,
                           NoteShareDialog, AuthPanel, install/PWA bits, …)
  composables/             useNotes (sync engine), useConnection, useTheme,
                           usePwaInstall, useQuickCapture
  layouts/                 default (app shell) and auth (branded center panel)
  lib/                     auth-client (Better Auth), local-db.client (Dexie)
  middleware/              auth (redirect to login), guest (redirect away when authed)
  pages/                   index (capture), notes/index, notes/[id], search, archive,
                           settings, login, signup, forgot-password, reset-password,
                           share/[token]
  plugins/                 sync.client, pwa-install.client
server/
  api/                     Nitro route handlers (auth, me, health, notes, search, tags,
                           public shares)
  database/                drizzle client + schema
  middleware/              request-context, security, auth-redirect
  repositories/            notes, note-shares (DB access)
  services/                notes, note-shares (business logic)
  utils/                   auth (Better Auth config), session, email (Resend)
shared/
  schemas/note.ts          Zod schemas for the API
  types/note.ts, note-share.ts   Shared TypeScript types
  utils/note.ts, auth.ts   Pure helpers (tags, title derivation, route protection)
tests/
  unit/                    Vitest unit tests
  e2e/                     Playwright end-to-end tests
drizzle/                   SQL migrations + snapshots
```
