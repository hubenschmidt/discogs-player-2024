import { requestHandler } from '../lib/request-handler';
import { getBaseUrl } from '../lib/get-base-url';

export const getUser = async (email, token) => {
    const uri = `/api/app/user/${email}`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const deleteUser = async (userId, token) => {
    const uri = `/api/app/user/delete`;
    const response = await requestHandler(
        'POST',
        uri,
        { userId: userId },
        token,
    );
    return response.data;
};

export const fetchDiscogsRequestToken = async (token) => {
    const uri = `/api/discogs/fetch-request-token`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const fetchDiscogsAccessToken = async (
    email,
    oauth_token,
    oauth_verifier,
    token,
) => {
    const uri = `/api/discogs/fetch-access-token`;
    const body = { email, oauth_token, oauth_verifier };

    const response = await requestHandler('POST', uri, body, token);
    return response.data;
};

export const syncCollection = async (username, token) => {
    const uri = `/api/discogs/sync-collection/${username}`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const searchCollection = async (
    query,
    type,
    username,
    token,
) => {
    const params = new URLSearchParams({
        searchQuery: query,
    });

    if (type) {
        params.append('type', type);
    }

    const uri = `/api/app/search/${encodeURIComponent(
        username,
    )}?${params.toString()}`;

    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const getCollection = async (params, token) => {
    const {
        username,
        genre,
        style,
        year,
        page,
        limit,
        order,
        orderBy,
        releaseId,
        releaseIds,
        artistId,
        labelId,
        randomize,
    } = params;

    let uri = `/api/app/collection/${username}`;

    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (limit !== undefined) queryParams.append('limit', limit.toString());
    if (order !== undefined) queryParams.append('order', order);
    if (orderBy !== undefined) queryParams.append('orderBy', orderBy);
    if (artistId !== undefined)
        queryParams.append('artistId', artistId.toString());
    if (releaseIds?.length)
        queryParams.append('releaseIds', releaseIds.join(','));
    else if (releaseId !== undefined)
        queryParams.append('releaseId', releaseId.toString());
    if (labelId !== undefined)
        queryParams.append('labelId', labelId.toString());
    if (genre !== undefined) queryParams.append('genre', genre.toString());
    if (style !== undefined) queryParams.append('style', style.toString());
    if (year !== undefined) queryParams.append('year', year.toString());
    if (randomize !== undefined)
        queryParams.append('randomize', randomize.toString());

    const queryString = queryParams.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};

export const getDiscogsRelease = async (
    releaseId,
    username,
    token,
) => {
    const uri = `/api/discogs/${username}/release/${releaseId}`;

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};

export const updateVideoPlayCount = async (
    releaseId,
    selectedVideo,
    username,
    token,
) => {
    const uri = `/api/app/${username}/release/${releaseId}/video`;
    const response = await requestHandler(
        'POST',
        uri,
        selectedVideo,
        token,
    );

    return response.data;
};

export const getHistory = async (
    username,
    token,
    params,
) => {
    const qs = new URLSearchParams();

    if (params.page != null) qs.set('page', String(params.page));
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.orderBy) qs.set('orderBy', params.orderBy);
    if (params.order) qs.set('order', params.order);
    if (params.q) qs.set('q', params.q);

    const qsStr = qs.toString();
    const uri = `/api/app/${username}/history${qsStr ? `?${qsStr}` : ''}`;

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );
    return response.data;
};

export const getPlaylists = async (
    username,
    token,
    params = {},
) => {
    const qs = new URLSearchParams();

    if (params.page != null) qs.set('page', String(params.page));
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.orderBy) qs.set('orderBy', params.orderBy);
    if (params.order) qs.set('order', params.order);
    if (params.q) qs.set('q', params.q);

    const uri = `/api/app/${encodeURIComponent(username)}/playlist/all${
        qs.toString() ? `?${qs.toString()}` : ''
    }`;

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};

export const deletePlaylist = async (
    username,
    token,
    playlistId,
) => {
    const uri = `/api/app/${username}/playlist/delete`;

    const response = await requestHandler(
        'POST',
        uri,
        { playlistId: playlistId },
        token,
    );

    return response.data;
};

export const createPlaylist = async (
    username,
    token,
    name,
    description,
    video,
) => {
    const uri = `/api/app/${username}/playlist/create`;

    const response = await requestHandler(
        'POST',
        uri,
        { name: name, description: description, video: video },
        token,
    );

    return response.data;
};

export const deleteFromPlaylist = async (
    username,
    token,
    selectedPlaylist,
    videoUri,
) => {
    const uri = `/api/app/${username}/playlist/delete-from`;

    const response = await requestHandler(
        'POST',
        uri,
        { playlistId: selectedPlaylist.Playlist_Id, uri: videoUri },
        token,
    );

    return response.data;
};

export const addToPlaylist = async (
    username,
    token,
    selectedPlaylist,
    video,
) => {
    const uri = `/api/app/${username}/playlist/add`;

    const response = await requestHandler(
        'POST',
        uri,
        { playlistId: selectedPlaylist.Playlist_Id, uri: video.uri },
        token,
    );

    return response.data;
};

export const getPlaylist = async (
    username,
    token,
    playlistId,
    params,
) => {
    const qs = new URLSearchParams();

    if (params.page != null) qs.set('page', String(params.page));
    if (params.limit != null) qs.set('limit', String(params.limit));
    if (params.orderBy) qs.set('orderBy', params.orderBy);
    if (params.order) qs.set('order', params.order);
    if (params.q) qs.set('q', params.q);

    const uri = `/api/app/${encodeURIComponent(
        username,
    )}/playlist/${playlistId}${qs.toString() ? `?${qs.toString()}` : ''}`;

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );
    return response.data;
};

// ── Curator ─────────────────────────────────────────────────────────

const parseSSEFrame = (frame) => {
    let event = '';
    let data = '';
    for (const line of frame.split('\n')) {
        if (line.startsWith('event: ')) { event = line.slice(7); continue; }
        if (line.startsWith('data: ')) { data = line.slice(6); continue; }
    }
    if (!event || !data) return null;
    return { event, data: JSON.parse(data) };
};

export const streamCuratorMessage = (username, token, sessionId, message, callbacks, signal) => {
    const url = `${getBaseUrl()}/api/curator/${encodeURIComponent(username)}/chat`;

    fetch(url, {
        method: 'POST',
        headers: { ...token.headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
        signal,
    })
        .then((res) => {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            const processChunks = ({ done, value }) => {
                if (done) return;
                buffer += decoder.decode(value, { stream: true });

                const parts = buffer.split('\n\n');
                buffer = parts.pop();

                for (const part of parts) {
                    const parsed = parseSSEFrame(part);
                    if (!parsed) continue;
                    const handler = callbacks[parsed.event];
                    if (handler) handler(parsed.data);
                }

                return reader.read().then(processChunks);
            };

            return reader.read().then(processChunks);
        })
        .catch((err) => {
            if (err.name === 'AbortError') return;
            if (callbacks.error) callbacks.error(err);
        });
};

export const getCuratorSessions = async (username, token) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/sessions`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const getCuratorSession = async (username, token, sessionId) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/session/${sessionId}`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const confirmStagedPlaylist = async (username, token, stagedPlaylistId) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/confirm`;
    const response = await requestHandler('POST', uri, { stagedPlaylistId }, token);
    return response.data;
};

export const discardStagedPlaylist = async (username, token, stagedPlaylistId) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/discard`;
    const response = await requestHandler('POST', uri, { stagedPlaylistId }, token);
    return response.data;
};

export const updateStagedPlaylist = async (username, token, stagedPlaylistId, videoIds) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/stage/update`;
    const response = await requestHandler('POST', uri, { stagedPlaylistId, videoIds }, token);
    return response.data;
};

export const semanticSearch = async (username, query, token) => {
    const uri = `/api/curator/${encodeURIComponent(username)}/semantic-search`;
    const response = await requestHandler('POST', uri, { query }, token);
    return response.data;
};

export const getExplorer = async (params, token) => {
    const { username, genre, style, year } = params;

    let uri = `/api/app/${username}/explorer`;
    const queryParams = new URLSearchParams();

    if (genre !== undefined) queryParams.append('genre', genre.toString());
    if (style !== undefined) queryParams.append('style', style.toString());
    if (year !== undefined) queryParams.append('year', year.toString());

    const queryString = queryParams.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    const response = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};
