# Enrich Releases with Discogs Metadata for Better Embeddings

## Context

Semantic search quality is limited because embeddings only contain title, artists, labels, genres, styles, and video titles. The Discogs individual release API (`GET /releases/{id}`) returns additional fields — `notes`, `country`, `tracklist`, `extraartists` — that would significantly improve genre/style differentiation in vector search. These fields aren't available from the collection sync endpoint, so we need a background enrichment job that fetches them one at a time, dynamically throttled using Discogs' rate limit response headers (`X-Discogs-Ratelimit-Remaining`), with headroom.

## Files

| File | Action |
|---|---|
| `modules/app/src/lib/discogsClient.js` | Return `{ data, headers }` instead of `response.data` |
| `modules/app/src/services/discogsService.js` | Update 4 call sites to use `.data`; fire enrichment after sync |
| `migrations/20260224000000-add_release_enrichment_columns.js` | **New** — add 5 columns to Release |
| `models/Release.js` | Add `Notes`, `Country`, `Tracklist`, `Extraartists`, `Enriched_At` |
| `repositories/index.js` | Add `getUnenrichedReleaseIds`, `updateReleaseEnrichment` |
| `services/enrichmentService.js` | **New** — background enrichment loop with dynamic throttling |
| `services/embeddingService.js` | Update `buildEmbeddingText`; add `reembedUser` for stale embeddings |
| `controllers/curatorController.js` | Add `enrichCollection` handler |
| `routes/api/curator.js` | Add `POST /:username/enrich-collection` |

## Changes

### 1. `discogsClient.js` — return `{ data, headers }`
- Change `return response.data` → `return { data: response.data, headers: response.headers }`
- All callers get rate limit headers: `X-Discogs-Ratelimit`, `X-Discogs-Ratelimit-Used`, `X-Discogs-Ratelimit-Remaining`

### 2. `discogsService.js` — update 4 call sites
- Line 44: `const { data: userIdentity } = await discogsClient(...)`
- Line 239: `const { data: firstResponse } = await discogsClient(...)`
- Line 255: destructure `.data` from paginated calls
- Line 287: `const { data: response } = await discogsClient(...)`
- After `syncCollection` returns, fire-and-forget: `enrichCollection(username).catch(...)`

### 3. Migration: `20260224000000-add_release_enrichment_columns.js`
```
up:  addColumn('Release', 'Notes', TEXT, allowNull: true)
     addColumn('Release', 'Country', STRING, allowNull: true)
     addColumn('Release', 'Tracklist', JSONB, allowNull: true)
     addColumn('Release', 'Extraartists', JSONB, allowNull: true)
     addColumn('Release', 'Enriched_At', DATE, allowNull: true)
down: removeColumn in reverse order
```

### 4. Model: `Release.js`
Add the 5 new nullable fields to the model definition.

### 5. Repository: `index.js`
- **`getUnenrichedReleaseIds(username)`** — returns `Release_Id` array where `Enriched_At IS NULL`, scoped to user via Collection join
- **`updateReleaseEnrichment(releaseId, data)`** — `Release.update({ Notes, Country, Tracklist, Extraartists, Enriched_At: new Date() }, { where: { Release_Id } })`

### 6. Enrichment service: `enrichmentService.js` (new)
- **`enrichCollection(username)`** — fire-and-forget:
  1. Calls `repos.getUser({ username })` for OAuth tokens
  2. Calls `repos.getUnenrichedReleaseIds(username)` for release IDs
  3. Logs `[enrich] starting: N releases for username`
  4. Processes releases sequentially via `setTimeout` chaining
  5. Each iteration: calls `discogsClient('releases/${id}', 'GET', null, auth)`, reads `X-Discogs-Ratelimit-Remaining` from headers
  6. **Dynamic throttling**: if `remaining > 10`, delay 1000ms; if `remaining <= 10`, delay 3000ms; if `remaining <= 3`, delay 6000ms. Leaves headroom for other API calls (sync, fetchRelease, etc.)
  7. Extracts: `notes`, `country`, `tracklist` → `[{position, title, duration}]`, `extraartists` → `[{name, role}]`
  8. Calls `repos.updateReleaseEnrichment(releaseId, {...})`
  9. On completion: logs stats, triggers `reembedUser(username)`
  10. Returns `{ queued: N }` immediately

### 7. Embedding updates: `embeddingService.js`
- **`buildEmbeddingText`** — append new fields after existing ones:
  - `Country: {country}.` if present
  - `Notes: {notes (truncated to 500 chars)}.` if present
  - `Tracklist: {track titles joined}.` if present
  - `Credits: {name (role), ...}.` if extraartists present
- **`reembedUser(username)`** — deletes `ReleaseEmbedding` rows where `Release.Enriched_At > ReleaseEmbedding.Embedded_At`, then calls existing `backfillUser(username)` which picks up the missing embeddings
- Update `getReleasesForEmbedding` repo query to include `Notes`, `Country`, `Tracklist`, `Extraartists` in attributes

### 8. Manual endpoint
- `curatorController.js` — add `enrichCollection` handler calling `enrichmentService.enrichCollection(username)`, returns `{ queued }` immediately
- `routes/api/curator.js` — add `POST /:username/enrich-collection`

## Verify
1. Run migration: `npx sequelize-cli db:migrate`
2. Hit `POST /api/curator/hubenschmidt/enrich-collection` — returns `{ queued: 1908 }`
3. Watch logs: `[enrich] starting: 1908 releases`, periodic progress, dynamic delays based on rate limit headers
4. After completion: `[enrich] done: N ok, N errors`
5. Verify DB: `SELECT "Notes", "Country", "Tracklist" FROM "Release" WHERE "Enriched_At" IS NOT NULL LIMIT 3`
6. Re-embedding triggers automatically — verify `[embedding]` logs
7. Test semantic search for "gabber" — results should better distinguish gabber-tagged releases from techno
