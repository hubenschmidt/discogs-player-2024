# Curator AI Optimization Spec

## Context

A simple "find the white stripes" query costs **16,604 tokens, 41 seconds, 5 LLM rounds** on gpt-5-mini. The goal is to use lightweight models effectively via RAG + prompt optimization instead of upgrading to expensive large-context models.

### Token breakdown (observed)

| Component | Tokens | % |
|---|---|---|
| Tool schemas (7 tools × 5 rounds) | ~6,000 | 40% |
| Accumulated tool results | ~7,244 | 48% |
| System prompt (× 5 rounds) | ~1,470 | 10% |
| User + assistant messages | ~250 | 2% |

### Root causes
1. **Tool schemas resent every round** — 7 tools × ~170 tokens each × N rounds
2. **Tool results accumulate** — full Sequelize objects (with nested associations, Collection/User join data) are JSON.stringify'd into messages and resent every subsequent round
3. **Too many rounds** — system prompt rule "always call get_available_facets first" forces a wasted round even for direct lookups
4. **Bloated payloads** — search returns full DB objects when the LLM only needs `{Release_Id, Title, Year, artist}`

---

## Phase 1: Quick Wins (no new infrastructure)

**Target: 70% token reduction, 60% latency reduction**

### 1A. Slim tool result payloads

Add a projection layer in `dispatchToolCall` that strips results down to what the LLM needs.

| Tool | Current payload | Slimmed payload |
|---|---|---|
| search_collection | Full Sequelize objects with Collection/User joins (~2,760b) | `[{ Release_Id, Title, Year, artist, type }]` (~200b) |
| filter_collection | Full release objects with all associations | `[{ Release_Id, Title, Year, artist, videoCount }]` |
| get_release_details | Full release + all nested associations (~820b) | `{ Release_Id, Title, Year, artist, label, genres, styles, videos: [{ Video_Id, Title }] }` |
| get_play_history | Full history with nested Video/Release/associations | `[{ title, artist, playCount, playedAt }]` |

**File**: `modules/app/src/services/curatorService.js` — add `slimToolResult(name, parsed)` map after `dispatchToolCall`

### 1B. Merge tools: 7 → 4

| Keep | Merge into it | Remove |
|---|---|---|
| `query_collection` (new) | `search_collection` + `filter_collection` | both originals |
| `explore_collection` (new) | `get_available_facets` + `get_styles_for_genre` | both originals |
| `get_release_details` | — | — |
| `stage_playlist` | — | — |

Drop `get_play_history` as a tool — pre-inject recent listening summary into system prompt instead.

Saves ~510 tokens/round in schema overhead.

### 1C. Prompt engineering to reduce rounds

- **Remove** rule 7 ("always call get_available_facets first") — this forces a wasted round on every query
- **Add**: "For direct artist/title/label lookups, call query_collection immediately. Only use explore_collection when the user asks what's available."
- **Add**: "Respond from query results when possible. Only call get_release_details when you need to select specific videos for a playlist."

Expected: "find the white stripes" drops from 5 rounds → 2 rounds.

### 1D. Context pruning between rounds

After each tool-call round completes, replace raw tool messages in the in-memory `messages[]` array with a condensed summary. Keep full data in DB (`ChatMessage`) for auditability.

Example: replace 2,760 bytes of search JSON with `"Found 2 White Stripes releases: White Blood Cells (2002, id:1607175), Greatest Hits (2020, id:16291048)"`.

### 1E. Parallel tool dispatch

Change `for (const toolCall of assembled.tool_calls)` to `Promise.all()`. When the model calls `get_release_details` on 2 releases simultaneously, dispatch both DB queries in parallel.

### Phase 1 projected result

"find the white stripes": **~3,500 tokens, ~10 seconds, 2 rounds** (was 16,604 / 41s / 5 rounds)

---

## Phase 2: RAG (pgvector embeddings)

**Target: 1-2 rounds for any query type, including vibe/mood queries**

### Key answers to your questions

**Do we need to convert the SQL database?** No. The relational DB stays as-is. We add one `ReleaseEmbedding` table alongside it in the same PostgreSQL instance via the `pgvector` extension. It's augmentation, not replacement.

**How long to embed 2,000 releases?** ~5-8 seconds total. 2,000 releases × ~100 tokens each = 200K tokens. OpenAI embedding API processes this in 2-3 seconds. Cost: **$0.004** (essentially free).

**Performance benefit?** Vibe queries ("mellow Sunday morning", "90s Detroit techno") drop from 4-6 rounds / 20K+ tokens / 40-60s to **1-2 rounds / 2-4K tokens / 3-8s**.

### 2A. What to embed

One composite text string per release:

```
"White Blood Cells" by The White Stripes (2002) on Sympathy for the Record Industry.
Genres: Rock, Blues. Styles: Garage Rock, Lo-Fi, Blues Rock.
Tracks: Dead Leaves and the Dirty Ground, Hotel Yorba, Fell in Love with a Girl, ...
```

Encodes every axis a user might search semantically: artist, title, year, label, genres, styles, track names.

### 2B. Storage

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "ReleaseEmbedding" (
    "Release_Id"     INTEGER PRIMARY KEY REFERENCES "Release"("Release_Id"),
    "Embedding_Text" TEXT NOT NULL,
    "Embedding"      vector(1536) NOT NULL,
    "Embedded_At"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON "ReleaseEmbedding"
    USING ivfflat ("Embedding" vector_cosine_ops) WITH (lists = 20);
```

Docker: change postgres image to `pgvector/pgvector:pg17` (drop-in replacement).

### 2C. Embedding model

- `text-embedding-3-small` — 1536 dimensions, $0.02/1M tokens
- Could reduce to 512 dimensions via the `dimensions` param (halves storage, minimal quality loss at 2K scale) — but 1536 is fine for this dataset size

### 2D. Sync strategy

- **Backfill**: one-time script queries all releases with associations, builds composite text, batch-embeds via OpenAI, bulk inserts
- **Incremental**: hook into Discogs collection sync — when a release is added/updated, re-embed that single release (~200ms, ~$0.000002)

### 2E. How RAG changes the flow

**Before (current — structured tool calls only):**
```
User: "something mellow for a Sunday morning"
→ Round 1: get_available_facets()           ← wasted round
→ Round 2: filter_collection({styles:...})  ← LLM guesses which styles = "mellow"
→ Round 3: get_release_details(id1)         ← drill into results
→ Round 4: get_release_details(id2)
→ Round 5: final response
= 5 rounds, ~20K tokens, ~45s
```

**After (RAG pre-fetch):**
```
User: "something mellow for a Sunday morning"
→ Server: embed query (100ms), vector search top 15 (5ms)
→ Inject slim results into system prompt as "RELEVANT RELEASES"
→ Round 1: LLM sees matches, responds or calls stage_playlist
= 1-2 rounds, ~2-4K tokens, ~3-8s
```

The vector search replaces what the LLM was doing across 3-4 tool-call rounds: translating a vibe into matching releases.

### 2F. Pre-fetch vs. tool

Two options (not mutually exclusive):

| Approach | Pros | Cons |
|---|---|---|
| **Pre-fetch** (embed query server-side before LLM call, inject into prompt) | Zero tool-call rounds for discovery; lowest latency | Burns prompt tokens even when user asks a non-search question |
| **semantic_search tool** (LLM decides to call it) | Only runs when needed | Costs one extra round |

**Recommended**: pre-fetch for the first message in a session (likely a search), tool-based for follow-ups within a conversation.

---

## Phase 3: Query routing (optional, future)

Classify the user's query server-side before the LLM call to pick the optimal strategy:

| Query type | Route | Example |
|---|---|---|
| Direct name lookup | Structured SQL (ILIKE) | "find the white stripes" |
| Vibe/mood/context | Vector semantic search | "sunrise set, warm, 120 BPM" |
| Structured filter | SQL with explicit params | "jazz from the 70s" |
| Collection browsing | Facet data in prompt | "what genres do I have?" |

Could be rule-based (regex for quoted strings, year patterns, known genre names) to avoid an extra LLM call.

---

## Files to modify

| Phase | File | Change |
|---|---|---|
| 1 | `modules/app/src/services/curatorService.js` | Slim payloads, merge tool defs, revise system prompt, context pruning, parallel dispatch |
| 1 | `modules/app/src/repositories/index.js` | Slim query projections (or handle in service layer) |
| 2 | `docker-compose.yml` | `pgvector/pgvector:pg17` image |
| 2 | `modules/app/src/models/ReleaseEmbedding.js` | New model |
| 2 | `modules/app/src/migrations/` | New migration for pgvector + ReleaseEmbedding table |
| 2 | `modules/app/src/lib/openaiClient.js` | Add `embed(text)` function |
| 2 | `modules/app/src/services/embeddingService.js` | New: build text, embed, sync, vector search |
| 2 | `modules/app/src/repositories/index.js` | New: `vectorSearch(embedding, limit)` |
| 2 | `modules/app/src/services/curatorService.js` | Pre-fetch vector search in `sendMessage` |

## Verification

- Phase 1: same "find the white stripes" query should show ~3,500 tokens / ~10s / 2 rounds in `[curator]` logs
- Phase 2: vibe query like "mellow Sunday morning" should show ~2-4K tokens / ~5s / 1-2 rounds
- Backfill: `SELECT count(*) FROM "ReleaseEmbedding"` = release count
