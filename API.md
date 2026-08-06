# Fieldnote API — Integrator Guide

Fieldnote exposes a small, read-only HTTP API for external applications. It is intended for tools that want to read a user's notes programmatically (personal automation, dashboarding, second brains, etc.) without ever handling the user's password.

Base URL: `https://notes.abdspace.xyz`

All requests and responses are JSON (`Content-Type: application/json`).

---

## Table of contents

1. [Getting access](#1-getting-access)
2. [Authentication](#2-authentication)
3. [Read endpoints](#3-read-endpoints)
4. [Reference: data shapes](#4-reference-data-shapes)
5. [Errors](#5-errors)
6. [Example integrations](#6-example-integrations)
7. [Notes & limitations](#7-notes--limitations)

---

## 1. Getting access

Personal access tokens (PATs) are created inside the web app — there is intentionally no way to mint one over the API.

1. Sign in at `https://notes.abdspace.xyz/login`.
2. Go to **Settings → Personal access tokens**.
3. Give the token a name (e.g. `Personal OS`) and, optionally, an expiry.
4. Click **Generate token**.
5. **Copy the token immediately** — Fieldnote stores only a SHA-256 hash of it and cannot show it again.

The token is a 256-bit base64url string (43 characters, e.g. `aB3xYz91Qm0Wl3...`). Treat it like a password: anyone holding it can read the owning account's notes.

You can revoke a token at any time from the same Settings section. Revocation takes effect immediately — the next request with that token returns `401`.

---

## 2. Authentication

Send the token in the `Authorization` header using the Bearer scheme:

```
Authorization: Bearer <token>
```

```bash
curl -H "Authorization: Bearer <token>" \
  https://notes.abdspace.xyz/api/notes
```

### Scope of bearer tokens

Bearer tokens are **read-only** and work on exactly four endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/notes` | GET | List / paginate notes |
| `/api/notes/:id` | GET | Fetch a single note |
| `/api/search` | GET | Search title, content, and tags |
| `/api/tags` | GET | List tags with usage counts |

Every other authenticated endpoint (and any `POST`/`PATCH`/`DELETE` on notes) requires the browser session cookie used by the web app and returns `403 Forbidden` to bearer-authenticated requests.

### Missing or invalid credentials

| Situation | Response |
|---|---|
| No `Authorization` header | `401 { "statusCode": 401, "statusMessage": "Authentication required" }` |
| Unknown, revoked, or malformed token | `401` |
| Expired token | `401` |
| Valid token on a write endpoint | `403 { "statusCode": 403, "statusMessage": "Personal access tokens are read-only" }` |

Each successful authenticated request updates the token's `lastUsedAt`, visible in the web app.

---

## 3. Read endpoints

### 3.1 `GET /api/health`

Unauthenticated health check.

```bash
curl https://notes.abdspace.xyz/api/health
```

```json
{ "status": "ok", "service": "fieldnote", "timestamp": "2026-08-03T12:00:00.000Z" }
```

### 3.2 `GET /api/notes` — list notes

Returns the user's non-deleted notes, newest-first, with cursor-based pagination. **Archived notes are excluded unless `archived=true`.**

Query parameters (all optional):

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `limit` | integer | `40` | Page size, `1–100` |
| `cursor` | string | — | ISO-8601 `updatedAt` value from the previous response's `nextCursor` |
| `archived` | `"true"` / `"false"` | `"false"` | When `true`, returns archived notes instead of active ones |
| `tag` | string | — | Filter to notes carrying this tag (case-insensitive, normalized) |

```bash
curl -H "Authorization: Bearer <token>" \
  "https://notes.abdspace.xyz/api/notes?limit=100"
```

```json
{
  "notes": [
    {
      "id": "4f8b7a4a-...-uuid",
      "userId": "user_2abc...",
      "title": "Architecture review",
      "content": "## Notes\nFollow up on the migration plan.",
      "tags": ["meetings", "work"],
      "createdAt": "2026-07-20T09:14:00.000Z",
      "updatedAt": "2026-07-21T15:02:11.000Z",
      "archivedAt": null,
      "deletedAt": null,
      "version": 3
    }
  ],
  "nextCursor": "2026-07-21T15:02:11.000Z"
}
```

**Pagination:** keep requesting with `cursor` set to the previous `nextCursor` until it comes back `null`. `nextCursor` is the `updatedAt` of the last note on the page.

### 3.3 `GET /api/notes/:id` — fetch a note

```bash
curl -H "Authorization: Bearer <token>" \
  https://notes.abdspace.xyz/api/notes/4f8b7a4a-...-uuid
```

```json
{ "note": { "id": "4f8b7a4a-...-uuid", "title": "Architecture review", "content": "...", "tags": [], "createdAt": "...", "updatedAt": "...", "archivedAt": null, "deletedAt": null, "version": 3, "userId": "user_2abc..." } }
```

Returns `404` if the note does not exist, belongs to another user, or was deleted.

### 3.4 `GET /api/search` — search notes

Query parameters:

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `q` | string | *(required)* | `1–200` characters. Case-insensitive substring match on title, content, and tags |
| `limit` | integer | `40` | `1–100` |

```bash
curl -H "Authorization: Bearer <token>" \
  "https://notes.abdspace.xyz/api/search?q=migration&limit=20"
```

```json
{ "notes": [ { "id": "...", "title": "...", "content": "...", "tags": [], "createdAt": "...", "updatedAt": "...", "archivedAt": null, "deletedAt": null, "version": 1, "userId": "user_2abc..." } ] }
```

### 3.5 `GET /api/tags` — list tags

```bash
curl -H "Authorization: Bearer <token>" \
  https://notes.abdspace.xyz/api/tags
```

```json
{ "tags": [ { "id": "6c1e...-uuid", "name": "meetings", "count": 12 } ] }
```

### 3.6 `GET /api/public/notes/:token` — public shared note

Unauthenticated, read-only snapshot of a note published via the web app's **Share** dialog. The 43-character token is unguessable; the page/API is `noindex` and never cached.

```bash
curl https://notes.abdspace.xyz/api/public/notes/aB3xYz91Qm0Wl3...
```

```json
{ "note": { "title": "Architecture review", "content": "...", "tags": ["meetings"], "createdAt": "...", "updatedAt": "..." } }
```

Returns `404` when the token is invalid or the share was revoked.

---

## 4. Reference: data shapes

### `Note`

```ts
{
  id: string            // UUID
  userId: string        // owner's account id
  title: string         // up to 240 chars, may be "" (title is derived from content)
  content: string       // markdown, up to 250,000 chars
  tags: string[]        // display-cased tag names
  createdAt: string     // ISO-8601
  updatedAt: string     // ISO-8601 (drive pagination off this)
  archivedAt: string | null
  deletedAt: string | null  // always null in API responses (deleted notes are hidden)
  version: number       // optimistic-concurrency counter, starts at 1
}
```

Notes are **soft-deleted** — a deleted note simply disappears from the API. There is no trash endpoint.

### `NotesPage` (from `GET /api/notes`)

```ts
{ notes: Note[]; nextCursor: string | null }
```

### `Tag`

```ts
{ id: string; name: string; count: number } // count = notes currently carrying the tag
```

---

## 5. Errors

Fieldnote returns standard HTTP status codes with an H3-shaped error body:

```json
{
  "statusCode": 401,
  "statusMessage": "Authentication required"
}
```

| Code | Meaning |
|---|---|
| `401` | Missing/invalid/expired/revoked token |
| `403` | Valid token used on an endpoint outside the read-only scope |
| `404` | Note or shared note not found |
| `400` | Invalid query or body (e.g. malformed pagination cursor) |

---

## 6. Example integrations

### cURL

```bash
TOKEN="<your-personal-access-token>"
BASE="https://notes.abdspace.xyz"

curl -H "Authorization: Bearer $TOKEN" "$BASE/api/notes?limit=100"
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/search?q=meeting"
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/tags"
```

### Node.js (fetch)

```js
const BASE = "https://notes.abdspace.xyz";
const TOKEN = process.env.FIELDNOTE_TOKEN;

const listNotes = async (cursor) => {
  const params = new URLSearchParams({ limit: "100" });
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`${BASE}/api/notes?${params}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) throw new Error(`Fieldnote API ${res.status}: ${await res.text()}`);

  return res.json(); // { notes, nextCursor }
};

// Drain every note the account owns
let cursor;
do {
  const page = await listNotes(cursor);
  for (const note of page.notes) console.log(note.title);
  cursor = page.nextCursor;
} while (cursor);
```

### Polling for changes

There is no webhook/streaming channel. Poll `GET /api/notes?limit=100&cursor=<lastSeenUpdatedAt>` and treat any note whose `updatedAt` is newer than your high-water mark as changed. Because pagination is driven by `updatedAt`, tracking the newest `updatedAt` you've seen and requesting the first page in ascending awareness is the simplest reliable poll strategy.

---

## 7. Notes & limitations

- **Read-only.** Bearer tokens cannot create, edit, archive, or delete notes. Writes remain exclusive to the web app's session flow.
- **Soft deletion.** Deleted notes are omitted from list/search and return `404` on direct fetch.
- **Search is substring-based** (SQL `ILIKE`), not full-text ranked search.
- **No caching on the API.** Responses are served fresh; offline behavior is a web-app (IndexedDB + service worker) feature only.
- **Token management is UI-only.** Creating, listing, and revoking tokens happens in Settings. The underlying endpoints (`/api/tokens`) require the web session and are not documented for third-party use.
- **Rate limits** apply to the authentication endpoints (e.g. login) but the read endpoints have no documented quota. Be a good citizen: back off and retry on `429` if you ever see one.
- **API stability.** The API is private and may evolve. Pin to the documented endpoints and data shapes above.
