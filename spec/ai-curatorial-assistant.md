# AI Curatorial Assistant

## Context

The app has a synced Discogs collection (~2,000 releases) with metadata: artist, title, year, genre, style, label, and YouTube videos. The user wants a chat-based AI curator that understands their collection and can recommend tracks for specific contexts (mood, time of day, musical key, energy level). The AI infers BPM/mood/key from genre/style/artist knowledge rather than using external data sources. Recommendations are **staged** for user review before becoming real playlists.

## Architecture: Phased Hybrid

**Phase 1 (MVP):** OpenAI GPT tool use — the LLM calls structured tools to query the relational DB (filter by genre/style/year/artist/label, search, get details). Delivers immediate value.

**Phase 2 (later):** Add pgvector embeddings for semantic/vibes-based search ("warm Brazilian sunrise music"). Deferred because tool use alone handles ~80% of queries and is simpler to ship.

---

## Phase 1 — MVP Implementation

### 1. Install dependency

- `openai` npm package in `modules/app/package.json`

### 2. Database migration

**File:** `modules/app/src/migrations/20260222000000-create_chat_tables.js`

4 new tables:

| Table                 | Key columns                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `ChatSession`         | ChatSession_Id (PK), User_Id (FK), Title, timestamps                                                                                       |
| `ChatMessage`         | ChatMessage_Id (PK), ChatSession_Id (FK), Role (user/assistant/tool), Content (TEXT), Tool_Calls (JSONB nullable), Tool_Call_Id (nullable) |
| `StagedPlaylist`      | StagedPlaylist_Id (PK), ChatSession_Id (FK), User_Id (FK), Name, Description, Status (draft/confirmed/discarded)                           |
| `StagedPlaylistVideo` | PK, StagedPlaylist_Id (FK), Video_Id (FK), Release_Id (FK), Position, AI_Rationale (TEXT)                                                  |

### 3. Backend — new files

| File                               | Purpose                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `models/ChatSession.ts`            | Sequelize model, follows `Playlist.ts` pattern                                                 |
| `models/ChatMessage.ts`            | Sequelize model                                                                                |
| `models/StagedPlaylist.ts`         | Sequelize model                                                                                |
| `models/StagedPlaylistVideo.ts`    | Sequelize model                                                                                |
| `lib/openaiClient.ts`              | Thin wrapper: init OpenAI client, export `chatCompletion(messages, tools)` with tool-call loop |
| `services/curatorService.ts`       | Core orchestration: manages chat loop, tool dispatch, staged playlist lifecycle                |
| `controllers/curatorController.ts` | Thin handler layer following `appController.ts` pattern                                        |
| `routes/api/curator.ts`            | Route definitions (see below)                                                                  |

### 4. Backend — modifications to existing files

| File                                                  | Change                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes/api/index.ts`                                 | Register curator routes                                                                                                                                                                                                                                                                                                                                         |
| `repositories/index.ts`                               | Add: `createChatSession`, `getChatSessions`, `getChatMessages`, `createChatMessage`, `createStagedPlaylist`, `createStagedPlaylistVideo`, `getStagedPlaylist`, `confirmStagedPlaylist` (creates real Playlist+PlaylistVideo in transaction), `discardStagedPlaylist`, `getCollectionForAI` (lightweight release query optimized for AI consumption — no images) |
| `models/index.ts` (or wherever models are registered) | Register the 4 new models + associations                                                                                                                                                                                                                                                                                                                        |

### 5. API routes

```
POST  /:username/curator/chat            -> send message (creates session if needed)
GET   /:username/curator/sessions         -> list chat sessions
GET   /:username/curator/session/:id      -> get session with messages
POST  /:username/curator/confirm          -> confirm staged playlist -> creates real playlist
POST  /:username/curator/discard          -> discard staged playlist
POST  /:username/curator/stage/update     -> edit staged playlist (remove/reorder tracks)
```

### 6. LLM tool definitions

The curator gives GPT these tools to call against the existing DB:

1. **`search_collection`** — wraps existing `repos.search()` — search by title/artist/label
2. **`filter_collection`** — wraps existing `repos.getCollection()` — filter by genres[], styles[], year range, artist, label
3. **`get_release_details`** — get full release metadata + videos for a specific release
4. **`get_available_facets`** — wraps existing `repos.getExplorer()` — discover what genres/styles/years exist in collection
5. **`get_styles_for_genre`** — wraps existing `repos.getStylesByGenre()`
6. **`stage_playlist`** — create staged playlist with candidate tracks + AI rationale per track
7. **`get_play_history`** — wraps existing `repos.getHistory()` — inform recs with listening patterns

### 7. System prompt strategy

At session start, run `get_available_facets` to build a collection profile. System prompt establishes:

- "You are a vinyl DJ curator for this collection"
- Collection summary (top genres/styles, size)
- "Always search the collection before recommending — never hallucinate releases"
- "Use your music knowledge to infer BPM, key, mood, energy from genre/style/artist"
- "Call `stage_playlist` when you have a candidate list ready"
- "Explain your reasoning for each pick"

### 8. Frontend — new files

| File                                  | Purpose                                                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `context/curatorContext.js`           | State: `{ sessions, activeSessionId, messages, stagedPlaylist, isLoading, curatorOpen }` — follows `playlistContext.js` pattern           |
| `reducers/curatorReducer.js`          | Actions: SET_SESSIONS, SET_ACTIVE_SESSION, SET_MESSAGES, APPEND_MESSAGE, SET_STAGED_PLAYLIST, SET_LOADING, SET_CURATOR_OPEN, CLEAR_STAGED |
| `components/CuratorChat.jsx`          | Mantine `Drawer` — message list + input. Renders `StagedPlaylistReview` inline when staged playlist exists                                |
| `components/CuratorMessageBubble.jsx` | User/assistant message rendering with markdown support                                                                                    |
| `components/StagedPlaylistReview.jsx` | Card with track list (thumb, artist, title, release, rationale), remove buttons, Confirm/Discard/Refine actions                           |
| `components/CuratorButton.jsx`        | Nav icon or FAB to open the drawer                                                                                                        |

### 9. Frontend — modifications

| File             | Change                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/index.js`   | Add: `sendCuratorMessage`, `getCuratorSessions`, `getCuratorSession`, `confirmStagedPlaylist`, `discardStagedPlaylist`, `updateStagedPlaylist` |
| `pages/_app.jsx` | Wrap with `<CuratorProvider>`                                                                                                                  |
| Nav component    | Add curator button/icon                                                                                                                        |

### 10. Staging UX flow

```
+-------------------------------------------+
|  Sunrise Brazilian Set                    |
|  "Warm bossa nova for golden hour"        |
+-------------------------------------------+
|  1. [thumb] Artist - Track                |
|     from "Release" (1972)                 |
|     "Gentle bossa, perfect for dawn" [x]  |
|                                           |
|  2. [thumb] Artist - Track                |
|     from "Release" (1968)                 |
|     "Classic MPB, uplifting energy" [x]   |
+-------------------------------------------+
|  [Confirm]   [Discard]   [Refine...]      |
+-------------------------------------------+
```

- **Confirm** -> creates real Playlist + PlaylistVideo rows, navigates to playlist
- **Discard** -> marks staged playlist discarded, returns to chat
- **Refine** -> focuses chat input so user can say "swap track 3 for something more upbeat"

### 11. Environment variables

```
OPEN_AI_APIKEY=sk-...       # already exists
OPENAI_MODEL=gpt-5.3        # new
```

---

## Phase 2 — pgvector Embeddings (deferred)

- Add `pgvector` extension + `ReleaseEmbedding` table (VECTOR(1536))
- Embed each release as rich text via OpenAI `text-embedding-3-small`
- Run embedding sync after collection sync
- Add `semantic_search` tool to curator — cosine similarity for vibes queries
- Switch Docker Postgres image to `pgvector/pgvector:pg17`

---

## Verification

1. Run migration, confirm 4 new tables exist
2. `POST /:username/curator/chat` with a test message -> verify OpenAI call, tool execution, response
3. Verify tool calls correctly query the existing collection DB
4. Verify `stage_playlist` tool creates StagedPlaylist + StagedPlaylistVideo rows
5. Verify confirm flow creates real Playlist + PlaylistVideo entries
6. Frontend: open drawer, send message, see response stream, review staged playlist, confirm

## Existing code to reuse

- `repos.search()` -> `repositories/index.ts` — text search
- `repos.getCollection()` -> `repositories/index.ts` — filtered collection query
- `repos.getExplorer()` -> `repositories/index.ts` — facet discovery
- `repos.getStylesByGenre()` -> `repositories/index.ts` — style lookup
- `repos.getHistory()` -> `repositories/index.ts` — play history
- `repos.createPlaylist()` / `repos.addToPlaylist()` -> `repositories/index.ts` — playlist creation (reused by confirm flow)
- `PlaylistContext` / `playlistReducer` -> pattern for new curator context
- `appController.ts` -> pattern for new curator controller
