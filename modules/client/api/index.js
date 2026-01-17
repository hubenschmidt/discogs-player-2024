import { requestHandler } from '../lib/request-handler';

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
    if (releaseId !== undefined)
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
