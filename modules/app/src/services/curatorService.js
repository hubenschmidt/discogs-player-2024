const repos = require('../repositories');
const { chatCompletion, chatCompletionStream } = require('../lib/openaiClient');

// ── Tool schemas for OpenAI function calling ────────────────────────

const toolDefinitions = [
    {
        type: 'function',
        function: {
            name: 'search_collection',
            description: 'Search the user\'s record collection by release title, artist name, or label name. Returns matching releases with metadata.',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Search text (partial match)' },
                    type: {
                        type: 'string',
                        enum: ['release', 'artist', 'label'],
                        description: 'What to search: release titles, artist names, or label names. Omit to search all.',
                    },
                },
                required: ['query'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'filter_collection',
            description: 'Filter the user\'s record collection by genre, style, year range, artist, or label. Returns releases matching ALL specified filters.',
            parameters: {
                type: 'object',
                properties: {
                    genres: { type: 'array', items: { type: 'string' }, description: 'Filter by genre names (e.g. ["Electronic", "Latin"])' },
                    styles: { type: 'array', items: { type: 'string' }, description: 'Filter by style names (e.g. ["House", "Bossa Nova"])' },
                    yearFrom: { type: 'number', description: 'Earliest release year (inclusive)' },
                    yearTo: { type: 'number', description: 'Latest release year (inclusive)' },
                    artistId: { type: 'number', description: 'Filter by specific artist ID' },
                    labelId: { type: 'number', description: 'Filter by specific label ID' },
                    limit: { type: 'number', description: 'Max results to return (default 50)' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_release_details',
            description: 'Get full metadata for a specific release including all associated videos (YouTube links), artists, labels, genres, and styles.',
            parameters: {
                type: 'object',
                properties: {
                    releaseId: { type: 'number', description: 'The Release_Id to look up' },
                },
                required: ['releaseId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_available_facets',
            description: 'Discover what genres, styles, and years exist in the user\'s collection. Use this to understand the collection before filtering. Optionally pass genre/style/year to see how facets narrow.',
            parameters: {
                type: 'object',
                properties: {
                    genre: { type: 'string', description: 'Comma-separated genre names to scope by' },
                    style: { type: 'string', description: 'Comma-separated style names to scope by' },
                    year: { type: 'string', description: 'Comma-separated years to scope by' },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_styles_for_genre',
            description: 'Get all styles that appear under a specific genre in the user\'s collection.',
            parameters: {
                type: 'object',
                properties: {
                    genre: { type: 'string', description: 'The genre name' },
                },
                required: ['genre'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'stage_playlist',
            description: 'Create a staged playlist of recommended tracks for the user to review before confirming. Call this when you have a curated set of tracks ready to propose.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Playlist name' },
                    description: { type: 'string', description: 'Short description of the playlist vibe/theme' },
                    tracks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                videoId: { type: 'number', description: 'Video_Id from the collection' },
                                releaseId: { type: 'number', description: 'Release_Id the video belongs to' },
                                rationale: { type: 'string', description: 'Why this track fits the request' },
                            },
                            required: ['videoId', 'releaseId', 'rationale'],
                        },
                        description: 'Ordered list of tracks to include',
                    },
                },
                required: ['name', 'tracks'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_play_history',
            description: 'Get the user\'s recent play history to understand their listening patterns and preferences.',
            parameters: {
                type: 'object',
                properties: {
                    limit: { type: 'number', description: 'Number of history entries to return (default 20)' },
                },
            },
        },
    },
];

// ── System prompt builder ───────────────────────────────────────────

const buildSystemPrompt = (collectionProfile) => {
    const genres = collectionProfile?.Genres?.join(', ') || 'unknown';
    const styles = collectionProfile?.Styles?.slice(0, 30).join(', ') || 'unknown';

    return `You are a knowledgeable vinyl DJ curator and music advisor. You have access to the user's personal record collection through a set of tools.

COLLECTION PROFILE:
- Genres in collection: ${genres}
- Top styles: ${styles}

RULES:
1. ALWAYS search or filter the collection before recommending tracks. Never hallucinate or invent releases, artists, or titles that don't exist in the collection.
2. Use your deep music knowledge to infer BPM, musical key, mood, energy level, and danceability from genre, style, artist, and era. For example:
   - House music: ~120-130 BPM
   - Drum & Bass: ~160-180 BPM
   - Bossa Nova: ~80-120 BPM, often in major keys
   - Disco: ~110-130 BPM
3. When the user describes a vibe, time of day, or context (e.g. "7am sunrise set"), translate that into appropriate musical qualities and search for matching releases.
4. Explain your reasoning for each recommendation — why it fits the requested mood, key, tempo, or context.
5. When you have a curated set of tracks ready, call the stage_playlist tool so the user can review and confirm before the playlist is created.
6. If a release has multiple videos (tracks), recommend specific videos/tracks, not just the release.
7. Start by using get_available_facets to understand what the collection contains before filtering.
8. IMPORTANT: When mentioning a release in your text response, ALWAYS format it as a clickable link using this exact syntax: [Artist — Title (Year)](release:RELEASE_ID) where RELEASE_ID is the numeric Release_Id from the database. This allows the user to click and load the release. Example: [Mike Huckaby — Harmonie Park Classics Volume 1 (2013)](release:4567890)`;
};

const extractReleaseIds = (text) => {
    if (!text) return [];
    const MARKER = '](release:';
    return text.split(MARKER).slice(1).map((seg) => {
        const end = seg.indexOf(')');
        return end > 0 ? Number(seg.slice(0, end)) : NaN;
    }).filter(Number.isFinite);
};

// ── Tool dispatcher ─────────────────────────────────────────────────

const dispatchToolCall = async (name, args, username, userId, sessionId) => {
    const handlers = {
        search_collection: async () => {
            const mockReq = {
                params: { username },
                query: { searchQuery: args.query, type: args.type },
            };
            return repos.search(mockReq);
        },

        filter_collection: async () =>
            repos.getCollectionForAI(username, {
                genres: args.genres,
                styles: args.styles,
                yearFrom: args.yearFrom,
                yearTo: args.yearTo,
                artistId: args.artistId,
                labelId: args.labelId,
                limit: args.limit,
            }),

        get_release_details: async () =>
            repos.getReleaseWithVideos(args.releaseId),

        get_available_facets: async () => {
            const mockReq = {
                params: { username },
                query: {
                    genre: args.genre,
                    style: args.style,
                    year: args.year,
                },
            };
            return repos.getExplorer(mockReq);
        },

        get_styles_for_genre: async () => {
            const mockReq = { params: { genre: args.genre } };
            return repos.getStylesByGenre(mockReq);
        },

        stage_playlist: async () => {
            const staged = await repos.createStagedPlaylist(
                sessionId,
                userId,
                args.name,
                args.description,
            );

            const tracks = args.tracks ?? [];
            for (let i = 0; i < tracks.length; i++) {
                await repos.createStagedPlaylistVideo(
                    staged.StagedPlaylist_Id,
                    tracks[i].videoId,
                    tracks[i].releaseId,
                    i,
                    tracks[i].rationale,
                );
            }

            return repos.getStagedPlaylist(staged.StagedPlaylist_Id);
        },

        get_play_history: async () => {
            const user = await repos.getUser({ params: { username }, query: {} });
            const mockReq = {
                query: { limit: String(args.limit ?? 20), page: '1' },
            };
            return repos.getHistory(mockReq, user);
        },
    };

    const handler = handlers[name];
    if (!handler) return JSON.stringify({ error: `Unknown tool: ${name}` });

    const result = await handler();
    return JSON.stringify(result);
};

// ── Main chat orchestration ─────────────────────────────────────────

const sendMessage = async (username, userId, sessionId, userMessage, emit) => {
    const activeSessionId = sessionId
        ?? (await repos.createChatSession(userId, userMessage.slice(0, 80))).ChatSession_Id;

    emit('session', { sessionId: activeSessionId });

    await repos.createChatMessage(activeSessionId, 'user', userMessage);

    const history = await repos.getChatMessages(activeSessionId);
    const collectionProfile = await repos.getExplorer({
        params: { username },
        query: {},
    });

    const messages = [
        { role: 'system', content: buildSystemPrompt(collectionProfile) },
        ...history.map((m) => {
            const msg = { role: m.Role, content: m.Content };
            if (m.Tool_Calls) msg.tool_calls = m.Tool_Calls;
            if (m.Tool_Call_Id) msg.tool_call_id = m.Tool_Call_Id;
            return msg;
        }),
    ];

    let stagedPlaylist = null;
    const allReleaseIds = new Set();
    history
        .filter((m) => m.Role === 'assistant' && m.Content)
        .forEach((m) => extractReleaseIds(m.Content).forEach((id) => allReleaseIds.add(id)));
    const MAX_ITERATIONS = 10;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const gen = chatCompletionStream(messages, toolDefinitions);
        let assembled = null;

        for await (const event of gen) {
            if (event.type === 'delta') {
                emit('message', { chunk: event.content });
                continue;
            }
            if (event.type === 'done') assembled = event.message;
        }

        if (!assembled) break;

        // No tool calls — this is the final assistant response
        if (!assembled.tool_calls?.length) {
            await repos.createChatMessage(activeSessionId, 'assistant', assembled.content);

            extractReleaseIds(assembled.content).forEach((id) => allReleaseIds.add(id));

            if (allReleaseIds.size) {
                const mockReq = {
                    params: { username },
                    query: { releaseIds: [...allReleaseIds].join(','), limit: '200' },
                };
                const releases = await repos.getCollection(mockReq);
                emit('releases', { items: releases.items, count: releases.count });
            }

            if (stagedPlaylist) emit('staged', { stagedPlaylist });
            emit('done', {});
            return;
        }

        // Tool calls — execute silently, loop back
        await repos.createChatMessage(activeSessionId, 'assistant', assembled.content, assembled.tool_calls);
        messages.push({ role: 'assistant', content: assembled.content, tool_calls: assembled.tool_calls });

        for (const toolCall of assembled.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await dispatchToolCall(toolCall.function.name, args, username, userId, activeSessionId);

            if (toolCall.function.name === 'stage_playlist') stagedPlaylist = JSON.parse(result);

            // Accumulate release IDs from search/filter tool results
            const toolsWithReleases = ['search_collection', 'filter_collection', 'get_release_details'];
            if (toolsWithReleases.includes(toolCall.function.name)) {
                try {
                    const parsed = JSON.parse(result);
                    const items = Array.isArray(parsed) ? parsed : parsed.items || (parsed.Release_Id ? [parsed] : []);
                    items.forEach((r) => { if (r.Release_Id) allReleaseIds.add(r.Release_Id); });
                } catch (_) { /* ignore parse errors */ }
            }

            await repos.createChatMessage(activeSessionId, 'tool', result, null, toolCall.id);
            messages.push({ role: 'tool', content: result, tool_call_id: toolCall.id });
        }
    }

    // Max iterations reached
    emit('message', { chunk: 'I explored several options but need to narrow things down. Could you give me more specific criteria?' });
    emit('done', {});
};

const getSessions = async (userId) =>
    repos.getChatSessions(userId);

const getSession = async (sessionId) => {
    const messages = await repos.getChatMessages(sessionId);
    const visibleMessages = messages.filter(
        (m) => m.Role === 'user' || (m.Role === 'assistant' && m.Content),
    );
    return { sessionId, messages: visibleMessages };
};

const confirmStagedPlaylist = async (stagedPlaylistId, userId) =>
    repos.confirmStagedPlaylist(stagedPlaylistId, userId);

const discardStagedPlaylist = async (stagedPlaylistId, userId) =>
    repos.discardStagedPlaylist(stagedPlaylistId, userId);

const updateStagedPlaylist = async (stagedPlaylistId, videoIds) =>
    repos.updateStagedPlaylistVideos(stagedPlaylistId, videoIds);

module.exports = {
    sendMessage,
    getSessions,
    getSession,
    confirmStagedPlaylist,
    discardStagedPlaylist,
    updateStagedPlaylist,
};
