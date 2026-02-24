# RAG Implementation Plan

## Context

Curator chat on gpt-5-mini costs 16K tokens / 41s for a simple query. Rather than optimizing prompts and context engineering, we're taking the RAG-first approach: embed the user's collection into pgvector and use semantic search to pre-fetch relevant releases before the LLM call, dramatically reducing rounds and tokens.

---

## How RAG Improves Performance

Two different things are slow right now. RAG fixes both.

### 1. The LLM is doing the searching

Right now, the LLM acts as a search engine — it has to *guess* which structured queries to run. For "find the white stripes", it made 5 sequential API calls to OpenAI just to figure out what tools to call:

```
Round 1: LLM thinks → "I should check what facets exist"    → get_available_facets
Round 2: LLM thinks → "Now search for the artist"           → search_collection
Round 3: LLM thinks → "Let me get details on release 1"     → get_release_details
Round 4: LLM thinks → "And details on release 2"            → get_release_details
Round 5: LLM thinks → "Now I can answer"                    → response
```

Each round resends the **entire conversation** (system prompt + tool schemas + all previous results) back to OpenAI. That's why tokens compound: round 5 pays for everything from rounds 1-4 again.

### 2. Vector search replaces the LLM's guesswork

With RAG, the **server** does the searching *before* the LLM is ever called:

1. User sends "find the white stripes"
2. Server embeds that string into a vector → 100ms, $0.000001
3. Server queries pgvector for similar releases → 5ms
4. Server injects matches into the system prompt
5. LLM sees the matches already, responds directly → 1 round

The vector search works because the embedding of *"find the white stripes"* is mathematically close to the embedding of *"White Blood Cells" by The White Stripes (2002)..."* in vector space. Cosine similarity does what the LLM was doing across 4 rounds of tool calls — but in 5ms instead of 35 seconds.

### Where it really shines: vibe queries

For "find the white stripes", a simple ILIKE SQL query would also work. The real payoff is queries like:

> *"something warm and mellow for a Sunday morning"*

Today the LLM has to:
- guess which genres/styles map to "warm and mellow" (Bossa Nova? Ambient? Soul?)
- call `get_available_facets` to see what's available
- call `filter_collection` with its guesses
- iterate if the results don't feel right

With vector search, the embedding of *"warm and mellow Sunday morning"* is naturally close to embeddings that contain `Styles: Bossa Nova, Downtempo, Ambient` — because the embedding model understands semantic relationships. No guessing, no iteration.

### The math

| | Current | With RAG |
|---|---|---|
| OpenAI API calls | 5 (one per round) | 1 LLM + 1 embedding |
| Input tokens | ~15,000 | ~2,000-3,000 |
| Latency | ~40s | ~3-6s |
| Cost per query | ~$0.002 | ~$0.0003 |

The fundamental shift: we move search from **runtime LLM reasoning** (expensive, slow, multi-round) to **pre-computed vector similarity** (cheap, instant, one-shot).

### The LLM never touches vectors

The server does the vector search before the LLM is called. The LLM never knows vectors exist.

```
User: "mellow Sunday morning"
         │
         ▼
    ┌──────────┐
    │ Server   │  1. Embed query string (OpenAI embeddings API)
    │          │  2. SELECT ... ORDER BY embedding <=> query LIMIT 15
    │          │  3. Get back: Bossa Nova, Ambient, Downtempo releases
    └────┬─────┘
         │  inject matches into system prompt
         ▼
    ┌──────────┐
    │ LLM      │  Sees: "RELEVANT RELEASES: [Brian Eno — Music for
    │          │  Airports (1978)](release:456), [Marcos Valle —
    │          │  Previsão do Tempo (1973)](release:789), ..."
    │          │
    │          │  Responds directly. No tool calls needed.
    └──────────┘
```

The tool calls (`search_collection`, `filter_collection`, etc.) become **fallbacks** — the LLM only uses them if the pre-fetched results don't cover the user's request.

### What the LLM still does

The chatbot still uses inference, but its job shrinks dramatically. Instead of **searching + reasoning + responding**, it only does **reasoning + responding**:

1. **Curates** — vector search returns 15 matches ranked by similarity, but the LLM picks the best 5-6 based on the user's actual intent, explains *why* each fits
2. **Converses** — handles follow-ups: "more like track 3 but funkier", "drop the last two and add something upbeat"
3. **Builds playlists** — calls `stage_playlist` with specific video IDs, rationales, track ordering
4. **Applies music knowledge** — infers BPM, energy, key compatibility from genre/style/era metadata that the vector search can't reason about

The LLM goes from being a **search engine that also talks** to being a **DJ that gets handed a pre-pulled crate of records**. The expensive part (discovery) moves to vector search. The part that actually needs intelligence (curation, conversation, music knowledge) stays with the LLM — and costs far fewer tokens because it already has what it needs in context.

---

## Phase 1: pgvector Infrastructure

Add the vector extension and embedding table to the existing PostgreSQL instance.

### 1a. Docker image swap
- **File**: `docker-compose.yml` (line 3)
- Change `postgres:latest` → `pgvector/pgvector:pg17` (drop-in replacement)

### 1b. Migration
- **New file**: `modules/app/src/migrations/20260223000000-add_pgvector_embeddings.js`
- `up`: enable `vector` extension, create `ReleaseEmbedding` table:
  - `Release_Id` INTEGER PK, FK → Release
  - `Embedding_Text` TEXT NOT NULL (the composite string that was embedded)
  - `Embedding` vector(1536) NOT NULL
  - `Embedded_At` TIMESTAMPTZ DEFAULT NOW()
  - IVFFlat index on `Embedding` with cosine ops, 20 lists
- `down`: drop table, drop extension

### 1c. Sequelize model
- **New file**: `modules/app/src/models/ReleaseEmbedding.js`
- Follow existing model pattern: `module.exports = (sequelize, DataTypes) => { ... }`
- Use `DataTypes.TEXT` for Embedding_Text, `DataTypes.ARRAY(DataTypes.FLOAT)` for Embedding column (pgvector interop via raw queries)
- Associate: `belongsTo Release`
- Auto-loaded by `models/index.js` (existing `fs.readdirSync` pattern)

### Verify
- `docker compose up -d db` — container starts with pgvector
- `npx sequelize-cli db:migrate` — table created
- `SELECT * FROM pg_extension WHERE extname = 'vector'` — extension active

---

## Phase 2: Embedding Pipeline

Build the service that converts releases into vectors.

### 2a. OpenAI embed function
- **File**: `modules/app/src/lib/openaiClient.js`
- Add `embed(texts)` — wraps `client.embeddings.create({ model: 'text-embedding-3-small', input: texts })`
- Returns array of embedding vectors
- Batch-safe: OpenAI accepts arrays of strings

### 2b. Embedding service
- **New file**: `modules/app/src/services/embeddingService.js`
- `buildEmbeddingText(release)` — builds composite string from a release with its associations:
  ```
  "White Blood Cells" by The White Stripes (2002) on Sympathy for the Record Industry.
  Genres: Rock, Blues. Styles: Garage Rock, Lo-Fi, Blues Rock.
  Tracks: Dead Leaves and the Dirty Ground, Hotel Yorba, ...
  ```
- `embedReleases(releaseIds)` — fetches releases with associations from DB, builds texts, calls `openaiClient.embed()`, upserts into `ReleaseEmbedding`
- `backfillUser(username)` — queries all releases for a user, batches through `embedReleases` (batches of 100)
- `vectorSearch(queryText, username, limit=15)` — embeds the query string, runs cosine similarity against user's collection, returns slim release matches

### 2c. Vector search repository function
- **File**: `modules/app/src/repositories/index.js`
- Add `searchByVector(embedding, username, limit)` — raw SQL query:
  ```sql
  SELECT re."Release_Id", re."Embedding_Text",
         1 - (re."Embedding" <=> $1::vector) AS similarity
  FROM "ReleaseEmbedding" re
  JOIN "ReleaseCollection" rc ON rc."Release_Id" = re."Release_Id"
  JOIN "Collection" c ON c."Collection_Id" = rc."Collection_Id"
  JOIN "User" u ON u."User_Id" = c."User_Id"
  WHERE u."Username" = $2
  ORDER BY re."Embedding" <=> $1::vector
  LIMIT $3
  ```
- Returns `[{ Release_Id, Embedding_Text, similarity }]`

### 2d. Backfill endpoint
- **File**: `modules/app/src/controllers/curatorController.js` + route
- `POST /api/curator/:username/embed` — calls `embeddingService.backfillUser(username)`
- Returns `{ embedded: N, durationMs }`
- One-time call per user (or after collection sync)

### Verify
- Call backfill endpoint — logs show 2K releases embedded in ~5-8s
- `SELECT count(*) FROM "ReleaseEmbedding"` = release count
- Test vector search: embed "mellow jazz", query, confirm relevant results returned

---

## Phase 3: Curator Integration

Wire the vector search into the curator chat flow.

### 3a. Pre-fetch in sendMessage
- **File**: `modules/app/src/services/curatorService.js`
- At the top of `sendMessage`, before building the messages array:
  1. Call `embeddingService.vectorSearch(userMessage, username, 15)`
  2. Format results via `formatRelevantReleases()` — each line includes `(release:ID)` so the LLM can create clickable links without additional tool calls
  3. Append to system prompt content as a `RELEVANT RELEASES` section

### 3b. Tool reduction when prefetch succeeds
- When prefetch returns results, strip the tool definitions down to fallback-only: `stage_playlist`, `get_release_details`, `get_play_history`
- The search/filter/facet tools (`search_collection`, `filter_collection`, `get_available_facets`, `get_styles_for_genre`) are removed — the LLM has everything it needs from the prefetch
- When prefetch fails or returns empty, all tools are passed as before (full fallback)

### 3c. Revised system prompt
- **File**: `modules/app/src/services/curatorService.js` — `buildSystemPrompt`
- Rule #1 explicitly instructs the LLM not to call tools for data already in the prefetch:
  ```
  IMPORTANT: When RELEVANT RELEASES are provided below, use them to answer directly.
  Do NOT call search_collection, filter_collection, or get_release_details for information
  already present in the pre-fetched results. Only use tools if the user asks for something
  the pre-fetched results clearly don't cover.
  ```

### 3d. Observability
- Prefetch log includes top 5 titles: `[curator] prefetch: 15 releases (521ms) top=[Title1, Title2, ...]`
- Done log includes RAG and tool counts: `[curator] ── done rounds=1 rag=15 tools=0 in=2400 out=800 total=3200 ms=3200`

### 3e. Concurrent tool execution
- When tool calls do occur (fallback path), they execute concurrently via `Promise.all` instead of sequentially
- DB writes for tool results still happen sequentially to preserve message ordering

### Verify
- Send "find detroit techno" — LLM responds in 1 round using pre-fetched results, `rag=15 tools=0`
- Send "mellow Sunday morning vinyl" — prefetch returns ambient/chill releases, 1 round
- Compare token counts: should be ~2-4K total vs previous ~29K

---

## Phase 4: Sync Integration

Embedding runs synchronously at the end of `syncCollection`, with a frontend status message.

### 4a. Backend: append to syncCollection
- **File**: `modules/app/src/services/discogsService.js`
- After the existing `syncData` calls complete (~line 219), call `embeddingService.backfillUser(username)`
- Re-embeds all releases for the user on each sync (2K releases = ~5-8 seconds, $0.004)
- Return an `embedding` status/count alongside the existing sync counts

### 4b. Frontend: "Embedding Collection" status message
- **File**: frontend sync component (wherever "Synchronizing Collection" is displayed)
- After the sync API returns its intermediate "synced" status, show "Embedding Collection..." as a second step
- Or: if the sync endpoint streams progress, add an `embedding` progress event

### Verify
- Sync collection from Discogs — logs show embedding step, frontend shows "Embedding Collection"
- `SELECT count(*) FROM "ReleaseEmbedding"` = release count
- Query for newly synced release via curator chat — appears in prefetch results

---

## Per-User Isolation

`ReleaseEmbedding` is keyed by `Release_Id` (not per-user). If two users own the same release, they share the same embedding row — the embedding text is identical regardless of owner.

User isolation is enforced at query time: `searchByVector` joins through `ReleaseCollection → Collection → User` and filters by username. A user only ever sees vector results for releases in their own collection. No cross-user leakage.

---

## File Summary

| File | Action |
|---|---|
| `docker-compose.yml` | Change postgres image (1 line) |
| `modules/app/src/migrations/20260223000000-add_pgvector_embeddings.js` | New migration |
| `modules/app/src/models/ReleaseEmbedding.js` | New model |
| `modules/app/src/lib/openaiClient.js` | Add `embed()` function |
| `modules/app/src/services/embeddingService.js` | New service (build text, embed, backfill, vector search) |
| `modules/app/src/repositories/index.js` | Add `searchByVector()` |
| `modules/app/src/services/curatorService.js` | Pre-fetch in sendMessage, revise system prompt |
| `modules/app/src/services/discogsService.js` | Call `backfillUser` at end of syncCollection |
| Frontend sync component | Show "Embedding Collection" status message |
