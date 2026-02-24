const repos = require('../repositories');
const { chatCompletionStream } = require('../lib/openaiClient');
const { vectorSearch } = require('./embeddingService');

// ── Tool schemas for OpenAI function calling ────────────────────────

const toolDefinitions = [
    {
        type: 'function',
        function: {
            name: 'search_collection',
            description:
                "Search the user's record collection by release title, artist name, or label name. Returns matching releases with metadata.",
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search text (partial match)',
                    },
                    type: {
                        type: 'string',
                        enum: ['release', 'artist', 'label'],
                        description:
                            'What to search: release titles, artist names, or label names. Omit to search all.',
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
            description:
                "Filter the user's record collection by genre, style, year range, artist, or label. Returns releases matching ALL specified filters.",
            parameters: {
                type: 'object',
                properties: {
                    genres: {
                        type: 'array',
                        items: { type: 'string' },
                        description:
                            'Filter by genre names (e.g. ["Electronic", "Latin"])',
                    },
                    styles: {
                        type: 'array',
                        items: { type: 'string' },
                        description:
                            'Filter by style names (e.g. ["House", "Bossa Nova"])',
                    },
                    yearFrom: {
                        type: 'number',
                        description: 'Earliest release year (inclusive)',
                    },
                    yearTo: {
                        type: 'number',
                        description: 'Latest release year (inclusive)',
                    },
                    artistId: {
                        type: 'number',
                        description: 'Filter by specific artist ID',
                    },
                    labelId: {
                        type: 'number',
                        description: 'Filter by specific label ID',
                    },
                    limit: {
                        type: 'number',
                        description: 'Max results to return (default 50)',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_release_details',
            description:
                'Get full metadata for a specific release including all associated videos (YouTube links), artists, labels, genres, and styles.',
            parameters: {
                type: 'object',
                properties: {
                    releaseId: {
                        type: 'number',
                        description: 'The Release_Id to look up',
                    },
                },
                required: ['releaseId'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_available_facets',
            description:
                "Discover what genres, styles, and years exist in the user's collection. Use this to understand the collection before filtering. Optionally pass genre/style/year to see how facets narrow.",
            parameters: {
                type: 'object',
                properties: {
                    genre: {
                        type: 'string',
                        description: 'Comma-separated genre names to scope by',
                    },
                    style: {
                        type: 'string',
                        description: 'Comma-separated style names to scope by',
                    },
                    year: {
                        type: 'string',
                        description: 'Comma-separated years to scope by',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_styles_for_genre',
            description:
                "Get all styles that appear under a specific genre in the user's collection.",
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
            description:
                'Create a staged playlist of recommended tracks for the user to review before confirming. Call this when you have a curated set of tracks ready to propose.',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Playlist name' },
                    description: {
                        type: 'string',
                        description:
                            'Short description of the playlist vibe/theme',
                    },
                    tracks: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                videoId: {
                                    type: 'number',
                                    description: 'Video_Id from the collection',
                                },
                                releaseId: {
                                    type: 'number',
                                    description:
                                        'Release_Id the video belongs to',
                                },
                                rationale: {
                                    type: 'string',
                                    description:
                                        'Why this track fits the request',
                                },
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
            description:
                "Get the user's recent play history to understand their listening patterns and preferences.",
            parameters: {
                type: 'object',
                properties: {
                    limit: {
                        type: 'number',
                        description:
                            'Number of history entries to return (default 20)',
                    },
                },
            },
        },
    },
];

// ── System prompt builder ───────────────────────────────────────────

const buildSystemPrompt = collectionProfile => {
    const genres = collectionProfile?.Genres?.join(', ') || 'unknown';
    const styles =
        collectionProfile?.Styles?.slice(0, 30).join(', ') || 'unknown';

    return `You are a knowledgeable vinyl DJ curator and music advisor. You have access to the user's personal record collection through a set of tools.

COLLECTION PROFILE:
- Genres in collection: ${genres}
- Top styles: ${styles}

RULES:
1. IMPORTANT: When RELEVANT RELEASES are provided below, use them to answer directly. Do NOT call search_collection, filter_collection, or get_release_details for information already present in the pre-fetched results. Only use tools if the user asks for something the pre-fetched results clearly don't cover.
2. Never hallucinate or invent releases, artists, or titles that don't exist in the collection.
3. Use your deep music knowledge to infer BPM, musical key, mood, energy level, and danceability from genre, style, artist, and era. For example:
   - House music: ~120-130 BPM
   - Drum & Bass: ~160-180 BPM
   - Bossa Nova: ~80-120 BPM, often in major keys
   - Disco: ~110-130 BPM
4. When the user describes a mood, time of day, or context (e.g. "7am sunrise set"), translate that into appropriate musical qualities and search for matching releases.
5. Be concise. Give a brief one-sentence rationale per recommendation. Do not write long paragraphs.
9. NEVER use the word "vibe" or think in terms of "vibe" in your responses.
6. When you have a curated set of tracks ready, call the stage_playlist tool so the user can review and confirm before the playlist is created.
7. If a release has multiple videos (tracks), recommend specific videos/tracks, not just the release.
8. IMPORTANT: When mentioning a release in your text response, ALWAYS format it as a clickable link using this exact syntax: [Artist — Title (Year)](release:RELEASE_ID) where RELEASE_ID is the numeric Release_Id from the database. This allows the user to click and load the release. Example: [Mike Huckaby — Harmonie Park Classics Volume 1 (2013)](release:4567890)`;
};

const formatRelevantReleases = releases => {
    const lines = releases.map((r, i) => {
        const sim = Number(r.similarity).toFixed(2);
        return `${i + 1}. (release:${r.Release_Id}) ${r.Embedding_Text} — similarity: ${sim}`;
    });
    return `RELEVANT RELEASES (pre-fetched from the collection for this query):\n${lines.join('\n')}`;
};

const extractReleaseIds = text => {
    if (!text) return [];
    const MARKER = '](release:';
    return text
        .split(MARKER)
        .slice(1)
        .map(seg => {
            const end = seg.indexOf(')');
            return end > 0 ? Number(seg.slice(0, end)) : NaN;
        })
        .filter(Number.isFinite);
};

// ── Tool dispatcher ─────────────────────────────────────────────────

const dispatchToolCall = async (name, args, username, userId, sessionId) => {
    const handlers = {
        search_collection: async () =>
            repos.search(username, {
                searchQuery: args.query,
                type: args.type,
            }),

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

        get_available_facets: async () =>
            repos.getExplorer(username, {
                genre: args.genre,
                style: args.style,
                year: args.year,
            }),

        get_styles_for_genre: async () => repos.getStylesByGenre(args.genre),

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
            const user = await repos.getUser({ username });
            return repos.getHistory(
                { limit: String(args.limit ?? 20), page: '1' },
                user,
            );
        },
    };

    const handler = handlers[name];
    if (!handler) return JSON.stringify({ error: `Unknown tool: ${name}` });

    const result = await handler();
    return JSON.stringify(result);
};

const emitFinalResponse = async (
    sessionId,
    assembled,
    username,
    stagedPlaylist,
    emit,
) => {
    await repos.createChatMessage(sessionId, 'assistant', assembled.content);
    const releaseIds = extractReleaseIds(assembled.content);
    if (releaseIds.length) {
        const releases = await repos.getCollection(username, {
            releaseIds: releaseIds.join(','),
            limit: '200',
        });
        emit('releases', { items: releases.items, count: releases.count });
    }
    if (stagedPlaylist) emit('staged', { stagedPlaylist });
    emit('done', {});
};

// ── Observability ───────────────────────────────────────────────────

const toolResultSummarizers = {
    search_collection: r => {
        if (!Array.isArray(r)) return '';
        const labels = r.slice(0, 5).map(i => i.Title || i.Name || '?');
        return `${r.length} hits [${labels.join(', ')}]`;
    },
    filter_collection: r => {
        if (!Array.isArray(r)) return '';
        const labels = r.slice(0, 5).map(i => i.Title || '?');
        return `${r.length} releases [${labels.join(', ')}]`;
    },
    get_release_details: r =>
        `"${r.Title}" (${r.Year || '?'}) ${r.Videos?.length || 0} videos`,
    get_available_facets: r =>
        `${r.Genres?.length || 0} genres, ${r.Styles?.length || 0} styles, ${r.Years?.length || 0} years`,
    get_styles_for_genre: r => (Array.isArray(r) ? `${r.length} styles` : ''),
    stage_playlist: r =>
        `"${r.Name || '?'}" ${r.StagedPlaylistVideos?.length || 0} tracks`,
    get_play_history: r => {
        const items = r.items || r;
        return `${Array.isArray(items) ? items.length : '?'} entries`;
    },
};

const summarizeToolResult = (name, resultStr) => {
    const summarizer = toolResultSummarizers[name];
    if (!summarizer) return `${resultStr.length}b`;
    const summary = summarizer(JSON.parse(resultStr));
    return `${summary} (${resultStr.length}b)`;
};

// ── Main chat orchestration ─────────────────────────────────────────

const sendMessage = async (username, sessionId, userMessage, emit) => {
    const user = await repos.getUser({ username });
    const userId = user.User_Id;

    const activeSessionId =
        sessionId ??
        (await repos.createChatSession(userId, userMessage.slice(0, 80)))
            .ChatSession_Id;

    emit('session', { sessionId: activeSessionId });
    console.log(
        `[curator] ── user=${username} session=${activeSessionId} prompt="${userMessage.slice(0, 120)}"`,
    );

    await repos.createChatMessage(activeSessionId, 'user', userMessage);

    // Vector pre-fetch
    let relevantReleases = [];
    const prefetchStart = Date.now();
    try {
        relevantReleases = await vectorSearch(userMessage, username, 10);
        const topTitles = relevantReleases
            .slice(0, 5)
            .map(r => r.Embedding_Text.split('"')[1] || '?')
            .join(', ');
        console.log(
            `[curator] prefetch: ${relevantReleases.length} releases (${Date.now() - prefetchStart}ms) top=[${topTitles}]`,
        );
    } catch (err) {
        console.log(`[curator] prefetch skipped: ${err.message}`);
    }

    const history = await repos.getChatMessages(activeSessionId);
    const collectionProfile = await repos.getExplorer(username, {});

    const systemContent =
        buildSystemPrompt(collectionProfile) +
        (relevantReleases.length
            ? '\n\n' + formatRelevantReleases(relevantReleases)
            : '');

    const messages = [{ role: 'system', content: systemContent }];
    history.forEach(m =>
        messages.push({
            role: m.Role,
            content: m.Content,
            ...(m.Tool_Calls && { tool_calls: m.Tool_Calls }),
            ...(m.Tool_Call_Id && { tool_call_id: m.Tool_Call_Id }),
        }),
    );
    const fallbackOnly = ['stage_playlist', 'get_play_history'];
    const tools = relevantReleases.length
        ? toolDefinitions.filter(t => fallbackOnly.includes(t.function.name))
        : toolDefinitions;

    let stagedPlaylist = null;
    const MAX_ITERATIONS = 10;
    const start = Date.now();
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalToolCalls = 0;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const assembled = await chatCompletionStream(
            messages,
            tools,
            chunk => emit('message', { chunk }),
        );

        if (!assembled) {
            emit('done', {});
            return;
        }

        if (assembled.usage) {
            totalPromptTokens += assembled.usage.prompt_tokens || 0;
            totalCompletionTokens += assembled.usage.completion_tokens || 0;
        }

        // No tool calls — final assistant response
        if (!assembled.tool_calls?.length) {
            const durationMs = Date.now() - start;
            console.log(
                `[curator] round ${i + 1} → response (${(assembled.content || '').length} chars)`,
            );
            console.log(
                `[curator] ── done rounds=${i + 1} rag=${relevantReleases.length} tools=${totalToolCalls} in=${totalPromptTokens} out=${totalCompletionTokens} total=${totalPromptTokens + totalCompletionTokens} ms=${durationMs}`,
            );
            await emitFinalResponse(
                activeSessionId,
                assembled,
                username,
                stagedPlaylist,
                emit,
            );
            return;
        }

        // Tool calls — execute, loop back
        totalToolCalls += assembled.tool_calls.length;
        await repos.createChatMessage(
            activeSessionId,
            'assistant',
            assembled.content,
            assembled.tool_calls,
        );
        messages.push({
            role: 'assistant',
            content: assembled.content,
            tool_calls: assembled.tool_calls,
        });

        const toolResults = await Promise.all(
            assembled.tool_calls.map(async toolCall => {
                const args = JSON.parse(toolCall.function.arguments);
                const result = await dispatchToolCall(
                    toolCall.function.name,
                    args,
                    username,
                    userId,
                    activeSessionId,
                );
                console.log(
                    `[curator]   ${toolCall.function.name}(${JSON.stringify(args)}) → ${summarizeToolResult(toolCall.function.name, result)}`,
                );
                return { toolCall, result };
            }),
        );

        for (const { toolCall, result } of toolResults) {
            if (toolCall.function.name === 'stage_playlist')
                stagedPlaylist = JSON.parse(result);

            await repos.createChatMessage(
                activeSessionId,
                'tool',
                result,
                null,
                toolCall.id,
            );
            messages.push({
                role: 'tool',
                content: result,
                tool_call_id: toolCall.id,
            });
        }
    }

    // Max iterations reached
    emit('message', {
        chunk: 'I explored several options but need to narrow things down. Could you give me more specific criteria?',
    });
    emit('done', {});
};

const getSessions = async username => {
    const user = await repos.getUser({ username });
    return repos.getChatSessions(user.User_Id);
};

const getSession = async sessionId => {
    const messages = await repos.getChatMessages(sessionId);
    const visibleMessages = messages.filter(
        m => m.Role === 'user' || (m.Role === 'assistant' && m.Content),
    );
    return { sessionId, messages: visibleMessages };
};

const confirmStagedPlaylist = async (username, stagedPlaylistId) => {
    const user = await repos.getUser({ username });
    return repos.confirmStagedPlaylist(stagedPlaylistId, user.User_Id);
};

const discardStagedPlaylist = async (username, stagedPlaylistId) => {
    const user = await repos.getUser({ username });
    return repos.discardStagedPlaylist(stagedPlaylistId, user.User_Id);
};

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
